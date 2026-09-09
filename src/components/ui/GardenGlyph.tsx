/**
 * GardenGlyph — AURA's section markers.
 *
 * Replaces numeric indices (01, 02…) with small hand-drawn garden marks:
 * a sprout, a flower, a leaf, the sun, a path, a branch. Each renders in
 * currentColor with round caps so it sits quietly beside serif headings,
 * the way a gardener pencils a small sketch into a journal margin.
 */

export type GlyphName = 'sprout' | 'flower' | 'leaf' | 'sun' | 'path' | 'branch'

export default function GardenGlyph({ name, size = 22, className = '' }: { name: GlyphName; size?: number; className?: string }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    className,
  }

  switch (name) {
    case 'sprout':
      return (
        <svg {...common}>
          <path d="M12 21 V 11" />
          <path d="M12 12 C 12 8 9 6 5 6 C 5 10 8 12 12 12 Z" />
          <path d="M12 12 C 12 9 14.5 7 18.5 7 C 18.5 10.5 15.8 12.4 12 12 Z" />
        </svg>
      )
    case 'flower':
      return (
        <svg {...common}>
          <path d="M12 21 V 13" />
          <path d="M12 15 C 10 15 8.6 14 8.6 12.4 C 10 12.2 11 13 12 15 Z" />
          {[0, 72, 144, 216, 288].map(deg => (
            <ellipse key={deg} cx="12" cy="6.6" rx="2.1" ry="3.6" transform={`rotate(${deg} 12 9.6)`} />
          ))}
          <circle cx="12" cy="9.6" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'leaf':
      return (
        <svg {...common}>
          <path d="M5 19 C 5 10 10 5 19 5 C 19 14 14 19 5 19 Z" />
          <path d="M6.5 17.5 C 9 13 12 10 16.5 7.5" />
        </svg>
      )
    case 'sun':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.6" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <line
              key={deg}
              x1="12" y1="4.4" x2="12" y2="6.6"
              transform={`rotate(${deg} 12 12)`}
            />
          ))}
        </svg>
      )
    case 'path':
      return (
        <svg {...common}>
          <path d="M6 21 C 10 16 6 12 10 8 C 12.5 5.4 15 4.4 18 3" strokeDasharray="0.5 3.4" strokeWidth={2.2} />
          <circle cx="6" cy="21" r="1" fill="currentColor" stroke="none" />
          <circle cx="18" cy="3" r="1" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'branch':
      return (
        <svg {...common}>
          <path d="M12 21 V 5" />
          <path d="M12 9 C 10 8 8 8.4 6 10.4" />
          <path d="M12 13 C 14 12 16 12.4 18 14.4" />
          <path d="M12 6.6 C 11 6 10 6.2 9 7" />
        </svg>
      )
  }
}
