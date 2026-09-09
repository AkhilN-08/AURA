import { WifiOff } from 'lucide-react'
import { useOfflineStatus } from '../../pwa/useAuraInstall'
import { useTranslation } from '../../hooks/useTranslation'

/**
 * Subtle offline indicator — honest, never alarming.
 * Always mounted so it works regardless of install-phase state.
 */
export default function OfflineBadge() {
  const offline = useOfflineStatus()
  const { t } = useTranslation()

  if (!offline) return null

  return (
    <div className="fixed z-[60] top-16 left-1/2 -translate-x-1/2 px-3" role="status" aria-live="polite">
      <div className="flex items-center gap-2 rounded-full border border-[#e4dccd] bg-[#faf6ee]/95 px-3.5 py-1.5 shadow-sm">
        <WifiOff size={12} className="text-[#a08d70]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8a7d68]">{t('Offline')}</span>
        <span className="text-[11px] text-[#8a7d68] hidden sm:inline">· {t('Some AURA features may be unavailable.')}</span>
      </div>
    </div>
  )
}
