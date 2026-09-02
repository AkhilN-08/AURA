import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flower2, User, ArrowRight, Delete } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import gsap from 'gsap'
import GlowOrbs from '../components/ui/GlowOrbs'
import PetalTree from '../components/ui/PetalTree'

export default function Login() {
  const [mode, setMode] = useState<'pin' | 'signup'>('pin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [caregiverPin, setCaregiverPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, signup, pinLogin, hasPin, user } = useAuth()
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
    <div className="min-h-screen flex">
      {/* Left panel — petal tree */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <PetalTree />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(251,207,232,0.2)]">
              <Flower2 size={30} />
            </div>
            <span className="text-3xl font-bold tracking-tight">AURA-NER</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Every Memory<br />Matters.
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-md">
            An AI-powered cognitive and memory companion designed to keep minds engaged and families connected.
          </p>
          <div className="mt-12 flex gap-8">
            {[{ emoji: '🧠', label: '7 Games' }, { emoji: '🌸', label: 'AI Assistant' }, { emoji: '📊', label: 'Insights' }].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-white/70">
                <span className="text-xl">{item.emoji}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative dark:bg-[#0f0f1a]">
        <GlowOrbs />
        <div ref={formRef} className="w-full max-w-md relative z-10">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden login-anim">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-400/80 to-sage-600/80 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-[0_0_16px_rgba(236,72,153,0.2)]">
              <Flower2 className="text-white" size={22} />
            </div>
            <span className="text-xl font-bold text-charcoal-800 dark:text-white">AURA-NER</span>
          </div>

          {mode === 'pin' ? (
            <>
              <h2 className="text-3xl font-bold text-charcoal-800 dark:text-white mb-2 login-anim">
                {t('Welcome back')}
              </h2>
              <p className="text-charcoal-400 dark:text-charcoal-300 mb-8 login-anim">
                {t('Enter your 4-digit PIN to continue.')}
              </p>

              {/* PIN display */}
              <div className="flex justify-center gap-4 mb-8 login-anim">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all duration-200 ${
                    i < pin.length
                      ? 'bg-sage-500 text-white scale-110 shadow-lg'
                      : 'bg-white/40 dark:bg-white/10 border-2 border-white/40 dark:border-white/10 text-charcoal-300'
                  }`}>
                    {i < pin.length ? '•' : ''}
                  </div>
                ))}
              </div>

              {error && (
                <div className="error-msg bg-red-50/80 dark:bg-red-900/30 backdrop-blur-sm border border-red-200/60 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-2xl px-4 py-3 mb-4 text-center">
                  {error}
                </div>
              )}

              {/* Number pad */}
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto login-anim">
                {['1','2','3','4','5','6','7','8','9'].map(d => (
                  <button key={d} onClick={() => addDigit(d)}
                    className="h-16 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-white/40 dark:border-white/10 text-2xl font-bold text-charcoal-800 dark:text-white hover:bg-white/80 dark:hover:bg-white/20 active:scale-95 transition-all duration-150">
                    {d}
                  </button>
                ))}
                <div />
                <button onClick={() => addDigit('0')}
                  className="h-16 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-white/40 dark:border-white/10 text-2xl font-bold text-charcoal-800 dark:text-white hover:bg-white/80 dark:hover:bg-white/20 active:scale-95 transition-all duration-150">
                  0
                </button>
                <button onClick={removeDigit}
                  className="h-16 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/30 dark:border-white/10 flex items-center justify-center text-charcoal-400 hover:bg-white/60 dark:hover:bg-white/10 active:scale-95 transition-all duration-150">
                  <Delete size={22} />
                </button>
              </div>

              {loading && (
                <div className="flex justify-center mt-6">
                  <div className="w-6 h-6 border-2 border-sage-400/30 border-t-sage-500 rounded-full animate-spin" />
                </div>
              )}

              <p className="text-center text-charcoal-400 dark:text-charcoal-500 text-sm mt-8 login-anim">
                {t("Don't have an account?")}{' '}
                <button onClick={() => { setMode('signup'); setError(''); setPin('') }}
                  className="text-sage-600 font-medium hover:text-sage-700 transition-colors">
                  {t('Sign up')}
                </button>
              </p>
            </>
          ) : (
            /* Signup mode */
            <>
              <h2 className="text-3xl font-bold text-charcoal-800 dark:text-white mb-2 login-anim">
                {t('Create your account')}
              </h2>
              <p className="text-charcoal-400 dark:text-charcoal-300 mb-8 login-anim">
                {t('Set up AURA-NER with a simple 4-digit PIN.')}
              </p>

              <form onSubmit={handleSignupSubmit} className="space-y-5">
                <div className="login-anim">
                  <label className="text-sm font-medium text-charcoal-700 dark:text-charcoal-200 mb-1.5 block">Your Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300 dark:text-charcoal-500" />
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="What should we call you?"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/50 dark:border-white/10 text-charcoal-800 dark:text-white placeholder-charcoal-300 dark:placeholder-charcoal-600 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition-all shadow-[0_2px_12px_rgba(0,0,0,0.04)]" required />
                  </div>
                </div>

                {/* PIN setup */}
                <div className="login-anim">
                  <label className="text-sm font-medium text-charcoal-700 dark:text-charcoal-200 mb-3 block">Choose a 4-digit PIN</label>
                  <div className="flex justify-center gap-3 mb-4">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-200 ${
                        i < pin.length
                          ? 'bg-sage-500 text-white scale-110'
                          : 'bg-white/40 dark:bg-white/10 border-2 border-white/40 dark:border-white/10 text-charcoal-300'
                      }`}>
                        {i < pin.length ? '•' : ''}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
                    {['1','2','3','4','5','6','7','8','9'].map(d => (
                      <button key={d} type="button" onClick={() => { if (pin.length < 4) setPin(p => p + d) }}
                        className="h-12 rounded-xl bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/10 text-lg font-bold text-charcoal-800 dark:text-white hover:bg-white/80 dark:hover:bg-white/20 active:scale-95 transition-all duration-150">
                        {d}
                      </button>
                    ))}
                    <div />
                    <button type="button" onClick={() => { if (pin.length < 4) setPin(p => p + '0') }}
                      className="h-12 rounded-xl bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/10 text-lg font-bold text-charcoal-800 dark:text-white hover:bg-white/80 dark:hover:bg-white/20 active:scale-95 transition-all duration-150">
                      0
                    </button>
                    <button type="button" onClick={() => setPin(p => p.slice(0, -1))}
                      className="h-12 rounded-xl bg-white/40 dark:bg-white/5 border border-white/30 dark:border-white/10 flex items-center justify-center text-charcoal-400 hover:bg-white/60 dark:hover:bg-white/10 active:scale-95 transition-all duration-150">
                      <Delete size={18} />
                    </button>
                  </div>
                </div>

                {/* Caregiver PIN (optional) */}
                <div className="login-anim">
                  <label className="text-sm font-medium text-charcoal-700 dark:text-charcoal-200 mb-1.5 block">
                    Caregiver PIN <span className="text-charcoal-400 font-normal">(optional)</span>
                  </label>
                  <p className="text-xs text-charcoal-400 dark:text-charcoal-500 mb-2">A separate PIN for caregiver access. Only caregivers should know this.</p>
                  <div className="flex justify-center gap-2">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold transition-all duration-200 ${
                        i < caregiverPin.length
                          ? 'bg-blue-500 text-white scale-110'
                          : 'bg-white/30 dark:bg-white/5 border-2 border-white/30 dark:border-white/10 text-charcoal-300'
                      }`}>
                        {i < caregiverPin.length ? '•' : ''}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 max-w-[200px] mx-auto mt-2">
                    {['1','2','3','4','5','6','7','8','9'].map(d => (
                      <button key={d} type="button" onClick={() => { if (caregiverPin.length < 4) setCaregiverPin(p => p + d) }}
                        className="h-10 rounded-lg bg-white/40 dark:bg-white/5 border border-white/30 dark:border-white/10 text-sm font-bold text-charcoal-700 dark:text-white hover:bg-white/60 dark:hover:bg-white/10 active:scale-95 transition-all duration-150">
                        {d}
                      </button>
                    ))}
                    <div />
                    <button type="button" onClick={() => { if (caregiverPin.length < 4) setCaregiverPin(p => p + '0') }}
                      className="h-10 rounded-lg bg-white/40 dark:bg-white/5 border border-white/30 dark:border-white/10 text-sm font-bold text-charcoal-700 dark:text-white hover:bg-white/60 dark:hover:bg-white/10 active:scale-95 transition-all duration-150">
                      0
                    </button>
                    <button type="button" onClick={() => setCaregiverPin(p => p.slice(0, -1))}
                      className="h-10 rounded-lg bg-white/40 dark:bg-white/5 border border-white/30 dark:border-white/10 flex items-center justify-center text-charcoal-400 hover:bg-white/60 dark:hover:bg-white/10 active:scale-95 transition-all duration-150">
                      <Delete size={14} />
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="error-msg bg-red-50/80 dark:bg-red-900/30 backdrop-blur-sm border border-red-200/60 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-2xl px-4 py-3">
                    {error}
                  </div>
                )}

                <div className="login-anim">
                  <button type="submit" disabled={loading || pin.length !== 4 || !name.trim()}
                    className="w-full flex items-center justify-center gap-2 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 bg-gradient-to-r from-sage-400 to-sage-600 shadow-[0_0_20px_rgba(132,204,22,0.25)] hover:shadow-[0_0_30px_rgba(132,204,22,0.4)]">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{t('Get Started')}<ArrowRight size={18} /></>}
                  </button>
                </div>
              </form>

              <p className="text-center text-charcoal-400 dark:text-charcoal-500 text-sm mt-8 login-anim">
                {t('Already have an account?')}{' '}
                <button onClick={() => { setMode('pin'); setError(''); setPin('') }}
                  className="text-sage-600 font-medium hover:text-sage-700 transition-colors">
                  {t('Sign in with PIN')}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
