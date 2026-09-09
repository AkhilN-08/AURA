import { useMemo } from 'react'
import { useMemoryCapsule } from '../../hooks/useMemoryCapsule'
import { useGameProgress } from '../../hooks/useGameProgress'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useTranslation } from '../../hooks/useTranslation'

/**
 * The Memory Garden — AURA's identity piece.
 *
 * Every memory in the Memory Capsule becomes something living:
 *   a person  → a tree
 *   a place   → a flowering bush
 *   an object → a lantern
 *   an event  → a bright blossom
 *   a routine → a stone path
 *
 * Game sessions water the garden: every few sessions a new sprout appears.
 * The more the person engages, the more the garden grows — a quiet
 * visual metaphor for a well-tended memory.
 */

interface Props {
  /** Called when the user taps a memory element */
  onSelectMemory?: (id: string, name: string) => void
  /** Renders the title inside the scene */
  compact?: boolean
}

const GARDEN_W = 1000
const GARDEN_H = 420

// Warm, paper-friendly palette
const INK = '#3f3a36'
const LEAF = '#7c9a6d'
const LEAF_DARK = '#5d7a51'
const STEM = '#6b8e5e'
const TERRACOTTA = '#c96f4a'
const ROSE = '#d98a9e'
const MARIGOLD = '#e2a24a'
const SKY_SOFT = '#bcd4c6'

function Flower({ x, y, scale, color, sway, delay }: { x: number; y: number; scale: number; color: string; sway: number; delay: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} className="garden-sway" style={{ animationDelay: `${delay}s`, transformOrigin: '0px 0px' }}>
      {/* stem */}
      <path d="M 0 0 C 2 -10 -2 -20 0 -32" fill="none" stroke={STEM} strokeWidth={2.6} strokeLinecap="round" />
      {/* leaves */}
      <path d="M 0 -12 C -8 -16 -11 -22 -10 -27 C -4 -24 -1 -18 0 -12 Z" fill={LEAF} />
      <path d="M 0 -20 C 8 -24 11 -30 10 -35 C 4 -32 1 -26 0 -20 Z" fill={LEAF_DARK} />
      {/* petals */}
      {[0, 60, 120, 180, 240, 300].map(deg => (
        <ellipse key={deg} cx={0} cy={-40} rx={4.6} ry={9.5} fill={color} opacity={0.92}
          transform={`rotate(${deg} 0 -40)`} />
      ))}
      <circle cx={0} cy={-40} r={4.4} fill="#f4d35e" />
    </g>
  )
}

function Tree({ x, scale, sway, delay }: { x: number; scale: number; sway: number; delay: number }) {
  return (
    <g transform={`translate(${x} 318) scale(${scale})`} className="garden-sway-slow" style={{ animationDelay: `${delay}s`, transformOrigin: '0px 0px' }}>
      {/* trunk */}
      <path d="M 0 0 C -3 -26 4 -52 1 -78 C 0 -92 -2 -104 0 -116" fill="none" stroke="#8a6f55" strokeWidth={9} strokeLinecap="round" />
      {/* branches */}
      <path d="M 1 -70 C 14 -84 26 -92 40 -98" fill="none" stroke="#8a6f55" strokeWidth={5} strokeLinecap="round" />
      <path d="M 0 -92 C -13 -104 -22 -112 -34 -118" fill="none" stroke="#8a6f55" strokeWidth={4.4} strokeLinecap="round" />
      <path d="M 1 -104 C 8 -116 14 -122 22 -128" fill="none" stroke="#8a6f55" strokeWidth={3.6} strokeLinecap="round" />
      {/* canopy — soft overlapping crowns */}
      <circle cx={44} cy={-104} r={30} fill={LEAF} opacity={0.9} />
      <circle cx={-36} cy={-124} r={27} fill={LEAF_DARK} opacity={0.85} />
      <circle cx={24} cy={-134} r={32} fill="#88a978" opacity={0.9} />
      <circle cx={-4} cy={-148} r={26} fill={LEAF} opacity={0.85} />
      <circle cx={8} cy={-118} r={28} fill={SKY_SOFT} opacity={0.35} />
      {/* a few blossoms in the canopy */}
      {[[36, -128], [-30, -136], [10, -158], [52, -96]].map(([bx, by], i) => (
        <circle key={i} cx={bx} cy={by} r={3.4} fill={ROSE} opacity={0.85} />
      ))}
    </g>
  )
}

