import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    // Hide on touch devices
    if ('ontouchstart' in window) {
      setIsHidden(true)
      return
    }

    const dot = dotRef.current
    const ring = ringRef.current
    const glow = glowRef.current
    if (!dot || !ring || !glow) return

    const pos = { x: 0, y: 0 }
    const mouse = { x: 0, y: 0 }

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    const onEnterInteractive = () => setIsHovering(true)
    const onLeaveInteractive = () => setIsHovering(false)
    const onMouseDown = () => gsap.to(ring, { scale: 0.8, duration: 0.15 })
    const onMouseUp = () => gsap.to(ring, { scale: 1, duration: 0.3, ease: 'back.out(3)' })

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    // Track interactive elements
    const interactives = document.querySelectorAll('a, button, [data-cursor="pointer"], input, select, textarea')
    interactives.forEach(el => {
      el.addEventListener('mouseenter', onEnterInteractive)
      el.addEventListener('mouseleave', onLeaveInteractive)
    })

    // Animate with GSAP ticker for smooth 60fps
    const ticker = gsap.ticker.add(() => {
      pos.x += (mouse.x - pos.x) * 0.15
      pos.y += (mouse.y - pos.y) * 0.15

      gsap.set(dot, { x: mouse.x, y: mouse.y })
      gsap.set(ring, { x: pos.x, y: pos.y })
      gsap.set(glow, { x: pos.x, y: pos.y })
    })

    // Re-check interactives periodically (for dynamically rendered elements)
    const interval = setInterval(() => {
      const newInteractives = document.querySelectorAll('a, button, [data-cursor="pointer"], input, select, textarea')
      newInteractives.forEach(el => {
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
      {/* Core dot */}
      <div
        ref={dotRef}
        className="absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-forest-600"
        style={{ transition: 'width 0.3s, height 0.3s, background 0.3s', width: isHovering ? 8 : 4, height: isHovering ? 8 : 4, background: isHovering ? '#FFD56B' : '#2d4d2d' }}
      />
      {/* Trailing ring — liquid glass */}
      <div
        ref={ringRef}
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: isHovering ? 64 : 40,
          height: isHovering ? 64 : 40,
          border: `1.5px solid ${isHovering ? 'rgba(255,213,107,0.6)' : 'rgba(74,124,74,0.3)'}`,
          background: isHovering
            ? 'radial-gradient(circle, rgba(255,213,107,0.08) 0%, rgba(255,255,255,0.03) 100%)'
            : 'radial-gradient(circle, rgba(74,124,74,0.04) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          transition: 'width 0.4s cubic-bezier(0.23,1,0.32,1), height 0.4s cubic-bezier(0.23,1,0.32,1), border 0.4s, background 0.4s',
          boxShadow: isHovering
            ? '0 0 20px rgba(255,213,107,0.15), inset 0 0 10px rgba(255,255,255,0.05)'
            : '0 0 12px rgba(74,124,74,0.06)',
        }}
      />
      {/* Ambient glow */}
      <div
        ref={glowRef}
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: isHovering ? 120 : 80,
          height: isHovering ? 120 : 80,
          background: isHovering
            ? 'radial-gradient(circle, rgba(255,213,107,0.06) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(74,124,74,0.04) 0%, transparent 70%)',
          transition: 'width 0.6s, height 0.6s, background 0.6s',
        }}
      />
    </div>
  )
}
