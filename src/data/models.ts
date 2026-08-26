export interface GameSession {
  gameType: 'memory-match' | 'object-recall' | 'sequence-recall'
  score: number
  accuracy: number
  duration: number
  timestamp: string
  difficulty: 'easy' | 'moderate' | 'hard'
}

export interface Reminder {
  id: string
  title: string
  time: string
  type: 'medicine' | 'appointment' | 'meal' | 'call' | 'routine'
  completed: boolean
  createdAt: string
}

export interface UserProfile {
  name: string
  age: number
  preferredLanguage: string
}

export interface CaregiverData {
  name: string
  relationship: string
}

export type DifficultyLevel = 'easy' | 'moderate' | 'hard'

export const GAME_TYPES = {
  'memory-match': { label: 'Memory Match', icon: ' brain' },
  'object-recall': { label: 'Object Recall', icon: '👁️' },
  'sequence-recall': { label: 'Sequence Recall', icon: '🔢' },
} as const

export const REMINDER_TYPES = {
  medicine: { label: 'Medicine', color: 'bg-red-100 text-red-600' },
  appointment: { label: 'Appointment', color: 'bg-blue-100 text-blue-600' },
  meal: { label: 'Meal', color: 'bg-amber-100 text-amber-600' },
  call: { label: 'Phone Call', color: 'bg-green-100 text-green-600' },
  routine: { label: 'Daily Routine', color: 'bg-purple-100 text-purple-600' },
} as const
