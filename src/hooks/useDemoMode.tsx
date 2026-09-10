import { createContext, useCallback, useContext, useState, useEffect, type ReactNode } from 'react'
import { isDemoActive, DEMO_FLAG_KEY } from './demoMode'
import { DEMO_USER, demoSessions, demoReminders, demoCapsule, demoMessages, demoAssistantMessages } from '../data/demoKit'
import type { FamilyPhotoMessage, DailyTask } from '../data/models'

/**
 * Judge Demo Mode — controlled, fictional data for presentations.
 *
 * - `enter()`  → flags demo mode, seeds the `__demo` namespace, reloads.
 *                The app boots already signed in as Ravi, on the home garden.
 * - `exit()`   → clears the flag, reloads; back to real data untouched.
 * - `reset()`  → wipes and re-seeds the `__demo` namespace, reloads.
 *
 * Real data (the non-`__demo` keys) is never read or written while demo
 * mode is active — the separation is physical, not conventional.
 */

interface DemoModeContextType {
  isDemo: boolean
  enter: () => void
  exit: () => void
  reset: () => void
}

const DemoModeContext = createContext<DemoModeContextType | null>(null)

const DEMO_NS_KEYS = [
  'aura-users', 'aura-current-user', 'aura-memory-capsule', 'aura-capsule-seeded',
  'aura-capsule-personalization', 'aura-game-sessions', 'aura-last-activity',
  'aura-mood', 'aura-reminders', 'aura-assistant-messages', 'aura-daily-tasks',
  'aura-family-messages', 'aura-family-photos', 'aura-demo-seeded',
  'aura-notifications-fired',
]

function wipeDemoNamespace() {
  DEMO_NS_KEYS.forEach(k => {
    try { window.localStorage.removeItem(`${k}__demo`) } catch { /* ignore */ }
  })
}

function seedDemoNamespace() {
  try {
    const write = (key: string, value: unknown) =>
      window.localStorage.setItem(`${key}__demo`, JSON.stringify(value))

    // The fictional Ravi account (patient role, assessment already done so
    // the presenter lands straight on the home garden, already signed in).
    const demoUser = {
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      role: 'patient' as const,
      gender: 'male' as const,
      assessmentCompleted: true,
      assessmentResult: {
        memoryScore: 72, sequenceScore: 64, focusScore: 78, wordScore: 70,
        reactionTime: 820, overallScore: 71, level: 'mild' as const,
        recommendedGames: ['memory-match', 'pattern-recall', 'memory-replay'],
        completedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      },
    }
    write('aura-users', [{ ...demoUser, passwordHash: btoa('demo-demo'), pin: DEMO_USER.pin, caregiverPin: DEMO_USER.caregiverPin }])
    write('aura-current-user', demoUser)

    // Memories, performance, reminders, family, assistant thread.
    write('aura-memory-capsule', demoCapsule())
    write('aura-capsule-seeded', true)
    write('aura-capsule-personalization', true)
    write('aura-game-sessions', demoSessions())
    write('aura-reminders', demoReminders())
    write('aura-family-messages', demoMessages())
    write('aura-family-photos', [] as FamilyPhotoMessage[])
    write('aura-daily-tasks', [] as DailyTask[])
    write('aura-assistant-messages', demoAssistantMessages())
    write('aura-notifications-fired', {})
    window.localStorage.removeItem('aura-last-activity__demo')
    window.localStorage.removeItem('aura-mood__demo')
    window.localStorage.removeItem('aura-demo-seeded__demo')
  } catch (e) {
    console.warn('Demo seed failed', e)
  }
}

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState(() => isDemoActive())

  // Keep the flag in sync if another tab flips demo mode.
  useEffect(() => {
    const sync = () => setIsDemo(isDemoActive())
    window.addEventListener('focus', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('focus', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const enter = useCallback(() => {
    try {
      window.localStorage.setItem(DEMO_FLAG_KEY, 'true')
      seedDemoNamespace()
    } finally {
      window.location.href = '/'
    }
  }, [])

  const exit = useCallback(() => {
    try { window.localStorage.removeItem(DEMO_FLAG_KEY) } finally {
      window.location.href = '/'
    }
  }, [])

  const reset = useCallback(() => {
    try {
      wipeDemoNamespace()
      seedDemoNamespace()
    } finally {
      window.location.href = '/'
    }
  }, [])

  return (
    <DemoModeContext.Provider value={{ isDemo, enter, exit, reset }}>
      {children}
    </DemoModeContext.Provider>
  )
}

export function useDemoMode() {
  const ctx = useContext(DemoModeContext)
  if (!ctx) throw new Error('useDemoMode must be used within DemoModeProvider')
  return ctx
}
