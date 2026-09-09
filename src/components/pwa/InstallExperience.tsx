import GardenGlyph, { type GlyphName } from '../ui/GardenGlyph'
import { useEffect, useState } from 'react'

const STEP_GLYPHS: GlyphName[] = ['sprout', 'leaf', 'flower']
import { ArrowRight, X, Share, Plus, MonitorSmartphone } from 'lucide-react'
import { useAuraInstall } from '../../pwa/useAuraInstall'
import OfflineBadge from './OfflineBadge'
import { useTranslation } from '../../hooks/useTranslation'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * The AURA install experience — "keep your memory garden close."
 *
 * - Editorial card on desktop (bottom-left, quiet corner)
 * - Gentle bottom sheet on mobile (thumb-reachable, never full-screen)
 * - Manual instructions when the browser has no native prompt
 * - Calm success note after installing
 * - None of it renders once AURA is installed/standalone
 */

export default function InstallExperience() {
  const { phase, installed, platform, offerInstall, dismiss, successAcknowledge } = useAuraInstall()
  const { t } = useTranslation()
  const reducedMotion = useReducedMotion()
  const [leafIn, setLeafIn] = useState(false)

  // Leaf grows in when the card appears (0.6s, calm)
  useEffect(() => {
    if (phase === 'ready' || phase === 'fallback') {
      const id = window.setTimeout(() => setLeafIn(true), reducedMotion ? 0 : 120)
      return () => window.clearTimeout(id)
    }
    setLeafIn(false)
  }, [phase, reducedMotion])

  // Success note fades itself away
  useEffect(() => {
    if (phase !== 'success') return
    const id = window.setTimeout(successAcknowledge, 5000)
    return () => window.clearTimeout(id)
  }, [phase, successAcknowledge])

  // Installed or nothing to say → render nothing at all (OfflineBadge stays alive separately)
  if (installed && phase !== 'success') return <OfflineBadge />
  if (phase !== 'ready' && phase !== 'fallback' && phase !== 'success') return <OfflineBadge />

  // ── success note ────────────────────────────────────────────────
  if (phase === 'success') {
    return (
      <div className="fixed z-[70] bottom-24 left-1/2 -translate-x-1/2 px-4 w-full max-w-sm" role="status" aria-live="polite">
        <div className="aura-install-card !p-5 flex items-center gap-4">
          <span className="aura-install-leaf" style={{ transform: 'scale(1)' }} aria-hidden>
            <LeafSprout />
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#7c9a6d] mb-1">{t('AURA IS WITH YOU.')}</p>
            <p className="text-[15px] text-[#2f2a24]">“{t('Your memory garden is ready.')}”</p>
          </div>
        </div>
      </div>
    )
  }

  const hasNative = phase === 'ready'

  const handleInstall = async () => {
    await offerInstall()
  }

  // ── ready / fallback card ───────────────────────────────────────
  return (
    <>
      {/* Desktop: editorial card, bottom-left */}
      <div className="hidden md:block fixed z-[70] bottom-6 left-6 max-w-[340px]" role="dialog" aria-label={t('Install AURA')}>
        <div className="aura-install-card">
          <button
            onClick={dismiss}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center text-[#a08d70] hover:bg-[#f0e8d8] hover:text-[#5d4f38] transition-colors"
            aria-label={t('Not now')}
          >
            <X size={15} />
          </button>

          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#a08d70] mb-3">AURA</p>
          <div className="flex items-start gap-3">
            <span className="aura-install-leaf" style={leafIn ? undefined : { transform: 'scale(0)', opacity: 0 }} aria-hidden>
              <LeafSprout />
            </span>
            <div>
              <h3 className="font-serif-display text-[22px] leading-tight text-[#2f2a24] mb-2">
                {t('KEEP AURA WITH YOU.')}
              </h3>
              <p className="text-[13.5px] leading-relaxed text-[#5d5344] mb-4">
                {t('Add your personal memory space to your device for quick access.')}
              </p>
            </div>
          </div>

          {hasNative ? (
            <button
              onClick={handleInstall}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#2f2a24] text-[#faf6ee] px-5 py-3 text-[14px] font-semibold hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all"
            >
              {t('INSTALL AURA')} <ArrowRight size={15} />
            </button>
          ) : (
            <ManualSteps platform={platform} />
          )}

          <button
            onClick={dismiss}
            className="w-full mt-2.5 text-[12px] font-mono uppercase tracking-[0.15em] text-[#a08d70] hover:text-[#5d4f38] py-2 transition-colors"
          >
            {t('Not now')}
          </button>
        </div>
      </div>

      {/* Mobile: gentle bottom sheet */}
      <div className="md:hidden fixed z-[70] inset-x-0 bottom-0 px-3 pb-3" role="dialog" aria-label={t('Install AURA')}>
        <div className="aura-install-card !rounded-b-none relative">
          <div className="flex items-start gap-3 mb-3">
            <span className="aura-install-leaf" style={leafIn ? undefined : { transform: 'scale(0)', opacity: 0 }} aria-hidden>
              <LeafSprout />
            </span>
            <div className="flex-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#a08d70] mb-1">AURA</p>
              <h3 className="font-serif-display text-[20px] leading-tight text-[#2f2a24]">{t('KEEP AURA WITH YOU')}</h3>
              <p className="text-[13px] text-[#5d5344] mt-1">“{t('Your memories are always close.')}”</p>
            </div>
            <button
              onClick={dismiss}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#a08d70] hover:bg-[#f0e8d8] transition-colors flex-shrink-0"
              aria-label={t('Not now')}
            >
              <X size={16} />
            </button>
          </div>

          {hasNative ? (
            <button
              onClick={handleInstall}
              className="w-full min-h-[52px] inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2f2a24] text-[#faf6ee] px-5 text-[15px] font-semibold active:scale-[0.98] transition-transform"
            >
              {t('INSTALL AURA')} <ArrowRight size={16} />
            </button>
          ) : (
            <ManualSteps platform={platform} />
          )}

          <button
            onClick={dismiss}
            className="w-full min-h-[44px] mt-1 text-[12px] font-mono uppercase tracking-[0.15em] text-[#a08d70] transition-colors"
          >
            {t('Not now')}
          </button>
        </div>
      </div>
    </>
  )
}

function ManualSteps({ platform }: { platform: { title: string; steps: string[] } }) {
  const { t } = useTranslation()
  return (
    <div className="rounded-xl border border-[#e4dccd] bg-[#fdf9f0] p-3.5">
      <p className="flex items-center gap-2 text-[12px] font-semibold text-[#5d4f38] mb-2">
        <MonitorSmartphone size={14} className="text-[#7c9a6d]" />
        {t(platform.title)}
      </p>
      <ol className="space-y-1.5">
        {platform.steps.map((s, i) => (
          <li key={i} className="flex items-center gap-2 text-[12.5px] text-[#5d5344]">
            <span className="text-[#b3895e] flex-shrink-0"><GardenGlyph name={STEP_GLYPHS[i % STEP_GLYPHS.length]} size={13} /></span>
            {t(s)}
          </li>
        ))}
      </ol>
      <p className="mt-2 text-[11px] text-[#a08d70] flex items-center gap-1.5">
        <Share size={11} /> <Plus size={11} /> {t('Look for "Install app" or "Add to Home Screen".')}
      </p>
    </div>
  )
}

/** The tiny growing leaf — AURA's organic signature. */
function LeafSprout() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path d="M 17 30 C 17 22 17 16 17 12" stroke="#7c9a6d" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M 17 14 C 10 12 7 7 8 3 C 14 4 17 8 17 14 Z" fill="#7c9a6d" opacity="0.9" />
      <path d="M 17 18 C 22 17 25 14 26 10 C 20 10 17 13 17 18 Z" fill="#5d7a51" opacity="0.85" />
      <ellipse cx="17" cy="30.5" rx="7" ry="1.6" fill="#e4dccd" />
    </svg>
  )
}
