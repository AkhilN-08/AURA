import { Brain, Mic, BarChart3, Heart, Shield, Sparkles, Users, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'

export default function About() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const els = containerRef.current.querySelectorAll('.about-anim')
    gsap.fromTo(els,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out', delay: 0.1 }
    )
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" ref={containerRef}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="about-anim mb-12">
          <button onClick={() => navigate(-1)} className="mb-4 text-charcoal-400 hover:text-charcoal-600 transition-colors flex items-center gap-1 text-sm">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center shadow-lg">
              <Sparkles size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-charcoal-800">{t('About AURA-NER')}</h1>
              <p className="text-charcoal-400 text-sm">{t('AI-Based Cognitive Gaming and Memory Assistance for the North Eastern Region')}</p>
            </div>
          </div>
        </div>

        {/* What & Who */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="about-anim card p-6">
            <h3 className="text-lg font-semibold text-charcoal-800 mb-3 flex items-center gap-2">
              <Heart size={18} className="text-rose-400" /> {t('What is AURA-NER?')}
            </h3>
            <p className="text-charcoal-500 text-sm leading-relaxed">
              {t('AURA-NER is an AI-powered cognitive gaming and memory assistance platform designed specifically for elderly people in the North Eastern Region of India. It combines gentle cognitive exercises with voice-powered assistance to keep minds active and families connected.')}
            </p>
          </div>
          <div className="about-anim card p-6">
            <h3 className="text-lg font-semibold text-charcoal-800 mb-3 flex items-center gap-2">
              <Users size={18} className="text-sky-500" /> {t('Who is it for?')}
            </h3>
            <p className="text-charcoal-500 text-sm leading-relaxed">
              {t("Built for elderly individuals experiencing memory challenges or early-stage dementia, and their caregivers. The app adapts to each user's cognitive level through an initial assessment and continuously personalizes the experience.")}
            </p>
          </div>
        </div>

        {/* 4 Feature Cards */}
        <div className="about-anim grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center mx-auto mb-3 shadow-md">
              <Brain size={22} className="text-white" />
            </div>
            <h4 className="font-semibold text-charcoal-800 mb-1">{t('7 Memory Games')}</h4>
            <p className="text-xs text-charcoal-400 leading-relaxed">
              {t('Memory Match, Object Recall, Sequence Recall, Word Association, Pattern Grid, Story Recall, and Color Sequence. Each game adapts difficulty based on performance.')}
            </p>
          </div>
          <div className="about-anim card p-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-md">
              <Mic size={22} className="text-white" />
            </div>
            <h4 className="font-semibold text-charcoal-800 mb-1">{t('Voice Assistant')}</h4>
            <p className="text-xs text-charcoal-400 leading-relaxed">
              {t('Natural voice interaction for setting reminders, checking the date, making calls, and daily routines. Just speak naturally — the assistant understands context.')}
            </p>
          </div>
          <div className="about-anim card p-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-md">
              <BarChart3 size={22} className="text-white" />
            </div>
            <h4 className="font-semibold text-charcoal-800 mb-1">{t('AI-Powered Insights')}</h4>
            <p className="text-xs text-charcoal-400 leading-relaxed">
              {t('Tracks cognitive trends over time. Generates personalized insights about progress, strengths, and areas that need gentle practice.')}
            </p>
          </div>
          <div className="about-anim card p-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-md">
              <Heart size={22} className="text-white" />
            </div>
            <h4 className="font-semibold text-charcoal-800 mb-1">{t('Family Connection')}</h4>
            <p className="text-xs text-charcoal-400 leading-relaxed">
              {t("Caregivers can send messages and photos that appear on the patient's home screen. A bridge between family members, even when apart.")}
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="about-anim card p-6 mb-8">
          <h3 className="text-lg font-semibold text-charcoal-800 mb-5">{t('How It Works')}</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
              <div>
                <p className="font-medium text-charcoal-800 text-sm">{t('Cognitive Assessment')}</p>
                <p className="text-xs text-charcoal-400 mt-1">{t('A gentle 5-step assessment evaluates memory, focus, sequence recall, word recall, and reaction time — all through simple taps, no typing required.')}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
              <div>
                <p className="font-medium text-charcoal-800 text-sm">{t('Personalized Experience')}</p>
                <p className="text-xs text-charcoal-400 mt-1">{t('Based on assessment results, the AI sets an appropriate difficulty level and recommends specific games. Difficulty adjusts automatically as the user plays.')}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
              <div>
                <p className="font-medium text-charcoal-800 text-sm">{t('Daily Engagement')}</p>
                <p className="text-xs text-charcoal-400 mt-1">{t("The home screen greets users by name, suggests a daily game, shows reminders, and displays messages from family. Warm encouragement replaces cold metrics.")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features List */}
        <div className="about-anim card p-6 mb-8">
          <h3 className="text-lg font-semibold text-charcoal-800 mb-4">{t('Key Features')}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: t('4-digit PIN login'), desc: t('Simple, no email or password needed') },
              { label: t('Tap-only assessment'), desc: t('No keyboard required — all taps and selections') },
              { label: t('Adaptive difficulty'), desc: t('AI adjusts game difficulty based on performance') },
              { label: t('Daily game recommendation'), desc: t('A new suggested game each day on the home screen') },
              { label: t('Browser notifications'), desc: t('Medication and appointment reminders pop up on time') },
              { label: t('Voice commands'), desc: t('"Remind me to call daughter at 6pm" — saves automatically') },
              { label: t('Family messages'), desc: t('Caregivers send messages and photos to the home screen') },
              { label: t('Weekly progress chart'), desc: t('Real data — shows improvement over time') },
              { label: t('Elder/Adult mode'), desc: t('Toggle font sizes for comfortable viewing') },
              { label: t('Hindi translation'), desc: t('Switch the entire interface to Hindi') },
              { label: t('Dark mode'), desc: t('Lower brightness for comfortable evening use') },
              { label: t('Auto-resume'), desc: t('Pick up exactly where you left off') },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-cream-50/80">
                <Sparkles size={14} className="text-sage-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-charcoal-800">{feature.label}</p>
                  <p className="text-xs text-charcoal-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety */}
        <div className="about-anim card p-5 bg-sage-50/50 border-sage-200/50">
          <div className="flex items-start gap-3">
            <Shield size={20} className="text-sage-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-charcoal-800 text-sm">{t('Safety & Privacy')}</p>
              <p className="text-xs text-charcoal-400 mt-1 leading-relaxed">
                {t('All data is stored locally on the device. AURA-NER is not a diagnostic tool and should not replace professional medical assessment. It is designed as a supplementary wellness companion to support cognitive health.')}
              </p>
            </div>
          </div>
        </div>

        {/* Developed by */}
        <div className="about-anim text-center mt-10">
          <p className="text-xs text-charcoal-300">Developed by Team OriginX</p>
        </div>
      </div>
    </div>
  )
}
