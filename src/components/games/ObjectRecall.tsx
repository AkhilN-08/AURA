import { useState, useEffect, useCallback, useRef } from 'react'
import { RotateCcw, Trophy, Clock, Eye } from 'lucide-react'
import { GAME_OBJECTS } from '../../data/games'
import { useGameProgress } from '../../hooks/useGameProgress'
import { calculateDifficulty, getDifficultyConfig } from '../../utils/adaptiveDifficulty'
import type { GameSession } from '../../data/models'

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

interface ObjectRecallProps {
  onComplete?: (session: GameSession) => void
}

export default function ObjectRecall({ onComplete }: ObjectRecallProps) {
  const { getAverageAccuracy } = useGameProgress()
  const lastAccuracy = useRef(getAverageAccuracy('object-recall'))
  const difficulty = calculateDifficulty(lastAccuracy.current || 75)
  const config = getDifficultyConfig(difficulty)

  const [phase, setPhase] = useState<'ready' | 'showing' | 'recall' | 'result'>('ready')
  const [targetObjects, setTargetObjects] = useState<typeof GAME_OBJECTS>([])
  const [allObjects, setAllObjects] = useState<typeof GAME_OBJECTS>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [correctIds, setCorrectIds] = useState<string[]>([])
  const [elapsed, setElapsed] = useState(0)
  const [rounds, setRounds] = useState(0)
  const [totalScore, setTotalScore] = useState(0)

  const initRound = useCallback(() => {
    const shuffled = shuffle(GAME_OBJECTS)
    const targets = shuffled.slice(0, config.objects)
    const distractors = shuffle(
      GAME_OBJECTS.filter(o => !targets.find(t => t.id === o.id))
    ).slice(0, config.distractors)
    const all = shuffle([...targets, ...distractors])

    setTargetObjects(targets)
    setAllObjects(all)
    setSelectedIds([])
    setCorrectIds([])
    setPhase('showing')

    setTimeout(() => setPhase('recall'), config.displayTime)
  }, [config])

  const startGame = () => {
    setRounds(0)
    setTotalScore(0)
    setElapsed(0)
    initRound()
  }

  useEffect(() => {
    if (phase !== 'showing' && phase !== 'recall') return
    const interval = setInterval(() => {
      setElapsed(e => e + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [phase])

  const handleSelect = (id: string) => {
    if (phase !== 'recall') return
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = () => {
    if (selectedIds.length === 0) return

    const correct = selectedIds.filter(id => targetObjects.find(t => t.id === id))
    const missed = targetObjects.filter(t => !selectedIds.includes(t.id))

    setCorrectIds([...correct, ...missed.map(m => m.id)])
    setPhase('result')

    const accuracy = Math.round((correct.length / targetObjects.length) * 100)
    const newTotalScore = totalScore + accuracy
    const newRounds = rounds + 1
    setRounds(newRounds)
    setTotalScore(newTotalScore)

    if (newRounds >= 3) {
      const session: GameSession = {
        gameType: 'object-recall',
        score: Math.round(newTotalScore / newRounds),
        accuracy: Math.round(newTotalScore / newRounds),
        duration: elapsed,
        timestamp: new Date().toISOString(),
        difficulty,
      }
      onComplete?.(session)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stats */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-charcoal-500">
            <Eye size={18} />
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
          <div className="text-6xl mb-6">👁️</div>
          <h3 className="text-2xl font-bold text-charcoal-800 mb-3">Remember the Objects</h3>
          <p className="text-charcoal-400 mb-8 max-w-md mx-auto">
            You'll see {config.objects} objects for a moment. Then tell us which ones you remember.
          </p>
          <button onClick={startGame} className="btn-primary">
            Start Round 1
          </button>
        </div>
      )}

      {phase === 'showing' && (
        <div className="text-center">
          <p className="text-lg font-medium text-sage-600 mb-8 animate-pulse">
            Remember these objects...
          </p>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {targetObjects.map((obj) => (
              <div key={obj.id} className="card text-center py-6 animate-fade-in">
                <div className="text-4xl mb-2">{obj.emoji}</div>
                <p className="text-sm text-charcoal-500">{obj.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'recall' && (
        <div className="text-center">
          <p className="text-lg font-medium text-charcoal-700 mb-2">
            Which objects did you see?
          </p>
          <p className="text-sm text-charcoal-400 mb-8">
            Select {config.objects} objects you remember
          </p>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-8">
            {allObjects.map((obj) => {
              const isSelected = selectedIds.includes(obj.id)
              return (
                <button
                  key={obj.id}
                  onClick={() => handleSelect(obj.id)}
                  className={`card text-center py-6 transition-all duration-200
                    ${isSelected ? 'ring-2 ring-forest-500 bg-sage-50 scale-105' : 'hover:bg-cream-50'}
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400`}
                >
                  <div className="text-4xl mb-2">{obj.emoji}</div>
                  <p className="text-sm text-charcoal-500">{obj.label}</p>
                </button>
              )
            })}
          </div>
          <button
            onClick={handleSubmit}
            disabled={selectedIds.length === 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check My Answer
          </button>
        </div>
      )}

      {phase === 'result' && (
        <div className="text-center">
          <p className="text-lg font-medium text-charcoal-700 mb-8">Here's what you remembered:</p>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-8">
            {allObjects.map((obj) => {
              const wasTarget = targetObjects.find(t => t.id === obj.id)
              const wasSelected = selectedIds.includes(obj.id)
              let borderColor = 'border-cream-200'
              if (wasTarget && wasSelected) borderColor = 'border-green-400 bg-green-50'
              else if (wasTarget && !wasSelected) borderColor = 'border-amber-400 bg-amber-50'
              else if (!wasTarget && wasSelected) borderColor = 'border-red-300 bg-red-50'

              return (
                <div key={obj.id} className={`card text-center py-6 border-2 ${borderColor}`}>
                  <div className="text-4xl mb-2">{obj.emoji}</div>
                  <p className="text-sm text-charcoal-500">{obj.label}</p>
                  {wasTarget && wasSelected && <p className="text-xs text-green-600 mt-1">✓ Correct</p>}
                  {wasTarget && !wasSelected && <p className="text-xs text-amber-600 mt-1">Missed</p>}
                  {!wasTarget && wasSelected && <p className="text-xs text-red-500 mt-1">Not shown</p>}
                </div>
              )
            })}
          </div>
          <div className="card bg-cream-50 mb-8">
            <p className="text-charcoal-600">
              You recalled <strong>{targetObjects.filter(t => selectedIds.includes(t.id)).length}</strong> of{' '}
              <strong>{targetObjects.length}</strong> objects correctly.
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
