import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { LogOut, User } from 'lucide-react'

interface NavLink { label: string; href: string }

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  links: NavLink[]
  onLogout?: () => void
  onOpenProfile?: () => void
  user?: { name: string; email: string } | null
}

export default function MobileMenu({ isOpen, onClose, links, onLogout, onOpenProfile, user }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    if (!panelRef.current) return

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const tl = gsap.timeline()

      tl.fromTo(panelRef.current,
        { opacity: 0, backdropFilter: 'blur(0px)' },
        { opacity: 1, backdropFilter: 'blur(40px)', duration: 0.5, ease: 'power3.out' }
      )

      itemsRef.current.forEach((item, i) => {
        if (item) {
          tl.fromTo(item,
            { opacity: 0, x: -30, filter: 'blur(6px)' },
            { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.4, ease: 'power3.out' },
            0.15 + i * 0.06
          )
        }
      })
    } else {
      document.body.style.overflow = ''
    }

    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-30 md:hidden">
      <div className="absolute inset-0 bg-charcoal-900/20 backdrop-blur-2xl" onClick={onClose} />
      <div
        ref={panelRef}
        className="absolute top-[72px] left-0 right-0 bg-white/60 backdrop-blur-3xl border-b border-white/40 shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
      >
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-1">
          {user && (
            <div
              ref={el => { itemsRef.current[0] = el }}
              className="flex items-center gap-3 px-4 py-3 mb-3 rounded-2xl bg-white/30 border border-white/40"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center shadow-sm">
                <span className="text-sm font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-charcoal-800">{user.name}</p>
                <p className="text-xs text-charcoal-400">{user.email}</p>
              </div>
              {onOpenProfile && (
                <button
                  onClick={() => { onClose(); setTimeout(onOpenProfile, 300) }}
                  className="p-2 rounded-xl hover:bg-white/60 transition-all duration-300"
                  aria-label="Open profile"
                >
                  <User size={18} className="text-charcoal-400" />
                </button>
              )}
            </div>
          )}
          {links.map((link, i) => (
            <Link
              key={link.href}
              ref={el => { itemsRef.current[i + 1] = el }}
              to={link.href}
              onClick={onClose}
              className="px-5 py-4 rounded-2xl text-lg font-medium text-charcoal-700 hover:bg-white/50 hover:text-forest-600 transition-all duration-300 active:scale-[0.97]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            ref={el => { itemsRef.current[links.length + 1] = el }}
            to="/games"
            onClick={onClose}
            className="mt-4 text-center bg-gradient-to-r from-forest-500 to-forest-600 text-white px-6 py-4 rounded-2xl font-semibold shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            Get Started
          </Link>
          {onLogout && (
            <button
              ref={el => { itemsRef.current[links.length + 2] = el }}
              onClick={() => { onClose(); onLogout() }}
              className="flex items-center justify-center gap-2 px-5 py-4 mt-2 rounded-2xl text-red-500 hover:bg-red-50/60 transition-all duration-300"
            >
              <LogOut size={18} />
              <span className="font-medium">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
