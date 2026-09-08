import { useState, useEffect, useRef, useCallback } from 'react'
import { Eye, CheckCircle2, XCircle, Search, ArrowRight, ArrowLeftRight } from 'lucide-react'
import { useGameProgress } from '../../hooks/useGameProgress'
import { useMemoryCapsule } from '../../hooks/useMemoryCapsule'
import { playMatchChime, playWinChime, playTapSound, speakText } from '../../utils/audio'
import type { GameSession } from '../../data/models'

// ── Identity: visual comparison interface ───────────────────────

interface SceneObject { emoji: string; label: string; pos: number }  // pos = grid slot

interface ChangeRound {
  before: SceneObject[]
  after: SceneObject[]
  changeType: 'removed' | 'moved' | 'replaced' | 'added'
  answerLabel: string
  explanation: string
  options: string[]
}

const BASE_OBJECTS: SceneObject[] = [
  { emoji: '🪑', label: 'Chair', pos: 0 },
  { emoji: '🪴', label: 'Plant', pos: 1 },
  { emoji: '⏰', label: 'Clock', pos: 2 },
  { emoji: '📚', label: 'Books', pos: 3 },
  { emoji: '🖼️', label: 'Photo frame', pos: 4 },
  { emoji: '🍵', label: 'Tea cup', pos: 5 },
]

