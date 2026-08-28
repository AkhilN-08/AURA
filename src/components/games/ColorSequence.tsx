import { useState, useEffect, useCallback, useRef } from 'react'
import { RotateCcw, Trophy, Clock, Palette } from 'lucide-react'
import { useGameProgress } from '../../hooks/useGameProgress'
import { calculateDifficulty, getDifficultyConfig } from '../../utils/adaptiveDifficulty'
import type { GameSession } from '../../data/models'

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const COLORS = [
  { name: 'Red', bg: 'bg-red-400', border: 'border-red-500', shadow: 'shadow-red-200', value: '#f87171' },
  { name: 'Blue', bg: 'bg-blue-400', border: 'border-blue-500', shadow: 'shadow-blue-200', value: '#60a5fa' },
  { name: 'Green', bg: 'bg-green-400', border: 'border-green-500', shadow: 'shadow-green-200', value: '#4ade80' },
  { name: 'Yellow', bg: 'bg-yellow-400', border: 'border-yellow-500', shadow: 'shadow-yellow-200', value: '#facc15' },
  { name: 'Purple', bg: 'bg-purple-400', border: 'border-purple-500', shadow: 'shadow-purple-200', value: '#c084fc' },
  { name: 'Pink', bg: 'bg-pink-400', border: 'border-pink-500', shadow: 'shadow-pink-200', value: '#f472b6' },
  { name: 'Orange', bg: 'bg-orange-400', border: 'border-orange-500', shadow: 'shadow-orange-200', value: '#fb923c' },
  { name: 'Teal', bg: 'bg-teal-400', border: 'border-teal-500', shadow: 'shadow-teal-200', value: '#2dd4bf' },
]

interface ColorSequenceProps {
  onComplete?: (session: GameSession) => void
}

