import { useState, useEffect, useRef, useCallback } from 'react'
import { BookOpen, CheckCircle2, XCircle, BookMarked, Sparkles } from 'lucide-react'
import { useGameProgress } from '../../hooks/useGameProgress'
import { useMemoryCapsule } from '../../hooks/useMemoryCapsule'
import { useAuth } from '../../hooks/useAuth'
import { playMatchChime, playWinChime, playTapSound, speakText } from '../../utils/audio'
import type { GameSession } from '../../data/models'

// ── Identity: storybook / memory-journal feel ───────────────────

interface StoryQuestion {
  q: string
  answer: string
  type: 'factual' | 'sequence' | 'person' | 'place'
}

interface Story {
  title: string
  pages: { text: string; emoji: string }[]
  questions: StoryQuestion[]
}

function buildStory(
  user: string,
  people: { name: string; emoji: string; relationship: string }[],
  places: { name: string; emoji: string; memory: string }[],
  events: { name: string; emoji: string; story: string; dateLabel: string }[],
): Story {
  const main = user || 'Ravi'
  const companion = people[0] ?? { name: 'Ananya', emoji: '👧', relationship: 'daughter' }
  const second = people[1] ?? { name: 'Lakshmi', emoji: '👩', relationship: 'wife' }
  const place = places[0] ?? { name: 'Family Garden', emoji: '🌿', memory: '' }
  const event = events[0] ?? null

  const pages = [
    { text: `${main} went to the ${place.name} in the morning. The air was cool and the flowers were awake.`, emoji: '🌅' },
    { text: `${companion.name}, ${main}'s ${companion.relationship}, joined him there.`, emoji: companion.emoji },
    { text: `Together they watered the roses and arranged the flowers.`, emoji: '🌹' },
    { text: `Later, they had tea and watched the birds. ${second.name} called them in for lunch.`, emoji: '🍵' },
  ]

  const questions: StoryQuestion[] = [
    { q: `Where did ${main} go?`, answer: place.name, type: 'place' },
    { q: `Who joined ${main} in the garden?`, answer: companion.name, type: 'person' },
    { q: `What did they do together?`, answer: 'Watered the roses', type: 'factual' },
    { q: `What happened after the flowers?`, answer: 'Tea', type: 'sequence' },
  ]

  if (event) {
    pages.push({ text: `It reminded ${main} of the ${event.name} of ${event.dateLabel}. What a lovely day that was.`, emoji: event.emoji })
    questions.push({ q: `Which memory did the morning remind ${main} of?`, answer: event.name, type: 'factual' })
  }

  return { title: `A Morning in the ${place.name}`, pages, questions }
}

interface MSTProps {
  onComplete?: (session: GameSession) => void
}