const PERSONAL_EMOJI: Record<string, string> = {
  'Walking Stick': '🦯', 'Favorite Radio': '📻', 'Radio': '📻',
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildRounds(extraPersonal: { name: string; emoji: string }[]): ChangeRound[] {
  const rounds: ChangeRound[] = []

  // Round 1 — REMOVED
  {
    const before = [...BASE_OBJECTS]
    const removed = before[1] // plant
    const after = before.filter(o => o.label !== removed.label)
    const distractors = BASE_OBJECTS.filter(o => o.label !== removed.label).map(o => o.label)
    rounds.push({
      before, after,
      changeType: 'removed',
      answerLabel: removed.label,
      explanation: `The ${removed.label.toLowerCase()} was taken away.`,
      options: shuffle([removed.label, ...distractors.slice(0, 3)]),
    })
  }

  // Round 2 — MOVED
  {
    const before = [...BASE_OBJECTS]
    const after = before.map(o => {
      if (o.label === 'Clock') return { ...o, pos: 4 }
      if (o.label === 'Photo frame') return { ...o, pos: 2 }
      return o
    })
    rounds.push({
      before, after,
      changeType: 'moved',
      answerLabel: 'Clock',
      explanation: 'The clock and the photo frame swapped places.',
      options: shuffle(['Clock', 'Photo frame', 'Chair', 'Tea cup']),
    })
  }

  // Round 3 — REPLACED (uses a personal object if available)
  {
    const before = [...BASE_OBJECTS]
    const replacement = extraPersonal.length > 0
      ? { emoji: extraPersonal[0].emoji, label: extraPersonal[0].name, pos: before[4].pos }
      : { emoji: '🧵', label: 'Sewing basket', pos: before[4].pos }
    const replaced = before[4] // photo frame
    const after = before.map(o => o.label === replaced.label ? replacement : o)
    rounds.push({
      before, after,
      changeType: 'replaced',
      answerLabel: replaced.label,
      explanation: `The ${replaced.label.toLowerCase()} became a ${replacement.label.toLowerCase()}.`,
      options: shuffle([replaced.label, replacement.label, 'Books', 'Plant']),
    })
  }

  // Round 4 — ADDED
  {
    const before = [...BASE_OBJECTS]
    const added: SceneObject = { emoji: '🐈', label: 'Cat', pos: 6 }
    const after = [...before, added]
    rounds.push({
      before, after,
      changeType: 'added',
      answerLabel: 'Cat',
      explanation: 'A cat arrived in the room.',
      options: shuffle(['Cat', 'Chair', 'Clock', 'Books']),
    })
  }

  return rounds
}

interface WCProps {
  onComplete?: (session: GameSession) => void
}

function SceneGrid({ objects, dim }: { objects: SceneObject[]; dim?: boolean }) {
  const slots = Array.from({ length: 9 }, (_, i) => objects.find(o => o.pos === i))
  return (
    <div className={`grid grid-cols-3 gap-2 p-4 rounded-2xl ${dim ? 'opacity-90' : ''}`}
         style={{ background: 'repeating-linear-gradient(45deg, #faf9f7, #faf9f7 10px, #f5f3f0 10px, #f5f3f0 20px)' }}>
      {slots.map((o, i) => (
        <div key={i} className="aspect-square rounded-xl bg-white/80 border border-stone-100 flex items-center justify-center text-4xl">
          {o ? <span title={o.label}>{o.emoji}</span> : null}
        </div>
      ))}
    </div>
  )
}

export default function WhatChanged({ onComplete }: WCProps) {
  const capsule = useMemoryCapsule()
  const { seedDemo } = capsule
  useEffect(() => { seedDemo() }, [seedDemo])

  const { addSession } = useGameProgress()
  const startedAt = useRef(Date.now())
  const [phase, setPhase] = useState<'intro' | 'study' | 'compare' | 'feedback' | 'result'>('intro')
  const [roundIdx, setRoundIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answers, setAnswers] = useState<{ correct: boolean; time: number }[]>([])
  const qStart = useRef(Date.now())

  const rounds = buildRounds(
    capsule.objects
      .filter(o => PERSONAL_EMOJI[o.name])
      .map(o => ({ name: o.name, emoji: PERSONAL_EMOJI[o.name] }))
  )

  const start = () => {
    playTapSound()
    startedAt.current = Date.now()
    qStart.current = Date.now()
    setPhase('study')
    speakText('Look at this room carefully. You will see it again in a moment.')
    setTimeout(() => {
      setPhase('compare')
      qStart.current = Date.now()
      speakText('Something has changed. What changed?')
    }, 9000)
  }

  const current = rounds[roundIdx]

  const handleAnswer = (choice: string) => {
    if (selected) return
    playTapSound()
    setSelected(choice)
    const time = (Date.now() - qStart.current) / 1000
    const correct = choice === current.answerLabel
    setAnswers(a => [...a, { correct, time }])
    if (correct) playMatchChime()
    setPhase('feedback')
    speakText(correct ? 'You spotted it.' : current.explanation)

    setTimeout(() => {
      setSelected(null)
      if (roundIdx < rounds.length - 1) {
        setRoundIdx(i => i + 1)
        qStart.current = Date.now()
        setPhase('study')
        speakText('A new room. Look carefully.')
        setTimeout(() => { setPhase('compare'); qStart.current = Date.now() }, 9000)
      } else {
        finish()
      }
    }, 2800)
  }

  const finish = useCallback(() => {
    const correct = answers.filter(a => a.correct).length
    const accuracy = answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0
    const avgTime = answers.length > 0 ? answers.reduce((a, b) => a + b.time, 0) / answers.length : 0
    const session: GameSession = {
      gameType: 'what-changed',
      score: accuracy,
      accuracy,
      duration: Math.round((Date.now() - startedAt.current) / 1000),
      timestamp: new Date().toISOString(),
      difficulty: 'moderate',
      responseTime: Math.round(avgTime * 10) / 10,
      attempts: answers.length,
      category: 'memory',
    }
    addSession(session)
    onComplete?.(session)
    if (accuracy >= 60) playWinChime()
    setPhase('result')
  }, [answers, addSession, onComplete])

  // ── Result ──
  if (phase === 'result') {
    const correct = answers.filter(a => a.correct).length
    const accuracy = answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0
    const avgTime = answers.length > 0 ? (answers.reduce((a, b) => a + b.time, 0) / answers.length).toFixed(1) : '0'
    return (
      <div className="animate-fade-in max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Search size={44} className="mx-auto text-orange-500 mb-2" />
          <h3 className="text-2xl font-bold text-stone-800">Sharp Eyes!</h3>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6 text-center">
          <div className="bg-orange-50 rounded-2xl p-4"><p className="text-3xl font-bold text-orange-600">{accuracy}%</p><p className="text-xs text-stone-500">Detection</p></div>
          <div className="bg-orange-50 rounded-2xl p-4"><p className="text-3xl font-bold text-orange-600">{avgTime}s</p><p className="text-xs text-stone-500">Response Time</p></div>
          <div className="bg-orange-50 rounded-2xl p-4"><p className="text-3xl font-bold text-orange-600">{correct}/{answers.length}</p><p className="text-xs text-stone-500">Spotted</p></div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 text-center">
          <p className="text-xs font-semibold text-orange-700 uppercase tracking-widest mb-2">AURA Insight</p>
          <p className="text-stone-700 text-lg" style={{ fontFamily: 'Georgia, serif' }}>
            "{accuracy >= 70
              ? 'Nothing escapes your notice. Your eye for detail is wonderful.'
              : 'Every look sharpens the eye a little more. Familiar rooms are the best place to practice.'}"
          </p>
          <p className="text-xs text-stone-400 mt-3">A performance insight — not a medical assessment.</p>
        </div>
      </div>
    )
  }

  // ── Feedback ──
  if (phase === 'feedback') {
    const wasCorrect = answers[answers.length - 1]?.correct
    return (
      <div className="animate-fade-in max-w-2xl mx-auto text-center">
        <div className={`rounded-3xl p-6 border-2 ${wasCorrect ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          {wasCorrect ? <CheckCircle2 size={40} className="mx-auto text-green-500 mb-3" /> : <XCircle size={40} className="mx-auto text-amber-500 mb-3" />}
          <p className="text-xl font-bold text-stone-800 mb-2">{wasCorrect ? 'Well spotted!' : 'Here is the change'}</p>
          <p className="text-stone-600">{current.explanation}</p>
        </div>
      </div>
    )
  }

  // ── Compare phase ──
  if (phase === 'compare') {
    return (
      <div className="animate-fade-in max-w-3xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 flex items-center gap-1.5">
              <ArrowLeftRight size={12} /> Before
            </p>
            <SceneGrid objects={current.before} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-2 flex items-center gap-1.5">
              <Eye size={12} /> After
            </p>
            <SceneGrid objects={current.after} />
          </div>
        </div>
        <p className="text-center text-xl font-bold text-stone-800 mb-5" style={{ fontFamily: 'Georgia, serif' }}>What changed?</p>
        <div className="grid grid-cols-2 gap-3">
          {current.options.map(opt => {
            const reveal = selected !== null
            const isRight = opt === current.answerLabel
            const isPicked = selected === opt
            return (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                disabled={reveal}
                className={`min-h-[60px] rounded-2xl border-2 px-5 py-4 text-lg font-semibold transition-all ${
                  reveal && isRight ? 'bg-orange-50 border-orange-400 text-orange-800'
                  : isPicked ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-stone-200 text-stone-700 hover:border-orange-300 hover:bg-orange-50'
                }`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Study phase ──
  if (phase === 'study') {
    return (
      <div className="animate-fade-in max-w-md mx-auto">
        <p className="text-center text-stone-500 mb-4">Remember this room...</p>
        <SceneGrid objects={current.before} />
        <div className="flex items-center justify-center gap-2 mt-5 text-stone-400 text-sm">
          <ArrowRight size={15} /> Something will change
        </div>
      </div>
    )
  }

  // ── Intro ──
  return (
    <div className="text-center py-10">
      <div className="w-20 h-20 mx-auto rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center mb-5">
        <Search size={34} className="text-orange-500" />
      </div>
      <h3 className="text-2xl font-bold text-stone-800 mb-3">What Changed?</h3>
      <p className="text-stone-500 max-w-md mx-auto mb-8 leading-relaxed">
        I will show you a familiar room. Look at it carefully — then something small will change.
        Removed, moved, replaced, or brand new: can you tell what changed?
      </p>
      <button onClick={start} className="px-10 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold transition-all hover:-translate-y-0.5 shadow-lg shadow-orange-200">
        Show Me the Room
      </button>
    </div>
  )
}
