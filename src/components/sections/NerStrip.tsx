import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

const ITEMS = [
  { emoji: '🎋', label: 'Bamboo' },
  { emoji: '🪷', label: 'Lotus' },
  { emoji: '🏔️', label: 'Hills' },
  { emoji: '🍵', label: 'Tea' },
  { emoji: '🥁', label: 'Drum' },
  { emoji: '🏮', label: 'Lantern' },
  { emoji: '🌽', label: 'Maize' },
  { emoji: '🎭', label: 'Dance' },
  { emoji: '🌺', label: 'Rhododendron' },
  { emoji: '🏔️', label: 'Valley' },
  { emoji: '🍵', label: 'Tea' },
  { emoji: '🎋', label: 'Bamboo' },
]

export default function NerStrip() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !scrollRef.current) return

    const el = scrollRef.current
    const totalWidth = el.scrollWidth / 2 // half because we duplicated

    const tween = gsap.to(el, {
      x: -totalWidth,
      duration: 30,
      ease: 'none',
      repeat: -1,
    })

    // Pause on hover
    const pause = () => tween.pause()
    const resume = () => tween.resume()
    el.addEventListener('mouseenter', pause)
    el.addEventListener('mouseleave', resume)

    return () => {
      tween.kill()
      el.removeEventListener('mouseenter', pause)
      el.removeEventListener('mouseleave', resume)
    }
  }, [reducedMotion])

  return (
    <section className="py-12 md:py-16 relative overflow-hidden">
      <div className="text-center mb-6">
        <p className="text-charcoal-400 dark:text-charcoal-500 text-sm font-medium">
          Built for the <span className="text-sage-500 font-semibold">North Eastern Region</span>
        </p>
      </div>

      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#FFF8FA] dark:from-[#0f0f1a] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#FFF8FA] dark:from-[#0f0f1a] to-transparent z-10 pointer-events-none" />

        <div ref={scrollRef} className="flex gap-4 whitespace-nowrap">
          {[...ITEMS, ...ITEMS].map((item, i) => (
            <div
              key={i}
              className="inline-flex flex-col items-center gap-1.5 bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/50 dark:border-white/10 shrink-0 hover:bg-white/70 dark:hover:bg-white/10 transition-colors duration-300 cursor-default"
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-[10px] text-charcoal-400 dark:text-charcoal-500 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
