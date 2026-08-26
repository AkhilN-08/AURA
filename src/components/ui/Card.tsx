import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  variant?: 'default' | 'glass' | 'hover'
  className?: string
  onClick?: () => void
}

export default function Card({ children, variant = 'default', className = '', onClick }: CardProps) {
  const variants = {
    default: 'bg-white rounded-3xl p-8 shadow-soft border border-cream-200',
    glass: 'bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-soft border border-white/40',
    hover: 'bg-white rounded-3xl p-8 shadow-soft border border-cream-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300',
  }

  return (
    <div
      className={`${variants[variant]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
