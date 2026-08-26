import type { DifficultyLevel } from '../data/models'

export function calculateDifficulty(accuracy: number): DifficultyLevel {
  if (accuracy > 85) return 'hard'
  if (accuracy >= 60) return 'moderate'
  return 'easy'
}

export function getDifficultyConfig(level: DifficultyLevel) {
  switch (level) {
    case 'easy':
      return {
        pairs: 4,
        objects: 4,
        sequenceLength: 3,
        displayTime: 5000,
        distractors: 0,
        label: 'Easy',
      }
    case 'moderate':
      return {
        pairs: 6,
        objects: 6,
        sequenceLength: 5,
        displayTime: 4000,
        distractors: 2,
        label: 'Moderate',
      }
    case 'hard':
      return {
        pairs: 8,
        objects: 8,
        sequenceLength: 7,
        displayTime: 3000,
        distractors: 3,
        label: 'Hard',
      }
  }
}

export function getDifficultyDescription(level: DifficultyLevel): string {
  switch (level) {
    case 'easy':
      return 'Gentle pace with fewer items to remember.'
    case 'moderate':
      return 'A balanced challenge to keep the mind active.'
    case 'hard':
      return 'More items for a deeper cognitive workout.'
  }
}
