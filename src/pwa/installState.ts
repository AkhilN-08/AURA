/**
 * AURA install state — pure helpers for the real PWA install flow.
 *
 * States handled (never contradictory):
 *  1. unsupported  — no beforeinstallprompt; manual instructions apply
 *  2. available    — browser fired beforeinstallprompt; AURA holds it
 *  3. dismissed    — user said "Not now" (cooldown before re-offering)
 *  4. accepted     — user installed via AURA's prompt
 *  5. installed    — app runs in standalone display mode (or appinstalled fired)
 *
 * AURA never triggers the native prompt by itself — only on an explicit tap.
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// ── persisted choices ────────────────────────────────────────────
const K_DISMISSED = 'aura-install-dismissed-at'
const K_INSTALLED = 'aura-install-installed'
const K_SHOWN = 'aura-install-shown-at'

export const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000 // "Not now" → quiet for 7 days
export const SHOW_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000    // after showing, wait 3 days

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

/** True when AURA is running as an installed app (standalone display mode). */
export function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches ||
    window.matchMedia?.('(display-mode: minimal-ui)').matches ||
    // iOS Safari reports navigator.standalone
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

/** True once the user has installed (or is running installed). */
export function wasInstalled(): boolean {
  return isStandalone() || readJSON<boolean>(K_INSTALLED, false)
}

export function recordInstallAccepted() {
  localStorage.setItem(K_INSTALLED, JSON.stringify(true))
  localStorage.removeItem(K_DISMISSED)
}

export function recordDismissed() {
  localStorage.setItem(K_DISMISSED, JSON.stringify(Date.now()))
}

export function recordShown() {
  localStorage.setItem(K_SHOWN, JSON.stringify(Date.now()))
}

export function dismissCooldownActive(): boolean {
  const at = readJSON<number>(K_DISMISSED, 0)
  return at > 0 && Date.now() - at < DISMISS_COOLDOWN_MS
}

export function showCooldownActive(): boolean {
  const at = readJSON<number>(K_SHOWN, 0)
  return at > 0 && Date.now() - at < SHOW_COOLDOWN_MS
}

/**
 * Manual-install instructions per platform — used only when the browser
 * does not fire beforeinstallprompt (iOS Safari, Firefox, etc).
 */
export function manualInstructions(): { title: string; steps: string[] } {
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  const isAndroid = /Android/.test(ua)
  const isFirefox = /Firefox|FxiOS/.test(ua)

  if (isIOS) {
    return {
      title: 'Add to Home Screen',
      steps: [
        'Open the Share button in Safari',
        'Scroll and tap "Add to Home Screen"',
        'Tap Add — AURA joins your home screen',
      ],
    }
  }
  if (isFirefox) {
    return {
      title: 'Install from the menu',
      steps: [
        'Open your browser menu',
        'Tap "Install" / "Add to Home screen"',
      ],
    }
  }
  if (isAndroid) {
    return {
      title: 'Add to Home Screen',
      steps: [
        'Open your browser menu (⋮)',
        'Tap "Add to Home screen" or "Install app"',
      ],
    }
  }
  return {
    title: 'Install AURA',
    steps: [
      'Open your browser menu',
      'Choose "Install app" or "Cast, save and share → Install"',
    ],
  }
}
