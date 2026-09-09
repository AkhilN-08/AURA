import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'
import { Activity, TrendingUp, Clock, Gamepad2, Lightbulb, Sprout, Users, Bell, Heart, Send, Sparkles, MessageCircle, Image, Smile } from 'lucide-react'
import { useState } from 'react'
import { useGameProgress } from '../hooks/useGameProgress'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { generateInsights, formatGameName, calculateWeeklyStats, calculateGrowth, generateTrendData, generateWeeklyChartData } from '../utils/analytics'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Reminder } from '../data/models'
import type { FamilyMessage } from '../data/demoData'
import type { FamilyPhotoMessage } from '../data/models'

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

function getGrowthText(direction: 'up' | 'down' | 'flat', percent: number, t: (k: string, v?: Record<string, string | number>) => string): string {
  if (direction === 'up') return t('Improving! Up {n}%', { n: percent })
  if (direction === 'down') return t('Slight dip of {n}%', { n: percent })
  return t('Staying steady')
}

export default function Caregiver() {
  const { t } = useTranslation()
  const { sessions, getRecentSessions, getAverageAccuracy, getBestAccuracy, getTotalPlayTime } = useGameProgress()
  const { user } = useAuth()
  const [reminders] = useLocalStorage<Reminder[]>('aura-reminders', [])
  const [messages, setMessages] = useLocalStorage<FamilyMessage[]>('aura-family-messages', [])
  const [photoMessages, setPhotoMessages] = useLocalStorage<FamilyPhotoMessage[]>('aura-family-photos', [])
  const [newMsg, setNewMsg] = useState('')
  const [senderName, setSenderName] = useState('')
  const [photoCaption, setPhotoCaption] = useState('')
  const [photoFile, setPhotoFile] = useState<string | null>(null)

  const recentSessions = getRecentSessions(8)
  const weeklyStats = calculateWeeklyStats(sessions)
  const growth = calculateGrowth(sessions)
  const insights = generateInsights(sessions)
  const trendData = generateTrendData(sessions)
  const weeklyChartData = generateWeeklyChartData(sessions)
  const pendingReminders = reminders.filter(r => !r.completed)

  const avgAccuracy = getAverageAccuracy()
  const summaryText = sessions.length > 0 ? t(getSummaryText(avgAccuracy)) : t('No games played yet')

  const handleSend = () => {
    if (!newMsg.trim() || !senderName.trim()) return
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      from: senderName.trim(),
      text: newMsg.trim(),
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text',
    }])
    setNewMsg('')
  }

  const handleSendPhoto = () => {
    if (!photoCaption.trim() || !senderName.trim() || !photoFile) return
    setPhotoMessages(prev => [...prev, {
      id: Date.now().toString(),
      from: senderName.trim(),
      caption: photoCaption.trim(),
      photoData: photoFile,
      timestamp: new Date().toISOString(),
      read: false,
    }])
    setPhotoCaption('')
    setPhotoFile(null)
  }

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const data = reader.result as string
      setPhotoFile(data)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-12 flex-wrap gap-4">
          <div>
            <h1 className="section-heading mb-2">
              {t('Family')} <span className="text-gradient">{t('Care Dashboard')}</span>
            </h1>
            <p className="text-charcoal-400">
              {t("Stay connected with your loved one's daily activities and wellbeing.")}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-soft border border-cream-200">
            <Users size={20} className="text-rose-400" />
            <div>
              <p className="text-sm font-medium text-charcoal-800">{user?.name || t('User')}</p>
              <p className="text-xs text-charcoal-400">{t('Caregiver')}</p>
            </div>
          </div>
        </div>

        {/* ── AURA Observation — calm, neutral, data-honest ── */}
        {sessions.length >= 2 && (() => {
          const sorted = [...sessions].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          const last3 = sorted.slice(-3)
          const prev3 = sorted.slice(-6, -3)
          const avg = (arr: typeof sessions) => arr.length ? Math.round(arr.reduce((x, s) => x + s.accuracy, 0) / arr.length) : 0
          const a3 = avg(last3), p3 = avg(prev3)
          const obs: string[] = []
          if (prev3.length > 0) {
            if (a3 >= p3) obs.push(t('Recall accuracy improved across the last 3 sessions.'))
            else obs.push(t('Recall accuracy dipped slightly across the last 3 sessions — a good day to revisit a favorite activity.'))
          }
          const rt = last3.filter(s => typeof s.responseTime === 'number')
          if (rt.length >= 2) {
            const avgRt = rt.reduce((x, s) => x + (s.responseTime ?? 0), 0) / rt.length
            const olderRt = sorted.slice(-6, -3).filter(s => typeof s.responseTime === 'number')
            if (olderRt.length >= 2) {
              const avgOld = olderRt.reduce((x, s) => x + (s.responseTime ?? 0), 0) / olderRt.length
              if (avgRt > avgOld * 1.15) obs.push(t('Sequence activities took slightly longer today — perhaps a tired day. No pressure.'))
              else if (avgRt < avgOld * 0.85) obs.push(t('Responses were quicker today — a lively day.'))
            }
          }
          const cat = new Map<string, number[]>()
          for (const s of sorted.slice(-10)) {
            const c = s.category ?? 'memory'
            if (!cat.has(c)) cat.set(c, [])
            cat.get(c)!.push(s.accuracy)
          }
          let strongest = ''
          let best = -1
          for (const [c, accs] of cat) {
            const v = accs.reduce((x, y) => x + y, 0) / accs.length
            if (v > best) { best = v; strongest = c }
          }
          const catNames: Record<string, string> = {
            memory: t('Visual Memory'), recognition: t('Recognition'),
            attention: t('Attention'), routine: t('Routine Awareness'),
          }
          if (strongest) obs.push(t('Engagement looks strongest in {cat} activities lately.', { cat: catNames[strongest] ?? strongest }))
          if (obs.length === 0) obs.push(t('AURA is still getting to know the rhythm — a few more sessions and gentle patterns will appear here.'))
          return (
            <div className="mb-8 border-2 border-[#e4dccd] rounded-3xl bg-gradient-to-br from-[#faf6ee] to-[#f3ead9] p-6">
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#8a7d68] mb-4">
                <Sprout size={13} className="text-[#7c9a6d]" />
                {t('AURA OBSERVATION')}
              </p>
              <div className="space-y-2.5">
                {obs.map((o, i) => (
                  <p key={i} className="font-serif-display text-lg md:text-xl text-[#4a4237] leading-snug">“{o}”</p>
                ))}
              </div>
              <p className="mt-4 text-xs text-[#a08d70]">{t('Simple observations from activity data — never a diagnosis.')}</p>
            </div>
          )
        })()}

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
                  {t('{n} games played this week', { n: sessions.length })} · {sessions.length >= 3 ? t('Great engagement!') : t('Encouraging more play')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Overview cards - warm, encouraging, no raw percentages */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                <Gamepad2 size={18} />
              </div>
              <span className="text-sm text-charcoal-400">{t('Games Played')}</span>
            </div>
            <p className="text-3xl font-bold text-charcoal-800">{sessions.length}</p>
            <p className="text-xs text-charcoal-400 mt-1">{t('Total sessions')}</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <span className="text-sm text-charcoal-400">{t('Performance')}</span>
            </div>
            <p className="text-3xl font-bold text-charcoal-800">
              {avgAccuracy > 0 ? `${avgAccuracy}%` : '—'}
            </p>
            <p className="text-xs text-charcoal-400 mt-1">{t(getSummaryText(avgAccuracy))}</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-sage-50 text-sage-500 flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
              <span className="text-sm text-charcoal-400">{t('Trend')}</span>
            </div>
            <p className="text-3xl font-bold text-charcoal-800">
              {sessions.length < 2 ? '—' : getGrowthText(growth.direction, growth.percent, t)}
            </p>
            <p className="text-xs text-charcoal-400 mt-1">
              {sessions.length < 2 ? t('Need more data') : growth.direction === 'up' ? t('Encouraging!') : t('Keep it up')}
            </p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                <Clock size={18} />
              </div>
              <span className="text-sm text-charcoal-400">{t('Time Spent')}</span>
            </div>
            <p className="text-3xl font-bold text-charcoal-800">
              {sessions.length > 0 ? `${Math.round(getTotalPlayTime() / 60)}${t('m')}` : '—'}
            </p>
            <p className="text-xs text-charcoal-400 mt-1">
              {sessions.length > 0 ? t('of mindful activity') : t('No activity yet')}
            </p>
          </div>
        </div>

        {/* Send a Message - PROMINENT, top section */}
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                <MessageCircle size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-charcoal-800">{t('Send a Message')}</h3>
                <p className="text-xs text-charcoal-400">{t('Your words will appear on their home screen')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!senderName.trim()) setSenderName('You')
                setPhotoCaption('')
                setPhotoFile(null)
              }}
              className="text-xs text-rose-500 hover:text-rose-600 font-medium"
            >
              {t('+ Add a photo')}
            </button>
          </div>

          <div className="space-y-3">
            <input type="text" value={senderName} onChange={e => setSenderName(e.target.value)}
              placeholder={t('Your name (e.g., Priya)')}
              className="w-full px-4 py-3 rounded-xl bg-white border border-rose-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />

            <div className="flex gap-2">
              <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newMsg.trim() && senderName.trim()) handleSend() }}
                placeholder={t('Write something encouraging...')}
                className="flex-1 px-4 py-3 rounded-xl bg-white border border-rose-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              <button onClick={handleSend}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                disabled={!newMsg.trim() || !senderName.trim()}>
                <Send size={16} /> {t('Send')}
              </button>
            </div>

            {photoFile && (
              <div className="rounded-xl overflow-hidden border border-rose-200 bg-white/70 p-2">
                <img src={photoFile} alt={photoCaption || 'Photo'} className="w-full aspect-square object-cover" />
                <div className="p-2">
                  <input type="text" value={photoCaption} onChange={e => setPhotoCaption(e.target.value)}
                    placeholder={t('Add a short caption...')}
                    className="w-full px-2 py-1.5 rounded-lg bg-white border border-rose-100 text-xs focus:outline-none focus:ring-2 focus:ring-rose-300" />
                </div>
              </div>
            )}
          </div>

          {messages.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-charcoal-500">{t('Recent messages:')}</p>
              {messages.slice(-3).reverse().map(m => (
                <div key={m.id} className="flex items-center gap-2 bg-white/60 rounded-xl px-3 py-2">
                  <Heart size={12} className="text-rose-300 flex-shrink-0" />
                  <p className="text-sm text-charcoal-600"><span className="font-medium">{m.from}:</span> {m.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Send a photo message */}
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
              <Image size={18} className="text-white" />
            </div>
            <div>                <h3 className="text-lg font-semibold text-charcoal-800">{t('Send a Photo Message')}</h3>
              <p className="text-xs text-charcoal-400">{t('A picture from home lands right on their screen')}</p>
            </div>
          </div>

          <div className="space-y-3">
            {!photoFile ? (
              <div className="border-2 border-dashed border-sky-200 rounded-xl p-6 text-center hover:border-sky-300 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImagePick}
                  className="hidden"
                  id="caregiver-photo-upload"
                />
                <label htmlFor="caregiver-photo-upload" className="cursor-pointer">
                  <Image size={32} className="mx-auto text-sky-400 mb-2" />
                  <p className="text-sm text-charcoal-500">{t('Choose a photo to send')}</p>
                  <p className="text-xs text-charcoal-400 mt-1">{t('Family photos, a meal, a flower from the garden — anything familiar')}</p>
                </label>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-sky-200 bg-white/70">
                <img src={photoFile} alt={photoCaption || 'Selected photo'} className="w-full aspect-square object-cover" />
                <div className="p-3">
                  <input type="text" value={photoCaption} onChange={e => setPhotoCaption(e.target.value)}
                    placeholder={t('Add a short caption...')}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-sky-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={handleSendPhoto}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                disabled={!photoCaption.trim() || !senderName.trim() || !photoFile}>
                <Send size={16} /> {t('Send Photo')}
              </button>
              <button onClick={() => { setPhotoFile(null); setPhotoCaption('') }}
                className="px-6 py-3 rounded-xl bg-white text-charcoal-600 border border-sky-200 font-medium hover:bg-white/80 transition-all">
                {t('Cancel')}
              </button>
            </div>
          </div>
        </div>

        {/* Mood check-in status */}
        {sessions.length > 0 && (
          <div className="mb-8 p-5 rounded-2xl bg-amber-50/70 border border-amber-100">
            <div className="flex items-center gap-3 mb-3">
              <Smile size={18} className="text-amber-500" />
              <span className="text-sm font-medium text-charcoal-700">{t("Today's mood check-in")}</span>
            </div>
            <p className="text-sm text-charcoal-500">
              {t("Remind them each morning to share how they're feeling. The response helps you notice patterns over time.")}
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly activity chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-charcoal-800 mb-2">{t('Weekly Activity')}</h3>
            <p className="text-xs text-charcoal-400 mb-6">{t('How often they played each day')}</p>
            {sessions.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#757575' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#757575' }} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="memory" fill="#f472b6" radius={[4, 4, 0, 0]} name={t('Memory Match')} />
                  <Bar dataKey="recall" fill="#fb923c" radius={[4, 4, 0, 0]} name={t('Recall Games')} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[240px] text-charcoal-300">
                <Gamepad2 size={40} className="mb-3 text-rose-200" />
                <p className="text-sm">{t('No games played yet')}</p>
              </div>
            )}
          </div>

          {/* Trend chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-charcoal-800 mb-2">{t('Performance Trend')}</h3>
            <p className="text-xs text-charcoal-400 mb-6">{t("How they're improving over time")}</p>
            {trendData.length > 1 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#757575' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#757575' }} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="accuracy" stroke="#f472b6" strokeWidth={3} dot={{ fill: '#f472b6', r: 5 }} name={t('Performance')} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[240px] text-charcoal-300">
                <TrendingUp size={40} className="mb-3 text-rose-200" />
                <p className="text-sm">{sessions.length === 0 ? t('Play some games to see the trend') : t('More sessions needed for a trend')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent sessions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-charcoal-800 mb-6">{t('Recent Activity')}</h3>
            <div className="space-y-3">
              {recentSessions.length > 0 ? recentSessions.map((session, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-rose-50/50 border border-rose-100/50">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${session.gameType === 'memory-match' ? 'bg-rose-100' : session.gameType === 'object-recall' ? 'bg-amber-100' : 'bg-sage-100'}`}>
                    {session.gameType === 'memory-match' ? '🧠' : session.gameType === 'object-recall' ? '👁️' : '🔢'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-charcoal-800 text-sm">{t(formatGameName(session.gameType))}</p>
                    <p className="text-xs text-charcoal-400">{new Date(session.timestamp).toLocaleDateString()} · {Math.round(session.duration / 60)}{t('m')} {t('play')}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${session.accuracy >= 80 ? 'text-green-600' : session.accuracy >= 60 ? 'text-amber-600' : 'text-charcoal-500'}`}>
                      {session.accuracy >= 80 ? t('🌟 Great') : session.accuracy >= 60 ? t('👍 Good') : t('💪 Growing')}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-charcoal-300">
                  <Gamepad2 size={40} className="mx-auto mb-3 text-rose-200" />
                  <p className="text-sm">{t('No sessions yet. Encourage them to play a game!')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Insights + Reminders */}
          <div className="space-y-4">
            {/* Care Insights */}
            <div className="card">
              <h3 className="text-lg font-semibold text-charcoal-800 mb-4 flex items-center gap-2">
                <Lightbulb size={20} className="text-amber-500" />
                {t('Care Insights')}
              </h3>
              <div className="space-y-3">
                {insights.map((insight, i) => (
                  <div key={i} className={`rounded-2xl p-4 ${i === 0 ? 'bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-100' : 'bg-cream-50 border border-cream-200'}`}>
                    <p className="text-charcoal-700 text-sm leading-relaxed">{t(insight)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reminders status */}
            {reminders.length > 0 && (
              <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
                <h3 className="text-sm font-semibold text-charcoal-700 mb-3 flex items-center gap-2">
                  <Bell size={14} className="text-amber-500" /> {t('Reminders')}
                </h3>
                <div className="flex gap-4">
                  <div className="flex-1 text-center p-3 bg-white/60 rounded-xl">
                    <p className="text-2xl font-bold text-charcoal-800">{pendingReminders.length}</p>
                    <p className="text-xs text-charcoal-400">{t('Pending')}</p>
                  </div>
                  <div className="flex-1 text-center p-3 bg-white/60 rounded-xl">
                    <p className="text-2xl font-bold text-charcoal-800">{reminders.filter(r => r.completed).length}</p>
                    <p className="text-xs text-charcoal-400">{t('Done')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-4 bg-cream-50 rounded-xl border border-cream-200">
              <p className="text-xs text-charcoal-400 leading-relaxed">
                <strong className="text-charcoal-500">{t('Note')}:</strong> {t('Insights are generated from activity data. AURA-NER is a supportive tool, not a clinical assessment.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
