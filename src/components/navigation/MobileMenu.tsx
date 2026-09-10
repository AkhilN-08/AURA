import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { LogOut, User, ChevronRight, Flower2 } from 'lucide-react'
import GardenGlyph from '../ui/GardenGlyph'
import type { GlyphName } from '../ui/GardenGlyph'

interface NavLink { label: string; href: string }

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  links: NavLink[]
  onLogout?: () => void
  onOpenProfile?: () => void
  user?: { name: string; email: string } | null
}

/** A cycling garden mark per link — the margin-sketch motif. */
const LINK_GLYPHS: GlyphName[] = ['sprout', 'flower', 'leaf', 'sun', 'path', 'branch']

export default function MobileMenu({ isOpen, onClose, links, onLogout, onOpenProfile, user }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    if (!panelRef.current) return

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const tl = gsap.timeline()

      tl.fromTo(panelRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      )

      itemsRef.current.forEach((item, i) => {
        if (item) {
          tl.fromTo(item,
            { opacity: 0, y: -12 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
            0.08 + i * 0.045
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
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        className="profile-panel absolute top-[64px] left-0 right-0 max-h-[calc(100vh-64px)] overflow-y-auto border-b-2 border-ink shadow-[0_24px_60px_-20px_rgba(23,23,23,0.45)]"
        style={{ background: 'linear-gradient(180deg, #F8F5EE 0%, #F6F1E4 100%)' }}
      >
        <div className="px-5 pt-6 pb-24 flex flex-col gap-1">
          {user && (
            <div
              ref={el => { itemsRef.current[0] = el }}
              className="flex items-center gap-3.5 px-4 py-3.5 mb-3 rounded-2xl bg-white border-2 border-ink/70 relative overflow-hidden"
            >
              <span className="absolute top-0 left-0 right-0 h-1.5" style={{ background: 'linear-gradient(90deg, #B8D99A, #AFCBEF, #F2B6C6, #F3C6A5, #F1D98A)' }} aria-hidden />
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0" style={{ background: '#7c9a6d' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif-display text-lg text-ink truncate">{user.name}</p>
                <p className="text-xs text-ink/50 truncate">{user.email}</p>
              </div>
              {onOpenProfile && (
                <button
                  onClick={() => { onClose(); setTimeout(onOpenProfile, 300) }}
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border"
                  style={{ background: 'rgba(184,217,154,0.3)', borderColor: '#B8D99A' }}
                  aria-label="Open profile"
                >
                  <User size={17} style={{ color: '#5d7a51' }} />
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
              className="group flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-lg font-medium text-ink hover:bg-sagesoft/25 transition-colors duration-200"
            >
              <GardenGlyph name={LINK_GLYPHS[i % LINK_GLYPHS.length]} size={17} className="text-leaf flex-shrink-0" />
              <span className="flex-1">{link.label}</span>
              <ChevronRight size={17} className="text-ink/30 group-hover:text-ink group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}

          <Link
            ref={el => { itemsRef.current[links.length + 1] = el }}
            to="/games"
            onClick={onClose}
            className="mt-4 flex items-center justify-center gap-2 bg-ink text-ivory px-6 py-4 rounded-xl font-semibold text-lg border-2 border-ink hover:bg-leaf hover:border-leaf active:translate-y-0.5 transition-all duration-300"
          >
            <Flower2 size={19} />
            Get Started
          </Link>

          {onLogout && (
            <button
              ref={el => { itemsRef.current[links.length + 2] = el }}
              onClick={() => { onClose(); onLogout() }}
              className="flex items-center justify-center gap-2 px-5 py-4 mt-2 rounded-xl text-red-600 border-2 border-red-300/60 hover:bg-red-50 transition-all duration-200"
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
