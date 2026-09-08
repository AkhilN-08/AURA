import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gamepad2, Mic, Users, Pill, Clock, ChevronRight, Volume2, Heart, Sparkles, Smile, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { useGameProgress } from '../hooks/useGameProgress'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { playTapSound, speakText } from '../utils/audio'
import type { Reminder } from '../data/models'
import { GAME_TYPES } from '../data/models'
import type { FamilyMessage } from '../data/demoData'
import type { FamilyPhotoMessage } from '../data/models'
import { generateDemoMessages, generateDemoReminders } from '../data/demoData'
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

  return (
    <div style={{
      width: 140, height: 140, borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.5) 100%)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.8)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.05)',
      position: 'relative', margin: '0 auto',
    }}>
      <div style={{
        position: 'absolute', inset: 4, borderRadius: '50%',
        border: '0.5px solid rgba(255,255,255,0.6)',
        pointerEvents: 'none',
      }} />

      {Array.from({ length: 60 }, (_, i) => {
        const isHour = i % 5 === 0
        const angle = i * 6
        return (
          <div key={i} style={{
            position: 'absolute',
            width: isHour ? 2 : 0.8,
            height: isHour ? 10 : 5,
            background: isHour ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.2)',
            borderRadius: 1,
            left: '50%', top: 6,
            transformOrigin: '50% 64px',
            transform: 'translateX(-50%) rotate(' + angle + 'deg)',
          }} />
        )
      })}

      {[
        { n: 12, d: 0 }, { n: 3, d: 90 }, { n: 6, d: 180 }, { n: 9, d: 270 }
      ].map(({ n, d }) => {
        const rad = (d - 90) * (Math.PI / 180)
        const r = 48
        return (
          <span key={n} style={{
            position: 'absolute',
            left: 70 + r * Math.cos(rad) - 7,
            top: 70 + r * Math.sin(rad) - 8,
            fontSize: 14, fontWeight: 600,
            color: 'rgba(0,0,0,0.7)',
            fontFamily: '-apple-system, SF Pro Display, Helvetica Neue, sans-serif',
            width: 14, textAlign: 'center',
          }}>{n}</span>
        )
      })}

      <div style={{
        position: 'absolute', width: 3.5, height: 30,
        background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.6))',
        borderRadius: 2, left: '50%', bottom: '50%',
        transformOrigin: 'bottom center',
        transform: 'translateX(-50%) rotate(' + hrDeg + 'deg)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />

      <div style={{
        position: 'absolute', width: 2.5, height: 44,
        background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.5))',
        borderRadius: 2, left: '50%', bottom: '50%',
        transformOrigin: 'bottom center',
        transform: 'translateX(-50%) rotate(' + minDeg + 'deg)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      }} />

      <div style={{
        position: 'absolute', width: 1, height: 48,
        background: 'linear-gradient(to top, #FF3B30, rgba(255,59,48,0.6))',
        borderRadius: 0.5, left: '50%', bottom: '50%',
        transformOrigin: 'bottom center',
        transform: 'translateX(-50%) rotate(' + secDeg + 'deg)',
      }} />

      <div style={{
        position: 'absolute', width: 10, height: 10,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.4))',
        border: '1.5px solid rgba(0,0,0,0.15)',
        borderRadius: '50%', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
      }} />

      <div style={{
        position: 'absolute',
        width: '60%', height: '30%',
        top: '8%', left: '20%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
    </div>
  )
}

function getDailyEncouragement() {
  const d = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return ENCOURAGEMENTS[d % ENCOURAGEMENTS.length]
}

