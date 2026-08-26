import { useState } from 'react'
import { Flower2 } from 'lucide-react'
import AssistantPanel from './AssistantPanel'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export default function AssistantButton() {
  const [isOpen, setIsOpen] = useState(false)
  const reducedMotion = useReducedMotion()

  return (
    <>
      {/* Orb button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full
          bg-gradient-to-br from-forest-400 to-forest-600
          flex items-center justify-center shadow-lg
          hover:shadow-glow hover:scale-110 active:scale-95
          transition-all duration-300
          ${!reducedMotion ? 'animate-pulse-slow' : ''}
          ${isOpen ? 'ring-4 ring-forest-200' : ''}`}
        aria-label={isOpen ? 'Close assistant' : 'Open AI assistant'}
        aria-expanded={isOpen}
      >
        <Flower2 className="text-white" size={28} />
      </button>

      {/* Panel */}
      {isOpen && <AssistantPanel onClose={() => setIsOpen(false)} />}
    </>
  )
}
