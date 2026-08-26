import { useState } from 'react'
import { Brain, Eye, Hash, ArrowLeft, Trophy } from 'lucide-react'
import { useGameProgress } from '../hooks/useGameProgress'
import type { GameSession } from '../data/models'
import MemoryMatch from '../components/games/MemoryMatch'
import ObjectRecall from '../components/games/ObjectRecall'
import SequenceRecall from '../components/games/SequenceRecall'

type GameType = 'select' | 'memory-match' | 'object-recall' | 'sequence-recall'

const GAMES = [
  {
    id: 'memory-match' as const,
    title: 'Memory Match',
    description: 'Flip cards and find matching pairs. A classic way to exercise memory.',
    icon: Brain,
    color: 'from-forest-400 to-forest-600',
  },
  {
    id: 'object-recall' as const,
    title: 'Object Recall',
    description: 'Study objects briefly, then identify which ones you remember.',
    icon: Eye,
    color: 'from-sage-400 to-sage-600',
  },
  {
    id: 'sequence-recall' as const,
    title: 'Sequence Recall',
    description: 'Watch a sequence of items, then reproduce it from memory.',
    icon: Hash,
    color: 'from-amber-400 to-amber-600',
  },
]

export default function Games() {
  const [activeGame, setActiveGame] = useState<GameType>('select')
  const { getAverageAccuracy, sessions } = useGameProgress()

  const handleComplete = (session: GameSession) => {
    // Session is saved via hook
    console.log('Game session completed:', session)
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {activeGame === 'select' ? (
          <>
            <div className="text-center mb-12">
              <h1 className="section-heading mb-4">
                Cognitive <span className="text-gradient">Games</span>
              </h1>
              <p className="section-subheading mx-auto">
                Choose an activity to engage your mind. Each game gently adapts to your pace.
              </p>
            </div>

            {/* Overall stats */}
            {sessions.length > 0 && (
              <div className="card bg-forest-50 border-forest-200 mb-12">
                <div className="flex items-center gap-3 mb-3">
                  <Trophy size={20} className="text-forest-500" />
                  <h3 className="font-semibold text-charcoal-800">Your Progress</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-forest-600">{getAverageAccuracy()}%</p>
                    <p className="text-sm text-charcoal-400">Overall Accuracy</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-forest-600">{sessions.length}</p>
                    <p className="text-sm text-charcoal-400">Games Played</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-forest-600">{getAverageAccuracy('memory-match')}%</p>
                    <p className="text-sm text-charcoal-400">Memory Match</p>
                  </div>
                </div>
              </div>
            )}

            {/* Game cards */}
            <div className="grid gap-6">
              {GAMES.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setActiveGame(game.id)}
                  className="card-hover flex items-center gap-6 text-left group"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <game.icon className="text-white" size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-charcoal-800 group-hover:text-forest-600 transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-charcoal-400">{game.description}</p>
                  </div>
                  <div className="text-charcoal-300 group-hover:text-forest-500 transition-colors">
                    →
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Game header */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => setActiveGame('select')}
                className="btn-ghost !p-2 rounded-xl"
                aria-label="Back to game selection"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-charcoal-800">
                  {GAMES.find(g => g.id === activeGame)?.title}
                </h2>
                <p className="text-charcoal-400 text-sm">
                  AI-assisted difficulty adapts to your performance
                </p>
              </div>
            </div>

            {/* Game */}
            <div className="card p-6 md:p-8">
              {activeGame === 'memory-match' && <MemoryMatch onComplete={handleComplete} />}
              {activeGame === 'object-recall' && <ObjectRecall onComplete={handleComplete} />}
              {activeGame === 'sequence-recall' && <SequenceRecall onComplete={handleComplete} />}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
