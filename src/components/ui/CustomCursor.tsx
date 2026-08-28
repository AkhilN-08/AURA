import { useEffect, useState } from 'react'

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    if ('ontouchstart' in window) {
      setIsHidden(true)
      return
    }

    const dot = document.getElementById('cursor-dot')!
    const ring = document.getElementById('cursor-ring')!
    const glow = document.getElementById('cursor-glow')!

    const onMove = (e: MouseEvent) => {
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      ring.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
    }

    const onEnterInteractive = () => setIsHovering(true)
    const onLeaveInteractive = () => setIsHovering(false)

    window.addEventListener('mousemove', onMove)

    const interactives = document.querySelectorAll('a, button, [data-cursor="pointer"], input, select, textarea')
    interactives.forEach(el => {
      el.addEventListener('mouseenter', onEnterInteractive)
      el.addEventListener('mouseleave', onLeaveInteractive)
    })

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
      clearInterval(interval)
    }
  }, [])

  if (isHidden) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden lg:block" aria-hidden>
      {/* Core dot — instant, CSS smooth follow */}
      <div
        id="cursor-dot"
        className="absolute rounded-full"
        style={{
          width: isHovering ? 8 : 4,
          height: isHovering ? 8 : 4,
          background: isHovering ? '#FBCFE8' : '#60A5FA',
          transform: 'translate(-100px, -100px)',
          willChange: 'transform',
          transition: 'width 0.3s, height 0.3s, background 0.3s',
        }}
      />
      {/* Ring — CSS transition for smooth lag */}
      <div
        id="cursor-ring"
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
          transform: 'translate(-100px, -100px)',
          willChange: 'transform',
          transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), width 0.4s cubic-bezier(0.4, 0, 0.2, 1), height 0.4s cubic-bezier(0.4, 0, 0.2, 1), border 0.4s, background 0.4s, box-shadow 0.4s',
        }}
      />
      {/* Glow — slow CSS transition trail */}
      <div
        id="cursor-glow"
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: isHovering ? 120 : 80,
          height: isHovering ? 120 : 80,
          background: isHovering
            ? 'radial-gradient(circle, rgba(251,207,232,0.05) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(96,165,250,0.03) 0%, transparent 70%)',
          transform: 'translate(-100px, -100px)',
          willChange: 'transform',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), width 0.6s, height 0.6s, background 0.6s',
        }}
      />
    </div>
  )
}
