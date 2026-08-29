import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TrendingUp, Zap, Target } from 'lucide-react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useTranslation } from '../../hooks/useTranslation'
import LiquidIcon from '../ui/LiquidIcon'

gsap.registerPlugin(ScrollTrigger)

const WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']
const SCORES = [52, 58, 61, 68, 72, 78, 82, 86]

const LEVELS = [
  { icon: Target, label: 'Easy', description: 'Gentle pace, fewer items, longer display times', color: 'sage' as const },
  { icon: TrendingUp, label: 'Moderate', description: 'Balanced challenge that adapts to individual pace', color: 'forest' as const },
  { icon: Zap, label: 'Adaptive', description: 'Real-time difficulty shifts based on performance', color: 'amber' as const },
]

export default function AdaptSection() {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const [chartDrawn, setChartDrawn] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !chartRef.current) { setChartDrawn(true); return }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: chartRef.current,
        start: 'top 80%',
        onEnter: () => setChartDrawn(true),
      })

      // Animate level cards
      const cards = sectionRef.current?.querySelectorAll('.level-card')
      if (cards) {
        gsap.fromTo(cards,
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.7, stagger: 0.12, ease: 'power2.out',
            scrollTrigger: { trigger: cards[0]?.parentElement, start: 'top 85%', toggleActions: 'play none none reverse' }
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  // Build SVG chart
  const chartW = 300, chartH = 120, padL = 24, padR = 10, padT = 10, padB = 20
  const plotW = chartW - padL - padR, plotH = chartH - padT - padB
  const minScore = 40, maxScore = 100

  const points = SCORES.map((s, i) => ({
    x: padL + (i / (SCORES.length - 1)) * plotW,
    y: padT + plotH - ((s - minScore) / (maxScore - minScore)) * plotH,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = linePath + ` L${points[points.length - 1].x},${padT + plotH} L${points[0].x},${padT + plotH} Z`

  return (
    <section ref={sectionRef} className="py-20 md:py-32 px-4 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Chart */}
          <div ref={chartRef}>
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal-800 dark:text-white mb-4">
              Designed around each person.
            </h2>
            <p className="text-charcoal-400 dark:text-charcoal-500 mb-8 leading-relaxed">
              AURA-NER's AI adapts game difficulty based on individual performance — activities stay engaging without becoming overwhelming.
            </p>

            <div className="relative bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-white/10 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-charcoal-600 dark:text-charcoal-400">Cognitive Score Over Time</span>
                <span className="text-xs text-sage-500 font-medium">↑ 34 points</span>
              </div>

              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ height: '140px' }}>
                <defs>
                  <linearGradient id="adaptGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(132,204,22)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="rgb(132,204,22)" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[50, 60, 70, 80, 90].map(s => {
                  const y = padT + plotH - ((s - minScore) / (maxScore - minScore)) * plotH
                  return (
                    <g key={s}>
                      <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                      <text x={padL - 4} y={y + 3} textAnchor="end" fontSize="8" fill="rgba(0,0,0,0.3)">{s}</text>
                    </g>
                  )
                })}

                {/* Week labels */}
                {WEEKS.map((w, i) => (
                  <text key={w} x={points[i].x} y={chartH - 4} textAnchor="middle" fontSize="8" fill="rgba(0,0,0,0.35)">{w}</text>
                ))}

                {/* Area fill */}
                <path
                  d={areaPath}
                  fill="url(#adaptGrad)"
                  style={{
                    opacity: chartDrawn ? 1 : 0,
                    transition: 'opacity 1s ease 0.5s',
                  }}
                />

                {/* Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="#84cc16"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: chartDrawn ? 'none' : '600',
                    strokeDashoffset: chartDrawn ? '0' : '600',
                    transition: 'stroke-dashoffset 2s ease-out',
                  }}
                />

                {/* Data points */}
                {points.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="3.5"
                    fill="white"
                    stroke="#84cc16"
                    strokeWidth="2"
                    style={{
                      opacity: chartDrawn ? 1 : 0,
                      transition: `opacity 0.4s ease ${0.8 + i * 0.15}s`,
                    }}
                  />
                ))}
              </svg>

              <p className="text-[10px] text-charcoal-400 mt-2 italic">AI-assisted personalization, not clinical assessment.</p>
            </div>
          </div>

          {/* Right: Difficulty levels */}
          <div className="space-y-4">
            {LEVELS.map((level, i) => (
              <div
                key={i}
                className="level-card relative overflow-hidden rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
                style={{ opacity: reducedMotion ? 1 : 0 }}
              >
                <div className="flex items-start gap-4">
                  <LiquidIcon size="md" color={level.color}>
                    <level.icon size={22} />
                  </LiquidIcon>
                  <div>
                    <h3 className="font-semibold text-charcoal-800 dark:text-white mb-1">{t(level.label)}</h3>
                    <p className="text-charcoal-400 dark:text-charcoal-500 text-sm leading-relaxed">{level.description}</p>
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
