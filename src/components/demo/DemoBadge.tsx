import { useDemoMode } from '../../hooks/useDemoMode'
import { useTranslation } from '../../hooks/useTranslation'
import { RotateCcw, X } from 'lucide-react'

/**
 * The DEMO DATA badge — proof for judges that they are looking at fictional
 * data, plus one-tap Reset Demo / Exit. A floating pill at bottom-center
 * (Home button owns bottom-left, SOS owns bottom-right), so it can never
 * overlap page headers or the navbar. Editorial ink-and-ivory with the
 * sun-yellow accent — the palette's own "notice me" tone, no neon.
 */
export default function DemoBadge() {
  const { isDemo, exit, reset } = useDemoMode()
  const { t } = useTranslation()
  if (!isDemo) return null

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-1.5 sm:gap-2.5 rounded-full border-2 border-ink px-2.5 py-1.5 sm:px-4 sm:py-2 shadow-[0_6px_18px_-6px_rgba(23,23,23,0.35)] max-w-[calc(100vw-140px)]"
      style={{ background: '#F1D98A' }}
      role="status"
      aria-live="polite"
    >
      <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-ink/70 flex-shrink-0" aria-hidden />
      <span className="aura-meta !text-[10px] sm:!text-[11px] font-bold tracking-[0.08em] sm:tracking-[0.14em] text-ink whitespace-nowrap">
        {t('DEMO DATA')}
      </span>
      <span className="hidden md:inline aura-meta !text-[11px] text-ink/60 whitespace-nowrap">
        {t('fictional sample data')}
      </span>
      <button
        onClick={reset}
        className="aura-meta !text-[10px] sm:!text-[11px] flex items-center gap-1 text-ink underline decoration-ink/40 underline-offset-2 hover:decoration-ink transition-colors whitespace-nowrap"
        title={t('Return the demo to its starting state')}
      >
        <RotateCcw size={11} /> {t('Reset')}
      </button>
      <button
        onClick={exit}
        className="aura-meta !text-[11px] flex items-center text-ink/60 hover:text-ink transition-colors flex-shrink-0"
        title={t('Leave demo mode and return to your real data')}
        aria-label={t('Exit demo mode')}
      >
        <X size={13} />
      </button>
    </div>
  )
}
