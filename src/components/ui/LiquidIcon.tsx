import { type ReactNode } from 'react'

interface LiquidIconProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export default function LiquidIcon({ children, className = '', size = 'md', color = 'forest' }: LiquidIconProps) {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-18 h-18',
  }

  const colorMap: Record<string, string> = {
    forest: 'from-forest-400/40 to-forest-600/20 shadow-[0_0_20px_rgba(74,124,74,0.15)]',
    sage: 'from-sage-400/40 to-sage-600/20 shadow-[0_0_20px_rgba(107,138,100,0.15)]',
    amber: 'from-amber-300/40 to-amber-500/20 shadow-[0_0_20px_rgba(240,165,0,0.15)]',
    red: 'from-red-300/40 to-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.12)]',
    white: 'from-white/60 to-white/30 shadow-[0_0_20px_rgba(255,255,255,0.2)]',
  }

  return (
    <div
      className={`
        relative rounded-2xl flex items-center justify-center
        bg-gradient-to-br ${colorMap[color] || colorMap.forest}
        backdrop-blur-xl border border-white/30
        transition-all duration-500
        hover:scale-110 hover:rotate-3
        hover:shadow-[0_0_30px_rgba(74,124,74,0.25)]
        group
        ${sizes[size]}
        ${className}
      `}
    >
      {/* Inner shimmer */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      {/* Content */}
      <div className="relative z-10 text-forest-700">{children}</div>
    </div>
  )
}
