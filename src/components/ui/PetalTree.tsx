import { useEffect, useRef } from 'react'

// ── Types ──
interface Petal {
  x: number; y: number; size: number; vx: number; vy: number
  rot: number; rotSpeed: number; opacity: number; color: string
  wobblePhase: number; wobbleAmp: number; wobbleFreq: number
  life: number; maxLife: number
}

interface Firefly {
  x: number; y: number; size: number; phase: number
  speedX: number; speedY: number; brightness: number
}

interface GrassBlade {
  x: number; height: number; swayAmp: number; swayFreq: number; phase: number; shade: number
}

interface Branch {
  x1: number; y1: number; x2: number; y2: number; width: number; depth: number
}

interface LeafSpot {
  x: number; y: number; w: number; h: number; rot: number; g: number; alpha: number
}

interface CanopyCluster {
  dx: number; dy: number; r: number
}

// Pre-generated static data
interface TreeData {
  branches: Branch[]
  canopyCenter: { x: number; y: number }
  clusters: CanopyCluster[]
  leafSpots: LeafSpot[]
  barkLines: { x: number; y: number; ex: number; ey: number }[]
}

const PETAL_COLORS = [
  'rgba(255,182,193,', 'rgba(255,160,180,', 'rgba(255,200,190,',
  'rgba(255,218,185,', 'rgba(255,230,210,', 'rgba(240,190,200,',
]

