import { useState, useEffect, useRef, useCallback } from 'react'
import { Trophy, RotateCcw, Volume2 } from 'lucide-react'
import { useGameProgress } from '../../hooks/useGameProgress'
import { calculateDifficulty, getDifficultyConfig } from '../../utils/adaptiveDifficulty'
import { playMatchChime, playWinChime, playTapSound, speakText } from '../../utils/audio'
import { useTranslation } from '../../hooks/useTranslation'
import type { GameSession, MemoryLanePrompt } from '../../data/models'

const FALLBACK_PROMPTS: MemoryLanePrompt[] = [
  {
    id: 'family-1',
    prompt: 'Who visited you earlier this week?',
    answer: 'Priya',
    hint: 'Her name starts with P, and she is your daughter.',
    category: 'family',
  },
  {
    id: 'place-1',
    prompt: 'Which place did you go to on Sunday?',
    answer: 'Market',
    hint: 'You bought fresh vegetables and flowers there.',
    category: 'place',
  },
  {
    id: 'food-1',
    prompt: 'What did you have for breakfast today?',
    answer: 'Tea',
    hint: 'A warm cup in the morning, every day.',
    category: 'food',
  },
  {
    id: 'ritual-1',
    prompt: 'What did you light this morning at home?',
    answer: 'Incense',
    hint: 'A quiet morning ritual with a gentle smell.',
    category: 'ritual',
  },
  {
    id: 'routine-1',
    prompt: 'What is the first thing you usually do after waking up?',
    answer: 'Tea',
    hint: 'A small warm ritual before anything else.',
    category: 'routine',
  },
  {
    id: 'family-2',
    prompt: 'Who called you last weekend?',
    answer: 'Rahul',
    hint: 'Your son, who said he will visit soon.',
    category: 'family',
  },
  {
    id: 'place-2',
    prompt: 'Where did you sit to rest this afternoon?',
    answer: 'Garden',
    hint: 'Outside, among the flowers and fresh air.',
    category: 'place',
  },
  {
    id: 'food-2',
    prompt: 'What sweet did you enjoy yesterday?',
    answer: 'Mango',
    hint: 'A bright yellow fruit, sweet and juicy.',
    category: 'food',
  },
]

interface MemoryLaneProps {
  onComplete?: (session: GameSession) => void
}

