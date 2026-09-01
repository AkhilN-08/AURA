import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { useState, useEffect as useEff } from 'react'
import { X, Mail, Flower2, Heart, LogOut, Gamepad2, Brain, Mic, BarChart3, Shield, ChevronRight, Moon, Sun, Eye, Users } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useGameProgress } from '../../hooks/useGameProgress'
import { useTranslation } from '../../hooks/useTranslation'
import { useDarkMode } from '../../hooks/useDarkMode'
import { useElderMode } from '../../hooks/useElderMode'
import { playTapSound } from '../../utils/audio'

interface ProfileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileMenu({ isOpen, onClose }: ProfileMenuProps) {
  const { user, logout } = useAuth()
  const { sessions, getAverageAccuracy } = useGameProgress()
  const { language, setLanguage, t } = useTranslation()
  const { isDark, toggle: toggleDark } = useDarkMode()
  const { elderMode, setElderMode } = useElderMode()
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
        { opacity: 1, duration: 0.35, ease: 'power2.out' }
      )
      tl.fromTo(panelRef.current,
        { x: '100%' },
        { x: '0%', duration: 0.5, ease: 'power3.out' },
        0
      )

      itemsRef.current.forEach((item, i) => {
        if (item) {
          tl.fromTo(item,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
            0.15 + i * 0.04
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
    tl.to(panelRef.current, { x: '100%', duration: 0.3, ease: 'power2.in' })
    tl.to(overlayRef.current, { opacity: 0, duration: 0.2 }, 0.08)
  }

  const handleLogout = () => {
    handleClose()
    setTimeout(() => { logout(); navigate('/login') }, 350)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay — pure blur, no color */}
      <div
        ref={overlayRef}
        className="absolute inset-0 backdrop-blur-xl bg-black/20 dark:bg-black/40"
        onClick={handleClose}
        style={{ opacity: 0 }}
      />

      {/* Panel — iOS liquid glass: fully transparent, pure blur */}
      <div
        ref={panelRef}
        className="absolute top-0 right-0 bottom-0 w-[min(460px,100vw)] backdrop-blur-[80px] bg-white/10 dark:bg-white/[0.04] border-l border-white/20 dark:border-white/[0.08] overflow-y-auto overscroll-contain"
        style={{
          transform: 'translateX(100%)',
          boxShadow: '-1px 0 0 rgba(255,255,255,0.15)',
        }}
      >
        <div className="p-7 pb-10 space-y-6">
          {/* Header */}
          <div ref={el => { itemsRef.current[0] = el }} className="flex items-center justify-between">
            <h2 className="text-[22px] font-semibold text-charcoal-900 dark:text-white/95 tracking-[-0.02em]">Profile</h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/15 dark:bg-white/10 flex items-center justify-center text-charcoal-500 dark:text-white/50 hover:bg-white/25 dark:hover:bg-white/15 transition-all duration-200"
              aria-label="Close"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* User Card — transparent glass with gradient accent */}
          <div ref={el => { itemsRef.current[1] = el }}>
            <div className="rounded-[20px] bg-white/15 dark:bg-white/[0.06] backdrop-blur-xl border border-white/25 dark:border-white/[0.08] p-5">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-sage-500/20">
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[17px] font-semibold text-charcoal-900 dark:text-white/95 truncate">{user?.name || 'User'}</p>
                  <p className="text-[13px] text-charcoal-600 dark:text-white/60 truncate flex items-center gap-1.5 mt-0.5">
                    <Mail size={12} /> {user?.email || 'No email'}
                  </p>
                </div>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { value: sessions.length, label: 'Played' },
                  { value: sessions.length > 0 ? `${getAverageAccuracy()}%` : '—', label: 'Accuracy' },
                  { value: new Set(sessions.map(s => s.gameType)).size, label: 'Types' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/10 dark:bg-white/[0.04] rounded-[14px] p-3 text-center border border-white/10 dark:border-white/[0.05]">
                    <p className="text-[18px] font-semibold text-charcoal-900 dark:text-white/90">{stat.value}</p>
                    <p className="text-[11px] text-charcoal-600 dark:text-white/55 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links — iOS list style */}
          <div ref={el => { itemsRef.current[2] = el }}>
            <div className="rounded-[20px] bg-white/15 dark:bg-white/[0.06] backdrop-blur-xl border border-white/25 dark:border-white/[0.08] overflow-hidden">
              {[
                { icon: Gamepad2, label: 'Cognitive Games', path: '/games', iconBg: 'rgba(236,72,153,0.15)', iconColor: '#EC4899' },
                { icon: Brain, label: 'Memory Assistant', path: '/assistant', iconBg: 'rgba(249,115,22,0.15)', iconColor: '#F97316' },
                { icon: BarChart3, label: 'Caregiver Dashboard', path: '/caregiver', iconBg: 'rgba(59,130,246,0.15)', iconColor: '#3B82F6' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => { handleClose(); setTimeout(() => navigate(item.path), 350) }}
                  className={`w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-white/10 dark:hover:bg-white/[0.04] transition-all duration-200 text-left group ${i !== 0 ? 'border-t border-white/10 dark:border-white/[0.05]' : ''}`}
                >
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: item.iconBg }}>
                    <item.icon size={18} style={{ color: item.iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-charcoal-900 dark:text-white/90">{item.label}</p>
                  </div>
                  <ChevronRight size={16} className="text-charcoal-600/90 dark:text-white/55 group-hover:text-charcoal-500 dark:group-hover:text-white/40 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Settings — iOS grouped list */}
          <div ref={el => { itemsRef.current[3] = el }}>
            <div className="rounded-[20px] bg-white/15 dark:bg-white/[0.06] backdrop-blur-xl border border-white/25 dark:border-white/[0.08] overflow-hidden">
              {/* Language */}
              <div className="px-5 pt-4 pb-3">
                <p className="text-[11px] font-semibold text-charcoal-700 dark:text-white/60 uppercase tracking-wider mb-2.5">Language</p>
                <div className="flex gap-2">
                  {[
                    { key: 'en' as const, label: 'English' },
                    { key: 'hi' as const, label: 'हिंदी' },
                  ].map(lang => (
                    <button
                      key={lang.key}
                      onClick={() => setLanguage(lang.key)}
                      className={`flex-1 py-2.5 rounded-[10px] text-[13px] font-medium transition-all duration-200 ${
                        language === lang.key
                          ? 'bg-white/20 dark:bg-white/10 text-charcoal-900 dark:text-white/95 border border-white/30 dark:border-white/15'
                          : 'text-charcoal-700 dark:text-white/55 hover:bg-white/10 dark:hover:bg-white/[0.04] border border-transparent'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mx-5 h-px bg-white/10 dark:bg-white/[0.05]" />

              {/* View Mode */}
              <div className="px-5 py-3">
                <p className="text-[11px] font-semibold text-charcoal-700 dark:text-white/60 uppercase tracking-wider mb-2.5">View Mode</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { playTapSound(); setElderMode(true) }}
                    className={`flex-1 py-2.5 rounded-[10px] text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all duration-200 ${
                      elderMode
                        ? 'bg-sage-500/20 text-sage-600 dark:text-sage-400 border border-sage-500/30'
                        : 'text-charcoal-700 dark:text-white/55 hover:bg-white/10 dark:hover:bg-white/[0.04] border border-transparent'
                    }`}>
                    <Eye size={14} /> Elder
                  </button>
                  <button
                    onClick={() => { playTapSound(); setElderMode(false) }}
                    className={`flex-1 py-2.5 rounded-[10px] text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all duration-200 ${
                      !elderMode
                        ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                        : 'text-charcoal-700 dark:text-white/55 hover:bg-white/10 dark:hover:bg-white/[0.04] border border-transparent'
                    }`}>
                    <Users size={14} /> Adult
                  </button>
                </div>
              </div>

              <div className="mx-5 h-px bg-white/10 dark:bg-white/[0.05]" />

              {/* Dark Mode */}                <button
                  onClick={() => { playTapSound(); toggleDark() }}
                  className="w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-white/10 dark:hover:bg-white/[0.04] transition-all duration-200 text-left"
                >
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)' }}>
                  {isDark ? <Moon size={18} style={{ color: '#818CF8' }} /> : <Sun size={18} style={{ color: '#F59E0B' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-charcoal-900 dark:text-white/90">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
                </div>
                <div className={`w-[46px] h-[28px] rounded-full flex items-center transition-all duration-300 ${isDark ? 'bg-sage-500 justify-end' : 'bg-charcoal-300/40 dark:bg-white/15 justify-start'}`}>
                  <div className="w-[22px] h-[22px] bg-white rounded-full mx-[3px] shadow-sm" />
                </div>
              </button>
            </div>
          </div>

          {/* About */}
          <div ref={el => { itemsRef.current[4] = el }}>
            <div className="rounded-[20px] bg-white/15 dark:bg-white/[0.06] backdrop-blur-xl border border-white/25 dark:border-white/[0.08] p-5">
              <p className="text-[11px] font-semibold text-charcoal-700 dark:text-white/60 uppercase tracking-wider mb-3">About AURA-NER</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center shadow-lg shadow-sage-500/15">
                  <Flower2 size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-charcoal-900 dark:text-white/90">AURA-NER</p>
                  <p className="text-[11px] text-charcoal-700 dark:text-white/60">v1.0.0</p>
                </div>
              </div>
              <p className="text-[13px] text-charcoal-700 dark:text-white/60 leading-relaxed mb-3">
                AI-powered cognitive gaming and memory assistance for elderly people in the North Eastern Region.
              </p>
              <div className="space-y-2">
                {[
                  { icon: Gamepad2, text: '7 cognitive games' },
                  { icon: Mic, text: 'Voice AI assistant' },
                  { icon: BarChart3, text: 'Caregiver insights' },
                  { icon: Brain, text: 'AI personalization' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[13px] text-charcoal-700 dark:text-white/60">
                    <f.icon size={13} style={{ color: '#EC4899' }} />
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div ref={el => { itemsRef.current[5] = el }}>
            <div className="rounded-[20px] bg-white/15 dark:bg-white/[0.06] backdrop-blur-xl border border-white/25 dark:border-white/[0.08] p-4">
              <div className="flex flex-wrap gap-1.5">
                {['React', 'TypeScript', 'Three.js', 'GSAP', 'Tailwind', 'Recharts'].map(tech => (
                  <span key={tech} className="text-[11px] px-2.5 py-1 rounded-[8px] bg-white/10 dark:bg-white/[0.04] text-charcoal-700 dark:text-white/55 border border-white/10 dark:border-white/[0.05]">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div ref={el => { itemsRef.current[6] = el }} className="rounded-[16px] bg-amber-500/[0.06] dark:bg-amber-500/[0.04] border border-amber-500/10 px-4 py-3">
            <div className="flex items-start gap-2.5">
              <Shield size={14} className="text-amber-500/70 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-charcoal-700 dark:text-white/55 leading-relaxed">
                <strong className="text-charcoal-700 dark:text-white/60">Disclaimer:</strong> AURA-NER is a support prototype, not a medical tool.
              </p>
            </div>
          </div>

          {/* Logout */}
          <div ref={el => { itemsRef.current[7] = el }}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[14px] text-red-500/80 dark:text-red-400/70 hover:bg-red-500/[0.08] dark:hover:bg-red-500/[0.06] transition-all duration-200 text-[14px] font-medium border border-red-500/10 dark:border-red-500/[0.06]"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>

          {/* Footer */}
          <div ref={el => { itemsRef.current[8] = el }} className="text-center pt-1 pb-2">
            <p className="text-[11px] text-charcoal-500 dark:text-white/40">
              Made with <Heart size={9} className="inline text-sage-400" /> for memory that matters
            </p>
            <p className="text-[11px] text-charcoal-500 dark:text-white/40 mt-1">
              © 2024 · <span className="text-sage-400/80 font-medium">Developed by Team OriginX</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
