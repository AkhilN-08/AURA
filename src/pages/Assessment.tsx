import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, type AssessmentResult } from '../hooks/useAuth'
import gsap from 'gsap'
import {
  Brain, Eye, Hash, Sparkles, Clock, CheckCircle2,
  ArrowRight, ArrowLeft, Heart
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Test data                                                          */
/* ------------------------------------------------------------------ */

const OBJECT_SETS: string[][] = [
  ['🏠', '🌸', '📖', '🍵'],
  ['🏔️', '🪷', '🎋', '🏮'],
  ['🧥', '🍵', '🪷', '🏔️'],
  ['🏮', '📖', '🧥', '🏠'],
]

const SEQUENCES: number[][] = [
  [3, 7, 1, 9],
  [5, 2, 8, 4, 6],
  [1, 9, 3, 7, 5, 2],
  [4, 8, 2, 6, 1, 9, 5],
]

const WORD_SETS: string[][] = [
  ['garden', 'river', 'temple', 'music'],
  ['mountain', 'spice', 'river', 'temple', 'garden'],
  ['lantern', 'garden', 'flower', 'river', 'temple', 'music'],
  ['spice', 'mountain', 'lantern', 'garden', 'flower', 'river'],
]

const FOCUS_GRIDS: { items: string[][]; answer: [number, number] }[] = [
  {
    items: [
      ['🟢', '🟢', '🟢'],
      ['🟢', '🟡', '🟢'],
      ['🟢', '🟢', '🟢'],
    ],
    answer: [1, 1],
  },
  {
    items: [
      ['🔵', '🔵', '🔵', '🔵'],
      ['🔵', '🔵', '🔴', '🔵'],
      ['🔵', '🔵', '🔵', '🔵'],
    ],
    answer: [1, 2],
  },
  {
    items: [
      ['🟠', '🟠', '🟠', '🟠', '🟠'],
      ['🟠', '🟠', '🟠', '🟠', '🟠'],
      ['🟠', '🟠', '🟠', '🟡', '🟠'],
      ['🟠', '🟠', '🟠', '🟠', '🟠'],
    ],
    answer: [2, 3],
  },
  {
    items: [
      ['🟣', '🟣', '🟣', '🟣'],
      ['🟣', '🟡', '🟣', '🟣'],
      ['🟣', '🟣', '🟣', '🟣'],
      ['🟣', '🟣', '🟣', '🟣'],
    ],
    answer: [1, 1],
  },
]

const TOTAL_STEPS = 5

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pick<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}

/* ------------------------------------------------------------------ */
/*  Step 1 — Object Recall                                             */
/* ------------------------------------------------------------------ */

