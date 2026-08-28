import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export function useDarkMode() {
  const [isDark, setIsDark] = useLocalStorage<boolean>('aura-dark-mode', false)

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  const toggle = () => setIsDark(prev => !prev)

  return { isDark, toggle }
}
