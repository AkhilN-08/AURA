import { useEffect, useRef } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { useAuth } from './useAuth'
import type { GameSession, Reminder } from '../data/models'
import type { FamilyMessage } from '../data/demoData'
import { generateDemoSessions, generateDemoReminders, generateDemoMessages } from '../data/demoData'

export function useDemoData() {
  const { user } = useAuth()
  const [sessions, setSessions] = useLocalStorage<GameSession[]>('aura-game-sessions', [])
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('aura-reminders', [])
  const [messages, setMessages] = useLocalStorage<FamilyMessage[]>('aura-family-messages', [])
  const [demoSeeded, setDemoSeeded] = useLocalStorage<boolean>('aura-demo-seeded', false)
  const seededRef = useRef(false)

  useEffect(() => {
    if (!user || demoSeeded || seededRef.current) return
    seededRef.current = true

    // Only seed if user has no data yet
    if (sessions.length === 0) {
      setSessions(generateDemoSessions())
    }
    if (reminders.length === 0) {
      setReminders(generateDemoReminders())
    }
    if (messages.length === 0) {
      setMessages(generateDemoMessages())
    }
    setDemoSeeded(true)
  }, [user, demoSeeded, sessions.length, reminders.length, messages.length])
}
