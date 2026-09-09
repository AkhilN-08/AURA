import { useCallback, useSyncExternalStore } from 'react'
import {
  type BeforeInstallPromptEvent,
  wasInstalled,
  recordInstallAccepted,
  recordDismissed,
  recordShown,
  dismissCooldownActive,
  showCooldownActive,
  manualInstructions,
} from './installState'

export type InstallPhase =
  | 'hidden'          // nothing to show (installed, cooling down, or not eligible yet)
  | 'ready'           // eligible & native prompt held — show the gentle card
  | 'fallback'        // eligible but no native prompt — show manual instructions
  | 'success'         // just installed — brief calm confirmation

const ENGAGEMENT_KEY = 'aura-engagement-count'
/** Interactions before AURA may offer installation (soft, feels earned). */
const ENGAGEMENT_THRESHOLD = 12
/** Fallback timer — after 2 min of exploring, interaction count matters less. */
const EXPLORE_MS = 2 * 60 * 1000

function bumpEngagement() {
  try {
    const n = Number(localStorage.getItem(ENGAGEMENT_KEY) || '0') + 1
    localStorage.setItem(ENGAGEMENT_KEY, String(n))
  } catch { /* private mode */ }
}

function readCount(): number {
  try { return Number(localStorage.getItem(ENGAGEMENT_KEY) || '0') } catch { return 0 }
}

// ── shared store ──────────────────────────────────────────────────
// ONE source of truth for every component that needs install state
// (InstallExperience card, ProfileMenu row, Landing footer link).
//
// IMPORTANT: the snapshot object is REPLACED (never mutated) on every
// change — useSyncExternalStore compares snapshots with Object.is, so
// an in-place mutation would be invisible to React.

interface InstallStore {
  phase: InstallPhase
  installed: boolean
  deferred: BeforeInstallPromptEvent | null
}

let snapshot: InstallStore = {
  phase: 'hidden',
  installed: wasInstalled(),
  deferred: null,
}

const listeners = new Set<() => void>()

function notify() {
  for (const l of listeners) l()
}

function patch(changes: Partial<InstallStore>) {
  snapshot = { ...snapshot, ...changes }
  notify()
}

function setPhase(phase: InstallPhase) {
  if (snapshot.phase === phase) return
  patch({ phase })
}

function setInstalled(installed: boolean) {
  if (snapshot.installed === installed) return
  patch({
    installed,
    phase: installed ? (snapshot.phase === 'success' ? 'success' : 'hidden') : snapshot.phase,
  })
}

// ── one-time global setup (event listeners live for the page) ─────
let initialized = false

function initialize() {
  if (initialized) return
  initialized = true

  // Service worker registration
  if ('serviceWorker' in navigator && !import.meta.env.DEV) {
    const swUrl = new URL('sw.js', document.baseURI).href
    navigator.serviceWorker.register(swUrl).catch((err) => {
      console.warn('AURA: service worker registration skipped', err)
    })
  }

  // Capture the native prompt — never auto-fire it
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    snapshot = { ...snapshot, deferred: e as BeforeInstallPromptEvent }
    // If the card is already showing as fallback, upgrade it to native
    if (snapshot.phase === 'fallback') setPhase('ready')
  })

  // Installed (via our prompt or browser UI) → calm success note
  window.addEventListener('appinstalled', () => {
    recordInstallAccepted()
    snapshot = { ...snapshot, deferred: null }
    setInstalled(true)
    setPhase('success')
  })

  // Keep installed state in sync with display-mode changes
  window.matchMedia?.('(display-mode: standalone)')?.addEventListener?.('change', () => {
    setInstalled(wasInstalled())
  })

  // Engagement: count only genuine user gestures
  const gestureHandler = (e: Event) => {
    if (!wasInstalled() && e.isTrusted) bumpEngagement()
  }
  window.addEventListener('pointerdown', gestureHandler, { passive: true, capture: true })
  window.addEventListener('keydown', gestureHandler, { passive: true, capture: true })

  // Eligibility: may AURA gently offer installation now?
  const startedAt = Date.now()
  const check = () => {
    if (wasInstalled() || dismissCooldownActive() || showCooldownActive()) return
    const engaged = readCount() >= ENGAGEMENT_THRESHOLD
    const exploredLong = Date.now() - startedAt >= EXPLORE_MS
    if (engaged || exploredLong) {
      setPhase(snapshot.deferred ? 'ready' : 'fallback')
      recordShown()
    }
  }
  window.addEventListener('pointerdown', check, { passive: true, capture: true })
  window.addEventListener('keydown', check, { passive: true, capture: true })
  window.setInterval(check, 15 * 1000)
}

// ── hook ──────────────────────────────────────────────────────────

function getSnapshot(): InstallStore {
  return snapshot
}

export function useAuraInstall() {
  initialize()

  const snap = useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    getSnapshot,
    getSnapshot
  )

  const offerInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'fallback'> => {
    const ev = snapshot.deferred
    if (!ev) {
      setPhase('fallback')
      return 'fallback'
    }
    try {
      await ev.prompt()
      const { outcome } = await ev.userChoice
      snapshot = { ...snapshot, deferred: null } // browsers allow the prompt only once
      if (outcome === 'accepted') {
        recordInstallAccepted()
        setInstalled(true)
        setPhase('success')
        return 'accepted'
      }
      recordDismissed()
      setPhase('hidden')
      return 'dismissed'
    } catch {
      snapshot = { ...snapshot, deferred: null }
      setPhase('fallback')
      return 'fallback'
    }
  }, [])

  const dismiss = useCallback(() => {
    recordDismissed()
    setPhase('hidden')
  }, [])

  const successAcknowledge = useCallback(() => {
    setPhase(wasInstalled() ? 'hidden' : 'fallback')
  }, [])

  return {
    phase: snap.phase,
    installed: snap.installed,
    platform: manualInstructions(),
    offerInstall,
    dismiss,
    successAcknowledge,
  }
}

/** Subtle offline state — honest, never alarming. */
export function useOfflineStatus() {
  const subscribe = (cb: () => void) => {
    window.addEventListener('online', cb)
    window.addEventListener('offline', cb)
    return () => {
      window.removeEventListener('online', cb)
      window.removeEventListener('offline', cb)
    }
  }
  return useSyncExternalStore(subscribe, () => !navigator.onLine, () => false)
}
