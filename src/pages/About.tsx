import { Brain, Mic, BarChart3, Heart, Shield, Users, ArrowLeft, Gamepad2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'
import GardenGlyph, { type GlyphName } from '../components/ui/GardenGlyph'
import Reveal from '../components/ui/Reveal'

const CHAPTERS: { glyph: GlyphName; tint: string; textColor: string }[] = [
  { glyph: 'sprout', tint: '#B8D99A', textColor: '#5d7a51' },
  { glyph: 'sun', tint: '#F1D98A', textColor: '#a3832e' },
  { glyph: 'leaf', tint: '#AFCBEF', textColor: '#4a6a92' },
  { glyph: 'flower', tint: '#F2B6C6', textColor: '#b45a74' },
  { glyph: 'path', tint: '#F3C6A5', textColor: '#b06a35' },
]

export default function About() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const FEATURES = [
    {
      icon: Brain, title: 'Sixteen Memory Activities',
      color: '#7c9a6d', bg: 'rgba(184, 217, 154, 0.22)',
      desc: 'From shopping-list recall to a personal memory album — every game draws on the people and places you know, and adapts to your pace.',
    },
    {
      icon: Mic, title: 'A Voice That Listens',
      color: '#4a6a92', bg: 'rgba(175, 203, 239, 0.28)',
      desc: '“Remind me to take medicine at 8.” “Call my daughter.” Speak naturally — AURA sets reminders, makes calls, and keeps the day moving.',
    },
    {
      icon: BarChart3, title: 'Gentle Insight',
      color: '#a3832e', bg: 'rgba(241, 217, 138, 0.30)',
      desc: 'Not scores — stories. AURA notices what you remember easily, offers more of it, and practices the rest quietly with you.',
    },
    {
      icon: Heart, title: 'Family, Close By',
      color: '#b45a74', bg: 'rgba(242, 182, 198, 0.30)',
      desc: 'Messages and photos from loved ones appear right on the home screen. A familiar face is never more than a tap away.',
    },
  ]

  const KEY_FEATURES = [
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
  ]

  return (
    <div className="room room-garden px-4">
      <div className="max-w-3xl mx-auto">
        {/* ── Header — the front page of a journal ── */}
        <header className="mb-14">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 text-ink/50 hover:text-ink transition-colors flex items-center gap-2 py-2"
            aria-label={t('Back')}
          >
            <ArrowLeft size={20} />
            <span className="aura-meta">{t('Back')}</span>
          </button>
          <div className="aura-meta mb-4 flex items-center gap-2.5">
            <GardenGlyph name="sprout" size={16} className="text-leaf" />
            {t('About AURA-NER')}
          </div>
          <h1 className="font-serif-display text-5xl md:text-6xl leading-[0.98] text-ink dark:text-white mb-5">
            {t('A companion')}<br />{t('for remembering.')}
          </h1>
          <div className="aura-rule w-24 mb-5" />
          <p className="text-lg text-charcoal-500 dark:text-charcoal-300 max-w-xl leading-relaxed">
            {t('AI-Based Cognitive Gaming and Memory Assistance for the North Eastern Region')}
          </p>
        </header>

        {/* ── Two-column intro with tinted panels ── */}
        <div className="grid md:grid-cols-2 gap-5 mb-16">
          <Reveal>
            <div className="rounded-2xl border-2 border-ink/70 bg-white p-7 h-full relative overflow-hidden">
              <span className="absolute top-0 left-0 right-0 h-2" style={{ background: CHAPTERS[0].tint }} />
              <h2 className="aura-meta mb-3" style={{ color: CHAPTERS[0].textColor }}>{t('WHAT IT IS')}</h2>
              <p className="font-serif-display text-xl text-ink dark:text-white leading-snug mb-3">
                {t('A quiet garden of practice.')}
              </p>
              <p className="text-charcoal-500 dark:text-charcoal-300 leading-relaxed">
                {t('AURA-NER is a cognitive gaming and memory companion designed for elderly people in the North Eastern Region of India. Gentle exercises, a voice that listens, and a garden that grows with every memory you revisit.')}
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="rounded-2xl border-2 border-ink/70 bg-white p-7 h-full relative overflow-hidden">
              <span className="absolute top-0 left-0 right-0 h-2" style={{ background: CHAPTERS[1].tint }} />
              <h2 className="aura-meta mb-3" style={{ color: CHAPTERS[1].textColor }}>{t('WHO IT IS FOR')}</h2>
              <p className="font-serif-display text-xl text-ink dark:text-white leading-snug mb-3">
                {t('Families, together.')}
              </p>
              <p className="text-charcoal-500 dark:text-charcoal-300 leading-relaxed">
                {t("Built for elderly individuals experiencing memory challenges, and for the caregivers who love them. The experience adapts to each person through a gentle first assessment — then keeps adapting, quietly.")}
              </p>
            </div>
          </Reveal>
        </div>

        {/* ── Four feature chapters — each with its own garden color ── */}
        <div className="mb-16">
          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-leaf"><GardenGlyph name="flower" size={24} /></span>
            <h2 className="font-serif-display text-3xl text-ink dark:text-white">{t('What lives inside')}</h2>
            <div className="flex-1 h-px bg-ink/15" />
          </div>
          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 80}>
                <div
                  className="rounded-2xl p-6 md:p-7 flex items-start gap-5 border-2 transition-transform hover:-translate-y-0.5"
                  style={{ background: f.bg, borderColor: `${f.color}55` }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border-2"
                    style={{ background: '#FFFFFF', borderColor: `${f.color}66`, color: f.color }}
                  >
                    <f.icon size={26} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="font-serif-display text-xl md:text-2xl text-ink dark:text-white mb-1.5">{t(f.title)}</h3>
                    <p className="text-charcoal-600 dark:text-charcoal-300 leading-relaxed">{t(f.desc)}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── How it works — the three-beat story ── */}
        <div className="mb-16">
          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-leaf"><GardenGlyph name="path" size={24} /></span>
            <h2 className="font-serif-display text-3xl text-ink dark:text-white">{t('How it works')}</h2>
            <div className="flex-1 h-px bg-ink/15" />
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { chapter: 0, title: t('Cognitive Assessment'), desc: t('A gentle 5-step assessment evaluates memory, focus, sequence recall, word recall, and reaction time — all through simple taps, no typing required.') },
              { chapter: 1, title: t('Personalized Experience'), desc: t('Based on assessment results, AURA sets an appropriate difficulty and recommends specific activities. Difficulty adjusts automatically as you play.') },
              { chapter: 2, title: t('Daily Engagement'), desc: t('The home greets you by name, suggests today\u2019s activity, keeps reminders, and brings messages from family. Warm encouragement replaces cold metrics.') },
            ].map((step, i) => {
              const ch = CHAPTERS[step.chapter]
              return (
                <Reveal key={i} delay={i * 100}>
                  <div className="relative pl-5">
                    <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full" style={{ background: ch.tint }} />
                    <div className="mb-2" style={{ color: ch.textColor }}>
                      <GardenGlyph name={ch.glyph} size={20} />
                    </div>
                    <p className="font-semibold text-ink dark:text-white mb-1.5">{step.title}</p>
                    <p className="text-sm text-charcoal-500 dark:text-charcoal-400 leading-relaxed">{step.desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>

        {/* ── Key features — dotted garden checklist ── */}
        <div className="mb-16">
          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-leaf"><GardenGlyph name="leaf" size={24} /></span>
            <h2 className="font-serif-display text-3xl text-ink dark:text-white">{t('Key Features')}</h2>
            <div className="flex-1 h-px bg-ink/15" />
          </div>
          <div className="grid sm:grid-cols-2 gap-x-8">
            {KEY_FEATURES.map((feature, i) => (
              <div key={i} className="flex items-start gap-3.5 py-3.5 border-b border-ink/10">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border"
                  style={{
                    background: CHAPTERS[i % CHAPTERS.length].tint + '55',
                    borderColor: CHAPTERS[i % CHAPTERS.length].tint,
                    color: CHAPTERS[i % CHAPTERS.length].textColor,
                  }}
                >
                  <GardenGlyph name={CHAPTERS[i % CHAPTERS.length].glyph} size={14} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink dark:text-white">{feature.label}</p>
                  <p className="text-xs text-charcoal-500 dark:text-charcoal-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Safety — a quiet note pinned to the last page ── */}
        <Reveal>
          <div className="rounded-2xl border-2 border-dashed border-leaf/50 bg-sagesoft/20 p-6 mb-12">
            <div className="flex items-start gap-4">
              <Shield size={22} className="text-leaf mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-serif-display text-lg text-ink dark:text-white mb-1">{t('Safety & Privacy')}</p>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-300 leading-relaxed">
                  {t('All data is stored locally on the device. AURA-NER is not a diagnostic tool and should not replace professional medical assessment. It is designed as a supplementary wellness companion to support cognitive health.')}
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Colophon ── */}
        <div className="text-center pb-4">
          <div className="flex items-center justify-center gap-3 mb-2 text-leaf">
            <GardenGlyph name="sprout" size={15} />
            <GardenGlyph name="flower" size={15} />
            <GardenGlyph name="leaf" size={15} />
          </div>
          <p className="aura-meta">{t('Developed by Team OriginX')}</p>
        </div>
      </div>
    </div>
  )
}
