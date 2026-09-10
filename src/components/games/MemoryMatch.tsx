import { useState, useEffect, useCallback, useRef } from 'react'
import { Trophy, RotateCcw, Volume2 } from 'lucide-react'
import { useGameProgress } from '../../hooks/useGameProgress'
import { calculateDifficulty, getDifficultyConfig } from '../../utils/adaptiveDifficulty'
import { playMatchChime, playWinChime, playTapSound, speakText } from '../../utils/audio'
import { useTranslation } from '../../hooks/useTranslation'
import type { GameSession } from '../../data/models'
import { MEMORY_MATCH_ICONS } from '../../data/games'

interface Card {
  id: number
  emoji: string
  image: string
  label: string
  isFlipped: boolean
  isMatched: boolean
}

const CARD_POOL = MEMORY_MATCH_ICONS

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
  const { t, language } = useTranslation()
  const { getAverageAccuracy } = useGameProgress()
  const lastAccuracy = useRef(getAverageAccuracy('memory-match'))
  const difficulty = calculateDifficulty(lastAccuracy.current || 75)
  const config = getDifficultyConfig(difficulty)

  const [cards, setCards] = useState<Card[]>([])
  const [flippedIds, setFlippedIds] = useState<number[]>([])
  const [matches, setMatches] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [lockBoard, setLockBoard] = useState(false)
  const [encouragement, setEncouragement] = useState('')

  const MATCH_MESSAGES = [
    'Beautiful! 🌸', 'Wonderful! 💐', 'You remembered! 🌺',
    'Amazing! 🏡', 'That\'s right! ☀️', 'Brilliant! 🎋',
    'Lovely! 🎋', 'So clever! 🍵', 'Keep going! 🌸',
  ]

  const initGame = useCallback(() => {
    const chosen = shuffle(CARD_POOL).slice(0, config.pairs)
    const pairs = [...chosen, ...chosen]
    const shuffled = shuffle(pairs)
    setCards(shuffled.map((item, i) => ({ id: i, emoji: item.emoji, image: item.image, label: item.label, isFlipped: false, isMatched: false })))
    setFlippedIds([])
    setMatches(0)
    setGameStarted(false)
    setGameOver(false)
    setLockBoard(false)
  }, [config.pairs])

  useEffect(() => {
    initGame()
    localStorage.setItem("aura-last-activity", "/games")
    // Read instructions aloud
    speakText(t('Find matching pairs of cards. Tap a card to flip it over, then find its match!'), language)
  }, [initGame])

  useEffect(() => {
    if (matches > 0 && matches === config.pairs) {
      setGameOver(true)
      playWinChime()
      const session: GameSession = {
        gameType: 'memory-match',
        score: 100,
        accuracy: 100,
        duration: 0,
        timestamp: new Date().toISOString(),
        difficulty,
      }
      onComplete?.(session)
    }
  }, [matches, config.pairs, difficulty, onComplete])

  const handleCardClick = (id: number) => {
    if (lockBoard || gameOver) return
    if (flippedIds.length >= 2) return
    if (cards[id].isFlipped || cards[id].isMatched) return
    playTapSound()

    if (!gameStarted) {
      setGameStarted(true)
    }

    const newCards = [...cards]
    newCards[id].isFlipped = true
    setCards(newCards)

    const newFlipped = [...flippedIds, id]
    setFlippedIds(newFlipped)

    if (newFlipped.length === 2) {
      setLockBoard(true)

      if (cards[newFlipped[0]].emoji === cards[newFlipped[1]].emoji) {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.emoji === cards[newFlipped[0]].emoji ? { ...c, isMatched: true } : c
          ))
          setMatches(m => m + 1)
          playMatchChime()
          setEncouragement(t(MATCH_MESSAGES[Math.floor(Math.random() * MATCH_MESSAGES.length)]))
          setTimeout(() => setEncouragement(''), 1200)
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

  return (
    <div className="max-w-2xl mx-auto">
      {/* Warm encouragement banner */}
      <div className="text-center mb-6 h-8">
        {encouragement && (
          <p className="text-xl font-bold text-sage-600 animate-bounce">{encouragement}</p>
        )}
        {!gameOver && !encouragement && (
          <p className="text-charcoal-400 text-sm">{t('Tap a card to find a pair!')}</p>
        )}
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
            className={`aspect-square rounded-2xl text-3xl md:text-5xl min-h-[80px] font-bold
                       transition-all duration-400 ease-[cubic-bezier(0.25,0.1,0.25,1)]
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400
                       ${card.isMatched
                         ? 'bg-sage-100 border-2 border-sage-300 scale-105'
                         : card.isFlipped
                         ? 'bg-white border-2 border-sage-300 shadow-lg scale-105'
                         : 'bg-sage-500 hover:bg-sage-400 hover:scale-[1.02] shadow-soft cursor-pointer'
                       }`}
            aria-label={card.isFlipped || card.isMatched ? card.label : 'Hidden card'}
          >
            {card.isFlipped || card.isMatched ? (
              <div className="flex flex-col items-center justify-center gap-1">
                <img src={card.image} alt={card.label} className="w-10 h-10 md:w-14 md:h-14 object-cover rounded-lg" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style') }} />
                <span className="text-lg md:text-xl hidden" style={{display:'none'}}>{card.emoji}</span>
                <span className="text-[10px] md:text-xs text-charcoal-500 font-medium">{card.label}</span>
              </div>
            ) : ''}
          </button>
        ))}
      </div>

      {/* Game over */}
      {gameOver && (
        <div className="mt-8 text-center animate-fade-in">
          <div className="card bg-sage-50 border-forest-200">
            <Trophy className="mx-auto text-amber-500 mb-4" size={48} />
            <h3 className="text-2xl font-bold text-charcoal-800 mb-2">{t('Beautiful! Your memory is wonderful today!')} 🌸</h3>
            <p className="text-charcoal-400 mb-6">
              {t('You found all {n} pairs! Keep it up — your mind is getting stronger every day.', { n: config.pairs })}
            </p>
            <div className="flex items-center justify-center gap-3 mb-6">
              {[...Array(3)].map((_, i) => (
                <span key={i} className="text-3xl">🌸</span>
              ))}
            </div>
            <button onClick={() => { playTapSound(); initGame() }} className="btn-primary flex items-center gap-2 mx-auto">
              <RotateCcw size={20} /> {t('Play Again')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
