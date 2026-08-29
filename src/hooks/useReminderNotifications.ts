import { useEffect, useRef } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { Reminder } from '../data/models'

const REMINDER_TYPE_ICONS: Record<string, string> = {
  medicine: '💊',
  appointment: '🏥',
  meal: '🍽️',
  call: '📞',
  routine: '🔔',
}

/**
 * Polls pending reminders every 30 seconds.
 * When a reminder's scheduled time matches the current HH:MM,
 * fires a browser Notification (if permission granted).
 * Tracks fired reminders to avoid duplicate notifications on the same day.
 */
export function useReminderNotifications() {
  const [reminders] = useLocalStorage<Reminder[]>('aura-reminders', [])
  const [firedToday, setFiredToday] = useLocalStorage<Record<string, string>>(
    'aura-notifications-fired',
    {}
  )
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const permissionRef = useRef<NotificationPermission>('default')

  // Request permission once on mount
  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(perm => {
        permissionRef.current = perm
      })
    } else {
      permissionRef.current = Notification.permission
    }
  }, [])

  // Clean up stale fired entries (from previous days)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const keys = Object.keys(firedToday)
    if (keys.length > 0) {
      const staleKeys = keys.filter(k => !k.startsWith(today))
      if (staleKeys.length > 0) {
        setFiredToday(prev => {
          const next = { ...prev }
          staleKeys.forEach(k => delete next[k])
          return next
        })
      }
    }
  }, []) // only on mount

  // Poll every 30 seconds
  useEffect(() => {
    const checkReminders = () => {
      if (permissionRef.current !== 'granted') return

      const now = new Date()
      const currentHHMM = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      const today = now.toISOString().split('T')[0]

      reminders.forEach(reminder => {
        if (reminder.completed) return
        if (!reminder.time) return
        if (reminder.time !== currentHHMM) return

        // Already fired today?
        const fireKey = `${today}-${reminder.id}`
        if (firedToday[fireKey]) return

        // Fire notification
        const icon = REMINDER_TYPE_ICONS[reminder.type] || '🔔'
        try {
          new Notification(`${icon} ${reminder.title}`, {
            body: reminder.time
              ? `Scheduled for ${formatTime(reminder.time)}`
              : 'Time for your reminder!',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: reminder.id, // prevents duplicate system notifications
            requireInteraction: true,
          })
        } catch {
          // Notification constructor can throw in some environments
        }

        // Mark as fired
        setFiredToday(prev => ({ ...prev, [fireKey]: new Date().toISOString() }))
      })
    }

    // Check immediately on mount
    checkReminders()

    // Then every 30 seconds
    intervalRef.current = setInterval(checkReminders, 30_000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [reminders, firedToday, setFiredToday])
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`
}
