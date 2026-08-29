import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Gamepad2, Mic, Users, Pill, Clock, ChevronRight, Volume2, Heart } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { useGameProgress } from '../hooks/useGameProgress'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Reminder } from '../data/models'
import type { FamilyMessage } from '../data/demoData'
import gsap from 'gsap'

const ENCOURAGEMENTS = [
  'You are doing wonderfully today!',
  'Every small step makes a big difference!',
  'Your mind is getting stronger every day!',
  'We are so proud of your progress!',
  'Keep going, you are amazing!',
  'Today is a great day to play!',
  'Your memory is growing beautifully!',
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 6)  return { emoji: '\u{1F319}', text: 'Good Night', sub: 'Rest well \u2014 your mind is growing even in sleep.' }
  if (h < 12) return { emoji: '\u2600\uFE0F', text: 'Good Morning', sub: 'A fresh start! Ready for today\u2019s activity?' }
  if (h < 17) return { emoji: '\u{1F324}\uFE0F', text: 'Good Afternoon', sub: 'Hope you are having a lovely day!' }
  if (h < 21) return { emoji: '\u{1F305}', text: 'Good Evening', sub: 'Time for a gentle activity before dinner.' }
  return { emoji: '\u{1F319}', text: 'Good Night', sub: 'Rest well \u2014 your mind is growing even in sleep.' }
}

function getDailyEncouragement() {
  const d = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return ENCOURAGEMENTS[d % ENCOURAGEMENTS.length]
}

