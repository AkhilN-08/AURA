import { useState, useEffect, useCallback, useRef } from 'react'
import { RotateCcw, Trophy, Clock, BookOpen } from 'lucide-react'
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

const WORD_PAIRS: [string, string][] = [
  ['Bamboo', 'Forest'], ['Mountain', 'Cloud'], ['Tea', 'Kettle'], ['River', 'Fish'],
  ['Sunrise', 'Morning'], ['Drum', 'Music'], ['Lantern', 'Festival'], ['Boat', 'River'],
  ['Orchid', 'Garden'], ['Rain', 'Umbrella'], ['Rice', 'Field'], ['Spice', 'Kitchen'],
  ['Bridge', 'Crossing'], ['Bird', 'Nest'], ['Mango', 'Summer'], ['Weave', 'Cloth'],
  ['Lotus', 'Pond'], ['Moon', 'Night'], ['Fire', 'Warmth'], ['Stone', 'River'],
  ['Wind', 'Sway'], ['Snow', 'Mountain'], ['Earth', 'Growth'], ['Sky', 'Blue'],
  ['Flower', 'Bloom'], ['Tree', 'Root'], ['Light', 'Glow'], ['Song', 'Voice'],
]

interface WordAssociationProps {
  onComplete?: (session: GameSession) => void
}

