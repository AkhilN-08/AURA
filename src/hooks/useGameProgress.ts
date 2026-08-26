import { useLocalStorage } from './useLocalStorage'
import type { GameSession } from '../data/models'

export function useGameProgress() {
  const [sessions, setSessions] = useLocalStorage<GameSession[]>('aura-game-sessions', [])

  const addSession = (session: GameSession) => {
    setSessions(prev => [...prev, session])
  }

  const getSessionsByType = (type: GameSession['gameType']) => {
    return sessions.filter(s => s.gameType === type)
  }

  const getAverageAccuracy = (type?: GameSession['gameType']) => {
    const filtered = type ? getSessionsByType(type) : sessions
    if (filtered.length === 0) return 0
    return Math.round(filtered.reduce((acc, s) => acc + s.accuracy, 0) / filtered.length)
  }

  const getRecentSessions = (count: number = 5) => {
    return [...sessions]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, count)
  }

  const getWeeklySessions = () => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return sessions.filter(s => new Date(s.timestamp) >= weekAgo)
  }

  const getBestAccuracy = (type?: GameSession['gameType']) => {
    const filtered = type ? getSessionsByType(type) : sessions
    if (filtered.length === 0) return 0
    return Math.max(...filtered.map(s => s.accuracy))
  }

  const getTotalPlayTime = () => {
    return sessions.reduce((acc, s) => acc + s.duration, 0)
  }

  return {
    sessions,
    addSession,
    getSessionsByType,
    getAverageAccuracy,
    getRecentSessions,
    getWeeklySessions,
    getBestAccuracy,
    getTotalPlayTime,
  }
}
