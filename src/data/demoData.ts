import type { GameSession, Reminder, MemoryCapsuleItem } from './models'

// Generate demo game sessions over the past 14 days
export function generateDemoSessions(): GameSession[] {
  const sessions: GameSession[] = []
  const games: GameSession['gameType'][] = [
    'memory-match', 'object-recall', 'sequence-recall',
    'word-association', 'pattern-grid', 'story-recall', 'color-sequence',
    'memory-replay', 'pattern-recall', 'what-changed', 'memory-sequence',
  ]
  const difficulties: GameSession['difficulty'][] = ['easy', 'moderate', 'hard']

  for (let day = 13; day >= 0; day--) {
    const date = new Date()
    date.setDate(date.getDate() - day)
    // 1-3 sessions per day, not every day
    if (day % 3 === 0) continue
    const sessionsToday = 1 + Math.floor(Math.random() * 2)
    for (let s = 0; s < sessionsToday; s++) {
      const game = games[Math.floor(Math.random() * games.length)]
      // Accuracy improves over time (from ~55% to ~85%)
      const baseAccuracy = 55 + ((13 - day) / 13) * 30
      const accuracy = Math.min(98, Math.round(baseAccuracy + (Math.random() - 0.5) * 20))
      const diffIdx = accuracy > 80 ? 2 : accuracy > 65 ? 1 : 0
      sessions.push({
        gameType: game,
        score: accuracy,
        accuracy,
        duration: 30 + Math.floor(Math.random() * 120),
        timestamp: date.toISOString(),
        difficulty: difficulties[diffIdx],
        responseTime: 2.5 + Math.random() * 3.5,
        attempts: 2 + Math.floor(Math.random() * 3),
      })
    }
  }
  return sessions
}

export function generateDemoReminders(): Reminder[] {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  return [
    { id: 'demo-1', title: 'Morning medicine', time: '08:00', type: 'medicine', completed: now.getHours() >= 8, createdAt: today },
    { id: 'demo-2', title: 'Call daughter Priya', time: '18:00', type: 'call', completed: false, createdAt: today },
    { id: 'demo-3', title: 'Evening walk', time: '17:00', type: 'routine', completed: now.getHours() >= 17, createdAt: today },
  ]
}

export interface FamilyMessage {
  id: string
  from: string
  text: string
  timestamp: string
  read: boolean
  type: 'text' | 'photo'
  photoData?: string
}

// ── Demo Memory Capsule (Ravi's profile) ────────────────────────
// Realistic demo data so the prototype works immediately.
// Easy to replace: users/caregivers add their own via the Memory Capsule page.

export function generateDemoCapsule(): MemoryCapsuleItem[] {
  const now = new Date().toISOString()
  return [
    {
      type: 'person', id: 'capsule-ananya', name: 'Ananya', relationship: 'Daughter',
      emoji: '👧', description: 'Ravi\'s daughter. Loves gardening and evening walks.',
      enabled: true, createdAt: now,
    },
    {
      type: 'person', id: 'capsule-lakshmi', name: 'Lakshmi', relationship: 'Wife',
      emoji: '👩', description: 'Ravi\'s wife. Makes the best filter coffee in the house.',
      enabled: true, createdAt: now,
    },
    {
      type: 'place', id: 'capsule-garden', name: 'Family Garden',
      emoji: '🌿', description: 'The small garden behind the house with rose plants.',
      people: ['Ananya', 'Lakshmi'],
      memory: 'Ravi spends his mornings here watering the roses with Ananya.',
      enabled: true, createdAt: now,
    },
    {
      type: 'place', id: 'capsule-home', name: 'Home',
      emoji: '🏠', description: 'The house Ravi has lived in for 35 years.',
      people: ['Lakshmi', 'Ananya'],
      memory: 'Every evening ends with tea on the front porch.',
      enabled: true, createdAt: now,
    },
    {
      type: 'object', id: 'capsule-stick', name: 'Walking Stick',
      emoji: '🦯', belongsTo: 'Beside the front door',
      description: 'A wooden walking stick Ravi has used for 8 years.',
      enabled: true, createdAt: now,
    },
    {
      type: 'object', id: 'capsule-radio', name: 'Favorite Radio',
      emoji: '📻', belongsTo: 'On the kitchen shelf',
      description: 'An old radio that plays morning bhajans every day at 6 AM.',
      enabled: true, createdAt: now,
    },
    {
      type: 'event', id: 'capsule-gathering', name: 'Family Gathering',
      dateLabel: '2025',
      emoji: '📸', people: ['Ananya', 'Lakshmi'],
      story: 'Ananya visited Ravi during the family gathering. Everyone planted a new rose bush in the garden together.',
      enabled: true, createdAt: now,
    },
    {
      type: 'routine', id: 'capsule-morning', activity: 'Morning Routine',
      time: '7:00 AM', emoji: '🕰️',
      steps: ['Wake up', 'Breakfast', 'Morning walk', 'Memory activity'],
      notes: 'Radio plays bhajans during breakfast.',
      enabled: true, createdAt: now,
    },
  ]
}

export function generateDemoMessages(): FamilyMessage[] {
  const now = new Date()
  return [
    {
      id: 'msg-1', from: 'Priya (Daughter)',
      text: 'Good morning! Remember to take your medicine today. Love you!',
      timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
      read: false, type: 'text',
    },
    {
      id: 'msg-2', from: 'Rahul (Son)',
      text: 'Thinking of you! Will visit this weekend.',
      timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(),
      read: true, type: 'text',
    },
  ]
}
