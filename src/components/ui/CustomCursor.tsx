import { useEffect, useRef, useState } from 'react'
import { useDarkMode } from '../../hooks/useDarkMode'

/**
 * The AURA cursor — a pen on paper.
 *
 * One ink dot with a thin ring around it, moving as a single unit exactly
 * with the pointer (no lag, no trailing ghost). Over things you can press,
 * the ring quietly grows and fills with sage. No glow, no particles,
 * no animation loop — just one GPU transform and small CSS transitions.
 */
export default function CustomCursor() {
  const [interactive, setInteractive] = useState(false)
  const [hidden, setHidden] = useState(true)
  const cursorRef = useRef<HTMLDivElement>(null)
  const { isDark } = useDarkMode()

  useEffect(() => {
    // Touch devices use their finger — no drawn cursor at all
    if ('ontouchstart' in window && window.matchMedia('(pointer: coarse)').matches) {
      return
    }

    const onMove = (e: MouseEvent) => {
      setHidden(false)
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      }

      // Interactive hover via delegation — one listener, no polling
      const target = e.target as Element | null
      const isInteractive = !!target?.closest?.('a, button, input, select, textarea, label, [role="button"], [role="switch"]')
      setInteractive(prev => (prev === isInteractive ? prev : isInteractive))
    }

    const onLeave = () => setHidden(true)
    window.addEventListener('mousemove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  if (hidden && 'ontouchstart' in window) return null

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed left-0 top-0 z-[9999]"
      style={{ willChange: 'transform', opacity: hidden ? 0 : 1, transition: 'opacity 0.2s' }}
      aria-hidden
    >
      {/* The ring — grows and fills sage over things you can press */}
      <div
        className="absolute rounded-full"
        style={{
          width: interactive ? 40 : 30,
          height: interactive ? 40 : 30,
          left: interactive ? -20 : -15,
          top: interactive ? -20 : -15,
          border: `1.5px solid ${interactive ? 'rgba(184, 217, 154, 0.85)' : isDark ? 'rgba(232, 227, 216, 0.35)' : 'rgba(23, 23, 23, 0.35)'}`,
          background: interactive ? 'rgba(184, 217, 154, 0.18)' : 'transparent',
          transition: 'width 0.2s ease, height 0.2s ease, left 0.2s ease, top 0.2s ease, border-color 0.2s ease, background 0.2s ease',
        }}
      />
      {/* The pen tip — a small ink dot, dead center */}
      <div
        className="absolute rounded-full"
        style={{
          width: 6,
          height: 6,
          left: -3,
          top: -3,
          background: interactive ? (isDark ? '#9dc080' : '#5d7a51') : (isDark ? '#e8e3d8' : '#171717'),
          transition: 'background 0.2s ease',
        }}
      />
    </div>
  )
}
