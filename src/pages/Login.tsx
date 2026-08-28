import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flower2, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import gsap from 'gsap'
import GlowOrbs from '../components/ui/GlowOrbs'
import PetalTree from '../components/ui/PetalTree'

export default function Login() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!formRef.current) return
    const els = formRef.current.querySelectorAll('.login-anim')
    gsap.fromTo(els,
      { opacity: 0, y: 30, filter: 'blur(6px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.08, ease: 'power3.out', delay: 0.2 }
    )
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      let result: { success: boolean; error?: string }
      if (mode === 'signup') {
        if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return }
        result = signup(name, email, password)
      } else {
        result = login(email, password)
      }
      if (result.success) {
        gsap.to(formRef.current, { opacity: 0, y: -20, duration: 0.3, onComplete: () => navigate('/') })
      } else {
        setError(result.error || 'Something went wrong.')
        gsap.fromTo(formRef.current?.querySelector('.error-msg') as HTMLElement,
          { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3 }
        )
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — liquid glass with orbs */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <PetalTree />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(251,207,232,0.2)]">
              <Flower2 size={30} />
            </div>
            <span className="text-3xl font-bold tracking-tight">AURA</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Every Memory<br />Matters.
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-md">
            An AI-powered cognitive and memory companion designed to keep minds engaged and families connected.
          </p>
          <div className="mt-12 flex gap-8">
            {[{ emoji: '🧠', label: '3 Games' }, { emoji: '🌸', label: 'AI Assistant' }, { emoji: '📊', label: 'Insights' }].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-white/70">
                <span className="text-xl">{item.emoji}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <GlowOrbs />
        <div ref={formRef} className="w-full max-w-md relative z-10">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden login-anim">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-400/80 to-forest-600/80 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.2)]">
              <Flower2 className="text-white" size={22} />
            </div>
            <span className="text-xl font-bold text-charcoal-800">AURA</span>
          </div>

          <h2 className="text-3xl font-bold text-charcoal-800 mb-2 login-anim">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-charcoal-400 mb-8 login-anim">
            {mode === 'login' ? 'Sign in to continue your cognitive journey.' : 'Join AURA to start your memory wellness journey.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div className="login-anim">
                <label className="text-sm font-medium text-charcoal-700 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/50 text-charcoal-800 placeholder-charcoal-300 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition-all shadow-[0_2px_12px_rgba(0,0,0,0.04)]" required />
                </div>
              </div>
            )}

            <div className="login-anim">
              <label className="text-sm font-medium text-charcoal-700 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/50 text-charcoal-800 placeholder-charcoal-300 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition-all shadow-[0_2px_12px_rgba(0,0,0,0.04)]" required />
              </div>
            </div>

            <div className="login-anim">
              <label className="text-sm font-medium text-charcoal-700 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-300" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters"
                  className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/50 text-charcoal-800 placeholder-charcoal-300 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition-all shadow-[0_2px_12px_rgba(0,0,0,0.04)]" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-300 hover:text-charcoal-500 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-msg bg-red-50/80 backdrop-blur-sm border border-red-200/60 text-red-600 text-sm rounded-2xl px-4 py-3">
                {error}
              </div>
            )}

            <div className="login-anim">
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-forest-500 to-forest-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{mode === 'login' ? 'Sign In' : 'Create Account'}<ArrowRight size={18} /></>}
              </button>
            </div>
          </form>

          <p className="text-center text-charcoal-400 text-sm mt-8 login-anim">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
              className="text-forest-600 font-medium hover:text-forest-700 transition-colors">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
