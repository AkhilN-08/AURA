import { useState, useEffect, useCallback } from 'react'

// Same-document sync: when one hook instance writes a key, every other
// instance of the same key adopts the new value instantly (e.g. a demo
// seed written elsewhere on the page).
const LOCAL_WRITE = 'local-storage-write'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.warn(`Failed to save to localStorage: ${key}`, error)
    }
  }, [key, storedValue])

  useEffect(() => {
    const handler = (e: Event) => {
      const evt = e as CustomEvent<string>
      if (evt.detail !== key) return
      try {
        const item = window.localStorage.getItem(key)
        if (item === null) return
        const next = JSON.parse(item)
        setStoredValue(prev => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
      } catch { /* ignore */ }
    }
    window.addEventListener(LOCAL_WRITE, handler)
    return () => window.removeEventListener(LOCAL_WRITE, handler)
  }, [key])

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.warn(`Failed to save to localStorage: ${key}`, error)
    }
  }, [key, storedValue])

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const next = value instanceof Function ? value(prev) : value
      // Notify other instances of this key on the same page
      window.dispatchEvent(new CustomEvent(LOCAL_WRITE, { detail: key }))
      return next
    })
  }, [key])

  return [storedValue, setValue]
}
