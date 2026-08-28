import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BarChart3, Activity, Bell, ArrowRight } from 'lucide-react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import BlurText from '../ui/BlurText'
import LiquidIcon from '../ui/LiquidIcon'

gsap.registerPlugin(ScrollTrigger)

export default function CaregiverSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const dashboardRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(dashboardRef.current,
        { opacity: 0, y: 80, scale: 0.94 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power1.out',
          scrollTrigger: { trigger: dashboardRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
        }
      )

      const stats = dashboardRef.current?.querySelectorAll('.stat-value')
      if (stats) {
        stats.forEach((stat) => {
          gsap.fromTo(stat,
            { opacity: 0, y: 25, scale: 0.8 },
            {
              opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power1.out',
              scrollTrigger: { trigger: dashboardRef.current, start: 'top 75%', toggleActions: 'play none none reverse' }
            }
          )
        })
      }

      const featureCards = cardsRef.current?.querySelectorAll('.caregiver-card')
      if (featureCards) {
        gsap.fromTo(featureCards,
          { opacity: 0, y: 70, scale: 0.9 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power1.out',
            scrollTrigger: { trigger: cardsRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
          }
        )
      }

      if (ctaRef.current) {
        gsap.fromTo(ctaRef.current,
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1, duration: 0.6, ease: 'power1.out', scrollTrigger: { trigger: ctaRef.current, start: 'top 85%', toggleActions: 'play none none reverse' } }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section ref={sectionRef} className="py-28 md:py-40 px-4 relative">
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-sage-100/15 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-20">
          <BlurText tag="h2" className="section-heading mb-6">
            Connected to the people who care.
          </BlurText>
          <BlurText tag="p" className="section-subheading mx-auto" delay={0.3}>
            A gentle dashboard for caregivers and family members to stay connected
            with their loved one's cognitive engagement.
          </BlurText>
        </div>

        {/* Dashboard preview — liquid glass */}
        <div ref={dashboardRef} className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] mb-14" style={{ opacity: reducedMotion ? 1 : 0 }}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-forest-50/20 pointer-events-none" />
          <div className="relative z-10">
            <div className="caregiver-card grid sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-sage-50/70 backdrop-blur-sm rounded-2xl p-6 text-center border border-sage-100/50">
                <p className="stat-value text-3xl font-bold text-sage-600">5</p>
                <p className="text-sm text-charcoal-400 mt-1">Activities This Week</p>
              </div>
              <div className="bg-amber-50/70 backdrop-blur-sm rounded-2xl p-6 text-center border border-amber-100/50">
                <p className="stat-value text-3xl font-bold text-amber-600">86%</p>
                <p className="text-sm text-charcoal-400 mt-1">Average Accuracy</p>
              </div>
              <div className="bg-sage-50/70 backdrop-blur-sm rounded-2xl p-6 text-center border border-sage-100/50">
                <p className="stat-value text-3xl font-bold text-sage-600">↑ 12%</p>
                <p className="text-sm text-charcoal-400 mt-1">Improvement</p>
              </div>
            </div>

            <div className="caregiver-card bg-cream-50/70 backdrop-blur-sm rounded-2xl p-6 border border-cream-200/50">
              <div className="flex items-start gap-3">
                <LiquidIcon size="sm" color="forest">
                  <Activity size={16} />
                </LiquidIcon>
                <div>
                  <p className="text-charcoal-700 font-medium">Recent AI Insight</p>
                  <p className="text-charcoal-400 text-sm mt-1">
                    "Engagement has remained consistent this week. Memory-match performance improved
                    compared with last week."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature cards — liquid glass */}
        <div ref={cardsRef} className="grid sm:grid-cols-3 gap-6 mb-14">
          {[
            { icon: BarChart3, title: 'Activity Trends', desc: 'Weekly performance overview at a glance.', iconColor: 'forest' as const },
            { icon: Activity, title: 'Game Performance', desc: 'How each game session went — scores, accuracy, and progress.', iconColor: 'sage' as const },
            { icon: Bell, title: 'Reminder Status', desc: 'See which reminders were acknowledged and completed.', iconColor: 'amber' as const },
          ].map((item, i) => (
            <div key={i} className="caregiver-card group relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 p-8 text-center shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_50px_rgba(59,130,246,0.1)] hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" style={{ opacity: reducedMotion ? 1 : 0 }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="relative z-10">
                <div className="mx-auto mb-5">
                  <LiquidIcon size="md" color={item.iconColor}>
                    <item.icon size={24} />
                  </LiquidIcon>
                </div>
                <h3 className="font-semibold text-charcoal-800 mb-2 group-hover:text-sage-600 transition-colors">{item.title}</h3>
                <p className="text-charcoal-400 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div ref={ctaRef} className="text-center" style={{ opacity: reducedMotion ? 1 : 0 }}>
          <Link to="/caregiver" className="inline-flex items-center gap-2 bg-gradient-to-r from-sage-400 to-sage-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-[0_0_20px_rgba(236,72,153,0.25)] hover:shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:scale-105 transition-all duration-300 group">
            View Dashboard
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
