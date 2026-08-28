import { useEffect, useState } from 'react'

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    if ('ontouchstart' in window) {
      setIsHidden(true)
      return
    }

    const orb = document.getElementById('cursor-orb')!

    const onMove = (e: MouseEvent) => {
      orb.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
    }

    const onEnterInteractive = () => setIsHovering(true)
    const onLeaveInteractive = () => setIsHovering(false)

    window.addEventListener('mousemove', onMove)

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

  const size = isHovering ? 52 : 36

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden lg:block" aria-hidden>
      {/* Translucent light orb — single element */}
      <div
        id="cursor-orb"
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: size,
          height: size,
          background: isHovering
            ? 'radial-gradient(circle, rgba(251,207,232,0.18) 0%, rgba(249,168,212,0.08) 40%, rgba(255,255,255,0.03) 70%, transparent 100%)'
            : 'radial-gradient(circle, rgba(147,197,253,0.18) 0%, rgba(96,165,250,0.08) 40%, rgba(255,255,255,0.03) 70%, transparent 100%)',
          boxShadow: isHovering
            ? '0 0 30px 8px rgba(251,207,232,0.08), 0 0 60px 16px rgba(249,168,212,0.04)'
            : '0 0 30px 8px rgba(96,165,250,0.08), 0 0 60px 16px rgba(147,197,253,0.04)',
          transform: 'translate(-100px, -100px)',
          willChange: 'transform',
          transition: `width 0.4s cubic-bezier(0.4,0,0.2,1), height 0.4s cubic-bezier(0.4,0,0.2,1), background 0.5s, box-shadow 0.5s`,
        }}
      />
    </div>
  )
}