function Lantern({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <line x1={0} y1={-34} x2={0} y2={-22} stroke={INK} strokeWidth={1.4} />
      <rect x={-11} y={-24} width={22} height={5} rx={2} fill={TERRACOTTA} />
      <ellipse cx={0} cy={-2} rx={13} ry={20} fill="#f3d9b1" stroke={TERRACOTTA} strokeWidth={1.6} />
      <path d="M -13 -2 L 13 -2" stroke={TERRACOTTA} strokeWidth={1} opacity={0.5} />
      <path d="M -11 -14 C -6 -10 6 -10 11 -14" fill="none" stroke={TERRACOTTA} strokeWidth={1} opacity={0.5} />
      <circle cx={0} cy={-2} r={3.4} fill="#e8b04b" />
      <rect x={-9} y={16} width={18} height={4.5} rx={2} fill={TERRACOTTA} />
    </g>
  )
}

function Bench({ x, scale }: { x: number; scale: number }) {
  return (
    <g transform={`translate(${x} 318) scale(${scale})`}>
      <rect x={-34} y={-30} width={68} height={7} rx={3} fill="#a3814f" />
      <rect x={-34} y={-52} width={68} height={7} rx={3} fill="#a3814f" />
      <rect x={-30} y={-64} width={60} height={6} rx={3} fill="#8a6f43" />
      <rect x={-28} y={-23} width={5} height={23} fill="#7a5f38" />
      <rect x={23} y={-23} width={5} height={23} fill="#7a5f38" />
      <rect x={-28} y={-45} width={5} height={22} fill="#7a5f38" />
      <rect x={23} y={-45} width={5} height={22} fill="#7a5f38" />
    </g>
  )
}

function Path() {
  return (
    <g>
      <path
        d="M 60 356 C 220 348 340 360 480 352 C 640 344 760 358 950 350"
        fill="none" stroke="#d9c7ae" strokeWidth={26} strokeLinecap="round" opacity={0.75}
      />
      <path
        d="M 60 356 C 220 348 340 360 480 352 C 640 344 760 358 950 350"
        fill="none" stroke="#cbb896" strokeWidth={26} strokeLinecap="round" opacity={0.25} strokeDasharray="2 26"
      />
    </g>
  )
}

function Sun() {
  return (
    <g>
      <circle cx={864} cy={84} r={44} fill="#f2d98c" opacity={0.55} />
      <circle cx={864} cy={84} r={30} fill="#f0cf74" opacity={0.75} />
    </g>
  )
}

function Cloud({ x, y, scale, opacity }: { x: number; y: number; scale: number; opacity: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <ellipse cx={0} cy={0} rx={44} ry={15} fill="#ffffff" />
      <ellipse cx={-24} cy={6} rx={30} ry={11} fill="#ffffff" />
      <ellipse cx={26} cy={7} rx={34} ry={12} fill="#ffffff" />
    </g>
  )
}

