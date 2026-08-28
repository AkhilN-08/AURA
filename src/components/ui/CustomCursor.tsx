import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    if ('ontouchstart' in window) {
      setIsHidden(true)
      return
    }

    const dot = dotRef.current
    const ring = ringRef.current
    const glow = glowRef.current
    if (!dot || !ring || !glow) return

    // Physics state
    const state = {
      cursor: { x: 0, y: 0, vx: 0, vy: 0 },
      glow: { x: 0, y: 0, vx: 0, vy: 0 },
      target: { x: 0, y: 0 },
    }

    const onMove = (e: MouseEvent) => {
      state.target.x = e.clientX
      state.target.y = e.clientY
    }

    const onEnterInteractive = () => setIsHovering(true)
    const onLeaveInteractive = () => setIsHovering(false)
    const onMouseDown = () => gsap.to(ring, { scale: 0.85, duration: 0.1, ease: 'power2.out' })
    const onMouseUp = () => gsap.to(ring, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' })

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    // Track interactive elements
    const interactives = document.querySelectorAll('a, button, [data-cursor="pointer"], input, select, textarea')
    interactives.forEach(el => {
      el.addEventListener('mouseenter', onEnterInteractive)
      el.addEventListener('mouseleave', onLeaveInteractive)
    })

    const TICKER_SPEED = 0.12    // dot+ring follow mouse
    const GLOW_LAG = 0.035       // glow trails behind

    const ticker = gsap.ticker.add(() => {
      // Dot + Ring — smooth spring follow, same position
      const dx = state.target.x - state.cursor.x
      const dy = state.target.y - state.cursor.y
      state.cursor.vx += dx * TICKER_SPEED
      state.cursor.vy += dy * TICKER_SPEED
      state.cursor.vx *= 0.85
      state.cursor.vy *= 0.85
      state.cursor.x += state.cursor.vx
      state.cursor.y += state.cursor.vy

      // Glow — trails behind cursor
      const gx = state.cursor.x - state.glow.x
      const gy = state.cursor.y - state.glow.y
      state.glow.vx += gx * GLOW_LAG
      state.glow.vy += gy * GLOW_LAG
      state.glow.vx *= 0.88
      state.glow.vy *= 0.88
      state.glow.x += state.glow.vx
      state.glow.y += state.glow.vy

      gsap.set(dot, { x: state.cursor.x, y: state.cursor.y })
      gsap.set(ring, { x: state.cursor.x, y: state.cursor.y })
      gsap.set(glow, { x: state.glow.x, y: state.glow.y })
    })

    // Re-check interactives periodically
    const interval = setInterval(() => {
      document.querySelectorAll('a, button, [data-cursor="pointer"], input, select, textarea').forEach(el => {
        if (!(el as any).__cursorBound) {
          el.addEventListener('mouseenter', onEnterInteractive)
          el.addEventListener('mouseleave', onLeaveInteractive)
          ;(el as any).__cursorBound = true
        }
      })
    }, 1000)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      gsap.ticker.remove(ticker)
      clearInterval(interval)
    }
  }, [])

  if (isHidden) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden lg:block" aria-hidden>
      {/* Core dot — instant follow */}
      <div
        ref={dotRef}
        className="absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: isHovering ? 8 : 4,
          height: isHovering ? 8 : 4,
          background: isHovering ? '#FBCFE8' : '#60A5FA',
          transition: 'width 0.4s cubic-bezier(0.23,1,0.32,1), height 0.4s cubic-bezier(0.23,1,0.32,1), background 0.4s',
        }}
      />
      {/* Trailing ring — spring physics, no CSS transition */}
      <div
        ref={ringRef}
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: isHovering ? 64 : 40,
          height: isHovering ? 64 : 40,
          border: `1.5px solid ${isHovering ? 'rgba(251,207,232,0.5)' : 'rgba(96,165,250,0.25)'}`,
          background: isHovering
            ? 'radial-gradient(circle, rgba(251,207,232,0.06) 0%, rgba(255,255,255,0.02) 100%)'
            : 'radial-gradient(circle, rgba(96,165,250,0.03) 0%, rgba(255,255,255,0.01) 100%)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          boxShadow: isHovering
            ? '0 0 20px rgba(251,207,232,0.1), inset 0 0 8px rgba(255,255,255,0.04)'
            : '0 0 10px rgba(96,165,250,0.05)',
          transition: 'width 0.5s cubic-bezier(0.23,1,0.32,1), height 0.5s cubic-bezier(0.23,1,0.32,1), border 0.5s, background 0.5s, box-shadow 0.5s',
        }}
      />
      {/* Ambient glow — slowest layer */}
      <div
        ref={glowRef}
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: isHovering ? 120 : 80,
          height: isHovering ? 120 : 80,
          background: isHovering
            ? 'radial-gradient(circle, rgba(251,207,232,0.05) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(96,165,250,0.03) 0%, transparent 70%)',
          transition: 'width 0.7s, height 0.7s, background 0.7s',
        }}
      />
    </div>
  )
}
