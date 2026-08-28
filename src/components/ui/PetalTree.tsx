import { useEffect, useRef } from 'react'

/* ------------------------------------------------------------------ */
/*  Cherry Blossom Branch — full-screen 2D canvas                      */
/*  Branch extends from top-right, petals fall gently                  */
/* ------------------------------------------------------------------ */

interface Branch {
  x1: number; y1: number
  x2: number; y2: number
  width: number
  depth: number
}

interface Blossom {
  x: number; y: number
  size: number
  opacity: number
  phase: number
}

interface FallingPetal {
  x: number; y: number
  size: number
  rot: number
  vx: number; vy: number
  rotSpeed: number
  wobblePhase: number
  wobbleAmp: number
  wobbleFreq: number
  opacity: number
  fadeTimer: number
  maxLife: number
  color: string
}

interface Star {
  x: number; y: number
  size: number
  brightness: number
  twinkleSpeed: number
  twinkleOffset: number
}

const PETAL_COLORS = [
  [249, 168, 212],  // pink
  [251, 207, 232],  // light pink
  [253, 164, 175],  // rose
  [252, 231, 243],  // blush
  [244, 114, 182],  // hot pink
  [251, 191, 236],  // soft pink
]

// Seeded random for deterministic tree structure
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export default function PetalTree() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = 0
    let w = 0, h = 0, time = 0
    let branches: Branch[] = []
    let blossoms: Blossom[] = []
    let fallingPetals: FallingPetal[] = []
    let stars: Star[] = []

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      generateTree()
    }

    const generateTree = () => {
      branches = []
      blossoms = []
      stars = []

      const rand = seededRandom(42)

      // Main branch from top-right
      const startX = w * 1.05
      const startY = h * -0.05
      const endX = w * 0.15
      const endY = h * 0.35

      // Generate main branch segments
      const mainSegments = 8
      for (let i = 0; i < mainSegments; i++) {
        const t1 = i / mainSegments
        const t2 = (i + 1) / mainSegments
        const x1 = startX + (endX - startX) * t1 + (rand() - 0.5) * 20
        const y1 = startY + (endY - startY) * t1 + (rand() - 0.5) * 15
        const x2 = startX + (endX - startX) * t2 + (rand() - 0.5) * 20
        const y2 = startY + (endY - startY) * t2 + (rand() - 0.5) * 15
        branches.push({ x1, y1, x2, y2, width: 12 - i * 1.2, depth: 0 })
      }

      // Sub-branches
      for (let i = 3; i < mainSegments; i++) {
        const parent = branches[i]
        const dir = i % 2 === 0 ? -1 : 1
        const subLen = 0.3 + rand() * 0.4
        const angle = Math.atan2(parent.y2 - parent.y1, parent.x2 - parent.x1) + dir * (0.4 + rand() * 0.5)

        const subSegs = 3 + Math.floor(rand() * 2)
        let px = parent.x2, py = parent.y2
        for (let j = 0; j < subSegs; j++) {
          const segLen = (w * 0.15 * subLen) / subSegs
          const nx = px + Math.cos(angle) * segLen + (rand() - 0.5) * 10
          const ny = py + Math.sin(angle) * segLen + (rand() - 0.5) * 8
          branches.push({
            x1: px, y1: py, x2: nx, y2: ny,
            width: parent.width * 0.5, depth: 1,
          })
          px = nx
          py = ny

          // Add blossoms at tips
          if (j === subSegs - 1) {
            for (let k = 0; k < 2 + Math.floor(rand() * 3); k++) {
              blossoms.push({
                x: nx + (rand() - 0.5) * 20,
                y: ny + (rand() - 0.5) * 15,
                size: 5.5 + rand() * 6,
                opacity: 0.5 + rand() * 0.5,
                phase: rand() * Math.PI * 2,
              })
            }
          }
        }

        // Tertiary branches (small twigs)
        if (rand() > 0.4) {
          const twigAngle = angle + (rand() - 0.5) * 1.2
          const twigLen = w * 0.05 * subLen
          const tx = px + Math.cos(twigAngle) * twigLen
          const ty = py + Math.sin(twigAngle) * twigLen
          branches.push({
            x1: px, y1: py, x2: tx, y2: ty,
            width: parent.width * 0.3, depth: 2,
          })
          // Blossom at twig tip
          for (let k = 0; k < 1 + Math.floor(rand() * 2); k++) {
            blossoms.push({
              x: tx + (rand() - 0.5) * 15,
              y: ty + (rand() - 0.5) * 10,
              size: 4.5 + rand() * 5,
              opacity: 0.4 + rand() * 0.4,
              phase: rand() * Math.PI * 2,
            })
          }
        }
      }

      // Blossoms along main branch tips
      const lastBranch = branches[branches.length - 1]
      for (let k = 0; k < 4; k++) {
        blossoms.push({
          x: lastBranch.x2 + (rand() - 0.5) * 30,
          y: lastBranch.y2 + (rand() - 0.5) * 20,
          size: 6.5 + rand() * 6,
          opacity: 0.5 + rand() * 0.5,
          phase: rand() * Math.PI * 2,
        })
      }

      // Stars
      for (let i = 0; i < 80; i++) {
        stars.push({
          x: rand() * w,
          y: rand() * h,
          size: 0.5 + rand() * 1.5,
          brightness: 0.3 + rand() * 0.5,
          twinkleSpeed: 0.5 + rand() * 2,
          twinkleOffset: rand() * Math.PI * 2,
        })
      }
    }

    const spawnPetal = () => {
      if (blossoms.length === 0) return
      // Pick a random blossom to spawn from
      const source = blossoms[Math.floor(Math.random() * blossoms.length)]
      const color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)]

      fallingPetals.push({
        x: source.x + (Math.random() - 0.5) * 10,
        y: source.y + (Math.random() - 0.5) * 8,
        size: 3 + Math.random() * 5,
        rot: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.3,
        vy: 0.2 + Math.random() * 0.4,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleAmp: 0.3 + Math.random() * 0.6,
        wobbleFreq: 0.01 + Math.random() * 0.015,
        opacity: 0,
        fadeTimer: 0,
        maxLife: 250 + Math.random() * 200,
        color: `${color[0]},${color[1]},${color[2]}`,
      })
    }

    const drawSky = () => {
      // Night sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, '#0a1428')
      grad.addColorStop(0.3, '#0f1d3c')
      grad.addColorStop(0.6, '#162850')
      grad.addColorStop(1, '#1a3060')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      // Subtle blue glow behind the tree area
      const glow = ctx.createRadialGradient(w * 0.35, h * 0.3, 0, w * 0.35, h * 0.3, w * 0.5)
      glow.addColorStop(0, 'rgba(59,130,246,0.04)')
      glow.addColorStop(0.5, 'rgba(96,165,250,0.02)')
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, h)

      // Stars
      stars.forEach(s => {
        const twinkle = 0.5 + 0.5 * Math.sin(time * 0.02 * s.twinkleSpeed + s.twinkleOffset)
        const alpha = s.brightness * twinkle
        ctx.fillStyle = `rgba(200,220,255,${alpha})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    const drawBranch = (b: Branch, sway: number) => {
      // Apply gentle sway based on depth
      const swayAmount = sway * (1 - b.depth * 0.3)
      const x1 = b.x1 + swayAmount
      const y1 = b.y1
      const x2 = b.x2 + swayAmount * 0.8
      const y2 = b.y2

      ctx.strokeStyle = `rgb(${70 + b.depth * 15},${45 + b.depth * 10},${30 + b.depth * 5})`
      ctx.lineWidth = Math.max(1, b.width)
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(x1, y1)

      // Slight curve
      const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * 2
      const my = (y1 + y2) / 2 + (Math.random() - 0.5) * 2
      ctx.quadraticCurveTo(mx, my, x2, y2)
      ctx.stroke()
    }

    const drawBlossom = (b: Blossom, sway: number) => {
      const swayAmount = sway * (0.6 + b.phase * 0.2)
      const x = b.x + swayAmount
      const y = b.y
      const breathe = 1 + Math.sin(time * 0.015 + b.phase) * 0.05
      const size = b.size * breathe

      ctx.save()
      ctx.translate(x, y)
      ctx.globalAlpha = b.opacity

      // 5-petal flower
      for (let i = 0; i < 5; i++) {
        ctx.save()
        ctx.rotate((i * Math.PI * 2) / 5 + time * 0.001)

        const grad = ctx.createRadialGradient(0, -size * 0.4, 0, 0, -size * 0.4, size * 0.5)
        grad.addColorStop(0, 'rgba(253,200,220,0.9)')
        grad.addColorStop(0.6, `rgba(${249 + Math.floor(b.phase * 5)},${168 + Math.floor(b.phase * 10)},212,0.7)`)
        grad.addColorStop(1, 'rgba(244,114,182,0.3)')

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.ellipse(0, -size * 0.4, size * 0.28, size * 0.45, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // Center pistil
      const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.15)
      centerGrad.addColorStop(0, 'rgba(253,224,71,0.8)')
      centerGrad.addColorStop(1, 'rgba(251,191,36,0.3)')
      ctx.fillStyle = centerGrad
      ctx.beginPath()
      ctx.arc(0, 0, size * 0.12, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    const drawFallingPetal = (p: FallingPetal) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = p.opacity

      // Soft glow
      ctx.shadowColor = `rgba(${p.color},0.15)`
      ctx.shadowBlur = 8

      // Petal shape
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size)
      grad.addColorStop(0, `rgba(${p.color},${p.opacity})`)
      grad.addColorStop(0.7, `rgba(${p.color},${p.opacity * 0.6})`)
      grad.addColorStop(1, `rgba(${p.color},0)`)

      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.moveTo(0, -p.size)
      ctx.bezierCurveTo(p.size * 0.6, -p.size * 0.3, p.size * 0.5, p.size * 0.3, 0, p.size)
      ctx.bezierCurveTo(-p.size * 0.5, p.size * 0.3, -p.size * 0.6, -p.size * 0.3, 0, -p.size)
      ctx.fill()

      // Highlight
      ctx.shadowBlur = 0
      ctx.fillStyle = `rgba(255,255,255,${p.opacity * 0.15})`
      ctx.beginPath()
      ctx.ellipse(-p.size * 0.1, -p.size * 0.15, p.size * 0.12, p.size * 0.25, -0.3, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    const animate = () => {
      time++
      ctx.clearRect(0, 0, w, h)

      drawSky()

      // Branch sway — gentle sine wave
      const sway = Math.sin(time * 0.008) * 3 + Math.sin(time * 0.003) * 2

      // Draw branches (back to front)
      branches.forEach(b => drawBranch(b, sway))

      // Draw blossoms
      blossoms.forEach(b => drawBlossom(b, sway))

      // Spawn petals
      if (time % 11 === 0 && fallingPetals.length < 65) {
        spawnPetal()
      }

      // Update and draw falling petals
      fallingPetals = fallingPetals.filter(p => {
        p.fadeTimer++
        const lifeRatio = p.fadeTimer / p.maxLife

        // Fade in
        if (p.fadeTimer < 30) {
          p.opacity = (p.fadeTimer / 30) * 0.6
        }
        // Fade out
        else if (lifeRatio > 0.7) {
          p.opacity = Math.max(0, 0.6 * (1 - (lifeRatio - 0.7) / 0.3))
        } else {
          p.opacity = 0.6
        }

        // Physics
        const breeze = Math.sin(time * 0.004 + p.wobblePhase) * 0.3
        p.x += p.vx + Math.sin(time * p.wobbleFreq + p.wobblePhase) * p.wobbleAmp + breeze
        p.y += p.vy
        p.vy += 0.001 // gentle gravity
        p.rot += p.rotSpeed + Math.sin(time * 0.006 + p.wobblePhase) * 0.003

        // Remove if off screen or faded
        if (p.y > h + 50 || p.x < -50 || p.x > w + 50 || p.opacity <= 0) return false

        drawFallingPetal(p)
        return true
      })

      // Soft vignette
      const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7)
      vignette.addColorStop(0, 'rgba(0,0,0,0)')
      vignette.addColorStop(1, 'rgba(0,0,0,0.3)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, w, h)

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
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  )
}