export default function MemoryGarden({ onSelectMemory, compact }: Props) {
  const capsule = useMemoryCapsule()
  const { sessions } = useGameProgress()
  const reducedMotion = useReducedMotion()
  const { t } = useTranslation()

  // Derive garden content from the capsule (enabled items only)
  const garden = useMemo(() => {
    const people = capsule.people.slice(0, 3)
    const places = capsule.places.slice(0, 4)
    const objects = capsule.objects.slice(0, 2)
    const events = capsule.events.slice(0, 3)

    // Trees from people
    const trees = people.map((p, i) => ({
      id: p.id, name: p.name,
      x: [150, 700, 430][i] ?? 430,
      scale: 0.85 + (i % 2) * 0.18,
      label: p.relationship || 'family',
    }))

    // Bushes from places (place → flowering bush)
    const bushes = places.map((pl, i) => ({
      id: pl.id, name: pl.name,
      x: [86, 250, 560, 830][i] ?? 560,
      w: 1 + (i % 2) * 0.25,
      label: pl.memory?.slice(0, 60) || pl.description?.slice(0, 60) || '',
    }))

    // Lanterns from objects
    const lanterns = objects.map((o, i) => ({
      id: o.id, name: o.name,
      x: [330, 640][i] ?? 640,
      y: [236, 216][i] ?? 216,
      scale: 0.95,
    }))

    // Bright blossoms from events
    const blossoms = events.map((ev, i) => ({
      id: ev.id, name: ev.name,
      x: [200, 470, 760][i] ?? 470,
      y: [300, 292, 306][i] ?? 292,
      color: [ROSE, MARIGOLD, '#b48ac2'][i % 3],
      scale: 0.9,
      label: ev.story?.slice(0, 70) || ev.dateLabel || '',
    }))

    // Wildflowers watered by play: every 3 sessions grows one more
    const flowerCount = Math.min(11, Math.floor(sessions.length / 3) + 3)
    const flowerXs = [120, 180, 300, 380, 470, 540, 610, 700, 780, 880, 930]
    const flowerColors = [ROSE, MARIGOLD, TERRACOTTA, '#a5b4fc', '#e8b4c8', '#f2c14e']
    const flowers = flowerXs.slice(0, flowerCount).map((x, i) => ({
      x, y: 348 + (i % 3) * 8,
      color: flowerColors[i % flowerColors.length],
      scale: 0.62 + ((i * 7) % 5) * 0.07,
      delay: (i * 0.7) % 5,
    }))

    return { trees, bushes, lanterns, blossoms, flowers }
  }, [capsule.people, capsule.places, capsule.objects, capsule.events, sessions.length])

  const hasCapsule = garden.trees.length + garden.bushes.length + garden.lanterns.length + garden.blossoms.length > 0

  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] border border-[#e4dccd] bg-gradient-to-b from-[#fdf6ea] via-[#f9efdd] to-[#f3e8d2] shadow-[0_10px_40px_-18px_rgba(120,90,50,0.25)]">
      <svg
        viewBox={`0 0 ${GARDEN_W} ${GARDEN_H}`}
        className="w-full h-auto block"
        role="img"
        aria-label={t('Your memory garden — each memory grows here')}
      >
        <Sun />
        <Cloud x={190} y={64} scale={1.1} opacity={0.8} />
        <Cloud x={520} y={44} scale={0.8} opacity={0.6} />
        <Cloud x={760} y={78} scale={1.25} opacity={0.7} />

        {/* distant hills */}
        <path d="M 0 320 C 140 268 300 292 460 306 C 640 322 820 282 1000 316 L 1000 420 L 0 420 Z" fill="#cfe0cd" opacity={0.55} />
        <path d="M 0 342 C 200 300 420 336 640 330 C 800 326 900 338 1000 334 L 1000 420 L 0 420 Z" fill="#bdd5bb" opacity={0.6} />

        {/* ground */}
        <rect x={0} y={352} width={1000} height={68} fill="#e7d9ba" />
        <path d="M 0 352 C 180 346 420 358 640 352 C 820 348 920 356 1000 352 L 1000 420 L 0 420 Z" fill="#e2d2af" />

        <Path />

        {/* Trees (people) */}
        {garden.trees.map((tr, i) => (
          <g
            key={tr.id}
            className="cursor-pointer"
            onClick={() => onSelectMemory?.(tr.id, tr.name)}
            role="button"
            aria-label={tr.name}
          >
            <title>{tr.name}</title>
            <Tree x={tr.x} scale={tr.scale} sway={i} delay={i * 1.3} />
          </g>
        ))}

        {/* Bench */}
        <Bench x={500} scale={1} />

        {/* Bushes (places) */}
        {garden.bushes.map((b, i) => (
          <g key={b.id} className="cursor-pointer" onClick={() => onSelectMemory?.(b.id, b.name)} role="button" aria-label={b.name}>
            <title>{b.name}</title>
            <g transform={`translate(${b.x} 352)`}>
              <ellipse cx={0} cy={-16} rx={30 * b.w} ry={20 * b.w} fill={LEAF} opacity={0.9} />
              <ellipse cx={-18 * b.w} cy={-8} rx={20 * b.w} ry={14 * b.w} fill={LEAF_DARK} opacity={0.85} />
              <ellipse cx={20 * b.w} cy={-10} rx={22 * b.w} ry={15 * b.w} fill="#88a978" opacity={0.9} />
              {[[ -14, -22], [6, -28], [22, -18], [-2, -14]].map(([fx, fy], j) => (
                <circle key={j} cx={fx * b.w} cy={fy} r={3.2} fill={i % 2 ? MARIGOLD : ROSE} />
              ))}
            </g>
          </g>
        ))}

        {/* Lanterns (objects) */}
        {garden.lanterns.map(l => (
          <g key={l.id} className="cursor-pointer" onClick={() => onSelectMemory?.(l.id, l.name)} role="button" aria-label={l.name}>
            <title>{l.name}</title>
            {/* soft post */}
            <line x1={l.x} y1={l.y + 36} x2={l.x} y2={352} stroke="#9a8a74" strokeWidth={3} />
            <Lantern x={l.x} y={l.y} scale={l.scale} />
          </g>
        ))}

        {/* Event blossoms */}
        {garden.blossoms.map((bl, i) => (
          <g key={bl.id} className="cursor-pointer" onClick={() => onSelectMemory?.(bl.id, bl.name)} role="button" aria-label={bl.name}>
            <title>{bl.name}</title>
            <Flower x={bl.x} y={bl.y} scale={bl.scale} color={bl.color} sway={i} delay={i * 0.9} />
          </g>
        ))}

        {/* Wildflowers — watered by play */}
        {garden.flowers.map((f, i) => (
          <Flower key={i} x={f.x} y={f.y} scale={f.scale} color={f.color} sway={i} delay={f.delay} />
        ))}

        {/* Photo-frame keepsake, gently floating */}
        {!hasCapsule && (
          <g transform="translate(430 180)">
            <rect x={-52} y={-64} width={104} height={128} rx={10} fill="#fffdf6" stroke={INK} strokeWidth={3} />
            <rect x={-38} y={-50} width={76} height={62} fill="#f3e2c8" />
            <circle cx={-14} cy={-30} r={10} fill="#e8c98f" />
            <path d="M -38 8 L -12 -18 L 8 4 L 24 -12 L 38 8 Z" fill="#d4b786" />
            <rect x={-24} y={26} width={48} height={6} rx={3} fill="#d8cbb4" />
            <rect x={-16} y={40} width={32} height={6} rx={3} fill="#e4d9c4" />
          </g>
        )}
      </svg>

      {/* Editorial caption strip */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-[#e4dccd] bg-[#fdf9f0]/80">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8a7d68]">
          {compact ? t('the more memory is revisited, the more the garden grows') : t('your memory garden')}
        </p>
        <p className="font-mono text-[11px] text-[#a0937e]">
          {t('{n} memories planted', { n: garden.trees.length + garden.bushes.length + garden.lanterns.length + garden.blossoms.length })}
          {' · '}
          {t('{n} sessions', { n: sessions.length })}
        </p>
      </div>
      {/* hidden sway style for reduced motion handled in CSS */}
      <span className="hidden">{reducedMotion}</span>
    </div>
  )
}
