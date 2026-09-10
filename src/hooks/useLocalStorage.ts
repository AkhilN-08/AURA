import { useState, useEffect, useCallback, useRef } from 'react'
import { demoKeyFor } from './demoMode'

// Same-document sync: when one hook instance writes a key, every other
// instance of the same key adopts the new value instantly (e.g. a game
// session written by the game page appearing live on the caregiver view).
const LOCAL_WRITE = 'local-storage-write'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Demo mode re-points sensitive keys at namespaced copies. Computed once
  // per mount — demo enter/exit reloads the page, so no live switching.
  const [effectiveKey] = useState(() => demoKeyFor(key))

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(effectiveKey)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  // Mirror of the committed state so setValue can compute the next value
  // outside the state updater (no side effects during render).
  const valueRef = useRef<T>(storedValue)
  valueRef.current = storedValue

  useEffect(() => {
    try {
      window.localStorage.setItem(effectiveKey, JSON.stringify(storedValue))
    } catch (error) {
      console.warn(`Failed to save to localStorage: ${effectiveKey}`, error)
    }
  }, [effectiveKey, storedValue])

  useEffect(() => {
    const handler = (e: Event) => {
      const evt = e as CustomEvent<string>
      if (evt.detail !== effectiveKey) return
      try {
        const item = window.localStorage.getItem(effectiveKey)
        if (item === null) return
        const next = JSON.parse(item)
        setStoredValue(prev => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
      } catch { /* ignore */ }
    }
    window.addEventListener(LOCAL_WRITE, handler)
    return () => window.removeEventListener(LOCAL_WRITE, handler)
  }, [effectiveKey])

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    // Order matters: storage first, then state, then notify. The sync
    // listeners (including this instance's own) read storage during the
    // dispatch — writing beforehand means everyone converges on the NEW
    // value instead of the listener rolling the write back to the old one.
    const next = value instanceof Function ? value(valueRef.current) : value
    valueRef.current = next
    try {
      window.localStorage.setItem(effectiveKey, JSON.stringify(next))
    } catch (error) {
      console.warn(`Failed to save to localStorage: ${effectiveKey}`, error)
    }
    setStoredValue(next)
    // Notify other instances of this key on the same page
    window.dispatchEvent(new CustomEvent(LOCAL_WRITE, { detail: effectiveKey }))
  }, [effectiveKey])

  return [storedValue, setValue]
}