export default function MemoryStory({ onComplete }: MSTProps) {
  const capsule = useMemoryCapsule()
  const { seedDemo } = capsule
  useEffect(() => { seedDemo() }, [seedDemo])

  const { user } = useAuth()
  const { addSession } = useGameProgress()
  const startedAt = useRef(Date.now())

  const story = buildStory(
    user?.name ?? 'Ravi',
    capsule.people.map(p => ({ name: p.name, emoji: p.emoji, relationship: p.relationship.toLowerCase() })),
    capsule.places.map(p => ({ name: p.name, emoji: p.emoji, memory: p.memory })),
    capsule.events.map(e => ({ name: e.name, emoji: e.emoji, story: e.story, dateLabel: e.dateLabel })),
  )

  const [phase, setPhase] = useState<'intro' | 'reading' | 'questions' | 'result'>('intro')
  const [pageIdx, setPageIdx] = useState(0)
  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answers, setAnswers] = useState<{ correct: boolean; time: number }[]>([])
  const qStart = useRef(Date.now())

  const start = () => {
    playTapSound()
    startedAt.current = Date.now()
    setPhase('reading')
    setPageIdx(0)
    speakText(`Let me tell you a little story. ${story.pages[0].text}`)
  }

  // Read each page aloud as it turns
  useEffect(() => {
    if (phase !== 'reading') return
    speakText(story.pages[pageIdx].text)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIdx, phase])

  const turnPage = () => {
    playTapSound()
    if (pageIdx < story.pages.length - 1) {
      setPageIdx(i => i + 1)
    } else {
      setPhase('questions')
      qStart.current = Date.now()
      speakText('Now, a few questions about the story.')
    }
  }

  const handleAnswer = (choice: string) => {
    if (selected) return
    playTapSound()
    setSelected(choice)
    const time = (Date.now() - qStart.current) / 1000
    const correct = choice === story.questions[qIdx].answer
    setAnswers(a => [...a, { correct, time }])
    if (correct) playMatchChime()
    speakText(correct ? 'Well remembered.' : `It was ${story.questions[qIdx].answer}.`)

    setTimeout(() => {
      setSelected(null)
      if (qIdx < story.questions.length - 1) {
        setQIdx(i => i + 1)
        qStart.current = Date.now()
      } else {
        finish()
      }
    }, 1500)
  }

  const finish = useCallback(() => {
    const finalAnswers = answers
    const correct = finalAnswers.filter(a => a.correct).length
    const accuracy = finalAnswers.length > 0 ? Math.round((correct / finalAnswers.length) * 100) : 0
    const avgTime = finalAnswers.length > 0 ? finalAnswers.reduce((a, b) => a + b.time, 0) / finalAnswers.length : 0
    const session: GameSession = {
      gameType: 'memory-story',
      score: accuracy,
      accuracy,
      duration: Math.round((Date.now() - startedAt.current) / 1000),
      timestamp: new Date().toISOString(),
      difficulty: 'easy',
      responseTime: Math.round(avgTime * 10) / 10,
      attempts: finalAnswers.length,
      category: 'memory',
    }
    addSession(session)
    onComplete?.(session)
    if (accuracy >= 60) playWinChime()
    setPhase('result')
  }, [answers, addSession, onComplete])

  // Choice distractors per question
  const choicesFor = (q: StoryQuestion): string[] => {
    const pool = new Set<string>([q.answer])
    if (q.type === 'person') {
      for (const p of capsule.people) if (p.name !== q.answer) pool.add(p.name)
      pool.add('A neighbour')
    } else if (q.type === 'place') {
      for (const p of capsule.places) if (p.name !== q.answer) pool.add(p.name)
      pool.add('The market')
      pool.add('The temple')
    } else {
      pool.add('Watered the roses', )
      pool.add('Cooked lunch')
      pool.add('Slept in the shade')
      pool.add('Went for a walk')
      pool.add('The Family Gathering')
      pool.add('A festival')
    }
    pool.delete(undefined as unknown as string)
    return [...pool].filter(Boolean).slice(0, 4).sort(() => Math.random() - 0.5)
  }

  // ── Result ──
  if (phase === 'result') {
    const correct = answers.filter(a => a.correct).length
    const accuracy = answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0
    const byType = (t: StoryQuestion['type']) => {
      const rel = story.questions.map((q, i) => ({ q, a: answers[i] })).filter(x => x.q.type === t)
      if (rel.length === 0) return null
      return Math.round(rel.filter(x => x.a?.correct).length / rel.length * 100)
    }
    const personScore = byType('person')
    const placeScore = byType('place')
    const seqScore = byType('sequence')

    let insight = 'The story settled in beautifully. Familiar stories are the kindest exercise for memory.'
    if (personScore !== null && placeScore !== null && personScore >= 70 && placeScore >= 70 && (seqScore === null || seqScore < 70)) {
      insight = 'You recalled familiar people and places strongly, while event sequencing needs more practice.'
    } else if (accuracy >= 80) {
      insight = 'You held every thread of the story — people, places, and the order they came in.'
    } else if (accuracy >= 50) {
      insight = 'The people and places of the story stayed with you clearly. Reading it again will draw in the rest.'
    }

    return (
      <div className="animate-fade-in max-w-lg mx-auto">
        <div className="text-center mb-8">
          <BookMarked size={44} className="mx-auto text-rose-500 mb-2" />
          <h3 className="text-2xl font-bold text-stone-800">The Story Ends</h3>
          <p className="text-stone-500">But the memory stays with you.</p>
        </div>

        {/* Journal-style summary */}
        <div className="rounded-3xl border-2 border-rose-100 bg-[#FFF9F5] p-6 mb-6 shadow-sm"
             style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(244,114,182,0.08) 32px)' }}>
          <p className="text-xs font-semibold text-rose-400 uppercase tracking-widest mb-4 text-center">Memory Journal</p>
          <div className="space-y-3">
            {story.questions.map((q, i) => (
              <div key={i} className="flex items-center gap-3">
                {answers[i]?.correct
                  ? <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                  : <XCircle size={18} className="text-amber-500 flex-shrink-0" />}
                <p className="text-stone-600 text-sm">{q.q}</p>
                {!answers[i]?.correct && <span className="text-stone-400 text-xs ml-auto">{q.answer}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 text-center">
          <div className="bg-rose-50 rounded-2xl p-4"><p className="text-3xl font-bold text-rose-600">{accuracy}%</p><p className="text-xs text-stone-500">Story Recall</p></div>
          <div className="bg-rose-50 rounded-2xl p-4"><p className="text-3xl font-bold text-rose-600">{correct}/{answers.length}</p><p className="text-xs text-stone-500">Details Held</p></div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center">
          <p className="text-xs font-semibold text-rose-700 uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
            <Sparkles size={12} /> AURA Insight
          </p>
          <p className="text-stone-700 text-lg" style={{ fontFamily: 'Georgia, serif' }}>"{insight}"</p>
          <p className="text-xs text-stone-400 mt-3">A performance insight — not a medical assessment.</p>
        </div>
      </div>
    )
  }

  // ── Questions ──
  if (phase === 'questions') {
    const q = story.questions[qIdx]
    const choices = choicesFor(q)
    return (
      <div className="animate-fade-in max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm text-stone-500">Question {qIdx + 1} of {story.questions.length}</span>
          <div className="flex gap-1">
            {story.questions.map((_, i) => (
              <span key={i} className={`h-2 rounded-full transition-all ${i <= qIdx ? 'w-6 bg-rose-400' : 'w-2 bg-stone-200'}`} />
            ))}
          </div>
        </div>
        <div className="rounded-3xl border-2 border-rose-100 bg-[#FFF9F5] p-8 text-center mb-6">
          <BookOpen size={22} className="mx-auto text-rose-400 mb-3" />
          <p className="text-2xl font-semibold text-stone-800" style={{ fontFamily: 'Georgia, serif' }}>{q.q}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {choices.map(c => {
            const reveal = selected !== null
            const isRight = c === q.answer
            const isPicked = selected === c
            return (
              <button
                key={c}
                onClick={() => handleAnswer(c)}
                disabled={reveal}
                className={`min-h-[64px] rounded-2xl border-2 px-5 py-4 text-lg font-medium transition-all ${
                  reveal && isRight ? 'bg-green-50 border-green-400 text-green-800'
                  : isPicked ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-stone-200 text-stone-700 hover:border-rose-300 hover:bg-rose-50'
                }`}
              >
                {reveal && isRight && <CheckCircle2 size={20} className="inline mr-2 text-green-600" />}
                {reveal && isPicked && !isRight && <XCircle size={20} className="inline mr-2 text-amber-500" />}
                {c}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Reading (storybook pages) ──
  if (phase === 'reading') {
    const page = story.pages[pageIdx]
    return (
      <div className="animate-fade-in max-w-md mx-auto">
        {/* Storybook spread */}
        <div className="rounded-3xl overflow-hidden border-2 border-amber-100 shadow-[0_10px_40px_rgba(150,100,50,0.12)] bg-[#FFFDF8] mb-6">
          <div className="bg-gradient-to-br from-amber-50 to-rose-50 py-8 text-center border-b border-amber-100">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-600 font-semibold mb-1">{story.title}</p>
            <p className="text-[11px] text-amber-400">page {pageIdx + 1} of {story.pages.length}</p>
          </div>
          <div className="px-8 py-10 text-center">
            <span className="text-6xl block mb-6">{page.emoji}</span>
            <p className="text-xl leading-relaxed text-stone-700" style={{ fontFamily: 'Georgia, serif' }}>
              {page.text}
            </p>
          </div>
          <button
            onClick={turnPage}
            className="w-full py-4 bg-rose-400 hover:bg-rose-500 text-white font-semibold text-lg transition-colors flex items-center justify-center gap-2"
          >
            {pageIdx < story.pages.length - 1 ? 'Turn the Page' : 'I Read the Story'}
            <span aria-hidden>→</span>
          </button>
        </div>
        <p className="text-center text-stone-400 text-sm flex items-center justify-center gap-1.5">
          <BookOpen size={14} /> Take your time with each page
        </p>
      </div>
    )
  }

  // ── Intro ──
  return (
    <div className="text-center py-10">
      <div className="w-20 h-20 mx-auto rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mb-5">
        <BookOpen size={34} className="text-rose-500" />
      </div>
      <h3 className="text-2xl font-bold text-stone-800 mb-3">Memory Story</h3>
      <p className="text-stone-500 max-w-md mx-auto mb-8 leading-relaxed">
        A little story drawn from your own memories — the people and places you hold dear.
        I will read it to you, page by page, and then we will talk about it.
      </p>
      <button onClick={start} className="px-10 py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-lg font-semibold transition-all hover:-translate-y-0.5 shadow-lg shadow-rose-200">
        Open the Storybook
      </button>
    </div>
  )
}