export default function ColorSequence({ onComplete }: ColorSequenceProps) {
  const { getAverageAccuracy } = useGameProgress()
  const lastAccuracy = useRef(getAverageAccuracy('color-sequence'))
  const difficulty = calculateDifficulty(lastAccuracy.current || 75)
  const config = getDifficultyConfig(difficulty)

  const [phase, setPhase] = useState<'ready' | 'showing' | 'input' | 'result' | 'gameover'>('ready')
  const [sequence, setSequence] = useState<number[]>([])
  const [userSequence, setUserSequence] = useState<number[]>([])
  const [showIndex, setShowIndex] = useState(-1)
  const [activeColor, setActiveColor] = useState(-1)
  const [rounds, setRounds] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  const initRound = useCallback(() => {
    const seq = shuffle(Array.from({ length: COLORS.length }, (_, i) => i)).slice(0, config.colorLength)
    setSequence(seq)
    setUserSequence([])
    setShowIndex(-1)
    setPhase('showing')

    let i = 0
    const showInterval = setInterval(() => {
      setShowIndex(i)
      setActiveColor(seq[i])
      setTimeout(() => setActiveColor(-1), 500)
      i++
      if (i >= seq.length) {
        clearInterval(showInterval)
        setTimeout(() => { setShowIndex(-1); setPhase('input') }, 1000)
      }
    }, 900)
  }, [config.colorLength])

  const startGame = () => { setRounds(0); setTotalScore(0); setElapsed(0); initRound() }

  useEffect(() => {
    if (phase !== 'showing' && phase !== 'input') return
    const interval = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(interval)
  }, [phase])

  const handleColorClick = (colorIndex: number) => {
    if (phase !== 'input') return

    setActiveColor(colorIndex)
    setTimeout(() => setActiveColor(-1), 200)

    const newUserSeq = [...userSequence, colorIndex]
    setUserSequence(newUserSeq)

    if (newUserSeq.length === sequence.length) {
      const correct = newUserSeq.filter((c, i) => c === sequence[i]).length
      const accuracy = Math.round((correct / sequence.length) * 100)
      setPhase('result')

      const newTotal = totalScore + accuracy
      const newRounds = rounds + 1
      setRounds(newRounds)
      setTotalScore(newTotal)

      if (newRounds >= 3) {
        setTimeout(() => {
          onComplete?.({
            gameType: 'color-sequence',
            score: Math.round(newTotal / newRounds),
            accuracy: Math.round(newTotal / newRounds),
            duration: elapsed,
            timestamp: new Date().toISOString(),
            difficulty,
          })
          setPhase('gameover')
        }, 2000)
      }
    }
  }

  const handleClear = () => { setUserSequence([]) }

  const correctCount = userSequence.filter((c, i) => c === sequence[i]).length

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-charcoal-500">
            <Palette size={18} />
            <span className="font-medium">Round {rounds + 1}/3</span>
          </div>
          <div className="flex items-center gap-2 text-charcoal-500">
            <RotateCcw size={18} />
            <span className="font-medium">{userSequence.length}/{sequence.length || config.colorLength} selected</span>
          </div>
          <div className="flex items-center gap-2 text-charcoal-500">
            <Clock size={18} />
            <span className="font-medium">{elapsed}s</span>
          </div>
        </div>
        <div className="bg-pink-50 px-4 py-2 rounded-xl">
          <span className="text-sm font-medium text-pink-600">{difficulty} mode</span>
        </div>
      </div>

      {phase === 'ready' && (
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🎨</div>
          <h3 className="text-2xl font-bold text-charcoal-800 mb-3">Color Sequence</h3>
          <p className="text-charcoal-400 mb-8 max-w-md mx-auto">
            Watch the colors light up in order, then tap them back from memory!
          </p>
          <button onClick={startGame} className="btn-primary">Start Round 1</button>
        </div>
      )}

      {(phase === 'showing' || phase === 'input' || phase === 'result') && (
        <div className="text-center">
          {phase === 'showing' && (
            <p className="text-lg font-medium text-pink-600 mb-6 animate-pulse">
              Watch the colors... {showIndex + 1}/{sequence.length}
            </p>
          )}
          {phase === 'input' && (
            <p className="text-lg font-medium text-charcoal-700 mb-6">
              Your turn! Tap the colors in order
            </p>
          )}

          {/* Color grid */}
          <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto mb-6">
            {COLORS.map((color, i) => {
              const isActive = activeColor === i
              const isInSequence = sequence.includes(i)
              const showHighlight = phase === 'showing' && isInSequence && sequence[showIndex] === i
              const isSelected = userSequence.includes(i)

              return (
                <button
                  key={i}
                  onClick={() => handleColorClick(i)}
                  disabled={phase === 'showing' || phase === 'result'}
                  className={`aspect-square rounded-2xl transition-all duration-400 ease-[cubic-bezier(0.25,0.1,0.25,1)] ease-[cubic-bezier(0.25,0.1,0.25,1)] border-3 ${
                    showHighlight
                      ? `bg-gradient-to-br from-white/30 to-transparent ${color.border} shadow-lg ${color.shadow} scale-110 ring-4 ring-white/50`
                      : isActive
                      ? `brightness-125 scale-110 ${color.border} shadow-lg`
                      : phase === 'result'
                      ? `${color.bg} opacity-40`
                      : `${color.bg} hover:scale-105 hover:brightness-110 cursor-pointer ${color.border} border-2`
                  }`}
                  aria-label={color.name}
                />
              )
            })}
          </div>

          {/* User's sequence display */}
          <div className="flex items-center justify-center gap-2 mb-6 min-h-[48px] flex-wrap">
            {userSequence.map((c, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-xl border-2 transition-all ${
                  phase === 'result'
                    ? c === sequence[i] ? 'border-green-400 bg-green-100' : 'border-red-300 bg-red-100'
                    : 'border-cream-300 bg-cream-50'
                }`}
                style={{ backgroundColor: phase === 'result' ? undefined : COLORS[c].value + '40' }}
              />
            ))}
            {phase === 'input' && Array.from({ length: sequence.length - userSequence.length }).map((_, i) => (
              <div key={`empty-${i}`} className="w-10 h-10 rounded-xl border-2 border-dashed border-cream-200 bg-cream-50/50" />
            ))}
          </div>

          {phase === 'input' && userSequence.length > 0 && (
            <button onClick={handleClear} className="btn-ghost text-sm mb-4">
              <RotateCcw size={14} className="inline mr-1" /> Clear
            </button>
          )}

          {phase === 'result' && (
            <div className="mt-4">
              <p className="text-charcoal-600 mb-4">
                You got <strong>{correctCount}</strong> of <strong>{sequence.length}</strong> colors correct!
              </p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-xs text-charcoal-400">Correct:</span>
                {sequence.map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-lg border" style={{ backgroundColor: COLORS[c].value }} />
                ))}
              </div>
              {rounds < 3 && (
                <button onClick={initRound} className="btn-primary">Next Round ({rounds + 2}/3)</button>
              )}
            </div>
          )}
        </div>
      )}

      {phase === 'gameover' && (
        <div className="text-center mt-8 animate-fade-in">
          <div className="card bg-pink-50 border-pink-200">
            <Trophy className="mx-auto text-amber-500 mb-4" size={48} />
            <h3 className="text-2xl font-bold text-charcoal-800 mb-2">Beautiful Memory!</h3>
            <p className="text-charcoal-400 mb-4">Average accuracy: {Math.round(totalScore / 3)}%</p>
            <p className="text-sm text-charcoal-400">Color sequence strengthens visual working memory and attention.</p>
          </div>
        </div>
      )}
    </div>
  )
}
