import { useState, useEffect } from 'react'
import AuraWordmark from './AuraWordmark'

const SPLASH_KEY = 'aura-splash-shown'

/**
 * Entry splash — the handwritten AURA wordmark plays once per browser
 * session (not on every navigation), then hands over to the app.
 * With reduced motion the completed wordmark appears with a short fade.
 */
export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const alreadyShown = typeof window !== 'undefined' && sessionStorage.getItem(SPLASH_KEY) === '1'

  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(alreadyShown)

  useEffect(() => {
    if (alreadyShown) { onDone(); return }
    sessionStorage.setItem(SPLASH_KEY, '1')
    const hold = reduced ? 1100 : 2750
    const t1 = setTimeout(() => setLeaving(true), hold)
    const t2 = setTimeout(() => { setGone(true); onDone() }, hold + 700)
    return () => { clearTimeout(t1); clearTimeout(t2) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (gone) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center ${leaving ? 'aura-splash-exit' : ''}`}
      style={{ backgroundColor: '#FFF8FA' }}
      aria-hidden="true"
    >
      <AuraWordmark
        variant="animated"
        className="h-24 md:h-28"
        subtitle="Your memory companion"
      />
    </div>
  )
}