export default function PatientHome() {
  const { user } = useAuth()
  const { t, language } = useTranslation()
  const navigate = useNavigate()
  const { sessions } = useGameProgress()
  const [reminders] = useLocalStorage<Reminder[]>('aura-reminders', generateDemoReminders())
  const [lastActivity] = useLocalStorage<string | null>('aura-last-activity', null)
  const [messages] = useLocalStorage<FamilyMessage[]>('aura-family-messages', generateDemoMessages())
  const [photoMessages] = useLocalStorage<FamilyPhotoMessage[]>('aura-family-photos', [])
  const [mood, setMood] = useLocalStorage<{ mood: string; ts: string } | null>('aura-mood', null)
  const [moodOpen, setMoodOpen] = useState(false)
  const [moodChoice, setMoodChoice] = useState('')
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
  const unreadPhotos = useMemo(() => photoMessages.filter(m => !m.read), [photoMessages])
  const gamesPlayed = sessions.length
  const dateStr = new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  // Suggested game grounded in real history, not just weekday rotation
  const suggestedGame = useCallback(() => {
    // Prefer a game the user has played least recently among the familiar ones
    const familiar = sessions.length > 0 ? [...new Set(sessions.map(s => s.gameType))] : ['memory-match']
    const sorted = familiar.slice().sort((a, b) => {
      const aLast = sessions.filter(s => s.gameType === a).pop()?.timestamp || ''
      const bLast = sessions.filter(s => s.gameType === b).pop()?.timestamp || ''
      return aLast.localeCompare(bLast)
    })

    const candidateIds: Array<keyof typeof GAME_TYPES> = ['memory-lane', ...sorted as Array<keyof typeof GAME_TYPES>]
    const pickId = candidateIds[0] || ('memory-match' as const)
    const picked = GAME_TYPES[pickId]
    const tips: Record<string, string> = {
      'memory-lane': 'Remember moments from your life - family, places, and little things.',
      'memory-match': 'Find matching pairs of cards.',
      'object-recall': 'Remember the objects you saw.',
      'sequence-recall': 'Reproduce the sequence from memory.',
      'word-association': 'Match related words from memory.',
      'pattern-grid': 'Recreate the pattern you saw.',
      'story-recall': 'Answer questions about a short story.',
      'color-sequence': 'Watch and repeat the color pattern.',
      'memory-replay': 'Look through a memory album, then answer gentle questions.',
      'forget-teach-retest': 'Meet familiar faces - if a name slips away, AURA teaches it again.',
      'routine-deviation': 'Spot the small change in a familiar daily routine.',
      'my-place-memories': 'Visit familiar places and hear their memories.',
      'pattern-recall': 'A calm color pattern game that grows with you.',
      'what-changed': 'Something small changed in a familiar room. Spot it!',
      'memory-sequence': 'Listen to bells and claps, then tap them back.',
      'memory-story': 'A little story from your own memories, read aloud.',
    }
    return { id: pickId, name: picked.label, icon: picked.icon, color: 'from-amber-400 to-amber-600', tip: tips[pickId] || '' }
  }, [sessions])

  const moodLabel = (m: string) => t(m === 'great' ? 'great' : m === 'okay' ? 'okay' : m === 'tired' ? 'tired' : 'confused')

  return (
    <div className="min-h-screen px-4 pt-20 pb-8 max-w-2xl mx-auto">
      <div className="home-anim text-center mb-8 pt-4">
        <div className="text-5xl mb-3">{greeting.emoji}</div>
        <h1 className="text-3xl md:text-4xl font-bold text-charcoal-800 dark:text-white mb-1">
          {t(greeting.text)}, {user?.name || t('Friend')}!
        </h1>
        <p className="text-charcoal-400 dark:text-charcoal-500 text-lg">{t(greeting.sub)}</p>
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
        <button onClick={() => { playTapSound(); navigate('/games') }} className="group flex items-center gap-5 p-6 rounded-3xl bg-gradient-to-br from-sage-50 to-sage-100/80 dark:from-sage-900/30 dark:to-sage-800/20 border border-sage-200/60 dark:border-sage-700/30 hover:shadow-[0_8px_30px_rgba(132,204,22,0.15)] hover:-translate-y-0.5 transition-all duration-500 text-left">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center flex-shrink-0 shadow-[0_4px_20px_rgba(132,204,22,0.3)] group-hover:scale-110 transition-transform duration-300">
            <Gamepad2 size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-charcoal-800 dark:text-white mb-1">{t('Play a Game')}</h2>
            <p className="text-charcoal-400 dark:text-charcoal-500 text-sm">
              {gamesPlayed > 0 ? t("You're doing great! Let's play again!") : t('Start with a fun memory game!')}
            </p>
          </div>
          <ChevronRight size={24} className="text-sage-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button onClick={() => { playTapSound(); navigate('/assistant') }} className="group flex items-center gap-5 p-6 rounded-3xl bg-gradient-to-br from-sky-50 to-blue-100/80 dark:from-sky-900/30 dark:to-blue-800/20 border border-sky-200/60 dark:border-sky-700/30 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:-translate-y-0.5 transition-all duration-500 text-left">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-[0_4px_20px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform duration-300">
            <Mic size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-charcoal-800 dark:text-white mb-1">{t('Talk to Me')}</h2>
            <p className="text-charcoal-400 dark:text-charcoal-500 text-sm">{t('Ask me anything - set reminders, check the date, or just chat.')}</p>
          </div>
          <ChevronRight size={24} className="text-sky-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button onClick={() => { playTapSound(); navigate('/family') }} className="group flex items-center gap-5 p-6 rounded-3xl bg-gradient-to-br from-rose-50 to-pink-100/80 dark:from-rose-900/30 dark:to-pink-800/20 border border-rose-200/60 dark:border-rose-700/30 hover:shadow-[0_8px_30px_rgba(244,114,182,0.15)] hover:-translate-y-0.5 transition-all duration-500 text-left">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-[0_4px_20px_rgba(244,114,182,0.3)] group-hover:scale-110 transition-transform duration-300">
            <Users size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-charcoal-800 dark:text-white mb-1">{t('My Family')}</h2>
            <p className="text-charcoal-400 dark:text-charcoal-500 text-sm">{t('See photos and messages from your loved ones.')}</p>
          </div>
          <ChevronRight size={24} className="text-rose-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Suggested for you */}
      <div className="home-anim mb-6">
        <button onClick={() => { playTapSound(); navigate('/games') }} className="group block w-full p-5 rounded-3xl bg-gradient-to-br from-white/70 to-white/40 dark:from-white/10 dark:to-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 hover:shadow-[0_8px_30px_rgba(132,204,22,0.15)] hover:-translate-y-0.5 transition-all duration-500">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-amber-500" />
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">{t('Suggested for you')}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${suggestedGame().color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <span className="text-2xl" role="img" aria-label={suggestedGame().name}>{suggestedGame().icon}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-charcoal-800 dark:text-white">{t(suggestedGame().name)}</h3>
              <p className="text-sm text-charcoal-400 dark:text-charcoal-500">{t(suggestedGame().tip)}</p>
            </div>
            <ChevronRight size={22} className="text-sage-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {lastActivity && (
        <div className="home-anim mb-6">
          <button onClick={() => navigate(lastActivity)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/15 transition-all duration-300 text-left">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Volume2 size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal-800 dark:text-white">{t('Continue where you left off')}</p>
              <p className="text-xs text-charcoal-400 dark:text-charcoal-500">{t('Pick up right where you stopped')}</p>
            </div>
          </button>
        </div>
      )}

      {pendingReminders.length > 0 && (
        <div className="home-anim mb-6">
          <h3 className="text-sm font-semibold text-charcoal-500 dark:text-charcoal-400 mb-3 uppercase tracking-wider">{t('Reminders')}</h3>
          <div className="space-y-2">
            {pendingReminders.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/40 dark:border-white/10">
                <Pill size={18} className="text-rose-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-charcoal-800 dark:text-white">{t(r.title)}</p>
                  {r.time && <p className="text-xs text-charcoal-400">{r.time}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {unreadMessages.length > 0 && (
        <div className="home-anim mb-6">
          <h3 className="text-sm font-semibold text-charcoal-500 dark:text-charcoal-400 mb-3 uppercase tracking-wider">{t('Messages from Family')}</h3>
          <div className="space-y-2">
            {unreadMessages.map(msg => (
              <div key={msg.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/40 dark:border-white/10">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                  <Heart size={16} className="text-rose-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal-800 dark:text-white">{msg.from}</p>
                  <p className="text-xs text-charcoal-400 truncate">{t(msg.text)}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {unreadPhotos.length > 0 && (
        <div className="home-anim mb-6">
          <h3 className="text-sm font-semibold text-charcoal-500 dark:text-charcoal-400 mb-3 uppercase tracking-wider">{t('Photos from Family')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {unreadPhotos.map((m) => (
              <div key={m.id} className="group rounded-2xl overflow-hidden bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/10">
                <div className="aspect-square bg-charcoal-100 dark:bg-charcoal-800 flex items-center justify-center text-4xl">
                  <img src={m.photoData} alt={m.caption} className="w-full h-full object-cover" />
                </div>
                <div className="px-3 py-2 border-t border-white/40 dark:border-white/10">
                  <p className="text-xs font-medium text-charcoal-700 dark:text-white truncate">{m.from}</p>
                  <p className="text-[11px] text-charcoal-400 truncate">{t(m.caption)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sessions.length > 0 && (
        <div className="home-anim mb-6 p-4 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/40 dark:border-white/10">
          <h3 className="text-sm font-semibold text-charcoal-500 dark:text-charcoal-400 mb-3 uppercase tracking-wider">{t('Your Memory Garden')}</h3>
          <div className="flex items-center justify-center gap-1">
            {Array.from({ length: Math.min(sessions.length, 7) }).map((_, i) => (
              <span key={i} className="text-2xl">🌸</span>
            ))}
          </div>
          <p className="text-xs text-charcoal-400 mt-2 text-center">{t('{n} games played. You\'re doing great!', { n: sessions.length })}</p>
        </div>
      )}

      {!moodOpen && !mood && (
        <div className="home-anim mb-6">
          <button onClick={() => setMoodOpen(true)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/15 transition-all duration-300 text-left">
            <div className="w-12 h-12 rounded-xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center">
              <Smile size={22} className="text-sage-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal-800 dark:text-white">{t('How are you feeling today?')}</p>
              <p className="text-xs text-charcoal-400">{t('A quick check-in to start the day')}</p>
            </div>
          </button>
        </div>
      )}

      {moodOpen && (
        <div className="home-anim mb-6 p-5 rounded-2xl bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/60 dark:border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-charcoal-700 dark:text-white">{t('How are you feeling today?')}</h3>
            <button onClick={() => { setMoodOpen(false); setMoodChoice('') }} className="p-1 rounded-full hover:bg-white/60 text-charcoal-400" aria-label={t('Close')}>
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['great', 'okay', 'tired', 'confused'].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMood({ mood: m, ts: new Date().toISOString() })
                  setMoodOpen(false)
                  setMoodChoice('')
                  speakText(t('Feeling {m}', { m: moodLabel(m) }), language)
                }}
                className={`py-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${moodChoice === m ? 'bg-sage-100 border-sage-500 scale-105' : 'bg-white/70 border-white/50 hover:bg-white hover:border-sage-300'}`}
              >
                {m === 'great' ? '😊' : m === 'okay' ? '🙂' : m === 'tired' ? '😴' : '🤔'} {moodLabel(m)}
              </button>
            ))}
          </div>
          {mood && (
            <p className="text-xs text-charcoal-400 mt-3 text-center">{t("We've noted how you're feeling today.")}</p>
          )}
        </div>
      )}

      <div className="home-anim text-center mt-8 p-6 rounded-2xl bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-white/30 dark:border-white/10">
        <Heart size={24} className="text-rose-300 mx-auto mb-2" />
        <p className="text-charcoal-500 dark:text-charcoal-400 text-sm italic">"{t(getDailyEncouragement())}"</p>
      </div>
    </div>
  )
}
