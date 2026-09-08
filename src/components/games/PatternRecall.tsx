import { useState, useEffect, useRef, useCallback } from 'react'
import { Square, RotateCcw, CheckCircle2, XCircle, TrendingUp } from 'lucide-react'
import { useGameProgress } from '../../hooks/useGameProgress'
import { playMatchChime, playWinChime, playTapSound, speakText } from '../../utils/audio'
import { useTranslation } from '../../hooks/useTranslation'
import type { GameSession } from '../../data/models'

// ── Identity: minimal and distraction-free ──────────────────────

const COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#22c55e' },
]

const LEVEL_SIZES = [3, 4, 5, 6, 7]  // Level 1-5 → sequence length

interface PRProps {
  onComplete?: (session: GameSession) => void
}

export default function PatternRecall({ onComplete }: PRProps) {
  const { t, language } = useTranslation()
  const { getAverageAccuracy, addSession } = useGameProgress()

  // Adaptive level: start from history, then adjust within the session
  const [level, setLevel] = useState(() => {
    const avg = getAverageAccuracy('pattern-recall')
    if (avg === 0) return 1
    if (avg > 85) return 4
    if (avg >= 65) return 2
    return 1
  })
  const [adjusted, setAdjusted] = useState<string | null>(null)

  const [phase, setPhase] = useState<'ready' | 'showing' | 'input' | 'result' | 'done'>('ready')
  const [sequence, setSequence] = useState<number[]>([])
  const [userSeq, setUserSeq] = useState<number[]>([])
  const [showIdx, setShowIdx] = useState(-1)
  const [rounds, setRounds] = useState<{ correct: boolean; time: number; level: number }[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const roundStart = useRef(Date.now())
  const startedAt = useRef(Date.now())

  const seqLength = LEVEL_SIZES[level - 1]

  const initRound = useCallback(() => {
    // Build a random sequence of colors
    const seq = Array.from({ length: seqLength }, () => Math.floor(Math.random() * COLORS.length))
    setSequence(seq)
    setUserSeq([])
    setShowIdx(-1)
    setPhase('showing')
    roundStart.current = Date.now()

    // Show the pattern one color at a time
    let i = 0
    const iv = setInterval(() => {
      setShowIdx(i)
      setTimeout(() => setShowIdx(-1), 600)
      i++
      if (i >= seq.length) {
        clearInterval(iv)
        setTimeout(() => { setPhase('input'); roundStart.current = Date.now() }, 500)
      }
    }, 950)
  }, [seqLength])

  const start = () => {
    playTapSound()
    startedAt.current = Date.now()
    setPhase('showing')
    speakText(t('Watch the colors light up. Then repeat the pattern.'), language)
    // slight delay before first round so speech starts cleanly
    setTimeout(initRound, 300)
  }

  const handleColorTap = (idx: number) => {
    if (phase !== 'input' || selected !== null && userSeq.length === 0) return
    setSelected(idx)
    setTimeout(() => setSelected(null), 180)
    playTapSound()

    const next = [...userSeq, idx]
    setUserSeq(next)

    if (next.length === seqLength) {
      const time = (Date.now() - roundStart.current) / 1000
      const correct = next.every((c, i) => c === sequence[i])
      const newRounds = [...rounds, { correct, time, level }]
      setRounds(newRounds)

      // Adaptive adjustment: 2+ correct rounds in a row → up; 2+ wrong → down
      const last = newRounds.slice(-2)
      setTimeout(() => {
        if (last.length === 2 && last.every(r => r.correct) && level < 5) {
          setLevel(l => Math.min(5, l + 1))
          setAdjusted(t('AURA adjusted your difficulty based on your previous performance — now Level {n}.', { n: Math.min(5, level + 1) }))
          speakText(t('You are doing wonderfully. The pattern grows a little.'), language)
        } else if (last.length === 2 && last.every(r => !r.correct) && level > 1) {
          setLevel(l => Math.max(1, l - 1))
          setAdjusted(t('AURA adjusted your difficulty based on your previous performance — a calmer pace for now.'))
        }
      }, 100)

      if (correct) playMatchChime()

      setTimeout(() => {
        if (newRounds.length >= 4) {
          finish(newRounds)
        } else {
          setPhase('result')
        }
      }, 1300)
    }
  }

  const finish = useCallback((finalRounds: { correct: boolean; time: number; level: number }[]) => {
    const correct = finalRounds.filter(r => r.correct).length
    const accuracy = finalRounds.length > 0 ? Math.round((correct / finalRounds.length) * 100) : 0
    const avgTime = finalRounds.length > 0 ? finalRounds.reduce((a, r) => a + r.time, 0) / finalRounds.length : 0
    const session: GameSession = {
      gameType: 'pattern-recall',
      score: accuracy,
      accuracy,
      duration: Math.round((Date.now() - startedAt.current) / 1000),
      timestamp: new Date().toISOString(),
      difficulty: level >= 4 ? 'hard' : level >= 2 ? 'moderate' : 'easy',
      responseTime: Math.round(avgTime * 10) / 10,
      attempts: finalRounds.length,
      category: 'memory',
    }
    addSession(session)
    onComplete?.(session)
    playWinChime()
    setPhase('done')
  }, [level, addSession, onComplete])

  const nextRound = () => {
    playTapSound()
    setPhase('showing')
    setTimeout(initRound, 50)
  }

  // ── Done ──
  if (phase === 'done') {
    const correct = rounds.filter(r => r.correct).length
    const accuracy = Math.round((correct / rounds.length) * 100)
    return (
      <div className="animate-fade-in max-w-md mx-auto text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
          <TrendingUp size={36} className="text-slate-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">{t('Pattern Session Complete')}</h3>
        <div className="grid grid-cols-3 gap-3 my-6">
          <div className="bg-slate-50 rounded-2xl p-4"><p className="text-2xl font-bold text-slate-700">{accuracy}%</p><p className="text-xs text-stone-500">{t('Accuracy')}</p></div>
          <div className="bg-slate-50 rounded-2xl p-4"><p className="text-2xl font-bold text-slate-700">L{level}</p><p className="text-xs text-stone-500">{t('Final Level')}</p></div>
          <div className="bg-slate-50 rounded-2xl p-4"><p className="text-2xl font-bold text-slate-700">{correct}/{rounds.length}</p><p className="text-xs text-stone-500">{t('Patterns')}</p></div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <p className="text-sm text-slate-600">
            {adjusted ?? t('You worked at Level {n} — {m} colors in each pattern.', { n: level, m: seqLength })}
          </p>
        </div>
      </div>
    )
  }

  // ── Ready ──
  if (phase === 'ready') {
    return (
      <div className="text-center py-10">
        <div className="flex items-center justify-center gap-2 mb-6">
          {COLORS.map(c => (
            <span key={c.name} className="w-8 h-8 rounded-xl" style={{ backgroundColor: c.value }} />
          ))}
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-3">{t('Pattern Recall')}</h3>
        <p className="text-stone-500 max-w-md mx-auto mb-6 leading-relaxed">
          {t('A calm and quiet pattern game. Colors light up one by one — watch closely, then repeat them in the same order.')}
        </p>
        <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-5 py-2 mb-8">
          <Square size={13} className="text-slate-500" />
          <span className="text-sm font-semibold text-slate-600">{t('Level')} {level} · {t('{n} colors', { n: seqLength })}</span>
        </div>
        <br />
        <button onClick={start} className="px-10 py-4 rounded-2xl bg-slate-700 hover:bg-slate-800 text-white text-lg font-semibold transition-all hover:-translate-y-0.5 shadow-lg">
          {t('Begin')}
        </button>
      </div>
    )
  }

  // ── Showing / Input / Result ──
  const lastRound = rounds[rounds.length - 1]
  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium text-slate-500">{t('Round {n} of {total}', { n: rounds.length + 1, total: 4 })}</span>
        <span className="text-sm font-semibold text-slate-600 bg-slate-100 rounded-full px-3 py-1">{t('Level')} {level}</span>
      </div>

      {adjusted && (
        <div className="bg-sky-50 border border-sky-200 text-sky-800 rounded-2xl px-4 py-3 text-sm mb-5 flex items-center gap-2">
          <TrendingUp size={15} /> {adjusted}
        </div>
      )}

      {phase === 'showing' && (
        <p className="text-center text-slate-500 mb-6 animate-pulse">{t('Watch the pattern...')}</p>
      )}
      {phase === 'input' && (
        <p className="text-center text-slate-700 font-medium mb-6">{t('Your turn — repeat the pattern')}</p>
      )}
      {phase === 'result' && lastRound && (
        <div className={`text-center mb-6 flex items-center justify-center gap-2 ${lastRound.correct ? 'text-green-600' : 'text-amber-600'}`}>
          {lastRound.correct ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
          <span className="font-semibold">{lastRound.correct ? t('Perfect pattern!') : t('Almost — watch again')}</span>
        </div>
      )}

      {/* Sequence slots */}
      <div className="flex items-center justify-center gap-2.5 mb-8 min-h-[44px]">
        {sequence.map((_, i) => (
          <span
            key={i}
            className="w-9 h-9 rounded-xl border-2 transition-all"
            style={{
              backgroundColor: userSeq[i] !== undefined ? COLORS[userSeq[i]].value : 'transparent',
              borderColor: userSeq[i] !== undefined ? COLORS[userSeq[i]].value : '#cbd5e1',
            }}
          />
        ))}
      </div>

      {/* Color pads — large, minimal */}
      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
        {COLORS.map((c, i) => (
          <button
            key={c.name}
            onClick={() => handleColorTap(i)}
            disabled={phase !== 'input'}
            aria-label={t(c.name)}
            className={`aspect-square rounded-3xl transition-all duration-200 ${phase === 'input' ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'opacity-60'}`}
            style={{
              backgroundColor: c.value,
              transform: selected === i ? 'scale(0.94)' : undefined,
              boxShadow: showIdx === i ? `0 0 0 6px ${c.value}55, 0 8px 24px ${c.value}66` : '0 2px 10px rgba(0,0,0,0.08)',
              transformOrigin: 'center',
              scale: showIdx === i ? '1.08' : '1',
            }}
          />
        ))}
      </div>

      {phase === 'result' && (
        <button onClick={nextRound} className="w-full mt-8 min-h-[56px] rounded-2xl bg-slate-700 hover:bg-slate-800 text-white text-lg font-semibold transition-all flex items-center justify-center gap-2 mx-auto max-w-xs">
          <RotateCcw size={18} /> {t('Next Pattern')}
        </button>
      )}
    </div>
  )
}
