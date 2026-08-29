import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ArrowDown, Sparkles as SparklesIcon, Brain, Mic, Gamepad2, Heart } from 'lucide-react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useTranslation } from '../../hooks/useTranslation'

const FEATURES = [
  { icon: Gamepad2, label: '7 Cognitive Games', color: 'from-pink-400/20 to-purple-400/20', iconColor: '#EC4899', x: '5%', y: '22%', delay: 0.8 },
  { icon: Brain, label: 'AI Personalization', color: 'from-blue-400/20 to-cyan-400/20', iconColor: '#3B82F6', x: '68%', y: '18%', delay: 1.0 },
  { icon: Mic, label: 'Voice Assistant', color: 'from-green-400/20 to-emerald-400/20', iconColor: '#22C55E', x: '70%', y: '62%', delay: 1.2 },
  { icon: Heart, label: 'Family Connection', color: 'from-amber-400/20 to-orange-400/20', iconColor: '#F59E0B', x: '3%', y: '68%', delay: 1.4 },
]

interface Ripple {
  id: number
  x: number
  y: number
}

export default function HeroContent() {
  const { t } = useTranslation()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subtextRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const [ripples, setRipples] = useState<Ripple[]>([])
  const rippleIdRef = useRef(0)

  // Click ripple effect
  const handleClick = useCallback((e: React.MouseEvent) => {
    const id = rippleIdRef.current++
    setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 1000)
  }, [])

  useEffect(() => {
    if (reducedMotion) return
    const tl = gsap.timeline({ delay: 0.3 })
    tl.fromTo(headingRef.current,
      { opacity: 0, y: 30, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' }
    )
    .fromTo(subtextRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.4'
    )
    .fromTo(ctaRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.3'
    )
    .fromTo(scrollRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4 },
      '-=0.2'
    )

    // Animate floating feature cards
    FEATURES.forEach((f, i) => {
      const el = document.querySelector(`[data-feature="${i}"]`)
      if (el) {
        gsap.fromTo(el,
          { opacity: 0, scale: 0.8, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: f.delay }
        )
        // Gentle floating animation
        gsap.to(el, {
          y: `+=${8 + Math.random() * 6}`,
          duration: 2.5 + Math.random() * 1.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: f.delay + 0.5,
        })
      }
    })
  }, [reducedMotion])

  return (
    <div
      className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center pt-16"
      onClick={handleClick}
    >
      {/* Click ripples */}
      {ripples.map(r => (
        <div
          key={r.id}
          className="fixed pointer-events-none z-50"
          style={{ left: r.x, top: r.y, transform: 'translate(-50%, -50%)' }}
        >
          <div className="w-20 h-20 rounded-full border border-pink-400/40 animate-ping" />
        </div>
      ))}

      {/* Floating feature cards */}
      {!reducedMotion && FEATURES.map((f, i) => (
        <div
          key={i}
          data-feature={i}
          className={`absolute hidden md:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-br ${f.color} backdrop-blur-xl border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.1)] cursor-default hover:scale-110 hover:border-white/40 transition-transform duration-300`}
          style={{ left: f.x, top: f.y, opacity: 0 }}
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <f.icon size={16} style={{ color: f.iconColor }} />
          </div>
          <span className="text-white/90 text-sm font-medium whitespace-nowrap">{f.label}</span>
        </div>
      ))}

      <div className="max-w-3xl mx-auto">
        <h1
          ref={headingRef}
          className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6"
          style={{ opacity: reducedMotion ? 1 : 0 }}
        >
          <span className="liquid-text block text-4xl md:text-6xl lg:text-7xl">AURA-NER</span>
        </h1>

        <p
          ref={subtextRef}
          className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-4 leading-relaxed"
          style={{ opacity: reducedMotion ? 1 : 0 }}
        >
          {t('AI-powered cognitive gaming and memory assistance for elderly people in the North Eastern Region.')}
        </p>

        <p className="text-sm md:text-base text-white/50 max-w-xl mx-auto mb-10 leading-relaxed" style={{ opacity: reducedMotion ? 1 : 0 }}>
          AURA-NER combines AI-driven personalization with culturally familiar activities to keep minds active — through games, voice assistance, and gentle caregiver insights.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center" style={{ opacity: reducedMotion ? 1 : 0 }}>
          <Link to="/games" className="inline-flex items-center gap-2 justify-center bg-white/15 backdrop-blur-md border border-white/25 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-[0_4px_20px_rgba(59,130,246,0.2),inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-white/25 hover:shadow-[0_8px_30px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] hover:-translate-y-0.5 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]">
            <SparklesIcon size={20} />
            {t('Explore AURA-NER')}
          </Link>
          <Link to="/assessment" className="inline-flex items-center gap-2 justify-center bg-white/8 backdrop-blur-md border border-white/15 text-white/80 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/15 hover:text-white hover:-translate-y-0.5 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]">
            {t('Start Assessment')}
          </Link>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        style={{ opacity: reducedMotion ? 1 : 0 }}
      >
        <ArrowDown className="text-white/50" size={28} />
      </div>
    </div>
  )
}
