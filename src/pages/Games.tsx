import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles, Play, TrendingUp, Target, Heart, ArrowRight } from 'lucide-react'
import { useGameProgress } from '../hooks/useGameProgress'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { getRecommendation, getCategoryScores } from '../utils/adaptiveEngine'
import { playTapSound } from '../utils/audio'
import type { GameSession, GameType, GameCategory } from '../data/models'
import { GAME_TYPES } from '../data/models'
import MemoryMatch from '../components/games/MemoryMatch'
import ObjectRecall from '../components/games/ObjectRecall'
import SequenceRecall from '../components/games/SequenceRecall'
import WordAssociation from '../components/games/WordAssociation'
import PatternGrid from '../components/games/PatternGrid'
import StoryRecall from '../components/games/StoryRecall'
import ColorSequence from '../components/games/ColorSequence'
import MemoryLane from '../components/games/MemoryLane'
import MemoryReplay from '../components/games/MemoryReplay'
import ForgetTeachRetest from '../components/games/ForgetTeachRetest'
import RoutineDeviation from '../components/games/RoutineDeviation'
import MyPlaceMemories from '../components/games/MyPlaceMemories'
import PatternRecall from '../components/games/PatternRecall'
import WhatChanged from '../components/games/WhatChanged'
import MemorySequence from '../components/games/MemorySequence'
import MemoryStory from '../components/games/MemoryStory'

type SelectType = 'select' | GameType

interface GameDef {
  id: GameType
  titleKey: string
  descKey: string
  icon: typeof Brain
  color: string   // gradient for icon tile
  accent: string  // text/border accent
}

import { Brain, Eye, Hash, BookOpen, Grid3X3, Palette, BookMarked, Camera, Sprout, Clock, MapPin, LayoutGrid, Search, Bell, Feather, Leaf } from 'lucide-react'

const GAMES_RAW: Record<GameType, GameDef> = {
  // ── original games ──
  'memory-match': {
    id: 'memory-match', titleKey: 'Memory Match',
    descKey: 'Flip cards and find matching pairs. A classic way to exercise memory.',
    icon: Brain, color: 'from-sage-400 to-sage-600', accent: 'text-sage-500',
  },
  'object-recall': {
    id: 'object-recall', titleKey: 'Object Recall',
    descKey: 'Study familiar objects briefly, then recall what you saw.',
    icon: Eye, color: 'from-amber-400 to-amber-600', accent: 'text-amber-500',
  },
  'sequence-recall': {
    id: 'sequence-recall', titleKey: 'Sequence Recall',
    descKey: 'Watch a sequence of daily tasks, then put them back in order.',
    icon: Hash, color: 'from-sky-400 to-sky-600', accent: 'text-sky-500',
  },
  'word-association': {
    id: 'word-association', titleKey: 'Word Association',
    descKey: 'Memorize related word pairs, then match them from memory.',
    icon: BookOpen, color: 'from-sage-400 to-sage-600', accent: 'text-sage-500',
  },
  'pattern-grid': {
    id: 'pattern-grid', titleKey: 'Pattern Grid',
    descKey: 'Watch cells light up in a grid, then recreate the pattern.',
    icon: Grid3X3, color: 'from-purple-400 to-purple-600', accent: 'text-purple-500',
  },
  'story-recall': {
    id: 'story-recall', titleKey: 'Story Recall',
    descKey: 'Read a short story, then answer questions about the details.',
    icon: BookMarked, color: 'from-amber-500 to-orange-600', accent: 'text-amber-500',
  },
  'color-sequence': {
    id: 'color-sequence', titleKey: 'Color Sequence',
    descKey: 'Watch colors light up in order, then reproduce the pattern.',
    icon: Palette, color: 'from-pink-400 to-pink-600', accent: 'text-pink-500',
  },
  'memory-lane': {
    id: 'memory-lane', titleKey: 'Memory Lane',
    descKey: 'Remember little moments from your life — people, places, foods, and warm routines.',
    icon: Leaf, color: 'from-amber-400 to-amber-600', accent: 'text-amber-500',
  },
  // ── new experiences ──
  'memory-replay': {
    id: 'memory-replay', titleKey: 'Memory Replay',
    descKey: 'Revisit a familiar memory album, then answer gentle questions about it.',
    icon: Camera, color: 'from-amber-400 to-orange-500', accent: 'text-amber-600',
  },
  'forget-teach-retest': {
    id: 'forget-teach-retest', titleKey: 'Remember & Relearn',
    descKey: 'A learning cycle — if a name slips away, AURA teaches it and you try again.',
    icon: Sprout, color: 'from-emerald-400 to-emerald-600', accent: 'text-emerald-600',
  },
  'routine-deviation': {
    id: 'routine-deviation', titleKey: 'Routine Spotter',
    descKey: 'Spot the small change in a familiar daily routine — like a gentle game of differences.',
    icon: Clock, color: 'from-violet-400 to-violet-600', accent: 'text-violet-500',
  },
  'my-place-memories': {
    id: 'my-place-memories', titleKey: 'My Place, My Memories',
    descKey: 'A little journey through familiar places — each one shares its memory with you.',
    icon: MapPin, color: 'from-teal-400 to-teal-600', accent: 'text-teal-600',
  },
  'pattern-recall': {
    id: 'pattern-recall', titleKey: 'Pattern Recall',
    descKey: 'A calm color-pattern game that grows with you, one level at a time.',
    icon: LayoutGrid, color: 'from-slate-400 to-slate-600', accent: 'text-slate-600',
  },
  'what-changed': {
    id: 'what-changed', titleKey: 'What Changed?',
    descKey: 'Look at a familiar room — something small changes. Can you tell what?',
    icon: Search, color: 'from-orange-400 to-orange-600', accent: 'text-orange-500',
  },
  'memory-sequence': {
    id: 'memory-sequence', titleKey: 'Memory Sequence',
    descKey: 'A listening game with big, friendly buttons — bells, claps, and chimes.',
    icon: Bell, color: 'from-sky-400 to-blue-500', accent: 'text-sky-500',
  },
  'memory-story': {
    id: 'memory-story', titleKey: 'Memory Story',
    descKey: 'A short story drawn from your own memories, read aloud page by page.',
    icon: Feather, color: 'from-rose-400 to-rose-600', accent: 'text-rose-500',
  },
}

