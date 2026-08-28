import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Mic, Bell, Calendar, MessageCircle, ArrowRight } from 'lucide-react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import BlurText from '../ui/BlurText'
import LiquidIcon from '../ui/LiquidIcon'

gsap.registerPlugin(ScrollTrigger)

export default function AssistantSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const demoRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(demoRef.current,
        { opacity: 0, x: -60, scale: 0.95 },
        {
          opacity: 1, x: 0, scale: 1, duration: 0.7, ease: 'power1.out',
          scrollTrigger: { trigger: demoRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
        }
      )

      const features = featuresRef.current?.querySelectorAll('.feature-item')
      if (features) {
        gsap.fromTo(features,
          { opacity: 0, x: 60, y: 20 },
          {
            opacity: 1, x: 0, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: featuresRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
          }
        )
      }

      if (ctaRef.current) {
        gsap.fromTo(ctaRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power1.out', scrollTrigger: { trigger: ctaRef.current, start: 'top 85%', toggleActions: 'play none none reverse' } }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section ref={sectionRef} className="py-28 md:py-40 px-4 relative overflow-hidden">
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-sage-100/20 rounded-full blur-3xl pointer-events-none -translate-x-1/4" />

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-20">
          <BlurText tag="h2" className="section-heading mb-6">
            A companion for everyday moments.
          </BlurText>
          <BlurText tag="p" className="section-subheading mx-auto" delay={0.3}>
            Voice-powered memory assistance that helps with daily routines, reminders, and meaningful prompts.
          </BlurText>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-14">
          {/* Conversation demo — liquid glass */}
          <div ref={demoRef} className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]" style={{ opacity: reducedMotion ? 1 : 0 }}>
            <div className="absolute inset-0 bg-gradient-to-br from-forest-50/30 via-transparent to-amber-50/20 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <LiquidIcon size="sm" color="forest">
                  <MessageCircle size={20} />
                </LiquidIcon>
                <h3 className="font-semibold text-charcoal-800">Voice Interaction</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl rounded-tr-sm p-4 ml-8 border border-white/60">
                  <p className="text-charcoal-700">"Remind me to call my daughter at 6 PM."</p>
                </div>
                <div className="bg-sage-50/80 backdrop-blur-sm rounded-2xl rounded-tl-sm p-4 mr-8 border border-sage-100/60">
                  <p className="text-sage-700">"Of course. I'll remind you at 6 PM to call your daughter."</p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl rounded-tr-sm p-4 ml-8 border border-white/60">
                  <p className="text-charcoal-700">"What did I have for breakfast?"</p>
                </div>
                <div className="bg-sage-50/80 backdrop-blur-sm rounded-2xl rounded-tl-sm p-4 mr-8 border border-sage-100/60">
                  <p className="text-sage-700">"You had rice and tea this morning. A lovely start to the day."</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features — liquid glass cards */}
          <div ref={featuresRef} className="space-y-4">
            {[
              { icon: Bell, title: 'Smart Reminders', desc: 'Medicine, appointments, meals, and phone calls — all remembered gently.', iconColor: 'amber' as const },
              { icon: Calendar, title: 'Daily Routine', desc: 'Morning greetings and activity suggestions based on the time of day.', iconColor: 'forest' as const },
              { icon: Mic, title: 'Voice-First', desc: 'Speak naturally. The assistant listens and responds with care.', iconColor: 'sage' as const },
            ].map((feature, i) => (
              <div key={i} className="feature-item relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(59,130,246,0.08)] hover:-translate-y-1.5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" style={{ opacity: reducedMotion ? 1 : 0 }}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 flex items-start gap-4">
                  <LiquidIcon size="md" color={feature.iconColor}>
                    <feature.icon size={22} />
                  </LiquidIcon>
                  <div>
                    <h3 className="font-semibold text-charcoal-800 mb-1">{feature.title}</h3>
                    <p className="text-charcoal-400 text-sm">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div ref={ctaRef} className="text-center" style={{ opacity: reducedMotion ? 1 : 0 }}>
          <Link to="/assistant" className="inline-flex items-center gap-2 bg-gradient-to-r from-sage-400 to-sage-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-[0_0_20px_rgba(236,72,153,0.25)] hover:shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:scale-105 transition-all duration-300 group">
            Try the Assistant
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
