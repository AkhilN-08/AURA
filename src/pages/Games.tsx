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
  skill: string   // cognitive skill trained (editorial metadata)
  minutes: number // estimated duration
}

import { Brain, Eye, Hash, BookOpen, Grid3X3, Palette, BookMarked, Camera, Sprout, Clock, MapPin, LayoutGrid, Search, Bell, Feather, Leaf } from 'lucide-react'

const GAMES_RAW: Record<GameType, GameDef> = {
  // ── original games ──
  'memory-match': {
    id: 'memory-match', titleKey: 'Memory Match',
    descKey: 'Flip cards and find matching pairs. A classic way to exercise memory.',
    icon: Brain, color: 'from-sage-400 to-sage-600', accent: 'text-sage-500',
    skill: 'Recognition', minutes: 5,
  },
  'object-recall': {
    id: 'object-recall', titleKey: 'Object Recall',
    descKey: 'Study familiar objects briefly, then recall what you saw.',
    icon: Eye, color: 'from-amber-400 to-amber-600', accent: 'text-amber-500',
    skill: 'Visual Memory', minutes: 6,
  },
  'sequence-recall': {
    id: 'sequence-recall', titleKey: 'Sequence Recall',
    descKey: 'Watch a sequence of daily tasks, then put them back in order.',
    icon: Hash, color: 'from-sky-400 to-sky-600', accent: 'text-sky-500',
    skill: 'Planning', minutes: 6,
  },
  'word-association': {
    id: 'word-association', titleKey: 'Word Association',
    descKey: 'Memorize related word pairs, then match them from memory.',
    icon: BookOpen, color: 'from-sage-400 to-sage-600', accent: 'text-sage-500',
    skill: 'Language', minutes: 5,
  },
  'pattern-grid': {
    id: 'pattern-grid', titleKey: 'Pattern Grid',
    descKey: 'Watch cells light up in a grid, then recreate the pattern.',
    icon: Grid3X3, color: 'from-purple-400 to-purple-600', accent: 'text-purple-500',
    skill: 'Visual Memory', minutes: 5,
  },
  'story-recall': {
    id: 'story-recall', titleKey: 'Story Recall',
    descKey: 'Read a short story, then answer questions about the details.',
    icon: BookMarked, color: 'from-amber-500 to-orange-600', accent: 'text-amber-500',
    skill: 'Comprehension', minutes: 7,
  },
  'color-sequence': {
    id: 'color-sequence', titleKey: 'Color Sequence',
    descKey: 'Watch colors light up in order, then reproduce the pattern.',
    icon: Palette, color: 'from-pink-400 to-pink-600', accent: 'text-pink-500',
    skill: 'Attention', minutes: 4,
  },
  'memory-lane': {
    id: 'memory-lane', titleKey: 'Memory Lane',
    descKey: 'Remember little moments from your life — people, places, foods, and warm routines.',
    icon: Leaf, color: 'from-amber-400 to-amber-600', accent: 'text-amber-500',
    skill: 'Personal Memory', minutes: 8,
  },
  // ── new experiences ──
  'memory-replay': {
    id: 'memory-replay', titleKey: 'Memory Replay',
    descKey: 'Revisit a familiar memory album, then answer gentle questions about it.',
    icon: Camera, color: 'from-amber-400 to-orange-500', accent: 'text-amber-600',
    skill: 'Personal Memory', minutes: 7,
  },
  'forget-teach-retest': {
    id: 'forget-teach-retest', titleKey: 'Remember & Relearn',
    descKey: 'A learning cycle — if a name slips away, AURA teaches it and you try again.',
    icon: Sprout, color: 'from-emerald-400 to-emerald-600', accent: 'text-emerald-600',
    skill: 'Recognition', minutes: 6,
  },
  'routine-deviation': {
    id: 'routine-deviation', titleKey: 'Routine Spotter',
    descKey: 'Spot the small change in a familiar daily routine — like a gentle game of differences.',
    icon: Clock, color: 'from-violet-400 to-violet-600', accent: 'text-violet-500',
    skill: 'Routine Recall', minutes: 5,
  },
  'my-place-memories': {
    id: 'my-place-memories', titleKey: 'My Place, My Memories',
    descKey: 'A little journey through familiar places — each one shares its memory with you.',
    icon: MapPin, color: 'from-teal-400 to-teal-600', accent: 'text-teal-600',
    skill: 'Place Memory', minutes: 6,
  },
  'pattern-recall': {
    id: 'pattern-recall', titleKey: 'Pattern Recall',
    descKey: 'A calm color-pattern game that grows with you, one level at a time.',
    icon: LayoutGrid, color: 'from-slate-400 to-slate-600', accent: 'text-slate-600',
    skill: 'Visual Memory', minutes: 7,
  },
  'what-changed': {
    id: 'what-changed', titleKey: 'What Changed?',
    descKey: 'Look at a familiar room — something small changes. Can you tell what?',
    icon: Search, color: 'from-orange-400 to-orange-600', accent: 'text-orange-500',
    skill: 'Observation', minutes: 5,
  },
  'memory-sequence': {
    id: 'memory-sequence', titleKey: 'Memory Sequence',
    descKey: 'A listening game with big, friendly buttons — bells, claps, and chimes.',
    icon: Bell, color: 'from-sky-400 to-blue-500', accent: 'text-sky-500',
    skill: 'Attention', minutes: 4,
  },
  'memory-story': {
    id: 'memory-story', titleKey: 'Memory Story',
    descKey: 'A short story drawn from your own memories, read aloud page by page.',
    icon: Feather, color: 'from-rose-400 to-rose-600', accent: 'text-rose-500',
    skill: 'Comprehension', minutes: 8,
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

  // ── In-game view: a focused room, nothing else on the desk ──
  if (activeGame !== 'select') {
    const def = GAMES_RAW[activeGame as GameType]
    return (
      <div className="room room-focus px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-5 mb-10">
            <button
              onClick={() => { playTapSound(); setActiveGame('select') }}
              className="flex items-center gap-2 text-ink/70 hover:text-ink transition-colors py-2"
              aria-label={t('Back to game selection')}
            >
              <ArrowLeft size={22} />
              <span className="aura-meta">{t('Back')}</span>
            </button>
            <div className="flex-1 h-px bg-ink/10" />
            <span className="aura-meta">{t(def.skill)} · {t('{n} minutes', { n: def.minutes })}</span>
          </div>

          <div className="bg-white border-2 border-ink/80 rounded-2xl shadow-[0_18px_44px_-18px_rgba(23,23,23,0.25)] p-6 md:p-10">
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

  // ── Hub view: the focus room ──
  return (
    <div className="room room-focus px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <div className="aura-meta mb-4">{t("Today's AURA Challenge")} — {t('{n} minutes', { n: recommendation.minutes })}</div>
          <h1 className="font-serif-display text-5xl md:text-7xl leading-[0.95] tracking-tight text-ink dark:text-white mb-2">
            {t(recDef.titleKey)}
          </h1>
          <div className="aura-rule w-28 my-5" />
          <div className="aura-meta mb-6">{t(recommendation.focus)} · {t('Difficulty')} {t('Level')} {recommendation.level}</div>
          <p className="font-serif-display italic text-xl text-ink/70 dark:text-charcoal-300 max-w-xl mb-8">
            {sessions.length > 0
              ? t('Chosen from your recent sessions — {reason}.', { reason: t(recommendation.reason) })
              : t('A gentle starting point for your first visit.')}
          </p>
          <button
            onClick={() => openGame(recommendation.game)}
            className="group inline-flex items-center gap-3 bg-ink text-ivory px-10 py-5 rounded-xl text-lg font-bold hover:bg-leaf active:translate-y-0.5 transition-all"
          >
            <Play size={22} /> {t('START CHALLENGE')}
            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </button>
        </header>


        {/* ── The collection — an editorial index, not a card grid ── */}
        {CATEGORIES.map((cat, ci) => (
          <section key={cat.id} className="mb-14">
            <div className="flex items-baseline gap-4 mb-2">
              <span className="font-serif-display text-3xl text-ink/30 dark:text-charcoal-500">0{ci + 1}</span>
              <h2 className="font-serif-display text-2xl md:text-3xl text-ink dark:text-white">{t(cat.title)}</h2>
              <div className="flex-1 h-px bg-ink/15" />
              <span className="aura-meta hidden sm:block">{t('{n} activities', { n: cat.games.length })}</span>
            </div>
            <p className="text-charcoal-500 dark:text-charcoal-400 mb-6 max-w-lg">{t(cat.blurb)}</p>

            <div>
              {cat.games.map((id, gi) => {
                const def = GAMES_RAW[id]
                const isChallenge = id === recommendation.game
                return (
                  <button
                    key={id}
                    onClick={() => openGame(id)}
                    className={`aura-index-row group ${isChallenge ? 'bg-blush/20' : ''}`}
                  >
                    <span className="aura-meta w-8 flex-shrink-0">{String(gi + 1).padStart(2, '0')}</span>
                    <span className="font-serif-display text-xl md:text-2xl text-ink dark:text-white flex-1">
                      {t(def.titleKey)}
                      {isChallenge && <span className="aura-meta ml-3 align-middle text-rose-500">· {t('Challenge')}</span>}
                    </span>
                    <span className="aura-meta hidden md:block w-44">{t(def.skill)}</span>
                    <span className="aura-meta w-16 text-right">{t('{n} min', { n: def.minutes })}</span>
                    <span className="text-ink/30 group-hover:text-ink group-hover:translate-x-1 transition-all text-xl leading-none">→</span>
                  </button>
                )
              })}
            </div>
          </section>
        ))}

        {/* ── Why this game? — AURA explains its thinking ── */}
        {sessions.length > 0 && (
          <section className="mb-14 border-2 border-ink/70 rounded-2xl p-6 md:p-8 bg-white/60">
            <div className="aura-meta mb-4">{t('AURA NOTICED')}</div>
            <div className="space-y-2 mb-6">
              {categoryScores.slice(0, 2).map(cat => (
                <p key={cat.category} className="font-serif-display text-lg text-ink dark:text-white">
                  {cat.value >= 70
                    ? t('You remember {skill} quickly and confidently.', { skill: t(cat.label).toLowerCase() })
                    : t('You take a little more time with {skill}.', { skill: t(cat.label).toLowerCase() })}
                </p>
              ))}
            </div>
            <div className="aura-meta mb-2">{t('SO NEXT')}</div>
            <p className="text-charcoal-600 dark:text-charcoal-300">
              {t('AURA recommends {game} — {reason}.', { game: t(recDef.titleKey), reason: t(recommendation.reason) })}
            </p>
          </section>
        )}

        {/* ── Memory Capsule — where the games get personal ── */}
        <Link
          to="/capsule"
          onClick={() => playTapSound()}
          className="group flex items-center gap-6 py-8 border-t-2 border-ink/15"
        >
          <div className="w-14 h-14 rounded-lg bg-blush/30 border-2 border-blush/60 flex items-center justify-center flex-shrink-0 group-hover:bg-blush/60 transition-colors">
            <Heart className="text-rose-500" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-serif-display text-xl text-ink dark:text-white">{t('Memory Capsule')}</h3>
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
              {t('Add the people, places, and moments that matter — AURA weaves them into your games.')}
            </p>
          </div>
          <span className="aura-meta">{t('VISIT')} →</span>
        </Link>
      </div>
    </div>
  )
}
