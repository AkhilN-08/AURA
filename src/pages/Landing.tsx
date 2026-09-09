import InstallLink from '../components/pwa/InstallLink'
import GardenGlyph, { type GlyphName } from '../components/ui/GardenGlyph'
import AuraWordmark from '../components/branding/AuraWordmark'
import MemoryGarden from '../components/garden/MemoryGarden'
import Reveal from '../components/ui/Reveal'
import { useMemoryCapsule } from '../hooks/useMemoryCapsule'
import { useGameProgress } from '../hooks/useGameProgress'
import { useTranslation } from '../hooks/useTranslation'
import { Link } from 'react-router-dom'
import { ArrowRight, Gamepad2, Heart, MapPin, Repeat, Sprout, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, type ReactNode } from 'react'

/**
 * AURA Landing — "Stepping inside a person's memories."
 *
 * A cinematic scroll story built from the user's own Memory Capsule:
 *   01 MEMORIES MATTER   → the garden, living
 *   02 PEOPLE            → capsule people
 *   03 PLACES            → capsule places
 *   04 ROUTINES          → capsule routines
 *   05 ACTIVITY          → the games
 *   06 AURA LEARNS       → the adaptive loop
 *   07 THE GARDEN GROWS  → the whole environment
 *
 * Editorial structure: oversized serif type, numbered sections,
 * monospace metadata, generous paper whitespace. Content falls back
 * to the demo profile (Ravi) when the capsule is empty, so the first
 * impression is always alive.
 */

// ── Demo fallback content (mirrors generateDemoCapsule) ─────────
const DEMO_PEOPLE = [
  { name: 'Ananya', relationship: 'Daughter', note: 'She visits every Sunday.', emoji: '👧' },
  { name: 'Lakshmi', relationship: 'Wife', note: 'Makes the best filter coffee in the house.', emoji: '👩' },
]
const DEMO_PLACES = [
  { name: 'Family Garden', note: 'Ravi spends his mornings here watering the roses with Ananya.', emoji: '🌿' },
  { name: 'Home', note: 'Every evening ends with tea on the front porch.', emoji: '🏠' },
]
const DEMO_ROUTINES = [
  { activity: 'Morning Routine', time: '7:00 AM', steps: ['Wake up', 'Breakfast', 'Morning walk', 'Memory activity'] },
]

const STEP_MARKS: GlyphName[] = ['sprout', 'leaf', 'flower', 'sun', 'path', 'branch']

function SectionHeading({ index, lines, tone = 'dark', glyph }: { index: string; lines: string[]; tone?: 'dark' | 'light'; glyph?: GlyphName }) {
  const { t } = useTranslation()
  return (
    <div className="mb-8">
      <p className={`font-mono text-xs tracking-[0.3em] mb-4 flex items-center gap-2.5 ${tone === 'light' ? 'text-[#c9b8a0]' : 'text-[#a08d70]'}`}>
        {glyph && <GardenGlyph name={glyph} size={16} className="flex-shrink-0" />}
        <span>{t(index)}</span>
      </p>
      <h2 className={`font-serif-display text-[13vw] sm:text-6xl md:text-7xl leading-[0.95] tracking-tight ${tone === 'light' ? 'text-[#2f2a24]' : 'text-[#2f2a24]'}`}>
        {lines.map((l, i) => (
          <span key={i} className="block">{t(l)}</span>
        ))}
      </h2>
    </div>
  )
}

