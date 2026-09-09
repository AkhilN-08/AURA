import { useEffect, useRef, useState } from 'react'

const RING_TRANSITION = 'transform 0.22s cubic-bezier(0.25, 0.1, 0.25, 1), width 0.25s, height 0.25s, margin 0.25s, border-color 0.25s, background 0.25s'

/**
 * The AURA cursor — a pen on paper.
 *
 * A small ink dot rides exactly under the pointer; a thin ring glides a
 * moment behind it, the way a hand circles before it writes. Over things
 * you can press, the ring quietly fills with sage. No glow, no particles,
 * no animation loop — just two GPU transforms and a CSS transition.
 */
export default function CustomCursor() {
  const [interactive, setInteractive] = useState(false)
  const [hidden, setHidden] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const ringPos = useRef({ x: -100, y: -100 })

  useEffect(() => {
    // Touch devices use their finger — no drawn cursor at all
    if ('ontouchstart' in window && window.matchMedia('(pointer: coarse)').matches) {
      setHidden(false)
      return
    }

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onMqChange = () => setReducedMotion(mq.matches)
    mq.addEventListener?.('change', onMqChange)

    const onMove = (e: MouseEvent) => {
      setHidden(false)
      const { clientX: x, clientY: y } = e
      if (dotRef.current) dotRef.current.style.transform = `translate(${x}px, ${y}px)`

      // Ring trails behind via CSS transition — instant for reduced motion
      if (ringRef.current) {
        if (reducedMotion) {
          ringRef.current.style.transform = `translate(${x}px, ${y}px)`
        } else if (Math.hypot(x - ringPos.current.x, y - ringPos.current.y) > 60) {
          // If the pointer jumped (e.g., window re-entry), catch up silently
          ringPos.current = { x, y }
          ringRef.current.style.transition = 'none'
          ringRef.current.style.transform = `translate(${x}px, ${y}px)`
          requestAnimationFrame(() => {
            if (ringRef.current) ringRef.current.style.transition = RING_TRANSITION
          })
        }
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
      mq.removeEventListener?.('change', onMqChange)
    }
  }, [reducedMotion])

  if (hidden && 'ontouchstart' in window) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden>
      {/* Trailing ring — the hand circling before it writes */}
      <div
        ref={ringRef}
        className="absolute rounded-full"
        style={{
          width: interactive ? 44 : 34,
          height: interactive ? 44 : 34,
          marginLeft: interactive ? -22 : -17,
          marginTop: interactive ? -22 : -17,
          border: `1.5px solid ${interactive ? 'rgba(124, 154, 109, 0.85)' : 'rgba(23, 23, 23, 0.35)'}`,
          background: interactive ? 'rgba(184, 217, 154, 0.14)' : 'transparent',
          transition: reducedMotion
            ? 'width 0.2s, height 0.2s, margin 0.2s, border-color 0.2s, background 0.2s'
            : RING_TRANSITION,
          willChange: 'transform',
          opacity: hidden ? 0 : 1,
        }}
      />
      {/* The pen tip — a small ink dot */}
      <div
        ref={dotRef}
        className="absolute rounded-full"
        style={{
          width: 6,
          height: 6,
          marginLeft: -3,
          marginTop: -3,
          background: interactive ? '#5d7a51' : '#171717',
          transition: 'background 0.2s, opacity 0.2s',
          willChange: 'transform',
          opacity: hidden ? 0 : 1,
        }}
      />
    </div>
  )
}
