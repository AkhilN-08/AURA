import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Flower2, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import MobileMenu from './MobileMenu'
import ProfileMenu from './ProfileMenu'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Cognitive Games', href: '/games' },
  { label: 'Memory Assistant', href: '/assistant' },
  { label: 'Caregiver', href: '/caregiver' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

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
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-700 ease-out ${
          scrolled
            ? 'bg-white/50 backdrop-blur-2xl shadow-[0_1px_30px_rgba(0,0,0,0.06)] border-b border-white/60 py-3'
            : 'bg-transparent py-5'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="AURA-NER NER Home">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-400/80 to-sage-600/80 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-[0_0_16px_rgba(59,130,246,0.2)]">
              <Flower2 className="text-white" size={22} />
            </div>
            <span className="text-xl font-bold text-charcoal-800 tracking-tight">AURA-NER</span>
          </Link>

          {/* Desktop Nav — glass pills */}
          <div className="hidden md:flex items-center gap-1 bg-white/30 backdrop-blur-xl rounded-2xl px-2 py-1.5 border border-white/40">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-400 ${
                  location.pathname === link.href
                    ? 'bg-sage-500/90 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]'
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
              <div className="hidden md:flex items-center gap-3">
                {/* Profile trigger button */}
                <button
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/40 backdrop-blur-sm border border-white/50 hover:bg-white/70 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-300 group"
                  aria-label="Open profile menu"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xs font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-charcoal-700 max-w-[100px] truncate">
                    {user.name}
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-charcoal-400 hover:text-red-500 hover:bg-red-50/60 transition-all duration-300"
                  aria-label="Sign out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
            <Link
              to="/games"
              className="hidden md:inline-flex items-center gap-2 bg-gradient-to-r from-forest-500 to-sage-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-105 transition-all duration-300"
            >
              Get Started
            </Link>

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
