import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ArrowDown, Sparkles as SparklesIcon } from 'lucide-react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export default function HeroContent() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subtextRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    const tl = gsap.timeline({ delay: 0.5 })

    tl.fromTo(headingRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )
    .fromTo(subtextRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.5'
    )
    .fromTo(ctaRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo(scrollRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 },
      '-=0.2'
    )
  }, [reducedMotion])

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="max-w-3xl mx-auto">
        <h1
          ref={headingRef}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-charcoal-800 leading-tight mb-6"
          style={{ opacity: reducedMotion ? 1 : 0 }}
        >
          Every Memory{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-forest-500 to-forest-400">
            Matters.
          </span>
        </h1>

        <p
          ref={subtextRef}
          className="text-lg md:text-xl lg:text-2xl text-charcoal-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ opacity: reducedMotion ? 1 : 0 }}
        >
          An AI-powered cognitive and memory companion designed to keep minds engaged and families connected.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center" style={{ opacity: reducedMotion ? 1 : 0 }}>
          <Link to="/games" className="btn-primary inline-flex items-center gap-2 justify-center">
            <SparklesIcon size={20} />
            Explore AURA-NER
          </Link>
          <a href="#how-it-works" className="btn-secondary inline-flex items-center gap-2 justify-center">
            How It Works
          </a>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        style={{ opacity: reducedMotion ? 1 : 0 }}
      >
        <ArrowDown className="text-charcoal-300" size={28} />
      </div>
    </div>
  )
}
