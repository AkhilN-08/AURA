import type { DifficultyLevel } from '../data/models'
import type { AssessmentResult } from '../hooks/useAuth'

export function calculateDifficulty(accuracy: number): DifficultyLevel {
  if (accuracy > 85) return 'hard'
  if (accuracy >= 60) return 'moderate'
  return 'easy'
}

export function getDifficultyFromAssessment(result: AssessmentResult): DifficultyLevel {
  switch (result.level) {
    case 'mild':
      return 'moderate'
    case 'moderate':
      return 'easy'
    case 'significant':
      return 'easy'
  }
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
        wordPairs: 3,
        gridCells: 9,
        gridHighlight: 3,
        storySentences: 3,
        storyQuestions: 2,
        colorLength: 3,
        label: 'Easy',
      }
    case 'moderate':
      return {
        pairs: 6,
        objects: 6,
        sequenceLength: 5,
        displayTime: 4000,
        distractors: 2,
        wordPairs: 5,
        gridCells: 16,
        gridHighlight: 5,
        storySentences: 5,
        storyQuestions: 3,
        colorLength: 5,
        label: 'Moderate',
      }
    case 'hard':
      return {
        pairs: 8,
        objects: 8,
        sequenceLength: 7,
        displayTime: 3000,
        distractors: 3,
        wordPairs: 7,
        gridCells: 25,
        gridHighlight: 7,
        storySentences: 7,
        storyQuestions: 4,
        colorLength: 7,
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
