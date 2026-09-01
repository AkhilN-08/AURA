import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export function useElderMode() {
  const [elderMode, setElderMode] = useLocalStorage<boolean>('aura-elder-mode', true)

  useEffect(() => {
    const root = document.documentElement
    if (elderMode) {
      root.classList.add('elder-mode')
    } else {
      root.classList.remove('elder-mode')
    }
  }, [elderMode])

  const toggleElderMode = () => setElderMode(prev => !prev)

  return { elderMode, setElderMode, toggleElderMode }
}
