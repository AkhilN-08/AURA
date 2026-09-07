export type GameType = 'memory-match' | 'object-recall' | 'sequence-recall' | 'word-association' | 'pattern-grid' | 'story-recall' | 'color-sequence' | 'memory-lane'

export interface GameSession {
  gameType: GameType
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

export interface DailyTask {
  id: string
  title: string
  completed: boolean
  createdAt: string
  date: string // YYYY-MM-DD for daily reset
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
  'memory-match': { label: 'Memory Match', icon: '🧠' },
  'object-recall': { label: 'Object Recall', icon: '👁️' },
  'sequence-recall': { label: 'Sequence Recall', icon: '🔢' },
  'word-association': { label: 'Word Association', icon: '📖' },
  'pattern-grid': { label: 'Pattern Grid', icon: '🔲' },
  'story-recall': { label: 'Story Recall', icon: '📚' },
  'color-sequence': { label: 'Color Sequence', icon: '🎨' },
  'memory-lane': { label: 'Memory Lane', icon: '🪷' },
} as const

export interface MemoryLanePrompt {
  id: string
  prompt: string
  answer: string
  hint: string
  category: 'family' | 'place' | 'food' | 'ritual' | 'routine'
}

export interface FamilyPhotoMessage {
  id: string
  from: string
  caption: string
  photoData: string
  timestamp: string
  read: boolean
}

export const REMINDER_TYPES = {
  medicine: { label: 'Medicine', color: 'bg-red-100 text-red-600' },
  appointment: { label: 'Appointment', color: 'bg-blue-100 text-blue-600' },
  meal: { label: 'Meal', color: 'bg-amber-100 text-amber-600' },
  call: { label: 'Phone Call', color: 'bg-green-100 text-green-600' },
  routine: { label: 'Daily Routine', color: 'bg-purple-100 text-purple-600' },
} as const
