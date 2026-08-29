import type { GameSession, Reminder } from './models'

// Generate demo game sessions over the past 14 days
export function generateDemoSessions(): GameSession[] {
  const sessions: GameSession[] = []
  const games: GameSession['gameType'][] = [
    'memory-match', 'object-recall', 'sequence-recall',
    'word-association', 'pattern-grid', 'story-recall', 'color-sequence'
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
