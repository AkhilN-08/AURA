import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Brain, Mic, BarChart3, Gamepad2, MessageCircle, Activity, TrendingUp, Clock, Target, Zap, Eye, Search, Lightbulb } from 'lucide-react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useTranslation } from '../../hooks/useTranslation'
import LiquidIcon from '../ui/LiquidIcon'

gsap.registerPlugin(ScrollTrigger)

const VIEWS = [
  {
    id: 'games',
    label: 'Cognitive Games',
    caption: '7 adaptive games that challenge memory, focus, and recognition — tailored to each individual.',
    content: GamesView,
  },
  {
    id: 'assistant',
    label: 'Voice Assistant',
    caption: 'A natural voice companion for reminders, daily routines, and meaningful conversation.',
    content: AssistantView,
  },
  {
    id: 'caregiver',
    label: 'Caregiver Dashboard',
    caption: 'Gentle insights for families — activity trends, performance data, and AI-driven observations.',
    content: CaregiverView,
  },
]

function GamesView() {
  const games = [
    { icon: Brain, name: 'Memory Match', color: 'forest' as const },
    { icon: Eye, name: 'Focus Trail', color: 'sage' as const },
    { icon: Search, name: 'Object Recall', color: 'amber' as const },
    { icon: Lightbulb, name: 'Pattern Grid', color: 'forest' as const },
    { icon: Gamepad2, name: 'Word Links', color: 'sage' as const },
    { icon: Target, name: 'Sequence', color: 'amber' as const },
    { icon: Zap, name: 'Color Rush', color: 'forest' as const },
  ]

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Gamepad2 size={14} className="text-sage-500" />
        <span className="text-[11px] font-semibold text-charcoal-700">Cognitive Games</span>
      </div>
      <div className="grid grid-cols-2 gap-2 flex-1">
        {games.map((g, i) => (
          <div key={i} className="bg-white/60 backdrop-blur-sm rounded-xl p-2.5 border border-white/50 flex items-center gap-2 hover:bg-white/80 transition-colors cursor-pointer">
            <LiquidIcon size="sm" color={g.color}>
              <g.icon size={12} />
            </LiquidIcon>
            <span className="text-[10px] font-medium text-charcoal-700 leading-tight">{g.name}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 bg-sage-50 rounded-lg p-2 border border-sage-100/50">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] text-charcoal-500">Overall Accuracy</span>
          <span className="text-[9px] font-bold text-sage-600">82%</span>
        </div>
        <div className="w-full bg-sage-100 rounded-full h-1.5">
          <div className="bg-sage-400 h-1.5 rounded-full" style={{ width: '82%' }} />
        </div>
      </div>
    </div>
  )
}

function AssistantView() {
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Mic size={14} className="text-forest-500" />
        <span className="text-[11px] font-semibold text-charcoal-700">Voice Assistant</span>
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl rounded-tr-sm p-2.5 ml-6 border border-white/60">
          <p className="text-[10px] text-charcoal-700">"Remind me to call my daughter at 6 PM"</p>
        </div>
        <div className="bg-sage-50/80 backdrop-blur-sm rounded-xl rounded-tl-sm p-2.5 mr-6 border border-sage-100/60">
          <p className="text-[10px] text-sage-700">"Done! I'll remind you at 6 PM to call your daughter. 📞"</p>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-xl rounded-tr-sm p-2.5 ml-6 border border-white/60">
          <p className="text-[10px] text-charcoal-700">"What did I have for breakfast?"</p>
        </div>
        <div className="bg-sage-50/80 backdrop-blur-sm rounded-xl rounded-tl-sm p-2.5 mr-6 border border-sage-100/60">
          <p className="text-[10px] text-sage-700">"You had rice and tea this morning. A lovely start! 🍵"</p>
        </div>
      </div>
      <div className="mt-2 flex gap-1.5">
        {['Set Reminder', 'Make a Call', 'Play Game'].map((action, i) => (
          <div key={i} className="bg-white/50 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-white/40 text-[9px] text-charcoal-600 font-medium flex-1 text-center">
            {action}
          </div>
        ))}
      </div>
      <div className="mt-2 bg-forest-50/60 rounded-lg p-2 border border-forest-100/50 flex items-center gap-2">
        <Mic size={12} className="text-forest-500 animate-pulse" />
        <span className="text-[9px] text-forest-600">Listening...</span>
      </div>
    </div>
  )
}

function CaregiverView() {
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 size={14} className="text-amber-500" />
        <span className="text-[11px] font-semibold text-charcoal-700">Caregiver Dashboard</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        <div className="bg-sage-50/70 rounded-lg p-2 text-center border border-sage-100/50">
          <p className="text-sm font-bold text-sage-600">5</p>
          <p className="text-[8px] text-charcoal-400">This Week</p>
        </div>
        <div className="bg-amber-50/70 rounded-lg p-2 text-center border border-amber-100/50">
          <p className="text-sm font-bold text-amber-600">86%</p>
          <p className="text-[8px] text-charcoal-400">Accuracy</p>
        </div>
        <div className="bg-sage-50/70 rounded-lg p-2 text-center border border-sage-100/50">
          <p className="text-sm font-bold text-sage-600">↑12%</p>
          <p className="text-[8px] text-charcoal-400">Progress</p>
        </div>
      </div>
      {/* Mini chart */}
      <div className="bg-white/50 rounded-xl p-3 border border-white/40 mb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-medium text-charcoal-600">Weekly Performance</span>
          <TrendingUp size={10} className="text-sage-400" />
        </div>
        <svg viewBox="0 0 200 50" className="w-full h-8">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(132,204,22)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(132,204,22)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,40 Q30,35 50,28 T100,20 T150,12 T200,8" fill="none" stroke="#84cc16" strokeWidth="2" />
          <path d="M0,40 Q30,35 50,28 T100,20 T150,12 T200,8 L200,50 L0,50 Z" fill="url(#chartGrad)" />
        </svg>
      </div>
      {/* AI Insight */}
      <div className="bg-cream-50/70 rounded-lg p-2 border border-cream-200/50">
        <div className="flex items-start gap-1.5">
          <Activity size={10} className="text-forest-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-[9px] font-medium text-charcoal-700">AI Insight</p>
            <p className="text-[8px] text-charcoal-500 mt-0.5 leading-relaxed">
              "Engagement consistent this week. Memory-match improved 8% vs last week."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductShowcase() {
  const { t } = useTranslation()
  const [activeIdx, setActiveIdx] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const deviceRef = useRef<HTMLDivElement>(null)
  const captionRef = useRef<HTMLParagraphElement>(null)
  const reducedMotion = useReducedMotion()

  // Auto-cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % VIEWS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // GSAP entrance
  useEffect(() => {
    if (reducedMotion || !deviceRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(deviceRef.current,
        { opacity: 0, y: 80, scale: 0.92 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', toggleActions: 'play none none reverse' }
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [reducedMotion])

  // Caption transition
  useEffect(() => {
    if (!captionRef.current || reducedMotion) return
    gsap.fromTo(captionRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    )
  }, [activeIdx, reducedMotion])

  const ActiveContent = VIEWS[activeIdx].content

  return (
    <section ref={sectionRef} className="py-20 md:py-32 px-4 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-charcoal-800 dark:text-white mb-4">
            See It In Action
          </h2>
          <p className="text-charcoal-400 dark:text-charcoal-500 text-lg max-w-xl mx-auto">
            Explore the three pillars of AURA-NER — games, voice assistance, and family connection.
          </p>
        </div>

        {/* Device Frame */}
        <div ref={deviceRef} className="flex justify-center" style={{ opacity: reducedMotion ? 1 : 0 }}>
          <div className="relative w-full max-w-sm">
            {/* Phone bezel */}
            <div className="relative rounded-[2.5rem] bg-charcoal-900 dark:bg-charcoal-800 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.08)]">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-charcoal-900 dark:bg-charcoal-800 rounded-b-2xl z-20" />

              {/* Screen */}
              <div className="relative rounded-[2rem] overflow-hidden bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-xl border border-white/20 dark:border-white/5" style={{ minHeight: '460px' }}>
                {/* Status bar */}
                <div className="flex items-center justify-between px-5 pt-7 pb-2">
                  <span className="text-[10px] font-semibold text-charcoal-800">9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-2 border border-charcoal-700 rounded-sm relative">
                      <div className="absolute inset-[1px] bg-charcoal-700 rounded-[1px]" style={{ width: '70%' }} />
                    </div>
                  </div>
                </div>

                {/* View content */}
                <div className="px-2 pb-3 h-[400px]">
                  <ActiveContent />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View selector pills */}
        <div className="flex justify-center gap-3 mt-8">
          {VIEWS.map((view, i) => (
            <button
              key={view.id}
              onClick={() => setActiveIdx(i)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-400 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
                i === activeIdx
                  ? 'bg-sage-500 text-white shadow-[0_0_16px_rgba(132,204,22,0.3)]'
                  : 'bg-white/60 dark:bg-white/10 backdrop-blur-sm text-charcoal-500 dark:text-charcoal-400 border border-white/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/15'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>

        {/* Caption */}
        <div className="text-center mt-6 min-h-[48px]">
          <p ref={captionRef} className="text-charcoal-400 dark:text-charcoal-500 text-sm max-w-md mx-auto">
            {VIEWS[activeIdx].caption}
          </p>
        </div>
      </div>
    </section>
  )
}
