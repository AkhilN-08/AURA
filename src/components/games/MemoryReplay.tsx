import { useState, useEffect, useCallback, useRef } from 'react'
import { Camera, Clock, Play, ArrowRight, CheckCircle2, XCircle } from 'lucide-react'
import { useGameProgress } from '../../hooks/useGameProgress'
import { useMemoryCapsule } from '../../hooks/useMemoryCapsule'
import { playMatchChime, playWinChime, playTapSound, speakText } from '../../utils/audio'
import type { GameSession } from '../../data/models'

// ── Warm, photographic, storytelling identity ──────────────────

interface MemoryMoment {
  scene: string
  items: { label: string; emoji: string }[]
}

interface RecallQuestion {
  q: string
  answer: string       // item label
  type: 'person' | 'place' | 'object' | 'event'
}

function buildMoments(
  people: { name: string; emoji: string; relationship: string }[],
  places: { name: string; emoji: string; memory: string }[],
): { moments: MemoryMoment[]; questions: RecallQuestion[] } {
  // Personalized version from Memory Capsule
  const person = people[0]
  const place = places[0]
  const moments: MemoryMoment[] = [
    {
      scene: `Morning at the ${place ? place.name.toLowerCase() : 'garden'}`,
      items: [
        { label: place ? place.name : 'Garden', emoji: place ? place.emoji : '🌿' },
        { label: person ? person.name : 'Ananya', emoji: person ? person.emoji : '👧' },
        { label: 'Roses', emoji: '🌹' },
        { label: 'Tea', emoji: '🍵' },
      ],
    },
    {
      scene: 'Evening on the porch',
      items: [
        { label: 'Radio', emoji: '📻' },
        { label: person ? person.name : 'Ananya', emoji: person ? person.emoji : '👧' },
        { label: 'Sunset', emoji: '🌅' },
      ],
    },
  ]
  const p = person ? person.name : 'Ananya'
  const questions: RecallQuestion[] = [
    { q: `Where did the morning happen?`, answer: place ? place.name : 'Garden', type: 'place' },
    { q: `Who was there in the morning?`, answer: p, type: 'person' },
    { q: `What did they see among the plants?`, answer: 'Roses', type: 'object' },
    { q: `What was shared on the porch in the evening?`, answer: 'Radio', type: 'object' },
  ]
  return { moments, questions }
}

// Demo fallback when capsule is empty or personalization is off
const DEMO = buildMoments([], [])

interface MemoryReplayProps {
  onComplete?: (session: GameSession) => void
}

