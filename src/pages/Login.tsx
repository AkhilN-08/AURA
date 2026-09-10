import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { User, ArrowRight, Delete, Sprout, PlayCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useDemoMode } from '../hooks/useDemoMode'
import { useTranslation } from '../hooks/useTranslation'
import AuraWordmark from '../components/branding/AuraWordmark'
import gsap from 'gsap'
import MemoryGarden from '../components/garden/MemoryGarden'
import GardenGlyph from '../components/ui/GardenGlyph'

export default function Login() {
  const [mode, setMode] = useState<'pin' | 'signup'>('pin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [caregiverPin, setCaregiverPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, signup, pinLogin, hasPin, user } = useAuth()
  const { enter: enterDemo, isDemo } = useDemoMode()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const formRef = useRef<HTMLDivElement>(null)

  // If user already has a PIN, show PIN entry; otherwise show signup
  useEffect(() => {
    if (hasPin) setMode('pin')
    else setMode('signup')
  }, [hasPin])

  useEffect(() => {
    if (!formRef.current) return
    const els = formRef.current.querySelectorAll('.login-anim')
    gsap.fromTo(els,
      { opacity: 0, y: 30, filter: 'blur(6px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, stagger: 0.12, ease: 'power2.out', delay: 0.15 }
    )
  }, [mode])

  const handlePinSubmit = () => {
    if (pin.length !== 4) return
    setError('')
    setLoading(true)
    setTimeout(() => {
      const result = pinLogin(pin)
      if (result.success) {
        gsap.to(formRef.current, { opacity: 0, y: -20, duration: 0.5, ease: 'power2.in', onComplete: () => navigate('/') })
      } else {
        setError(result.error || 'Wrong PIN. Try again.')
        setPin('')
        gsap.fromTo(formRef.current?.querySelector('.error-msg') as HTMLElement,
          { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }
        )
      }
      setLoading(false)
    }, 400)
  }

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return }
      if (pin.length !== 4 || !/^\d{4}$/.test(pin)) { setError('PIN must be 4 digits.'); setLoading(false); return }
      const result = signup(name, email || `${name.toLowerCase().replace(/\s/g, '')}@aura.local`, 'pin-set', undefined, pin, undefined, caregiverPin || undefined)
      if (result.success) {
        gsap.to(formRef.current, { opacity: 0, y: -20, duration: 0.5, ease: 'power2.in', onComplete: () => navigate('/') })
      } else {
        setError(result.error || 'Something went wrong.')
        setLoading(false)
      }
    }, 600)
  }

  const addDigit = (d: string) => {
    if (pin.length < 4) {
      const newPin = pin + d
      setPin(newPin)
      if (newPin.length === 4 && mode === 'pin') {
        // Auto-submit when 4 digits entered
        setTimeout(() => {
          setError('')
          setLoading(true)
          const result = pinLogin(newPin)
          if (result.success) {
            gsap.to(formRef.current, { opacity: 0, y: -20, duration: 0.5, ease: 'power2.in', onComplete: () => navigate('/') })
          } else {
            setError(result.error || 'Wrong PIN. Try again.')
            setPin('')
          }
          setLoading(false)
        }, 200)
      }
    }
  }

  const removeDigit = () => setPin(p => p.slice(0, -1))

  return (
    <div className="min-h-screen flex aura-paper">
      {/* Left panel — the Memory Garden greets you at the gate */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden aura-paper bg-[#F8F1E5]">
        <div className="absolute inset-x-0 bottom-0 top-24 opacity-90">
          <MemoryGarden />
        </div>
        <div className="relative z-10 flex flex-col justify-between px-14 py-12 text-ink h-full">
          <AuraWordmark className="h-14" />
          <div className="max-w-md">
            <div className="aura-meta mb-4 flex items-center gap-2.5">
              <GardenGlyph name="sprout" size={16} className="text-leaf" />
              {t('A quiet door')}
            </div>
            <h1 className="font-serif-display text-5xl leading-[1.05] text-ink mb-5">
              {t('Every memory')}<br />{t('matters.')}
            </h1>
            <div className="aura-rule w-24 mb-5" />
            <p className="text-lg text-ink/70 leading-relaxed">
              {t('Personalized cognitive experiences built around familiar people, places and memories.')}
            </p>
          </div>
          <div className="flex items-center gap-3 text-ink/60">
            <Sprout size={18} className="text-leaf" />
            <span className="aura-meta">{t('REMEMBER WHAT MATTERS')}</span>
          </div>
        </div>
      </div>

      {/* Right panel — the journal page */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative aura-paper">
        <div ref={formRef} className="w-full max-w-md relative z-10">
          <div className="mb-10 lg:hidden login-anim">
            <AuraWordmark className="h-10" />
          </div>

          {mode === 'pin' ? (
            <>
              <div className="aura-meta mb-3 login-anim flex items-center gap-2.5">
                <GardenGlyph name="leaf" size={16} className="text-leaf" />
                {t('Your page')}
              </div>
              <h2 className="font-serif-display text-4xl text-ink dark:text-white mb-3 login-anim">
                {t('Welcome back')}
              </h2>
              <div className="aura-rule w-16 mb-6 login-anim" />
              <p className="text-charcoal-400 dark:text-charcoal-300 mb-8 text-lg login-anim">
                {t('Enter your 4-digit PIN to continue.')}
              </p>

              {/* PIN display */}
              <div className="flex justify-center gap-4 mb-8 login-anim">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-bold transition-all duration-200 ${
                    i < pin.length
                      ? 'bg-ink text-ivory border-2 border-ink scale-105'
                      : 'bg-transparent border-2 border-ink/25 text-ink/30'
                  }`}>
                    {i < pin.length ? '•' : ''}
                  </div>
                ))}
              </div>

              {error && (
                <div className="error-msg bg-rose-50 border-2 border-rose-300 text-rose-700 text-sm rounded-lg px-4 py-3 mb-4 text-center" role="alert">
                  {error}
                </div>
              )}

              {/* Number pad — tactile journal keys */}
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto login-anim">
                {['1','2','3','4','5','6','7','8','9'].map(d => (
                  <button key={d} onClick={() => addDigit(d)}
                    className="h-16 rounded-lg bg-transparent border-2 border-ink/20 text-2xl font-bold text-ink hover:bg-ink hover:text-ivory hover:border-ink active:translate-y-0.5 transition-all duration-150">
                    {d}
                  </button>
                ))}
                <div />
                <button onClick={() => addDigit('0')}
                  className="h-16 rounded-lg bg-transparent border-2 border-ink/20 text-2xl font-bold text-ink hover:bg-ink hover:text-ivory hover:border-ink active:translate-y-0.5 transition-all duration-150">
                  0
                </button>
                <button onClick={removeDigit}
                  className="h-16 rounded-lg bg-transparent border-2 border-ink/10 flex items-center justify-center text-ink/50 hover:border-ink/40 active:translate-y-0.5 transition-all duration-150">
                  <Delete size={22} />
                </button>
              </div>

              {loading && (
                <div className="flex justify-center mt-6">
                  <div className="w-6 h-6 border-2 border-leaf/30 border-t-leaf rounded-full animate-spin" />
                </div>
              )}

              {/* Judge demo — one tap into the controlled presentation */}
              <div className="mt-8 login-anim">
                <div className="flex items-center gap-3 mb-3">
                  <div className="aura-rule flex-1" />
                  <span className="aura-meta !text-[10px] text-ink/40">{t('for presenters')}</span>
                  <div className="aura-rule flex-1" />
                </div>
                <button
                  type="button"
                  onClick={enterDemo}
                  disabled={isDemo}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-ink/30 text-ink/70 hover:border-leaf hover:text-ink hover:bg-sagesoft/20 transition-all duration-200 disabled:opacity-50"
                >
                  <PlayCircle size={18} className="text-leaf" />
                  <span className="font-medium">{t('Start Judge Demo')}</span>
                  <span className="aura-meta !text-[10px] text-ink/40">· {t('Ravi — DEMO DATA')}</span>
                </button>
              </div>

              <p className="text-center text-charcoal-400 dark:text-charcoal-500 text-base mt-8 login-anim">
                {t("Don't have an account?")}{' '}
                <button onClick={() => { setMode('signup'); setError(''); setPin('') }}
                  className="text-leaf font-semibold underline decoration-leaf/40 underline-offset-4 hover:decoration-leaf transition-colors">
                  {t('Sign up')}
                </button>
              </p>
            </>
          ) : (
            /* Signup mode */
            <>
              <div className="aura-meta mb-3 login-anim flex items-center gap-2.5">
                <GardenGlyph name="leaf" size={16} className="text-leaf" />
                {t('Your page')}
              </div>
              <h2 className="font-serif-display text-4xl text-ink dark:text-white mb-3 login-anim">
                {t('Create your account')}
              </h2>
              <div className="aura-rule w-16 mb-6 login-anim" />
              <p className="text-charcoal-400 dark:text-charcoal-300 mb-8 text-lg login-anim">
                {t('Set up AURA-NER with a simple 4-digit PIN.')}
              </p>

              <form onSubmit={handleSignupSubmit} className="space-y-5">
                <div className="login-anim">
                  <label className="aura-meta mb-2 block">{t('Your Name')}</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('What should we call you?')}
                      className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-transparent border-2 border-ink/20 text-ink dark:text-white placeholder-ink/30 focus:outline-none focus:border-leaf focus:ring-1 focus:ring-leaf transition-all" required />
                  </div>
                </div>

                {/* PIN setup */}
                <div className="login-anim">
                  <label className="aura-meta mb-3 block">{t('Choose a 4-digit PIN')}</label>
                  <div className="flex justify-center gap-3 mb-4">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold transition-all duration-200 ${
                        i < pin.length
                          ? 'bg-ink text-ivory border-2 border-ink scale-105'
                          : 'bg-transparent border-2 border-ink/25 text-ink/30'
                      }`}>
                        {i < pin.length ? '•' : ''}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
                    {['1','2','3','4','5','6','7','8','9'].map(d => (
                      <button key={d} type="button" onClick={() => { if (pin.length < 4) setPin(p => p + d) }}
                        className="h-12 rounded-lg bg-transparent border-2 border-ink/20 text-lg font-bold text-ink hover:bg-ink hover:text-ivory hover:border-ink active:translate-y-0.5 transition-all duration-150">
                        {d}
                      </button>
                    ))}
                    <div />
                    <button type="button" onClick={() => { if (pin.length < 4) setPin(p => p + '0') }}
                      className="h-12 rounded-lg bg-transparent border-2 border-ink/20 text-lg font-bold text-ink hover:bg-ink hover:text-ivory hover:border-ink active:translate-y-0.5 transition-all duration-150">
                      0
                    </button>
                    <button type="button" onClick={() => setPin(p => p.slice(0, -1))}
                      className="h-12 rounded-lg bg-transparent border-2 border-ink/10 flex items-center justify-center text-ink/50 hover:border-ink/40 active:translate-y-0.5 transition-all duration-150">
                      <Delete size={18} />
                    </button>
                  </div>
                </div>

                {/* Caregiver PIN (optional) */}
                <div className="login-anim">
                  <label className="aura-meta mb-2 block">
                    {t('Caregiver PIN')} <span className="text-ink/40 font-normal normal-case">({t('optional')})</span>
                  </label>
                  <p className="text-xs text-charcoal-400 dark:text-charcoal-500 mb-2">{t('A separate PIN for caregiver access. Only caregivers should know this.')}</p>
                  <div className="flex justify-center gap-2">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className={`w-10 h-10 rounded-md flex items-center justify-center text-lg font-bold transition-all duration-200 ${
                        i < caregiverPin.length
                          ? 'bg-leaf text-ivory border-2 border-leaf scale-105'
                          : 'bg-transparent border-2 border-ink/20 text-ink/30'
                      }`}>
                        {i < caregiverPin.length ? '•' : ''}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 max-w-[200px] mx-auto mt-2">
                    {['1','2','3','4','5','6','7','8','9'].map(d => (
                      <button key={d} type="button" onClick={() => { if (caregiverPin.length < 4) setCaregiverPin(p => p + d) }}
                        className="h-10 rounded-md bg-transparent border-2 border-ink/15 text-sm font-bold text-ink hover:border-leaf hover:text-leaf active:translate-y-0.5 transition-all duration-150">
                        {d}
                      </button>
                    ))}
                    <div />
                    <button type="button" onClick={() => { if (caregiverPin.length < 4) setCaregiverPin(p => p + '0') }}
                      className="h-10 rounded-md bg-transparent border-2 border-ink/15 text-sm font-bold text-ink hover:border-leaf hover:text-leaf active:translate-y-0.5 transition-all duration-150">
                      0
                    </button>
                    <button type="button" onClick={() => setCaregiverPin(p => p.slice(0, -1))}
                      className="h-10 rounded-md bg-transparent border-2 border-ink/10 flex items-center justify-center text-ink/50 hover:border-ink/40 active:translate-y-0.5 transition-all duration-150">
                      <Delete size={14} />
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="error-msg bg-rose-50 border-2 border-rose-300 text-rose-700 text-sm rounded-lg px-4 py-3" role="alert">
                    {error}
                  </div>
                )}

                <div className="login-anim">
                  <button type="submit" disabled={loading || pin.length !== 4 || !name.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-ink text-ivory px-8 py-4 rounded-lg font-semibold text-lg hover:bg-leaf hover:border-leaf active:translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none border-2 border-ink">
                    {loading ? <div className="w-5 h-5 border-2 border-ivory/30 border-t-ivory rounded-full animate-spin" /> : <>{t('Get Started')}<ArrowRight size={18} /></>}
                  </button>
                </div>
              </form>

              <p className="text-center text-charcoal-400 dark:text-charcoal-500 text-base mt-8 login-anim">
                {t('Already have an account?')}{' '}
                <button onClick={() => { setMode('pin'); setError(''); setPin('') }}
                  className="text-leaf font-semibold underline decoration-leaf/40 underline-offset-4 hover:decoration-leaf transition-colors">
                  {t('Sign in with PIN')}
                </button>
              </p>

              {/* Judge demo — one tap into the controlled presentation */}
              <div className="mt-6 login-anim">
                <div className="flex items-center gap-3 mb-3">
                  <div className="aura-rule flex-1" />
                  <span className="aura-meta !text-[10px] text-ink/40">{t('for presenters')}</span>
                  <div className="aura-rule flex-1" />
                </div>
                <button
                  type="button"
                  onClick={enterDemo}
                  disabled={isDemo}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-ink/30 text-ink/70 hover:border-leaf hover:text-ink hover:bg-sagesoft/20 transition-all duration-200 disabled:opacity-50"
                >
                  <PlayCircle size={18} className="text-leaf" />
                  <span className="font-medium">{t('Start Judge Demo')}</span>
                  <span className="aura-meta !text-[10px] text-ink/40">· {t('Ravi — DEMO DATA')}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
