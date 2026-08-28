import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Flower2, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTranslation } from '../../hooks/useTranslation'
import MobileMenu from './MobileMenu'
import ProfileMenu from './ProfileMenu'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const NAV_LINKS = [
    { label: t('Home'), href: '/' },
    { label: t('Cognitive Games'), href: '/games' },
    { label: t('Memory Assistant'), href: '/assistant' },
    { label: t('Caregiver'), href: '/caregiver' },
  ]

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-400 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          scrolled
            ? 'bg-white/50 backdrop-blur-2xl shadow-[0_1px_30px_rgba(0,0,0,0.06)] border-b border-white/60 py-3'
            : 'bg-transparent py-3'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="AURA-NER NER Home">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sage-400/80 to-sage-600/80 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-400 ease-[cubic-bezier(0.25,0.1,0.25,1)] shadow-[0_0_16px_rgba(59,130,246,0.2)]">
              <Flower2 className="text-white" size={22} />
            </div>
            <span className="text-lg font-bold text-charcoal-800 tracking-tight">AURA-NER</span>
          </Link>

          {/* Desktop Nav — glass pills */}
          <div className="hidden md:flex items-center gap-0.5 bg-white/25 backdrop-blur-xl rounded-xl px-1.5 py-1 border border-white/30">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-300 ${
                  location.pathname === link.href
                    ? 'bg-sage-500/90 text-white shadow-sm'
                    : 'text-charcoal-500 hover:text-charcoal-800 hover:bg-white/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User + CTA + Hamburger */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden md:flex items-center gap-1.5">
                {/* Profile trigger button — compact */}
                <button
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/30 backdrop-blur-sm border border-white/40 hover:bg-white/60 transition-all duration-200 group"
                  aria-label="Open profile menu"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center shadow-sm">
                    <span className="text-[10px] font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-charcoal-700 max-w-[80px] truncate hidden lg:inline">
                    {user.name}
                  </span>
                </button>
              </div>
            )}


            {/* Morphing hamburger */}
            <button
              className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/40 backdrop-blur-sm transition-all duration-300"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <div className="w-5 h-4 relative flex flex-col justify-between">
                <span
                  className="absolute left-0 w-full h-0.5 bg-charcoal-700 rounded-full origin-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)]"
                  style={{
                    top: mobileOpen ? '7px' : '0',
                    transform: mobileOpen ? 'rotate(45deg)' : 'rotate(0)',
                  }}
                />
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-charcoal-700 rounded-full transition-all duration-300"
                  style={{
                    opacity: mobileOpen ? 0 : 1,
                    transform: mobileOpen ? 'scaleX(0)' : 'scaleX(1)',
                  }}
                />
                <span
                  className="absolute left-0 w-full h-0.5 bg-charcoal-700 rounded-full origin-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)]"
                  style={{
                    bottom: mobileOpen ? '7px' : '0',
                    transform: mobileOpen ? 'rotate(-45deg)' : 'rotate(0)',
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} links={NAV_LINKS} onLogout={handleLogout} user={user} onOpenProfile={() => setProfileOpen(true)} />
      <ProfileMenu isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  )
}
