import { useEffect, useState } from 'react'
import { useAuraInstall } from '../../pwa/useAuraInstall'
import { useTranslation } from '../../hooks/useTranslation'

/**
 * Small editorial "INSTALL AURA →" text link for the Landing footer.
 * Hides itself once AURA is installed — never a dead button.
 */
export default function InstallLink() {
  const { installed, offerInstall } = useAuraInstall()
  const { t } = useTranslation()
  const [busy, setBusy] = useState(false)

  useEffect(() => setBusy(false), [installed])

  if (installed) return null

  return (
    <button
      onClick={async () => { setBusy(true); await offerInstall(); setBusy(false) }}
      disabled={busy}
      className="uppercase tracking-[0.2em] text-[#7c9a6d] hover:text-[#5d7a51] transition-colors font-semibold"
    >
      {t('INSTALL AURA')} →
    </button>
  )
}
