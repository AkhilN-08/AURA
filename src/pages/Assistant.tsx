import { useState, useRef, useEffect } from 'react'
import { Bell, Plus, Trash2, Check, Clock, Mic, MicOff, Send, Volume2, VolumeX, RotateCcw, Navigation } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useVoiceAgent } from '../hooks/useVoiceAgent'
import type { Reminder } from '../data/models'
import { REMINDER_TYPES } from '../data/models'
import Modal from '../components/ui/Modal'
import { useNavigate } from 'react-router-dom'

export default function Assistant() {
  const navigate = useNavigate()
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('aura-reminders', [])
  const [showNewForm, setShowNewForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newType, setNewType] = useState<Reminder['type']>('routine')
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
  }, [voice.messages, navigate, setReminders, voice])

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

  const pending = reminders.filter(r => !r.completed)
  const completed = reminders.filter(r => r.completed)

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="section-heading mb-4">
            Voice <span className="text-gradient">Assistant</span>
          </h1>
          <p className="section-subheading mx-auto">
            Speak naturally — I'll set reminders, make calls, and help with your daily routine.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Voice Chat (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Voice Interface Card */}
            <div className="card overflow-hidden">
              {/* Chat Messages */}
              <div className="h-[400px] overflow-y-auto p-4 space-y-3" id="voice-chat-scroll">
                {voice.messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-pink-100 flex items-center justify-center mb-4">
                      <span className="text-4xl">🎙️</span>
                    </div>
                    <p className="text-charcoal-600 font-medium mb-2">Hi! I'm your voice assistant</p>
                    <p className="text-charcoal-400 text-sm max-w-xs">
                      Tap the microphone and speak naturally. Try saying:
                    </p>
                    <div className="mt-3 space-y-2">
                      {[
                        '"Remind me to take medicine at 8 AM"',
                        '"Call mom"',
                        '"Set an alarm for 7:00"',
                        '"Let\'s play a memory game"',
                        '"What time is it?"',
                      ].map((example, i) => (
                        <button
                          key={i}
                          onClick={() => voice.sendText(example.replace(/"/g, ''))}
                          className="block mx-auto text-xs text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-full px-3 py-1.5 transition-colors"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {voice.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                          : 'bg-white/60 backdrop-blur-sm border border-blue-100 text-charcoal-700 rounded-bl-md shadow-sm'
                      }`}
                    >
                      {msg.role === 'agent' && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs">🤖</span>
                          <span className="text-[10px] font-medium text-blue-400 uppercase tracking-wide">AURA-NER</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <div className={`flex items-center gap-2 mt-1 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        <span className={`text-[10px] ${msg.role === 'user' ? 'text-white/60' : 'text-charcoal-300'}`}>
                          {formatTime(msg.timestamp)}
                        </span>
                        {msg.action?.type === 'reminder' && (
                          <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">✓ Reminder saved</span>
                        )}
                        {msg.action?.type === 'call' && (
                          <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">📞 Calling...</span>
                        )}
                        {msg.action?.type === 'navigate' && (
                          <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">
                            <Navigation size={8} className="inline" /> Navigating...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {voice.isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs text-charcoal-400">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Live Transcript */}
              {voice.isListening && voice.transcript && (
                <div className="px-4 py-2 bg-blue-50/50 border-t border-blue-100">
                  <p className="text-xs text-blue-400 mb-0.5">Listening...</p>
                  <p className="text-sm text-charcoal-600 italic">{voice.transcript}</p>
                </div>
              )}

              {/* Error */}
              {voice.error && (
                <div className="px-4 py-2 bg-red-50 border-t border-red-100 flex items-center justify-between">
                  <p className="text-xs text-red-500">{voice.error}</p>
                  <button onClick={voice.clearError} className="text-red-400 hover:text-red-600">
                    <RotateCcw size={12} />
                  </button>
                </div>
              )}

              {/* Input Bar */}
              <div className="p-3 border-t border-cream-100 flex items-center gap-2">
                {/* Microphone Button */}
                <button
                  onClick={voice.toggleListening}
                  disabled={!voice.isSupported}
                  className={`relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    voice.isListening
                      ? 'bg-gradient-to-br from-red-400 to-pink-500 text-white shadow-lg shadow-red-200 animate-pulse'
                      : 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-md shadow-blue-200 hover:shadow-lg hover:scale-105'
                  } ${!voice.isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label={voice.isListening ? 'Stop listening' : 'Start voice input'}
                >
                  {voice.isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  {voice.isListening && (
                    <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-30" />
                  )}
                </button>

                {/* Text Input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTextSend()}
                    placeholder={voice.isListening ? "Listening..." : "Type a message or tap mic to speak..."}
                    className="w-full px-4 py-2.5 rounded-xl bg-cream-50 border border-cream-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm text-charcoal-700 placeholder:text-charcoal-300"
                    disabled={voice.isListening}
                  />
                </div>

                {/* Send Text */}
                {textInput.trim() && (
                  <button
                    onClick={handleTextSend}
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                )}

                {/* Voice Toggle */}
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    voiceEnabled ? 'text-blue-500 hover:bg-blue-50' : 'text-charcoal-300 hover:bg-cream-100'
                  }`}
                  title={voiceEnabled ? 'Voice output on' : 'Voice output off'}
                >
                  {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>

                {/* Clear Chat */}
                {voice.messages.length > 0 && (
                  <button
                    onClick={voice.clearMessages}
                    className="flex-shrink-0 w-10 h-10 rounded-full text-charcoal-300 hover:text-red-400 hover:bg-red-50 flex items-center justify-center transition-colors"
                    title="Clear conversation"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Set Reminder', icon: '⏰', cmd: 'Remind me to ' },
                { label: 'Make a Call', icon: '📞', cmd: 'Call ' },
                { label: 'Play Game', icon: '🧠', cmd: "Let's play a memory game" },
                { label: 'What Time?', icon: '🕐', cmd: 'What time is it?' },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (action.cmd.includes('memory game')) {
                      voice.sendText(action.cmd)
                    } else {
                      setTextInput(action.cmd)
                    }
                  }}
                  className="card-hover !py-3 flex flex-col items-center gap-1.5 text-center group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">{action.icon}</span>
                  <span className="text-xs font-medium text-charcoal-600">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Reminders Panel (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Reminder Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-charcoal-800 flex items-center gap-2">
                <Bell size={18} />
                Reminders
                {pending.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{pending.length}</span>
                )}
              </h2>
              <button
                onClick={() => setShowNewForm(true)}
                className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-1"
              >
                <Plus size={12} /> New
              </button>
            </div>

            {/* Pending Reminders */}
            {pending.length > 0 && (
              <div className="space-y-2">
                {pending.map(reminder => {
                  const typeInfo = REMINDER_TYPES[reminder.type]
                  return (
                    <div key={reminder.id} className="card-hover !p-3 flex items-center gap-3">
                      <button
                        onClick={() => toggleComplete(reminder.id)}
                        className="w-7 h-7 rounded-full border-2 border-cream-300 hover:border-blue-400 flex items-center justify-center transition-colors flex-shrink-0"
                      >
                        {reminder.completed && <Check size={12} className="text-blue-500" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-charcoal-800 text-sm truncate">{reminder.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          {reminder.time && (
                            <span className="text-[10px] text-charcoal-400 flex items-center gap-0.5">
                              <Clock size={8} /> {reminder.time}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-charcoal-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-charcoal-400 mb-2">Completed ({completed.length})</h3>
                <div className="space-y-1.5">
                  {completed.slice(0, 5).map(reminder => (
                    <div key={reminder.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cream-50/50">
                      <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                        <Check size={10} className="text-blue-500" />
                      </div>
                      <p className="text-xs text-charcoal-400 line-through flex-1 truncate">{reminder.title}</p>
                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        className="p-1 rounded hover:bg-red-50 text-charcoal-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {reminders.length === 0 && (
              <div className="card text-center py-8">
                <Bell className="mx-auto text-charcoal-200 mb-2" size={32} />
                <p className="text-charcoal-400 text-sm">No reminders yet</p>
                <p className="text-charcoal-300 text-xs mt-1">Say "Remind me to..." to create one</p>
              </div>
            )}

            {/* Tips Card */}
            <div className="card bg-gradient-to-br from-blue-50 to-pink-50 border-blue-100">
              <h3 className="text-sm font-semibold text-charcoal-700 mb-2">💡 Voice Tips</h3>
              <ul className="space-y-1.5 text-xs text-charcoal-500">
                <li>• Say <strong>"Remind me to take medicine at 8 AM"</strong></li>
                <li>• Say <strong>"Call mom"</strong> to open phone dialer</li>
                <li>• Say <strong>"Set an alarm for 7:00"</strong></li>
                <li>• Say <strong>"What time is it?"</strong></li>
                <li>• Say <strong>"Open games"</strong> to play memory games</li>
              </ul>
            </div>
          </div>
        </div>

        {/* New Reminder Modal */}
        <Modal isOpen={showNewForm} onClose={() => setShowNewForm(false)} title="New Reminder">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-charcoal-700 mb-1 block">What should I remind you about?</label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g., Take medicine"
                className="w-full px-4 py-3 rounded-xl border border-cream-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-charcoal-700 mb-1 block">Time</label>
              <input
                type="time"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-cream-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-charcoal-700 mb-1 block">Type</label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as Reminder['type'])}
                className="w-full px-4 py-3 rounded-xl border border-cream-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {Object.entries(REMINDER_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <button onClick={handleAdd} className="btn-primary w-full" disabled={!newTitle.trim()}>
              Save Reminder
            </button>
          </div>
        </Modal>
      </div>
    </div>
  )
}