function CapsuleLink({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-[#8a7d68]">
      {children}
      <Link to="/capsule" className="underline decoration-[#d8c7a8] underline-offset-4 hover:text-[#5d4f38] transition-colors">
        {t('Memory Capsule')} →
      </Link>
    </span>
  )
}

export default function Landing() {
  const { t } = useTranslation()
  const capsule = useMemoryCapsule()
  const { sessions } = useGameProgress()

  // First visit: plant the demo memories so the garden is alive immediately
  const { seedDemo } = capsule
  useEffect(() => { seedDemo() }, [seedDemo])

  const people = capsule.people.length > 0
    ? capsule.people.slice(0, 3).map(p => ({ name: p.name, relationship: p.relationship, note: p.description, emoji: p.emoji, id: p.id }))
    : DEMO_PEOPLE.map((p, i) => ({ ...p, id: `demo-p-${i}` }))
  const places = capsule.places.length > 0
    ? capsule.places.slice(0, 3).map(pl => ({ name: pl.name, note: pl.memory || pl.description, emoji: pl.emoji, id: pl.id }))
    : DEMO_PLACES.map((pl, i) => ({ ...pl, id: `demo-pl-${i}` }))
  const routines = capsule.routines.length > 0
    ? capsule.routines.slice(0, 2).map(r => ({ activity: r.activity, time: r.time, steps: r.steps, id: r.id }))
    : DEMO_ROUTINES.map((r, i) => ({ ...r, id: `demo-r-${i}` }))

  const gamesPlayed = sessions.length
  const avgAccuracy = useMemo(() => {
    if (sessions.length === 0) return 0
    return Math.round(sessions.slice(-8).reduce((a, s) => a + s.accuracy, 0) / Math.min(8, sessions.length))
  }, [sessions])

  const isDemo = capsule.activeItems.length === 0

  return (
    <div className="bg-[#faf6ee] text-[#2f2a24] overflow-x-clip">
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-[92vh] flex flex-col px-5 sm:px-10 pt-24 pb-10 max-w-6xl mx-auto">
        {/* faint ruled lines, like a journal page */}
        <div aria-hidden className="absolute inset-0 pointer-events-none opacity-[0.35]"
          style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0 47px, rgba(150,130,100,0.08) 47px 48px)' }} />

        <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
          <Reveal>
            <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.35em] text-[#a08d70] mb-8">
              {t('A personal cognitive companion')} · {t('est. {n}', { n: '2025' })}
            </p>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="font-serif-display text-[15vw] sm:text-8xl md:text-[9rem] leading-[0.88] tracking-tight mb-8">
              <span className="block">{t('REMEMBER')}</span>
              <span className="block text-[#b3895e]">{t('WHAT')}</span>
              <span className="block">{t('MATTERS.')}</span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="max-w-xl text-lg md:text-xl leading-relaxed text-[#5d5344] mb-10">
              {t('Personalized cognitive experiences built around familiar people, places and memories.')}
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
              <Link
                to="/games"
                className="group inline-flex items-center gap-3 rounded-full bg-[#2f2a24] text-[#faf6ee] pl-8 pr-6 py-4 text-lg font-semibold shadow-[0_12px_30px_-12px_rgba(47,42,36,0.5)] hover:shadow-[0_18px_40px_-12px_rgba(47,42,36,0.55)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all"
              >
                {t('ENTER AURA')}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/capsule"
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#d8c7a8] px-7 py-4 text-lg font-semibold text-[#5d4f38] hover:border-[#b3895e] hover:bg-[#f3ead9] transition-all"
              >
                <Heart size={18} className="text-[#c9707f]" />
                {t('Memory Capsule')}
              </Link>
            </div>
          </Reveal>
        </div>

        {/* hero garden — the living environment */}
        <Reveal delay={150} className="relative z-10">
          <MemoryGarden compact />
          <p className="mt-3 font-mono text-[11px] text-[#a0937e]">
            {isDemo ? t('Growing from demo memories — add your own in the Memory Capsule.') : t('Growing from your own memories.')}
          </p>
        </Reveal>

        <div className="relative z-10 flex justify-center pt-8">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#a08d70] animate-bounce-slow">↓ {t('scroll')}</span>
        </div>
      </section>

      {/* ═══════════════ 01 · MEMORIES MATTER ═══════════════ */}
      <section className="border-t-2 border-[#2f2a24]/70 px-5 sm:px-10 py-20 max-w-6xl mx-auto">
        <SectionHeading index="MEMORY" glyph="sprout" lines={['MEMORIES', 'MATTER.']} />
        <div className="grid md:grid-cols-2 gap-10 items-end">
          <Reveal>
            <p className="text-lg leading-relaxed text-[#5d5344] max-w-md">
              {t('AURA turns the people, places and moments that matter into gentle cognitive experiences — a garden that grows each time a memory is revisited.')}
            </p>
          </Reveal>
          <Reveal delay={120} className="md:justify-self-end">
            <div className="flex gap-8 font-mono text-sm">
              <div>
                <p className="text-5xl font-serif-display text-[#b3895e]">{people.length + places.length + routines.length}</p>
                <p className="mt-1 uppercase tracking-[0.15em] text-[#8a7d68] text-[11px]">{t('memories planted')}</p>
              </div>
              <div>
                <p className="text-5xl font-serif-display text-[#b3895e]">{gamesPlayed}</p>
                <p className="mt-1 uppercase tracking-[0.15em] text-[#8a7d68] text-[11px]">{t('sessions watered')}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ 02 · PEOPLE ═══════════════ */}
      <section className="px-5 sm:px-10 py-20 max-w-6xl mx-auto">
        <SectionHeading index="PEOPLE" glyph="branch" lines={['THE PEOPLE', 'WHO RAISED US.']} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {people.map((p, i) => (
            <Reveal key={p.id} delay={i * 100}>
              <article className="group border-2 border-[#2f2a24] bg-[#fffdf6] p-6 shadow-[6px_6px_0_0_rgba(47,42,36,0.12)] hover:shadow-[8px_8px_0_0_rgba(179,137,94,0.35)] hover:-translate-y-1 transition-all">
                <div className="flex items-start justify-between mb-5">
                  <span className="text-5xl">{p.emoji}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a08d70] pt-1">{t('person')}</span>
                </div>
                <h3 className="font-serif-display text-3xl mb-1">{t(p.name)}</h3>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#c9707f] mb-3">{t(p.relationship)}</p>
                <p className="text-[#5d5344] leading-relaxed">“{t(p.note)}”</p>
              </article>
            </Reveal>
          ))}
          <Reveal delay={300}>
            <Link to="/capsule" className="flex flex-col items-start justify-between h-full min-h-[220px] border-2 border-dashed border-[#c9b8a0] p-6 hover:border-[#b3895e] hover:bg-[#f8f1e2] transition-all group">
              <span className="font-serif-display text-5xl text-[#c9b8a0] group-hover:text-[#b3895e] transition-colors">+</span>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#8a7d68]">{t('add someone who matters')} →</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ 03 · PLACES ═══════════════ */}
      <section className="px-5 sm:px-10 py-20 max-w-6xl mx-auto">
        <SectionHeading index="PLACES" glyph="path" lines={['PLACES THAT', 'REMEMBER US.']} />
        <div className="grid md:grid-cols-2 gap-6">
          {places.map((pl, i) => (
            <Reveal key={pl.id} delay={i * 120}>
              <article className="relative overflow-hidden border-2 border-[#2f2a24] bg-gradient-to-br from-[#eef3e6] to-[#f7efdd] p-7 min-h-[240px] flex flex-col justify-between shadow-[6px_6px_0_0_rgba(47,42,36,0.12)] hover:-translate-y-1 transition-all">
                <div className="flex items-center justify-between">
                  <MapPin size={18} className="text-[#7c9a6d]" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8a7d68]">{t('a familiar place')}</span>
                </div>
                <div>
                  <span className="text-4xl block mb-2">{pl.emoji}</span>
                  <h3 className="font-serif-display text-4xl mb-2">{t(pl.name)}</h3>
                  <p className="text-[#5d5344] leading-relaxed max-w-sm">“{t(pl.note)}”</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════ 04 · ROUTINES ═══════════════ */}
      <section className="px-5 sm:px-10 py-20 max-w-6xl mx-auto">
        <SectionHeading index="ROUTINES" glyph="sun" lines={['THE QUIET', 'RHYTHM OF DAYS.']} />
        <div className="space-y-6">
          {routines.map((r, i) => (
            <Reveal key={r.id} delay={i * 100}>
              <article className="border-2 border-[#2f2a24] bg-[#fffdf6] overflow-hidden shadow-[6px_6px_0_0_rgba(47,42,36,0.12)]">
                <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#2f2a24]/70 bg-[#f3ead9]">
                  <h3 className="font-serif-display text-2xl flex items-center gap-3"><Repeat size={18} className="text-[#b3895e]" /> {t(r.activity)}</h3>
                  <span className="font-mono text-sm text-[#8a7d68]">{r.time}</span>
                </div>
                <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 px-6 py-5">
                  {r.steps.map((s, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <span className="text-[#b3895e]"><GardenGlyph name={STEP_MARKS[j % STEP_MARKS.length]} size={16} /></span>
                      <span className="text-[#5d5344]">{t(s)}</span>
                      {j < r.steps.length - 1 && <span className="text-[#c9b8a0]">→</span>}
                    </li>
                  ))}
                </ol>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal delay={150}>
          <p className="mt-6 font-mono text-xs text-[#a08d70]">
            <CapsuleLink>{t('routines come from your')} · </CapsuleLink>
            {t('AURA notices when something in the day is different — never a diagnosis, just a gentle noticing.')}
          </p>
        </Reveal>
      </section>

      {/* ═══════════════ 05 · ACTIVITY ═══════════════ */}
      <section className="border-t-2 border-[#2f2a24]/70 px-5 sm:px-10 py-20 max-w-6xl mx-auto">
        <SectionHeading index="ACTIVITY" glyph="leaf" lines={['GENTLE EXERCISE', 'FOR THE MIND.']} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Gamepad2 size={22} />, label: '16', sub: 'memory activities', desc: 'Sequencing, recognition, storytelling and more.' },
            { icon: <Sprout size={22} />, label: '∞', sub: 'personalized', desc: 'Every game quietly uses your own memories.' },
            { icon: <TrendingUp size={22} />, label: `${avgAccuracy || '—'}%`, sub: 'recent recall', desc: 'AURA adapts difficulty to your pace.' },
            { icon: <Heart size={22} />, label: '0', sub: 'pressure', desc: 'No scores to lose. No timers to beat. Just practice.' },
          ].map((c, i) => (
            <Reveal key={i} delay={i * 90}>
              <div className="border-2 border-[#2f2a24] bg-[#fffdf6] p-5 h-full flex flex-col gap-3 shadow-[5px_5px_0_0_rgba(47,42,36,0.10)] hover:-translate-y-1 hover:shadow-[7px_7px_0_0_rgba(179,137,94,0.3)] transition-all">
                <span className="w-10 h-10 rounded-full border border-[#d8c7a8] flex items-center justify-center text-[#b3895e]">{c.icon}</span>
                <p className="font-serif-display text-4xl">{c.label}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a08d70]">{t(c.sub)}</p>
                <p className="text-sm text-[#5d5344] leading-relaxed mt-auto">{t(c.desc)}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={200}>
          <Link to="/games" className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#5d4f38] border-b-2 border-[#b3895e] pb-1 hover:text-[#2f2a24] transition-colors">
            {t('see all activities')} →
          </Link>
        </Reveal>
      </section>

      {/* ═══════════════ 06 · AURA LEARNS ═══════════════ */}
      <section className="px-5 sm:px-10 py-24 max-w-6xl mx-auto bg-[#f3ead9]/60 border-y border-[#d8c7a8]">
        <SectionHeading index="ADAPTATION" glyph="sprout" lines={['AURA LEARNS', 'WITH YOU.']} />
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { g: 'leaf' as const, h: 'You play', p: 'Every activity records how it felt — pace, recall, attention. Nothing leaves the device.' },
            { g: 'sprout' as const, h: 'AURA listens', p: 'The cognitive profile updates after each session. Strengths are noted, focus areas are spotted.' },
            { g: 'flower' as const, h: 'Tomorrow adapts', p: 'The next challenge meets you exactly where you are — a little bolder, or a little calmer.' },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 120}>
              <div className="relative pl-6">
                <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#b3895e]" />
                <p className="mb-2 text-[#b3895e]"><GardenGlyph name={s.g} size={20} /></p>
                <h3 className="font-serif-display text-3xl mb-3">{t(s.h)}</h3>
                <p className="text-[#5d5344] leading-relaxed">{t(s.p)}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={200}>
          <div className="mt-10 border-2 border-[#2f2a24] bg-[#fffdf6] p-6 shadow-[6px_6px_0_0_rgba(47,42,36,0.12)]">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#a08d70] mb-3">{t('a quiet example')}</p>
            <p className="font-serif-display text-2xl md:text-3xl leading-snug">
              “{t('Your recall was strong today, so tomorrow the pattern grows a little.')}”
            </p>
            <p className="mt-3 text-sm text-[#8a7d68]">— {t('AURA, after a good session')}</p>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════ 07 · THE GARDEN GROWS ═══════════════ */}
      <section className="px-5 sm:px-10 py-20 max-w-6xl mx-auto">
        <SectionHeading index="THE GARDEN" glyph="flower" lines={['THE GARDEN', 'GROWS.']} />
        <Reveal>
          <MemoryGarden />
        </Reveal>
        <div className="grid md:grid-cols-2 gap-6 mt-10">
          <Reveal>
            <p className="text-lg leading-relaxed text-[#5d5344]">
              {t('A tree for every person. A bush for every place. A lantern for every cherished object. Flowers bloom with every session played — the garden is the memory, tended daily.')}
            </p>
          </Reveal>
          <Reveal delay={120} className="md:justify-self-end md:self-end">
            <Link
              to="/games"
              className="group inline-flex items-center gap-3 rounded-full bg-[#2f2a24] text-[#faf6ee] pl-8 pr-6 py-4 text-lg font-semibold shadow-[0_12px_30px_-12px_rgba(47,42,36,0.5)] hover:-translate-y-0.5 transition-all"
            >
              {t('WATER YOUR GARDEN')}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t-2 border-[#2f2a24]/70 px-5 sm:px-10 py-14 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <AuraWordmark className="h-9" />
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#a08d70] mt-3">{t('remember what matters.')}</p>
          </div>
          <div className="flex gap-10 font-mono text-xs text-[#8a7d68]">
            <Link to="/" className="hover:text-[#2f2a24] transition-colors">{t('Home')}</Link>
            <Link to="/games" className="hover:text-[#2f2a24] transition-colors">{t('Games')}</Link>
            <Link to="/capsule" className="hover:text-[#2f2a24] transition-colors">{t('Memory Capsule')}</Link>
            <Link to="/about" className="hover:text-[#2f2a24] transition-colors">{t('About')}</Link>
            <InstallLink />
          </div>
        </div>
        <p className="mt-10 font-mono text-[11px] text-[#b3a68d]">
          {t('AURA is a cognitive companion — a supportive tool, never a diagnosis.')} · {t('Developed by Team OriginX')}
        </p>
      </footer>
    </div>
  )
}
