import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Gamepad2, Mic, Users, Pill, Clock, ChevronRight, Volume2, Heart, Sparkles, Brain, Eye, Hash, BookOpen, Grid3X3, Palette, BookMarked } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { useGameProgress } from '../hooks/useGameProgress'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { playTapSound } from '../utils/audio'
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

/* ── Analog Clock ──────────────────────────────────────────────── */
function AnalogClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  const s = now.getSeconds()
  const m = now.getMinutes()
  const h = now.getHours() % 12

  const secDeg = s * 6
  const minDeg = m * 6 + s * 0.1
  const hrDeg = h * 30 + m * 0.5
  const cx = 80, cy = 80

  const ticks = Array.from({ length: 60 }, (_, i) => i)
  const numbers = [
    { num: 12, deg: 0 }, { num: 1, deg: 30 }, { num: 2, deg: 60 },
    { num: 3, deg: 90 }, { num: 4, deg: 120 }, { num: 5, deg: 150 },
    { num: 6, deg: 180 }, { num: 7, deg: 210 }, { num: 8, deg: 240 },
    { num: 9, deg: 270 }, { num: 10, deg: 300 }, { num: 11, deg: 330 },
  ]

  const toXY = (deg: number, r: number) => {
    const rad = (deg - 90) * (Math.PI / 180)
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  return (
    <svg viewBox="0 0 160 160" width="140" height="140" style={{ display: 'block', margin: '0 auto' }}>
      <defs>
        <filter id="clockShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.12" />
        </filter>
        <radialGradient id="faceGrad" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#fefefe" />
          <stop offset="100%" stopColor="#f0ede8" />
        </radialGradient>
        <linearGradient id="rimGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4c9b8" />
          <stop offset="50%" stopColor="#b8a994" />
          <stop offset="100%" stopColor="#c4b5a2" />
        </linearGradient>
      </defs>

      <circle cx={cx} cy={cy} r="76" fill="url(#rimGrad)" filter="url(#clockShadow)" />
      <circle cx={cx} cy={cy} r="73" fill="none" stroke="#a89882" strokeWidth="0.5" />
      <circle cx={cx} cy={cy} r="70" fill="url(#faceGrad)" />
      <circle cx={cx} cy={cy} r="70" fill="none" stroke="#e0d8cc" strokeWidth="0.5" />

      {ticks.map(i => {
        const isHour = i % 5 === 0
        const outer = 65
        const inner = isHour ? 56 : 61
        const p1 = toXY(i * 6, outer)
        const p2 = toXY(i * 6, inner)
        return (
          <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={isHour ? '#2d2a26' : '#b5ad9f'}
            strokeWidth={isHour ? 2 : 0.7}
            strokeLinecap="round"
          />
        )
      })}

      {numbers.map(({ num, deg }) => {
        const p = toXY(deg, 48)
        const isMain = num % 3 === 0
        return (
          <text key={num} x={p.x} y={p.y}
            textAnchor="middle" dominantBaseline="central"
            fill="#2d2a26"
            style={{ fontSize: isMain ? 13 : 10.5, fontWeight: isMain ? 700 : 500, fontFamily: 'Georgia, Times New Roman, serif' }}
          >{num}</text>
        )
      })}

      <line x1={cx} y1={cy + 5} x2={cx} y2={cy - 35}
        stroke="#2d2a26" strokeWidth="3.5" strokeLinecap="round"
        transform={`rotate(${hrDeg} ${cx} ${cy})`}
      />
      <line x1={cx} y1={cy + 6} x2={cx} y2={cy - 55}
        stroke="#2d2a26" strokeWidth="2.2" strokeLinecap="round"
        transform={`rotate(${minDeg} ${cx} ${cy})`}
      />
      <line x1={cx} y1={cy + 12} x2={cx} y2={cy - 58}
        stroke="#c0392b" strokeWidth="1" strokeLinecap="round"
        transform={`rotate(${secDeg} ${cx} ${cy})`}
      />

      <circle cx={cx} cy={cy} r="3.5" fill="#2d2a26" />
      <circle cx={cx} cy={cy} r="1.8" fill="#c0392b" />
    </svg>
  )
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
  const gamesPlayed = sessions.length
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  // Today's recommended game based on day of week
  const GAME_RECS = [
    { id: 'memory-match', name: 'Memory Match', icon: Brain, color: 'from-sage-400 to-sage-600', tip: 'Find matching pairs of cards' },
    { id: 'object-recall', name: 'Object Recall', icon: Eye, color: 'from-sky-400 to-blue-600', tip: 'Remember the objects you saw' },
    { id: 'sequence-recall', name: 'Sequence Recall', icon: Hash, color: 'from-amber-400 to-amber-600', tip: 'Reproduce the number sequence' },
    { id: 'word-association', name: 'Word Association', icon: BookOpen, color: 'from-sage-400 to-sage-600', tip: 'Match related words from memory' },
    { id: 'pattern-grid', name: 'Pattern Grid', icon: Grid3X3, color: 'from-purple-400 to-purple-600', tip: 'Recreate the pattern you saw' },
    { id: 'story-recall', name: 'Story Recall', icon: BookMarked, color: 'from-amber-500 to-orange-600', tip: 'Answer questions about a story' },
    { id: 'color-sequence', name: 'Color Sequence', icon: Palette, color: 'from-pink-400 to-pink-600', tip: 'Watch and repeat the color pattern' },
  ]
  const todayRec = GAME_RECS[new Date().getDay() % GAME_RECS.length]

  return (
    <div className="min-h-screen px-4 pt-20 pb-8 max-w-2xl mx-auto">        <div className="home-anim text-center mb-8 pt-4">
        <div className="text-5xl mb-3">{greeting.emoji}</div>
        <h1 className="text-3xl md:text-4xl font-bold text-charcoal-800 dark:text-white mb-1">
          {greeting.text}, {user?.name || 'Friend'}!
        </h1>
        <p className="text-charcoal-400 dark:text-charcoal-500 text-lg">{greeting.sub}</p>
        {/* Analog Clock */}
        <div className="flex justify-center mt-4 mb-2">
          <AnalogClock />
        </div>
        <div className="flex items-center justify-center gap-2 text-charcoal-300 dark:text-charcoal-500 text-sm">
          <Clock size={14} />
          <span>{currentTime}</span>
          <span className="mx-1">|</span>
          <span>{dateStr}</span>
        </div>
      </div>

      <div className="home-anim grid grid-cols-1 gap-4 mb-8">
        <Link to="/games" onClick={() => playTapSound()} className="group flex items-center gap-5 p-6 rounded-3xl bg-gradient-to-br from-sage-50 to-sage-100/80 dark:from-sage-900/30 dark:to-sage-800/20 border border-sage-200/60 dark:border-sage-700/30 hover:shadow-[0_8px_30px_rgba(132,204,22,0.15)] hover:-translate-y-0.5 transition-all duration-500">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center flex-shrink-0 shadow-[0_4px_20px_rgba(132,204,22,0.3)] group-hover:scale-110 transition-transform duration-300">
            <Gamepad2 size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-charcoal-800 dark:text-white mb-1">Play a Game</h2>
            <p className="text-charcoal-400 dark:text-charcoal-500 text-sm">
              {gamesPlayed > 0 ? "You're doing great! Let's play again!" : 'Start with a fun memory game!'}
            </p>
          </div>
          <ChevronRight size={24} className="text-sage-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link to="/assistant" onClick={() => playTapSound()} className="group flex items-center gap-5 p-6 rounded-3xl bg-gradient-to-br from-sky-50 to-blue-100/80 dark:from-sky-900/30 dark:to-blue-800/20 border border-sky-200/60 dark:border-sky-700/30 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:-translate-y-0.5 transition-all duration-500">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-[0_4px_20px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform duration-300">
            <Mic size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-charcoal-800 dark:text-white mb-1">Talk to Me</h2>
            <p className="text-charcoal-400 dark:text-charcoal-500 text-sm">Ask me anything - set reminders, check the date, or just chat.</p>
          </div>
          <ChevronRight size={24} className="text-sky-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link to="/family" onClick={() => playTapSound()} className="group flex items-center gap-5 p-6 rounded-3xl bg-gradient-to-br from-rose-50 to-pink-100/80 dark:from-rose-900/30 dark:to-pink-800/20 border border-rose-200/60 dark:border-rose-700/30 hover:shadow-[0_8px_30px_rgba(244,114,182,0.15)] hover:-translate-y-0.5 transition-all duration-500">
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

      {/* Today's Game */}
      <div className="home-anim mb-6">
        <Link to={`/games`} className="group block p-5 rounded-3xl bg-gradient-to-br from-white/70 to-white/40 dark:from-white/10 dark:to-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 hover:shadow-[0_8px_30px_rgba(132,204,22,0.15)] hover:-translate-y-0.5 transition-all duration-500">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-amber-500" />
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Today's Game</span>
          </div>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${todayRec.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <todayRec.icon size={26} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-charcoal-800 dark:text-white">{todayRec.name}</h3>
              <p className="text-sm text-charcoal-400 dark:text-charcoal-500">{todayRec.tip}</p>
            </div>
            <ChevronRight size={22} className="text-sage-400 group-hover:translate-x-1 transition-transform" />
          </div>
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
        <div className="home-anim mb-6">              <h3 className="text-sm font-semibold text-charcoal-500 dark:text-charcoal-400 mb-3 uppercase tracking-wider">Reminders</h3>
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

      {sessions.length > 0 && (
        <div className="home-anim mb-6 p-4 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/40 dark:border-white/10">
          <h3 className="text-sm font-semibold text-charcoal-500 dark:text-charcoal-400 mb-3 uppercase tracking-wider">Your Memory Garden</h3>
          <div className="flex items-center justify-center gap-1">
            {Array.from({ length: Math.min(sessions.length, 7) }).map((_, i) => (
              <span key={i} className="text-2xl">🌸</span>
            ))}
          </div>
          <p className="text-xs text-charcoal-400 mt-2 text-center">{sessions.length} games played. You're doing great!</p>
        </div>
      )}

      <div className="home-anim text-center mt-8 p-6 rounded-2xl bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-white/30 dark:border-white/10">
        <Heart size={24} className="text-rose-300 mx-auto mb-2" />
        <p className="text-charcoal-500 dark:text-charcoal-400 text-sm italic">"{getDailyEncouragement()}"</p>
      </div>
    </div>
  )
}

