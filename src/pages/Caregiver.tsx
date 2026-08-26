import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import { Activity, TrendingUp, Clock, Gamepad2, Lightbulb, Users, BarChart3, Bell } from 'lucide-react'
import { useGameProgress } from '../hooks/useGameProgress'
import { useAuth } from '../hooks/useAuth'
import { generateInsights, formatGameName, calculateWeeklyStats, calculateGrowth, generateTrendData, generateWeeklyChartData } from '../utils/analytics'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Reminder } from '../data/models'

const tooltipStyle = {
  borderRadius: '12px',
  border: '1px solid #e5ebe3',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
}

export default function Caregiver() {
  const { sessions, getRecentSessions, getAverageAccuracy, getBestAccuracy, getTotalPlayTime } = useGameProgress()
  const { user } = useAuth()
  const [reminders] = useLocalStorage<Reminder[]>('aura-reminders', [])

  const recentSessions = getRecentSessions(8)
  const weeklyStats = calculateWeeklyStats(sessions)
  const growth = calculateGrowth(sessions)
  const insights = generateInsights(sessions)
  const trendData = generateTrendData(sessions)
  const weeklyChartData = generateWeeklyChartData(sessions)
  const pendingReminders = reminders.filter(r => !r.completed)

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-12 flex-wrap gap-4">
          <div>
            <h1 className="section-heading mb-2">
              Caregiver <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-charcoal-400">
              A gentle overview of cognitive activity and engagement.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-soft border border-cream-200">
            <Users size={20} className="text-forest-500" />
            <div>
              <p className="text-sm font-medium text-charcoal-800">{user?.name || 'User'}</p>
              <p className="text-xs text-charcoal-400">Family Member</p>
            </div>
          </div>
        </div>

        {/* Overview cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-500 flex items-center justify-center">
                <Gamepad2 size={18} />
              </div>
              <span className="text-sm text-charcoal-400">Sessions This Week</span>
            </div>
            <p className="text-3xl font-bold text-charcoal-800">{weeklyStats.totalSessions}</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Activity size={18} />
              </div>
              <span className="text-sm text-charcoal-400">Weekly Accuracy</span>
            </div>
            <p className="text-3xl font-bold text-charcoal-800">
              {weeklyStats.avgAccuracy > 0 ? `${weeklyStats.avgAccuracy}%` : '—'}
            </p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-sage-50 text-sage-500 flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
              <span className="text-sm text-charcoal-400">Growth</span>
            </div>
            <p className="text-3xl font-bold text-charcoal-800">
              {sessions.length < 2 ? '—' : growth.direction === 'up' ? `↑ ${growth.percent}%` : growth.direction === 'down' ? `↓ ${growth.percent}%` : '→ Steady'}
            </p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-cream-100 text-charcoal-500 flex items-center justify-center">
                <Clock size={18} />
              </div>
              <span className="text-sm text-charcoal-400">Total Play Time</span>
            </div>
            <p className="text-3xl font-bold text-charcoal-800">
              {sessions.length > 0 ? `${Math.round(getTotalPlayTime() / 60)}m` : '—'}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly activity chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-charcoal-800 mb-6">Weekly Activity</h3>
            {sessions.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5ebe3" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#757575' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#757575' }} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="memory" fill="#4a7c4a" radius={[4, 4, 0, 0]} name="Memory Match" />
                  <Bar dataKey="recall" fill="#6b8a64" radius={[4, 4, 0, 0]} name="Recall & Recognition" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[280px] text-charcoal-300">
                <BarChart3 size={40} className="mb-3" />
                <p className="text-sm">Play some games to see weekly activity</p>
              </div>
            )}
          </div>

          {/* Trend chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-charcoal-800 mb-6">Accuracy Trend</h3>
            {trendData.length > 1 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5ebe3" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#757575' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#757575' }} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="accuracy" stroke="#4a7c4a" strokeWidth={3} dot={{ fill: '#4a7c4a', r: 5 }} name="Accuracy %" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[280px] text-charcoal-300">
                <TrendingUp size={40} className="mb-3" />
                <p className="text-sm">{sessions.length === 0 ? 'Play some games to see your trend' : 'Play more sessions to see a trend line'}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent sessions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-charcoal-800 mb-6">Recent Sessions</h3>
            <div className="space-y-3">
              {recentSessions.length > 0 ? recentSessions.map((session, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-cream-50">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    session.gameType === 'memory-match' ? 'bg-forest-100' :
                    session.gameType === 'object-recall' ? 'bg-sage-100' : 'bg-amber-100'
                  }`}>
                    {session.gameType === 'memory-match' ? '🧠' : session.gameType === 'object-recall' ? '👁️' : '🔢'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-charcoal-800 text-sm">{formatGameName(session.gameType)}</p>
                    <p className="text-xs text-charcoal-400">{session.difficulty} · {session.duration}s · {new Date(session.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-charcoal-800">{session.accuracy}%</p>
                    <div className={`text-xs ${session.accuracy >= 80 ? 'text-green-600' : session.accuracy >= 60 ? 'text-amber-600' : 'text-charcoal-400'}`}>
                      {session.accuracy >= 80 ? 'Great' : session.accuracy >= 60 ? 'Good' : 'Keep trying'}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-charcoal-300">
                  <Gamepad2 size={40} className="mx-auto mb-3" />
                  <p className="text-sm">No sessions yet. Play a game to start tracking.</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Insights */}
          <div className="card">
            <h3 className="text-lg font-semibold text-charcoal-800 mb-6 flex items-center gap-2">
              <Lightbulb size={20} className="text-amber-500" />
              AI Insights
            </h3>
            <div className="space-y-4">
              {insights.map((insight, i) => (
                <div key={i} className={`rounded-2xl p-5 ${
                  i === 0 ? 'bg-forest-50 border border-forest-100' : 'bg-cream-50 border border-cream-200'
                }`}>
                  <p className="text-charcoal-700 text-sm leading-relaxed">{insight}</p>
                </div>
              ))}

              {/* Performance by game type */}
              {sessions.length > 0 && (
                <div className="bg-cream-50 rounded-2xl p-5 border border-cream-200">
                  <p className="text-sm font-medium text-charcoal-700 mb-3">Performance by Game</p>
                  <div className="space-y-2.5">
                    {(['memory-match', 'object-recall', 'sequence-recall'] as const).map(type => {
                      const typeSessions = sessions.filter(s => s.gameType === type)
                      if (typeSessions.length === 0) return null
                      const avg = Math.round(typeSessions.reduce((a, s) => a + s.accuracy, 0) / typeSessions.length)
                      const best = Math.max(...typeSessions.map(s => s.accuracy))
                      return (
                        <div key={type} className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-forest-400" />
                          <span className="text-sm text-charcoal-600 flex-1">{formatGameName(type)}</span>
                          <span className="text-sm text-charcoal-500">{typeSessions.length} sessions</span>
                          <span className="text-sm font-medium text-charcoal-800">avg {avg}%</span>
                          <span className="text-xs text-charcoal-400">best {best}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Reminder status */}
              {reminders.length > 0 && (
                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                  <p className="text-sm font-medium text-charcoal-700 mb-2 flex items-center gap-2">
                    <Bell size={14} /> Reminders
                  </p>
                  <p className="text-sm text-charcoal-500">
                    {pendingReminders.length} pending · {reminders.filter(r => r.completed).length} completed
                  </p>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-cream-50 rounded-xl">
              <p className="text-xs text-charcoal-400 leading-relaxed">
                <strong>Note:</strong> Insights are generated from your actual activity data.
                AURA is not a diagnostic tool and should not be used as a substitute for professional medical assessment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
