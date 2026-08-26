import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { X, User, Mail, Flower2, Heart, LogOut, Gamepad2, Brain, Mic, BarChart3, Shield, ExternalLink, ChevronRight } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useGameProgress } from '../../hooks/useGameProgress'

interface ProfileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileMenu({ isOpen, onClose }: ProfileMenuProps) {
  const { user, logout } = useAuth()
  const { sessions, getAverageAccuracy } = useGameProgress()
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
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      )
      tl.fromTo(panelRef.current,
        { x: '100%', backdropFilter: 'blur(0px)' },
        { x: '0%', backdropFilter: 'blur(40px)', duration: 0.5, ease: 'power3.out' },
        0
      )

      itemsRef.current.forEach((item, i) => {
        if (item) {
          tl.fromTo(item,
            { opacity: 0, x: 30, filter: 'blur(4px)' },
            { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.4, ease: 'power3.out' },
            0.25 + i * 0.05
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
    tl.to(panelRef.current, { x: '100%', duration: 0.35, ease: 'power3.in' })
    tl.to(overlayRef.current, { opacity: 0, duration: 0.2 }, 0.1)
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
        className="absolute inset-0 bg-charcoal-900/20 backdrop-blur-sm"
        onClick={handleClose}
        style={{ opacity: 0 }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="absolute top-0 right-0 bottom-0 w-[min(420px,100vw)] bg-white/70 backdrop-blur-3xl border-l border-white/50 shadow-[-10px_0_40px_rgba(0,0,0,0.08)] overflow-y-auto"
        style={{ transform: 'translateX(100%)' }}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div ref={el => { itemsRef.current[0] = el }} className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-charcoal-800">Profile</h2>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-xl bg-white/60 backdrop-blur-sm border border-white/50 flex items-center justify-center text-charcoal-400 hover:text-charcoal-700 hover:bg-white/80 transition-all duration-300"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Card */}
          <div ref={el => { itemsRef.current[1] = el }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-500 to-forest-600 p-6 text-white shadow-[0_8px_30px_rgba(74,124,74,0.25)]">
            <div className="absolute inset-0 opacity-10">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="absolute rounded-full bg-white" style={{
                  width: 4 + Math.random() * 8 + 'px', height: 4 + Math.random() * 8 + 'px',
                  left: Math.random() * 100 + '%', top: Math.random() * 100 + '%',
                }} />
              ))}
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-lg font-semibold">{user?.name || 'User'}</p>
                <p className="text-sm text-white/70 flex items-center gap-1.5 mt-0.5">
                  <Mail size={13} /> {user?.email || 'No email'}
                </p>
              </div>
            </div>
            <div className="relative z-10 grid grid-cols-3 gap-3 mt-5">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                <p className="text-xl font-bold">{sessions.length}</p>
                <p className="text-xs text-white/60 mt-0.5">Games Played</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                <p className="text-xl font-bold">{sessions.length > 0 ? `${getAverageAccuracy()}%` : '—'}</p>
                <p className="text-xs text-white/60 mt-0.5">Avg Accuracy</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                <p className="text-xl font-bold">{new Set(sessions.map(s => s.gameType)).size}</p>
                <p className="text-xs text-white/60 mt-0.5">Games Tried</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div ref={el => { itemsRef.current[2] = el }} className="space-y-2">
            <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider px-1">Quick Links</p>
            {[
              { icon: Gamepad2, label: 'Cognitive Games', path: '/games', desc: 'Play memory and recall games', color: 'bg-forest-50 text-forest-500' },
              { icon: Brain, label: 'Memory Assistant', path: '/assistant', desc: 'Reminders and memory prompts', color: 'bg-amber-50 text-amber-500' },
              { icon: BarChart3, label: 'Caregiver Dashboard', path: '/caregiver', desc: 'Activity insights and trends', color: 'bg-sage-50 text-sage-500' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => { handleClose(); setTimeout(() => navigate(item.path), 400) }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/40 hover:bg-white/80 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 text-left group"
              >
                <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal-800 text-sm">{item.label}</p>
                  <p className="text-xs text-charcoal-400 mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight size={16} className="text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>

          {/* About AURA */}
          <div ref={el => { itemsRef.current[3] = el }} className="space-y-3">
            <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider px-1">About AURA</p>
            <div className="rounded-3xl bg-white/50 backdrop-blur-sm border border-white/40 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-400/80 to-forest-600/80 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-[0_0_12px_rgba(74,124,74,0.15)]">
                  <Flower2 size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-charcoal-800">AURA NER</p>
                  <p className="text-xs text-charcoal-400">v1.0.0 · Prototype</p>
                </div>
              </div>
              <p className="text-sm text-charcoal-500 leading-relaxed">
                AI-powered cognitive gaming and memory assistance platform designed for elderly people
                experiencing memory difficulties, with caregivers and family as secondary users.
              </p>
              <div className="space-y-2">
                {[
                  { icon: Gamepad2, text: '3 cognitive games with adaptive difficulty' },
                  { icon: Mic, text: 'Voice-enabled AI memory assistant' },
                  { icon: BarChart3, text: 'Caregiver dashboard with real insights' },
                  { icon: Brain, text: 'AI-assisted personalization engine' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-charcoal-500">
                    <feature.icon size={14} className="text-forest-400 flex-shrink-0" />
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div ref={el => { itemsRef.current[4] = el }} className="rounded-3xl bg-white/50 backdrop-blur-sm border border-white/40 p-5">
            <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-3">Built With</p>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Three.js', 'GSAP', 'Tailwind CSS', 'Recharts'].map((tech) => (
                <span key={tech} className="text-xs px-2.5 py-1 rounded-lg bg-cream-100/80 text-charcoal-500 border border-cream-200/60">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div ref={el => { itemsRef.current[5] = el }} className="rounded-2xl bg-amber-50/60 border border-amber-100/60 p-4">
            <div className="flex items-start gap-2.5">
              <Shield size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-charcoal-500 leading-relaxed">
                <strong className="text-charcoal-600">Medical Disclaimer:</strong> AURA is a support platform prototype.
                It is not a diagnostic tool, dementia severity detector, or replacement for medical professionals.
              </p>
            </div>
          </div>

          {/* Logout */}
          <div ref={el => { itemsRef.current[6] = el }}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl border-2 border-red-200/60 text-red-500 hover:bg-red-50/60 hover:border-red-300/60 transition-all duration-300 font-medium"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>

          {/* Footer */}
          <div ref={el => { itemsRef.current[7] = el }} className="text-center pb-4">
            <p className="text-xs text-charcoal-300 flex items-center justify-center gap-1">
              Made with <Heart size={10} className="text-red-400" /> for memory that matters
            </p>
            <p className="text-xs text-charcoal-300 mt-1">AURA NER © 2024</p>
          </div>
        </div>
      </div>
    </div>
  )
}
