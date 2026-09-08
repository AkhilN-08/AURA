import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, CheckCircle2, XCircle, Compass, Home } from 'lucide-react'
import { useGameProgress } from '../../hooks/useGameProgress'
import { useMemoryCapsule } from '../../hooks/useMemoryCapsule'
import { playMatchChime, playWinChime, playTapSound, speakText } from '../../utils/audio'
import type { GameSession } from '../../data/models'

// ── Identity: map / place / photo-inspired interface ────────────

interface PlaceQuiz {
  place: { name: string; emoji: string; description: string; memory: string; people: string[] }
  options: string[]
}

const DEMO_PLACES = [
  { name: 'Family Garden', emoji: '🌿', description: 'A small garden behind the house with rose plants.', memory: 'Ravi used to spend mornings here with Ananya.', people: ['Ananya'] },
  { name: 'Home', emoji: '🏠', description: 'The house lived in for 35 years.', memory: 'Every evening ends with tea on the front porch.', people: ['Lakshmi'] },
  { name: 'Village Temple', emoji: '🛕', description: 'The old stone temple at the end of the lane.', memory: 'Festival mornings were always spent here.', people: ['Lakshmi'] },
  { name: 'Riverside Park', emoji: '🏞️', description: 'The park by the river with the long stone bench.', memory: 'Evening walks always ended at the stone bench.', people: ['Ananya'] },
]

const EXTRA_PLACES = [
  { name: 'Neighbourhood Market', emoji: '🏪', description: 'The small market with the vegetable stalls.', memory: 'Sunday shopping happened here every week.', people: [] },
  { name: 'Old School', emoji: '🏫', description: 'The school with the red gate and mango tree.', memory: 'Stories of friends from long ago live here.', people: [] },
]

interface MPMProps {
  onComplete?: (session: GameSession) => void
}

