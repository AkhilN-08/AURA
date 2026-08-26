import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface Orb {
  x: number
  y: number
  size: number
  color: string
  blur: number
}

const ORBS: Orb[] = [
  { x: 20, y: 30, size: 300, color: 'rgba(74,124,74,0.06)', blur: 80 },
  { x: 75, y: 20, size: 250, color: 'rgba(255,213,107,0.05)', blur: 70 },
  { x: 50, y: 60, size: 350, color: 'rgba(107,138,100,0.04)', blur: 90 },
  { x: 85, y: 70, size: 200, color: 'rgba(240,165,0,0.04)', blur: 60 },
]

export default function GlowOrbs() {
  const containerRef = useRef<HTMLDivElement>(null)
  const orbRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const mouse = { x: 0, y: 0 }

    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMove)

    const tick = gsap.ticker.add(() => {
      orbRefs.current.forEach((orb, i) => {
        if (!orb) return
        const strength = (i + 1) * 15
        gsap.to(orb, {
          x: mouse.x * strength,
          y: mouse.y * strength,
          duration: 1.5,
          ease: 'power2.out',
        })
      })
    })

    return () => {
      window.removeEventListener('mousemove', onMove)
      gsap.ticker.remove(tick)
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {ORBS.map((orb, i) => (
        <div
          key={i}
          ref={el => { orbRefs.current[i] = el }}
          className="absolute rounded-full"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
            background: orb.color,
            filter: `blur(${orb.blur}px)`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  )
}
