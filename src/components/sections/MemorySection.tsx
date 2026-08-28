import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Heart, Brain, Users } from 'lucide-react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import BlurText from '../ui/BlurText'
import LiquidIcon from '../ui/LiquidIcon'

gsap.registerPlugin(ScrollTrigger)

const CARDS = [
  { icon: Heart, title: 'Meaningful Engagement', description: 'Activities designed around familiar foods, places, and experiences from daily life.', color: 'red', iconColor: 'red' as const },
  { icon: Brain, title: 'Gentle Cognitive Care', description: 'Soft, adaptive challenges that meet each person where they are — no pressure, just warmth.', color: 'forest', iconColor: 'forest' as const },
  { icon: Users, title: 'Family Connection', description: 'Caregivers stay informed through gentle insights, not clinical reports.', color: 'amber', iconColor: 'amber' as const },
]

export default function MemorySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsContainerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      const cards = cardsContainerRef.current?.querySelectorAll('.memory-card')
      if (cards) {
        gsap.fromTo(cards,
          { opacity: 0, y: 100, scale: 0.88, rotateX: 20 },
          {
            opacity: 1, y: 0, scale: 1, rotateX: 0,
            duration: 0.8, stagger: 0.15, ease: 'power1.out',
            scrollTrigger: {
              trigger: cardsContainerRef.current,
              start: 'top 80%',
              end: 'top 30%',
              toggleActions: 'play none none reverse',
            }
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section ref={sectionRef} className="py-28 md:py-40 px-4 relative overflow-hidden" id="how-it-works">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-forest-200/30 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-20">
          <BlurText tag="h2" className="section-heading mb-6">
            Every memory has a story.
          </BlurText>
          <BlurText tag="p" className="section-subheading mx-auto" delay={0.3}>
            AURA-NER creates engaging memory activities around familiar experiences, helping keep minds active
            through meaningful interaction with cherished moments.
          </BlurText>
        </div>

        <div ref={cardsContainerRef} className="grid md:grid-cols-3 gap-8">
          {CARDS.map((item, i) => (
            <div
              key={i}
              className="memory-card group"
              style={{ opacity: reducedMotion ? 1 : 0, perspective: '1000px' }}
            >
              <div className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_50px_rgba(59,130,246,0.1)] hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] h-full">
                {/* Glare */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-3xl" />
                <div className="relative z-10 text-center">
                  <div className="mx-auto mb-6">
                    <LiquidIcon size="lg" color={item.iconColor}>
                      <item.icon size={28} />
                    </LiquidIcon>
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal-800 mb-3 group-hover:text-sage-600 transition-colors duration-300">{item.title}</h3>
                  <p className="text-charcoal-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
