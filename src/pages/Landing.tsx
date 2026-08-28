import { Suspense, lazy, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HeroContent from '../components/hero/HeroContent'
import MemorySection from '../components/sections/MemorySection'
import GamesSection from '../components/sections/GamesSection'
import AISection from '../components/sections/AISection'
import AssistantSection from '../components/sections/AssistantSection'
import CaregiverSection from '../components/sections/CaregiverSection'
import ScrollProgress from '../components/ui/ScrollProgress'
import GlowOrbs from '../components/ui/GlowOrbs'
import BlurText from '../components/ui/BlurText'
import { Flower2, Heart, Github } from 'lucide-react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useTranslation } from '../hooks/useTranslation'

gsap.registerPlugin(ScrollTrigger)

const HeroScene = lazy(() => import('../components/hero/HeroScene'))
const Antigravity = lazy(() => import('../components/ui/Antigravity'))

function HeroFallback() {
  return <div className="absolute inset-0 bg-gradient-to-b from-forest-50 via-cream-50 to-cream-100" />
}

export default function Landing() {
  const { t } = useTranslation()
  const heroRef = useRef<HTMLElement>(null)
  const heroContentRef = useRef<HTMLDivElement>(null)
  const nerRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    const ctx = gsap.context(() => {
      // Hero content parallax
      if (heroContentRef.current) {
        gsap.to(heroContentRef.current, {
          y: -80,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
          },
        })
      }

      // NER section reveal
      if (nerRef.current) {
        const emojis = nerRef.current.querySelectorAll('.ner-emoji')
        gsap.fromTo(emojis,
          { opacity: 0, y: 30, scale: 0.8 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 1, stagger: 0.12, ease: 'power2.out',
            scrollTrigger: {
              trigger: nerRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            }
          }
        )
      }
    })

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <div className="overflow-x-hidden">
      <ScrollProgress />

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen">
        {/* Antigravity particle ring — non-interactive background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Suspense fallback={null}>
            <Antigravity
              count={80}
              magnetRadius={8}
              ringRadius={9}
              waveSpeed={0.35}
              waveAmplitude={0.8}
              particleSize={1.2}
              lerpSpeed={0.04}
              color="#93C5FD"
              autoAnimate={true}
              particleVariance={0.8}
              rotationSpeed={0.15}
              depthFactor={1}
              pulseSpeed={2}
              particleShape="sphere"
              fieldStrength={12}
            />
          </Suspense>
        </div>
        {/* 3D Memory Garden — non-interactive (uses window mousemove) */}
        <div className="absolute inset-0 z-[1] pointer-events-none">
          <Suspense fallback={<HeroFallback />}>
            <HeroScene />
          </Suspense>
        </div>
        <GlowOrbs />
        <div ref={heroContentRef} className="relative z-10">
          <HeroContent />
        </div>
      </section>

      {/* Scroll chapters */}
      <MemorySection />
      <GamesSection />
      <AISection />
      <AssistantSection />
      <CaregiverSection />

      {/* NER Cultural Relevance */}
      <section ref={nerRef} className="py-28 md:py-40 px-4 relative overflow-hidden">
        <GlowOrbs />
        <div className="max-w-4xl mx-auto text-center relative">
          <BlurText tag="h2" className="section-heading mb-6">
            Rooted in the North East.
          </BlurText>
          <BlurText tag="p" className="section-subheading mx-auto mb-14" delay={0.3}>
            AURA-NER is designed with the North Eastern Region in mind — incorporating locally familiar foods,
            landscapes, festivals, and household objects into cognitive activities.
          </BlurText>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {['🎋', '🪷', '🏔️', '🍵', '🥁', '🏮'].map((emoji, i) => (
              <div
                key={i}
                className="ner-emoji bg-white/60 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex items-center justify-center text-4xl hover:scale-110 hover:rotate-6 hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)] transition-all duration-500 cursor-default"
                style={{ opacity: reducedMotion ? 1 : 0 }}
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-charcoal-800" />
        <GlowOrbs />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-400/80 to-sage-600/80 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-[0_0_16px_rgba(236,72,153,0.2)]">
                  <Flower2 size={22} className="text-white" />
                </div>
                <span className="text-xl font-bold text-white">{t('AURA-NER')}</span>
              </div>
              <p className="text-charcoal-300 text-sm leading-relaxed">
                {t('AI-powered cognitive gaming and memory assistance for elderly people and their families.')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">{t('Platform')}</h4>
              <div className="space-y-2">
                <Link to="/" className="block text-charcoal-300 hover:text-white text-sm transition-colors">{t('Home')}</Link>
                <Link to="/games" className="block text-charcoal-300 hover:text-white text-sm transition-colors">{t('Cognitive Games')}</Link>
                <Link to="/assistant" className="block text-charcoal-300 hover:text-white text-sm transition-colors">{t('Memory Assistant')}</Link>
                <Link to="/caregiver" className="block text-charcoal-300 hover:text-white text-sm transition-colors">{t('Caregiver Dashboard')}</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">About</h4>
              <div className="space-y-2">
                <p className="text-charcoal-300 text-sm">Built for the North Eastern Region</p>
                <p className="text-charcoal-300 text-sm">Accessible cognitive support</p>
                <p className="text-charcoal-300 text-sm">AI-assisted personalization</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Disclaimer</h4>
              <p className="text-charcoal-300 text-sm leading-relaxed">
                AURA-NER is a support platform prototype. It is not a diagnostic tool, dementia severity detector,
                or replacement for medical professionals.
              </p>
            </div>
          </div>

          <div className="border-t border-charcoal-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-charcoal-400 text-sm flex items-center gap-1">
              {t('Made with')} <Heart size={14} className="text-sage-400" /> {t('for memory that matters')}
            </p>
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <span className="text-charcoal-400 text-sm">AURA-NER © 2024</span>
              <span className="text-charcoal-500 text-xs">·</span>
              <span className="text-sage-400 text-sm font-medium">{t('Developed by Team OriginX')}</span>
              <a href="https://github.com/AkhilN-08/AURA" target="_blank" rel="noopener noreferrer" className="text-charcoal-400 hover:text-white transition-colors">
                <Github size={18} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
