import { useState, useEffect, useCallback, useRef } from 'react'
import { RotateCcw, Trophy, Clock, Target } from 'lucide-react'
import { useGameProgress } from '../../hooks/useGameProgress'
import { calculateDifficulty, getDifficultyConfig } from '../../utils/adaptiveDifficulty'
import type { GameSession } from '../../data/models'

interface Card {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

const EMOJI_SETS = [
  ['🌺', '🏠', '🎵', '🌊', '🍃', '☀️', '🎹', '🧘', '🐘', '🏡', '🎶', '🌸', '🐟', '🎋', '🍵', '🏮'],
]

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

interface MemoryMatchProps {
  onComplete?: (session: GameSession) => void
}

export default function MemoryMatch({ onComplete }: MemoryMatchProps) {
  const { getAverageAccuracy } = useGameProgress()
  const lastAccuracy = useRef(getAverageAccuracy('memory-match'))
  const difficulty = calculateDifficulty(lastAccuracy.current || 75)
  const config = getDifficultyConfig(difficulty)

  const [cards, setCards] = useState<Card[]>([])
  const [flippedIds, setFlippedIds] = useState<number[]>([])
  const [attempts, setAttempts] = useState(0)
  const [matches, setMatches] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [lockBoard, setLockBoard] = useState(false)

  const initGame = useCallback(() => {
    const emojis = shuffle(EMOJI_SETS[0]).slice(0, config.pairs)
    const pairs = [...emojis, ...emojis]
    const shuffled = shuffle(pairs)
    setCards(shuffled.map((emoji, i) => ({ id: i, emoji, isFlipped: false, isMatched: false })))
    setFlippedIds([])
    setAttempts(0)
    setMatches(0)
    setGameStarted(false)
    setGameOver(false)
    setElapsed(0)
    setLockBoard(false)
  }, [config.pairs])

  useEffect(() => {
    initGame()
  }, [initGame])

  useEffect(() => {
    if (!gameStarted || gameOver) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [gameStarted, gameOver, startTime])

  useEffect(() => {
    if (matches > 0 && matches === config.pairs) {
      setGameOver(true)
      const accuracy = Math.round((matches / (attempts || 1)) * 100)
      const session: GameSession = {
        gameType: 'memory-match',
        score: accuracy,
        accuracy,
        duration: elapsed,
        timestamp: new Date().toISOString(),
        difficulty,
      }
      onComplete?.(session)
    }
  }, [matches, attempts, config.pairs, elapsed, difficulty, onComplete])

  const handleCardClick = (id: number) => {
    if (lockBoard || gameOver) return
    if (flippedIds.length >= 2) return
    if (cards[id].isFlipped || cards[id].isMatched) return

    if (!gameStarted) {
      setGameStarted(true)
      setStartTime(Date.now())
    }

    const newCards = [...cards]
    newCards[id].isFlipped = true
    setCards(newCards)

    const newFlipped = [...flippedIds, id]
    setFlippedIds(newFlipped)

    if (newFlipped.length === 2) {
      setAttempts(a => a + 1)
      setLockBoard(true)

      if (cards[newFlipped[0]].emoji === cards[newFlipped[1]].emoji) {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.emoji === cards[newFlipped[0]].emoji ? { ...c, isMatched: true } : c
          ))
          setMatches(m => m + 1)
          setFlippedIds([])
          setLockBoard(false)
        }, 500)
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            newFlipped.includes(i) ? { ...c, isFlipped: false } : c
          ))
          setFlippedIds([])
          setLockBoard(false)
        }, 800)
      }
    }
  }

  const accuracy = attempts > 0 ? Math.round((matches / attempts) * 100) : 0

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stats bar */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-charcoal-500">
            <Target size={18} />
            <span className="font-medium">{matches}/{config.pairs} pairs</span>
          </div>
          <div className="flex items-center gap-2 text-charcoal-500">
            <RotateCcw size={18} />
            <span className="font-medium">{attempts} attempts</span>
          </div>
          <div className="flex items-center gap-2 text-charcoal-500">
            <Clock size={18} />
            <span className="font-medium">{elapsed}s</span>
          </div>
        </div>
        <div className="bg-sage-50 px-4 py-2 rounded-xl">
          <span className="text-sm font-medium text-sage-600">{difficulty} mode</span>
        </div>
      </div>

      {/* Cards grid */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${config.pairs <= 4 ? 4 : config.pairs <= 6 ? 4 : 4}, 1fr)` }}
      >
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.isFlipped || card.isMatched || lockBoard}
            className={`aspect-square rounded-2xl text-3xl md:text-4xl font-bold
                       transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400
                       ${card.isMatched
                         ? 'bg-sage-100 border-2 border-sage-300 scale-105'
                         : card.isFlipped
                         ? 'bg-white border-2 border-sage-300 shadow-lg scale-105'
                         : 'bg-sage-500 hover:bg-sage-400 hover:scale-[1.02] shadow-soft cursor-pointer'
                       }`}
            aria-label={card.isFlipped || card.isMatched ? card.emoji : 'Hidden card'}
          >
            {card.isFlipped || card.isMatched ? card.emoji : ''}
          </button>
        ))}
      </div>

      {/* Game over */}
      {gameOver && (
        <div className="mt-8 text-center animate-fade-in">
          <div className="card bg-sage-50 border-forest-200">
            <Trophy className="mx-auto text-amber-500 mb-4" size={48} />
            <h3 className="text-2xl font-bold text-charcoal-800 mb-2">Wonderful!</h3>
            <p className="text-charcoal-400 mb-6">
              You found all {config.pairs} pairs in {attempts} attempts and {elapsed} seconds.
            </p>
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-sage-600">{accuracy}%</p>
                <p className="text-sm text-charcoal-400">Accuracy</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-sage-600">{elapsed}s</p>
                <p className="text-sm text-charcoal-400">Time</p>
              </div>
            </div>
            <button onClick={initGame} className="btn-primary">
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
