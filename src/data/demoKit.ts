import type { GameSession, Reminder, MemoryCapsuleItem } from './models'
import type { FamilyMessage } from './demoData'
import {
  generateDemoSessions,
  generateDemoReminders,
  generateDemoCapsule,
  generateDemoMessages,
  generateDemoAssistantMessages,
} from './demoData'

/**
 * Judge Demo Mode — the canonical demo dataset.
 *
 * Everything here is fictional. It exists so a presenter can walk the full
 * AURA loop (Memory Capsule → personalized game → performance → adaptation
 * → insight → caregiver dashboard) on demand, with no network and no
 * unpredictable AI responses. All of it lives under the `__demo` storage
 * namespace and never mixes with real user data.
 */

export const DEMO_USER = {
  name: 'Ravi',
  email: 'ravi@aura.demo',
  pin: '1234',
  caregiverPin: '4321',
}

/** The five demo memories the presentation script relies on. */
export const DEMO_MEMORY_SUMMARY = [
  { name: 'Ananya', detail: 'Daughter' },
  { name: 'Lakshmi', detail: 'Wife' },
  { name: 'Family Garden', detail: 'Favorite place' },
  { name: 'Old Radio', detail: 'Evening routine' },
  { name: 'Sunday Family Gathering', detail: 'Family event' },
]

/** Demo performance history — visible improvement, some struggle areas. */
export function demoSessions(): GameSession[] {
  return generateDemoSessions()
}

export function demoReminders(): Reminder[] {
  return generateDemoReminders()
}

export function demoCapsule(): MemoryCapsuleItem[] {
  return generateDemoCapsule()
}

export function demoMessages(): FamilyMessage[] {
  return generateDemoMessages()
}

export function demoAssistantMessages() {
  return generateDemoAssistantMessages()
}
