import type { GameSession, GameType, GameCategory } from '../data/models'
import { GAME_TYPES } from '../data/models'

/**
 * Central adaptive engine — all games report standardized performance
 * data and AURA derives strengths, focus areas, and recommendations.
 *
 * Visual Memory    → pattern-recall, what-changed, memory-match
 * Recognition      → forget-teach-retest, my-place-memories, word-association
 * Attention        → memory-sequence, pattern-grid, color-sequence
 * Sequencing       → sequence-recall, memory-story, routine-deviation
 * Everyday Memory  → memory-replay, memory-lane, object-recall
 */

export const GAME_CATEGORY: Record<GameType, GameCategory> = {
  'memory-match': 'memory',
  'object-recall': 'memory',
  'sequence-recall': 'attention',
  'word-association': 'recognition',
  'pattern-grid': 'attention',
  'story-recall': 'memory',
  'color-sequence': 'attention',
  'memory-lane': 'memory',
  'memory-replay': 'memory',
  'forget-teach-retest': 'recognition',
  'routine-deviation': 'routine',
  'my-place-memories': 'recognition',
  'pattern-recall': 'memory',
  'what-changed': 'memory',
  'memory-sequence': 'attention',
  'memory-story': 'memory',
}

/** Extended session shape for the adaptive engine (with category + responseTime). */
export interface EngineSession {
  gameName: GameType
  score: number
  accuracy: number
  responseTime?: number
  difficulty?: GameSession['difficulty']
  attempts?: number
  timestamp: string
  category: GameCategory
}

/** Convert a stored GameSession into the standardized engine record. */
export function toEngineSession(s: GameSession): EngineSession {
  return {
    gameName: s.gameType,
    score: s.score,
    accuracy: s.accuracy,
    responseTime: s.responseTime,
    difficulty: s.difficulty,
    attempts: s.attempts,
    timestamp: s.timestamp,
    category: s.category ?? GAME_CATEGORY[s.gameType],
  }
}

export interface CategoryScore {
  category: GameCategory
  label: string
  value: number       // 0-100
  sessions: number
}

const CATEGORY_LABELS: Record<GameCategory, string> = {
  memory: 'Visual Memory',
  recognition: 'Recognition',
  routine: 'Routine Awareness',
  attention: 'Attention',
}

export function getCategoryScores(sessions: GameSession[]): CategoryScore[] {
  const byCat = new Map<GameCategory, number[]>()
  for (const s of sessions) {
    const cat = s.category ?? GAME_CATEGORY[s.gameType]
    if (!byCat.has(cat)) byCat.set(cat, [])
    byCat.get(cat)!.push(s.accuracy)
  }
  const out: CategoryScore[] = []
  for (const [cat, accs] of byCat) {
    out.push({
      category: cat,
      label: CATEGORY_LABELS[cat],
      value: Math.round(accs.reduce((a, b) => a + b, 0) / accs.length),
      sessions: accs.length,
    })
  }
  // stable display order
  const order: GameCategory[] = ['memory', 'recognition', 'attention', 'routine']
  return out.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category))
}

export function gameCategory(type: GameType): GameCategory {
  return GAME_CATEGORY[type]
}

/**
 * Recommendation logic: mostly data-driven, with a tiny deterministic
 * nudge (day-of-year) so the challenge rotates slowly instead of feeling
 * frozen — never fully random.
 */
export function getRecommendedGame(sessions: GameSession[]): GameType {
  if (sessions.length === 0) return 'memory-replay'

  // 1) Focus area: weakest category (with >= 1 session) gets priority
  const scores = getCategoryScores(sessions).filter(c => c.sessions > 0)
  const order: GameCategory[] = ['memory', 'recognition', 'attention', 'routine']
  const weakest = scores
    .slice()
    .sort((a, b) => (order.indexOf(a.category) - order.indexOf(b.category)) || (a.value - b.value))
    .find(c => c.value < 80)

  // 2) Candidates: new games the user hasn't tried much, weighted toward
  //    the weakest category when one exists.
  const playCounts = new Map<GameType, number>()
  for (const s of sessions) playCounts.set(s.gameType, (playCounts.get(s.gameType) ?? 0) + 1)

  const pool: GameType[] = [
    'memory-replay', 'forget-teach-retest', 'routine-deviation',
    'my-place-memories', 'pattern-recall', 'what-changed',
    'memory-sequence', 'memory-story',
  ]

  const candidates = weakest
    ? pool.filter(t => GAME_CATEGORY[t] === weakest.category)
    : pool

  const fallback = pool.filter(t => !candidates.includes(t))

  // Prefer least-played among candidates; nudge rotation by day-of-year
  const dayNudge = Math.floor(Date.now() / 86400000) % 3
  const ranked = [...candidates, ...fallback].sort((a, b) => {
    const ca = (playCounts.get(a) ?? 0) * 10 + dayNudge
    const cb = (playCounts.get(b) ?? 0) * 10 + dayNudge
    return ca - cb
  })

  return ranked[0] ?? 'memory-replay'
}

export interface Recommendation {
  game: GameType
  label: string
  minutes: number
  focus: string
  level: number        // 1-5
  reason: string
}

const FOCUS_LABELS: Record<GameCategory, string> = {
  memory: 'Visual Memory',
  recognition: 'Recognition',
  attention: 'Sequencing & Attention',
  routine: 'Routine Awareness',
}

export function getRecommendation(sessions: GameSession[]): Recommendation {
  const game = getRecommendedGame(sessions)
  const cat = GAME_CATEGORY[game]

  // Level 1-5 from overall recent performance
  const recent = sessions.slice(-8)
  const avg = recent.length > 0
    ? Math.round(recent.reduce((a, s) => a + s.accuracy, 0) / recent.length)
    : 70
  const level = Math.max(1, Math.min(5, Math.ceil(avg / 20)))

  const minutes = 5 + (level >= 4 ? 2 : 0)
  const reasons: Partial<Record<GameCategory, string>> = {
    memory: 'to gently strengthen your visual memory',
    recognition: 'to practice recognizing familiar faces and places',
    attention: 'to keep your attention sharp with light sequences',
    routine: 'to stay oriented with your daily rhythm',
  }

  return {
    game,
    label: GAME_TYPES[game].label,
    minutes,
    focus: FOCUS_LABELS[cat],
    level,
    reason: reasons[cat] ?? 'to keep your mind active',
  }
}
