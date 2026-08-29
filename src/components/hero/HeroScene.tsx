import { useEffect, useRef, useMemo, useCallback } from 'react'

interface Branch { x1: number; y1: number; x2: number; y2: number; width: number; depth: number }
interface Blossom { x: number; y: number; size: number; opacity: number; phase: number; petalCount: number; burst: boolean }
interface FallingPetal { x: number; y: number; size: number; rot: number; vx: number; vy: number; rotSpeed: number; wobblePhase: number; wobbleAmp: number; wobbleFreq: number; opacity: number; fadeTimer: number; maxLife: number; color: number[] }
interface BurstPetal { x: number; y: number; vx: number; vy: number; size: number; rot: number; rotSpeed: number; opacity: number; color: number[]; life: number }
interface Star { x: number; y: number; size: number; brightness: number; twinkleSpeed: number; twinkleOffset: number }

const PETAL_COLORS = [[249,168,212],[251,207,232],[253,164,175],[252,231,243],[244,114,182],[251,191,236],[255,228,230],[248,180,210]]

function seededRandom(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646 }
}

export default function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const burstPetalsRef = useRef<BurstPetal[]>([])

  const { branches, blossoms, stars } = useMemo(() => {
    const branches: Branch[] = []
    const blossoms: Blossom[] = []
    const stars: Star[] = []
    const rand = seededRandom(77)

    const baseX = 0.5, trunkTop = 0.28
    const trunkSegs = 12
    let trunkBranches: Branch[] = []
    for (let i = 0; i < trunkSegs; i++) {
      const t1 = i / trunkSegs, t2 = (i + 1) / trunkSegs
      const w1 = Math.sin(t1 * Math.PI * 0.7) * 0.02 + (rand() - 0.5) * 0.005
      const w2 = Math.sin(t2 * Math.PI * 0.7) * 0.02 + (rand() - 0.5) * 0.005
      trunkBranches.push({
        x1: baseX + w1, y1: 1.05 + (trunkTop - 1.05) * t1,
        x2: baseX + w2, y2: 1.05 + (trunkTop - 1.05) * t2,
        width: Math.max(3, 20 - i * 1.5), depth: 0
      })
    }
    branches.push(...trunkBranches)

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
      let px = parent.x2, py = parent.y2
      const segs = 4 + Math.floor(rand() * 2)

      for (let j = 0; j < segs; j++) {
        const ang = baseAngle + (rand() - 0.5) * cfg.spread
        const segLen = cfg.lengthRatio / segs
        const nx = px + Math.cos(ang) * segLen + (rand() - 0.5) * 0.012
        const ny = py + Math.sin(ang) * segLen + (rand() - 0.5) * 0.012
        branches.push({ x1: px, y1: py, x2: nx, y2: ny, width: Math.max(1, 9 - j * 1.5 - bi * 0.5), depth: 1 })

        if (j > 0 && rand() > 0.25) {
          const subAngle = ang + (rand() > 0.5 ? 1 : -1) * (0.4 + rand() * 0.6)
          const subLen = (cfg.lengthRatio / segs) * (0.5 + rand() * 0.5)
          const sx = px + Math.cos(subAngle) * subLen
          const sy = py + Math.sin(subAngle) * subLen
          branches.push({ x1: px, y1: py, x2: sx, y2: sy, width: Math.max(0.5, 5 - j), depth: 2 })

          for (let k = 0; k < 2 + Math.floor(rand() * 4); k++) {
            blossoms.push({
              x: sx + (rand() - 0.5) * 0.06, y: sy + (rand() - 0.5) * 0.05,
              size: 5.5 + rand() * 8, opacity: 0.5 + rand() * 0.5,
              phase: rand() * Math.PI * 2, petalCount: rand() > 0.3 ? 5 : 6, burst: false
            })
          }

          if (rand() > 0.4) {
            const twigAngle = subAngle + (rand() - 0.5) * 0.8
            const twigLen = subLen * 0.6
            const tx = sx + Math.cos(twigAngle) * twigLen
            const ty = sy + Math.sin(twigAngle) * twigLen
            branches.push({ x1: sx, y1: sy, x2: tx, y2: ty, width: Math.max(0.3, 2.5 - j * 0.3), depth: 3 })
            for (let k = 0; k < 1 + Math.floor(rand() * 3); k++) {
              blossoms.push({
                x: tx + (rand() - 0.5) * 0.04, y: ty + (rand() - 0.5) * 0.03,
                size: 4.5 + rand() * 6, opacity: 0.4 + rand() * 0.5,
                phase: rand() * Math.PI * 2, petalCount: 5, burst: false
              })
            }
          }
          px = nx; py = ny
        }
      }

      for (let k = 0; k < 3 + Math.floor(rand() * 5); k++) {
        blossoms.push({
          x: px + (rand() - 0.5) * 0.07, y: py + (rand() - 0.5) * 0.06,
          size: 6 + rand() * 9, opacity: 0.5 + rand() * 0.5,
          phase: rand() * Math.PI * 2, petalCount: rand() > 0.3 ? 5 : 6, burst: false
        })
      }
    })

    for (let i = 0; i < 15; i++) {
      const a = rand() * Math.PI * 2, d = rand() * 0.12
      blossoms.push({
        x: baseX + 0.01 + Math.cos(a) * d, y: 0.2 + Math.sin(a) * d * 0.6,
        size: 5 + rand() * 7, opacity: 0.3 + rand() * 0.4,
        phase: rand() * Math.PI * 2, petalCount: 5, burst: false
      })
    }

    for (let i = 0; i < 30; i++) {
      stars.push({
        x: rand(), y: rand() * 0.65,
        size: 0.3 + rand() * 1.8, brightness: 0.2 + rand() * 0.6,
        twinkleSpeed: 0.3 + rand() * 2, twinkleOffset: rand() * Math.PI * 2
      })
    }

    return { branches, blossoms, stars }
  }, [])

  // Handle mouse move for parallax
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
  }, [])

  // Handle click to burst blossoms
  const handleClick = useCallback((e: MouseEvent) => {
    const cx = e.clientX / window.innerWidth
    const cy = e.clientY / window.innerHeight
    const burstPetals = burstPetalsRef.current

    blossoms.forEach(b => {
      const dx = b.x - cx
      const dy = b.y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 0.06) {
        // Burst this blossom!
        b.burst = true
        const c = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)]
        for (let i = 0; i < 12; i++) {
          const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.5
          const speed = 0.002 + Math.random() * 0.004
          burstPetals.push({
            x: b.x, y: b.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.001,
            size: 2 + Math.random() * 3,
            rot: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.05,
            opacity: 0.8,
            color: c,
            life: 0,
          })
        }
        // Reset blossom after delay
        setTimeout(() => { b.burst = false }, 800)
      }
    })
  }, [blossoms])

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
      const s = blossoms[Math.floor(Math.random() * blossoms.length)]
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
        opacity: 0, fadeTimer: 0,
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

      // Moon with mouse-reactive glow
      const mx = w * 0.82, my = h * 0.12
      const mxr = mx + (mouseRef.current.x - 0.5) * 15
      const myr = my + (mouseRef.current.y - 0.5) * 10
      const mg = ctx.createRadialGradient(mxr, myr, 0, mxr, myr, w * 0.22)
      mg.addColorStop(0, 'rgba(200,220,255,0.12)')
      mg.addColorStop(0.3, 'rgba(147,197,253,0.05)')
      mg.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = mg; ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = 'rgba(220,230,255,0.18)'
      ctx.beginPath(); ctx.arc(mxr, myr, 22, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = 'rgba(230,240,255,0.08)'
      ctx.beginPath(); ctx.arc(mxr, myr, 32, 0, Math.PI * 2); ctx.fill()

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

    const drawBranch = (b: Branch, sway: number, mx: number) => {
      const mouseInfluence = (mx - 0.5) * 8 * (1 - b.depth * 0.2)
      const ds = sway * (1 - b.depth * 0.25) + mouseInfluence
      const x1 = b.x1 * w + ds, y1 = b.y1 * h
      const x2 = b.x2 * w + ds * 0.7, y2 = b.y2 * h
      const r = 55 + b.depth * 12 + Math.floor(Math.sin(time * 0.005 + b.depth) * 3)
      ctx.strokeStyle = `rgb(${r},${35 + b.depth * 8},${22 + b.depth * 5})`
      ctx.lineWidth = Math.max(0.5, b.width * (w / 1200))
      ctx.lineCap = 'round'
      const midx = (x1 + x2) / 2 + Math.sin(b.depth * 2.5) * 3
      const midy = (y1 + y2) / 2 + Math.cos(b.depth * 1.8) * 3
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(midx, midy, x2, y2); ctx.stroke()

      if (b.depth === 0 && b.width > 10) {
        ctx.strokeStyle = 'rgba(40,25,15,0.25)'
        ctx.lineWidth = 0.5
        for (let i = 0; i < 3; i++) {
          const o = (i - 1) * b.width * (w / 1200) * 0.2
          ctx.beginPath(); ctx.moveTo(x1 + o, y1); ctx.quadraticCurveTo(midx + o, midy, x2 + o, y2); ctx.stroke()
        }
      }
    }

    const drawBlossom = (b: Blossom, sway: number, mx: number) => {
      if (b.burst) return // skip burst blossoms
      const mouseInfluence = (mx - 0.5) * 5
      const bx = b.x * w + sway * (0.5 + b.phase * 0.15) + mouseInfluence
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
      ctx.fillStyle = `rgba(255,255,255,${p.opacity * 0.15})`
      ctx.beginPath()
      ctx.ellipse(-p.size * 0.1, -p.size * 0.12, p.size * 0.1, p.size * 0.22, -0.3, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    const drawBurstPetal = (p: BurstPetal) => {
      ctx.save()
      ctx.translate(p.x * w, p.y * h)
      ctx.rotate(p.rot)
      ctx.globalAlpha = p.opacity
      ctx.shadowColor = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0.4)`
      ctx.shadowBlur = 12
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size)
      g.addColorStop(0, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${p.opacity})`)
      g.addColorStop(1, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0)`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(0, -p.size)
      ctx.bezierCurveTo(p.size * 0.6, -p.size * 0.3, p.size * 0.5, p.size * 0.3, 0, p.size)
      ctx.bezierCurveTo(-p.size * 0.5, p.size * 0.3, -p.size * 0.6, -p.size * 0.3, 0, -p.size)
      ctx.fill()
      ctx.restore()
    }

    // Mouse glow
    const drawMouseGlow = (mx: number, my: number) => {
      const x = mx * w, y = my * h
      const g = ctx.createRadialGradient(x, y, 0, x, y, 120)
      g.addColorStop(0, 'rgba(236,72,153,0.08)')
      g.addColorStop(0.5, 'rgba(236,72,153,0.03)')
      g.addColorStop(1, 'rgba(236,72,153,0)')
      ctx.fillStyle = g
      ctx.beginPath(); ctx.arc(x, y, 120, 0, Math.PI * 2); ctx.fill()
    }

    const animate = () => {
      time++
      const mx = mouseRef.current.x, my = mouseRef.current.y
      ctx.clearRect(0, 0, w, h)
      drawSky()

      // Mouse glow follows cursor
      drawMouseGlow(mx, my)

      const sway = Math.sin(time * 0.003) * 2 + Math.sin(time * 0.0015) * 1

      // Branches (back to front)
      branches.sort((a, b) => b.depth - a.depth).forEach(b => drawBranch(b, sway, mx))
      blossoms.forEach(b => drawBlossom(b, sway, mx))

      // Falling petals
      if (time % 30 === 0 && fallingPetals.length < 15) spawnPetal()

      for (let i = fallingPetals.length - 1; i >= 0; i--) {
        const p = fallingPetals[i]
        p.fadeTimer++
        const lr = p.fadeTimer / p.maxLife
        if (p.fadeTimer < 25) p.opacity = (p.fadeTimer / 25) * 0.5
        else if (lr > 0.75) p.opacity = Math.max(0, 0.5 * (1 - (lr - 0.75) / 0.25))
        else p.opacity = 0.5
        const breeze = Math.sin(time * 0.003 + p.wobblePhase) * 0.2 + (mx - 0.5) * 0.3
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

      // Burst petals
      const bp = burstPetalsRef.current
      for (let i = bp.length - 1; i >= 0; i--) {
        const p = bp[i]
        p.life++
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.00008
        p.rot += p.rotSpeed
        p.opacity = Math.max(0, 0.8 * (1 - p.life / 60))
        if (p.life > 60 || p.opacity <= 0) {
          bp.splice(i, 1)
        } else {
          drawBurstPetal(p)
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
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
    }
  }, [branches, blossoms, stars, handleMouseMove, handleClick])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-pointer"
      aria-hidden="true"
    />
  )
}
