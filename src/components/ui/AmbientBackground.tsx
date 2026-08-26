import { useEffect, useRef } from 'react'

interface Leaf {
  x: number; y: number; size: number; rot: number
  vx: number; vy: number; rotSpeed: number
  opacity: number; color: string
  wobblePhase: number; wobbleAmp: number; wobbleFreq: number
  type: 'leaf' | 'petal' | 'dust'
}

const LEAF_COLORS = [
  'rgba(40,85,35,',
  'rgba(55,100,45,',
  'rgba(70,115,55,',
  'rgba(45,90,40,',
  'rgba(60,105,50,',
  'rgba(35,75,30,',
]

const PETAL_COLORS = [
  'rgba(200,120,140,',
  'rgba(210,130,145,',
  'rgba(195,115,130,',
  'rgba(220,140,155,',
  'rgba(190,110,125,',
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
    let leaves: Leaf[] = []

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

    const spawnLeaf = () => {
      const roll = Math.random()
      const type: 'leaf' | 'petal' | 'dust' = roll > 0.85 ? 'dust' : roll > 0.5 ? 'petal' : 'leaf'
      const colors = type === 'dust' ? ['rgba(180,170,140,'] : type === 'petal' ? PETAL_COLORS : LEAF_COLORS
      const color = colors[Math.floor(Math.random() * colors.length)]

      leaves.push({
        x: Math.random() * (w + 100) - 50,
        y: -20 - Math.random() * 60,
        size: type === 'dust' ? 1.5 + Math.random() * 3 : type === 'petal' ? 5 + Math.random() * 7 : 6 + Math.random() * 10,
        rot: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.3) * 0.5,
        vy: type === 'dust' ? 0.2 + Math.random() * 0.3 : 0.35 + Math.random() * 0.7,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        opacity: type === 'dust' ? 0.35 + Math.random() * 0.3 : 0.3 + Math.random() * 0.4,
        color,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleAmp: type === 'dust' ? 0.4 + Math.random() * 0.5 : 0.6 + Math.random() * 1.2,
        wobbleFreq: 0.008 + Math.random() * 0.012,
        type,
      })
    }

    const drawLeaf = (l: Leaf) => {
      ctx.save()
      ctx.translate(l.x, l.y)
      ctx.rotate(l.rot)
      ctx.globalAlpha = l.opacity

      if (l.type === 'dust') {
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, l.size * 5)
        glow.addColorStop(0, l.color + (l.opacity * 0.8) + ')')
        glow.addColorStop(0.5, l.color + (l.opacity * 0.2) + ')')
        glow.addColorStop(1, l.color + '0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(0, 0, l.size * 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = l.color + l.opacity + ')'
        ctx.beginPath()
        ctx.arc(0, 0, l.size * 0.7, 0, Math.PI * 2)
        ctx.fill()
      } else if (l.type === 'petal') {
        ctx.fillStyle = l.color + l.opacity + ')'
        ctx.beginPath()
        ctx.moveTo(0, -l.size)
        ctx.bezierCurveTo(l.size * 0.7, -l.size * 0.4, l.size * 0.6, l.size * 0.3, 0, l.size)
        ctx.bezierCurveTo(-l.size * 0.6, l.size * 0.3, -l.size * 0.7, -l.size * 0.4, 0, -l.size)
        ctx.fill()
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,' + (l.opacity * 0.15) + ')'
        ctx.beginPath()
        ctx.ellipse(-l.size * 0.15, -l.size * 0.2, l.size * 0.2, l.size * 0.35, -0.3, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillStyle = l.color + l.opacity + ')'
        ctx.beginPath()
        ctx.moveTo(0, -l.size)
        ctx.bezierCurveTo(l.size * 0.5, -l.size * 0.6, l.size * 0.4, l.size * 0.3, 0, l.size)
        ctx.bezierCurveTo(-l.size * 0.4, l.size * 0.3, -l.size * 0.5, -l.size * 0.6, 0, -l.size)
        ctx.fill()
        // Vein
        ctx.strokeStyle = l.color + (l.opacity * 0.6) + ')'
        ctx.lineWidth = 0.7
        ctx.beginPath()
        ctx.moveTo(0, -l.size * 0.8)
        ctx.lineTo(0, l.size * 0.8)
        ctx.stroke()
        // Side veins
        for (let i = -2; i <= 2; i++) {
          if (i === 0) continue
          const vy = i * l.size * 0.25
          ctx.beginPath()
          ctx.moveTo(0, vy)
          ctx.lineTo(l.size * 0.28 * (i === 1 || i === -1 ? 1 : -1), vy + l.size * 0.18 * (i > 0 ? -1 : 1))
          ctx.stroke()
        }
      }

      ctx.restore()
    }

    const animate = () => {
      time++
      ctx.clearRect(0, 0, w, h)

      // Spawn every 8 frames — dense stream
      if (time % 8 === 0 && leaves.length < 100) {
        spawnLeaf()
        // Sometimes double-spawn for clusters
        if (Math.random() > 0.6) spawnLeaf()
      }

      leaves = leaves.filter(l => {
        const breeze = Math.sin(time * 0.003 + l.wobblePhase) * 0.5
        l.x += l.vx + Math.sin(time * l.wobbleFreq + l.wobblePhase) * l.wobbleAmp + breeze
        l.y += l.vy
        l.rot += l.rotSpeed + Math.sin(time * 0.005 + l.wobblePhase) * 0.005

        if (l.y > h + 40 || l.x < -100 || l.x > w + 100) return false

        drawLeaf(l)
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
