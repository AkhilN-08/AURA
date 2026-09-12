/**
 * StoryScene — a small illustrated 2D vignette for each Memory Story page.
 *
 * Each story page gets a calm, storybook-style SVG scene that matches the
 * sentence being read (morning garden, a companion arriving, watering the
 * roses, tea with a bird, a remembered event). If the memory in the capsule
 * carries a real photo, the photo is shown instead of the illustration.
 *
 * Motion is CSS-only (transform/opacity), GPU-friendly, and fully disabled
 * under prefers-reduced-motion.
 */

export type StorySceneKey = 'morning' | 'companion' | 'watering' | 'tea' | 'event'

interface StorySceneProps {
  scene: StorySceneKey
  emoji: string
  photoData?: string
}

function EmojiChip({ emoji }: { emoji: string }) {
  return (
    <span className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white/90 border border-amber-200 flex items-center justify-center text-lg shadow-sm" aria-hidden>
      {emoji}
    </span>
  )
}

/** Morning at the garden — rising sun, hills, swaying flowers. */
function MorningScene() {
  return (
    <svg viewBox="0 0 400 180" className="w-full h-44 block" role="presentation">
      <defs>
        <linearGradient id="ssMorningSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF7E6" />
          <stop offset="100%" stopColor="#FFEBD9" />
        </linearGradient>
      </defs>
      <rect width="400" height="180" fill="url(#ssMorningSky)" />
      <g className="story-scene-breathe">
        <circle cx="318" cy="52" r="20" fill="#F1D98A" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
          <line
            key={a}
            x1={318 + 26 * Math.cos((a * Math.PI) / 180)}
            y1={52 + 26 * Math.sin((a * Math.PI) / 180)}
            x2={318 + 33 * Math.cos((a * Math.PI) / 180)}
            y2={52 + 33 * Math.sin((a * Math.PI) / 180)}
            stroke="#F1D98A"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ))}
      </g>
      <ellipse cx="110" cy="200" rx="260" ry="62" fill="#B8D99A" opacity="0.5" />
      <ellipse cx="330" cy="212" rx="240" ry="66" fill="#8FAE7E" opacity="0.45" />
      <path d="M60 180 Q 150 150 200 132" fill="none" stroke="#E9DFC8" strokeWidth="10" strokeLinecap="round" />
      <path d="M60 180 Q 150 150 200 132" fill="none" stroke="#FFFDF8" strokeWidth="2" strokeDasharray="1 10" strokeLinecap="round" opacity="0.8" />
      {[
        { x: 96, y: 122, c: '#F2B6C6', cls: 'story-scene-sway' },
        { x: 168, y: 112, c: '#F3C6A5', cls: 'story-scene-sway-late' },
        { x: 238, y: 126, c: '#F1D98A', cls: 'story-scene-sway' },
      ].map((f, i) => (
        <g key={i} className={f.cls}>
          <path d={`M${f.x} 160 Q ${f.x - 3} ${f.y + 18} ${f.x} ${f.y + 9}`} fill="none" stroke="#5D7A51" strokeWidth="3" strokeLinecap="round" />
          <circle cx={f.x} cy={f.y} r="9" fill={f.c} />
          <circle cx={f.x} cy={f.y} r="3.5" fill="#FFFDF8" />
        </g>
      ))}
    </svg>
  )
}

/** A companion joins — one figure waiting, one arriving. */
function CompanionScene() {
  return (
    <svg viewBox="0 0 400 180" className="w-full h-44 block" role="presentation">
      <rect width="400" height="180" fill="#FFF7E6" />
      <ellipse cx="200" cy="205" rx="280" ry="62" fill="#B8D99A" opacity="0.5" />
      <g opacity="0.9">
        <rect x="58" y="96" width="10" height="52" rx="4" fill="#9C7B54" />
        <circle cx="63" cy="84" r="26" fill="#8FAE7E" />
        <circle cx="48" cy="96" r="16" fill="#B8D99A" />
        <circle cx="80" cy="96" r="16" fill="#B8D99A" />
      </g>
      <g>
        <circle cx="180" cy="92" r="13" fill="#F3C6A5" />
        <rect x="168" y="108" width="24" height="40" rx="10" fill="#AFCBEF" />
      </g>
      <g className="story-scene-arrive">
        <circle cx="252" cy="90" r="13" fill="#F3C6A5" />
        <rect x="240" y="106" width="24" height="42" rx="10" fill="#B8D99A" />
      </g>
      <ellipse cx="182" cy="152" rx="20" ry="4" fill="#8FAE7E" opacity="0.5" />
      <ellipse cx="252" cy="152" rx="20" ry="4" fill="#8FAE7E" opacity="0.5" />
    </svg>
  )
}

