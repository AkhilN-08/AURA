import { useState, useEffect, useRef, useCallback } from 'react'
import { Clock, CheckCircle2, XCircle, ShieldCheck, Info } from 'lucide-react'
import { useGameProgress } from '../../hooks/useGameProgress'
import { useMemoryCapsule } from '../../hooks/useMemoryCapsule'
import { playMatchChime, playWinChime, playTapSound, speakText } from '../../utils/audio'
import type { GameSession } from '../../data/models'

// ── Identity: timeline / routine visual ─────────────────────────

interface RoutineStep { time: string; label: string; emoji: string }

const DEMO_ROUTINE: RoutineStep[] = [
  { time: '7:00 AM', label: 'Wake up', emoji: '☀️' },
  { time: '7:30 AM', label: 'Breakfast', emoji: '🍛' },
  { time: '8:00 AM', label: 'Morning walk', emoji: '🚶' },
  { time: '9:00 AM', label: 'Memory activity', emoji: '🧩' },
]

const DEMO_SWAPS: Record<string, RoutineStep> = {
  'Morning walk': { time: '9:00 AM', label: 'Temple visit', emoji: '🛕' },
  'Memory activity': { time: '8:00 AM', label: 'Garden watering', emoji: '💧' },
}

function buildRounds(routine: RoutineStep[]) {
  const rounds: { normal: RoutineStep[]; today: RoutineStep[]; changed: string; changedIdx: number }[] = []
  // Round 1: swap two adjacent steps (order deviation)
  if (routine.length >= 4) {
    const today = [...routine]
    const a = routine[2], b = routine[3]
    today[2] = b; today[3] = a
    rounds.push({ normal: routine, today, changed: `The order changed — ${b.label} came before ${a.label}.`, changedIdx: 2 })
  }
  // Round 2: one step replaced with a different activity
  const replaced = routine[1]
  const swap = DEMO_SWAPS[replaced.label] ?? { time: replaced.time, label: 'Evening chai with a neighbour', emoji: '☕' }
  const today2 = routine.map(s => s.label === replaced.label ? { ...swap, time: replaced.time } : s)
  rounds.push({ normal: routine, today: today2, changed: `${replaced.label} was replaced with ${swap.label}.`, changedIdx: 1 })
  return rounds
}

interface RDProps {
  onComplete?: (session: GameSession) => void
}