// ── Category organization ───────────────────────────────────────

const CATEGORIES: { id: GameCategory; title: string; blurb: string; ring: string; games: GameType[] }[] = [
  {
    id: 'memory', title: 'Memory', ring: 'text-amber-600 bg-amber-50',
    blurb: 'Hold on to what you see — objects, albums, and stories.',
    games: ['object-recall', 'memory-replay', 'memory-story', 'pattern-recall', 'story-recall'],
  },
  {
    id: 'routine', title: 'Routine & Daily Life', ring: 'text-violet-600 bg-violet-50',
    blurb: 'The gentle rhythm of everyday life.',
    games: ['sequence-recall', 'memory-lane', 'routine-deviation'],
  },
  {
    id: 'recognition', title: 'Recognition & Association', ring: 'text-teal-600 bg-teal-50',
    blurb: 'Faces, places, and the connections between them.',
    games: ['memory-match', 'word-association', 'forget-teach-retest', 'my-place-memories', 'what-changed'],
  },
  {
    id: 'attention', title: 'Attention & Sequence', ring: 'text-sky-600 bg-sky-50',
    blurb: 'Light, focused exercises for a steady, sharp mind.',
    games: ['pattern-grid', 'color-sequence', 'memory-sequence'],
  },
]

export default function Games() {
  const [activeGame, setActiveGame] = useState<SelectType>('select')
  const { sessions, addSession } = useGameProgress()
  const { user } = useAuth()
  const { t } = useTranslation()

  const handleComplete = (session: GameSession) => {
    addSession(session)
  }

  const recommendation = useMemo(() => getRecommendation(sessions), [sessions])
  const categoryScores = useMemo(() => getCategoryScores(sessions), [sessions])
  const recDef = GAMES_RAW[recommendation.game]

  const openGame = (id: GameType) => { playTapSound(); setActiveGame(id) }

  // ── In-game view ──
  if (activeGame !== 'select') {
    const def = GAMES_RAW[activeGame as GameType]
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => { playTapSound(); setActiveGame('select') }}
              className="btn-ghost !p-2 rounded-xl"
              aria-label="Back to game selection"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-charcoal-800 dark:text-white">{t(def.titleKey)}</h2>
              <p className="text-charcoal-400 text-sm">We'll keep things comfortable for you as you play.</p>
            </div>
          </div>
          <div className="card p-6 md:p-8">
            {activeGame === 'memory-match' && <MemoryMatch onComplete={handleComplete} />}
            {activeGame === 'object-recall' && <ObjectRecall onComplete={handleComplete} />}
            {activeGame === 'sequence-recall' && <SequenceRecall onComplete={handleComplete} />}
            {activeGame === 'word-association' && <WordAssociation onComplete={handleComplete} />}
            {activeGame === 'pattern-grid' && <PatternGrid onComplete={handleComplete} />}
            {activeGame === 'story-recall' && <StoryRecall onComplete={handleComplete} />}
            {activeGame === 'color-sequence' && <ColorSequence onComplete={handleComplete} />}
            {activeGame === 'memory-lane' && <MemoryLane onComplete={handleComplete} />}
            {activeGame === 'memory-replay' && <MemoryReplay onComplete={handleComplete} />}
            {activeGame === 'forget-teach-retest' && <ForgetTeachRetest onComplete={handleComplete} />}
            {activeGame === 'routine-deviation' && <RoutineDeviation onComplete={handleComplete} />}
            {activeGame === 'my-place-memories' && <MyPlaceMemories onComplete={handleComplete} />}
            {activeGame === 'pattern-recall' && <PatternRecall onComplete={handleComplete} />}
            {activeGame === 'what-changed' && <WhatChanged onComplete={handleComplete} />}
            {activeGame === 'memory-sequence' && <MemorySequence onComplete={handleComplete} />}
            {activeGame === 'memory-story' && <MemoryStory onComplete={handleComplete} />}
          </div>
        </div>
      </div>
    )
  }

  // ── Hub view ──
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="section-heading mb-4">
            Memory <span className="text-gradient">Games</span>
          </h1>
          <p className="section-subheading mx-auto">
            Choose an activity to engage your mind. Each game gently adapts to your pace.
          </p>
        </div>

        {/* ── Today's AURA Challenge ── */}
        <button
          onClick={() => openGame(recommendation.game)}
          className="w-full text-left group rounded-3xl overflow-hidden border-2 border-amber-200/70 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 mb-8 shadow-[0_4px_24px_rgba(251,146,60,0.10)] hover:shadow-[0_10px_36px_rgba(251,146,60,0.18)] hover:-translate-y-0.5 transition-all"
        >
          <div className="p-6 md:p-7 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${recDef.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
              <recDef.icon className="text-white" size={36} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles size={14} className="text-amber-500" />
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Today's AURA Challenge</span>
              </div>
              <h3 className="text-2xl font-bold text-charcoal-800 dark:text-white mb-1">{t(recDef.titleKey)}</h3>
              <div className="flex items-center gap-4 text-sm text-charcoal-500 flex-wrap">
                <span className="flex items-center gap-1.5"><Play size={13} /> {recommendation.minutes} minutes</span>
                <span className="flex items-center gap-1.5"><Target size={13} /> Focus: {recommendation.focus}</span>
                <span className="flex items-center gap-1.5"><TrendingUp size={13} /> Difficulty: Level {recommendation.level}</span>
              </div>
              <p className="text-xs text-charcoal-400 mt-2 italic">
                {sessions.length > 0
                  ? `Chosen from your recent sessions — ${recommendation.reason}.`
                  : 'A gentle starting point for your first visit.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 bg-amber-500 group-hover:bg-amber-600 text-white px-6 py-3.5 rounded-2xl font-bold transition-colors flex-shrink-0">
              <Play size={18} /> START CHALLENGE
            </div>
          </div>
        </button>

        {/* ── AURA cognitive profile strip ── */}
        {sessions.length > 0 && (
          <div className="card mb-10 !p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="font-bold text-charcoal-800 dark:text-white text-sm uppercase tracking-wider">Your AURA Profile</h3>
              <p className="text-xs text-charcoal-400">From your last {Math.min(sessions.length, 20)} sessions</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categoryScores.map(cat => (
                <div key={cat.category}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-xs font-medium text-charcoal-500">{cat.label}</span>
                    <span className="text-sm font-bold text-charcoal-700 dark:text-white">{cat.value}%</span>
                  </div>
                  <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sage-400 to-sage-500 rounded-full transition-all duration-700" style={{ width: `${cat.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-charcoal-500 mt-4 pt-4 border-t border-cream-100">
              <Sparkles size={14} className="inline text-amber-500 mr-1.5" />
              AURA recommends <strong className="text-amber-600">{t(recDef.titleKey)}</strong> — {recommendation.reason}.
            </p>
          </div>
        )}

        {/* ── Categories ── */}
        <div className="space-y-10">
          {CATEGORIES.map(cat => (
            <div key={cat.id}>
              <div className="flex items-baseline gap-3 mb-1">
                <h3 className="text-xl font-bold text-charcoal-800 dark:text-white">{t(cat.title)}</h3>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${cat.ring}`}>{cat.games.length} activities</span>
              </div>
              <p className="text-sm text-charcoal-400 mb-4">{cat.blurb}</p>
              <div className="grid gap-3">
                {cat.games.map(id => {
                  const def = GAMES_RAW[id]
                  const isChallenge = id === recommendation.game
                  return (
                    <button
                      key={id}
                      onClick={() => openGame(id)}
                      className={`card-hover !p-4 flex items-center gap-4 text-left group relative ${isChallenge ? 'ring-2 ring-amber-300' : ''}`}
                    >
                      {isChallenge && (
                        <span className="absolute -top-2.5 right-4 bg-amber-400 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                          <Sparkles size={10} /> Challenge
                        </span>
                      )}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${def.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                        <def.icon className="text-white" size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-charcoal-800 dark:text-white">{t(def.titleKey)}</h4>
                        <p className="text-sm text-charcoal-400 line-clamp-1">{t(def.descKey)}</p>
                      </div>
                      <span className={`text-lg transition-transform group-hover:translate-x-1 ${def.accent}`}>→</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── Memory Capsule teaser — memories personalize these games ── */}
        <Link
          to="/capsule"
          onClick={() => playTapSound()}
          className="mt-12 card-hover !p-6 flex items-center gap-5 group bg-gradient-to-br from-rose-50/80 to-amber-50/60 border-rose-100"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-lg">
            <Heart className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-charcoal-800 dark:text-white">Memory Capsule</h4>
            <p className="text-sm text-charcoal-400">
              Add the people, places, and moments that matter — AURA weaves them into your games.
            </p>
          </div>
          <ArrowRight size={20} className="text-rose-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