function StepObjectRecall({ onComplete }: { onComplete: (score: number) => void }) {
  const [phase, setPhase] = useState<'show' | 'hide' | 'answer' | 'done'>('show')
  const [showIdx] = useState(() => Math.floor(Math.random() * OBJECT_SETS.length))
  const [objects] = useState(() => OBJECT_SETS[showIdx])
  const [options, setOptions] = useState<string[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const allObjects = ['🏠', '🌸', '📖', '🍵', '🏔️', '🪷', '🎋', '🏮', '🧥', '🧣', '🪘', '🪕']
    const distractors = allObjects.filter(o => !objects.includes(o))
    setOptions(shuffle([...objects, ...pick(distractors, 3)]))
  }, [objects])

  useEffect(() => {
    if (phase === 'show') {
      timerRef.current = setTimeout(() => setPhase('hide'), 3000)
    } else if (phase === 'hide') {
      timerRef.current = setTimeout(() => setPhase('answer'), 1000)
    }
    return () => clearTimeout(timerRef.current)
  }, [phase])

  const toggle = (obj: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(obj)) next.delete(obj)
      else next.add(obj)
      return next
    })
  }

  const submit = () => {
    const correct = objects.filter(o => selected.has(o)).length
    const wrong = [...selected].filter(o => !objects.includes(o)).length
    const score = Math.max(0, Math.round(((correct - wrong) / objects.length) * 100))
    setPhase('done')
    setTimeout(() => onComplete(score), 800)
  }

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Eye size={20} className="text-sage-500" />
        <h3 className="text-lg font-semibold text-charcoal-800">Step 1 · Object Recall</h3>
      </div>
      <p className="text-charcoal-400 text-sm mb-8">
        {phase === 'show' && 'Study these objects carefully...'}
        {phase === 'hide' && 'Get ready...'}
        {phase === 'answer' && 'Which objects did you see? Select all that apply.'}
        {phase === 'done' && 'Great job!'}
      </p>

      {phase === 'show' && (
        <div className="flex justify-center gap-6 mb-8">
          {objects.map((obj, i) => (
            <div key={i} className="text-6xl animate-pulse">{obj}</div>
          ))}
        </div>
      )}

      {phase === 'hide' && (
        <div className="flex justify-center gap-6 mb-8">
          {objects.map((_, i) => (
            <div key={i} className="w-16 h-16 rounded-2xl bg-charcoal-100 animate-pulse" />
          ))}
        </div>
      )}

      {phase === 'answer' && (
        <>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {options.map((obj, i) => (
              <button
                key={i}
                onClick={() => toggle(obj)}
                className={`w-20 h-20 rounded-2xl text-4xl flex items-center justify-center transition-all duration-200
                  ${selected.has(obj)
                    ? 'bg-sage-100 border-2 border-sage-500 scale-110 shadow-lg'
                    : 'bg-white/60 border border-white/50 hover:bg-white/80 hover:scale-105'
                  }`}
              >
                {obj}
              </button>
            ))}
          </div>
          <button
            onClick={submit}
            className="btn-primary inline-flex items-center gap-2"
          >
            Confirm <ArrowRight size={16} />
          </button>
        </>
      )}

      {phase === 'done' && (
        <CheckCircle2 size={48} className="text-sage-500 mx-auto animate-bounce" />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 2 — Sequence Memory                                           */
/* ------------------------------------------------------------------ */

function StepSequence({ onComplete }: { onComplete: (score: number) => void }) {
  const [phase, setPhase] = useState<'show' | 'input' | 'done'>('show')
  const [seqIdx] = useState(() => Math.floor(Math.random() * SEQUENCES.length))
  const [sequence] = useState(() => SEQUENCES[seqIdx])
  const [tapped, setTapped] = useState<number[]>([])
  const [highlight, setHighlight] = useState(-1)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (phase !== 'show') return
    let i = 0
    const showNext = () => {
      if (i < sequence.length) {
        setHighlight(i)
        i++
        timerRef.current = setTimeout(showNext, 1200)
      } else {
        setHighlight(-1)
        timerRef.current = setTimeout(() => setPhase('input'), 800)
      }
    }
    timerRef.current = setTimeout(showNext, 1000)
    return () => clearTimeout(timerRef.current)
  }, [phase, sequence])

  const tapNumber = (n: number) => {
    if (phase !== 'input') return
    const next = [...tapped, n]
    setTapped(next)
    if (next.length === sequence.length) {
      const correct = next.filter((v, i) => v === sequence[i]).length
      const score = Math.round((correct / sequence.length) * 100)
      setPhase('done')
      setTimeout(() => onComplete(score), 800)
    }
  }

  const undoTap = () => setTapped(t => t.slice(0, -1))

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Hash size={20} className="text-amber-500" />
        <h3 className="text-lg font-semibold text-charcoal-800">Step 2 · Sequence Memory</h3>
      </div>
      <p className="text-charcoal-400 text-sm mb-8">
        {phase === 'show' && 'Memorize this sequence...'}
        {phase === 'input' && `Tap the ${sequence.length} numbers you saw, in order`}
        {phase === 'done' && 'Well done!'}
      </p>

      {phase === 'show' && (
        <div className="flex justify-center gap-3 mb-8">
          {sequence.map((num, i) => (
            <div
              key={i}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all duration-300
                ${i === highlight
                  ? 'bg-amber-400 text-white scale-125 shadow-lg'
                  : i < highlight
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-charcoal-50 text-charcoal-300'
                }`}
            >
              {i <= highlight ? num : '?'}
            </div>
          ))}
        </div>
      )}

      {phase === 'input' && (
        <>
          {/* Tapped sequence display */}
          <div className="flex justify-center gap-2 mb-6">
            {sequence.map((_, i) => (
              <div key={i} className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-200
                ${i < tapped.length
                  ? 'bg-amber-400 text-white scale-105'
                  : 'bg-charcoal-50 text-charcoal-300 border-2 border-dashed border-charcoal-200'
                }`}>
                {i < tapped.length ? tapped[i] : ''}
              </div>
            ))}
          </div>

          {/* Number pad */}
          <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto mb-4">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <button key={n} onClick={() => tapNumber(n)}
                className="h-14 rounded-2xl bg-amber-50 border border-amber-200 text-2xl font-bold text-charcoal-800 hover:bg-amber-100 active:scale-95 transition-all duration-150">
                {n}
              </button>
            ))}
          </div>
          <button onClick={undoTap} disabled={tapped.length === 0}
            className="text-sm text-charcoal-400 hover:text-charcoal-600 disabled:opacity-40 transition-colors">
            Undo
          </button>
        </>
      )}

      {phase === 'done' && (
        <CheckCircle2 size={48} className="text-amber-500 mx-auto animate-bounce" />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 3 — Focus Test                                                */
/* ------------------------------------------------------------------ */

function StepFocus({ onComplete }: { onComplete: (score: number) => void }) {
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [clicked, setClicked] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const grid = FOCUS_GRIDS[current]

  useEffect(() => {
    setStartTime(Date.now())
    setClicked(false)
  }, [current])

  const handleClick = (row: number, col: number) => {
    if (clicked) return
    setClicked(true)
    if (row === grid.answer[0] && col === grid.answer[1]) {
      setScore(s => s + 1)
    }
    setTimeout(() => {
      if (current + 1 < FOCUS_GRIDS.length) {
        setCurrent(c => c + 1)
      } else {
        const finalScore = Math.round(((score + (row === grid.answer[0] && col === grid.answer[1] ? 1 : 0)) / FOCUS_GRIDS.length) * 100)
        onComplete(finalScore)
      }
    }, 600)
  }

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Sparkles size={20} className="text-sage-500" />
        <h3 className="text-lg font-semibold text-charcoal-800">Step 3 · Focus Test</h3>
      </div>
      <p className="text-charcoal-400 text-sm mb-2">
        Find the different item in the grid as quickly as you can.
      </p>
      <p className="text-charcoal-300 text-xs mb-8">
        Round {current + 1} of {FOCUS_GRIDS.length}
      </p>

      <div className="flex justify-center gap-2 mb-8">
        {grid.items.map((row, ri) => (
          <div key={ri} className="flex flex-col gap-2">
            {row.map((cell, ci) => (
              <button
                key={ci}
                onClick={() => handleClick(ri, ci)}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl text-2xl flex items-center justify-center transition-all duration-200
                  ${clicked && ri === grid.answer[0] && ci === grid.answer[1]
                    ? 'ring-4 ring-sage-400 scale-110'
                    : 'hover:scale-105'
                  }`}
              >
                {cell}
              </button>
            ))}
          </div>
        ))}
      </div>

      {clicked && (
        <CheckCircle2 size={32} className="text-sage-500 mx-auto animate-bounce" />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 4 — Word Recall                                                */
/* ------------------------------------------------------------------ */

function StepWordRecall({ onComplete }: { onComplete: (score: number) => void }) {
  const [phase, setPhase] = useState<'show' | 'input' | 'done'>('show')
  const [setIdx] = useState(() => Math.floor(Math.random() * WORD_SETS.length))
  const [words] = useState(() => WORD_SETS[setIdx])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  // Build options: original words + distractors
  const allWords = useState(() => {
    const distractors = ['mountain', 'river', 'garden', 'temple', 'music', 'flower', 'lantern', 'spice', 'tea', 'bamboo', 'rice', 'drum']
    const extra = distractors.filter(w => !words.includes(w)).slice(0, Math.max(3, words.length))
    return shuffle([...words, ...extra])
  })[0]

  useEffect(() => {
    if (phase === 'show') {
      timerRef.current = setTimeout(() => setPhase('input'), 4000)
    }
    return () => clearTimeout(timerRef.current)
  }, [phase])

  const toggleWord = (word: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(word)) next.delete(word)
      else next.add(word)
      return next
    })
  }

  const submit = () => {
    const correct = [...selected].filter(w => words.includes(w)).length
    const score = Math.round((correct / words.length) * 100)
    setPhase('done')
    setTimeout(() => onComplete(score), 800)
  }

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Brain size={20} className="text-sage-500" />
        <h3 className="text-lg font-semibold text-charcoal-800">Step 4 · Word Recall</h3>
      </div>
      <p className="text-charcoal-400 text-sm mb-8">
        {phase === 'show' && 'Remember these words...'}
        {phase === 'input' && 'Tap the words you remember'}
        {phase === 'done' && 'Well done!'}
      </p>

      {phase === 'show' && (
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {words.map((word, i) => (
            <span key={i} className="bg-sage-100 text-sage-700 px-5 py-3 rounded-2xl text-lg font-medium animate-pulse">
              {word}
            </span>
          ))}
        </div>
      )}

      {phase === 'input' && (
        <>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {allWords.map((word, i) => (
              <button key={i} onClick={() => toggleWord(word)}
                className={`px-5 py-3 rounded-2xl text-lg font-medium transition-all duration-200
                  ${selected.has(word)
                    ? 'bg-sage-500 text-white border-2 border-sage-600 scale-105 shadow-lg'
                    : 'bg-white/60 border border-white/50 text-charcoal-700 hover:bg-white/80 hover:scale-105'
                  }`}>
                {word}
              </button>
            ))}
          </div>
          <button
            onClick={submit}
            disabled={selected.size === 0}
            className="btn-primary inline-flex items-center gap-2 disabled:opacity-40"
          >
            Confirm <ArrowRight size={16} />
          </button>
        </>
      )}

      {phase === 'done' && (
        <CheckCircle2 size={48} className="text-sage-500 mx-auto animate-bounce" />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 5 — Reaction Time                                             */
/* ------------------------------------------------------------------ */

function StepReaction({ onComplete }: { onComplete: (score: number) => void }) {
  const [phase, setPhase] = useState<'wait' | 'ready' | 'go' | 'done'>('wait')
  const [result, setResult] = useState(0)
  const goTime = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const start = () => {
    setPhase('ready')
    const delay = 1500 + Math.random() * 3000
    timerRef.current = setTimeout(() => {
      setPhase('go')
      goTime.current = Date.now()
    }, delay)
  }

  const click = () => {
    if (phase === 'ready') {
      clearTimeout(timerRef.current)
      setResult(0)
      setPhase('done')
      setTimeout(() => onComplete(0), 800)
    } else if (phase === 'go') {
      const ms = Date.now() - goTime.current
      setResult(ms)
      // Score: <300ms = 100%, 300-600ms = linear decay, >1000ms = 0
      const score = Math.max(0, Math.round(100 - ((ms - 200) / 8) ))
      setPhase('done')
      setTimeout(() => onComplete(Math.min(100, score)), 800)
    }
  }

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Clock size={20} className="text-amber-500" />
        <h3 className="text-lg font-semibold text-charcoal-800">Step 5 · Reaction Time</h3>
      </div>
      <p className="text-charcoal-400 text-sm mb-8">
        {phase === 'wait' && 'Click below to start, then click again as fast as you can when it turns green!'}
        {phase === 'ready' && 'Wait for green...'}
        {phase === 'go' && 'Click NOW!'}
        {phase === 'done' && (result > 0 ? `Your time: ${result}ms` : 'Too early! Try to wait for green.')}
      </p>

      <button
        onClick={phase === 'wait' ? start : phase === 'ready' || phase === 'go' ? click : undefined}
        className={`w-48 h-48 rounded-full text-xl font-bold transition-all duration-200 mx-auto flex items-center justify-center
          ${phase === 'wait' ? 'bg-charcoal-200 text-charcoal-600 hover:bg-charcoal-300 cursor-pointer' : ''}
          ${phase === 'ready' ? 'bg-red-400 text-white cursor-pointer animate-pulse' : ''}
          ${phase === 'go' ? 'bg-green-400 text-white cursor-pointer scale-110' : ''}
          ${phase === 'done' ? 'bg-sage-400 text-white' : ''}
        `}
      >
        {phase === 'wait' && 'Start'}
        {phase === 'ready' && 'Wait...'}
        {phase === 'go' && 'Click!'}
        {phase === 'done' && <CheckCircle2 size={40} />}
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Assessment                                                    */
/* ------------------------------------------------------------------ */

export default function Assessment() {
  const [step, setStep] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const [transitioning, setTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { completeAssessment } = useAuth()
  const navigate = useNavigate()

  const onStepComplete = useCallback((score: number) => {
    setScores(prev => {
      const next = [...prev, score]
      return next
    })
    setTransitioning(true)
    setTimeout(() => {
      setStep(s => s + 1)
      setTransitioning(false)
    }, 500)
  }, [])

  // Animate step transitions
  useEffect(() => {
    if (!containerRef.current) return
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 20, filter: 'blur(4px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' }
    )
  }, [step])

  // Calculate final result when all steps complete
  useEffect(() => {
    if (scores.length < TOTAL_STEPS) return

    const [memoryScore, sequenceScore, focusScore, wordScore, reactionMs] = scores
    const overallScore = Math.round(
      (memoryScore * 0.25 + sequenceScore * 0.25 + focusScore * 0.2 + wordScore * 0.2 + Math.min(100, Math.max(0, 100 - reactionMs / 10)) * 0.1)
    )

    let level: AssessmentResult['level']
    if (overallScore >= 75) level = 'mild'
    else if (overallScore >= 45) level = 'moderate'
    else level = 'significant'

    // Recommend games based on weakest areas
    const gameScores: [string, number][] = [
      ['memory-match', memoryScore],
      ['sequence-recall', sequenceScore],
      ['object-recall', wordScore],
    ]
    gameScores.sort((a, b) => a[1] - b[1]) // weakest first
    const recommended = gameScores.map(g => g[0])

    const result: AssessmentResult = {
      memoryScore,
      sequenceScore,
      focusScore,
      wordScore,
      reactionTime: reactionMs,
      overallScore,
      level,
      recommendedGames: recommended,
      completedAt: new Date().toISOString(),
    }

    completeAssessment(result)
    // Brief delay then redirect
    setTimeout(() => navigate('/'), 2500)
  }, [scores, completeAssessment, navigate])

  const progress = Math.min(100, (Math.min(step, TOTAL_STEPS) / TOTAL_STEPS) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-50/30 via-cream-50 to-cream-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl" ref={containerRef}>
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Brain size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-charcoal-800 mb-2">Cognitive Assessment</h1>
          <p className="text-charcoal-400 text-sm max-w-md mx-auto">
            This short assessment helps AURA-NER understand your current cognitive profile so we can
            personalize your experience. Take your time — there are no wrong answers.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex justify-between text-xs text-charcoal-400 mb-2">
            <span>Step {Math.min(step + 1, TOTAL_STEPS)} of {TOTAL_STEPS}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full h-2 bg-charcoal-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sage-400 to-sage-600 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        {step < TOTAL_STEPS && (
          <div className={`card p-8 md:p-10 transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
            {step === 0 && <StepObjectRecall onComplete={onStepComplete} />}
            {step === 1 && <StepSequence onComplete={onStepComplete} />}
            {step === 2 && <StepFocus onComplete={onStepComplete} />}
            {step === 3 && <StepWordRecall onComplete={onStepComplete} />}
            {step === 4 && <StepReaction onComplete={onStepComplete} />}
          </div>
        )}

        {/* Results screen */}
        {step >= TOTAL_STEPS && (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} className="text-sage-500" />
            </div>
            <h2 className="text-xl font-bold text-charcoal-800 mb-2">Assessment Complete!</h2>
            <p className="text-charcoal-400 text-sm mb-6">
              You did wonderfully! We're setting up your personalized experience...
            </p>
            <div className="flex justify-center gap-3 mb-6">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-3xl" style={{ animationDelay: `${i * 200}ms` }}>{i < Math.round(scores.reduce((a, s) => a + s, 0) / scores.length / 20) ? '🌸' : '🌿'}</span>
              ))}
            </div>
            <p className="text-charcoal-500 text-sm italic">"Every small step makes a big difference!"</p>
            <div className="animate-pulse text-charcoal-400 text-sm flex items-center justify-center gap-2">
              <Sparkles size={14} />
              Setting up your personalized experience...
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-center text-charcoal-300 text-xs mt-6 flex items-center justify-center gap-1">
          <Heart size={10} /> This is a prototype assessment, not a clinical diagnosis.
        </p>
      </div>
    </div>
  )
}
