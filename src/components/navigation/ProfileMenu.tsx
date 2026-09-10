import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { useState, useEffect as useEff } from 'react'
import { X, Mail, Flower2, Heart, LogOut, Gamepad2, Brain, Mic, BarChart3, Shield, ChevronRight, Moon, Sun, Eye, Users, Delete, Phone } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useGameProgress } from '../../hooks/useGameProgress'
import { GAME_TYPES } from '../../data/models'
import { useTranslation } from '../../hooks/useTranslation'
import { useDarkMode } from '../../hooks/useDarkMode'
import { useElderMode } from '../../hooks/useElderMode'
import { useAuraInstall } from '../../pwa/useAuraInstall'
import { buildVersion } from '../../buildVersion'
import { playTapSound } from '../../utils/audio'

interface ProfileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileMenu({ isOpen, onClose }: ProfileMenuProps) {
  const { user, logout } = useAuth()
  const { sessions } = useGameProgress()
  const { language, setLanguage, t } = useTranslation()
  const { isDark, toggle: toggleDark } = useDarkMode()
  const { elderMode, setElderMode } = useElderMode()
  const { setRole, validateCaregiverPin, setEmergencyPhone } = useAuth()
  const { installed, offerInstall } = useAuraInstall()
  const [showCaregiverPin, setShowCaregiverPin] = useState(false)
  const [cgPin, setCgPin] = useState('')
  const [cgPinError, setCgPinError] = useState('')
  const [editEmergency, setEditEmergency] = useState(user?.emergencyPhone || '')
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
      {/* Overlay — warm dim, the room settles back */}
      <div
        ref={overlayRef}
        className="absolute inset-0 backdrop-blur-md"
        style={{ background: 'rgba(38, 33, 28, 0.32)' }}
        onClick={handleClose}
      />

