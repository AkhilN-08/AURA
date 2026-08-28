import { useState, useEffect } from 'react'
import { Eye, Users } from 'lucide-react'

type ViewMode = 'elder' | 'adult'

export default function AccessibilityToggle() {
  const [mode, setMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('aura-view-mode')
    return (saved === 'elder' || saved === 'adult') ? saved : 'adult'
  })
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    localStorage.setItem('aura-view-mode', mode)
    if (mode === 'elder') {
      document.documentElement.classList.add('elder-mode')
    } else {
      document.documentElement.classList.remove('elder-mode')
    }
  }, [mode])

  return (
    <div className="fixed top-20 right-6 z-[9998] lg:block">
      {/* Expanded panel */}
      {isExpanded && (
        <div className="mt-3 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-sage-100 p-4 w-56 animate-fade-in">
          <p className="text-xs font-semibold text-charcoal-600 mb-3 uppercase tracking-wide">View Mode</p>
          <div className="space-y-2">
            <button
              onClick={() => setMode('elder')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                mode === 'elder'
                  ? 'bg-sage-100 border-2 border-sage-400 shadow-sm'
                  : 'bg-cream-50 border-2 border-transparent hover:border-cream-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                mode === 'elder' ? 'bg-sage-500 text-white' : 'bg-cream-100 text-charcoal-400'
              }`}>
                <Eye size={16} />
              </div>
              <div className="text-left">
                <p className={`text-sm font-semibold ${mode === 'elder' ? 'text-sage-700' : 'text-charcoal-700'}`}>
                  Elder Mode
                </p>
                <p className="text-[10px] text-charcoal-400">Larger text & buttons</p>
              </div>
            </button>

            <button
              onClick={() => setMode('adult')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                mode === 'adult'
                  ? 'bg-sage-100 border-2 border-sage-400 shadow-sm'
                  : 'bg-cream-50 border-2 border-transparent hover:border-cream-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                mode === 'adult' ? 'bg-sage-500 text-white' : 'bg-cream-100 text-charcoal-400'
              }`}>
                <Users size={16} />
              </div>
              <div className="text-left">
                <p className={`text-sm font-semibold ${mode === 'adult' ? 'text-sage-700' : 'text-charcoal-700'}`}>
                  Adult Mode
                </p>
                <p className="text-[10px] text-charcoal-400">Standard view</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 ${
          mode === 'elder'
            ? 'bg-gradient-to-br from-sage-400 to-sage-600 text-white shadow-sage-200'
            : 'bg-white/90 backdrop-blur-sm border border-sage-200 text-sage-600 hover:bg-sage-50'
        }`}
        title={mode === 'elder' ? 'Elder Mode Active — Tap to switch' : 'Adult Mode — Tap to switch to Elder Mode'}
        aria-label="Toggle view mode"
      >
        {mode === 'elder' ? <Eye size={22} /> : <Users size={22} />}
      </button>
    </div>
  )
}