export default function RoutineDeviation({ onComplete }: RDProps) {
  const capsule = useMemoryCapsule()
  const { seedDemo } = capsule
  useEffect(() => { seedDemo() }, [seedDemo])

  const { addSession } = useGameProgress()
  const startedAt = useRef(Date.now())
  const [consent, setConsent] = useState<boolean | null>(null)
  const [phase, setPhase] = useState<'consent' | 'show' | 'question' | 'feedback' | 'result'>('consent')
  const [roundIdx, setRoundIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answers, setAnswers] = useState<{ correct: boolean; time: number }[]>([])
  const roundStart = useRef(Date.now())

  // Build routine from capsule routines (enabled) or demo
  const capsuleRoutine = capsule.routines[0]
  const routine: RoutineStep[] = capsuleRoutine
    ? capsuleRoutine.steps.map((s, i) => ({
        time: i === 0 ? capsuleRoutine.time : '',
        label: s,
        emoji: ['☀️', '🍛', '🚶', '🧩', '☕', '🛕', '💊', '🛌'][i % 8],
      }))
    : DEMO_ROUTINE

  const rounds = buildRounds(routine)

  const finish = useCallback((finalAnswers: { correct: boolean; time: number }[]) => {
    const correct = finalAnswers.filter(a => a.correct).length
    const accuracy = finalAnswers.length > 0 ? Math.round((correct / finalAnswers.length) * 100) : 0
    const avgTime = finalAnswers.length > 0 ? finalAnswers.reduce((a, b) => a + b.time, 0) / finalAnswers.length : 0
    const session: GameSession = {
      gameType: 'routine-deviation',
      score: accuracy,
      accuracy,
      duration: Math.round((Date.now() - startedAt.current) / 1000),
      timestamp: new Date().toISOString(),
      difficulty: 'easy',
      responseTime: Math.round(avgTime * 10) / 10,
      attempts: finalAnswers.length,
      category: 'routine',
    }
    addSession(session)
    onComplete?.(session)
    if (accuracy >= 70) playWinChime(); else playMatchChime()
    setPhase('result')
  }, [addSession, onComplete])

  const startGame = () => {
    playTapSound()
    startedAt.current = Date.now()
    roundStart.current = Date.now()
    setPhase('show')
    speakText('Here is a normal day. Look at it slowly.')
    setTimeout(() => {
      setPhase('question')
      roundStart.current = Date.now()
      speakText('Now, what is different today?')
    }, 8000)
  }

  const handleChoice = (choice: string) => {
    if (selected) return
    playTapSound()
    setSelected(choice)
    const time = (Date.now() - roundStart.current) / 1000
    const correct = choice === rounds[roundIdx].changed
    const next = [...answers, { correct, time }]
    setAnswers(next)
    if (correct) playMatchChime()
    setPhase('feedback')

    setTimeout(() => {
      setSelected(null)
      if (roundIdx < rounds.length - 1) {
        setRoundIdx(i => i + 1)
        roundStart.current = Date.now()
        setPhase('show')
        speakText('Here is another day.')
        setTimeout(() => { setPhase('question'); roundStart.current = Date.now() }, 8000)
      } else {
        finish(next)
      }
    }, 2600)
  }

  // ── Consent screen (ROUTINE AWARENESS ON/OFF) ──
  if (consent === null || phase === 'consent') {
    return (
      <div className="max-w-md mx-auto text-center py-8">
        <div className="w-20 h-20 mx-auto rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center mb-5">
          <ShieldCheck size={34} className="text-violet-600" />
        </div>
        <h3 className="text-2xl font-bold text-stone-800 mb-2">Routine Awareness</h3>
        <p className="text-stone-500 mb-2 leading-relaxed">
          This activity uses your saved daily routine to play a gentle "spot the difference" game.
          Nothing is shared or monitored — it stays on this device.
        </p>
        <p className="text-xs text-stone-400 mb-8">
          You can switch Routine Awareness off at any time, and this activity will use a friendly
          demo routine instead.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => { playTapSound(); setConsent(true); startGame() }}
            className="px-8 py-4 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-all hover:-translate-y-0.5 shadow-lg shadow-violet-200"
          >
            Use My Routine
          </button>
          <button
            onClick={() => { playTapSound(); setConsent(false); startGame() }}
            className="px-8 py-4 rounded-2xl border-2 border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition-all"
          >
            Use Demo Routine
          </button>
        </div>
      </div>
    )
  }

  // ── Result ──
  if (phase === 'result') {
    const correct = answers.filter(a => a.correct).length
    const accuracy = answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0
    const avgTime = answers.length > 0 ? (answers.reduce((a, b) => a + b.time, 0) / answers.length).toFixed(1) : '0'
    return (
      <div className="animate-fade-in max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Clock size={44} className="mx-auto text-violet-500 mb-2" />
          <h3 className="text-2xl font-bold text-stone-800">Well Spotted!</h3>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6 text-center">
          <div className="bg-violet-50 rounded-2xl p-4"><p className="text-3xl font-bold text-violet-600">{accuracy}%</p><p className="text-xs text-stone-500">Deviation Detection</p></div>
          <div className="bg-violet-50 rounded-2xl p-4"><p className="text-3xl font-bold text-violet-600">{avgTime}s</p><p className="text-xs text-stone-500">Response Time</p></div>
          <div className="bg-violet-50 rounded-2xl p-4"><p className="text-3xl font-bold text-violet-600">{correct}/{answers.length}</p><p className="text-xs text-stone-500">Routine Recall</p></div>
        </div>
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 text-center">
          <p className="text-xs font-semibold text-violet-700 uppercase tracking-widest mb-2">AURA Insight</p>
          <p className="text-stone-700 text-lg" style={{ fontFamily: 'Georgia, serif' }}>
            "{accuracy >= 70
              ? 'You noticed the small changes in your day right away — your routine is familiar and strong.'
              : 'AURA noticed a difference from the saved routine. Looking at your day together, one step at a time, keeps it familiar.'}"
          </p>
          <p className="text-xs text-stone-400 mt-3">
            <Info size={12} className="inline mr-1" />
            Routine support only — this is not a medical monitoring or assessment system.
          </p>
        </div>
      </div>
    )
  }

  // ── Feedback after answering ──
  if (phase === 'feedback') {
    const r = rounds[roundIdx]
    const wasCorrect = answers[answers.length - 1]?.correct
    return (
      <div className="animate-fade-in max-w-2xl mx-auto">
        <div className={`rounded-3xl p-6 text-center border-2 ${wasCorrect ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          {wasCorrect
            ? <CheckCircle2 size={40} className="mx-auto text-green-500 mb-3" />
            : <XCircle size={40} className="mx-auto text-amber-500 mb-3" />}
          <p className="text-xl font-bold text-stone-800 mb-2">{wasCorrect ? 'You spotted it!' : 'Here is what changed'}</p>
          <p className="text-stone-600">{r.changed}</p>
        </div>
      </div>
    )
  }

  const r = rounds[roundIdx]

  // ── Question phase: pick the different step ──
  if (phase === 'question') {
    const options = r.today.map((step, i) => {
      const normalCounterpart = r.normal[i]
      return {
        step,
        isChanged: step.label !== normalCounterpart.label,
      }
    })
    const shuffled = [...options].sort(() => Math.random() - 0.4)
    return (
      <div className="animate-fade-in max-w-2xl mx-auto">
        <p className="text-center text-xl font-bold text-stone-800 mb-2" style={{ fontFamily: 'Georgia, serif' }}>What is different today?</p>
        <p className="text-center text-stone-500 text-sm mb-6">Tap the part of the day that changed.</p>
        <div className="space-y-3">
          {shuffled.map(({ step, isChanged }) => {
            const reveal = selected !== null
            const isPicked = selected === step.label
            return (
              <button
                key={step.label}
                onClick={() => handleChoice(step.label)}
                disabled={reveal}
                className={`w-full flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all ${
                  reveal && isChanged ? 'bg-violet-50 border-violet-400'
                  : isPicked ? 'bg-amber-50 border-amber-300'
                  : 'bg-white border-stone-200 hover:border-violet-300 hover:bg-violet-50/50'
                }`}
              >
                <span className="text-3xl">{step.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-stone-800 text-lg">{step.label}</p>
                  {step.time && <p className="text-sm text-stone-400">{step.time}</p>}
                </div>
                {reveal && isChanged && <CheckCircle2 size={22} className="text-violet-500" />}
                {reveal && isPicked && !isChanged && <XCircle size={22} className="text-amber-500" />}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Show phase: normal vs today timelines side by side ──
  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <p className="text-center text-stone-500 mb-6">Study the normal day. "Today" hides one small change.</p>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-stone-200 rounded-3xl p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
            <Clock size={13} /> Normal Day
          </p>
          <div className="space-y-0">
            {r.normal.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
                  {i < r.normal.length - 1 && <span className="w-0.5 h-10 bg-stone-200" />}
                </div>
                <div className="flex items-center gap-3 py-1.5">
                  <span className="text-2xl">{step.emoji}</span>
                  <div>
                    <p className="font-semibold text-stone-700">{step.label}</p>
                    {step.time && <p className="text-xs text-stone-400">{step.time}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-violet-50/50 border-2 border-violet-200 rounded-3xl p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-4 flex items-center gap-2">
            <Clock size={13} /> Today
          </p>
          <div className="space-y-0">
            {r.today.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-300" />
                  {i < r.today.length - 1 && <span className="w-0.5 h-10 bg-violet-200" />}
                </div>
                <div className="flex items-center gap-3 py-1.5">
                  <span className="text-2xl">{step.emoji}</span>
                  <div>
                    <p className="font-semibold text-stone-700">{step.label}</p>
                    {step.time && <p className="text-xs text-stone-400">{step.time}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
