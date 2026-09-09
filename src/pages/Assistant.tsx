import { useState, useRef, useEffect } from 'react'
import { Bell, Plus, Trash2, Check, Clock, Mic, Send, Volume2, VolumeX, RotateCcw, ListChecks } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useVoiceAgent } from '../hooks/useVoiceAgent'
import type { Reminder, DailyTask } from '../data/models'
import { REMINDER_TYPES } from '../data/models'
import Modal from '../components/ui/Modal'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'

const getToday = () => new Date().toISOString().split('T')[0]

export default function Assistant() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('aura-reminders', [])
  const [showNewForm, setShowNewForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newType, setNewType] = useState<Reminder['type']>('routine')
  const [tasks, setTasks] = useLocalStorage<DailyTask[]>('aura-daily-tasks', [])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [textInput, setTextInput] = useState('')
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const voice = useVoiceAgent()

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [voice.messages])

  // Handle voice actions (create reminders, navigate, etc.)
  useEffect(() => {
    const lastMsg = voice.messages[voice.messages.length - 1]
    if (lastMsg?.role === 'agent' && lastMsg.action) {
      const { type, payload } = lastMsg.action

      if (type === 'reminder') {
        const reminder: Reminder = {
          id: Date.now().toString(),
          title: payload.title || 'Reminder',
          time: payload.time || '',
          type: (payload.type as Reminder['type']) || 'routine',
          completed: false,
          createdAt: new Date().toISOString(),
        }
        setReminders(prev => [...prev, reminder])
      }

      if (type === 'task' && payload.title) {
        const task: DailyTask = {
          id: Date.now().toString(),
          title: payload.title,
          completed: false,
          createdAt: new Date().toISOString(),
          date: getToday(),
        }
        setTasks(prev => [...prev, task])
      }

      if (type === 'call' && payload.phone) {
        window.open(`tel:${payload.phone}`, '_self')
      }

      if (type === 'navigate' && payload.route) {
        setTimeout(() => navigate(payload.route), 1500)
      }

      if (type === 'alarm' && payload.time) {
        // Set a browser notification alarm
        const [hours, minutes] = payload.time.split(':').map(Number)
        const now = new Date()
        const alarmTime = new Date()
        alarmTime.setHours(hours, minutes, 0, 0)
        if (alarmTime <= now) alarmTime.setDate(alarmTime.getDate() + 1)
        const diff = alarmTime.getTime() - now.getTime()
        setTimeout(() => {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('AURA-NER Alarm', { body: `Time for your alarm!`, icon: '/favicon.svg' })
          }
          voice.speak("Time's up! Your alarm is going off.")
        }, Math.min(diff, 2147483647))
      }
    }
  }, [voice.messages, navigate, setReminders, setTasks, voice])

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const handleTextSend = () => {
    if (!textInput.trim()) return
    voice.sendText(textInput)
    setTextInput('')
  }

  const handleAdd = () => {
    if (!newTitle.trim()) return
    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newTitle,
      time: newTime,
      type: newType,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    setReminders(prev => [...prev, reminder])
    setNewTitle('')
    setNewTime('')
    setNewType('routine')
    setShowNewForm(false)
  }

  const toggleComplete = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r))
  }

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id))
  }

  // Daily tasks - auto-reset when date changes
  const today = getToday()
  const todayTasks = tasks.filter(t => t.date === today)
  const pendingTasks = todayTasks.filter(t => !t.completed)
  const completedTasks = todayTasks.filter(t => t.completed)

  const addTask = () => {
    if (!newTaskTitle.trim()) return
    const task: DailyTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      date: today,
    }
    setTasks(prev => [...prev, task])
    setNewTaskTitle('')
  }

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const pending = reminders.filter(r => !r.completed)
  const completed = reminders.filter(r => r.completed)

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const SUGGESTIONS = [
    { label: t("What's on today?"), cmd: 'What are my reminders for today?' },
    { label: t('Call my daughter'), cmd: 'Call daughter' },
    { label: t('Remind me later'), cmd: 'Remind me to ' },
    { label: t("Let's play a memory game"), cmd: "Let's play a memory game" },
  ]

  return (
    <div className="room room-listen px-4">
      <div className="max-w-3xl mx-auto">
        {/* ── The room header — quiet, human ── */}
        <header className="text-center mb-10">
          <div className="aura-meta mb-4">{t('Memory Assistant')}</div>
          <h1 className="font-serif-display text-4xl md:text-5xl text-ink dark:text-white leading-[1.1] mb-3">
            {voice.messages.length === 0 ? (
              <>"{t("I'm here.")}"<br />{t('What would you like to do?')}</>
            ) : (
              t('Here with you.')
            )}
          </h1>
          <div className="aura-rule w-16 mx-auto my-5" />
        </header>

        {/* ── The conversation — AURA beside you, not a panel ── */}
        {voice.messages.length === 0 && !voice.isListening ? (
          /* First contact: one big mic, nothing else competing */
          <section className="text-center mb-14">
            <button
              onClick={voice.toggleListening}
              disabled={!voice.isSupported}
              className={`relative mx-auto w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 mb-8 ${
                voice.isSupported
                  ? 'bg-[#7d9bbd] text-white hover:bg-[#6b8aad] active:scale-95 aura-breath'
                  : 'bg-ink/20 text-ink/40 cursor-not-allowed'
              }`}
              aria-label={t('Start voice input')}
            >
              <Mic size={56} strokeWidth={1.6} />
            </button>
            <div className="aura-meta mb-2">{t('TAP TO SPEAK')}</div>
            <p className="text-charcoal-500 dark:text-charcoal-300 text-lg max-w-md mx-auto mb-10">
              {voice.error ? voice.error : t('Speak naturally — I will set reminders, make calls, and help with your day.')}
            </p>

            {/* Suggested things to say — the conversation starters */}
            <div className="max-w-md mx-auto space-y-2">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => s.cmd.endsWith(' ') ? setTextInput(s.cmd) : voice.sendText(s.cmd)}
                  className="w-full text-left px-5 py-3.5 bg-white/70 border border-ink/12 rounded-xl hover:border-[#7d9bbd] hover:bg-white transition-all group"
                >
                  <span className="font-serif-display text-lg text-ink dark:text-white">"{s.label}"</span>
                  <span className="float-right text-[#7d9bbd] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              ))}
            </div>

            {/* Fallback text input — quiet, at the bottom */}
            <div className="max-w-md mx-auto mt-8 flex items-center gap-2">
              <input
                type="text"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTextSend()}
                placeholder={t('Or type here...')}
                className="flex-1 px-4 py-3 bg-transparent border-b-2 border-ink/20 focus:border-[#7d9bbd] focus:outline-none text-ink dark:text-white placeholder:text-ink/30 transition-colors"
              />
              {textInput.trim() && (
                <button onClick={handleTextSend} className="w-11 h-11 rounded-full bg-[#7d9bbd] text-white flex items-center justify-center hover:bg-[#6b8aad] transition-colors" aria-label={t('Send')}>
                  <Send size={18} />
                </button>
              )}
            </div>
          </section>
        ) : (
          /* Ongoing conversation: the exchange, then the mic again */
          <section className="mb-14">
            <div className="max-w-2xl mx-auto space-y-5 mb-10">
              {voice.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-5 py-3 ${
                    msg.role === 'user'
                      ? 'bg-[#7d9bbd] text-white rounded-2xl rounded-br-sm'
                      : 'bg-white border border-ink/10 text-ink dark:text-charcoal-100 dark:bg-[#1e1e32] rounded-2xl rounded-bl-sm'
                  }`}>
                    {msg.role === 'agent' && (
                      <div className="aura-meta mb-1 !text-[10px]" style={{ color: '#7d9bbd' }}>AURA</div>
                    )}
                    <p className="text-base leading-relaxed">{msg.text}</p>
                    {msg.action?.type === 'reminder' && (
                      <div className="aura-meta mt-2 !text-[10px] text-emerald-600">✓ {t('Reminder saved')}</div>
                    )}
                    {msg.action?.type === 'call' && (
                      <div className="aura-meta mt-2 !text-[10px] text-[#5a7ba6]">📞 {t('Calling...')}</div>
                    )}
                  </div>
                </div>
              ))}

              {voice.isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-ink/10 dark:bg-[#1e1e32] dark:border-white/10 rounded-2xl rounded-bl-sm px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#7d9bbd] rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-[#7d9bbd] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#7d9bbd] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-sm text-charcoal-400 ml-1">{t('Thinking...')}</span>
                    </div>
                  </div>
                </div>
              )}

              {voice.isListening && voice.transcript && (
                <div className="text-center">
                  <p className="font-serif-display italic text-xl text-ink/60 dark:text-charcoal-300">"{voice.transcript}"</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* The mic — always reachable in a conversation */}
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={voice.toggleListening}
                disabled={!voice.isSupported}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                  voice.isListening
                    ? 'bg-[#5a7ba6] text-white aura-breath-fast'
                    : 'bg-[#7d9bbd] text-white hover:bg-[#6b8aad] active:scale-95 aura-breath'
                } ${!voice.isSupported ? 'opacity-40 cursor-not-allowed' : ''}`}
                aria-label={voice.isListening ? t('Stop listening') : t('Start voice input')}
              >
                <Mic size={36} strokeWidth={1.6} />
              </button>
              <div className="aura-meta">{voice.isListening ? t('LISTENING…') : t('TAP TO SPEAK')}</div>
              {voice.error && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  {voice.error}
                  <button onClick={voice.clearError} className="underline"><RotateCcw size={12} /></button>
                </p>
              )}

              <div className="flex items-center gap-3 mt-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTextSend()}
                  placeholder={voice.isListening ? t('Listening...') : t('Or type here...')}
                  className="px-4 py-2.5 bg-transparent border-b-2 border-ink/20 focus:border-[#7d9bbd] focus:outline-none text-ink dark:text-white placeholder:text-ink/30 w-64 transition-colors"
                  disabled={voice.isListening}
                />
                {textInput.trim() && (
                  <button onClick={handleTextSend} className="w-10 h-10 rounded-full bg-[#7d9bbd] text-white flex items-center justify-center hover:bg-[#6b8aad] transition-colors" aria-label={t('Send')}>
                    <Send size={16} />
                  </button>
                )}
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${voiceEnabled ? 'text-[#5a7ba6] hover:bg-[#7d9bbd]/10' : 'text-ink/30 hover:bg-ink/5'}`}
                  title={voiceEnabled ? t('Voice output on') : t('Voice output off')}
                  aria-label={voiceEnabled ? t('Voice output on') : t('Voice output off')}
                >
                  {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
                {voice.messages.length > 0 && (
                  <button
                    onClick={voice.clearMessages}
                    className="w-10 h-10 rounded-full text-ink/30 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-colors"
                    title={t('Clear conversation')}
                    aria-label={t('Clear conversation')}
                  >
                    <RotateCcw size={15} />
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── TODAY WITH AURA — the day, together ── */}
        <section className="max-w-2xl mx-auto mb-10">
          <div className="flex items-baseline gap-4 mb-5">
            <h2 className="font-serif-display text-2xl text-ink dark:text-white">{t('TODAY WITH AURA')}</h2>
            <div className="flex-1 h-px bg-ink/15" />
          </div>

          {/* Tasks */}
          {todayTasks.length > 0 && (
            <div className="mb-6">
              {pendingTasks.map(task => (
                <div key={task.id} className="aura-index-row !py-3.5">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="w-7 h-7 rounded-md border-2 border-ink/25 hover:border-[#7d9bbd] flex-shrink-0 self-center transition-colors"
                    aria-label={t('Mark done')}
                  />
                  <span className="text-lg text-ink dark:text-white flex-1">{task.title}</span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 rounded text-ink/30 hover:text-red-500 transition-colors"
                    aria-label={t('Delete')}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {completedTasks.map(task => (
                <div key={task.id} className="aura-index-row !py-3.5 opacity-55">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="w-7 h-7 rounded-md bg-[#7d9bbd]/30 border-2 border-[#7d9bbd] flex items-center justify-center flex-shrink-0 self-center"
                    aria-label={t('Mark not done')}
                  >
                    <Check size={13} className="text-[#4a6a92]" />
                  </button>
                  <span className="text-lg text-ink/60 dark:text-charcoal-400 line-through flex-1">{task.title}</span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 rounded text-ink/30 hover:text-red-500 transition-colors"
                    aria-label={t('Delete')}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add a task */}
          <div className="flex items-center gap-3 mb-8">
            <input
              type="text"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              placeholder={t('Add a task for today...')}
              className="flex-1 px-4 py-3 bg-white/70 border border-ink/12 rounded-xl focus:border-[#7d9bbd] focus:outline-none text-ink dark:text-white dark:bg-[#1e1e32] dark:border-white/10 placeholder:text-ink/30 transition-colors"
            />
            <button
              onClick={addTask}
              disabled={!newTaskTitle.trim()}
              className="w-12 h-12 rounded-xl bg-ink text-ivory flex items-center justify-center hover:bg-[#4a6a92] transition-colors disabled:opacity-30"
              aria-label={t('Add task')}
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Reminders */}
          {pending.length > 0 && (
            <div className="mb-4">
              <div className="aura-meta mb-3">{t('Reminders')}</div>
              {pending.map(reminder => {
                const typeInfo = REMINDER_TYPES[reminder.type]
                return (
                  <div key={reminder.id} className="aura-index-row !py-3.5">
                    <button
                      onClick={() => toggleComplete(reminder.id)}
                      className="w-7 h-7 rounded-full border-2 border-ink/25 hover:border-[#7d9bbd] flex-shrink-0 self-center transition-colors"
                      aria-label={t('Mark done')}
                    />
                    <span className="text-lg text-ink dark:text-white flex-1">{reminder.title}</span>
                    <span className="aura-meta">{t(typeInfo.label)}</span>
                    {reminder.time && (
                      <span className="aura-meta flex items-center gap-1"><Clock size={11} /> {reminder.time}</span>
                    )}
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="p-1.5 rounded text-ink/30 hover:text-red-500 transition-colors"
                      aria-label={t('Delete')}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {completed.length > 0 && (
            <div className="mt-4">
              <div className="aura-meta mb-2">{t('Completed')} ({completed.length})</div>
              {completed.slice(0, 5).map(reminder => (
                <div key={reminder.id} className="flex items-center gap-3 py-2 opacity-60">
                  <Check size={14} className="text-[#7d9bbd]" />
                  <p className="text-base text-ink/60 dark:text-charcoal-400 line-through flex-1">{reminder.title}</p>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="p-1 rounded text-ink/30 hover:text-red-500 transition-colors"
                    aria-label={t('Delete')}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {reminders.length === 0 && todayTasks.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-ink/15 rounded-2xl">
              <ListChecks className="mx-auto text-ink/25 mb-3" size={30} />
              <p className="font-serif-display text-lg text-ink/60 dark:text-charcoal-300">{t('Nothing planned yet today.')}</p>
              <p className="text-charcoal-400 text-sm mt-1">{t('Say "Remind me to..." and I will take care of it.')}</p>
              <button
                onClick={() => setShowNewForm(true)}
                className="mt-4 inline-flex items-center gap-2 aura-meta border border-ink/25 rounded-lg px-4 py-2 hover:border-ink transition-colors"
              >
                <Plus size={14} /> {t('New Reminder')}
              </button>
            </div>
          )}
        </section>

        {/* ── New Reminder Modal ── */}
        <Modal isOpen={showNewForm} onClose={() => setShowNewForm(false)} title={t('New Reminder')}>
          <div className="space-y-4">
            <div>
              <label className="aura-meta mb-2 block">{t('What should I remind you about?')}</label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder={t('e.g., Take medicine')}
                className="w-full px-4 py-3 rounded-xl border-2 border-ink/15 focus:border-[#7d9bbd] focus:outline-none text-ink dark:text-white bg-transparent"
              />
            </div>
            <div>
              <label className="aura-meta mb-2 block">{t('Time')}</label>
              <input
                type="time"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-ink/15 focus:border-[#7d9bbd] focus:outline-none text-ink dark:text-white bg-transparent"
              />
            </div>
            <div>
              <label className="aura-meta mb-2 block">{t('Type')}</label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as Reminder['type'])}
                className="w-full px-4 py-3 rounded-xl border-2 border-ink/15 focus:border-[#7d9bbd] focus:outline-none text-ink dark:text-white bg-transparent"
              >
                {Object.entries(REMINDER_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>{t(val.label)}</option>
                ))}
              </select>
            </div>
            <button onClick={handleAdd} className="w-full bg-ink text-ivory py-4 rounded-xl font-bold text-lg hover:bg-[#4a6a92] transition-colors disabled:opacity-40" disabled={!newTitle.trim()}>
              {t('Save Reminder')}
            </button>
          </div>
        </Modal>
      </div>
    </div>
  )
}
