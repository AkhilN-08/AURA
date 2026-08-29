import { useState, useRef, useEffect } from 'react'
import { X, Send, Bell, Mic, MicOff } from 'lucide-react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import type { Reminder } from '../../data/models'
import { REMINDER_TYPES } from '../../data/models'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    text: "Good morning! I'm your AURA-NER companion. I can help with reminders, daily routines, or just have a friendly chat. How can I help today?",
    timestamp: new Date().toISOString(),
  },
]

function normalizeTime(raw: string): string {
  const t = raw.trim().toLowerCase()
  const match12 = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/)
  if (match12) {
    let hours = parseInt(match12[1])
    const minutes = match12[2] || '00'
    const period = match12[3]
    if (period === 'pm' && hours < 12) hours += 12
    if (period === 'am' && hours === 12) hours = 0
    return `${hours.toString().padStart(2, '0')}:${minutes}`
  }
  const match24 = t.match(/^(\d{1,2}):(\d{2})$/)
  if (match24) return `${parseInt(match24[1]).toString().padStart(2, '0')}:${match24[2]}`
  const matchHour = t.match(/^(\d{1,2})/)
  if (matchHour) return `${parseInt(matchHour[1]).toString().padStart(2, '0')}:00`
  return raw
}

const QUICK_ACTIONS = [
  { label: 'Set a reminder', icon: Bell },
  { label: "What's today's date?", icon: null },
  { label: 'Play a memory game', icon: null },
]

interface AssistantPanelProps {
  onClose: () => void
}

