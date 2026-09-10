/**
 * Judge Demo Mode — storage layer.
 *
 * When the demo flag is set, every sensitive storage key is transparently
 * re-pointed at a `__demo` namespaced copy. Demo sessions write to the
 * copies; real user data is never read or written. Enter/exit/reset all
 * reload the page so every hook re-computes its effective key.
 */

export const DEMO_FLAG_KEY = 'aura-demo-mode-active'

/** Keys that must be namespaced while demo mode is active. */
const NAMESPACED_KEYS = new Set([
  // identity — demo ships its own pre-made Ravi account
  'aura-users',
  'aura-current-user',
  // memory capsule
  'aura-memory-capsule',
  'aura-capsule-seeded',
  'aura-capsule-personalization',
  // activity & performance
  'aura-game-sessions',
  'aura-last-activity',
  'aura-mood',
  // assistant & reminders
  'aura-reminders',
  'aura-assistant-messages',
  'aura-daily-tasks',
  // family
  'aura-family-messages',
  'aura-family-photos',
  // legacy seeders — keep them from touching real state during demo
  'aura-demo-seeded',
  'aura-notifications-fired',
])

/** True when the current page session is running the judge demo. */
export function isDemoActive(): boolean {
  try {
    return window.localStorage.getItem(DEMO_FLAG_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * The key a useLocalStorage hook should actually use.
 * Same key in demo mode → the `__demo` copy; otherwise the real key.
 */
export function demoKeyFor(key: string): string {
  return isDemoActive() && NAMESPACED_KEYS.has(key) ? `${key}__demo` : key
}
