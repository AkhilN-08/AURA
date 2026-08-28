import { useState, useEffect, useCallback, useRef } from 'react'
import { RotateCcw, Trophy, Clock, Hash } from 'lucide-react'
import { useGameProgress } from '../../hooks/useGameProgress'
import { calculateDifficulty, getDifficultyConfig } from '../../utils/adaptiveDifficulty'
import type { GameSession } from '../../data/models'

const SEQUENCE_ITEMS = ['🍎', '🏠', '🌸', '🐦', '🍵', '🎵', '🎋', '☀️', '🏮', '🐟', '🪷', '🏔️', '🧘', '🎹', '🧶', '🌶️']

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

interface SequenceRecallProps {
  onComplete?: (session: GameSession) => void
}

export default function SequenceRecall({ onComplete }: SequenceRecallProps) {
  const { getAverageAccuracy } = useGameProgress()
  const lastAccuracy = useRef(getAverageAccuracy('sequence-recall'))
  const difficulty = calculateDifficulty(lastAccuracy.current || 75)
  const config = getDifficultyConfig(difficulty)

  const [phase, setPhase] = useState<'ready' | 'showing' | 'input' | 'result'>('ready')
  const [sequence, setSequence] = useState<string[]>([])
  const [userSequence, setUserSequence] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [rounds, setRounds] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [shuffledItems, setShuffledItems] = useState<string[]>([])

  const initRound = useCallback(() => {
    const seq = shuffle(SEQUENCE_ITEMS).slice(0, config.sequenceLength)
    setSequence(seq)
    setUserSequence([])
    setCurrentIndex(-1)
    setShuffledItems(shuffle(SEQUENCE_ITEMS))
    setPhase('showing')

    // Show sequence one by one
    let i = 0
    const showInterval = setInterval(() => {
      setCurrentIndex(i)
      i++
      if (i >= seq.length) {
        clearInterval(showInterval)
        setTimeout(() => {
          setCurrentIndex(-1)
          setPhase('input')
        }, 1000)
      }
    }, 1200)
  }, [config.sequenceLength])

  const startGame = () => {
    setRounds(0)
    setTotalScore(0)
    setElapsed(0)
    initRound()
  }

  useEffect(() => {
    if (phase !== 'showing' && phase !== 'input') return
    const interval = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(interval)
  }, [phase])

  const handleSelectItem = (item: string) => {
    if (phase !== 'input') return
    const newUserSeq = [...userSequence, item]
    setUserSequence(newUserSeq)

    if (newUserSeq.length === sequence.length) {
      // Check answer
      const correct = newUserSeq.every((item, i) => item === sequence[i])
      const accuracy = correct ? 100 : Math.round((newUserSeq.filter((item, i) => item === sequence[i]).length / sequence.length) * 100)
      const newTotal = totalScore + accuracy
      const newRounds = rounds + 1
      setRounds(newRounds)
      setTotalScore(newTotal)
      setPhase('result')

      if (newRounds >= 3) {
        const session: GameSession = {
          gameType: 'sequence-recall',
          score: Math.round(newTotal / newRounds),
          accuracy: Math.round(newTotal / newRounds),
          duration: elapsed,
          timestamp: new Date().toISOString(),
          difficulty,
        }
        onComplete?.(session)
      }
    }
  }

  const handleClear = () => {
    setUserSequence([])
  }

  const correctCount = userSequence.filter((item, i) => item === sequence[i]).length

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stats */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-charcoal-500">
            <Hash size={18} />
            <span className="font-medium">Round {rounds + 1}/3</span>
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

      {phase === 'ready' && (
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🔢</div>
          <h3 className="text-2xl font-bold text-charcoal-800 mb-3">Sequence Recall</h3>
          <p className="text-charcoal-400 mb-8 max-w-md mx-auto">
            Watch the sequence of {config.sequenceLength} items, then reproduce it from memory.
          </p>
          <button onClick={startGame} className="btn-primary">
            Start Round 1
          </button>
        </div>
      )}

      {phase === 'showing' && (
        <div className="text-center">
          <p className="text-lg font-medium text-sage-600 mb-8 animate-pulse">
            Watch the sequence carefully...
          </p>
          <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
            {sequence.map((item, i) => (
              <div
                key={i}
                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl transition-all duration-300
                  ${i <= currentIndex ? 'bg-sage-50 border-2 border-sage-300 shadow-lg scale-110' : 'bg-cream-100 border-2 border-cream-200'}`}
              >
                {i <= currentIndex ? item : '?'}
              </div>
            ))}
          </div>
          {currentIndex >= 0 && (
            <p className="text-sm text-charcoal-400">
              {currentIndex + 1} of {sequence.length}
            </p>
          )}
        </div>
      )}

      {phase === 'input' && (
        <div className="text-center">
          <p className="text-lg font-medium text-charcoal-700 mb-2">
            Your turn! Reproduce the sequence.
          </p>
          <p className="text-sm text-charcoal-400 mb-6">
            Select {sequence.length} items in order
          </p>

          {/* User's sequence */}
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap min-h-[80px]">
            {userSequence.map((item, i) => (
              <div
                key={i}
                className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl border-2
                  ${item === sequence[i] ? 'border-green-300 bg-green-50' : 'border-cream-200 bg-cream-50'}`}
              >
                {item}
              </div>
            ))}
            {Array.from({ length: sequence.length - userSequence.length }).map((_, i) => (
              <div key={`empty-${i}`} className="w-16 h-16 rounded-xl border-2 border-dashed border-cream-200 bg-cream-50/50" />
            ))}
          </div>

          {userSequence.length > 0 && (
            <button onClick={handleClear} className="btn-ghost text-sm mb-6">
              <RotateCcw size={14} className="inline mr-1" /> Clear
            </button>
          )}

          {/* Item selection */}
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {shuffledItems.map((item, i) => (
              <button
                key={`${item}-${i}`}
                onClick={() => handleSelectItem(item)}
                className="aspect-square rounded-2xl text-3xl flex items-center justify-center bg-white border-2 border-cream-200 hover:border-sage-300 hover:bg-sage-50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div className="text-center">
          <div className="card bg-cream-50 mb-8">
            <p className="text-sm text-charcoal-400 mb-4">Your sequence vs correct sequence:</p>
            <div className="flex items-center justify-center gap-4 flex-wrap mb-4">
              <div>
                <p className="text-xs text-charcoal-400 mb-2">Your answer:</p>
                <div className="flex gap-1">
                  {userSequence.map((item, i) => (
                    <div
                      key={i}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl border
                        ${item === sequence[i] ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div>
                <p className="text-xs text-charcoal-400 mb-2">Correct:</p>
                <div className="flex gap-1">
                  {sequence.map((item, i) => (
                    <div key={i} className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl border border-forest-200 bg-sage-50">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-charcoal-600 mt-4">
              <strong>{correctCount}</strong> of <strong>{sequence.length}</strong> items correct
            </p>
          </div>

          {rounds < 3 ? (
            <button onClick={initRound} className="btn-primary">
              Next Round ({rounds + 2}/3)
            </button>
          ) : (
            <div className="card bg-sage-50">
              <Trophy className="mx-auto text-amber-500 mb-4" size={48} />
              <h3 className="text-2xl font-bold text-charcoal-800 mb-2">Game Complete!</h3>
              <p className="text-charcoal-400">Average accuracy: {Math.round(totalScore / 3)}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
