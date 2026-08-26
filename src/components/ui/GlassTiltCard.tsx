import { useRef, type ReactNode, type MouseEvent } from 'react'

interface GlassTiltCardProps {
  children: ReactNode
  className?: string
  intensity?: number
}

export default function GlassTiltCard({ children, className = '', intensity = 15 }: GlassTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent) => {
    const card = cardRef.current
    const glare = glareRef.current
    if (!card || !glare) return

    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    card.style.transform = `perspective(800px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale3d(1.02,1.02,1.02)`

    glare.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, transparent 70%)`
    glare.style.opacity = '1'
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    const glare = glareRef.current
    if (!card || !glare) return

    card.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)'
    card.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1)'
    glare.style.opacity = '0'
    setTimeout(() => { if (card) card.style.transition = '' }, 600)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-soft ${className}`}
    >
      {/* Glare overlay */}
      <div
        ref={glareRef}
        className="absolute inset-0 z-10 pointer-events-none opacity-0 transition-opacity duration-300 rounded-3xl"
      />
      <div className="relative z-0">{children}</div>
    </div>
  )
}
