import { useState, useEffect, useRef, useCallback } from 'react'
import { Volume2, Eye, Ear, Bell, Hand, Music, Drum, RotateCcw, CheckCircle2, XCircle } from 'lucide-react'
import { useGameProgress } from '../../hooks/useGameProgress'
import { playMatchChime, playWinChime, playTapSound, speakText } from '../../utils/audio'
import { useTranslation } from '../../hooks/useTranslation'
import type { GameSession } from '../../data/models'

// ── Identity: large interactive controls, extremely simple ──────

type Mode = 'visual' | 'sound' | 'combined'
type Symbol = { id: number; label: string; icon: typeof Bell; color: string; freq: number }

const SYMBOLS: Symbol[] = [
  { id: 0, label: 'Bell', icon: Bell, color: '#f59e0b', freq: 880 },
  { id: 1, label: 'Clap', icon: Hand, color: '#0ea5e9', freq: 440 },
  { id: 2, label: 'Chime', icon: Music, color: '#8b5cf6', freq: 659 },
  { id: 3, label: 'Drum', icon: Drum, color: '#10b981', freq: 220 },
]

function playTone(freq: number, duration = 0.45) {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    const ctx = new AC()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration + 0.05)
    setTimeout(() => ctx.close(), (duration + 0.2) * 1000)
  } catch { /* audio unavailable */ }
}

interface MSProps {
  onComplete?: (session: GameSession) => void
}

