import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TrendingUp, Zap, Target } from 'lucide-react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import BlurText from '../ui/BlurText'
import LiquidIcon from '../ui/LiquidIcon'

gsap.registerPlugin(ScrollTrigger)

const LEVELS = [
  { icon: Target, label: 'Easy', description: 'Gentle pace, fewer items', accuracy: '60–70%', width: '60%', color: 'bg-sage-400', iconColor: 'sage' as const },
  { icon: TrendingUp, label: 'Moderate', description: 'Balanced challenge', accuracy: '70–85%', width: '75%', color: 'bg-forest-400', iconColor: 'forest' as const },
  { icon: Zap, label: 'Personalized', description: 'Adapted to individual pace', accuracy: '75–85%', width: '80%', color: 'bg-forest-500', iconColor: 'forest' as const },
  { icon: Zap, label: 'Adaptive', description: 'Real-time difficulty shifts', accuracy: '85%+', width: '95%', color: 'bg-amber-500', iconColor: 'amber' as const },
]

export default function AISection() {
  const sectionRef = useRef<HTMLElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const metricsRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(leftRef.current,
        { opacity: 0, x: -80, filter: 'blur(8px)' },
        {
          opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power1.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', toggleActions: 'play none none reverse' }
        }
      )

      const metrics = metricsRef.current?.querySelectorAll('.ai-metric')
      if (metrics) {
        gsap.fromTo(metrics,
          { opacity: 0, x: 80, scale: 0.92 },
          {
            opacity: 1, x: 0, scale: 1,
            duration: 0.6, stagger: 0.12, ease: 'power1.out',
            scrollTrigger: { trigger: metricsRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
          }
        )

        metrics.forEach((metric, i) => {
          const bar = metric.querySelector('.progress-bar') as HTMLElement
          if (bar) {
            gsap.fromTo(bar, { width: '0%' }, {
              width: LEVELS[i].width, duration: 1, delay: 0.3 + i * 0.15, ease: 'power1.out',
              scrollTrigger: { trigger: metricsRef.current, start: 'top 75%', toggleActions: 'play none none reverse' }
            })
          }
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section ref={sectionRef} className="py-28 md:py-40 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div ref={leftRef} style={{ opacity: reducedMotion ? 1 : 0 }}>
            <BlurText tag="h2" className="section-heading mb-6">
              Designed around each person.
            </BlurText>
            <BlurText tag="p" className="section-subheading mb-8" delay={0.3}>
              AURA-NER's AI-assisted personalization adapts game difficulty based on individual performance,
              ensuring activities remain engaging without becoming overwhelming.
            </BlurText>
            <p className="text-charcoal-400 text-sm italic">
              This is AI-assisted personalization, not clinical assessment.
            </p>
          </div>

          <div ref={metricsRef} className="space-y-4">
            {LEVELS.map((level, i) => (
              <div key={i} className="ai-metric relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.08)] transition-all duration-500" style={{ opacity: reducedMotion ? 1 : 0 }}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 flex items-center gap-4">
                  <LiquidIcon size="md" color={level.iconColor}>
                    <level.icon size={22} />
                  </LiquidIcon>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-charcoal-800">{level.label}</span>
                      <span className="text-sm text-charcoal-400">{level.accuracy} accuracy</span>
                    </div>
                    <div className="w-full bg-cream-200/80 rounded-full h-2 overflow-hidden">
                      <div className={`progress-bar h-2 rounded-full ${level.color}`} style={{ width: reducedMotion ? level.width : '0%' }} />
                    </div>
                    <p className="text-xs text-charcoal-400 mt-1.5">{level.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