// Seeded random for deterministic generation
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
    let petals: Petal[] = []
    let fireflies: Firefly[] = []
    let grassBlades: GrassBlade[] = []
    let treeData: TreeData | null = null

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      generateAll()
    }

    // ── Generate everything once ──
    const generateAll = () => {
      const rand = seededRandom(42)

      // Grass
      grassBlades = []
      for (let i = 0; i < Math.floor(w / 3); i++) {
        grassBlades.push({
          x: rand() * w,
          height: 8 + rand() * 18,
          swayAmp: 2 + rand() * 4,
          swayFreq: 0.01 + rand() * 0.015,
          phase: rand() * Math.PI * 2,
          shade: rand(),
        })
      }

      // Fireflies
      fireflies = []
      for (let i = 0; i < 25; i++) {
        fireflies.push({
          x: rand() * w, y: h * 0.3 + rand() * h * 0.5,
          size: 1.5 + rand() * 2, phase: rand() * Math.PI * 2,
          speedX: (rand() - 0.5) * 0.3, speedY: (rand() - 0.5) * 0.2,
          brightness: 0.3 + rand() * 0.7,
        })
      }

      // Tree structure
      const baseX = w * 0.5
      const baseY = h * 0.82
      const trunkTopX = baseX
      const trunkTopY = baseY - h * 0.3

      // Generate branches deterministically
      const branches: Branch[] = []
      const addBranch = (x1: number, y1: number, angle: number, len: number, width: number, depth: number) => {
        if (depth > 4 || len < 8) return
        const x2 = x1 + Math.cos(angle) * len
        const y2 = y1 + Math.sin(angle) * len
        branches.push({ x1, y1, x2, y2, width, depth })
        const spread = 0.35 + rand() * 0.3
        addBranch(x2, y2, angle - spread, len * 0.7, width * 0.6, depth + 1)
        addBranch(x2, y2, angle + spread, len * 0.65, width * 0.55, depth + 1)
        if (depth < 2 && rand() > 0.5) {
          addBranch(x2, y2, angle + (rand() - 0.5) * 0.4, len * 0.5, width * 0.5, depth + 1)
        }
      }

      addBranch(trunkTopX, trunkTopY, -Math.PI / 2 - 0.5, h * 0.12, 4, 0)
      addBranch(trunkTopX, trunkTopY, -Math.PI / 2 + 0.5, h * 0.11, 4, 0)
      addBranch(trunkTopX, trunkTopY + h * 0.06, -Math.PI / 2 - 0.8, h * 0.09, 3, 1)
      addBranch(trunkTopX, trunkTopY + h * 0.06, -Math.PI / 2 + 0.8, h * 0.08, 3, 1)

      // Canopy clusters
      const clusters: CanopyCluster[] = [
        { dx: 0, dy: -h * 0.06, r: h * 0.1 },
        { dx: -w * 0.06, dy: -h * 0.02, r: h * 0.08 },
        { dx: w * 0.05, dy: -h * 0.03, r: h * 0.075 },
        { dx: -w * 0.03, dy: -h * 0.08, r: h * 0.065 },
        { dx: w * 0.04, dy: -h * 0.07, r: h * 0.07 },
        { dx: 0, dy: -h * 0.1, r: h * 0.05 },
        { dx: -w * 0.08, dy: 0, r: h * 0.06 },
        { dx: w * 0.07, dy: -h * 0.01, r: h * 0.055 },
      ]

      // Leaf detail spots — pre-generated
      const leafSpots: LeafSpot[] = []
      for (let i = 0; i < 50; i++) {
        const angle = rand() * Math.PI * 2
        const dist = rand() * h * 0.08
        leafSpots.push({
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist * 0.7 - 5,
          w: 2 + rand() * 4,
          h: (2 + rand() * 4) * 0.6,
          rot: rand() * Math.PI,
          g: 60 + rand() * 50,
          alpha: 0.15 + rand() * 0.25,
        })
      }

      // Bark texture lines
      const barkLines: TreeData['barkLines'] = []
      for (let i = 0; i < 14; i++) {
        const t = i / 14
        const bw = 14 - t * 8
        barkLines.push({
          x: baseX - bw * 0.3,
          y: baseY + (trunkTopY - baseY) * t,
          ex: baseX + bw * 0.2,
          ey: baseY + (trunkTopY - baseY) * t + 8 + rand() * 6,
        })
      }

      treeData = {
        branches,
        canopyCenter: { x: trunkTopX, y: trunkTopY - h * 0.04 },
        clusters,
        leafSpots,
        barkLines,
      }
    }

    // ── Drawing functions (use pre-generated data) ──

    const drawSky = () => {
      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, '#1a2a1a')
      grad.addColorStop(0.25, '#2a3d2a')
      grad.addColorStop(0.5, '#3d5a3d')
      grad.addColorStop(0.7, '#4a6a3a')
      grad.addColorStop(0.85, '#5a7a3a')
      grad.addColorStop(1, '#3a4a2a')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      const glow = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, h * 0.5)
      glow.addColorStop(0, 'rgba(255,200,120,0.12)')
      glow.addColorStop(0.4, 'rgba(255,180,100,0.06)')
      glow.addColorStop(1, 'rgba(255,180,100,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, h)
    }

    const drawHills = () => {
      const sway = Math.sin(time * 0.003) * 2
      ctx.beginPath()
      ctx.moveTo(0, h * 0.65)
      ctx.bezierCurveTo(w * 0.2 + sway, h * 0.48, w * 0.4 + sway, h * 0.52, w * 0.6, h * 0.58)
      ctx.bezierCurveTo(w * 0.8, h * 0.62, w * 0.9, h * 0.55, w, h * 0.6)
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath()
      ctx.fillStyle = 'rgba(30,50,30,0.6)'
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(0, h * 0.72)
      ctx.bezierCurveTo(w * 0.15 + sway * 1.5, h * 0.62, w * 0.35 + sway, h * 0.66, w * 0.55, h * 0.7)
      ctx.bezierCurveTo(w * 0.75, h * 0.73, w * 0.9 + sway, h * 0.65, w, h * 0.68)
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath()
      ctx.fillStyle = 'rgba(25,42,25,0.7)'
      ctx.fill()
    }

    const drawGround = () => {
      const groundY = h * 0.82
      const grad = ctx.createLinearGradient(0, groundY, 0, h)
      grad.addColorStop(0, 'rgba(20,35,18,0.9)')
      grad.addColorStop(0.3, 'rgba(18,30,16,0.95)')
      grad.addColorStop(1, 'rgba(14,24,12,1)')
      ctx.fillStyle = grad
      ctx.fillRect(0, groundY, w, h - groundY)

      ctx.strokeStyle = 'rgba(40,60,35,0.3)'
      ctx.lineWidth = 0.5
      for (let i = 0; i < 20; i++) {
        const y = groundY + 5 + i * ((h - groundY) / 20)
        ctx.beginPath()
        ctx.moveTo(0, y)
        for (let x = 0; x < w; x += 20) {
          ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 2)
        }
        ctx.stroke()
      }
    }

    const drawGrass = () => {
      const groundY = h * 0.82
      grassBlades.forEach(blade => {
        const sway = Math.sin(time * blade.swayFreq + blade.phase) * blade.swayAmp
        const g = 30 + blade.shade * 40
        ctx.strokeStyle = `rgba(${20 + blade.shade * 15},${g},${15 + blade.shade * 10},0.7)`
        ctx.lineWidth = 1 + blade.shade * 0.5
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(blade.x, groundY)
        ctx.quadraticCurveTo(blade.x + sway * 0.5, groundY - blade.height * 0.6, blade.x + sway, groundY - blade.height)
        ctx.stroke()
      })
    }

    const drawTree = () => {
      if (!treeData) return
      const baseX = w * 0.5
      const baseY = h * 0.82
      const trunkH = h * 0.3
      const sway = Math.sin(time * 0.006) * 3

      // Shadow
      ctx.save()
      ctx.filter = 'blur(8px)'
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.beginPath()
      ctx.ellipse(baseX + 15, baseY + 5, 35, 8, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Trunk
      const trunkTopX = baseX + sway
      const trunkTopY = baseY - trunkH
      const perpX = -Math.sin(Math.atan2(trunkTopY - baseY, trunkTopX - baseX))
      const perpY = Math.cos(Math.atan2(trunkTopY - baseY, trunkTopX - baseX))

      ctx.beginPath()
      ctx.moveTo(baseX + perpX * 14, baseY + perpY * 14)
      ctx.lineTo(trunkTopX + perpX * 6, trunkTopY + perpY * 6)
      ctx.lineTo(trunkTopX - perpX * 6, trunkTopY - perpY * 6)
      ctx.lineTo(baseX - perpX * 14, baseY - perpY * 14)
      ctx.closePath()
      const barkGrad = ctx.createLinearGradient(baseX + perpX * 14, baseY, baseX - perpX * 14, baseY)
      barkGrad.addColorStop(0, '#3a2815')
      barkGrad.addColorStop(0.3, '#4a3520')
      barkGrad.addColorStop(0.5, '#5a4030')
      barkGrad.addColorStop(0.7, '#4a3520')
      barkGrad.addColorStop(1, '#3a2815')
      ctx.fillStyle = barkGrad
      ctx.fill()

      // Bark texture (pre-generated positions, drawn with sway offset)
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'
      ctx.lineWidth = 0.8
      treeData.barkLines.forEach(line => {
        const sx = line.x + sway * ((line.y - baseY) / (trunkTopY - baseY))
        const sex = line.ex + sway * ((line.y - baseY) / (trunkTopY - baseY))
        ctx.beginPath()
        ctx.moveTo(sx, line.y)
        ctx.lineTo(sex, line.ey)
        ctx.stroke()
      })

      // Branches (pre-generated, drawn with sway offset proportional to depth)
      treeData.branches.forEach(b => {
        const t = Math.min(1, b.y1 / (baseY - trunkTopY))
        const bSway = sway * t
        ctx.strokeStyle = b.depth <= 1 ? '#4a3520' : b.depth <= 2 ? '#5a4530' : '#6a5540'
        ctx.lineWidth = b.width
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(b.x1 + bSway, b.y1)
        ctx.lineTo(b.x2 + bSway * 1.2, b.y2)
        ctx.stroke()
      })

      // Canopy
      const canopySway = Math.sin(time * 0.008) * 4
      const drawLeafCluster = (cx: number, cy: number, r: number, alpha: number) => {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        grad.addColorStop(0, `rgba(45,85,40,${alpha})`)
        grad.addColorStop(0.4, `rgba(55,95,45,${alpha * 0.7})`)
        grad.addColorStop(0.7, `rgba(40,75,35,${alpha * 0.4})`)
        grad.addColorStop(1, `rgba(35,65,30,0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fill()
      }

      const cc = treeData.canopyCenter
      // Back layer
      treeData.clusters.forEach(c => {
        drawLeafCluster(cc.x + c.dx + canopySway * 0.5, cc.y + c.dy, c.r * 1.1, 0.5)
      })
      // Front layer
      treeData.clusters.forEach(c => {
        drawLeafCluster(cc.x + c.dx + canopySway, cc.y + c.dy - 5, c.r * 0.9, 0.6)
      })
      // Highlight
      treeData.clusters.slice(0, 4).forEach(c => {
        drawLeafCluster(cc.x + c.dx + canopySway * 1.2, cc.y + c.dy - 8, c.r * 0.6, 0.3)
      })

      // Leaf detail spots (pre-generated positions + sizes)
      treeData.leafSpots.forEach(spot => {
        const sx = cc.x + spot.x + canopySway
        const sy = cc.y + spot.y - 5
        ctx.fillStyle = `rgba(${30 + spot.g * 0.3},${spot.g},${25 + spot.g * 0.2},${spot.alpha})`
        ctx.beginPath()
        ctx.ellipse(sx, sy, spot.w, spot.h, spot.rot, 0, Math.PI * 2)
        ctx.fill()
      })

      // Store canopy origin for petal spawning
      return { x: trunkTopX + canopySway, y: cc.y }
    }

    // ── Petals ──
    const spawnPetal = (originX: number, originY: number) => {
      petals.push({
        x: originX + (Math.random() - 0.5) * 60,
        y: originY + (Math.random() - 0.5) * 40,
        size: 2.5 + Math.random() * 4.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: 0.15 + Math.random() * 0.4,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        opacity: 0.5 + Math.random() * 0.5,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        wobbleAmp: 0.3 + Math.random() * 0.7,
        wobbleFreq: 0.015 + Math.random() * 0.02,
        wobblePhase: Math.random() * Math.PI * 2,
        life: 0,
        maxLife: 350 + Math.random() * 250,
      })
    }

    const drawPetal = (p: Petal) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = p.opacity
      ctx.fillStyle = p.color + p.opacity + ')'
      ctx.shadowColor = p.color + '0.3)'
      ctx.shadowBlur = 3
      ctx.beginPath()
      ctx.moveTo(0, -p.size)
      ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.4, p.size * 0.6, p.size * 0.3, 0, p.size)
      ctx.bezierCurveTo(-p.size * 0.6, p.size * 0.3, -p.size * 0.7, -p.size * 0.4, 0, -p.size)
      ctx.fill()
      ctx.restore()
    }

    // ── Fireflies ──
    const drawFireflies = () => {
      fireflies.forEach(f => {
        f.x += f.speedX + Math.sin(time * 0.01 + f.phase) * 0.15
        f.y += f.speedY + Math.cos(time * 0.008 + f.phase) * 0.1
        if (f.x < -10) f.x = w + 10
        if (f.x > w + 10) f.x = -10
        if (f.y < h * 0.2) f.y = h * 0.7
        if (f.y > h * 0.85) f.y = h * 0.3

        const pulse = 0.3 + Math.sin(time * 0.03 + f.phase) * 0.5 + 0.5
        const alpha = f.brightness * pulse * 0.6

        const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 6)
        glow.addColorStop(0, `rgba(255,240,150,${alpha * 0.4})`)
        glow.addColorStop(0.5, `rgba(255,220,100,${alpha * 0.1})`)
        glow.addColorStop(1, 'rgba(255,220,100,0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.size * 6, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = `rgba(255,245,180,${alpha})`
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.size * pulse, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    const drawFog = () => {
      const fogY = h * 0.65
      for (let i = 0; i < 3; i++) {
        const offset = Math.sin(time * 0.002 + i * 2) * 30
        const fogGrad = ctx.createLinearGradient(0, fogY + i * 20, 0, fogY + i * 20 + 40)
        fogGrad.addColorStop(0, 'rgba(60,80,55,0)')
        fogGrad.addColorStop(0.5, `rgba(60,80,55,${0.04 - i * 0.01})`)
        fogGrad.addColorStop(1, 'rgba(60,80,55,0)')
        ctx.fillStyle = fogGrad
        ctx.fillRect(offset - 50, fogY + i * 20, w + 100, 40)
      }
    }

    const drawAmbientLight = () => {
      const pulse = Math.sin(time * 0.005) * 0.5 + 0.5
      const glow = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, h * 0.4)
      glow.addColorStop(0, `rgba(255,200,120,${0.03 + pulse * 0.02})`)
      glow.addColorStop(1, 'rgba(255,200,120,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, h)
    }

    // ── Main loop ──
    let canopyOrigin = { x: w * 0.5, y: h * 0.35 }

    const animate = () => {
      time++
      ctx.clearRect(0, 0, w, h)

      drawSky()
      drawHills()
      drawGround()
      drawGrass()
      drawFog()

      const origin = drawTree()
      if (origin) canopyOrigin = origin
      drawAmbientLight()

      if (time % 12 === 0 && petals.length < 50) {
        spawnPetal(canopyOrigin.x, canopyOrigin.y)
      }

      petals = petals.filter(p => {
        p.life++
        if (p.life > p.maxLife || p.y > h + 20) return false
        p.x += p.vx + Math.sin(p.life * p.wobbleFreq + p.wobblePhase) * p.wobbleAmp
        p.y += p.vy
        p.vy += 0.001
        p.vx *= 0.999
        p.rot += p.rotSpeed
        let alpha = p.opacity
        if (p.life < 40) alpha *= p.life / 40
        if (p.life > p.maxLife - 50) alpha *= (p.maxLife - p.life) / 50
        p.opacity = alpha
        drawPetal(p)
        return true
      })

      drawFireflies()
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
