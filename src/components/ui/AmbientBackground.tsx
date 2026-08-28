import { useEffect, useRef } from 'react'

interface Petal {
  x: number; y: number; size: number; rot: number
  vx: number; vy: number; rotSpeed: number
  opacity: number; color: string
  wobblePhase: number; wobbleAmp: number; wobbleFreq: number
  type: 'petal' | 'blossom' | 'dust'
}

const PETAL_COLORS = [
  'rgba(249,168,212,',
  'rgba(251,207,232,',
  'rgba(253,164,175,',
  'rgba(244,114,182,',
  'rgba(251,191,236,',
  'rgba(252,231,243,',
]

const BLOSSOM_COLORS = [
  'rgba(253,164,175,',
  'rgba(249,168,212,',
  'rgba(244,114,182,',
  'rgba(255,228,230,',
]

export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = 0
    let w = 0, h = 0, time = 0
    let petals: Petal[] = []

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const spawnPetal = () => {
      const roll = Math.random()
      const type: 'petal' | 'blossom' | 'dust' = roll > 0.88 ? 'dust' : roll > 0.6 ? 'blossom' : 'petal'
      const colors = type === 'dust' ? ['rgba(251,207,232,'] : type === 'blossom' ? BLOSSOM_COLORS : PETAL_COLORS
      const color = colors[Math.floor(Math.random() * colors.length)]

      petals.push({
        x: Math.random() * (w + 100) - 50,
        y: -20 - Math.random() * 60,
        size: type === 'dust' ? 1.5 + Math.random() * 3 : type === 'blossom' ? 4 + Math.random() * 6 : 5 + Math.random() * 8,
        rot: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.3) * 0.4,
        vy: type === 'dust' ? 0.15 + Math.random() * 0.25 : 0.25 + Math.random() * 0.5,
        rotSpeed: (Math.random() - 0.5) * 0.025,
        opacity: type === 'dust' ? 0.15 + Math.random() * 0.2 : 0.15 + Math.random() * 0.25,
        color,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleAmp: type === 'dust' ? 0.3 + Math.random() * 0.4 : 0.5 + Math.random() * 1.0,
        wobbleFreq: 0.007 + Math.random() * 0.01,
        type,
      })
    }

    const drawPetal = (p: Petal) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = p.opacity

      if (p.type === 'dust') {
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 5)
        glow.addColorStop(0, p.color + (p.opacity * 0.6) + ')')
        glow.addColorStop(0.5, p.color + (p.opacity * 0.15) + ')')
        glow.addColorStop(1, p.color + '0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(0, 0, p.size * 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = p.color + p.opacity + ')'
        ctx.beginPath()
        ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2)
        ctx.fill()
      } else if (p.type === 'blossom') {
        // Small 5-petal blossom
        for (let i = 0; i < 5; i++) {
          ctx.save()
          ctx.rotate((i * Math.PI * 2) / 5)
          ctx.fillStyle = p.color + p.opacity + ')'
          ctx.beginPath()
          ctx.ellipse(0, -p.size * 0.5, p.size * 0.3, p.size * 0.5, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
        // Center
        ctx.fillStyle = 'rgba(253,224,71,' + (p.opacity * 0.6) + ')'
        ctx.beginPath()
        ctx.arc(0, 0, p.size * 0.18, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Delicate single petal shape
        ctx.fillStyle = p.color + p.opacity + ')'
        ctx.beginPath()
        ctx.moveTo(0, -p.size)
        ctx.bezierCurveTo(p.size * 0.6, -p.size * 0.4, p.size * 0.5, p.size * 0.3, 0, p.size)
        ctx.bezierCurveTo(-p.size * 0.5, p.size * 0.3, -p.size * 0.6, -p.size * 0.4, 0, -p.size)
        ctx.fill()
        // Subtle highlight
        ctx.fillStyle = 'rgba(255,255,255,' + (p.opacity * 0.2) + ')'
        ctx.beginPath()
        ctx.ellipse(-p.size * 0.12, -p.size * 0.2, p.size * 0.15, p.size * 0.3, -0.3, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    }

    const animate = () => {
      time++
      ctx.clearRect(0, 0, w, h)

      // Spawn every 24 frames — subtle
      if (time % 24 === 0 && petals.length < 35) {
        spawnPetal()
      }

      petals = petals.filter(p => {
        const breeze = Math.sin(time * 0.003 + p.wobblePhase) * 0.4
        p.x += p.vx + Math.sin(time * p.wobbleFreq + p.wobblePhase) * p.wobbleAmp + breeze
        p.y += p.vy
        p.rot += p.rotSpeed + Math.sin(time * 0.005 + p.wobblePhase) * 0.004

        if (p.y > h + 40 || p.x < -100 || p.x > w + 100) return false

        drawPetal(p)
        return true
      })

      animId = requestAnimationFrame(animate)
    }

    resize()
    animate()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      aria-hidden="true"
    />
  )
}
