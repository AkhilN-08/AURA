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
    const dot = document.getElementById('cursor-dot')!
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
      // Use transform instead of left/top for GPU-accelerated smooth movement
      orb.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
    }

    const onEnterInteractive = () => setIsHovering(true)
    const onLeaveInteractive = () => setIsHovering(false)

    window.addEventListener('mousemove', onMove)

    // Spawn blossom trail particles
    const spawnTrail = (x: number, y: number) => {
      const now = performance.now()
      if (now - lastSpawnRef.current < 120) return
      lastSpawnRef.current = now

      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        size: 2.5 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        vy: 0.15 + Math.random() * 0.35,
        vx: (Math.random() - 0.5) * 0.25,
        opacity: 0.3 + Math.random() * 0.2,
        life: 0,
        maxLife: 35 + Math.random() * 25,
        hue: Math.random() > 0.5 ? 330 + Math.random() * 20 : 210 + Math.random() * 30,
      })
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
      ctx.fillStyle = `rgba(255,255,255,${p.opacity * 0.25})`
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
        if (progress < 0.12) p.opacity = (progress / 0.12) * 0.5
        else if (progress > 0.6) p.opacity = Math.max(0, 0.5 * (1 - (progress - 0.6) / 0.4))
        else p.opacity = 0.5

        p.x += p.vx + Math.sin(p.life * 0.06) * 0.25
        p.y += p.vy
        p.vy += 0.006
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

  const orbSize = isHovering ? 56 : 44
  const dotSize = isHovering ? 8 : 6

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden lg:block" aria-hidden>
      {/* Particle trail canvas */}
      <canvas
        ref={trailRef}
        className="absolute inset-0"
        style={{ pointerEvents: 'none' }}
      />
      {/* Outer glow orb — uses transform for smooth GPU-accelerated movement */}
      <div
        id="cursor-orb"
        className="absolute rounded-full"
        style={{
          width: orbSize,
          height: orbSize,
          marginLeft: -orbSize / 2,
          marginTop: -orbSize / 2,
          background: isHovering
            ? 'radial-gradient(circle, rgba(251,207,232,0.45) 0%, rgba(249,168,212,0.2) 40%, rgba(255,255,255,0.08) 70%, transparent 100%)'
            : 'radial-gradient(circle, rgba(244,114,182,0.4) 0%, rgba(236,72,153,0.18) 40%, rgba(255,255,255,0.06) 70%, transparent 100%)',
          boxShadow: isHovering
            ? '0 0 20px 6px rgba(251,207,232,0.25), 0 0 50px 15px rgba(249,168,212,0.12)'
            : '0 0 20px 6px rgba(236,72,153,0.2), 0 0 50px 15px rgba(244,114,182,0.1)',
          willChange: 'transform',
          transition: 'width 0.4s cubic-bezier(0.25,0.1,0.25,1), height 0.4s cubic-bezier(0.25,0.1,0.25,1), background 0.4s, box-shadow 0.4s',
        }}
      />
      {/* Solid center dot — uses transform for smooth GPU-accelerated movement */}
      <div
        id="cursor-dot"
        className="absolute rounded-full"
        style={{
          width: dotSize,
          height: dotSize,
          marginLeft: -dotSize / 2,
          marginTop: -dotSize / 2,
          background: isHovering
            ? 'radial-gradient(circle, #F472B6 30%, #EC4899 100%)'
            : 'radial-gradient(circle, #EC4899 30%, #DB2777 100%)',
          boxShadow: isHovering
            ? '0 0 8px 3px rgba(236,72,153,0.5), 0 0 16px 6px rgba(236,72,153,0.2)'
            : '0 0 6px 2px rgba(236,72,153,0.4), 0 0 12px 4px rgba(236,72,153,0.15)',
          willChange: 'transform',
          transition: 'width 0.3s, height 0.3s, background 0.3s, box-shadow 0.3s',
        }}
      />
    </div>
  )
}
