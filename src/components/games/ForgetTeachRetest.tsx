import { useState, useEffect, useCallback, useRef } from 'react'
import { Sprout, Eye, BookOpen, RefreshCw, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { useGameProgress } from '../../hooks/useGameProgress'
import { useMemoryCapsule } from '../../hooks/useMemoryCapsule'
import { playMatchChime, playWinChime, playTapSound, speakText } from '../../utils/audio'
import type { GameSession } from '../../data/models'

// ── Identity: clear three-stage progression (recall → teach → retest) ──

interface Subject {
  id: string
  kind: 'person' | 'object' | 'place'
  name: string
  emoji: string
  relationship: string   // "Ravi's daughter" / "on the kitchen shelf" / "behind the house"
  description: string
}

function buildSubjects(
  people: { name: string; emoji: string; relationship: string; description: string }[],
  objects: { name: string; emoji: string; belongsTo: string; description: string }[],
  places: { name: string; emoji: string; description: string }[],
): Subject[] {
  const out: Subject[] = []
  for (const p of people.slice(0, 2)) {
    out.push({
      id: `p-${p.name}`, kind: 'person', name: p.name, emoji: p.emoji,
      relationship: `family — ${p.relationship}`, description: p.description,
    })
  }
  for (const o of objects.slice(0, 1)) {
    out.push({
      id: `o-${o.name}`, kind: 'object', name: o.name, emoji: o.emoji,
      relationship: o.belongsTo, description: o.description,
    })
  }
  for (const pl of places.slice(0, 1)) {
    out.push({
      id: `pl-${pl.name}`, kind: 'place', name: pl.name, emoji: pl.emoji,
      relationship: 'a familiar place', description: pl.description,
    })
  }
  if (out.length === 0) {
    return [
      { id: 'd-ananya', kind: 'person', name: 'Ananya', emoji: '👧', relationship: "Ravi's daughter", description: 'She loves gardening and evening walks.' },
      { id: 'd-radio', kind: 'object', name: 'Radio', emoji: '📻', relationship: 'on the kitchen shelf', description: 'An old radio that plays morning bhajans.' },
      { id: 'd-garden', kind: 'place', name: 'Family Garden', emoji: '🌿', relationship: 'behind the house', description: 'A small garden full of rose plants.' },
    ]
  }
  return out
}

interface Round {
  subject: Subject
  options: string[]
  firstCorrect: boolean | null
  retestCorrect: boolean | null
}

interface FTRProps {
  onComplete?: (session: GameSession) => void
}

export default function ForgetTeachRetest({ onComplete }: FTRProps) {
  const capsule = useMemoryCapsule()
  const { seedDemo } = capsule
  useEffect(() => { seedDemo() }, [seedDemo])

  const subjects = buildSubjects(
    capsule.people.map(p => ({ name: p.name, emoji: p.emoji, relationship: p.relationship, description: p.description })),
    capsule.objects.map(o => ({ name: o.name, emoji: o.emoji, belongsTo: o.belongsTo, description: o.description })),
    capsule.places.map(pl => ({ name: pl.name, emoji: pl.emoji, description: pl.description })),
  )

  const { addSession } = useGameProgress()
  const startedAt = useRef(Date.now())
  const [phase, setPhase] = useState<'intro' | 'recall' | 'teach' | 'absorb' | 'retest' | 'result'>('intro')
  const [roundIdx, setRoundIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [rounds, setRounds] = useState<Round[]>([])
  const [responseTimes, setResponseTimes] = useState<number[]>([])
  const stageStart = useRef(Date.now())

  // Build the round plan once subjects are known
  const plan: Round[] = subjects.slice(0, 3).map(s => {
    const others = subjects.filter(x => x.id !== s.id).map(x => x.name)
    return { subject: s, options: shuffle([s.name, ...others.slice(0, 3)]), firstCorrect: null, retestCorrect: null }
  })

  const start = () => {
    playTapSound()
    startedAt.current = Date.now()
    stageStart.current = Date.now()
    setPhase('recall')
    speakText('Let us meet some familiar things. If something slips away, I will gently teach it again.')
  }

  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const current = plan[roundIdx]

  // ── Stage 1: RECALL ──
  const handleFirstAnswer = (choice: string) => {
    if (selected) return
    playTapSound()
    setSelected(choice)
    const time = (Date.now() - stageStart.current) / 1000
    setResponseTimes(t => [...t, time])
    const correct = choice === current.subject.name
    setRounds(r => [...r, { ...current, firstCorrect: correct }])
    if (correct) {
      playMatchChime()
      speakText(`Yes, this is ${current.subject.name}.`)
      setTimeout(() => advance('skipped-teach'), 1200)
    } else {
      speakText('That is alright. Let me show you again.')
      setTimeout(() => { setSelected(null); setPhase('teach') }, 1200)
    }
  }

  const advance = (mode: 'skipped-teach' | 'taught') => {
    // After a teach, we retest; after a correct recall, we retest too (comparing memory)
    setSelected(null)
    stageStart.current = Date.now()
    setPhase('retest')
    if (mode === 'taught') {
      speakText(`Now, after a moment — who is this?`)
    }
  }

  // ── Stage 2: TEACH (only after incorrect) ──
  useEffect(() => {
    if (phase !== 'teach') return
    speakText(`This is ${current.subject.name}. ${current.subject.name} is ${current.subject.relationship}. ${current.subject.description}`)
    const t = setTimeout(() => setPhase('absorb'), 5200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // A filler beat between teach and retest so retest isn't immediate
  useEffect(() => {
    if (phase !== 'absorb') return
    const t = setTimeout(() => {
      stageStart.current = Date.now()
      setPhase('retest')
    }, 3000)
    return () => clearTimeout(t)
  }, [phase])

  // ── Stage 3: RETEST ──
  const handleRetest = (choice: string) => {
    if (selected) return
    playTapSound()
    setSelected(choice)
    const time = (Date.now() - stageStart.current) / 1000
    setResponseTimes(t => [...t, time])
    const correct = choice === current.subject.name
    setRounds(r => {
      const next = [...r]
      const idx = next.findIndex(x => x.subject.id === current.subject.id)
      if (idx >= 0) next[idx] = { ...next[idx], retestCorrect: correct }
      return next
    })
    if (correct) playMatchChime()
    speakText(correct ? `Beautiful. You remembered ${current.subject.name}.` : `It is ${current.subject.name}. We will meet again soon.`)

    setTimeout(() => {
      setSelected(null)
      if (roundIdx < plan.length - 1) {
        setRoundIdx(i => i + 1)
        stageStart.current = Date.now()
        setPhase('recall')
      } else {
        finish()
      }
    }, 1500)
  }

  const finish = useCallback(() => {
    const completed = rounds.filter(r => r.retestCorrect !== null)
    const correct = completed.filter(r => r.retestCorrect).length
    const accuracy = completed.length > 0 ? Math.round((correct / completed.length) * 100) : 0
    const avgTime = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0
    const session: GameSession = {
      gameType: 'forget-teach-retest',
      score: accuracy,
      accuracy,
      duration: Math.round((Date.now() - startedAt.current) / 1000),
      timestamp: new Date().toISOString(),
      difficulty: 'moderate',
      responseTime: Math.round(avgTime * 10) / 10,
      attempts: completed.length,
      category: 'recognition',
    }
    addSession(session)
    onComplete?.(session)
    if (accuracy >= 60) playWinChime()
    setPhase('result')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rounds, responseTimes, addSession, onComplete])

  const stageHeader = (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[
        { key: 'recall', label: 'Recall', icon: Eye },
        { key: 'teach', label: 'Teach', icon: BookOpen },
        { key: 'retest', label: 'Retest', icon: RefreshCw },
      ].map((s, i) => {
        const order = ['recall', 'teach', 'absorb', 'retest']
        const active = s.key === phase || (s.key === 'teach' && phase === 'absorb')
        const doneIdx = order.indexOf(phase)
        const thisIdx = order.indexOf(s.key === 'teach' ? 'teach' : s.key)
        const done = doneIdx > thisIdx
        return (
          <div key={s.key} className="flex items-center">
            {i > 0 && <span className={`w-6 h-0.5 mx-1 rounded ${done ? 'bg-emerald-400' : 'bg-stone-200'}`} />}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              active ? 'bg-emerald-100 text-emerald-700' : done ? 'bg-stone-100 text-stone-500' : 'bg-stone-50 text-stone-400'
            }`}>
              <s.icon size={14} />
              {s.label}
            </div>
          </div>
        )
      })}
    </div>
  )

  // ── Result ──
  if (phase === 'result') {
    const completed = rounds.filter(r => r.retestCorrect !== null)
    const improved = completed.filter(r => r.firstCorrect === false && r.retestCorrect === true).length
    const accuracy = completed.length > 0 ? Math.round(completed.filter(r => r.retestCorrect).length / completed.length * 100) : 0
    const avgTime = responseTimes.length > 0 ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1) : '0'
    return (
      <div className="animate-fade-in max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Sprout size={44} className="mx-auto text-emerald-600 mb-2" />
          <h3 className="text-2xl font-bold text-stone-800">Learning Cycle Complete</h3>
          <p className="text-stone-500 mt-1">Here is how the remembering went.</p>
        </div>

        <div className="space-y-4 mb-6">
          {completed.map(r => (
            <div key={r.subject.id} className="bg-white border border-stone-200 rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-3xl flex-shrink-0">
                  {r.subject.emoji}
                </div>
                <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-1">Before</p>
                    {r.firstCorrect
                      ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckCircle2 size={13} /> Known</span>
                      : <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600"><XCircle size={13} /> Slipped</span>}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-1">Teach</p>
                    <span className="text-xs text-stone-500">AURA reintroduced</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-1">After</p>
                    {r.retestCorrect
                      ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckCircle2 size={13} /> Recalled</span>
                      : <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500"><RefreshCw size={13} /> Growing</span>}
                  </div>
                </div>
              </div>
              <p className="text-sm text-stone-600 mt-3 pl-[72px]">
                <strong>{r.subject.name}</strong> — {r.subject.relationship}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6 text-center">
          <div className="bg-stone-50 rounded-2xl p-3"><p className="text-2xl font-bold text-emerald-600">{accuracy}%</p><p className="text-xs text-stone-500">Recognition</p></div>
          <div className="bg-stone-50 rounded-2xl p-3"><p className="text-2xl font-bold text-emerald-600">{improved}</p><p className="text-xs text-stone-500">Relearned</p></div>
          <div className="bg-stone-50 rounded-2xl p-3"><p className="text-2xl font-bold text-emerald-600">{avgTime}s</p><p className="text-xs text-stone-500">Avg. response</p></div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-widest mb-2">AURA Insight</p>
          <p className="text-stone-700 text-lg" style={{ fontFamily: 'Georgia, serif' }}>
            "{improved > 0
              ? 'You successfully recalled the information after reinforcement. That is exactly how memory grows.'
              : 'You already knew these familiar things — a wonderful sign of a well-kept memory.'}"
          </p>
          <p className="text-xs text-stone-400 mt-3">A learning insight — not a medical assessment.</p>
        </div>
      </div>
    )
  }

  // ── TEACH stage ──
  if (phase === 'teach' || phase === 'absorb') {
    return (
      <div className="animate-fade-in max-w-md mx-auto text-center">
        {stageHeader}
        <p className="text-sm uppercase tracking-widest text-emerald-600 font-semibold mb-6">
          {phase === 'teach' ? 'Let me show you again' : 'Take a moment with this'}
        </p>
        <div className="bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-100 rounded-3xl p-8">
          <div className="w-28 h-28 mx-auto rounded-3xl bg-white shadow-md flex items-center justify-center text-6xl mb-5">
            {current.subject.emoji}
          </div>
          <h3 className="text-3xl font-bold text-stone-800" style={{ fontFamily: 'Georgia, serif' }}>
            This is {current.subject.name}
          </h3>
          <p className="text-emerald-700 font-medium mt-2">{current.subject.name} is {current.subject.relationship}.</p>
          <p className="text-stone-500 mt-3">{current.subject.description}</p>
        </div>
        {phase === 'teach' && (
          <p className="text-stone-400 text-sm mt-6 flex items-center justify-center gap-2">
            <BookOpen size={14} /> Reading aloud for you...
          </p>
        )}
      </div>
    )
  }

  // ── RECALL / RETEST stages ──
  if (phase === 'recall' || phase === 'retest') {
    const isRetest = phase === 'retest'
    return (
      <div className="animate-fade-in max-w-md mx-auto">
        {stageHeader}
        <div className="bg-gradient-to-b from-stone-50 to-white border-2 border-stone-100 rounded-3xl p-8 text-center mb-6">
          <div className="w-28 h-28 mx-auto rounded-3xl bg-white shadow-md flex items-center justify-center text-6xl mb-4">
            {current.subject.emoji}
          </div>
          <h3 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Georgia, serif' }}>
            {current.subject.kind === 'person' ? 'Who is this?' : current.subject.kind === 'place' ? 'What place is this?' : 'What is this?'}
          </h3>
          {isRetest && <p className="text-emerald-600 text-sm mt-2">A gentle second look</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {current.options.map(opt => {
            const reveal = selected !== null
            const isRight = opt === current.subject.name
            const isPicked = selected === opt
            return (
              <button
                key={opt}
                onClick={() => isRetest ? handleRetest(opt) : handleFirstAnswer(opt)}
                disabled={reveal}
                className={`min-h-[60px] rounded-2xl border-2 px-5 py-4 text-lg font-semibold transition-all ${
                  reveal && isRight ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                  : isPicked ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-stone-200 text-stone-700 hover:border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                {opt}
              </button>
            )
          })}
        </div>
        <p className="text-center text-stone-400 text-sm mt-6">If the answer slips away, AURA will teach it — no pressure.</p>
      </div>
    )
  }

  // ── Intro ──
  return (
    <div className="text-center py-10">
      <div className="flex items-center justify-center gap-3 mb-6">
        {[{ icon: Eye, label: 'Recall' }, { icon: BookOpen, label: 'Teach' }, { icon: RefreshCw, label: 'Retest' }].map((s, i) => (
          <div key={s.label} className="flex items-center gap-3">
            {i > 0 && <ArrowRight size={16} className="text-stone-300" />}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <s.icon size={22} className="text-emerald-600" />
              </div>
              <span className="text-xs font-semibold text-stone-500">{s.label}</span>
            </div>
          </div>
        ))}
      </div>
      <h3 className="text-2xl font-bold text-stone-800 mb-3">Remember & Relearn</h3>
      <p className="text-stone-500 max-w-md mx-auto mb-8 leading-relaxed">
        We will meet some familiar people and things. If a name slips away, AURA will gently
        teach it again and give you a second chance. Forgetting here is simply the first step of learning.
      </p>
      <button onClick={start} className="px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-semibold transition-all hover:-translate-y-0.5 shadow-lg shadow-emerald-200">
        Begin the Cycle
      </button>
    </div>
  )
}
