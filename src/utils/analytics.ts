import type { GameSession } from '../data/models'

// ── Formatting ──────────────────────────────────────────────

export function formatGameName(type: GameSession['gameType']): string {
  switch (type) {
    case 'memory-match': return 'Memory Match'
    case 'object-recall': return 'Object Recall'
    case 'sequence-recall': return 'Sequence Recall'
  }
}

// ── Weekly Stats ────────────────────────────────────────────

export function calculateWeeklyStats(sessions: GameSession[]) {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const weekly = sessions.filter(s => new Date(s.timestamp) >= weekAgo)

  return {
    totalSessions: weekly.length,
    avgAccuracy: weekly.length > 0
      ? Math.round(weekly.reduce((acc, s) => acc + s.accuracy, 0) / weekly.length)
      : 0,
    gamesCompleted: weekly.length,
    byType: {
      'memory-match': weekly.filter(s => s.gameType === 'memory-match').length,
      'object-recall': weekly.filter(s => s.gameType === 'object-recall').length,
      'sequence-recall': weekly.filter(s => s.gameType === 'sequence-recall').length,
    },
  }
}

// ── Growth Calculation ──────────────────────────────────────

export function calculateGrowth(sessions: GameSession[]): { percent: number; direction: 'up' | 'down' | 'flat' } {
  if (sessions.length < 2) return { percent: 0, direction: 'flat' }

  const sorted = [...sessions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  const mid = Math.floor(sorted.length / 2)
  const firstHalf = sorted.slice(0, mid)
  const secondHalf = sorted.slice(mid)

  const firstAvg = firstHalf.reduce((a, s) => a + s.accuracy, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((a, s) => a + s.accuracy, 0) / secondHalf.length

  const diff = secondAvg - firstAvg
  const percent = Math.round(Math.abs(diff))

  return {
    percent,
    direction: diff > 2 ? 'up' : diff < -2 ? 'down' : 'flat',
  }
}

// ── Trend Data (grouped by week) ────────────────────────────

export function generateTrendData(sessions: GameSession[]): { week: string; accuracy: number }[] {
  if (sessions.length === 0) return []

  const sorted = [...sessions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  // Group by calendar week
  const weekMap = new Map<string, number[]>()
  sorted.forEach(s => {
    const d = new Date(s.timestamp)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay()) // Sunday
    const key = weekStart.toISOString().split('T')[0]
    if (!weekMap.has(key)) weekMap.set(key, [])
    weekMap.get(key)!.push(s.accuracy)
  })

  const weeks = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8) // Last 8 weeks max

  return weeks.map(([date, accs], i) => ({
    week: `Week ${i + 1}`,
    accuracy: Math.round(accs.reduce((a, b) => a + b, 0) / accs.length),
  }))
}

// ── Weekly Activity Chart Data ───────────────────────────────

export function generateWeeklyChartData(sessions: GameSession[]): { day: string; memory: number; recall: number }[] {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const weekSessions = sessions.filter(s => new Date(s.timestamp) >= weekAgo)

  const result = dayNames.map(day => {
    const dayIndex = dayNames.indexOf(day)
    const daySessions = weekSessions.filter(s => {
      const d = new Date(s.timestamp)
      return d.getDay() === dayIndex
    })

    const memorySessions = daySessions.filter(s => s.gameType === 'memory-match')
    const recallSessions = daySessions.filter(s => s.gameType === 'sequence-recall' || s.gameType === 'object-recall')

    return {
      day,
      memory: memorySessions.length > 0
        ? Math.round(memorySessions.reduce((a, s) => a + s.accuracy, 0) / memorySessions.length)
        : 0,
      recall: recallSessions.length > 0
        ? Math.round(recallSessions.reduce((a, s) => a + s.accuracy, 0) / recallSessions.length)
        : 0,
    }
  })

  return result
}

// ── AI Insights (data-driven, multiple) ─────────────────────

export function generateInsights(sessions: GameSession[]): string[] {
  const insights: string[] = []

  if (sessions.length === 0) {
    return ["No activity recorded yet. Start with a cognitive game to begin tracking progress."]
  }

  const sorted = [...sessions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const weekly = calculateWeeklyStats(sessions)
  const growth = calculateGrowth(sessions)
  const recent = sorted.slice(0, 5)
  const recentAvg = Math.round(recent.reduce((a, s) => a + s.accuracy, 0) / recent.length)

  // Engagement insight
  if (weekly.totalSessions >= 5) {
    insights.push(`Strong engagement this week with ${weekly.totalSessions} sessions completed. Consistent practice is building a healthy cognitive routine.`)
  } else if (weekly.totalSessions >= 2) {
    insights.push(`${weekly.totalSessions} sessions completed this week. Regular engagement helps maintain cognitive momentum.`)
  } else if (weekly.totalSessions === 1) {
    insights.push(`One session this week. Even small amounts of cognitive activity are beneficial — try to play a little more often.`)
  }

  // Growth insight
  if (sessions.length >= 4) {
    if (growth.direction === 'up') {
      insights.push(`Accuracy has improved by ${growth.percent}% compared to earlier sessions. The progression is encouraging.`)
    } else if (growth.direction === 'down') {
      insights.push(`Recent accuracy is ${growth.percent}% lower than earlier sessions. This can happen — a rest day or easier difficulty might help.`)
    } else {
      insights.push(`Performance has been steady across sessions. Consistency is itself a positive sign.`)
    }
  }

  // Recent accuracy insight
  if (recent.length >= 2) {
    if (recentAvg >= 85) {
      insights.push(`Recent average accuracy is ${recentAvg}% — performing well across activities.`)
    } else if (recentAvg >= 65) {
      insights.push(`Recent average accuracy is ${recentAvg}%. There's room for growth — keep practicing.`)
    } else {
      insights.push(`Recent average accuracy is ${recentAvg}%. Consider trying an easier difficulty level for a confidence boost.`)
    }
  }

  // Game variety insight
  const gameTypes = new Set(sessions.map(s => s.gameType))
  if (gameTypes.size === 1) {
    const played = [...gameTypes][0]
    const suggestion = played === 'memory-match' ? 'Object Recall' : played === 'object-recall' ? 'Sequence Recall' : 'Memory Match'
    insights.push(`Only ${formatGameName(played)} played so far. Trying ${suggestion} would exercise a different type of cognitive skill.`)
  } else if (gameTypes.size === 3) {
    insights.push(`All three game types explored — well-rounded cognitive engagement.`)
  }

  // By-type best performance
  const typeAccuracies: { type: GameSession['gameType']; avg: number; count: number }[] = []
  for (const type of ['memory-match', 'object-recall', 'sequence-recall'] as const) {
    const typeSessions = sessions.filter(s => s.gameType === type)
    if (typeSessions.length > 0) {
      typeAccuracies.push({
        type,
        avg: Math.round(typeSessions.reduce((a, s) => a + s.accuracy, 0) / typeSessions.length),
        count: typeSessions.length,
      })
    }
  }
  if (typeAccuracies.length > 0) {
    const best = typeAccuracies.reduce((a, b) => a.avg > b.avg ? a : b)
    insights.push(`Strongest performance in ${formatGameName(best.type)} at ${best.avg}% average accuracy across ${best.count} sessions.`)
  }

  return insights.length > 0 ? insights : ["Keep playing to generate personalized insights about your cognitive engagement."]
}

// Legacy single-insight wrapper
export function generateInsight(sessions: GameSession[]): string {
  return generateInsights(sessions)[0] || "No activity recorded yet."
}