export default function MemorySequence({ onComplete }: MSProps) {
  const { t, language } = useTranslation()
  const { addSession } = useGameProgress()
  const startedAt = useRef(Date.now())
  const [mode, setMode] = useState<Mode | null>(null)
  const [phase, setPhase] = useState<'mode' | 'ready' | 'showing' | 'input' | 'result' | 'done'>('mode')
  const [sequence, setSequence] = useState<number[]>([])
  const [userSeq, setUserSeq] = useState<number[]>([])
  const [activeSym, setActiveSym] = useState<number>(-1)
  const [seqLength, setSeqLength] = useState(2)
  const [rounds, setRounds] = useState<{ correct: boolean; time: number; length: number }[]>([])
  const [longest, setLongest] = useState(0)
  const roundStart = useRef(Date.now())

  const totalSymbols = mode === 'visual' ? 2 : 4   // sound mode: fewer symbols, they are harder to tell apart

  const startGame = (m: Mode) => {
    playTapSound()
    setMode(m)
    startedAt.current = Date.now()
    setPhase('ready')
    speakText(m === 'sound' ? t('Listen to the sounds. Then tap them back in order.') : t('Watch and listen. Then tap the sequence back.'), language)
  }

  const initRound = useCallback(() => {
    const seq = Array.from({ length: seqLength }, () => Math.floor(Math.random() * totalSymbols))
    setSequence(seq)
    setUserSeq([])
    setPhase('showing')

    let i = 0
    const iv = setInterval(() => {
      const sym = seq[i]
      setActiveSym(sym)
      if (mode !== 'visual') playTone(SYMBOLS[sym].freq)
      setTimeout(() => setActiveSym(-1), 550)
      i++
      if (i >= seq.length) {
        clearInterval(iv)
        setTimeout(() => { setPhase('input'); roundStart.current = Date.now() }, 600)
      }
    }, 1000)
  }, [seqLength, totalSymbols, mode])

  const beginRound = () => {
    playTapSound()
    initRound()
  }

  const handleTap = (symId: number) => {
    if (phase !== 'input') return
    playTapSound()
    if (mode !== 'visual') playTone(SYMBOLS[symId].freq)
    setActiveSym(symId)
    setTimeout(() => setActiveSym(-1), 200)

    const next = [...userSeq, symId]
    setUserSeq(next)

    if (next.length === seqLength) {
      const time = (Date.now() - roundStart.current) / 1000
      const correct = next.every((c, i) => c === sequence[i])
      const newRounds = [...rounds, { correct, time, length: seqLength }]
      setRounds(newRounds)
      if (correct) {
        playMatchChime()
        setLongest(l => Math.max(l, seqLength))
        // grow: +1 up to 6
        setSeqLength(len => Math.min(6, len + 1))
      }
      // shrink after two misses
      const lastTwo = newRounds.slice(-2)
      if (lastTwo.length === 2 && lastTwo.every(r => !r.correct)) {
        setSeqLength(len => Math.max(2, len - 1))
      }

      setTimeout(() => {
        if (newRounds.length >= 5) {
          finish(newRounds)
        } else {
          setPhase('result')
        }
      }, 1300)
    }
  }

  const finish = useCallback((finalRounds: { correct: boolean; time: number; length: number }[]) => {
    const correct = finalRounds.filter(r => r.correct).length
    const accuracy = finalRounds.length > 0 ? Math.round((correct / finalRounds.length) * 100) : 0
    const avgTime = finalRounds.length > 0 ? finalRounds.reduce((a, r) => a + r.time, 0) / finalRounds.length : 0
    const session: GameSession = {
      gameType: 'memory-sequence',
      score: accuracy,
      accuracy,
      duration: Math.round((Date.now() - startedAt.current) / 1000),
      timestamp: new Date().toISOString(),
      difficulty: longest >= 5 ? 'hard' : longest >= 3 ? 'moderate' : 'easy',
      responseTime: Math.round(avgTime * 10) / 10,
      attempts: finalRounds.length,
      category: 'attention',
    }
    addSession(session)
    onComplete?.(session)
    playWinChime()
    setPhase('done')
  }, [longest, addSession, onComplete])

  // ── Done ──
  if (phase === 'done') {
    const correct = rounds.filter(r => r.correct).length
    const accuracy = Math.round((correct / rounds.length) * 100)
    const modeLabel = mode === 'sound' ? t('Sound') : mode === 'visual' ? t('Visual') : t('Combined')
    return (
      <div className="animate-fade-in max-w-md mx-auto text-center">
        <Ear size={44} className="mx-auto text-sky-500 mb-3" />
        <h3 className="text-2xl font-bold text-stone-800 mb-1">{t('Listening Complete')}</h3>
        <p className="text-stone-500 mb-6">{modeLabel} {t('mode')}</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-sky-50 rounded-2xl p-4"><p className="text-2xl font-bold text-sky-600">{accuracy}%</p><p className="text-xs text-stone-500">{t('Sequence Accuracy')}</p></div>
          <div className="bg-sky-50 rounded-2xl p-4"><p className="text-2xl font-bold text-sky-600">{longest}</p><p className="text-xs text-stone-500">{t('Longest Sequence')}</p></div>
          <div className="bg-sky-50 rounded-2xl p-4"><p className="text-2xl font-bold text-sky-600">{correct}/{rounds.length}</p><p className="text-xs text-stone-500">{t('Rounds Won')}</p></div>
        </div>
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 text-center">
          <p className="text-xs font-semibold text-sky-700 uppercase tracking-widest mb-2">{t('AURA Insight')}</p>
          <p className="text-stone-700 text-lg" style={{ fontFamily: 'Georgia, serif' }}>
            "{longest >= 4
              ? t('Your ears and eyes worked beautifully together.')
              : t('Each sound you repeat keeps your listening strong and steady.')}"
          </p>
          <p className="text-xs text-stone-400 mt-3">{t('A performance insight — not a medical assessment.')}</p>
        </div>
      </div>
    )
  }

  // ── Mode picker ──
  if (phase === 'mode') {
    const modes: { id: Mode; label: string; desc: string; icon: typeof Eye }[] = [
      { id: 'visual', label: t('Watch'), desc: t('See the lights only'), icon: Eye },
      { id: 'sound', label: t('Listen'), desc: t('Hear the sounds only'), icon: Volume2 },
      { id: 'combined', label: t('Watch & Listen'), desc: t('Both together'), icon: Ear },
    ]
    return (
      <div className="text-center py-8">
        <h3 className="text-2xl font-bold text-stone-800 mb-2">{t('Memory Sequence')}</h3>
        <p className="text-stone-500 max-w-md mx-auto mb-8">
          {t('A gentle listening game. How would you like to play?')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
          {modes.map(m => (
            <button
              key={m.id}
              onClick={() => startGame(m.id)}
              className="p-6 rounded-3xl border-2 border-stone-200 bg-white hover:border-sky-400 hover:bg-sky-50 transition-all hover:-translate-y-1 flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center">
                <m.icon size={26} className="text-sky-600" />
              </div>
              <span className="font-bold text-stone-800 text-lg">{m.label}</span>
              <span className="text-xs text-stone-400">{m.desc}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Ready ──
  if (phase === 'ready') {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-5">🔔</div>
        <p className="text-xl font-semibold text-stone-700 mb-2">{t('Round {n} — {m} sounds', { n: 1, m: seqLength })}</p>
        <p className="text-stone-500 mb-8">{t('Get comfortable. The sequence will play once.')}</p>
        <button onClick={beginRound} className="px-10 py-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-lg font-semibold transition-all hover:-translate-y-0.5 shadow-lg shadow-sky-200">
          {t('Play the Sequence')}
        </button>
      </div>
    )
  }

  // ── Showing / input / result ──
  const lastRound = rounds[rounds.length - 1]
  const activeSymbols = SYMBOLS.slice(0, totalSymbols)

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium text-stone-500">{t('Round {n} of {total}', { n: rounds.length + 1, total: 5 })}</span>
        <span className="text-sm font-semibold text-stone-600 bg-stone-100 rounded-full px-3 py-1">{t('{n} in sequence', { n: seqLength })}</span>
      </div>

      {phase === 'showing' && <p className="text-center text-lg text-sky-600 font-medium mb-6 animate-pulse">{t('Listen carefully...')}</p>}
      {phase === 'input' && <p className="text-center text-lg text-stone-700 font-semibold mb-6">{t('Your turn — tap it back')}</p>}
      {phase === 'result' && lastRound && (
        <div className={`text-center mb-6 flex items-center justify-center gap-2 ${lastRound.correct ? 'text-green-600' : 'text-amber-600'}`}>
          {lastRound.correct ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
          <span className="font-bold text-lg">{lastRound.correct ? t('Beautiful! {n} in a row!', { n: seqLength }) : t('Almost — one more try')}</span>
        </div>
      )}

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-8 min-h-[40px]">
        {sequence.map((_, i) => (
          <span
            key={i}
            className="w-4 h-4 rounded-full border-2 transition-all"
            style={{
              backgroundColor: userSeq[i] !== undefined ? SYMBOLS[userSeq[i]].color : 'transparent',
              borderColor: userSeq[i] !== undefined ? SYMBOLS[userSeq[i]].color : '#cbd5e1',
            }}
          />
        ))}
      </div>

      {/* BIG buttons */}
      <div className={`grid gap-5 mx-auto ${totalSymbols <= 2 ? 'grid-cols-2 max-w-sm' : 'grid-cols-2 max-w-md'}`}>
        {activeSymbols.map(s => (
          <button
            key={s.id}
            onClick={() => handleTap(s.id)}
            disabled={phase !== 'input'}
            aria-label={t(s.label)}
            className={`rounded-3xl py-10 flex flex-col items-center gap-3 transition-all border-4 ${
              phase === 'input' ? 'cursor-pointer hover:-translate-y-1 active:scale-95' : 'opacity-50'
            }`}
            style={{
              backgroundColor: activeSym === s.id ? s.color : '#ffffff',
              borderColor: s.color,
              boxShadow: activeSym === s.id ? `0 0 0 8px ${s.color}44` : '0 2px 12px rgba(0,0,0,0.08)',
            }}
          >
            <s.icon size={52} style={{ color: activeSym === s.id ? '#fff' : s.color }} />
            <span className="text-lg font-bold" style={{ color: activeSym === s.id ? '#fff' : '#44403c' }}>{t(s.label)}</span>
          </button>
        ))}
      </div>

      {phase === 'result' && (
        <button onClick={() => { playTapSound(); initRound() }} className="w-full mt-8 min-h-[56px] rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-lg font-semibold transition-all flex items-center justify-center gap-2">
          <RotateCcw size={18} /> {t('Next Round')}
        </button>
      )}
    </div>
  )
}
