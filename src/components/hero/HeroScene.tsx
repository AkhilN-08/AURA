import { useEffect, useRef } from 'react'

interface Branch { x1: number; y1: number; x2: number; y2: number; width: number; depth: number }
interface Blossom { x: number; y: number; size: number; opacity: number; phase: number; petalCount: number }
interface FallingPetal { x: number; y: number; size: number; rot: number; vx: number; vy: number; rotSpeed: number; wobblePhase: number; wobbleAmp: number; wobbleFreq: number; opacity: number; fadeTimer: number; maxLife: number; color: number[] }
interface Star { x: number; y: number; size: number; brightness: number; twinkleSpeed: number; twinkleOffset: number }
const PETAL_COLORS = [[249,168,212],[251,207,232],[253,164,175],[252,231,243],[244,114,182],[251,191,236],[255,228,230],[248,180,210]]
function seededRandom(seed: number) { let s = seed; return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646 } }
export default function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animId = 0, w = 0, h = 0, time = 0
    let branches: Branch[] = [], blossoms: Blossom[] = [], fallingPetals: FallingPetal[] = [], stars: Star[] = []
    const resize = () => {
      const dpr = window.devicePixelRatio || 1; w = window.innerWidth; h = window.innerHeight
      canvas.width = w * dpr; canvas.height = h * dpr
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); generateTree()
    }
    const generateTree = () => {
      branches = []; blossoms = []; stars = []
      const rand = seededRandom(77)
      const baseX = w * 0.48, baseY = h * 1.05, trunkTop = h * 0.25
      for (let i = 0; i < 10; i++) {
        const t1 = i / 10, t2 = (i + 1) / 10
        const c1 = Math.sin(t1 * Math.PI * 0.7) * w * 0.04, c2 = Math.sin(t2 * Math.PI * 0.7) * w * 0.04
        branches.push({ x1: baseX + c1 + (rand() - 0.5) * 3, y1: baseY + (trunkTop - baseY) * t1, x2: baseX + c2 + (rand() - 0.5) * 3, y2: baseY + (trunkTop - baseY) * t2, width: Math.max(4, 18 - i * 1.5), depth: 0 })
      }
      const cfgs = [{ a: -0.6, l: 0.35, s: 0.15 }, { a: -1.2, l: 0.30, s: 0.12 }, { a: -1.8, l: 0.25, s: 0.10 }, { a: -2.4, l: 0.28, s: 0.13 }, { a: -0.3, l: 0.32, s: 0.14 }]
      cfgs.forEach((cfg, bi) => {
        const parent = branches[Math.min(Math.floor((0.3 + bi / 5 * 0.5) * (branches.length - 1)), branches.length - 1)]
        const ma = cfg.a + (rand() - 0.5) * 0.3, ml = w * cfg.l
        let px = parent.x2, py = parent.y2
        const segs = 4 + Math.floor(rand() * 2)
        for (let j = 0; j < segs; j++) {
          const ang = ma + (rand() - 0.5) * cfg.s, sl = ml / segs
          const nx = px + Math.cos(ang) * sl + (rand() - 0.5) * 5, ny = py + Math.sin(ang) * sl + (rand() - 0.5) * 5
          branches.push({ x1: px, y1: py, x2: nx, y2: ny, width: Math.max(1, 8 - j * 1.5 - bi * 0.5), depth: 1 })
          if (j > 0 && rand() > 0.3) {
            const sa = ang + (rand() > 0.5 ? 1 : -1) * (0.4 + rand() * 0.6), sl2 = sl * (0.5 + rand() * 0.5)
            const sx = px + Math.cos(sa) * sl2, sy = py + Math.sin(sa) * sl2
            branches.push({ x1: px, y1: py, x2: sx, y2: sy, width: Math.max(0.5, 4 - j), depth: 2 })
            for (let k = 0; k < 2 + Math.floor(rand() * 4); k++) blossoms.push({ x: sx + (rand() - 0.5) * 25, y: sy + (rand() - 0.5) * 20, size: 6.5 + rand() * 8, opacity: 0.5 + rand() * 0.5, phase: rand() * Math.PI * 2, petalCount: rand() > 0.3 ? 5 : 6 })
            if (rand() > 0.4) {
              const ta = sa + (rand() - 0.5) * 0.8, tl = sl2 * 0.6
              const tx = sx + Math.cos(ta) * tl, ty = sy + Math.sin(ta) * tl
              branches.push({ x1: sx, y1: sy, x2: tx, y2: ty, width: Math.max(0.3, 2 - j * 0.3), depth: 3 })
              for (let k = 0; k < 1 + Math.floor(rand() * 3); k++) blossoms.push({ x: tx + (rand() - 0.5) * 18, y: ty + (rand() - 0.5) * 14, size: 5.5 + rand() * 6, opacity: 0.4 + rand() * 0.5, phase: rand() * Math.PI * 2, petalCount: 5 })
            }
          }
          px = nx; py = ny
        }
        for (let k = 0; k < 3 + Math.floor(rand() * 5); k++) blossoms.push({ x: px + (rand() - 0.5) * 30, y: py + (rand() - 0.5) * 25, size: 6.5 + rand() * 9, opacity: 0.5 + rand() * 0.5, phase: rand() * Math.PI * 2, petalCount: rand() > 0.3 ? 5 : 6 })
      })
      for (let i = 0; i < 15; i++) { const a = rand() * Math.PI * 2, d = rand() * w * 0.2; blossoms.push({ x: baseX + w * 0.04 + Math.cos(a) * d, y: h * 0.2 + Math.sin(a) * d * 0.6, size: 5.5 + rand() * 7, opacity: 0.3 + rand() * 0.4, phase: rand() * Math.PI * 2, petalCount: 5 }) }
      for (let i = 0; i < 60; i++) stars.push({ x: rand() * w, y: rand() * h * 0.7, size: 0.3 + rand() * 1.8, brightness: 0.2 + rand() * 0.6, twinkleSpeed: 0.3 + rand() * 2, twinkleOffset: rand() * Math.PI * 2 })
    }
    const spawnPetal = () => {
      if (!blossoms.length) return
      const s = blossoms[Math.floor(Math.random() * blossoms.length)], c = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)]
      fallingPetals.push({ x: s.x + (Math.random() - 0.5) * 12, y: s.y + (Math.random() - 0.5) * 10, size: 3 + Math.random() * 5, rot: Math.random() * Math.PI * 2, vx: (Math.random() - 0.5) * 0.3, vy: 0.15 + Math.random() * 0.35, rotSpeed: (Math.random() - 0.5) * 0.02, wobblePhase: Math.random() * Math.PI * 2, wobbleAmp: 0.3 + Math.random() * 0.7, wobbleFreq: 0.008 + Math.random() * 0.012, opacity: 0, fadeTimer: 0, maxLife: 300 + Math.random() * 250, color: c })
    }
    const drawSky = () => {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#070d1f'); g.addColorStop(0.25, '#0c1633'); g.addColorStop(0.5, '#111f45'); g.addColorStop(0.75, '#182d58'); g.addColorStop(1, '#1e3a6a')
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      const mx = w * 0.8, my = h * 0.15
      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, w * 0.25)
      mg.addColorStop(0, 'rgba(200,220,255,0.08)'); mg.addColorStop(0.3, 'rgba(147,197,253,0.04)'); mg.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = mg; ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = 'rgba(220,230,255,0.12)'; ctx.beginPath(); ctx.arc(mx, my, 25, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = 'rgba(230,240,255,0.06)'; ctx.beginPath(); ctx.arc(mx, my, 35, 0, Math.PI * 2); ctx.fill()
      stars.forEach(s => { const t = 0.5 + 0.5 * Math.sin(time * 0.02 * s.twinkleSpeed + s.twinkleOffset); ctx.fillStyle = 'rgba(200,220,255,' + (s.brightness * t) + ')'; ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill() })
      ctx.fillStyle = '#0a1225'; ctx.beginPath(); ctx.moveTo(0, h * 0.85)
      for (let x = 0; x <= w; x += 3) ctx.lineTo(x, h * 0.85 + Math.sin(x * 0.003) * h * 0.03 + Math.sin(x * 0.007) * h * 0.015)
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill()
    }
    const drawBranch = (b: Branch, sway: number) => {
      const ds = sway * (1 - b.depth * 0.25), x1 = b.x1 + ds, x2 = b.x2 + ds * 0.7
      const r = 55 + b.depth * 12 + Math.floor(Math.sin(time * 0.005 + b.depth) * 3)
      ctx.strokeStyle = 'rgb(' + r + ',' + (35 + b.depth * 8) + ',' + (22 + b.depth * 5) + ')'
      ctx.lineWidth = Math.max(0.5, b.width); ctx.lineCap = "round"
      const midx = (x1 + b.x2) / 2 + Math.sin(b.depth * 2.5) * 3, midy = (b.y1 + b.y2) / 2 + Math.cos(b.depth * 1.8) * 3
      ctx.beginPath(); ctx.moveTo(x1, b.y1); ctx.quadraticCurveTo(midx, midy, x2, b.y2); ctx.stroke()
      if (b.depth === 0 && b.width > 8) { ctx.strokeStyle = 'rgba(40,25,15,0.3)'; ctx.lineWidth = 0.5; for (let i = 0; i < 3; i++) { const o = (i - 1) * b.width * 0.2; ctx.beginPath(); ctx.moveTo(x1 + o, b.y1); ctx.quadraticCurveTo(midx + o, midy, x2 + o, b.y2); ctx.stroke() } }
    }
    const drawBlossom = (b: Blossom, sway: number) => {
      const bx = b.x + sway * (0.5 + b.phase * 0.15), br = 1 + Math.sin(time * 0.012 + b.phase) * 0.06, sz = b.size * br
      ctx.save(); ctx.translate(bx, b.y); ctx.globalAlpha = b.opacity
      for (let i = 0; i < b.petalCount; i++) {
        ctx.save(); ctx.rotate((i * Math.PI * 2) / b.petalCount + time * 0.0008 + b.phase * 0.5)
        const pg = ctx.createRadialGradient(0, -sz * 0.35, 0, 0, -sz * 0.35, sz * 0.5)
        pg.addColorStop(0, 'rgba(255,230,240,0.95)'); pg.addColorStop(0.3, 'rgba(251,207,232,0.8)')
        pg.addColorStop(0.7, 'rgba(' + (249 + Math.floor(b.phase * 3)) + ',' + (160 + Math.floor(b.phase * 8)) + ',212,0.6)')
        pg.addColorStop(1, 'rgba(244,114,182,0.2)')
        ctx.fillStyle = pg; ctx.beginPath(); ctx.ellipse(0, -sz * 0.38, sz * 0.26, sz * 0.42, 0, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      }
      const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, sz * 0.08)
      cg.addColorStop(0, 'rgba(253,224,71,0.55)'); cg.addColorStop(0.5, 'rgba(251,191,36,0.25)'); cg.addColorStop(1, 'rgba(245,158,11,0.02)')
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, 0, sz * 0.05, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    }
    const drawFallingPetal = (p: FallingPetal) => {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = p.opacity
      ctx.shadowColor = 'rgba(' + p.color[0] + ',' + p.color[1] + ',' + p.color[2] + ',0.2)'; ctx.shadowBlur = 10
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size)
      g.addColorStop(0, 'rgba(' + p.color[0] + ',' + p.color[1] + ',' + p.color[2] + ',' + p.opacity + ')')
      g.addColorStop(0.5, 'rgba(' + p.color[0] + ',' + p.color[1] + ',' + p.color[2] + ',' + (p.opacity * 0.7) + ')')
      g.addColorStop(1, 'rgba(' + p.color[0] + ',' + p.color[1] + ',' + p.color[2] + ',0)')
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -p.size); ctx.bezierCurveTo(p.size * 0.6, -p.size * 0.3, p.size * 0.5, p.size * 0.3, 0, p.size); ctx.bezierCurveTo(-p.size * 0.5, p.size * 0.3, -p.size * 0.6, -p.size * 0.3, 0, -p.size); ctx.fill()
      ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,' + (p.opacity * 0.15) + ')'; ctx.beginPath(); ctx.ellipse(-p.size * 0.1, -p.size * 0.12, p.size * 0.1, p.size * 0.22, -0.3, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    }
    const animate = () => {
      time++; ctx.clearRect(0, 0, w, h); drawSky()
      const sway = Math.sin(time * 0.006) * 4 + Math.sin(time * 0.0025) * 2
      branches.sort((a, b) => b.depth - a.depth).forEach(b => drawBranch(b, sway))
      blossoms.forEach(b => drawBlossom(b, sway))
      if (time % 12 === 0 && fallingPetals.length < 50) { spawnPetal();  }
      fallingPetals = fallingPetals.filter(p => {
        p.fadeTimer++; const lr = p.fadeTimer / p.maxLife
        if (p.fadeTimer < 25) p.opacity = (p.fadeTimer / 25) * 0.55; else if (lr > 0.75) p.opacity = Math.max(0, 0.55 * (1 - (lr - 0.75) / 0.25)); else p.opacity = 0.55
        const breeze = Math.sin(time * 0.003 + p.wobblePhase) * 0.25
        p.x += p.vx + Math.sin(time * p.wobbleFreq + p.wobblePhase) * p.wobbleAmp + breeze; p.y += p.vy; p.vy += 0.0008; p.rot += p.rotSpeed + Math.sin(time * 0.005 + p.wobblePhase) * 0.002
        if (p.y > h + 50 || p.x < -60 || p.x > w + 60 || p.opacity <= 0) return false; drawFallingPetal(p); return true
      })
      const v = ctx.createRadialGradient(w / 2, h * 0.45, w * 0.25, w / 2, h * 0.45, w * 0.75)
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.25)'); ctx.fillStyle = v; ctx.fillRect(0, 0, w, h)
      animId = requestAnimationFrame(animate)
    }
    resize(); animate(); window.addEventListener("resize", resize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize) }
  }, [])
  return (<canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />)
}
