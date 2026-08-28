import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { X, Mail, Flower2, Heart, LogOut, Gamepad2, Brain, Mic, BarChart3, Shield, ChevronRight, Moon, Sun } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useGameProgress } from '../../hooks/useGameProgress'
import { useTranslation } from '../../hooks/useTranslation'
import { useGenderTheme } from '../../hooks/useGenderTheme'
import { useDarkMode } from '../../hooks/useDarkMode'

interface ProfileMenuProps {
  isOpen: boolean
  onClose: () => void
}

/** Liquid glass card wrapper */
function LiquidCard({ children, className = '', glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) {
  return (
    <div className={`relative group ${className}`}>
      {/* Liquid glass background */}
      <div className="relative overflow-hidden rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        {/* Liquid highlight shimmer */}
        {glow && (
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute -top-1/2 -left-1/4 w-[200%] h-[100%] bg-gradient-to-br from-white/40 via-transparent to-transparent rotate-12" />
          </div>
        )}
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function ProfileMenu({ isOpen, onClose }: ProfileMenuProps) {
  const { user, logout } = useAuth()
  const { sessions, getAverageAccuracy } = useGameProgress()
  const { language, setLanguage, t } = useTranslation()
  const { gender, setGender } = useGenderTheme()
  const { isDark, toggle: toggleDark } = useDarkMode()
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    if (!panelRef.current || !overlayRef.current) return

    if (isOpen) {
      document.body.style.overflow = 'hidden'

      const tl = gsap.timeline()

      tl.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' }
      )
      tl.fromTo(panelRef.current,
        { x: '100%', backdropFilter: 'blur(0px)' },
        { x: '0%', backdropFilter: 'blur(60px)', duration: 0.6, ease: 'power3.out' },
        0
      )

      itemsRef.current.forEach((item, i) => {
        if (item) {
          tl.fromTo(item,
            { opacity: 0, y: 20, filter: 'blur(4px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out' },
            0.2 + i * 0.05
          )
        }
      })
    } else {
      document.body.style.overflow = ''
    }

    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleClose = () => {
    if (!panelRef.current || !overlayRef.current) { onClose(); return }

    const tl = gsap.timeline({ onComplete: onClose })
    tl.to(panelRef.current, { x: '100%', duration: 0.35, ease: 'power2.in' })
    tl.to(overlayRef.current, { opacity: 0, duration: 0.25 }, 0.1)
  }

  const handleLogout = () => {
    handleClose()
    setTimeout(() => {
      logout()
      navigate('/login')
    }, 400)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-charcoal-900/30 dark:bg-black/50 backdrop-blur-md"
        onClick={handleClose}
        style={{ opacity: 0 }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="absolute top-0 right-0 bottom-0 w-[min(520px,100vw)] bg-white/30 dark:bg-[#0d0d1a]/80 backdrop-blur-[60px] border-l border-white/40 dark:border-white/8 shadow-[-20px_0_60px_rgba(0,0,0,0.1)] overflow-y-auto"
        style={{ transform: 'translateX(100%)' }}
      >
        <div className="p-8 space-y-5">
          {/* Header */}
          <div ref={el => { itemsRef.current[0] = el }} className="flex items-center justify-between pb-2">
            <div>
              <h2 className="text-2xl font-bold text-charcoal-800 dark:text-white tracking-tight">Profile</h2>
              <p className="text-xs text-charcoal-400 dark:text-charcoal-500 mt-1">Manage your preferences</p>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-white/50 dark:border-white/10 flex items-center justify-center text-charcoal-400 hover:text-charcoal-700 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Card — liquid glass hero */}
          <div ref={el => { itemsRef.current[1] = el }}>
            <LiquidCard glow>
              <div className="p-6 space-y-5">
                {/* Gradient header strip */}
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-sage-500 via-sage-400 to-sage-600 opacity-90 rounded-t-3xl" />
                <div className="relative z-10 flex items-center gap-4 pt-2">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-2xl font-bold shadow-[0_0_24px_rgba(255,255,255,0.15)]">
                    {user?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white drop-shadow-sm">{user?.name || 'User'}</p>
                    <p className="text-sm text-white/70 flex items-center gap-1.5 mt-0.5">
                      <Mail size={13} /> {user?.email || 'No email'}
                    </p>
                  </div>
                </div>
                {/* Stats row */}
                <div className="relative z-10 grid grid-cols-3 gap-3">
                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/15 hover:bg-white/20 transition-all duration-300">
                    <p className="text-2xl font-bold">{sessions.length}</p>
                    <p className="text-[11px] text-white/60 mt-1 font-medium">Games Played</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/15 hover:bg-white/20 transition-all duration-300">
                    <p className="text-2xl font-bold">{sessions.length > 0 ? `${getAverageAccuracy()}%` : '—'}</p>
                    <p className="text-[11px] text-white/60 mt-1 font-medium">Avg Accuracy</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/15 hover:bg-white/20 transition-all duration-300">
                    <p className="text-2xl font-bold">{new Set(sessions.map(s => s.gameType)).size}</p>
                    <p className="text-[11px] text-white/60 mt-1 font-medium">Games Tried</p>
                  </div>
                </div>
              </div>
            </LiquidCard>
          </div>

          {/* Quick Actions */}
          <div ref={el => { itemsRef.current[2] = el }}>
            <LiquidCard>
              <div className="p-5 space-y-3">
                <p className="text-[11px] font-bold text-charcoal-400 dark:text-charcoal-500 uppercase tracking-widest px-1">Quick Links</p>
                {[
                  { icon: Gamepad2, label: 'Cognitive Games', path: '/games', desc: '7 memory and recall games', color: 'bg-sage-50 dark:bg-sage-500/10 text-sage-500', iconColor: 'text-sage-500' },
                  { icon: Brain, label: 'Memory Assistant', path: '/assistant', desc: 'Reminders and voice prompts', color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-500', iconColor: 'text-amber-500' },
                  { icon: BarChart3, label: 'Caregiver Dashboard', path: '/caregiver', desc: 'Activity insights and trends', color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-500', iconColor: 'text-blue-500' },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => { handleClose(); setTimeout(() => navigate(item.path), 400) }}
                    className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-white/60 dark:hover:bg-white/5 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] text-left group"
                  >
                    <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon size={20} className={item.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-charcoal-800 dark:text-white text-sm">{item.label}</p>
                      <p className="text-xs text-charcoal-400 dark:text-charcoal-500 mt-0.5">{item.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-charcoal-300 dark:text-charcoal-600 group-hover:text-charcoal-500 group-hover:translate-x-1 transition-all duration-300" />
                  </button>
                ))}
              </div>
            </LiquidCard>
          </div>

          {/* Settings Grid — Language + Theme + Dark Mode */}
          <div ref={el => { itemsRef.current[3] = el }}>
            <LiquidCard glow>
              <div className="p-5 space-y-5">
                {/* Language */}
                <div>
                  <p className="text-[11px] font-bold text-charcoal-400 dark:text-charcoal-500 uppercase tracking-widest mb-3">Language</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLanguage('en')}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border-2 ${
                        language === 'en'
                          ? 'bg-sage-500 text-white border-sage-500 shadow-md shadow-sage-200/50'
                          : 'bg-white/50 dark:bg-white/5 text-charcoal-600 dark:text-charcoal-300 border-white/50 dark:border-white/10 hover:border-sage-300 dark:hover:border-sage-500/30'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setLanguage('hi')}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border-2 ${
                        language === 'hi'
                          ? 'bg-sage-500 text-white border-sage-500 shadow-md shadow-sage-200/50'
                          : 'bg-white/50 dark:bg-white/5 text-charcoal-600 dark:text-charcoal-300 border-white/50 dark:border-white/10 hover:border-sage-300 dark:hover:border-sage-500/30'
                      }`}
                    >
                      हिंदी
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-charcoal-200/40 dark:via-white/10 to-transparent" />

                {/* Theme */}
                <div>
                  <p className="text-[11px] font-bold text-charcoal-400 dark:text-charcoal-500 uppercase tracking-widest mb-3">Theme Preference</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setGender('male')}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border-2 flex items-center justify-center gap-2 ${
                        gender === 'male'
                          ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-200/50'
                          : 'bg-white/50 dark:bg-white/5 text-charcoal-600 dark:text-charcoal-300 border-white/50 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30'
                      }`}
                    >
                      👨 Male
                    </button>
                    <button
                      onClick={() => setGender('female')}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border-2 flex items-center justify-center gap-2 ${
                        gender === 'female'
                          ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-200/50'
                          : 'bg-white/50 dark:bg-white/5 text-charcoal-600 dark:text-charcoal-300 border-white/50 dark:border-white/10 hover:border-pink-300 dark:hover:border-pink-500/30'
                      }`}
                    >
                      👩 Female
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-charcoal-200/40 dark:via-white/10 to-transparent" />

                {/* Dark Mode */}
                <button
                  onClick={toggleDark}
                  className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-300 text-left group"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    isDark
                      ? 'bg-indigo-900/60 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                      : 'bg-amber-50 dark:bg-amber-500/10 text-amber-500'
                  }`}>
                    {isDark ? <Moon size={20} /> : <Sun size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-charcoal-800 dark:text-white text-sm">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
                    <p className="text-xs text-charcoal-400 dark:text-charcoal-500 mt-0.5">
                      {isDark ? 'Easier on the eyes in low light' : 'Switch to a darker theme'}
                    </p>
                  </div>
                  <div className={`w-12 h-7 rounded-full flex items-center transition-all duration-300 ${
                    isDark ? 'bg-indigo-500 justify-end' : 'bg-charcoal-200 dark:bg-charcoal-700 justify-start'
                  }`}>
                    <div className="w-5 h-5 bg-white rounded-full mx-1 shadow-sm" />
                  </div>
                </button>
              </div>
            </LiquidCard>
          </div>

          {/* About AURA-NER */}
          <div ref={el => { itemsRef.current[4] = el }}>
            <LiquidCard>
              <div className="p-5 space-y-4">
                <p className="text-[11px] font-bold text-charcoal-400 dark:text-charcoal-500 uppercase tracking-widest px-1">About AURA-NER</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sage-400/80 to-sage-600/80 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-[0_0_16px_rgba(236,72,153,0.15)]">
                    <Flower2 size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal-800 dark:text-white text-sm">AURA-NER</p>
                    <p className="text-[11px] text-charcoal-400 dark:text-charcoal-500">v1.0.0 · Prototype</p>
                  </div>
                </div>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400 leading-relaxed">
                  AI-powered cognitive gaming and memory assistance for elderly people in the North Eastern Region, with caregivers and family as secondary users.
                </p>
                <div className="space-y-2.5">
                  {[
                    { icon: Gamepad2, text: '7 cognitive games with adaptive difficulty' },
                    { icon: Mic, text: 'Voice-enabled AI memory assistant' },
                    { icon: BarChart3, text: 'Caregiver dashboard with real insights' },
                    { icon: Brain, text: 'AI-assisted personalization engine' },
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-charcoal-500 dark:text-charcoal-400">
                      <feature.icon size={14} className="text-sage-400 flex-shrink-0" />
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </LiquidCard>
          </div>

          {/* Tech Stack */}
          <div ref={el => { itemsRef.current[5] = el }}>
            <LiquidCard>
              <div className="p-5">
                <p className="text-[11px] font-bold text-charcoal-400 dark:text-charcoal-500 uppercase tracking-widest mb-3">Built With</p>
                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Three.js', 'GSAP', 'Tailwind CSS', 'Recharts'].map((tech) => (
                    <span key={tech} className="text-[11px] px-3 py-1.5 rounded-lg bg-white/50 dark:bg-white/5 text-charcoal-500 dark:text-charcoal-400 border border-white/50 dark:border-white/10 font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </LiquidCard>
          </div>

          {/* Medical Disclaimer */}
          <div ref={el => { itemsRef.current[6] = el }}>
            <div className="rounded-2xl bg-amber-50/40 dark:bg-amber-500/5 border border-amber-200/40 dark:border-amber-500/10 p-4">
              <div className="flex items-start gap-3">
                <Shield size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-charcoal-500 dark:text-charcoal-400 leading-relaxed">
                  <strong className="text-charcoal-600 dark:text-charcoal-300">Medical Disclaimer:</strong> AURA-NER is a support platform prototype.
                  It is not a diagnostic tool or replacement for medical professionals.
                </p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div ref={el => { itemsRef.current[7] = el }}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl border-2 border-red-200/50 dark:border-red-500/15 text-red-500 hover:bg-red-50/60 dark:hover:bg-red-500/10 hover:border-red-300/60 transition-all duration-300 font-medium"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>

          {/* Footer */}
          <div ref={el => { itemsRef.current[8] = el }} className="text-center pb-6 pt-2">
            <p className="text-xs text-charcoal-300 dark:text-charcoal-600 flex items-center justify-center gap-1">
              Made with <Heart size={10} className="text-sage-400" /> for memory that matters
            </p>
            <p className="text-xs text-charcoal-300 dark:text-charcoal-600 mt-1">AURA-NER © 2024 · <span className="text-sage-400 font-medium">Developed by Team OriginX</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
