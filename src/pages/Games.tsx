import { useState, useMemo } from 'react'
import { Brain, Eye, Hash, ArrowLeft, Trophy, Sparkles, BarChart3, BookOpen, Grid3X3, Palette, BookMarked } from 'lucide-react'
import { useGameProgress } from '../hooks/useGameProgress'
import { useAuth } from '../hooks/useAuth'
import { getDifficultyFromAssessment, getDifficultyConfig } from '../utils/adaptiveDifficulty'
import type { GameSession, DifficultyLevel } from '../data/models'
import MemoryMatch from '../components/games/MemoryMatch'
import ObjectRecall from '../components/games/ObjectRecall'
import SequenceRecall from '../components/games/SequenceRecall'
import WordAssociation from '../components/games/WordAssociation'
import PatternGrid from '../components/games/PatternGrid'
import StoryRecall from '../components/games/StoryRecall'
import ColorSequence from '../components/games/ColorSequence'

type GameType = 'select' | 'memory-match' | 'object-recall' | 'sequence-recall' | 'word-association' | 'pattern-grid' | 'story-recall' | 'color-sequence'

const GAMES: Record<string, {
  id: GameType
  title: string
  description: string
  icon: typeof Brain
  color: string
}> = {
  'memory-match': {
    id: 'memory-match',
    title: 'Memory Match',
    description: 'Flip cards and find matching pairs. A classic way to exercise memory.',
    icon: Brain,
    color: 'from-forest-400 to-forest-600',
  },
  'object-recall': {
    id: 'object-recall',
    title: 'Object Recall',
    description: 'Study objects briefly, then identify which ones you remember.',
    icon: Eye,
    color: 'from-sage-400 to-sage-600',
  },
  'sequence-recall': {
    id: 'sequence-recall',
    title: 'Sequence Recall',
    description: 'Watch a sequence of items, then reproduce it from memory.',
    icon: Hash,
    color: 'from-amber-400 to-amber-600',
  },
  'word-association': {
    id: 'word-association',
    title: 'Word Association',
    description: 'Memorize related word pairs, then match them from memory.',
    icon: BookOpen,
    color: 'from-blue-400 to-blue-600',
  },
  'pattern-grid': {
    id: 'pattern-grid',
    title: 'Pattern Grid',
    description: 'Watch cells light up in a grid, then recreate the pattern.',
    icon: Grid3X3,
    color: 'from-purple-400 to-purple-600',
  },
  'story-recall': {
    id: 'story-recall',
    title: 'Story Recall',
    description: 'Read a short story, then answer questions about the details.',
    icon: BookMarked,
    color: 'from-amber-500 to-orange-600',
  },
  'color-sequence': {
    id: 'color-sequence',
    title: 'Color Sequence',
    description: 'Watch colors light up in order, then reproduce the pattern.',
    icon: Palette,
    color: 'from-pink-400 to-pink-600',
  },
}

const GAME_LIST = Object.values(GAMES)

const LEVEL_LABELS: Record<string, string> = {
  'mild': 'Mild — Good cognitive baseline',
  'moderate': 'Moderate — Some areas need gentle practice',
  'significant': 'Significant — Starting with supportive activities',
}

const LEVEL_COLORS: Record<string, string> = {
  'mild': 'text-forest-600 bg-forest-50',
  'moderate': 'text-amber-600 bg-amber-50',
  'significant': 'text-sage-600 bg-sage-50',
}