export default function MyPlaceMemories({ onComplete }: MPMProps) {
  const capsule = useMemoryCapsule()
  const { seedDemo } = capsule
  useEffect(() => { seedDemo() }, [seedDemo])

  const { addSession } = useGameProgress()
  const startedAt = useRef(Date.now())
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'reveal' | 'result'>('intro')
  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answers, setAnswers] = useState<{ correct: boolean; time: number }[]>([])
  const qStart = useRef(Date.now())
  const [quizzes, setQuizzes] = useState<PlaceQuiz[]>([])

  const start = useCallback(() => {
    playTapSound()
    // Build quiz from capsule places + demo extras
    const capsulePlaces = capsule.places.map(p => ({
      name: p.name, emoji: p.emoji, description: p.description, memory: p.memory, people: p.people,
    }))
    const pool = [...capsulePlaces, ...EXTRA_PLACES].sort(() => Math.random() - 0.5).slice(0, 4)
    const quizList: PlaceQuiz[] = pool.map(place => {
      const wrong = DEMO_PLACES
        .concat(EXTRA_PLACES)
        .map(p => p.name)
        .filter(n => n !== place.name)
      const options = [...new Set([place.name, ...wrong])]
        .sort(() => Math.random() - 0.5)
        .slice(0, 4)
      return { place, options: [...new Set(options)] }
    })
    setQuizzes(quizList)
    startedAt.current = Date.now()
    qStart.current = Date.now()
    setPhase('quiz')
    speakText('I will show you a place you know. Where is this?')
  }, [capsule.places])

  const current = quizzes[qIdx]

  const handleAnswer = (choice: string) => {
    if (selected) return
    playTapSound()
    setSelected(choice)
    const time = (Date.now() - qStart.current) / 1000
    const correct = choice === current.place.name
    setAnswers(a => [...a, { correct, time }])
    if (correct) playMatchChime()
    setPhase('reveal')
    speakText(`This is the ${current.place.name}. ${current.place.memory}`)
  }

  const next = () => {
    playTapSound()
    setSelected(null)
    if (qIdx < quizzes.length - 1) {
      setQIdx(i => i + 1)
      qStart.current = Date.now()
      setPhase('quiz')
    } else {
      finish()
    }
  }

  const finish = useCallback(() => {
    const correct = answers.filter(a => a.correct).length
    const accuracy = answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0
    const avgTime = answers.length > 0 ? answers.reduce((a, b) => a + b.time, 0) / answers.length : 0
    const session: GameSession = {
      gameType: 'my-place-memories',
      score: accuracy,
      accuracy,
      duration: Math.round((Date.now() - startedAt.current) / 1000),
      timestamp: new Date().toISOString(),
      difficulty: 'easy',
      responseTime: Math.round(avgTime * 10) / 10,
      attempts: answers.length,
      category: 'recognition',
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
          <Compass size={44} className="mx-auto text-teal-600 mb-2" />
          <h3 className="text-2xl font-bold text-stone-800">Journey Complete</h3>
          <p className="text-stone-500">You visited {quizzes.length} familiar places.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6 text-center">
          <div className="bg-teal-50 rounded-2xl p-4"><p className="text-3xl font-bold text-teal-700">{accuracy}%</p><p className="text-xs text-stone-500">Place Recognition</p></div>
          <div className="bg-teal-50 rounded-2xl p-4"><p className="text-3xl font-bold text-teal-700">{avgTime}s</p><p className="text-xs text-stone-500">Response Time</p></div>
          <div className="bg-teal-50 rounded-2xl p-4"><p className="text-3xl font-bold text-teal-700">{correct}/{answers.length}</p><p className="text-xs text-stone-500">Memories Found</p></div>
        </div>
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 text-center">
          <p className="text-xs font-semibold text-teal-700 uppercase tracking-widest mb-2">AURA Memory</p>
          <p className="text-stone-700 text-lg" style={{ fontFamily: 'Georgia, serif' }}>
            "{accuracy >= 70
              ? 'The places you love are right where you keep them. Every visit made them a little brighter.'
              : 'Each place shared its story with you again. The garden remembers, even when names wander.'}"
          </p>
          <p className="text-xs text-stone-400 mt-3">A memory exercise — not a medical assessment.</p>
        </div>
      </div>
    )
  }

  // ── Reveal: AURA MEMORY card ──
  if (phase === 'reveal' && current) {
    const wasCorrect = answers[answers.length - 1]?.correct
    return (
      <div className="animate-fade-in max-w-md mx-auto">
        <div className="rounded-3xl overflow-hidden border-2 border-teal-100 shadow-lg">
          <div className="bg-gradient-to-br from-teal-100 to-emerald-100 py-10 text-center relative">
            <span className="text-7xl">{current.place.emoji}</span>
            <div className="absolute bottom-3 right-3 bg-white/80 rounded-full px-3 py-1 text-xs font-semibold text-teal-700 flex items-center gap-1">
              <MapPin size={11} /> {current.place.name}
            </div>
          </div>
          <div className="bg-white p-6">
            <p className="text-xs font-semibold text-teal-700 uppercase tracking-widest mb-2">AURA Memory</p>
            <h3 className="text-xl font-bold text-stone-800 mb-2">This is the {current.place.name}.</h3>
            <p className="text-stone-600 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
              {current.place.memory}
            </p>
            {current.place.people.length > 0 && (
              <div className="flex items-center gap-2 mt-4">
                {current.place.people.map(p => (
                  <span key={p} className="text-sm bg-teal-50 text-teal-700 rounded-full px-3 py-1 font-medium">{p}</span>
                ))}
              </div>
            )}
            <div className={`mt-5 flex items-center gap-2 text-sm font-medium ${wasCorrect ? 'text-green-600' : 'text-amber-600'}`}>
              {wasCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {wasCorrect ? 'You knew this place' : 'Now you know it again'}
            </div>
          </div>
        </div>
        <button onClick={next} className="w-full mt-5 min-h-[56px] rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-lg font-semibold transition-all flex items-center justify-center gap-2">
          {qIdx < quizzes.length - 1 ? 'Next Place' : 'See My Journey'} <Home size={18} />
        </button>
      </div>
    )
  }

  // ── Quiz ──
  if (phase === 'quiz' && current) {
    return (
      <div className="animate-fade-in max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-stone-500">Place {qIdx + 1} of {quizzes.length}</span>
          <div className="flex gap-1">
            {quizzes.map((_, i) => (
              <span key={i} className={`h-2 rounded-full transition-all ${i <= qIdx ? 'w-6 bg-teal-500' : 'w-2 bg-stone-200'}`} />
            ))}
          </div>
        </div>
        {/* Photo-style place card */}
        <div className="rounded-3xl overflow-hidden border-4 border-white shadow-xl mb-6">
          <div className="bg-gradient-to-br from-teal-100 via-emerald-50 to-amber-50 py-14 text-center">
            <span className="text-8xl drop-shadow-md">{current.place.emoji}</span>
          </div>
        </div>
        <p className="text-center text-xl font-bold text-stone-800 mb-5" style={{ fontFamily: 'Georgia, serif' }}>Where is this?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {current.options.map(opt => {
            const reveal = selected !== null
            const isRight = opt === current.place.name
            const isPicked = selected === opt
            return (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                disabled={reveal}
                className={`min-h-[60px] rounded-2xl border-2 px-5 py-4 text-lg font-semibold transition-all flex items-center gap-2 ${
                  reveal && isRight ? 'bg-teal-50 border-teal-400 text-teal-800'
                  : isPicked ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-stone-200 text-stone-700 hover:border-teal-300 hover:bg-teal-50'
                }`}
              >
                {reveal && isRight && <CheckCircle2 size={20} className="text-teal-600 flex-shrink-0" />}
                {reveal && isPicked && !isRight && <XCircle size={20} className="text-amber-500 flex-shrink-0" />}
                {opt}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Intro ──
  return (
    <div className="text-center py-10">
      <div className="w-20 h-20 mx-auto rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center mb-5">
        <MapPin size={34} className="text-teal-600" />
      </div>
      <h3 className="text-2xl font-bold text-stone-800 mb-3">My Place, My Memories</h3>
      <p className="text-stone-500 max-w-md mx-auto mb-8 leading-relaxed">
        A little journey through the places that shaped your days. I will show you a spot —
        you tell me where it is, and the place will share its memory with you.
      </p>
      <button onClick={start} className="px-10 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-lg font-semibold transition-all hover:-translate-y-0.5 shadow-lg shadow-teal-200">
        Begin the Journey
      </button>
    </div>
  )
}