/** Watering the roses — tilted can, falling droplets, rose bush. */
function WateringScene() {
  return (
    <svg viewBox="0 0 400 180" className="w-full h-44 block" role="presentation">
      <rect width="400" height="180" fill="#FFF7E6" />
      <ellipse cx="200" cy="205" rx="280" ry="60" fill="#B8D99A" opacity="0.5" />
      <circle cx="130" cy="142" r="24" fill="#8FAE7E" />
      <circle cx="162" cy="134" r="28" fill="#7C9A6D" />
      <circle cx="194" cy="144" r="22" fill="#8FAE7E" />
      <circle cx="130" cy="124" r="7" fill="#F2B6C6" />
      <circle cx="164" cy="116" r="7" fill="#F2B6C6" />
      <circle cx="194" cy="126" r="6.5" fill="#F3C6A5" />
      <circle className="story-scene-drop" cx="216" cy="136" r="2.6" fill="#4A6A92" />
      <circle className="story-scene-drop-late" cx="224" cy="132" r="2.2" fill="#4A6A92" />
      <circle className="story-scene-drop-late2" cx="210" cy="130" r="2.2" fill="#4A6A92" />
      <g>
        <rect x="252" y="104" width="52" height="38" rx="9" fill="#AFCBEF" />
        <path d="M252 118 Q 226 122 218 136 L 226 140 Q 236 128 254 126 Z" fill="#AFCBEF" />
        <circle cx="222" cy="138" r="4.5" fill="#AFCBEF" />
        <path d="M304 112 Q 318 122 304 134" fill="none" stroke="#AFCBEF" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="278" cy="104" rx="18" ry="4" fill="#8FB2DC" />
      </g>
    </svg>
  )
}

/** Tea and birds — steaming cup, bird bobbing on a branch. */
function TeaScene() {
  return (
    <svg viewBox="0 0 400 180" className="w-full h-44 block" role="presentation">
      <rect width="400" height="180" fill="#FFF7E6" />
      <ellipse cx="200" cy="210" rx="280" ry="58" fill="#B8D99A" opacity="0.35" />
      <path d="M300 88 Q 330 84 362 92" fill="none" stroke="#9C7B54" strokeWidth="4" strokeLinecap="round" />
      <g className="story-scene-bird">
        <circle cx="322" cy="74" r="10" fill="#F2B6C6" />
        <path d="M330 72 L 340 74 L 330 78 Z" fill="#E2899F" />
        <circle cx="318" cy="71" r="1.6" fill="#7A4A55" />
        <path d="M316 74 Q 322 66 328 73" fill="none" stroke="#E2899F" strokeWidth="3" strokeLinecap="round" />
      </g>
      <rect x="36" y="148" width="328" height="9" rx="4" fill="#B06A35" opacity="0.75" />
      <path className="story-scene-steam" d="M182 118 Q 178 108 182 100 Q 186 92 182 84" fill="none" stroke="#C9B28F" strokeWidth="3" strokeLinecap="round" />
      <path className="story-scene-steam-late" d="M204 118 Q 208 108 204 100 Q 200 92 204 84" fill="none" stroke="#C9B28F" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="196" cy="142" rx="40" ry="6" fill="#E9DFC8" />
      <path d="M164 118 L 172 140 L 220 140 L 228 118 Z" fill="#FFFDF8" stroke="#B06A35" strokeWidth="2.5" strokeLinejoin="round" />
      <ellipse cx="196" cy="118" rx="32" ry="5" fill="#F3C6A5" />
      <path d="M228 122 Q 244 126 228 136" fill="none" stroke="#B06A35" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

/** A remembered event — a photo frame hanging from a string. */
function EventScene({ emoji }: { emoji: string }) {
  return (
    <svg viewBox="0 0 400 180" className="w-full h-44 block" role="presentation">
      <rect width="400" height="180" fill="#FFF7E6" />
      <path d="M52 26 Q 200 58 348 26" fill="none" stroke="#B06A35" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <g className="story-scene-breathe">
        <rect x="146" y="56" width="108" height="92" rx="8" fill="#FFFDF8" stroke="#D6B28A" strokeWidth="3" />
        <rect x="160" y="68" width="80" height="60" rx="4" fill="#F6E3D3" />
        <text x="200" y="110" textAnchor="middle" fontSize="32">{emoji}</text>
        <circle cx="200" cy="52" r="3" fill="#B06A35" />
        <circle cx="158" cy="38" r="2.5" fill="#B06A35" opacity="0.6" />
        <circle cx="244" cy="40" r="2.5" fill="#B06A35" opacity="0.6" />
      </g>
    </svg>
  )
}

export default function StoryScene({ scene, emoji, photoData }: StorySceneProps) {
  if (photoData) {
    return (
      <div className="relative rounded-2xl overflow-hidden border-2 border-amber-100 shadow-sm mb-6">
        <img src={photoData} alt="" className="w-full h-44 object-cover" />
        <EmojiChip emoji={emoji} />
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-amber-100 bg-[#FFFDF8] mb-6" aria-hidden>
      {scene === 'morning' && <MorningScene />}
      {scene === 'companion' && <CompanionScene />}
      {scene === 'watering' && <WateringScene />}
      {scene === 'tea' && <TeaScene />}
      {scene === 'event' && <EventScene emoji={emoji} />}
      {scene !== 'event' && <EmojiChip emoji={emoji} />}
    </div>
  )
}
