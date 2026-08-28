const fs = require('fs');
const content = fs.readFileSync('src/components/hero/HeroScene.tsx', 'utf8');

// Check if it already has the new content
if (content.includes('Cherry Blossom Hero')) {
  console.log('Already updated');
  process.exit(0);
}

// Just overwrite the entire file
const newContent = `import { useEffect, useRef } from 'react'

/* ------------------------------------------------------------------ */
/*  Cherry Blossom Hero — full-screen 2D canvas                        */
/*  Realistic tree with falling petals, replaces 3D scene              */
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
  petalCount: number
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
  color: number[]
}

interface Star {
  x: number; y: number
  size: number
  brightness: number
  twinkleSpeed: number
  twinkleOffset: number
}

const PETAL_COLORS = [
  [249, 168, 212],
  [251, 207, 232],
  [253, 164, 175],
  [252, 231, 243],
  [244, 114, 182],
  [251, 191, 236],
  [255, 228, 230],
  [248, 180, 210],
]

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export default function HeroScene() {
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
      const rand = seededRandom(77)
      const baseX = w * 0.48
      const baseY = h * 1.05
      const trunkTop = h * 0.25
      const trunkSegments = 10

      for (let i = 0; i < trunkSegments; i++) {
        const t1 = i / trunkSegments
        const t2 = (i + 1) / trunkSegments
        const curve = Math.sin(t1 * Math.PI * 0.7) * w * 0.04
        const curve2 = Math.sin(t2 * Math.PI * 0.7) * w * 0.04
        const x1 = baseX + curve + (rand() - 0.5) * 3
        const y1 = baseY + (trunkTop - baseY) * t1
        const x2 = baseX + curve2 + (rand() - 0.5) * 3
        const y2 = baseY + (trunkTop - baseY) * t2
        branches.push({ x1, y1, x2, y2, width: Math.max(4, 18 - i * 1.5), depth: 0 })
      }

      const branchConfigs = [
        { angle: -0.6, length: 0.35, spread: 0.15 },
        { angle: -1.2, length: 0.30, spread: 0.12 },
        { angle: -1.8, length: 0.25, spread: 0.10 },
        { angle: -2.4, length: 0.28, spread: 0.13 },
        { angle: -0.3, length: 0.32, spread: 0.14 },
      ]

      branchConfigs.forEach((cfg, bi) => {
        const startT = 0.3 + (bi / branchConfigs.length) * 0.5
        const parentIdx = Math.floor(startT * (branches.length - 1))
        const parent = branches[Math.min(parentIdx, branches.length - 1)]
        const startX = parent.x2
        const startY = parent.y2
        const mainAngle = cfg.angle + (rand() - 0.5) * 0.3
        const mainLength = w * cfg.length
        const segs = 4 + Math.floor(rand() * 2)
        let px = startX, py = startY

        for (let j = 0; j < segs; j++) {
          const angle = mainAngle + (rand() - 0.5) * cfg.spread
          const segLen = mainLength / segs
          const nx = px + Math.cos(angle) * segLen + (rand() - 0.5) * 5
          const ny = py + Math.sin(angle) * segLen + (rand() - 0.5) * 5
          branches.push({ x1: px, y1: py, x2: nx, y2: ny, width: Math.max(1, 8 - j * 1.5 - bi * 0.5), depth: 1 })

          if (j > 0 && rand() > 0.3) {
            const subAngle = angle + (rand() > 0.5 ? 1 : -1) * (0.4 + rand() * 0.6)
            const subLen = segLen * (0.5 + rand() * 0.5)
            const sx = px + Math.cos(subAngle) * subLen
            const sy = py + Math.sin(subAngle) * subLen
            branches.push({ x1: px, y1: py, x2: sx, y2: sy, width: Math.max(0.5, 4 - j), depth: 2 })

            for (let k = 0; k < 2 + Math.floor(rand() * 4); k++) {
              blossoms.push({ x: sx + (rand() - 0.5) * 25, y: sy + (rand() - 0.5) * 20, size: 5 + rand() * 7, opacity: 0.5 + rand() * 0.5, phase: rand() * Math.PI * 2, petalCount: rand() > 0.3 ? 5 : 6 })
            }

            if (rand() > 0.4) {
              const twigAngle = subAngle + (rand() - 0.5) * 0.8
              const twigLen = subLen * 0.6
              const tx = sx + Math.cos(twigAngle) * twigLen
              const ty = sy + Math.sin(twigAngle) * twigLen
              branches.push({ x1: sx, y1: sy, x2: tx, y2: ty, width: Math.max(0.3, 2 - j * 0.3), depth: 3 })
              for (let k = 0; k < 1 + Math.floor(rand() * 3); k++) {
                blossoms.push({ x: tx + (rand() - 0.5) * 18, y: ty + (rand() - 0.5) * 14, size: 4 + rand() * 5, opacity: 0.4 + rand() * 0.5, phase: rand() * Math.PI * 2, petalCount: 5 })
              }
            }
          }
          px = nx
          py = ny
        }

        for (let k = 0; k < 3 + Math.floor(rand() * 5); k++) {
          blossoms.push({ x: px + (rand() - 0.5) * 30, y: py + (rand() - 0.5) * 25, size: 5 + rand() * 8, opacity: 0.5 + rand() * 0.5, phase: rand() * Math.PI * 2, petalCount: rand() > 0.3 ? 5 : 6 })
        }
      })

      for (let i = 0; i < 30; i++) {
        const angle = rand() * Math.PI * 2
        const dist = rand() * w * 0.2
        blossoms.push({ x: baseX + w * 0.04 + Math.cos(angle) * dist, y: h * 0.2 + Math.sin(angle) * dist * 0.6, size: 4 + rand() * 6, opacity: 0.3 + rand() * 0.4, phase: rand() * Math.PI * 2, petalCount: 5 })
      }

      for (let i = 0; i < 120; i++) {
        stars.push({ x: rand() * w, y: rand() * h * 0.7, size: 0.3 + rand() * 1.8, brightness: 0.2 + rand() * 0.6, twinkleSpeed: 0.3 + rand() * 2, twinkleOffset: rand() * Math.PI * 2 })
      }
    }

    const spawnPetal = () => {
      if (blossoms.length === 0) return
      const source = blossoms[Math.floor(Math.random() * blossoms.length)]
      const color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)]
      fallingPetals.push({ x: source.x + (Math.random() - 0.5) * 12, y: source.y + (Math.random() - 0.5) * 10, size: 3 + Math.random() * 5, rot: Math.random() * Math.PI * 2, vx: (Math.random() - 0.5) * 0.3, vy: 0.15 + Math.random() * 0.35, rotSpeed: (Math.random() - 0.5) * 0.02, wobblePhase: Math.random() * Math.PI * 2, wobbleAmp: 0.3 + Math.random() * 0.7, wobbleFreq: 0.008 + Math.random() * 0.012, opacity: 0, fadeTimer: 0, maxLife: 300 + Math.random() * 250, color })
    }

    const drawSky = () => {
      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, '#070d1f')
      grad.addColorStop(0.25, '#0c1633')
      grad.addColorStop(0.5, '#111f45')
      grad.addColorStop(0.75, '#182d58')
      grad.addColorStop(1, '#1e3a6a')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      const moonX = w * 0.8
      const moonY = h * 0.15
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, w * 0.25)
      moonGlow.addColorStop(0, 'rgba(200,220,255,0.08)')
      moonGlow.addColorStop(0.3, 'rgba(147,197,253,0.04)')
      moonGlow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = moonGlow
      ctx.fillRect(0, 0, w, h)

      ctx.fillStyle = 'rgba(220,230,255,0.12)'
      ctx.beginPath()
      ctx.arc(moonX, moonY, 25, 0, Math.PI * 2)
      ctx.
