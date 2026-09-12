import { useLocalStorage } from './useLocalStorage'

/**
 * Emergency / caregiver call number for this user.
 * Stored locally, never sent anywhere. The floating SOS button reads it
 * and dials it directly (without the browser's tel: confirmation UI).
 */
const KEY = 'aura-emergency-phone'

export function useEmergencyPhone() {
  const [number, setStored] = useLocalStorage<string>(KEY, '')
  const setNumber = (next: string) => {
    const cleaned = next.replace(/[^0-9+]/g, '')
    setStored(cleaned.length >= 7 ? cleaned : '')
  }
  return [number, setStored] as const
}