      {/* Panel — a warm paper journal page sliding in */}
      <div
        ref={panelRef}
        className="profile-panel absolute top-0 right-0 bottom-0 w-[min(460px,100vw)] overflow-y-auto overscroll-contain"
        style={{
          transform: 'translateX(100%)',
          background: 'linear-gradient(180deg, #F8F5EE 0%, #F6F1E4 100%)',
          borderLeft: '2px solid #171717',
          boxShadow: '-24px 0 60px -30px rgba(23,23,23,0.45)',
        }}
      >
        <div className="p-7 pb-10 space-y-6">
          {/* Header */}
          <div ref={el => { itemsRef.current[0] = el }} className="flex items-center justify-between">
            <h2 className="font-serif-display text-2xl text-ink">Profile</h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/15 dark:bg-white/10 flex items-center justify-center text-charcoal-500 dark:text-white/50 hover:bg-white/25 dark:hover:bg-white/15 transition-all duration-200"
              aria-label="Close"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* User card — a pressed flower in the journal */}
          <div ref={el => { itemsRef.current[1] = el }}>
            <div className="rounded-2xl border-2 border-ink/70 dark:border-white/25 bg-white p-5 relative overflow-hidden">
              <span className="absolute top-0 left-0 right-0 h-2" style={{ background: 'linear-gradient(90deg, #B8D99A, #AFCBEF, #F2B6C6, #F3C6A5, #F1D98A)' }} />
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white" style={{ background: '#7c9a6d' }}>
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif-display text-xl text-ink truncate">{user?.name || 'User'}</p>
                  <p className="text-[13px] text-ink/50 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                    <Mail size={12} /> {user?.email || t('No email')}
                  </p>
                </div>
              </div>
              {/* Stats — warm summary, not cold metrics */}
              <div className="text-center border-t border-ink/10 dark:border-white/10 pt-3">
                <p className="text-sm text-ink/60 dark:text-slate-300 mb-2">
                  {sessions.length > 0
                    ? sessions.length + ' games played — you are building a lovely routine'
                    : 'No games yet — start when you are ready'}
                </p>
                {sessions.length > 0 && (
                  <div className="flex gap-2 justify-center flex-wrap">
                    {sessions.slice(-3).map((s, i) => (
                      <div key={s.gameType} className="profile-pill text-[11px] font-medium px-2.5 py-1 rounded-full border" style={{
                        color: ['#5d7a51', '#4a6a92', '#b45a74'][i % 3],
                        background: ['rgba(184,217,154,0.25)', 'rgba(175,203,239,0.3)', 'rgba(242,182,198,0.3)'][i % 3],
                        borderColor: ['#B8D99A', '#AFCBEF', '#F2B6C6'][i % 3],
                      }}>
                        {GAME_TYPES[s.gameType]?.label || 'Game'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links — iOS list style */}
          <div ref={el => { itemsRef.current[2] = el }}>
            {/* Keep AURA with you — real install trigger, only when installable */}
            {!installed && (
              <button
                onClick={async () => { playTapSound(); await offerInstall() }}
                className="w-full rounded-2xl bg-ink p-4 mb-3 flex items-center gap-3.5 text-left group hover:bg-leaf active:translate-y-0.5 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Flower2 size={18} className="text-sagesoft" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-ivory">{t('KEEP AURA WITH YOU')} →</p>
                  <p className="text-[12px] text-ivory/60">{t('Add AURA to your device for quicker access.')}</p>
                </div>
              </button>
            )}
            <div className="rounded-2xl bg-white border-2 border-ink/70 dark:border-white/25 overflow-hidden">
              {[
                { icon: Gamepad2, label: 'Memory Games', path: '/games', iconBg: 'rgba(184,217,154,0.35)', iconColor: '#5d7a51', show: true },
                { icon: Brain, label: 'Memory Assistant', path: '/assistant', iconBg: 'rgba(175,203,239,0.4)', iconColor: '#4a6a92', show: true },
                { icon: BarChart3, label: 'Caregiver Dashboard', path: '/caregiver', iconBg: 'rgba(243,198,165,0.4)', iconColor: '#b06a35', show: user?.role === 'caregiver' },
              ].filter(item => item.show).map((item, i) => (
                <button
                  key={i}
                  onClick={() => { handleClose(); setTimeout(() => navigate(item.path), 350) }}
                  className={`w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-sagesoft/20 transition-all duration-200 text-left group ${i !== 0 ? 'border-t border-ink/10' : ''}`}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border" style={{ backgroundColor: item.iconBg, borderColor: item.iconColor + '44' }}>
                    <item.icon size={18} style={{ color: item.iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-ink">{t(item.label)}</p>
                  </div>
                  <ChevronRight size={16} className="text-ink/40 dark:text-slate-500 group-hover:text-ink dark:group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Settings — grouped journal lists */}
          <div ref={el => { itemsRef.current[3] = el }}>
            <div className="rounded-2xl bg-white border-2 border-ink/70 dark:border-white/25 overflow-hidden">
              {/* Language */}
              <div className="px-5 pt-4 pb-3">
                <p className="aura-meta mb-2.5">Language</p>
                <div className="flex gap-2">
                  {[
                    { key: 'en' as const, label: 'English' },
                    { key: 'hi' as const, label: 'हिंदी' },
                  ].map(lang => (
                    <button
                      key={lang.key}
                      onClick={() => setLanguage(lang.key)}
                      className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                        language === lang.key
                          ? 'bg-sagesoft/40 text-ink border-2 border-leaf/60'
                          : 'text-ink/60 hover:bg-sagesoft/15 border-2 border-transparent'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mx-5 h-px bg-ink/10" />

              {/* View Mode */}
              <div className="px-5 py-3">
                <p className="aura-meta mb-2.5">View Mode</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { playTapSound(); setElderMode(true) }}
                    className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all duration-200 ${
                      elderMode
                        ? 'bg-sagesoft/40 text-ink border-2 border-leaf/60'
                        : 'text-ink/60 hover:bg-sagesoft/15 border-2 border-transparent'
                    }`}>
                    <Eye size={14} /> Elder
                  </button>
                  <button
                    onClick={() => { playTapSound(); setElderMode(false) }}
                    className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all duration-200 ${
                      !elderMode
                        ? 'bg-mist/40 text-ink border-2 border-[#7d9bbd]/70'
                        : 'text-ink/60 hover:bg-mist/20 border-2 border-transparent'
                    }`}>
                    <Users size={14} /> Adult
                  </button>
                </div>
              </div>

              <div className="mx-5 h-px bg-ink/10" />

              {/* Role */}
              <div className="px-5 py-3">
                <p className="aura-meta mb-2.5">I am a</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { playTapSound(); setRole('patient'); setShowCaregiverPin(false); setCgPin(''); setCgPinError('') }}
                    className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all duration-200 ${
                      (user?.role || 'patient') === 'patient'
                        ? 'bg-sagesoft/40 text-ink border-2 border-leaf/60'
                        : 'text-ink/60 hover:bg-sagesoft/15 border-2 border-transparent'
                    }`}>
                    <Eye size={14} /> Patient
                  </button>
                  <button
                    onClick={() => {
                      playTapSound()
                      if (user?.role === 'caregiver') {
                        setRole('patient')
                      } else {
                        setShowCaregiverPin(true)
                        setCgPin('')
                        setCgPinError('')
                      }
                    }}
                    className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all duration-200 ${
                      user?.role === 'caregiver'
                        ? 'bg-peachy/50 text-ink border-2 border-[#b06a35]/60'
                        : 'text-ink/60 hover:bg-peachy/20 border-2 border-transparent'
                    }`}>
                    <Users size={14} /> Caregiver
                  </button>
                </div>
              </div>

              {/* Caregiver PIN Modal */}
              {showCaregiverPin && (
                <div className="mx-5 mb-3 rounded-xl bg-ivory border-2 border-[#b06a35]/40 p-4">
                  <p className="text-[12px] font-medium text-ink mb-2">Enter caregiver PIN</p>
                  <div className="flex justify-center gap-2 mb-2">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold transition-all ${
                        i < cgPin.length
                          ? 'bg-ink text-ivory scale-105'
                          : 'bg-transparent border-2 border-ink/25 text-ink/40'
                      }`}>
                        {i < cgPin.length ? '•' : ''}
                      </div>
                    ))}
                  </div>
                  {cgPinError && <p className="text-[11px] text-red-600 text-center mb-2">{cgPinError}</p>}
                  <div className="grid grid-cols-3 gap-1.5 max-w-[180px] mx-auto">
                    {['1','2','3','4','5','6','7','8','9'].map(d => (
                      <button key={d} type="button" onClick={() => {
                        if (cgPin.length < 4) {
                          const next = cgPin + d
                          setCgPin(next)
                          if (next.length === 4) {
                            if (validateCaregiverPin(next)) {
                              setRole('caregiver')
                              setShowCaregiverPin(false)
                              setCgPin('')
                              setCgPinError('')
                            } else {
                              setCgPinError('Wrong PIN')
                              setTimeout(() => setCgPin(''), 600)
                            }
                          }
                        }
                      }} className="h-9 rounded-lg bg-transparent border-2 border-ink/20 text-sm font-bold text-ink hover:bg-ink hover:text-ivory active:scale-95 transition-all">
                        {d}
                      </button>
                    ))}
                    <div />
                    <button type="button" onClick={() => {
                      if (cgPin.length < 4) {
                        const next = cgPin + '0'
                        setCgPin(next)
                        if (next.length === 4) {
                          if (validateCaregiverPin(next)) {
                            setRole('caregiver')
                            setShowCaregiverPin(false)
                            setCgPin('')
                            setCgPinError('')
                          } else {
                            setCgPinError('Wrong PIN')
                            setTimeout(() => setCgPin(''), 600)
                          }
                        }
                      }
                    }} className="h-9 rounded-lg bg-transparent border-2 border-ink/20 text-sm font-bold text-ink hover:bg-ink hover:text-ivory active:scale-95 transition-all">
                      0
                    </button>
                    <button type="button" onClick={() => { setCgPin(p => p.slice(0, -1)); setCgPinError('') }} className="h-9 rounded-lg bg-transparent border-2 border-ink/15 flex items-center justify-center text-ink/50 hover:border-ink/40 active:scale-95 transition-all">
                      <Delete size={12} />
                    </button>
                  </div>
                </div>
              )}

              <div className="mx-5 h-px bg-ink/10" />

              {/* Dark Mode */}                <button
                  onClick={() => { playTapSound(); toggleDark() }}
                  className="w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-sagesoft/20 transition-all duration-200 text-left"
                >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border" style={{
                  backgroundColor: isDark ? 'rgba(175,203,239,0.35)' : 'rgba(241,217,138,0.4)',
                  borderColor: isDark ? 'rgba(125,155,189,0.4)' : 'rgba(163,131,46,0.3)',
                }}>
                  {isDark ? <Moon size={18} style={{ color: '#4a6a92' }} /> : <Sun size={18} style={{ color: '#a3832e' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-ink">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
                </div>
                <div className={`w-[46px] h-[28px] rounded-full flex items-center transition-all duration-300 ${isDark ? 'bg-leaf justify-end' : 'bg-ink/20 justify-start'}`}>
                  <div className="w-[22px] h-[22px] bg-white rounded-full mx-[3px] shadow-sm border border-ink/10" />
                </div>
              </button>
            </div>
          </div>

          {/* About — the colophon */}
          <div ref={el => { itemsRef.current[4] = el }}>
            <div className="rounded-2xl bg-white border-2 border-ink/70 p-5">
              <p className="aura-meta mb-3">About AURA-NER</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center border-2" style={{ background: 'rgba(184,217,154,0.35)', borderColor: '#B8D99A', color: '#5d7a51' }}>
                  <Flower2 size={18} />
                </div>
                <div>
                  <p className="font-serif-display text-lg text-ink">AURA-NER</p>
                  <p className="text-[11px] text-ink/50">v1.0.0</p>
                </div>
              </div>
              <p className="text-[13px] text-ink/60 leading-relaxed mb-3">
                Cognitive gaming and memory assistance for elderly people in the North Eastern Region.
              </p>
              <div className="space-y-2">
                {[
                  { icon: Gamepad2, text: t('16 cognitive games'), color: '#5d7a51', bg: 'rgba(184,217,154,0.3)' },
                  { icon: Mic, text: t('Voice assistant'), color: '#4a6a92', bg: 'rgba(175,203,239,0.35)' },
                  { icon: BarChart3, text: t('Caregiver insights'), color: '#b06a35', bg: 'rgba(243,198,165,0.4)' },
                  { icon: Brain, text: t('Adaptive personalization'), color: '#b45a74', bg: 'rgba(242,182,198,0.35)' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[13px] text-ink/70">
                    <span className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: f.bg, color: f.color }}>
                      <f.icon size={12} />
                    </span>
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency contact — the call button uses this number */}
          <div ref={el => { itemsRef.current[5] = el }}>
            <div className="rounded-2xl bg-rose-50/70 border-2 border-rose-200/60 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-rose-200/60 flex items-center justify-center flex-shrink-0">
                  <Phone size={17} className="text-rose-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-ink">{t('Emergency Contact')}</p>
                  <p className="text-[11px] text-rose-600/70">{t('The call button will dial this number')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={editEmergency}
                  onChange={e => {
                    const cleaned = e.target.value.replace(/[^0-9+]/g, '')
                    setEditEmergency(cleaned)
                  }}
                  placeholder="e.g. +91 98765 43210"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white border-2 border-rose-200/60 text-sm focus:outline-none focus:border-rose-400 transition-all"
                />
                <button
                  onClick={() => { if (editEmergency.length >= 7) { setEmergencyPhone(editEmergency); playTapSound() } }}
                  className="px-4 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 active:translate-y-0.5 transition-all flex items-center gap-1.5"
                  title={t('Save')}
                >
                  <Mail size={13} /> Save
                </button>
                <button
                  onClick={() => {
                    if (editEmergency.length >= 7) {
                      window.open(`tel:${editEmergency.replace(/[^0-9+]/g, '')}`, '_self')
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-200/60 text-rose-700 text-sm font-medium hover:bg-rose-300 active:translate-y-0.5 transition-all flex items-center gap-1.5"
                  title={t('Call now')}
                >
                  <Phone size={13} /> Call
                </button>
              </div>
              {user?.emergencyPhone && (
                <p className="text-[10px] text-rose-500/60 mt-1.5">{t('Saved locally — never shared')}</p>
              )}
            </div>
          </div>

          {/* Disclaimer — a quiet note */}
          <div ref={el => { itemsRef.current[6] = el }} className="rounded-xl border-2 border-dashed border-ink/20 bg-white/60 px-4 py-3">
            <div className="flex items-start gap-2.5">
              <Shield size={14} className="text-[#a3832e] mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-ink/60 leading-relaxed">
                <strong className="text-ink/75">Disclaimer:</strong> AURA-NER is a support prototype, not a medical tool.
              </p>
            </div>
          </div>

          {/* Logout */}
          <div ref={el => { itemsRef.current[7] = el }}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 text-[14px] font-medium border-2 border-red-300/60"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>

          {/* Footer */}
          <div ref={el => { itemsRef.current[9] = el }} className="text-center pt-1 pb-2">
            <p className="text-[11px] text-ink/50">
              Made with <Heart size={9} className="inline text-rose-400" /> for memory that matters
            </p>
            <p className="text-[11px] text-ink/50 mt-1">
              © 2025 · <span className="text-leaf font-medium">Developed by Team OriginX</span>
            </p>
            <p className="text-[10px] text-ink/35 mt-1.5 font-mono tracking-wider">BUILD {buildVersion()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
