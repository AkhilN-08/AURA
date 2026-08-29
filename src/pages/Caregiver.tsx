import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import { Activity, TrendingUp, Clock, Gamepad2, Lightbulb, Users, BarChart3, Bell, Brain, Mic, Heart, Shield, Sparkles, ArrowRight } from 'lucide-react'
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
            <Users size={20} className="text-sage-500" />
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
              <div className="w-10 h-10 rounded-xl bg-sage-50 text-sage-500 flex items-center justify-center">
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
                  <Bar dataKey="memory" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Memory Match" />
                  <Bar dataKey="recall" fill="#60A5FA" radius={[4, 4, 0, 0]} name="Recall & Recognition" />
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
                  <Line type="monotone" dataKey="accuracy" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', r: 5 }} name="Accuracy %" />
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
                    session.gameType === 'memory-match' ? 'bg-sage-100' :
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
                  i === 0 ? 'bg-sage-50 border border-forest-100' : 'bg-cream-50 border border-cream-200'
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

            {/* Send Message to Patient */}
            <div className="mt-6 p-4 bg-white/60 rounded-xl border border-white/50">
              <h4 className="font-semibold text-charcoal-800 mb-3">Send a Message</h4>
              <input type="text" value={senderName} onChange={e => setSenderName(e.target.value)}
                placeholder="Your name (e.g., Priya)"
                className="w-full px-3 py-2 rounded-lg border border-cream-200 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-rose-300" />
              <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newMsg.trim() && senderName.trim()) {
                  setMessages(prev => [...prev, { id: Date.now().toString(), from: senderName.trim(), text: newMsg.trim(), timestamp: new Date().toISOString(), read: false, type: 'text' as const }])
                  setNewMsg('')
                }}}
                placeholder="Type a message for your loved one..."
                className="w-full px-3 py-2 rounded-lg border border-cream-200 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-rose-300" />
              <button onClick={() => {
                if (newMsg.trim() && senderName.trim()) {
                  setMessages(prev => [...prev, { id: Date.now().toString(), from: senderName.trim(), text: newMsg.trim(), timestamp: new Date().toISOString(), read: false, type: 'text' as const }])
                  setNewMsg('')
                }
              }} className="w-full py-2 rounded-lg bg-gradient-to-r from-rose-400 to-pink-500 text-white text-sm font-medium disabled:opacity-50" disabled={!newMsg.trim() || !senderName.trim()}>
                Send Message
              </button>
              {messages.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-medium text-charcoal-500">Recent messages:</p>
                  {messages.slice(-3).reverse().map(m => (
                    <p key={m.id} className="text-xs text-charcoal-400">{m.from}: {m.text}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-cream-50 rounded-xl">
              <p className="text-xs text-charcoal-400 leading-relaxed">
                <strong>Note:</strong> Insights are generated from your actual activity data.
                AURA-NER is not a diagnostic tool and should not be used as a substitute for professional medical assessment.
              </p>
            </div>
          </div>
        </div>

        {/* About AURA-NER */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center shadow-lg">
              <Sparkles size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-charcoal-800">About AURA-NER</h2>
              <p className="text-charcoal-400 text-sm">AI-Based Cognitive Gaming and Memory Assistance for the North Eastern Region</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* What is AURA-NER */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-charcoal-800 mb-3 flex items-center gap-2">
                <Heart size={18} className="text-rose-400" /> What is AURA-NER?
              </h3>
              <p className="text-charcoal-500 text-sm leading-relaxed">
                AURA-NER is an AI-powered cognitive gaming and memory assistance platform designed specifically for elderly people in the North Eastern Region of India. It combines gentle cognitive exercises with voice-powered assistance to keep minds active and families connected.
              </p>
            </div>

            {/* Who is it for */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-charcoal-800 mb-3 flex items-center gap-2">
                <Users size={18} className="text-sky-500" /> Who is it for?
              </h3>
              <p className="text-charcoal-500 text-sm leading-relaxed">
                Built for elderly individuals experiencing memory challenges or early-stage dementia, and their caregivers. The app adapts to each user's cognitive level through an initial assessment and continuously personalizes the experience.
              </p>
            </div>
          </div>

          {/* Feature breakdown */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center mx-auto mb-3 shadow-md">
                <Brain size={22} className="text-white" />
              </div>
              <h4 className="font-semibold text-charcoal-800 mb-1">7 Cognitive Games</h4>
              <p className="text-xs text-charcoal-400 leading-relaxed">
                Memory Match, Object Recall, Sequence Recall, Word Association, Pattern Grid, Story Recall, and Color Sequence. Each game adapts difficulty based on performance.
              </p>
            </div>

            <div className="card p-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-md">
                <Mic size={22} className="text-white" />
              </div>
              <h4 className="font-semibold text-charcoal-800 mb-1">Voice Assistant</h4>
              <p className="text-xs text-charcoal-400 leading-relaxed">
                Natural voice interaction for setting reminders, checking the date, making calls, and daily routines. Just speak naturally — the assistant understands context.
              </p>
            </div>

            <div className="card p-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-md">
                <BarChart3 size={22} className="text-white" />
              </div>
              <h4 className="font-semibold text-charcoal-800 mb-1">AI-Powered Insights</h4>
              <p className="text-xs text-charcoal-400 leading-relaxed">
                Tracks cognitive trends over time. Generates personalized insights about progress, strengths, and areas that need gentle practice.
              </p>
            </div>

            <div className="card p-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-md">
                <Heart size={22} className="text-white" />
              </div>
              <h4 className="font-semibold text-charcoal-800 mb-1">Family Connection</h4>
              <p className="text-xs text-charcoal-400 leading-relaxed">
                Caregivers can send messages and photos that appear on the patient's home screen. A bridge between family members, even when apart.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="card p-6 mt-6">
            <h3 className="text-lg font-semibold text-charcoal-800 mb-4">How It Works</h3>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
                <div>
                  <p className="font-medium text-charcoal-800 text-sm">Cognitive Assessment</p>
                  <p className="text-xs text-charcoal-400 mt-1">A gentle 5-step assessment evaluates memory, focus, sequence recall, word recall, and reaction time — all through simple taps, no typing required.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
                <div>
                  <p className="font-medium text-charcoal-800 text-sm">Personalized Experience</p>
                  <p className="text-xs text-charcoal-400 mt-1">Based on assessment results, the AI sets an appropriate difficulty level and recommends specific games. Difficulty adjusts automatically as the user plays.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
                <div>
                  <p className="font-medium text-charcoal-800 text-sm">Daily Engagement</p>
                  <p className="text-xs text-charcoal-400 mt-1">The home screen greets users by name, suggests a daily game, shows reminders, and displays messages from family. Warm encouragement replaces cold metrics.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Safety & Privacy */}
          <div className="card p-5 mt-6 bg-sage-50/50 border-sage-200/50">
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-sage-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-charcoal-800 text-sm">Safety & Privacy</p>
                <p className="text-xs text-charcoal-400 mt-1 leading-relaxed">
                  All data is stored locally on the device. AURA-NER is not a diagnostic tool and should not replace professional medical assessment. It is designed as a supplementary wellness companion to support cognitive health.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