export default function AssistantPanel({ onClose }: AssistantPanelProps) {
  const [messages, setMessages] = useLocalStorage<Message[]>('aura-assistant-messages', INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showReminderForm, setShowReminderForm] = useState(false)
  const [reminderTitle, setReminderTitle] = useState('')
  const [reminderTime, setReminderTime] = useState('')
  const [reminderType, setReminderType] = useState<Reminder['type']>('routine')
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('aura-reminders', [])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMessage = (role: 'user' | 'assistant', text: string) => {
    const msg: Message = {
      id: Date.now().toString(),
      role,
      text,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, msg])
  }

  const simulateResponse = (userText: string) => {
    setIsProcessing(true)
    setTimeout(() => {
      const lower = userText.toLowerCase()
      let response = ''

      // --- Smart reminder detection: save directly if time is mentioned ---
      const reminderMatch = lower.match(/(?:remind(?:er)?(?:\s+me)?(?:\s+to)?|set\s+(?:a\s+)?reminder(?:\s+for)?)\s+(.+)/i)
      if (reminderMatch) {
        const content = reminderMatch[1].trim()
        // Try to extract time: "at 6am", "at 6:00", etc.
        const timeMatch = content.match(/(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i)
        let time = ''
        let title = content
        if (timeMatch) {
          time = normalizeTime(timeMatch[1])
          title = content.replace(timeMatch[0], '').replace(/\s+/g, ' ').trim()
        }
        if (title.length < 2) title = content
        // Detect reminder type
        let rtype: Reminder['type'] = 'routine'
        if (/medicine|medication|pill|drug/i.test(content)) rtype = 'medicine'
        else if (/call|phone|ring/i.test(content)) rtype = 'call'
        else if (/appointment|doctor|visit/i.test(content)) rtype = 'appointment'
        else if (/eat|food|meal|breakfast|lunch|dinner/i.test(content)) rtype = 'meal'

        const newReminder: Reminder = {
          id: Date.now().toString(),
          title,
          time,
          type: rtype,
          completed: false,
          createdAt: new Date().toISOString(),
        }
        setReminders(prev => [...prev, newReminder])
        response = `Done! I\'ll remind you to "${title}"${time ? ` at ${time}` : ''}. You can see it on your home screen.`
      } else if (lower.includes('reminder') || lower.includes('remind')) {
        response = "I'd be happy to help set a reminder for you. Would you like to tell me the details?"
        setShowReminderForm(true)
      } else if (lower.includes('good morning') || lower.includes('hello') || lower.includes('hi')) {
        response = "Hello! It's wonderful to hear from you. How are you feeling today?"
      } else if (lower.includes('date') || lower.includes('today')) {
        const today = new Date()
        response = `Today is ${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`
      } else if (lower.includes('game') || lower.includes('play')) {
        response = "I'd love to help you play a memory game! You can visit the Cognitive Games section to choose from Memory Match, Object Recall, or Sequence Recall."
      } else if (lower.includes('breakfast') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('eat')) {
        response = "That's a lovely question to help with memory. Would you like me to help you remember what you had earlier?"
      } else if (lower.includes('daughter') || lower.includes('son') || lower.includes('family')) {
        response = "Family is so important. Is there someone you'd like to reach out to? I can help set a reminder to call them."
      } else if (lower.includes('thank')) {
        response = "You're very welcome. I'm always here to help. 💛"
      } else {
        response = "I appreciate you sharing that with me. I'm here to help with reminders, daily routines, or memory activities. Is there something specific I can assist with?"
      }

      addMessage('assistant', response)
      setIsProcessing(false)
    }, 1500)
  }

  const handleSend = () => {
    if (!input.trim()) return
    addMessage('user', input.trim())
    setInput('')
    simulateResponse(input.trim())
  }

  const handleQuickAction = (action: string) => {
    if (action === 'Set a reminder') {
      setShowReminderForm(true)
      addMessage('user', 'I want to set a reminder')
      setTimeout(() => {
        addMessage('assistant', "Of course! Please fill in the details below. What would you like to be reminded about?")
      }, 500)
    } else {
      addMessage('user', action)
      simulateResponse(action)
    }
  }

  const handleSaveReminder = () => {
    if (!reminderTitle.trim()) return

    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: reminderTitle,
      time: reminderTime,
      type: reminderType,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    setReminders(prev => [...prev, newReminder])
    addMessage('assistant', `Got it! I'll remind you to "${reminderTitle}" ${reminderTime ? `at ${reminderTime}` : ''}. You can manage your reminders anytime.`)
    setReminderTitle('')
    setReminderTime('')
    setReminderType('routine')
    setShowReminderForm(false)
  }

  const handleMicClick = () => {
    if (isListening) {
      setIsListening(false)
      return
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript
          addMessage('user', text)
          simulateResponse(text)
          setIsListening(false)
        }

        recognition.onerror = () => setIsListening(false)
        recognition.onend = () => setIsListening(false)

        recognition.start()
        setIsListening(true)
      } catch {
        // Fallback: just use text input
        setIsListening(false)
      }
    }
  }

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[min(400px,calc(100vw-48px))] bg-white rounded-3xl shadow-2xl border border-cream-200 flex flex-col max-h-[70vh] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cream-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-500 flex items-center justify-center">
            <span className="text-white text-lg">🌸</span>
          </div>
          <div>
            <h3 className="font-semibold text-charcoal-800">AURA-NER Assistant</h3>
            <p className="text-xs text-forest-500">Always here to help</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-cream-100 transition-colors" aria-label="Close assistant">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-forest-500 text-white rounded-tr-sm'
                  : 'bg-cream-100 text-charcoal-700 rounded-tl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-cream-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-charcoal-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-charcoal-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-charcoal-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Reminder form */}
        {showReminderForm && (
          <div className="bg-cream-50 rounded-2xl p-4 space-y-3 border border-cream-200">
            <p className="text-sm font-medium text-charcoal-700">New Reminder</p>
            <input
              type="text"
              placeholder="What should I remind you about?"
              value={reminderTitle}
              onChange={e => setReminderTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
            />
            <input
              type="time"
              value={reminderTime}
              onChange={e => setReminderTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
            />
            <select
              value={reminderType}
              onChange={e => setReminderType(e.target.value as Reminder['type'])}
              className="w-full px-3 py-2 rounded-xl border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
            >
              {Object.entries(REMINDER_TYPES).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={handleSaveReminder} className="btn-primary !py-2 !px-4 !text-sm flex-1">
                Save Reminder
              </button>
              <button onClick={() => setShowReminderForm(false)} className="btn-ghost !py-2 !px-4 !text-sm">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
          {QUICK_ACTIONS.map((action, i) => (
            <button
              key={i}
              onClick={() => handleQuickAction(action.label)}
              className="text-xs px-3 py-1.5 rounded-full bg-cream-100 text-charcoal-600 hover:bg-forest-50 hover:text-forest-600 transition-colors"
            >
              {action.icon && <action.icon size={12} className="inline mr-1" />}
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-cream-200">
        <div className="flex items-center gap-2">
          <button
            onClick={handleMicClick}
            className={`p-2.5 rounded-xl transition-colors ${
              isListening ? 'bg-red-100 text-red-500' : 'bg-cream-100 text-charcoal-500 hover:bg-cream-200'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? 'Listening...' : 'Type a message...'}
            className="flex-1 px-4 py-2.5 rounded-xl bg-cream-50 border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
            disabled={isListening}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-forest-500 text-white hover:bg-forest-600 transition-colors disabled:opacity-50"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
