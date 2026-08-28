import { useEffect, useRef, useState } from 'react'

interface TrailParticle {
  x: number; y: number
  size: number
  rot: number
  rotSpeed: number
  vy: number
  vx: number
  opacity: number
  life: number
  maxLife: number
  hue: number
}

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const trailRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -100, y: -100 })
  const particlesRef = useRef<TrailParticle[]>([])
  const lastSpawnRef = useRef(0)
  const animRef = useRef(0)

  useEffect(() => {
    if ('ontouchstart' in window) {
      setIsHidden(true)
      return
    }

    const orb = document.getElementById('cursor-orb')!
    const canvas = trailRef.current!
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = window.innerWidth * (window.devicePixelRatio || 1)
      canvas.height = window.innerHeight * (window.devicePixelRatio || 1)
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
      orb.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
    }

    const onEnterInteractive = () => setIsHovering(true)
    const onLeaveInteractive = () => setIsHovering(false)

    window.addEventListener('mousemove', onMove)

    // Spawn blossom trail particles
    const spawnTrail = (x: number, y: number) => {
      const now = performance.now()
      if (now - lastSpawnRef.current < 40) return // throttle to ~25/sec
      lastSpawnRef.current = now

      const count = Math.random() > 0.6 ? 2 : 1
      for (let i = 0; i < count; i++) {
        const pinkish = Math.random() > 0.5
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 14,
          y: y + (Math.random() - 0.5) * 14,
          size: 2 + Math.random() * 4,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.06,
          vy: 0.2 + Math.random() * 0.4,
          vx: (Math.random() - 0.5) * 0.3,
          opacity: 0.35 + Math.random() * 0.25,
          life: 0,
          maxLife: 50 + Math.random() * 40,
          hue: pinkish ? 330 + Math.random() * 20 : 210 + Math.random() * 30,
        })
      }
    }

    const drawPetal = (p: TrailParticle) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = p.opacity
      ctx.fillStyle = `hsla(${p.hue}, 70%, 78%, 0.9)`
      ctx.beginPath()
      ctx.moveTo(0, -p.size)
      ctx.bezierCurveTo(p.size * 0.5, -p.size * 0.3, p.size * 0.4, p.size * 0.3, 0, p.size)
      ctx.bezierCurveTo(-p.size * 0.4, p.size * 0.3, -p.size * 0.5, -p.size * 0.3, 0, -p.size)
      ctx.fill()
      // tiny white highlight
      ctx.fillStyle = `rgba(255,255,255,${p.opacity * 0.2})`
      ctx.beginPath()
      ctx.ellipse(-p.size * 0.08, -p.size * 0.1, p.size * 0.08, p.size * 0.18, -0.3, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    const animate = () => {
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      if (mx > 0 && my > 0) spawnTrail(mx, my)

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      particlesRef.current = particlesRef.current.filter(p => {
        p.life++
        const progress = p.life / p.maxLife
        // fade in first 15%, steady, fade out last 40%
        if (progress < 0.15) p.opacity = (progress / 0.15) * 0.4
        else if (progress > 0.6) p.opacity = Math.max(0, 0.4 * (1 - (progress - 0.6) / 0.4))
        else p.opacity = 0.4

        p.x += p.vx + Math.sin(p.life * 0.06) * 0.3
        p.y += p.vy
        p.vy += 0.008
        p.rot += p.rotSpeed

        if (p.life >= p.maxLife) return false
        drawPetal(p)
        return true
      })

      animRef.current = requestAnimationFrame(animate)
    }
    animate()

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
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
      clearInterval(interval)
    }
  }, [])

  if (isHidden) return null

  const size = isHovering ? 52 : 38

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden lg:block" aria-hidden>
      {/* Particle trail canvas */}
      <canvas
        ref={trailRef}
        className="absolute inset-0"
        style={{ pointerEvents: 'none' }}
      />
      {/* Translucent light orb — darker/more visible */}
      <div
        id="cursor-orb"
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: size,
          height: size,
          background: isHovering
            ? 'radial-gradient(circle, rgba(251,207,232,0.3) 0%, rgba(249,168,212,0.14) 35%, rgba(255,255,255,0.05) 65%, transparent 100%)'
            : 'radial-gradient(circle, rgba(120,180,255,0.28) 0%, rgba(96,165,250,0.14) 35%, rgba(255,255,255,0.05) 65%, transparent 100%)',
          boxShadow: isHovering
            ? '0 0 35px 10px rgba(251,207,232,0.12), 0 0 70px 20px rgba(249,168,212,0.06)'
            : '0 0 35px 10px rgba(96,165,250,0.12), 0 0 70px 20px rgba(147,197,253,0.06)',
          transform: 'translate(-100px, -100px)',
          willChange: 'transform',
          transition: `width 0.4s cubic-bezier(0.4,0,0.2,1), height 0.4s cubic-bezier(0.4,0,0.2,1), background 0.5s, box-shadow 0.5s`,
        }}
      />
    </div>
  )
}
