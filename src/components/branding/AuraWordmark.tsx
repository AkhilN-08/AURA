import { useEffect, useState } from 'react'

/**
 * AURA wordmark — the brand is the word itself, written by hand.
 *
 * Design notes:
 * - Rounded, friendly monoline letterforms with even rhythm
 *   (baseline y=95, cap y=37, matched letter gaps).
 * - One continuous stroke order: A → U → R → A, crossbars included.
 * - A signature underline flourish is drawn last, like a pen signing off.
 * - Animated variant: pen dot → stroke draw → flourish → soft glow pulse.
 * - Reduced motion: the completed wordmark appears instantly.
 */

// A — up over the apex and back down, then its crossbar
const AURA_PATH =
  'M 18 95 C 32 58 42 40 52 37 C 62 40 72 58 86 95 ' +
  'M 34 71 C 45 67 60 67 70 71 ' +
  // U — stems flowing into a rounded bowl
  'M 112 37 C 112 58 113 74 121 85 C 127 93 141 93 147 85 C 155 74 156 58 156 37 ' +
  // R — stem, generous bowl, kicking leg
  'M 182 95 C 182 74 182 52 182 37 ' +
  'M 182 37 C 196 36 212 40 212 53 C 212 66 196 70 182 70 ' +
  'M 200 70 C 210 79 219 87 228 95 ' +
  // Final A
  'M 256 95 C 270 58 280 40 290 37 C 300 40 310 58 324 95 ' +
  'M 272 71 C 283 67 298 67 308 71'

// Signature underline — a gentle smile beneath the word
const FLOURISH_PATH = 'M 64 113 C 130 122 220 122 296 112'

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = () => setReduced(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

interface AuraWordmarkProps {
  variant?: 'static' | 'animated'
  className?: string
  /** Extra line under the word (splash only) */
  subtitle?: string
  onAnimationDone?: () => void
}

export default function AuraWordmark({
  variant = 'static',
  className = 'h-10',
  subtitle,
  onAnimationDone,
}: AuraWordmarkProps) {
  const reducedMotion = useReducedMotion()
  const animate = variant === 'animated' && !reducedMotion

  useEffect(() => {
    if (variant === 'animated' && reducedMotion) onAnimationDone?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <span className="inline-flex flex-col items-center" style={{ lineHeight: 0 }}>
      <svg
        viewBox="0 0 344 130"
        className={className}
        style={{ width: 'auto', overflow: 'visible' }}
        role="img"
        aria-label="AURA"
      >
        <defs>
          <linearGradient id="aura-stroke-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9A8D4" />
            <stop offset="45%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#BE185D" />
          </linearGradient>
        </defs>

        <g className={animate ? 'aura-wordmark-glow' : undefined}>
          {/* The wordmark — a monoline ink stroke in the brand gradient */}
          <path
            d={AURA_PATH}
            fill="none"
            stroke="url(#aura-stroke-grad)"
            strokeWidth={9}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1000}
            className={animate ? 'aura-wordmark-stroke' : undefined}
          />
          {/* Signature flourish — thinner, quieter, drawn last */}
          <path
            d={FLOURISH_PATH}
            fill="none"
            stroke="url(#aura-stroke-grad)"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeOpacity={0.45}
            pathLength={1000}
            className={animate ? 'aura-wordmark-flourish' : undefined}
          />
        </g>

        {/* The pen's starting point — appears, then lifts as the stroke begins */}
        {animate && <circle className="aura-wordmark-pen" cx={18} cy={95} r={5} fill="#EC4899" />}
      </svg>

      {subtitle && (
        <span
          className={animate ? 'aura-wordmark-subtitle' : undefined}
          style={{
            marginTop: '0.9rem',
            fontSize: '0.95rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#9ca3af',
            fontWeight: 500,
          }}
        >
          {subtitle}
        </span>
      )}

      {animate && <AuraAnimationWatcher onAnimationDone={onAnimationDone} />}
    </span>
  )
}

/** Fires onAnimationDone once the word is written and the flourish has landed. */
function AuraAnimationWatcher({ onAnimationDone }: { onAnimationDone?: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => onAnimationDone?.(), 2600)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
