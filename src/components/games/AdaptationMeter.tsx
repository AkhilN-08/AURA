import { useTranslation } from '../../hooks/useTranslation'
import { TrendingUp, Minus, Sparkles } from 'lucide-react'

/**
 * AdaptationMeter — makes AURA's adaptive intelligence visible and
 * understandable. After a game, show the difficulty journey:
 *
 *   LEVEL 01 ───────●──────  →  LEVEL 02 ──────────●──────
 *
 * No fake AI terminology — just an honest, calm explanation of
 * how the next session will meet the person where they are.
 */

export interface AdaptationInfo {
  /** difficulty/level before the session (1-5) */
  from: number
  /** difficulty/level after the session (1-5) */
  to: number
  /** e.g. 8 of 10 recalled */
  correct: number
  total: number
  /** optional context note from the game */
  note?: string
}

function LevelTrack({ level, active, label }: { level: number; active: boolean; label: string }) {
  return (
    <div className="flex-1 min-w-[120px]">
      <div className="flex items-center justify-between mb-1.5">
        <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${active ? 'text-[#7a5f38]' : 'text-[#a08d70]'}`}>
          {label}
        </span>
        <span className={`font-mono text-[10px] ${active ? 'font-bold text-[#7a5f38]' : 'text-[#a08d70]'}`}>
          {String(level).padStart(2, '0')}
        </span>
      </div>
      {/* track */}
      <div className="relative h-[3px] bg-[#e4dccd] rounded-full">
        {[1, 2, 3, 4, 5].map(n => (
          <span
            key={n}
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full transition-all ${
              n === level ? (active ? 'w-3.5 h-3.5 bg-[#b3895e]' : 'w-2.5 h-2.5 bg-[#a08d70]') : 'w-1 h-1 bg-[#c9b8a0]'
            }`}
            style={{ left: `${(n / 6) * 100}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function AdaptationMeter({ info }: { info: AdaptationInfo }) {
  const { t } = useTranslation()
  const { from, to, correct, total, note } = info
  const wentUp = to > from
  const wentDown = to < from

  const explanation = wentUp
    ? t('Your recall was strong, so the next activity will be slightly more challenging.')
    : wentDown
      ? t('A calmer pace for now — the next activity will be a little gentler.')
      : t('A steady level — right where you are comfortable.')

  return (
    <div className="mt-6 border-2 border-[#e4dccd] bg-gradient-to-br from-[#faf6ee] to-[#f7efdd] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#8a7d68]">
          <Sparkles size={12} className="text-[#b3895e]" />
          {t('AURA ADAPTED')}
        </p>
        <p className="font-mono text-[11px] text-[#a08d70]">
          {t('you remembered {c} of {n}', { c: correct, n: total })}
        </p>
      </div>

      <div className="flex items-stretch gap-3 mb-4">
        <LevelTrack level={from} active={false} label={t('this session')} />
        <div className="flex items-center pt-5">
          {wentUp && <TrendingUp size={16} className="text-[#7c9a6d]" />}
          {wentDown && <Minus size={16} className="text-[#a08d70]" />}
          {!wentUp && !wentDown && <span className="text-[#c9b8a0]">—</span>}
        </div>
        <LevelTrack level={to} active label={t('next session')} />
      </div>

      <p className="text-[#5d5344] leading-relaxed">{explanation}</p>
      {note && <p className="mt-2 text-sm text-[#8a7d68] italic">“{note}”</p>}
    </div>
  )
}