export default function MemoryLane({ onComplete }: MemoryLaneProps) {
  const { t, language } = useTranslation()
  const { getAverageAccuracy } = useGameProgress()
  const lastAccuracy = useRef(getAverageAccuracy('memory-lane'))
  const difficulty = calculateDifficulty(lastAccuracy.current || 75)
  const config = getDifficultyConfig(difficulty)

  const [phase, setPhase] = useState<'ready' | 'prompt' | 'hint' | 'answer' | 'result' | 'done'>('ready')
  const [round, setRound] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [prompt, setPrompt] = useState<MemoryLanePrompt | null>(null)
  const [choices, setChoices] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [spoken, setSpoken] = useState(false)
  const [encouragement, setEncouragement] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const pickRound = useCallback(() => {
    const pool = FALLBACK_PROMPTS
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    const chosen = shuffled[0]
    const others = pool.filter(p => p.id !== chosen.id)
    const distractors = others
      .map(p => p.answer)
      .filter((a, i, arr) => a !== chosen.answer && arr.indexOf(a) === i)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
    const pool2 = [chosen.answer, ...distractors].sort(() => Math.random() - 0.5)
    setPrompt(chosen)
    setChoices(pool2)
    setSelected(null)
    setSpoken(false)
    setEncouragement('')
  }, [])

  const startGame = () => {
    setRound(0)
    setTotalScore(0)
    setElapsed(0)
    setPhase('prompt')
    pickRound()
  }

  useEffect(() => {
    if (phase !== 'prompt' && phase !== 'hint') return
    const iv = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(iv)
  }, [phase])

  useEffect(() => {
    if (phase !== 'prompt') return
    if (!prompt || spoken) return
    speakText(t(prompt.prompt), language)
    setSpoken(true)
  }, [phase, prompt, spoken])

  useEffect(() => {
    if (phase !== 'prompt') return
    if (!prompt) return
    timerRef.current = setTimeout(() => {
      setPhase('hint')
      if (prompt) speakText(t('Here is a little hint.'), language)
    }, 4000)
    return () => clearTimeout(timerRef.current)
  }, [phase, prompt])

  const choose = (answer: string) => {
    if (phase !== 'hint' && phase !== 'answer') return
    setSelected(answer)
    if (phase === 'hint') setPhase('answer')
    if (prompt && answer === prompt.answer) {
      playMatchChime()
      const msg = prompt.category === 'family'
        ? t('That is right — family is important.')
        : prompt.category === 'place'
          ? t("Yes, that place feels familiar, doesn't it?")
          : t('That is right — a lovely little detail you remembered.')
      setEncouragement(msg)
      setTimeout(() => setEncouragement(''), 2200)
    }
  }

  const submit = () => {
    if (!prompt || !selected) return
    const correct = selected === prompt.answer
    const roundScore = correct ? 100 : 0
    const newTotal = totalScore + roundScore
    const newRounds = round + 1
    setTotalScore(newTotal)
    setRound(newRounds)
    setPhase('result')
    if (correct) {
      playMatchChime()
    } else {
      speakText(t('That is okay. We remember things differently, and that is fine.'), language)
    }
    setTimeout(() => setPhase('prompt'), 2000)
  }

  const nextRound = () => {
    const roundScore2 = selected === prompt?.answer ? 100 : 0
    const finishedTotal = totalScore + roundScore2
    if (round >= 2) {
      setPhase('done')
      playWinChime()
      const session: GameSession = {
        gameType: 'memory-lane',
        score: Math.round(finishedTotal / 3),
        accuracy: Math.round(finishedTotal / 3),
        duration: elapsed,
        timestamp: new Date().toISOString(),
        difficulty,
      }
      onComplete?.(session)
    } else {
      setPhase('prompt')
      setElapsed(0)
      pickRound()
    }
  }

  const startNext = () => {
    setPhase('prompt')
    setElapsed(0)
    pickRound()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-charcoal-500">
            <Volume2 size={18} />
            <span className="font-medium">{t('Round {n} of {total}', { n: round + 1, total: 3 })}</span>
          </div>
          <div className="flex items-center gap-2 text-charcoal-500">
            <span className="font-medium">{elapsed}s</span>
          </div>
        </div>
      </div>

      <div className="text-center mb-6 h-8">
        {encouragement && (
          <p className="text-xl font-bold text-sage-600 animate-bounce">{encouragement}</p>
        )}
      </div>

      {phase === 'ready' && (
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🪷</div>
          <h3 className="text-2xl font-bold text-charcoal-800 mb-3">{t('Memory Lane')}</h3>
          <p className="text-charcoal-400 mb-8 max-w-md mx-auto">
            {t('Remember little moments from your life — people, places, foods, and warm routines.')}
          </p>
          <button onClick={() => { playTapSound(); startGame() }} className="btn-primary">
            {t('Begin')}
          </button>
        </div>
      )}

      {phase === 'prompt' && prompt && (
        <div className="text-center">
          <p className="text-lg font-medium text-sage-600 mb-6 animate-pulse">
            {t('Listen, and remember...')}
          </p>
          <div className="card text-left p-6 mb-8">
            <p className="text-xl font-semibold text-charcoal-800 leading-relaxed">
              &ldquo;{t(prompt.prompt)}&rdquo;
            </p>
          </div>
          {elapsed >= 4 && (
            <div className="text-center mb-6">
              <button
                onClick={() => { playTapSound(); speakText(t(prompt.hint), language); setPhase('hint') }}
                className="btn-ghost inline-flex items-center gap-2"
              >
                <Volume2 size={16} /> {t('Hear a hint')}
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-sm mx-auto">
            {choices.map((choice) => (
              <button
                key={choice}
                onClick={() => choose(choice)}
                className={`py-4 px-4 rounded-2xl text-lg font-medium border-2 transition-all duration-200
                  ${selected === choice
                    ? 'bg-sage-100 border-sage-500 shadow-md scale-105'
                    : 'bg-white/70 border-white/50 hover:bg-white hover:border-sage-300'
                  }`}
              >
                {t(choice)}
              </button>
            ))}
          </div>
          {selected && (
            <div className="mt-6">
              <button onClick={submit} className="btn-primary inline-flex items-center gap-2">
                {t('Tell me')} <Volume2 size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {phase === 'result' && prompt && (
        <div className="text-center">
          <div className="card mb-8 p-6">
            <p className="text-lg font-medium text-charcoal-700 mb-4">{t("Here's what you remembered:")}</p>
            <p className="text-xl font-semibold text-charcoal-800">
              &ldquo;{t(prompt.prompt)}&rdquo;
            </p>
            {selected === prompt.answer ? (
              <p className="text-sage-600 mt-3">{t('That is exactly right.')}</p>
            ) : (
              <p className="text-amber-600 mt-3">
                {t('You said "{said}" — the answer was "{answer}".', { said: t(selected || ''), answer: t(prompt.answer) })}
              </p>
            )}
          </div>
          <button onClick={nextRound} className="btn-primary inline-flex items-center gap-2">
            {round >= 2 ? t('See my result') : t('Next moment')}
          </button>
        </div>
      )}

      {phase === 'done' && (
        <div className="text-center mt-8 animate-fade-in">
          <div className="card bg-sage-50 border-sage-200">
            <Trophy className="mx-auto text-amber-500 mb-4" size={48} />
            <h3 className="text-2xl font-bold text-charcoal-800 mb-2">{t('Beautiful memories')}</h3>
            <p className="text-charcoal-400 mb-2">
              {t('You remembered {n} of 3 moments today.', { n: Math.round(totalScore / 100) })}
            </p>
            <p className="text-sm text-charcoal-400">
              {t('Family, places, food, and little routines — the things that matter most.')}
            </p>
          </div>
          <button onClick={startNext} className="btn-primary inline-flex items-center gap-2 mt-6">
            <RotateCcw size={18} /> {t('Remember more')}
          </button>
        </div>
      )}
    </div>
  )
}
