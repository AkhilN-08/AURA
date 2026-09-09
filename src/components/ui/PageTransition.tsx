import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface PageTransitionProps {
  children: ReactNode
}

/**
 * Room transition — moving between rooms in the AURA memory world.
 * Calm fade + soft rise, driven by CSS transitions (not rAF-driven JS),
 * so it can never freeze and leave a page invisible. Reduced-motion
 * disables the movement entirely (see index.css).
 */
export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()
  const [entering, setEntering] = useState(true)
  const first = useRef(true)

  useEffect(() => {
    setEntering(true)
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setEntering(false)))
    // Failsafe: content must never stay hidden
    const failsafe = setTimeout(() => setEntering(false), 400)
    return () => { cancelAnimationFrame(raf); clearTimeout(failsafe) }
  }, [location.pathname])

  return (
    <div className={`room-enter ${entering ? '' : 'room-enter-active'}`}>
      {children}
    </div>
  )
}