export default function Games() {
  const [activeGame, setActiveGame] = useState<GameType>('select')
  const { getAverageAccuracy, sessions } = useGameProgress()
  const { user } = useAuth()
  const assessment = user?.assessmentResult

  // Starting difficulty based on assessment
  const initialDifficulty: DifficultyLevel = useMemo(() => {
    if (!assessment) return 'easy'
    return getDifficultyFromAssessment(assessment)
  }, [assessment])

  // Overall difficulty based on session history
  const currentDifficulty: DifficultyLevel = useMemo(() => {
    if (sessions.length < 3) return initialDifficulty
    const avg = getAverageAccuracy()
    if (avg > 85) return 'hard'
    if (avg >= 60) return 'moderate'
    return 'easy'
  }, [sessions, initialDifficulty, getAverageAccuracy])

  const handleComplete = (session: GameSession) => {
    console.log('Game session completed:', session)
  }

  // Sort games: recommended ones first based on assessment
  const sortedGames = useMemo(() => {
    if (!assessment) return GAME_LIST
    const recommended = assessment.recommendedGames
    return [...GAME_LIST].sort((a, b) => {
      const aIdx = recommended.indexOf(a.id)
      const bIdx = recommended.indexOf(b.id)
      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx)
    })
  }, [assessment])

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

            {/* Assessment profile card */}
            {assessment && (
              <div className="card p-5 mb-6 bg-white/70">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center">
                    <BarChart3 size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-800 text-sm">Your Cognitive Profile</h3>
                    <p className="text-xs text-charcoal-400">Based on your initial assessment</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  <div className="bg-forest-50/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-charcoal-400 mb-1">Overall</p>
                    <p className="text-lg font-bold text-forest-600">{assessment.overallScore}%</p>
                  </div>
                  <div className="bg-forest-50/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-charcoal-400 mb-1">Memory</p>
                    <p className="text-lg font-bold text-forest-600">{assessment.memoryScore}%</p>
                  </div>
                  <div className="bg-amber-50/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-charcoal-400 mb-1">Sequence</p>
                    <p className="text-lg font-bold text-amber-600">{assessment.sequenceScore}%</p>
                  </div>
                  <div className="bg-sage-50/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-charcoal-400 mb-1">Focus</p>
                    <p className="text-lg font-bold text-sage-600">{assessment.focusScore}%</p>
                  </div>
                  <div className="bg-forest-50/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-charcoal-400 mb-1">Words</p>
                    <p className="text-lg font-bold text-forest-600">{assessment.wordScore}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${LEVEL_COLORS[assessment.level]}`}>
                    {LEVEL_LABELS[assessment.level]}
                  </span>
                  <span className="text-xs text-charcoal-400">
                    · Starting difficulty: <span className="font-medium capitalize">{initialDifficulty}</span>
                  </span>
                </div>
              </div>
            )}

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
                    <p className="text-2xl font-bold text-forest-600 capitalize">{currentDifficulty}</p>
                    <p className="text-sm text-charcoal-400">Current Level</p>
                  </div>
                </div>
              </div>
            )}

            {/* Game cards */}
            <div className="grid gap-6">
              {sortedGames.map((game, i) => {
                const isRecommended = assessment?.recommendedGames[0] === game.id
                return (
                  <button
                    key={game.id}
                    onClick={() => setActiveGame(game.id)}
                    className="card-hover flex items-center gap-6 text-left group relative"
                  >
                    {isRecommended && (
                      <div className="absolute -top-2 -right-2 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                        <Sparkles size={10} /> Recommended
                      </div>
                    )}
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
                )
              })}
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
                  {GAMES[activeGame]?.title}
                </h2>
                <p className="text-charcoal-400 text-sm">
                  Difficulty: <span className="font-medium capitalize">{currentDifficulty}</span> · AI-adaptive
                </p>
              </div>
            </div>

            {/* Game */}
            <div className="card p-6 md:p-8">
              {activeGame === 'memory-match' && <MemoryMatch onComplete={handleComplete} />}
              {activeGame === 'object-recall' && <ObjectRecall onComplete={handleComplete} />}
              {activeGame === 'sequence-recall' && <SequenceRecall onComplete={handleComplete} />}
              {activeGame === 'word-association' && <WordAssociation onComplete={handleComplete} />}
              {activeGame === 'pattern-grid' && <PatternGrid onComplete={handleComplete} />}
              {activeGame === 'story-recall' && <StoryRecall onComplete={handleComplete} />}
              {activeGame === 'color-sequence' && <ColorSequence onComplete={handleComplete} />}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
