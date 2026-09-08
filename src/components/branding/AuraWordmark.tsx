import { useEffect, useState } from 'react'

/**
 * AURA wordmark — the brand identity is the word itself, written by a
 * single continuous stroke. Used animated for splash/entry moments and
 * static elsewhere (the full animation never replays on navigation).
 */

// One continuous handwritten path: A → U → R → A (subpaths draw in order)
const AURA_PATH =
  // First A — two rounded diagonals with a soft crossbar flick
  'M 25 100 Q 36 62 52 32 Q 68 64 82 100 M 38 76 Q 53 70 68 76 ' +
  // U — deep rounded bowl
  'M 112 32 L 112 72 Q 112 100 140 100 Q 168 100 168 72 L 168 32 ' +
  // R — stem, bowl, leg
  'M 192 100 L 192 32 L 222 32 Q 245 32 245 50 Q 245 67 222 67 L 192 67 M 220 67 L 247 100 ' +
  // Final A
  'M 275 100 Q 288 60 302 32 Q 318 62 332 100 M 288 76 Q 303 70 318 76'

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
    <span className={`inline-flex flex-col items-center ${className.includes('h-') ? '' : ''}`} style={{ lineHeight: 0 }}>
      <svg
        viewBox="0 0 360 130"
        className={className}
        style={{ width: 'auto', overflow: 'visible' }}
        role="img"
        aria-label="AURA"
      >
        <defs>
          <linearGradient id="aura-stroke-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#DB2777" />
          </linearGradient>
          <linearGradient id="aura-fill-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#BE185D" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>
        </defs>

        {/* Final filled wordmark — fades in as the pen finishes */}
        <text
          x="180"
          y="100"
          textAnchor="middle"
          fontSize="92"
          fontStyle="italic"
          fontWeight="700"
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="2"
          fill="url(#aura-fill-grad)"
          className={animate ? 'aura-wordmark-fill' : undefined}
          style={animate ? undefined : { opacity: 1 }}
        >
          AURA
        </text>

        {/* The writing stroke — draws A→U→R→A, then gently fades away */}
        {animate && (
          <path
            d={AURA_PATH}
            fill="none"
            stroke="url(#aura-stroke-grad)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1000}
            className="aura-wordmark-stroke"
          />
        )}
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

/** Fires onAnimationDone when the ~2.6s animation completes. */
function AuraAnimationWatcher({ onAnimationDone }: { onAnimationDone?: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => onAnimationDone?.(), 2700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
