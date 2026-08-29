import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useTranslation } from '../../hooks/useTranslation'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: 7, suffix: '', label: 'Cognitive Games' },
  { value: 3, suffix: '', label: 'Difficulty Levels' },
  { value: 100, suffix: '%', label: 'Voice-First Design' },
]

function AnimatedNumber({ target, suffix, trigger }: { target: number; suffix: string; trigger: boolean }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef({ val: 0 })

  useEffect(() => {
    if (!trigger) return
    const obj = ref.current
    gsap.to(obj, {
      val: target,
      duration: 1.5,
      ease: 'power2.out',
      onUpdate: () => setDisplay(Math.round(obj.val)),
    })
  }, [trigger, target])

  return <span>{display}{suffix}</span>
}

export default function StatsBar() {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const [triggered, setTriggered] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) { setTriggered(true); return }

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 85%',
      onEnter: () => setTriggered(true),
    })
  }, [reducedMotion])

  return (
    <section ref={sectionRef} className="py-16 md:py-20 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-6 md:gap-12">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="text-3xl md:text-5xl font-bold text-sage-600 dark:text-sage-400 mb-2 transition-all duration-500">
                {reducedMotion ? (
                  <span>{stat.value}{stat.suffix}</span>
                ) : (
                  <AnimatedNumber target={stat.value} suffix={stat.suffix} trigger={triggered} />
                )}
              </div>
              <p className="text-charcoal-400 dark:text-charcoal-500 text-sm md:text-base font-medium">{t(stat.label)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