export default function PatientHome() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { sessions, getAverageAccuracy } = useGameProgress()
  const [reminders] = useLocalStorage<Reminder[]>('aura-reminders', [])
  const [lastActivity] = useLocalStorage<string | null>('aura-last-activity', null)
  const [messages] = useLocalStorage<FamilyMessage[]>('aura-family-messages', [])
  const [greeting] = useState(getGreeting)
  const [currentTime, setCurrentTime] = useState(() => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))

  useEffect(() => {
    const iv = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })), 30000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const els = document.querySelectorAll('.home-anim')
    gsap.fromTo(els, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out', delay: 0.1 })
  }, [])

  const pendingReminders = useMemo(() => reminders.filter(r => !r.completed).slice(0, 3), [reminders])
  const unreadMessages = useMemo(() => messages.filter(m => !m.read), [messages])
  const weeklyProgress = useMemo(() => {
    if (sessions.length < 2) return null
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
    const twoWeeksAgo = new Date(); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const thisWeek = sessions.filter(s => new Date(s.timestamp) >= weekAgo)
    const lastWeek = sessions.filter(s => { const d = new Date(s.timestamp); return d >= twoWeeksAgo && d < weekAgo })
    if (thisWeek.length === 0 || lastWeek.length === 0) return null
    const thisAvg = thisWeek.reduce((a, s) => a + s.accuracy, 0) / thisWeek.length
    const lastAvg = lastWeek.reduce((a, s) => a + s.accuracy, 0) / lastWeek.length
    const change = Math.round(thisAvg - lastAvg)
    // Build daily accuracies for last 7 days from real session data
    const dailyAccuracies: number[] = []
    for (let d = 6; d >= 0; d--) {
      const dayStart = new Date(); dayStart.setDate(dayStart.getDate() - d); dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart); dayEnd.setHours(23, 59, 59, 999)
      const daySessions = sessions.filter(s => {
        const t = new Date(s.timestamp)
        return t >= dayStart && t <= dayEnd
      })
      if (daySessions.length > 0) {
        dailyAccuracies.push(Math.round(daySessions.reduce((a, s) => a + s.accuracy, 0) / daySessions.length))
      } else {
        dailyAccuracies.push(0)
      }
    }
    return { thisWeek: thisWeek.length, thisAvg: Math.round(thisAvg), change, dailyAccuracies }
  }, [sessions])
  const gamesPlayed = sessions.length
  const avgAccuracy = getAverageAccuracy()
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen px-4 pt-20 pb-8 max-w-2xl mx-auto">
      <div className="home-anim text-center mb-8 pt-4">
        <div className="text-5xl mb-3">{greeting.emoji}</div>
        <h1 className="text-3xl md:text-4xl font-bold text-charcoal-800 dark:text-white mb-1">
          {greeting.text}, {user?.name || 'Friend'}!
        </h1>
        <p className="text-charcoal-400 dark:text-charcoal-500 text-lg">{greeting.sub}</p>
        <div className="flex items-center justify-center gap-2 mt-3 text-charcoal-300 dark:text-charcoal-500 text-sm">
          <Clock size={14} />
          <span>{currentTime}</span>
          <span className="mx-1">|</span>
          <span>{dateStr}</span>
        </div>
      </div>

      <div className="home-anim grid grid-cols-1 gap-4 mb-8">
        <Link to="/games" className="group flex items-center gap-5 p-6 rounded-3xl bg-gradient-to-br from-sage-50 to-sage-100/80 dark:from-sage-900/30 dark:to-sage-800/20 border border-sage-200/60 dark:border-sage-700/30 hover:shadow-[0_8px_30px_rgba(132,204,22,0.15)] hover:-translate-y-0.5 transition-all duration-500">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center flex-shrink-0 shadow-[0_4px_20px_rgba(132,204,22,0.3)] group-hover:scale-110 transition-transform duration-300">
            <Gamepad2 size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-charcoal-800 dark:text-white mb-1">Play a Game</h2>
            <p className="text-charcoal-400 dark:text-charcoal-500 text-sm">
              {gamesPlayed > 0 ? `You've played ${gamesPlayed} times - ${avgAccuracy > 70 ? "you're doing great!" : "let's practice more!"}` : 'Start with a fun memory game!'}
            </p>
          </div>
          <ChevronRight size={24} className="text-sage-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link to="/assistant" className="group flex items-center gap-5 p-6 rounded-3xl bg-gradient-to-br from-sky-50 to-blue-100/80 dark:from-sky-900/30 dark:to-blue-800/20 border border-sky-200/60 dark:border-sky-700/30 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:-translate-y-0.5 transition-all duration-500">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-[0_4px_20px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform duration-300">
            <Mic size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-charcoal-800 dark:text-white mb-1">Talk to Me</h2>
            <p className="text-charcoal-400 dark:text-charcoal-500 text-sm">Ask me anything - set reminders, check the date, or just chat.</p>
          </div>
          <ChevronRight size={24} className="text-sky-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link to="/family" className="group flex items-center gap-5 p-6 rounded-3xl bg-gradient-to-br from-rose-50 to-pink-100/80 dark:from-rose-900/30 dark:to-pink-800/20 border border-rose-200/60 dark:border-rose-700/30 hover:shadow-[0_8px_30px_rgba(244,114,182,0.15)] hover:-translate-y-0.5 transition-all duration-500">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-[0_4px_20px_rgba(244,114,182,0.3)] group-hover:scale-110 transition-transform duration-300">
            <Users size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-charcoal-800 dark:text-white mb-1">My Family</h2>
            <p className="text-charcoal-400 dark:text-charcoal-500 text-sm">See photos and messages from your loved ones.</p>
          </div>
          <ChevronRight size={24} className="text-rose-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {lastActivity && (
        <div className="home-anim mb-6">
          <button onClick={() => navigate(lastActivity)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/15 transition-all duration-300 text-left">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Volume2 size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal-800 dark:text-white">Continue where you left off</p>
              <p className="text-xs text-charcoal-400 dark:text-charcoal-500">Pick up right where you stopped</p>
            </div>
          </button>
        </div>
      )}

      {pendingReminders.length > 0 && (
        <div className="home-anim mb-6">
          <h3 className="text-sm font-semibold text-charcoal-500 dark:text-charcoal-400 mb-3 uppercase tracking-wider">Today's Reminders</h3>
          <div className="space-y-2">
            {pendingReminders.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/40 dark:border-white/10">
                <Pill size={18} className="text-rose-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-charcoal-800 dark:text-white">{r.title}</p>
                  {r.time && <p className="text-xs text-charcoal-400">{r.time}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {unreadMessages.length > 0 && (
        <div className="home-anim mb-6">
          <h3 className="text-sm font-semibold text-charcoal-500 dark:text-charcoal-400 mb-3 uppercase tracking-wider">Messages from Family</h3>
          <div className="space-y-2">
            {unreadMessages.map(msg => (
              <div key={msg.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/40 dark:border-white/10">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                  <Heart size={16} className="text-rose-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal-800 dark:text-white">{msg.from}</p>
                  <p className="text-xs text-charcoal-400 truncate">{msg.text}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {weeklyProgress && (
        <div className="home-anim mb-6 p-4 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/40 dark:border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider">Your Progress</h3>
            <span className={'text-sm font-bold ' + (weeklyProgress.change >= 0 ? 'text-green-500' : 'text-amber-500')}>
              {weeklyProgress.change >= 0 ? '+' + weeklyProgress.change + '%' : weeklyProgress.change + '%'}
            </span>
          </div>
          <div className="flex items-end gap-1 h-16">
            {weeklyProgress.dailyAccuracies.map((acc, i) => (
              <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-sage-400 to-sage-300 opacity-80 transition-all" style={{ height: Math.max(8, acc) + '%' }} />
            ))}
          </div>
          <p className="text-xs text-charcoal-400 mt-2 text-center">
            {weeklyProgress.change > 0
              ? 'You are getting better! ' + weeklyProgress.thisWeek + ' games this week with ' + weeklyProgress.thisAvg + '% accuracy.'
              : weeklyProgress.thisWeek + ' games played this week. Keep going!'}
          </p>
        </div>
      )}

      <div className="home-anim text-center mt-8 p-6 rounded-2xl bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-white/30 dark:border-white/10">
        <Heart size={24} className="text-rose-300 mx-auto mb-2" />
        <p className="text-charcoal-500 dark:text-charcoal-400 text-sm italic">"{getDailyEncouragement()}"</p>
      </div>
    </div>
  )
}

