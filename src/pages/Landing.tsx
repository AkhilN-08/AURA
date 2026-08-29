import { Suspense, lazy, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HeroContent from '../components/hero/HeroContent'
import StatsBar from '../components/sections/StatsBar'
import ProductShowcase from '../components/sections/ProductShowcase'
import AdaptSection from '../components/sections/AdaptSection'
import NerStrip from '../components/sections/NerStrip'
import ScrollProgress from '../components/ui/ScrollProgress'
import GlowOrbs from '../components/ui/GlowOrbs'
import { Flower2, Heart, Github } from 'lucide-react'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useTranslation } from '../hooks/useTranslation'

gsap.registerPlugin(ScrollTrigger)

const HeroScene = lazy(() => import('../components/hero/HeroScene'))

function HeroFallback() {
  return <div className="absolute inset-0 bg-gradient-to-b from-[#070d1f] via-[#0c1633] to-[#111f45]" />
}

export default function Landing() {
  const { t } = useTranslation()
  const heroRef = useRef<HTMLElement>(null)
  const heroContentRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    const ctx = gsap.context(() => {
      // Hero content parallax — fade out as you scroll past
      if (heroContentRef.current) {
        gsap.to(heroContentRef.current, {
          y: -60,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.5,
          },
        })
      }
    })

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <div className="overflow-x-hidden relative">
      <ScrollProgress />

      {/* Fixed tree canvas — persists behind entire page */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Suspense fallback={<HeroFallback />}>
          <HeroScene growthProgress={1} />
        </Suspense>
      </div>

      {/* Hero — normal viewport height */}
      <section ref={heroRef} className="relative min-h-screen dark:bg-transparent">
        <div className="sticky top-0 h-screen overflow-hidden">
          <GlowOrbs />
          <div ref={heroContentRef} className="relative z-10">
            <HeroContent />
          </div>
        </div>
      </section>

      {/* About section — semi-transparent bg over tree */}
      <section className="py-20 md:py-28 px-4 relative bg-[#FFF8FA]/85 dark:bg-[#0f0f1a]/85 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-charcoal-800 dark:text-white mb-6">
            AURA-NER
          </h2>
          <p className="text-lg md:text-xl text-charcoal-400 dark:text-charcoal-500 max-w-2xl mx-auto leading-relaxed mb-8">
            AI-powered cognitive gaming and memory assistance for elderly people in the North Eastern Region.
            Combining culturally familiar activities with gentle AI personalization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/games" className="inline-flex items-center gap-2 justify-center bg-gradient-to-r from-sage-400 to-sage-600 text-white px-8 py-3.5 rounded-2xl font-semibold shadow-[0_0_20px_rgba(132,204,22,0.25)] hover:shadow-[0_0_30px_rgba(132,204,22,0.4)] hover:scale-105 transition-all duration-300">
              Explore Games
            </Link>
            <Link to="/assessment" className="inline-flex items-center gap-2 justify-center bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-white/50 dark:border-white/10 text-charcoal-700 dark:text-white/80 px-8 py-3.5 rounded-2xl font-semibold hover:bg-white/80 dark:hover:bg-white/15 transition-all duration-300">
              Start Assessment
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="relative bg-[#FFF8FA]/85 dark:bg-[#0f0f1a]/85 backdrop-blur-sm">
        <StatsBar />
      </div>

      {/* Product Showcase */}
      <div className="relative bg-[#FFF8FA]/85 dark:bg-[#0f0f1a]/85 backdrop-blur-sm">
        <ProductShowcase />
      </div>

      {/* Adapt Section */}
      <div className="relative bg-[#FFF8FA]/85 dark:bg-[#0f0f1a]/85 backdrop-blur-sm">
        <AdaptSection />
      </div>

      {/* NER Cultural Strip */}
      <div className="relative bg-[#FFF8FA]/85 dark:bg-[#0f0f1a]/85 backdrop-blur-sm">
        <NerStrip />
      </div>

      {/* Footer */}
      <footer className="py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-charcoal-800/95 dark:bg-[#0a0a14]/95 backdrop-blur-sm" />
        <GlowOrbs />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-400/80 to-sage-600/80 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-[0_0_16px_rgba(132,204,22,0.2)]">
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
                <Link to="/" className="block text-charcoal-300 dark:text-charcoal-400 hover:text-white text-sm transition-colors">{t('Home')}</Link>
                <Link to="/games" className="block text-charcoal-300 dark:text-charcoal-400 hover:text-white text-sm transition-colors">{t('Cognitive Games')}</Link>
                <Link to="/assistant" className="block text-charcoal-300 dark:text-charcoal-400 hover:text-white text-sm transition-colors">{t('Memory Assistant')}</Link>
                <Link to="/caregiver" className="block text-charcoal-300 dark:text-charcoal-400 hover:text-white text-sm transition-colors">{t('Caregiver Dashboard')}</Link>
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

          <div className="border-t border-charcoal-700 pt-8 flex flex-col items-center gap-3">
            <p className="text-charcoal-400 text-sm flex items-center gap-1">
              {t('Made with')} <Heart size={14} className="text-sage-400" /> {t('for memory that matters')}
            </p>
            <p className="text-sage-400 text-sm font-semibold">{t('Developed by Team OriginX')}</p>
            <div className="flex items-center gap-4">
              <span className="text-charcoal-400 text-xs">AURA-NER © 2024</span>
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
