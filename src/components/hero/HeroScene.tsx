import { useEffect, useRef, useMemo } from 'react'

interface Branch { x1: number; y1: number; x2: number; y2: number; width: number; depth: number; growAt: number }
interface Blossom { x: number; y: number; size: number; opacity: number; phase: number; petalCount: number; appearAt: number }
interface FallingPetal { x: number; y: number; size: number; rot: number; vx: number; vy: number; rotSpeed: number; wobblePhase: number; wobbleAmp: number; wobbleFreq: number; opacity: number; fadeTimer: number; maxLife: number; color: number[] }
interface Star { x: number; y: number; size: number; brightness: number; twinkleSpeed: number; twinkleOffset: number }

const PETAL_COLORS = [[249,168,212],[251,207,232],[253,164,175],[252,231,243],[244,114,182],[251,191,236],[255,228,230],[248,180,210]]

function seededRandom(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646 }
}

interface Props {
  growthProgress?: number
}

export default function HeroScene({ growthProgress = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(growthProgress)
  progressRef.current = growthProgress

  const { branches, blossoms, stars } = useMemo(() => {
    const branches: Branch[] = []
    const blossoms: Blossom[] = []
    const stars: Star[] = []
    const rand = seededRandom(77)

    // Trunk — starts from bottom center
    const baseX = 0.5, trunkTop = 0.28
    const trunkSegs = 12
    let trunkBranches: Branch[] = []
    for (let i = 0; i < trunkSegs; i++) {
      const t1 = i / trunkSegs, t2 = (i + 1) / trunkSegs
      const wobble = Math.sin(t1 * Math.PI * 0.7) * 0.02 + (rand() - 0.5) * 0.005
      const wobble2 = Math.sin(t2 * Math.PI * 0.7) * 0.02 + (rand() - 0.5) * 0.005
      trunkBranches.push({
        x1: baseX + wobble, y1: 1.05 + (trunkTop - 1.05) * t1,
        x2: baseX + wobble2, y2: 1.05 + (trunkTop - 1.05) * t2,
        width: Math.max(3, 20 - i * 1.5), depth: 0,
        growAt: t1 * 0.25 // grows during first 25% of progress
      })
    }
    branches.push(...trunkBranches)

    // Main branches — grow outward from trunk
    const branchCfgs = [
      { angle: -0.7, lengthRatio: 0.38, spread: 0.18 },
      { angle: -1.3, lengthRatio: 0.34, spread: 0.15 },
      { angle: -1.9, lengthRatio: 0.28, spread: 0.12 },
      { angle: -2.5, lengthRatio: 0.32, spread: 0.16 },
      { angle: -0.2, lengthRatio: 0.36, spread: 0.14 },
    ]

    branchCfgs.forEach((cfg, bi) => {
      const parentIdx = Math.min(Math.floor((0.3 + bi / 5 * 0.5) * (trunkBranches.length - 1)), trunkBranches.length - 1)
      const parent = trunkBranches[parentIdx]
      const baseAngle = cfg.angle + (rand() - 0.5) * 0.3
      const branchGrowBase = 0.25 + bi * 0.07
      let px = parent.x2, py = parent.y2
      const segs = 4 + Math.floor(rand() * 2)

      for (let j = 0; j < segs; j++) {
        const ang = baseAngle + (rand() - 0.5) * cfg.spread
        const segLen = cfg.lengthRatio / segs
        const nx = px + Math.cos(ang) * segLen + (rand() - 0.5) * 0.012
        const ny = py + Math.sin(ang) * segLen + (rand() - 0.5) * 0.012
        const growAt = branchGrowBase + j * 0.01
        branches.push({
          x1: px, y1: py, x2: nx, y2: ny,
          width: Math.max(1, 9 - j * 1.5 - bi * 0.5), depth: 1,
          growAt
        })

        // Sub-branches
        if (j > 0 && rand() > 0.25) {
          const subAngle = ang + (rand() > 0.5 ? 1 : -1) * (0.4 + rand() * 0.6)
          const subLen = (cfg.lengthRatio / segs) * (0.5 + rand() * 0.5)
          const sx = px + Math.cos(subAngle) * subLen
          const sy = py + Math.sin(subAngle) * subLen
          branches.push({
            x1: px, y1: py, x2: sx, y2: sy,
            width: Math.max(0.5, 5 - j), depth: 2,
            growAt: growAt + 0.02
          })

          // Blossoms on sub-branches
          for (let k = 0; k < 2 + Math.floor(rand() * 4); k++) {
            blossoms.push({
              x: sx + (rand() - 0.5) * 0.06, y: sy + (rand() - 0.5) * 0.05,
              size: 5.5 + rand() * 8, opacity: 0.5 + rand() * 0.5,
              phase: rand() * Math.PI * 2, petalCount: rand() > 0.3 ? 5 : 6,
              appearAt: growAt + 0.06 + rand() * 0.04
            })
          }

          // Tiny twigs
          if (rand() > 0.4) {
            const twigAngle = subAngle + (rand() - 0.5) * 0.8
            const twigLen = subLen * 0.6
            const tx = sx + Math.cos(twigAngle) * twigLen
            const ty = sy + Math.sin(twigAngle) * twigLen
            branches.push({
              x1: sx, y1: sy, x2: tx, y2: ty,
              width: Math.max(0.3, 2.5 - j * 0.3), depth: 3,
              growAt: growAt + 0.04
            })
            for (let k = 0; k < 1 + Math.floor(rand() * 3); k++) {
              blossoms.push({
                x: tx + (rand() - 0.5) * 0.04, y: ty + (rand() - 0.5) * 0.03,
                size: 4.5 + rand() * 6, opacity: 0.4 + rand() * 0.5,
                phase: rand() * Math.PI * 2, petalCount: 5,
                appearAt: growAt + 0.08 + rand() * 0.03
              })
            }
          }
          px = nx; py = ny
        }
      }

      // Tip blossoms
      for (let k = 0; k < 3 + Math.floor(rand() * 5); k++) {
        blossoms.push({
          x: px + (rand() - 0.5) * 0.07, y: py + (rand() - 0.5) * 0.06,
          size: 6 + rand() * 9, opacity: 0.5 + rand() * 0.5,
          phase: rand() * Math.PI * 2, petalCount: rand() > 0.3 ? 5 : 6,
          appearAt: 0.55 + rand() * 0.1
        })
      }
    })

    // Extra scattered blossoms around canopy
    for (let i = 0; i < 15; i++) {
      const a = rand() * Math.PI * 2, d = rand() * 0.12
      blossoms.push({
        x: baseX + 0.01 + Math.cos(a) * d, y: 0.2 + Math.sin(a) * d * 0.6,
        size: 5 + rand() * 7, opacity: 0.3 + rand() * 0.4,
        phase: rand() * Math.PI * 2, petalCount: 5,
        appearAt: 0.65 + rand() * 0.1
      })
    }

    // Stars — always visible
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: rand(), y: rand() * 0.65,
        size: 0.3 + rand() * 1.8,
        brightness: 0.2 + rand() * 0.6,
        twinkleSpeed: 0.3 + rand() * 2,
        twinkleOffset: rand() * Math.PI * 2
      })
    }

    return { branches, blossoms, stars }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animId = 0, w = 0, h = 0, time = 0
    const fallingPetals: FallingPetal[] = []

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      w = window.innerWidth; h = window.innerHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const spawnPetal = () => {
      const visibleBlossoms = blossoms.filter(b => b.appearAt <= progressRef.current)
      if (!visibleBlossoms.length) return
      const s = visibleBlossoms[Math.floor(Math.random() * visibleBlossoms.length)]
      const c = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)]
      fallingPetals.push({
        x: s.x + (Math.random() - 0.5) * 0.03,
        y: s.y + (Math.random() - 0.5) * 0.02,
        size: 2 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.0005,
        vy: 0.0003 + Math.random() * 0.0006,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleAmp: 0.0003 + Math.random() * 0.0006,
        wobbleFreq: 0.008 + Math.random() * 0.012,
        opacity: 0,
        fadeTimer: 0,
        maxLife: 350 + Math.random() * 250,
        color: c
      })
    }

    const drawSky = () => {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#070d1f')
      g.addColorStop(0.25, '#0c1633')
      g.addColorStop(0.5, '#111f45')
      g.addColorStop(0.75, '#182d58')
      g.addColorStop(1, '#1e3a6a')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)

      // Moon
      const mx = w * 0.82, my = h * 0.12
      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, w * 0.2)
      mg.addColorStop(0, 'rgba(200,220,255,0.1)')
      mg.addColorStop(0.3, 'rgba(147,197,253,0.04)')
      mg.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = mg; ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = 'rgba(220,230,255,0.15)'
      ctx.beginPath(); ctx.arc(mx, my, 22, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = 'rgba(230,240,255,0.07)'
      ctx.beginPath(); ctx.arc(mx, my, 32, 0, Math.PI * 2); ctx.fill()

      // Stars
      stars.forEach(s => {
        const t = 0.5 + 0.5 * Math.sin(time * 0.02 * s.twinkleSpeed + s.twinkleOffset)
        ctx.fillStyle = `rgba(200,220,255,${s.brightness * t})`
        ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.size, 0, Math.PI * 2); ctx.fill()
      })

      // Ground
      ctx.fillStyle = '#0a1225'
      ctx.beginPath()
      ctx.moveTo(0, h * 0.88)
      for (let x = 0; x <= w; x += 3) {
        ctx.lineTo(x, h * 0.88 + Math.sin(x * 0.003) * h * 0.025 + Math.sin(x * 0.007) * h * 0.012)
      }
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill()
    }

    const drawBranch = (b: Branch, sway: number) => {
      const ds = sway * (1 - b.depth * 0.25)
      const x1 = b.x1 * w + ds, y1 = b.y1 * h
      const x2 = b.x2 * w + ds * 0.7, y2 = b.y2 * h
      const r = 55 + b.depth * 12 + Math.floor(Math.sin(time * 0.005 + b.depth) * 3)
      ctx.strokeStyle = `rgb(${r},${35 + b.depth * 8},${22 + b.depth * 5})`
      ctx.lineWidth = Math.max(0.5, b.width * (w / 1200))
      ctx.lineCap = 'round'
      const midx = (x1 + x2) / 2 + Math.sin(b.depth * 2.5) * 3
      const midy = (y1 + y2) / 2 + Math.cos(b.depth * 1.8) * 3
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(midx, midy, x2, y2); ctx.stroke()

      // Bark texture on trunk
      if (b.depth === 0 && b.width > 10) {
        ctx.strokeStyle = 'rgba(40,25,15,0.25)'
        ctx.lineWidth = 0.5
        for (let i = 0; i < 3; i++) {
          const o = (i - 1) * b.width * (w / 1200) * 0.2
          ctx.beginPath(); ctx.moveTo(x1 + o, y1); ctx.quadraticCurveTo(midx + o, midy, x2 + o, y2); ctx.stroke()
        }
      }
    }

    const drawBlossom = (b: Blossom, sway: number) => {
      const bx = b.x * w + sway * (0.5 + b.phase * 0.15)
      const by = b.y * h
      const br = 1 + Math.sin(time * 0.012 + b.phase) * 0.06
      const sz = b.size * br
      ctx.save(); ctx.translate(bx, by); ctx.globalAlpha = b.opacity
      for (let i = 0; i < b.petalCount; i++) {
        ctx.save()
        ctx.rotate((i * Math.PI * 2) / b.petalCount + time * 0.0008 + b.phase * 0.5)
        const pg = ctx.createRadialGradient(0, -sz * 0.35, 0, 0, -sz * 0.35, sz * 0.5)
        pg.addColorStop(0, 'rgba(255,230,240,0.95)')
        pg.addColorStop(0.3, 'rgba(251,207,232,0.8)')
        pg.addColorStop(0.7, `rgba(${249 + Math.floor(b.phase * 3)},${160 + Math.floor(b.phase * 8)},212,0.6)`)
        pg.addColorStop(1, 'rgba(244,114,182,0.2)')
        ctx.fillStyle = pg
        ctx.beginPath()
        ctx.ellipse(0, -sz * 0.38, sz * 0.26, sz * 0.42, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      // Center
      const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, sz * 0.08)
      cg.addColorStop(0, 'rgba(253,224,71,0.55)')
      cg.addColorStop(0.5, 'rgba(251,191,36,0.25)')
      cg.addColorStop(1, 'rgba(245,158,11,0.02)')
      ctx.fillStyle = cg
      ctx.beginPath(); ctx.arc(0, 0, sz * 0.05, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    }

    const drawFallingPetal = (p: FallingPetal) => {
      ctx.save()
      ctx.translate(p.x * w, p.y * h)
      ctx.rotate(p.rot)
      ctx.globalAlpha = p.opacity
      ctx.shadowColor = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0.2)`
      ctx.shadowBlur = 8
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size)
      g.addColorStop(0, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${p.opacity})`)
      g.addColorStop(0.5, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${p.opacity * 0.7})`)
      g.addColorStop(1, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0)`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(0, -p.size)
      ctx.bezierCurveTo(p.size * 0.6, -p.size * 0.3, p.size * 0.5, p.size * 0.3, 0, p.size)
      ctx.bezierCurveTo(-p.size * 0.5, p.size * 0.3, -p.size * 0.6, -p.size * 0.3, 0, -p.size)
      ctx.fill()
      ctx.shadowBlur = 0
      // Highlight
      ctx.fillStyle = `rgba(255,255,255,${p.opacity * 0.15})`
      ctx.beginPath()
      ctx.ellipse(-p.size * 0.1, -p.size * 0.12, p.size * 0.1, p.size * 0.22, -0.3, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    const animate = () => {
      time++
      const progress = progressRef.current
      ctx.clearRect(0, 0, w, h)
      drawSky()

      const sway = Math.sin(time * 0.006) * 4 + Math.sin(time * 0.0025) * 2

      // Draw branches that have appeared
      branches
        .filter(b => b.growAt <= progress)
        .sort((a, b) => b.depth - a.depth)
        .forEach(b => drawBranch(b, sway))

      // Draw blossoms that have appeared
      blossoms
        .filter(b => b.appearAt <= progress)
        .forEach(b => drawBlossom(b, sway))

      // Falling petals — only when fully grown
      if (progress > 0.7 && time % 15 === 0 && fallingPetals.length < 40) {
        spawnPetal()
      }

      for (let i = fallingPetals.length - 1; i >= 0; i--) {
        const p = fallingPetals[i]
        p.fadeTimer++
        const lr = p.fadeTimer / p.maxLife
        if (p.fadeTimer < 25) p.opacity = (p.fadeTimer / 25) * 0.5
        else if (lr > 0.75) p.opacity = Math.max(0, 0.5 * (1 - (lr - 0.75) / 0.25))
        else p.opacity = 0.5
        const breeze = Math.sin(time * 0.003 + p.wobblePhase) * 0.2
        p.x += p.vx + Math.sin(time * p.wobbleFreq + p.wobblePhase) * p.wobbleAmp + breeze / w
        p.y += p.vy / h * 600
        p.vy += 0.0001
        p.rot += p.rotSpeed + Math.sin(time * 0.005 + p.wobblePhase) * 0.002

        if (p.y > 1.1 || p.x < -0.1 || p.x > 1.1 || p.opacity <= 0) {
          fallingPetals.splice(i, 1)
        } else {
          drawFallingPetal(p)
        }
      }

      // Vignette
      const v = ctx.createRadialGradient(w / 2, h * 0.45, w * 0.25, w / 2, h * 0.45, w * 0.75)
      v.addColorStop(0, 'rgba(0,0,0,0)')
      v.addColorStop(1, 'rgba(0,0,0,0.2)')
      ctx.fillStyle = v; ctx.fillRect(0, 0, w, h)

      animId = requestAnimationFrame(animate)
    }

    resize()
    animate()
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [branches, blossoms, stars])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  )
}
