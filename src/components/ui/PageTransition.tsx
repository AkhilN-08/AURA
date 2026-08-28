import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'

interface PageTransitionProps {
  children: ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()
  const containerRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (!containerRef.current) return

    if (isFirstRender.current) {
      // First render — just fade in gently
      isFirstRender.current = false
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      )
      return
    }

    // Route change — smooth fade in
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 16, filter: 'blur(4px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.5,
        ease: 'power2.out',
      }
    )
  }, [location.pathname])

  return (
    <div ref={containerRef} className="min-h-screen">
      {children}
    </div>
  )
}