export default function WordAssociation({ onComplete }: WordAssociationProps) {
  const { getAverageAccuracy } = useGameProgress()
  const lastAccuracy = useRef(getAverageAccuracy('word-association'))
  const difficulty = calculateDifficulty(lastAccuracy.current || 75)
  const config = getDifficultyConfig(difficulty)

  const [phase, setPhase] = useState<'ready' | 'memorize' | 'match' | 'result' | 'gameover'>('ready')
  const [pairs, setPairs] = useState<[string, string][]>([])
  const [shuffledLeft, setShuffledLeft] = useState<string[]>([])
  const [shuffledRight, setShuffledRight] = useState<string[]>([])
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [matches, setMatches] = useState<Map<string, string>>(new Map())
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null)
  const [rounds, setRounds] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [correctThisRound, setCorrectThisRound] = useState(0)

  const initRound = useCallback(() => {
    const selected = shuffle(WORD_PAIRS).slice(0, config.wordPairs)
    setPairs(selected)
    setShuffledLeft(shuffle(selected.map(p => p[0])))
    setShuffledRight(shuffle(selected.map(p => p[1])))
    setSelectedLeft(null)
    setMatches(new Map())
    setWrongPair(null)
    setCorrectThisRound(0)
    setPhase('memorize')

    setTimeout(() => setPhase('match'), 3000)
  }, [config.wordPairs])

  const startGame = () => { setRounds(0); setTotalScore(0); setElapsed(0); initRound() }

  useEffect(() => {
    if (phase !== 'memorize' && phase !== 'match') return
    const interval = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(interval)
  }, [phase])

  const handleLeftClick = (word: string) => {
    if (phase !== 'match' || matches.has(word)) return
    setSelectedLeft(word)
  }

  const handleRightClick = (word: string) => {
    if (phase !== 'match' || !selectedLeft) return

    const pair = pairs.find(p => p[0] === selectedLeft)
    if (pair && pair[1] === word) {
      const newMatches = new Map(matches)
      newMatches.set(selectedLeft, word)
      setMatches(newMatches)
      setSelectedLeft(null)
      setCorrectThisRound(c => c + 1)

      if (newMatches.size === pairs.length) {
        const accuracy = Math.round((correctThisRound + 1) / pairs.length * 100)
        const newTotal = totalScore + accuracy
        const newRounds = rounds + 1
        setRounds(newRounds)
        setTotalScore(newTotal)
        setPhase('result')

        if (newRounds >= 3) {
          setTimeout(() => {
            onComplete?.({
              gameType: 'word-association',
              score: Math.round(newTotal / newRounds),
              accuracy: Math.round(newTotal / newRounds),
              duration: elapsed,
              timestamp: new Date().toISOString(),
              difficulty,
            })
            setPhase('gameover')
          }, 1500)
        }
      }
    } else {
      setWrongPair([selectedLeft, word])
      setSelectedLeft(null)
      setTimeout(() => setWrongPair(null), 800)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-charcoal-500">
            <BookOpen size={18} />
            <span className="font-medium">Round {rounds + 1}/3</span>
          </div>
          <div className="flex items-center gap-2 text-charcoal-500">
            <RotateCcw size={18} />
            <span className="font-medium">{matches.size}/{pairs.length} matched</span>
          </div>
          <div className="flex items-center gap-2 text-charcoal-500">
            <Clock size={18} />
            <span className="font-medium">{elapsed}s</span>
          </div>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-xl">
          <span className="text-sm font-medium text-blue-600">{difficulty} mode</span>
        </div>
      </div>

      {phase === 'ready' && (
        <div className="text-center py-16">
          <div className="text-6xl mb-6">📖</div>
          <h3 className="text-2xl font-bold text-charcoal-800 mb-3">Word Association</h3>
          <p className="text-charcoal-400 mb-8 max-w-md mx-auto">
            Study the related word pairs for a moment, then match each left word to its partner on the right.
          </p>
          <button onClick={startGame} className="btn-primary">Start Round 1</button>
        </div>
      )}

      {phase === 'memorize' && (
        <div className="text-center">
          <p className="text-lg font-medium text-blue-600 mb-8 animate-pulse">Memorize these word pairs...</p>
          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
            {pairs.map(([left, right], i) => (
              <div key={i} className="card text-center py-4 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <span className="text-lg font-semibold text-charcoal-700">{left}</span>
                <span className="mx-2 text-blue-400">↔</span>
                <span className="text-lg font-semibold text-blue-600">{right}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(phase === 'match' || phase === 'result') && (
        <div className="text-center">
          <p className="text-lg font-medium text-charcoal-700 mb-8">Match each word to its pair</p>
          <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto">
            {/* Left column */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wide mb-2">Words</p>
              {shuffledLeft.map(word => {
                const isMatched = [...matches.keys()].includes(word)
                const isSelected = selectedLeft === word
                const isWrong = wrongPair?.[0] === word
                return (
                  <button
                    key={word}
                    onClick={() => handleLeftClick(word)}
                    disabled={isMatched || phase === 'result'}
                    className={`w-full py-3 px-4 rounded-xl text-base font-semibold transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ease-[cubic-bezier(0.34,1.56,0.64,1)] border-2
                      ${isMatched ? 'bg-green-50 border-green-300 text-green-700 cursor-default' :
                        isSelected ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-md scale-105' :
                        isWrong ? 'bg-red-50 border-red-300 text-red-600 animate-shake' :
                        'bg-white border-cream-200 text-charcoal-700 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer'}`}
                  >
                    {word}
                  </button>
                )
              })}
            </div>
            {/* Right column */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wide mb-2">Pairs</p>
              {shuffledRight.map(word => {
                const isMatched = [...matches.values()].includes(word)
                const isWrong = wrongPair?.[1] === word
                return (
                  <button
                    key={word}
                    onClick={() => handleRightClick(word)}
                    disabled={isMatched || phase === 'result'}
                    className={`w-full py-3 px-4 rounded-xl text-base font-semibold transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ease-[cubic-bezier(0.34,1.56,0.64,1)] border-2
                      ${isMatched ? 'bg-green-50 border-green-300 text-green-700 cursor-default' :
                        isWrong ? 'bg-red-50 border-red-300 text-red-600 animate-shake' :
                        'bg-white border-cream-200 text-charcoal-700 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer'}`}
                  >
                    {word}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {phase === 'result' && rounds < 3 && (
        <div className="text-center mt-8">
          <div className="card bg-blue-50 mb-6">
            <p className="text-charcoal-700">
              You matched <strong>{correctThisRound}</strong> of <strong>{pairs.length}</strong> pairs correctly!
            </p>
          </div>
          <button onClick={initRound} className="btn-primary">Next Round ({rounds + 2}/3)</button>
        </div>
      )}

      {phase === 'gameover' && (
        <div className="text-center mt-8 animate-fade-in">
          <div className="card bg-blue-50 border-blue-200">
            <Trophy className="mx-auto text-amber-500 mb-4" size={48} />
            <h3 className="text-2xl font-bold text-charcoal-800 mb-2">Excellent Work!</h3>
            <p className="text-charcoal-400 mb-4">Average accuracy: {Math.round(totalScore / 3)}%</p>
            <p className="text-sm text-charcoal-400">Word association strengthens verbal memory and logical connections.</p>
          </div>
        </div>
      )}
    </div>
  )
}
