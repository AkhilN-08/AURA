import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import { Activity, TrendingUp, Clock, Gamepad2, Lightbulb, Users, BarChart3, Bell, Heart, Send, Sparkles, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { useGameProgress } from '../hooks/useGameProgress'
import { useAuth } from '../hooks/useAuth'
import { generateInsights, formatGameName, calculateWeeklyStats, calculateGrowth, generateTrendData, generateWeeklyChartData } from '../utils/analytics'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Reminder } from '../data/models'
import type { FamilyMessage } from '../data/demoData'

const tooltipStyle = {
  borderRadius: '12px',
  border: '1px solid #e5ebe3',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
}

function getSummaryText(accuracy: number): string {
  if (accuracy >= 80) return 'Doing wonderfully!'
  if (accuracy >= 60) return 'Making good progress'
  if (accuracy >= 40) return 'Getting better each day'
  return 'Encouraged to keep trying'
}

function getGrowthText(direction: 'up' | 'down' | 'flat', percent: number): string {
  if (direction === 'up') return `Improving! Up ${percent}%`
  if (direction === 'down') return `Slight dip of ${percent}%`
  return 'Staying steady'
}

export default function Caregiver() {
  const { sessions, getRecentSessions, getAverageAccuracy, getBestAccuracy, getTotalPlayTime } = useGameProgress()
  const { user } = useAuth()
  const [reminders] = useLocalStorage<Reminder[]>('aura-reminders', [])
  const [messages, setMessages] = useLocalStorage<FamilyMessage[]>('aura-family-messages', [])
  const [newMsg, setNewMsg] = useState('')
  const [senderName, setSenderName] = useState('')

  const recentSessions = getRecentSessions(8)
  const weeklyStats = calculateWeeklyStats(sessions)
  const growth = calculateGrowth(sessions)
  const insights = generateInsights(sessions)
  const trendData = generateTrendData(sessions)
  const weeklyChartData = generateWeeklyChartData(sessions)
  const pendingReminders = reminders.filter(r => !r.completed)

  const avgAccuracy = getAverageAccuracy()
  const summaryText = sessions.length > 0 ? getSummaryText(avgAccuracy) : 'No games played yet'

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-12 flex-wrap gap-4">
          <div>
            <h1 className="section-heading mb-2">
              Family <span className="text-gradient">Care Dashboard</span>
            </h1>
            <p className="text-charcoal-400">
              Stay connected with your loved one's daily activities and wellbeing.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-soft border border-cream-200">
            <Users size={20} className="text-rose-400" />
            <div>
              <p className="text-sm font-medium text-charcoal-800">{user?.name || 'User'}</p>
              <p className="text-xs text-charcoal-400">Caregiver</p>
            </div>
          </div>
        </div>

        {/* Warm summary banner */}
        {sessions.length > 0 && (
          <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-rose-50 via-amber-50 to-sage-50 border border-rose-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg">
                <Heart size={24} className="text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-charcoal-800">{summaryText}</p>
                <p className="text-sm text-charcoal-500">
                  {sessions.length} games played this week · {sessions.length >= 3 ? 'Great engagement!' : 'Encouraging more play'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Overview cards - warm, encouraging */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                <Gamepad2 size={18} />
              </div>
              <span className="text-sm text-charcoal-400">Games Played</span>
            </div>
            <p className="text-3xl font-bold text-charcoal-800">{sessions.length}</p>
            <p className="text-xs text-charcoal-400 mt-1">Total sessions</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <span className="text-sm text-charcoal-400">Performance</span>
            </div>
            <p className="text-3xl font-bold text-charcoal-800">
              {avgAccuracy > 0 ? `${avgAccuracy}%` : '—'}
            </p>
            <p className="text-xs text-charcoal-400 mt-1">{getSummaryText(avgAccuracy)}</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-sage-50 text-sage-500 flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
              <span className="text-sm text-charcoal-400">Trend</span>
            </div>
            <p className="text-3xl font-bold text-charcoal-800">
              {sessions.length < 2 ? '—' : getGrowthText(growth.direction, growth.percent)}
            </p>
            <p className="text-xs text-charcoal-400 mt-1">
              {sessions.length < 2 ? 'Need more data' : growth.direction === 'up' ? 'Encouraging!' : 'Keep it up'}
            </p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                <Clock size={18} />
              </div>
              <span className="text-sm text-charcoal-400">Time Spent</span>
            </div>
            <p className="text-3xl font-bold text-charcoal-800">
              {sessions.length > 0 ? `${Math.round(getTotalPlayTime() / 60)}m` : '—'}
            </p>
            <p className="text-xs text-charcoal-400 mt-1">
              {sessions.length > 0 ? 'of mindful activity' : 'No activity yet'}
            </p>
          </div>
        </div>

        {/* Send Message - PROMINENT, top section */}
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
              <MessageCircle size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-charcoal-800">Send a Message</h3>
              <p className="text-xs text-charcoal-400">Your message will appear on their home screen</p>
            </div>
          </div>
          <div className="space-y-3">
            <input type="text" value={senderName} onChange={e => setSenderName(e.target.value)}
              placeholder="Your name (e.g., Priya)"
              className="w-full px-4 py-3 rounded-xl bg-white border border-rose-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
            <div className="flex gap-2">
              <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newMsg.trim() && senderName.trim()) {
                  setMessages(prev => [...prev, { id: Date.now().toString(), from: senderName.trim(), text: newMsg.trim(), timestamp: new Date().toISOString(), read: false, type: 'text' as const }])
                  setNewMsg('')
                }}}
                placeholder="Write something encouraging..."
                className="flex-1 px-4 py-3 rounded-xl bg-white border border-rose-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              <button onClick={() => {
                if (newMsg.trim() && senderName.trim()) {
                  setMessages(prev => [...prev, { id: Date.now().toString(), from: senderName.trim(), text: newMsg.trim(), timestamp: new Date().toISOString(), read: false, type: 'text' as const }])
                  setNewMsg('')
                }
              }} className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2" disabled={!newMsg.trim() || !senderName.trim()}>
                <Send size={16} /> Send
              </button>
            </div>
          </div>
          {messages.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-charcoal-500">Recent messages:</p>
              {messages.slice(-3).reverse().map(m => (
                <div key={m.id} className="flex items-center gap-2 bg-white/60 rounded-xl px-3 py-2">
                  <Heart size={12} className="text-rose-300 flex-shrink-0" />
                  <p className="text-sm text-charcoal-600"><span className="font-medium">{m.from}:</span> {m.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly activity chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-charcoal-800 mb-2">Weekly Activity</h3>
            <p className="text-xs text-charcoal-400 mb-6">How often they played each day</p>
            {sessions.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#757575' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#757575' }} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="memory" fill="#f472b6" radius={[4, 4, 0, 0]} name="Memory Match" />
                  <Bar dataKey="recall" fill="#fb923c" radius={[4, 4, 0, 0]} name="Recall Games" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[240px] text-charcoal-300">
                <Gamepad2 size={40} className="mb-3 text-rose-200" />
                <p className="text-sm">No games played yet</p>
              </div>
            )}
          </div>

          {/* Trend chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-charcoal-800 mb-2">Performance Trend</h3>
            <p className="text-xs text-charcoal-400 mb-6">How they're improving over time</p>
            {trendData.length > 1 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#757575' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#757575' }} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="accuracy" stroke="#f472b6" strokeWidth={3} dot={{ fill: '#f472b6', r: 5 }} name="Performance" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[240px] text-charcoal-300">
                <TrendingUp size={40} className="mb-3 text-rose-200" />
                <p className="text-sm">{sessions.length === 0 ? 'Play some games to see the trend' : 'More sessions needed for a trend'}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent sessions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-charcoal-800 mb-6">Recent Activity</h3>
            <div className="space-y-3">
              {recentSessions.length > 0 ? recentSessions.map((session, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-rose-50/50 border border-rose-100/50">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    session.gameType === 'memory-match' ? 'bg-rose-100' :
                    session.gameType === 'object-recall' ? 'bg-amber-100' : 'bg-sage-100'
                  }`}>
                    {session.gameType === 'memory-match' ? '🧠' : session.gameType === 'object-recall' ? '👁️' : '🔢'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-charcoal-800 text-sm">{formatGameName(session.gameType)}</p>
                    <p className="text-xs text-charcoal-400">{new Date(session.timestamp).toLocaleDateString()} · {Math.round(session.duration / 60)}m play</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${session.accuracy >= 80 ? 'text-green-600' : session.accuracy >= 60 ? 'text-amber-600' : 'text-charcoal-500'}`}>
                      {session.accuracy >= 80 ? '🌟 Great' : session.accuracy >= 60 ? '👍 Good' : '💪 Growing'}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-charcoal-300">
                  <Gamepad2 size={40} className="mx-auto mb-3 text-rose-200" />
                  <p className="text-sm">No sessions yet. Encourage them to play a game!</p>
                </div>
              )}
            </div>
          </div>

          {/* Insights + Reminders */}
          <div className="space-y-4">
            {/* AI Insights */}
            <div className="card">
              <h3 className="text-lg font-semibold text-charcoal-800 mb-4 flex items-center gap-2">
                <Lightbulb size={20} className="text-amber-500" />
                Care Insights
              </h3>
              <div className="space-y-3">
                {insights.map((insight, i) => (
                  <div key={i} className={`rounded-2xl p-4 ${
                    i === 0 ? 'bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-100' : 'bg-cream-50 border border-cream-200'
                  }`}>
                    <p className="text-charcoal-700 text-sm leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reminders status */}
            {reminders.length > 0 && (
              <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
                <h3 className="text-sm font-semibold text-charcoal-700 mb-3 flex items-center gap-2">
                  <Bell size={14} className="text-amber-500" /> Reminders
                </h3>
                <div className="flex gap-4">
                  <div className="flex-1 text-center p-3 bg-white/60 rounded-xl">
                    <p className="text-2xl font-bold text-charcoal-800">{pendingReminders.length}</p>
                    <p className="text-xs text-charcoal-400">Pending</p>
                  </div>
                  <div className="flex-1 text-center p-3 bg-white/60 rounded-xl">
                    <p className="text-2xl font-bold text-charcoal-800">{reminders.filter(r => r.completed).length}</p>
                    <p className="text-xs text-charcoal-400">Done</p>
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-4 bg-cream-50 rounded-xl border border-cream-200">
              <p className="text-xs text-charcoal-400 leading-relaxed">
                <strong className="text-charcoal-500">Note:</strong> Insights are generated from activity data.
                AURA-NER is a supportive tool, not a clinical assessment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