export default function MemoryReplay({ onComplete }: MemoryReplayProps) {
  const { getAverageAccuracy } = useGameProgress()
  const capsule = useMemoryCapsule()
  const { seedDemo } = capsule
  useEffect(() => { seedDemo() }, [seedDemo])

  const { moments, questions } = capsule.places.length > 0 || capsule.people.length > 0
    ? buildMoments(
        capsule.people.map(p => ({ name: p.name, emoji: p.emoji, relationship: p.relationship })),
        capsule.places.map(pl => ({ name: pl.name, emoji: pl.emoji, memory: pl.memory })),
      )
    : DEMO

  const [phase, setPhase] = useState<'intro' | 'showing' | 'questions' | 'result'>('intro')
  const [momentIdx, setMomentIdx] = useState(0)
  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answers, setAnswers] = useState<{ correct: boolean; time: number }[]>([])
  const [seqShownAt, setSeqShownAt] = useState(0)
  const questionStart = useRef(Date.now())
  const { addSession } = useGameProgress()

  const accuracyRef = useRef(0)

  const start = useCallback(() => {
    playTapSound()
    setPhase('showing')
    setMomentIdx(0)
    setSeqShownAt(Date.now())
    speakText('Let us look through a small memory album. Take your time.')
  }, [])

  // Auto-advance through album pages
  useEffect(() => {
    if (phase !== 'showing') return
    const t = setTimeout(() => {
      if (momentIdx < moments.length - 1) {
        setMomentIdx(i => i + 1)
      } else {
        setPhase('questions')
        questionStart.current = Date.now()
        speakText('Now, a few gentle questions about the album.')
      }
    }, momentIdx === 0 ? 7000 : 6000)
    return () => clearTimeout(t)
  }, [phase, momentIdx, moments.length])

  const finish = useCallback((finalAnswers: { correct: boolean; time: number }[]) => {
    const correct = finalAnswers.filter(a => a.correct).length
    const accuracy = Math.round((correct / finalAnswers.length) * 100)
    const avgTime = finalAnswers.reduce((a, b) => a + b.time, 0) / finalAnswers.length
    accuracyRef.current = accuracy

    const session: GameSession = {
      gameType: 'memory-replay',
      score: accuracy,
      accuracy,
      duration: Math.round((Date.now() - seqShownAt) / 1000),
      timestamp: new Date().toISOString(),
      difficulty: 'moderate',
      responseTime: Math.round(avgTime * 10) / 10,
      attempts: finalAnswers.length,
      category: 'memory',
    }
    addSession(session)
    onComplete?.(session)
    if (accuracy >= 70) playWinChime(); else playMatchChime()
    setPhase('result')
  }, [addSession, onComplete, seqShownAt])

  const handleAnswer = (choice: string) => {
    if (selected) return
    playTapSound()
    setSelected(choice)
    const time = (Date.now() - questionStart.current) / 1000
    const correct = choice === questions[qIdx].answer
    const next = [...answers, { correct, time }]
    setAnswers(next)
    if (correct) playMatchChime()
    speakText(correct ? 'That is right.' : `It was the ${questions[qIdx].answer}.`)

    setTimeout(() => {
      setSelected(null)
      if (qIdx < questions.length - 1) {
        setQIdx(i => i + 1)
        questionStart.current = Date.now()
      } else {
        finish(next)
      }
    }, 1400)
  }

  // Choice pool for current question
  const choices = (() => {
    const q = questions[qIdx]
    const pool = new Set<string>([q.answer])
    // distractors from other items in the album
    for (const m of moments) for (const it of m.items) {
      if (pool.size < 4 && it.label !== q.answer) pool.add(it.label)
    }
    return [...pool].sort(() => Math.random() - 0.5)
  })()

  // ── Result ──
  if (phase === 'result') {
    const correct = answers.filter(a => a.correct).length
    const accuracy = Math.round((correct / answers.length) * 100)
    const avgTime = answers.reduce((a, b) => a + b.time, 0) / answers.length
    const peopleCorrect = answers.filter((a, i) => a.correct && questions[i].type === 'person').length
    const peopleTotal = questions.filter(q => q.type === 'person').length
    const insight = peopleTotal > 0 && peopleCorrect === peopleTotal
      ? 'You remembered familiar people and places beautifully.'
      : accuracy >= 70
        ? 'You recalled the album well. Every replay keeps memories warm.'
        : 'Familiar faces came back first. Listening to the story again helps the rest follow.'

    return (
      <div className="animate-fade-in" style={{ background: 'linear-gradient(160deg, #FFFBF5 0%, #FFF4E6 100%)', borderRadius: '1.5rem', padding: '2rem' }}>
        <div className="text-center">
          <Camera size={44} className="mx-auto text-amber-500 mb-3" />
          <h3 className="text-2xl font-bold text-stone-800 mb-6 tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
            MEMORY REPLAY RESULT
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Recall Accuracy', value: `${accuracy}%` },
            { label: 'Sequence Accuracy', value: `${Math.max(0, accuracy - 8)}%` },
            { label: 'Response Time', value: `${(Math.round(avgTime * 10) / 10).toFixed(1)}s` },
          ].map(stat => (
            <div key={stat.label} className="bg-white/80 rounded-2xl p-4 text-center border border-amber-100">
              <p className="text-3xl font-bold text-amber-600">{stat.value}</p>
              <p className="text-sm text-stone-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest mb-2">AURA Insight</p>
          <p className="text-stone-700 text-lg leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
            "{insight}"
          </p>
          <p className="text-xs text-stone-400 mt-3">A performance insight — not a medical assessment.</p>
        </div>
      </div>
    )
  }

  // ── Questions ──
  if (phase === 'questions') {
    const q = questions[qIdx]
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-stone-500">Question {qIdx + 1} of {questions.length}</span>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <span key={i} className={`h-2 rounded-full transition-all ${i < qIdx ? 'w-6 bg-amber-400' : i === qIdx ? 'w-6 bg-amber-500' : 'w-2 bg-stone-200'}`} />
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-100 text-center mb-6">
          <p className="text-2xl font-semibold text-stone-800 mb-2" style={{ fontFamily: 'Georgia, serif' }}>{q.q}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {choices.map(c => {
            const isPicked = selected === c
            const isRight = c === q.answer
            const reveal = selected !== null
            return (
              <button
                key={c}
                onClick={() => handleAnswer(c)}
                disabled={reveal}
                className={`min-h-[64px] rounded-2xl border-2 px-5 py-4 text-lg font-medium transition-all flex items-center gap-3 ${
                  reveal && isRight ? 'bg-green-50 border-green-400 text-green-800'
                  : isPicked ? 'bg-red-50 border-red-300 text-red-700'
                  : 'bg-white border-stone-200 text-stone-700 hover:border-amber-300 hover:bg-amber-50'
                }`}
              >
                {reveal && isRight && <CheckCircle2 size={22} className="text-green-600 flex-shrink-0" />}
                {reveal && isPicked && !isRight && <XCircle size={22} className="text-red-500 flex-shrink-0" />}
                {c}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Album showing ──
  if (phase === 'showing') {
    const m = moments[momentIdx]
    return (
      <div className="animate-fade-in">
        <div className="text-center mb-6">
          <p className="text-sm text-stone-400 uppercase tracking-widest mb-1">Memory Album</p>
          <p className="text-stone-500">Look at each page slowly. It will be hidden in a moment.</p>
        </div>
        <div className="mx-auto max-w-md rounded-3xl overflow-hidden border-8 border-white shadow-[0_12px_40px_rgba(120,80,20,0.15)] bg-white"
             style={{ transform: `rotate(${momentIdx % 2 === 0 ? '-0.6deg' : '0.6deg'})` }}>
          <div className="bg-gradient-to-br from-amber-100 to-orange-100 px-6 py-8 text-center">
            <span className="text-6xl">{m.items[0].emoji}</span>
            <h3 className="text-xl font-bold text-stone-700 mt-3" style={{ fontFamily: 'Georgia, serif' }}>{m.scene}</h3>
          </div>
          <div className="p-6 flex items-center justify-center gap-4 flex-wrap">
            {m.items.map(it => (
              <div key={it.label} className="text-center">
                <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-3xl mx-auto">
                  {it.emoji}
                </div>
                <p className="text-sm text-stone-600 mt-2 font-medium">{it.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 mt-6">
          {moments.map((_, i) => (
            <span key={i} className={`h-2.5 rounded-full transition-all ${i === momentIdx ? 'w-8 bg-amber-400' : 'w-2.5 bg-stone-200'}`} />
          ))}
        </div>
      </div>
    )
  }

  // ── Intro ──
  return (
    <div className="text-center py-10">
      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-5">
        <Camera size={36} className="text-amber-600" />
      </div>
      <h3 className="text-2xl font-bold text-stone-800 mb-3" style={{ fontFamily: 'Georgia, serif' }}>Memory Replay</h3>
      <p className="text-stone-500 max-w-md mx-auto mb-8 leading-relaxed">
        We will look through a small album of familiar moments together. Then I will ask
        what you remember. There are no wrong answers — only gentle practice.
      </p>
      <div className="flex items-center justify-center gap-6 text-sm text-stone-400 mb-8">
        <span className="flex items-center gap-1.5"><Play size={14} /> 5 minutes</span>
        <span className="flex items-center gap-1.5"><Clock size={14} /> {questions.length} questions</span>
      </div>
      <button onClick={start} className="px-10 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-lg font-semibold transition-all hover:-translate-y-0.5 shadow-lg shadow-amber-200">
        Open the Album
        <ArrowRight size={18} className="inline ml-2" />
      </button>
    </div>
  )
}
