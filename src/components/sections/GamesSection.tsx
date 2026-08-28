import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Brain, Eye, Search, Lightbulb, ArrowRight } from 'lucide-react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import BlurText from '../ui/BlurText'
import LiquidIcon from '../ui/LiquidIcon'

gsap.registerPlugin(ScrollTrigger)

const GAMES = [
  { icon: Brain, title: 'Memory', description: 'Remember and match objects, strengthening recall through play.', iconColor: 'forest' as const },
  { icon: Eye, title: 'Focus', description: 'Identify important visual information, training attention.', iconColor: 'sage' as const },
  { icon: Search, title: 'Recognition', description: 'Recognize familiar people, places, and objects with confidence.', iconColor: 'amber' as const },
  { icon: Lightbulb, title: 'Recall', description: 'Remember information shown moments earlier, building cognitive resilience.', iconColor: 'forest' as const },
]

export default function GamesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll('.game-card')
      if (cards) {
        gsap.fromTo(cards,
          { opacity: 0, y: 100, scale: 0.85 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.7, stagger: 0.1, ease: 'power2.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            }
          }
        )

        cards.forEach((card, i) => {
          gsap.to(card, {
            y: -5,
            duration: 3 + i * 0.5,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: i * 0.7,
          })
        })
      }

      if (ctaRef.current) {
        gsap.fromTo(ctaRef.current,
          { opacity: 0, scale: 0.85 },
          {
            opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out',
            scrollTrigger: { trigger: ctaRef.current, start: 'top 85%', toggleActions: 'play none none none' }
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section ref={sectionRef} className="py-28 md:py-40 px-4 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-72 h-72 bg-forest-200/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-72 h-72 bg-amber-200/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-20">
          <BlurText tag="h2" className="section-heading mb-6">
            Keep the mind engaged.
          </BlurText>
          <BlurText tag="p" className="section-subheading mx-auto" delay={0.2}>
            Four types of cognitive activities, each designed to gently challenge different aspects
            of memory and attention.
          </BlurText>
        </div>

        <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {GAMES.map((game, i) => (
            <div key={i} className="game-card group" style={{ opacity: reducedMotion ? 1 : 0 }}>
              <div className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 p-6 text-center shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgba(59,130,246,0.1)] hover:-translate-y-2 transition-all duration-500 h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="relative z-10">
                  <div className="mx-auto mb-5">
                    <LiquidIcon size="md" color={game.iconColor}>
                      <game.icon size={24} />
                    </LiquidIcon>
                  </div>
                  <h3 className="text-lg font-semibold text-charcoal-800 mb-2 group-hover:text-forest-600 transition-colors">{game.title}</h3>
                  <p className="text-charcoal-400 text-sm leading-relaxed">{game.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div ref={ctaRef} className="text-center mt-14" style={{ opacity: reducedMotion ? 1 : 0 }}>
          <Link to="/games" className="inline-flex items-center gap-2 bg-gradient-to-r from-forest-500 to-forest-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-105 transition-all duration-300 group">
            Start Playing
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
