import { useState, useEffect, useCallback, useRef } from 'react'
import { RotateCcw, Trophy, Clock, Grid3X3 } from 'lucide-react'
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

interface PatternGridProps {
  onComplete?: (session: GameSession) => void
}

export default function PatternGrid({ onComplete }: PatternGridProps) {
  const { getAverageAccuracy } = useGameProgress()
  const lastAccuracy = useRef(getAverageAccuracy('pattern-grid'))
  const difficulty = calculateDifficulty(lastAccuracy.current || 75)
  const config = getDifficultyConfig(difficulty)

  const gridSize = Math.sqrt(config.gridCells)
  const numHighlights = config.gridHighlight

  const [phase, setPhase] = useState<'ready' | 'showing' | 'input' | 'result' | 'gameover'>('ready')
  const [highlighted, setHighlighted] = useState<Set<number>>(new Set())
  const [userSelected, setUserSelected] = useState<Set<number>>(new Set())
  const [showIndex, setShowIndex] = useState(0)
  const [rounds, setRounds] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  const initRound = useCallback(() => {
    const indices = shuffle(Array.from({ length: config.gridCells }, (_, i) => i)).slice(0, numHighlights)
    setHighlighted(new Set(indices))
    setUserSelected(new Set())
    setShowIndex(0)
    setPhase('showing')

    let i = 0
    const showInterval = setInterval(() => {
      i++
      setShowIndex(i)
      if (i >= numHighlights) {
        clearInterval(showInterval)
        setTimeout(() => { setShowIndex(-1); setPhase('input') }, 1200)
      }
    }, 800)
  }, [config.gridCells, numHighlights])

  const startGame = () => { setRounds(0); setTotalScore(0); setElapsed(0); initRound() }

  useEffect(() => {
    if (phase !== 'showing' && phase !== 'input') return
    const interval = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(interval)
  }, [phase])

  const handleCellClick = (index: number) => {
    if (phase !== 'input') return
    const newSelected = new Set(userSelected)
    if (newSelected.has(index)) { newSelected.delete(index) }
    else if (newSelected.size < numHighlights) { newSelected.add(index) }
    setUserSelected(newSelected)
  }

  const handleSubmit = () => {
    const correct = [...highlighted].filter(i => userSelected.has(i)).length
    const accuracy = Math.round((correct / numHighlights) * 100)
    setPhase('result')

    const newTotal = totalScore + accuracy
    const newRounds = rounds + 1
    setRounds(newRounds)
    setTotalScore(newTotal)

    if (newRounds >= 3) {
      setTimeout(() => {
        onComplete?.({
          gameType: 'pattern-grid',
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

  const highlightArray = [...highlighted]
  const selectedArray = [...userSelected]
  const correctCount = selectedArray.filter(i => highlighted.has(i)).length

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-charcoal-500">
            <Grid3X3 size={18} />
            <span className="font-medium">Round {rounds + 1}/3</span>
          </div>
          <div className="flex items-center gap-2 text-charcoal-500">
            <RotateCcw size={18} />
            <span className="font-medium">{userSelected.size}/{numHighlights} selected</span>
          </div>
          <div className="flex items-center gap-2 text-charcoal-500">
            <Clock size={18} />
            <span className="font-medium">{elapsed}s</span>
          </div>
        </div>
        <div className="bg-purple-50 px-4 py-2 rounded-xl">
          <span className="text-sm font-medium text-purple-600">{difficulty} mode</span>
        </div>
      </div>

      {phase === 'ready' && (
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🔲</div>
          <h3 className="text-2xl font-bold text-charcoal-800 mb-3">Pattern Grid</h3>
          <p className="text-charcoal-400 mb-8 max-w-md mx-auto">
            Watch as {numHighlights} cells light up in sequence. Then tap them from memory!
          </p>
          <button onClick={startGame} className="btn-primary">Start Round 1</button>
        </div>
      )}

      {phase === 'showing' && (
        <div className="text-center">
          <p className="text-lg font-medium text-purple-600 mb-8 animate-pulse">
            Watch the pattern... {showIndex + 1}/{numHighlights}
          </p>
          <div
            className="grid gap-3 max-w-sm mx-auto"
            style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
          >
            {Array.from({ length: config.gridCells }, (_, i) => {
              const isHighlighted = highlighted.has(i)
              const showOrder = highlightArray.indexOf(i)
              const isCurrentlyShowing = isHighlighted && showOrder <= showIndex
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-xl transition-all duration-400 ease-[cubic-bezier(0.25,0.1,0.25,1)] border-2 ${
                    isCurrentlyShowing
                      ? 'bg-purple-400 border-purple-500 shadow-lg shadow-purple-200 scale-110'
                      : 'bg-cream-100 border-cream-200'
                  }`}
                />
              )
            })}
          </div>
        </div>
      )}

      {(phase === 'input' || phase === 'result') && (
        <div className="text-center">
          <p className="text-lg font-medium text-charcoal-700 mb-8">
            {phase === 'input' ? `Tap the ${numHighlights} cells you remember` : 'Checking your pattern...'}
          </p>
          <div
            className="grid gap-3 max-w-sm mx-auto"
            style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
          >
            {Array.from({ length: config.gridCells }, (_, i) => {
              const wasHighlighted = highlighted.has(i)
              const isSelected = userSelected.has(i)
              let cellClass = 'bg-white border-cream-200 hover:bg-purple-50/50 hover:border-purple-300 cursor-pointer'
              if (phase === 'result') {
                if (wasHighlighted && isSelected) cellClass = 'bg-green-100 border-green-400'
                else if (wasHighlighted && !isSelected) cellClass = 'bg-amber-100 border-amber-300'
                else if (!wasHighlighted && isSelected) cellClass = 'bg-red-100 border-red-300'
                else cellClass = 'bg-cream-50 border-cream-200'
              } else if (isSelected) {
                cellClass = 'bg-purple-100 border-purple-400 scale-105 shadow-md'
              }
              return (
                <button
                  key={i}
                  onClick={() => handleCellClick(i)}
                  disabled={phase === 'result'}
                  className={`aspect-square rounded-xl border-2 transition-all duration-400 ease-[cubic-bezier(0.25,0.1,0.25,1)] ease-[cubic-bezier(0.25,0.1,0.25,1)] ${cellClass}`}
                />
              )
            })}
          </div>
          {phase === 'input' && (
            <button
              onClick={handleSubmit}
              disabled={userSelected.size < numHighlights}
              className="btn-primary mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Check Pattern
            </button>
          )}
          {phase === 'result' && (
            <div className="mt-6">
              <p className="text-charcoal-600">
                You found <strong>{correctCount}</strong> of <strong>{numHighlights}</strong> cells correctly!
              </p>
            </div>
          )}
        </div>
      )}

      {phase === 'result' && rounds < 3 && (
        <div className="text-center mt-6">
          <button onClick={initRound} className="btn-primary">Next Round ({rounds + 2}/3)</button>
        </div>
      )}

      {phase === 'gameover' && (
        <div className="text-center mt-8 animate-fade-in">
          <div className="card bg-purple-50 border-purple-200">
            <Trophy className="mx-auto text-amber-500 mb-4" size={48} />
            <h3 className="text-2xl font-bold text-charcoal-800 mb-2">Great Pattern Memory!</h3>
            <p className="text-charcoal-400 mb-4">Average accuracy: {Math.round(totalScore / 3)}%</p>
            <p className="text-sm text-charcoal-400">Pattern recognition strengthens visual-spatial working memory.</p>
          </div>
        </div>
      )}
    </div>
  )
}
