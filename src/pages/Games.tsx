import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Eye, Hash, ArrowLeft, Trophy, Sparkles, BookOpen, Grid3X3, Palette, BookMarked, RotateCcw, Play } from 'lucide-react'
import { useGameProgress } from '../hooks/useGameProgress'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { getDifficultyFromAssessment } from '../utils/adaptiveDifficulty'
import { playTapSound } from '../utils/audio'
import type { GameSession, DifficultyLevel } from '../data/models'
import MemoryMatch from '../components/games/MemoryMatch'
import ObjectRecall from '../components/games/ObjectRecall'
import SequenceRecall from '../components/games/SequenceRecall'
import WordAssociation from '../components/games/WordAssociation'
import PatternGrid from '../components/games/PatternGrid'
import StoryRecall from '../components/games/StoryRecall'
import ColorSequence from '../components/games/ColorSequence'

type GameType = 'select' | 'memory-match' | 'object-recall' | 'sequence-recall' | 'word-association' | 'pattern-grid' | 'story-recall' | 'color-sequence'

const GAMES_RAW: Record<string, {
  id: GameType
  titleKey: string
  descKey: string
  icon: typeof Brain
  color: string
}> = {
  'memory-match': {
    id: 'memory-match',
    titleKey: 'Memory Match',
    descKey: 'Flip cards and find matching pairs. A classic way to exercise memory.',
    icon: Brain,
    color: 'from-sage-400 to-sage-600',
  },
  'object-recall': {
    id: 'object-recall',
    titleKey: 'Object Recall',
    descKey: 'Study objects briefly, then identify which ones you remember.',
    icon: Eye,
    color: 'from-sage-400 to-sage-600',
  },
  'sequence-recall': {
    id: 'sequence-recall',
    titleKey: 'Sequence Recall',
    descKey: 'Watch a sequence of items, then reproduce it from memory.',
    icon: Hash,
    color: 'from-amber-400 to-amber-600',
  },
  'word-association': {
    id: 'word-association',
    titleKey: 'Word Association',
    descKey: 'Memorize related word pairs, then match them from memory.',
    icon: BookOpen,
    color: 'from-sage-400 to-sage-600',
  },
  'pattern-grid': {
    id: 'pattern-grid',
    titleKey: 'Pattern Grid',
    descKey: 'Watch cells light up in a grid, then recreate the pattern.',
    icon: Grid3X3,
    color: 'from-purple-400 to-purple-600',
  },
  'story-recall': {
    id: 'story-recall',
    titleKey: 'Story Recall',
    descKey: 'Read a short story, then answer questions about the details.',
    icon: BookMarked,
    color: 'from-amber-500 to-orange-600',
  },
  'color-sequence': {
    id: 'color-sequence',
    titleKey: 'Color Sequence',
    descKey: 'Watch colors light up in order, then reproduce the pattern.',
    icon: Palette,
    color: 'from-pink-400 to-pink-600',
  },
}

const LEVEL_LABELS: Record<string, string> = {
  'mild': 'Mild — Good cognitive baseline',
  'moderate': 'Moderate — Some areas need gentle practice',
  'significant': 'Significant — Starting with supportive activities',
}

const LEVEL_COLORS: Record<string, string> = {
  'mild': 'text-sage-600 bg-sage-50',
  'moderate': 'text-amber-600 bg-amber-50',
  'significant': 'text-sage-600 bg-sage-50',
}

export default function Games() {
  const navigate = useNavigate()
  const [activeGame, setActiveGame] = useState<GameType>('select')
  const { getAverageAccuracy, sessions } = useGameProgress()
  const { user, retakeAssessment } = useAuth()
  const { t } = useTranslation()

  const GAMES = Object.fromEntries(
    Object.entries(GAMES_RAW).map(([key, val]) => [key, { ...val, title: t(val.titleKey), description: t(val.descKey) }])
  )
  const GAME_LIST = Object.values(GAMES)

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







            {/* Today's Game - Big Button */}
            <div className="mb-8">
              {sortedGames[0] && (
                <button
                  onClick={() => { playTapSound(); setActiveGame(sortedGames[0].id) }}
                  className="w-full card-hover flex items-center gap-6 text-left group bg-gradient-to-br from-sage-50 to-sage-100/80 border-sage-200/60"
                >
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${sortedGames[0].color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                    {(() => { const Icon = sortedGames[0].icon; return <Icon className="text-white" size={36} /> })()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles size={14} className="text-amber-500" />
                      <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Today's Game</span>
                    </div>
                    <h3 className="text-2xl font-bold text-charcoal-800 mb-1">
                      {sortedGames[0].title}
                    </h3>
                    <p className="text-charcoal-400">{sortedGames[0].description}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-sage-500 text-white px-5 py-3 rounded-xl font-semibold group-hover:bg-sage-600 transition-colors">
                    <Play size={20} /> Play
                  </div>
                </button>
              )}
            </div>

            {/* Other Games */}
            {sortedGames.length > 1 && (
              <>
                <h3 className="text-sm font-semibold text-charcoal-500 uppercase tracking-wider mb-4">More Games</h3>
                <div className="grid gap-4">
                  {sortedGames.slice(1, 4).map((game) => (
                    <button
                      key={game.id}
                      onClick={() => { playTapSound(); setActiveGame(game.id) }}
                      className="card-hover flex items-center gap-5 text-left group"
                    >
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                        <game.icon className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-charcoal-800">
                          {game.title}
                        </h3>
                        <p className="text-sm text-charcoal-400 line-clamp-1">{game.description}</p>
                      </div>
                      <div className="text-charcoal-300 group-hover:text-sage-500 transition-colors">
                        →
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
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
