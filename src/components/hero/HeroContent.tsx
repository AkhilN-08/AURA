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
          className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6"
          style={{ opacity: reducedMotion ? 1 : 0 }}
        >
          <span className="relative inline-block">
            {/* Liquid glass container */}
            <span className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl px-6 py-3 md:px-8 md:py-4 inline-block shadow-[0_8px_32px_rgba(59,130,246,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] overflow-hidden">
              <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Every Memory</span>
              {/* Shimmer highlight */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[liquidShimmer_3s_ease-in-out_infinite] pointer-events-none" />
            </span>
          </span>
          <br />
          <span className="relative inline-block mt-2">
            {/* Liquid glass container for Matters */}
            <span className="relative z-10 bg-gradient-to-r from-pink-500/20 via-purple-500/15 to-blue-500/20 backdrop-blur-md border border-pink-300/30 rounded-3xl px-6 py-3 md:px-8 md:py-4 inline-block shadow-[0_8px_32px_rgba(236,72,153,0.15),inset_0_1px_0_rgba(255,255,255,0.25)]">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-200 via-white to-blue-200 drop-shadow-[0_0_20px_rgba(236,72,153,0.3)]">Matters.</span>
            </span>
          </span>
        </h1>

        <p
          ref={subtextRef}
          className="text-lg md:text-xl lg:text-2xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ opacity: reducedMotion ? 1 : 0 }}
        >
          An AI-powered cognitive and memory companion designed to keep minds engaged and families connected.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center" style={{ opacity: reducedMotion ? 1 : 0 }}>
          <Link to="/games" className="inline-flex items-center gap-2 justify-center bg-white/15 backdrop-blur-md border border-white/25 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-[0_4px_20px_rgba(59,130,246,0.2),inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-white/25 hover:shadow-[0_8px_30px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] hover:-translate-y-0.5 transition-all duration-300">
            <SparklesIcon size={20} />
            Explore AURA-NER
          </Link>
          <a href="#how-it-works" className="inline-flex items-center gap-2 justify-center bg-white/8 backdrop-blur-md border border-white/15 text-white/80 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/15 hover:text-white hover:-translate-y-0.5 transition-all duration-300">
            How It Works
          </a>
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
