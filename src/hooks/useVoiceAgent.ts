import { useState, useCallback, useRef, useEffect } from 'react'

export interface VoiceMessage {
  id: string
  role: 'user' | 'agent'
  text: string
  timestamp: number
  action?: VoiceAction
}

export interface VoiceAction {
  type: 'reminder' | 'call' | 'alarm' | 'navigate' | 'game' | 'task' | 'none'
  payload: Record<string, string>
}

interface VoiceAgentState {
  isListening: boolean
  isSpeaking: boolean
  isProcessing: boolean
  messages: VoiceMessage[]
  transcript: string
  error: string | null
  isSupported: boolean
}

interface CommandIntent {
  intent: string
  entities: Record<string, string>
}

/* ------------------------------------------------------------------ */
/*  NLP-style command parser                                           */
/* ------------------------------------------------------------------ */

function parseCommand(text: string): CommandIntent {
  const lower = text.toLowerCase().trim()

  // --- Reminder ---
  const reminderPatterns = [
    /remind(?:er)?(?:\s+me)?(?:\s+to)?\s+(.+)/i,
    /set\s+(?:a\s+)?reminder(?:\s+for)?\s+(.+)/i,
    /remember\s+to\s+(.+)/i,
    /don'?t\s+forget\s+(?:to\s+)?(.+)/i,
  ]
  for (const pattern of reminderPatterns) {
    const match = lower.match(pattern)
    if (match) {
      const content = match[1].trim()
      // Extract time: "at 6am", "at 6:00", "at 6:30 pm", "tomorrow", etc.
      const timeMatch = content.match(
        /\b(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/i
      ) || content.match(
        /\b(?:at\s+)?(\d{1,2}(?::\d{2})?)\b/
      )
      const time = timeMatch ? normalizeTime(timeMatch[1]) : ''
      // Clean the content: remove time part
      const cleanContent = content
        .replace(/\b(?:at\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b/i, '')
        .replace(/\b(?:at|for|on)\s+/gi, '')
        .replace(/tomorrow/gi, '')
        .trim()
      
      // Detect type
      let reminderType: string = 'routine'
      if (/call|phone|ring/i.test(content)) reminderType = 'call'
      else if (/medicine|medication|pill|drug/i.test(content)) reminderType = 'medicine'
      else if (/appointment|doctor|visit/i.test(content)) reminderType = 'appointment'
      else if (/eat|food|meal|breakfast|lunch|dinner/i.test(content)) reminderType = 'meal'

      return {
        intent: 'reminder',
        entities: {
          title: cleanContent || content,
          time,
          type: reminderType,
        },
      }
    }
  }

  // --- Phone Call ---
  const callPatterns = [
    /call\s+(.+)/i,
    /phone\s+(.+)/i,
    /ring\s+(.+)/i,
    /dial\s+(.+)/i,
  ]
  for (const pattern of callPatterns) {
    const match = lower.match(pattern)
    if (match) {
      const name = match[1].trim()
      if (!/^(mom|dad|grandma|grandpa|doctor|nurse|pharmacy|helpline|emergency|108|112)/i.test(name) && name.length < 2) continue
      return {
        intent: 'call',
        entities: { name, phone: extractPhone(text) },
      }
    }
  }

  // --- Alarm ---
  const alarmPatterns = [
    /(?:set\s+)?(?:an?\s+)?alarm(?:\s+(?:for|at))?\s+(.+)/i,
    /wake\s+(?:me\s+)?(?:up\s+)?(?:at\s+)?(.+)/i,
    /闹钟/i,
  ]
  for (const pattern of alarmPatterns) {
    const match = lower.match(pattern)
    if (match) {
      const timeMatch = match[1].match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i)
      return {
        intent: 'alarm',
        entities: { time: timeMatch ? normalizeTime(timeMatch[1]) : match[1].trim() },
      }
    }
  }

  // --- Add Task ---
  const taskPatterns = [
    /(?:add|create|new|set)\s+(?:a\s+)?task(?:\s+(?:to|for))?\s+(.+)/i,
    /(?:i\s+)?(?:need\s+to|have\s+to|must|should)\s+(.+)/i,
    /(?:today\s+)?(?:i\s+)?(?:need|want|have)\s+(?:to\s+)?(.+)/i,
  ]
  for (const pattern of taskPatterns) {
    const match = lower.match(pattern)
    if (match) {
      return {
        intent: 'task',
        entities: { title: match[1].trim() },
      }
    }
  }

  // --- Play Game ---
  if (/(?:play|start|let'?s?\s+play)\s+(?:a\s+)?(?:memory\s+)?game/i.test(lower) ||
      /(?:memory|matching|sequence|recall)\s+game/i.test(lower)) {
    return {
      intent: 'game',
      entities: { type: 'memory-match' },
    }
  }

  // --- Time/Date ---
  if (/(?:what|current)\s+(?:time|is\s+the\s+time)/i.test(lower) ||
      /time\s+is\s+it/i.test(lower)) {
    return { intent: 'time', entities: {} }
  }
  if (/(?:what|current)\s+date|today'?s?\s+date/i.test(lower)) {
    return { intent: 'date', entities: {} }
  }

  // --- Greeting ---
  if (/^(?:hi|hello|hey|good\s+(?:morning|afternoon|evening)|namaste|hii*)/i.test(lower)) {
    return { intent: 'greeting', entities: {} }
  }

  // --- How are you ---
  if (/how\s+(?:are\s+you|do\s+you\s+do|is\s+it\s+going)/i.test(lower)) {
    return { intent: 'howareyou', entities: {} }
  }

  // --- Thanks ---
  if (/thank(?:s|you)/i.test(lower)) {
    return { intent: 'thanks', entities: {} }
  }

  // --- Help ---
  if (/help|what\s+can\s+you\s+do|commands|options/i.test(lower)) {
    return { intent: 'help', entities: {} }
  }

  // --- Open/Go to ---
  const navPatterns = [
    /(?:open|go\s+to|show)\s+(?:the\s+)?(.+)/i,
  ]
  for (const pattern of navPatterns) {
    const match = lower.match(pattern)
    if (match) {
      const target = match[1].trim()
      let route = ''
      if (/game/i.test(target)) route = '/games'
      else if (/assistant|reminder/i.test(target)) route = '/assistant'
      else if (/home|landing/i.test(target)) route = '/'
      else if (/caregiver|care/i.test(target)) route = '/caregiver'
      if (route) return { intent: 'navigate', entities: { route } }
    }
  }

  // --- Default: chat ---
  return { intent: 'chat', entities: { text } }
}

function normalizeTime(raw: string): string {
  let t = raw.trim().toLowerCase()
  // "6am" → "06:00"
  const match12 = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/)
  if (match12) {
    let hours = parseInt(match12[1])
    const minutes = match12[2] || '00'
    const period = match12[3]
    if (period === 'pm' && hours < 12) hours += 12
    if (period === 'am' && hours === 12) hours = 0
    return `${hours.toString().padStart(2, '0')}:${minutes}`
  }
  // "18:00" or "6:30"
  const match24 = t.match(/^(\d{1,2}):(\d{2})$/)
  if (match24) {
    return `${parseInt(match24[1]).toString().padStart(2, '0')}:${match24[2]}`
  }
  // "6" or "7 o'clock"
  const matchHour = t.match(/^(\d{1,2})/)
  if (matchHour) {
    return `${parseInt(matchHour[1]).toString().padStart(2, '0')}:00`
  }
  return raw
}

function extractPhone(text: string): string {
  const match = text.match(/(\d[\d\s\-]{7,})/)
  return match ? match[1].replace(/[\s\-]/g, '') : ''
}

/* ------------------------------------------------------------------ */
/*  Response generator                                                */
/* ------------------------------------------------------------------ */

function generateResponse(
  intent: string,
  entities: Record<string, string>,
  reminderCount: number
): { text: string; action?: VoiceAction } {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  switch (intent) {
    case 'reminder':
      return {
        text: `Got it! I'll remind you to ${entities.title}${entities.time ? ` at ${entities.time}` : ''}. You now have ${reminderCount + 1} reminders. Is there anything else you'd like me to remember?`,
        action: { type: 'reminder', payload: entities },
      }

    case 'call': {
      const name = entities.name
      const response = entities.phone
        ? `Opening phone to call ${name} at ${entities.phone}. I hope your conversation goes well!`
        : `I'll prepare to call ${name}. Please make sure their number is saved in your contacts. Would you like me to help with anything else?`
      return {
        text: response,
        action: { type: 'call', payload: entities },
      }
    }

    case 'alarm':
      return {
        text: `Alarm set for ${entities.time}. I'll make sure to wake you up! Is there anything else?`,
        action: { type: 'alarm', payload: entities },
      }

    case 'task':
      return {
        text: `Added to your today's tasks: ${entities.title}. You can check it off when you're done!`,
        action: { type: 'task', payload: entities },
      }

    case 'game':
      return {
        text: "Great choice! Let's play a memory game to keep your mind sharp. I'm taking you to the games section now.",
        action: { type: 'navigate', payload: { route: '/games' } },
      }

    case 'time': {
      const now = new Date()
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      return { text: `It's currently ${timeStr}. Anything else I can help with?` }
    }

    case 'date': {
      const now = new Date()
      const dateStr = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      return { text: `Today is ${dateStr}. How can I help you today?` }
    }

    case 'greeting':
      return {
        text: `${greeting}! It's wonderful to hear from you. How can I help you today? You can ask me to set reminders, make calls, play memory games, or just chat.`,
      }

    case 'howareyou':
      return {
        text: `I'm doing well, thank you for asking! I'm here to help you with reminders, daily tasks, and keeping your memory sharp. What would you like to do?`,
      }

    case 'thanks':
      return {
        text: `You're very welcome! I'm always here to help. Is there anything else you'd like me to do?`,
      }

    case 'help':
      return {
        text: `I can help you with several things! You can say: "Remind me to take medicine at 8 AM", "Call mom", "Set an alarm for 7", "Add task buy groceries", "I need to water the plants", "Let's play a memory game", "What time is it?", or "Open games". Just speak naturally and I'll understand!`,
      }

    case 'navigate':
      return {
        text: `Taking you there now!`,
        action: { type: 'navigate', payload: entities },
      }

    default:
      return {
        text: `I heard what you said. While I'm still learning, I can help you set reminders, make phone calls, set alarms, play memory games, or check the time. Try saying something like "Remind me to take medicine at 8 AM"!`,
      }
  }
}

/* ------------------------------------------------------------------ */
/*  Hook                                                              */
/* ------------------------------------------------------------------ */

type SpeechRecognitionType = any

export function useVoiceAgent() {
  const [state, setState] = useState<VoiceAgentState>({
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    messages: [],
    transcript: '',
    error: null,
    isSupported: false,
  })

  const recognitionRef = useRef<SpeechRecognitionType | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  // Check support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const supported = !!SpeechRecognition && !!window.speechSynthesis
    setState(prev => ({ ...prev, isSupported: supported }))
    synthRef.current = window.speechSynthesis || null
  }, [])

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      const synth = synthRef.current
      if (!synth) { resolve(); return }

      synth.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0

      // Try to pick a natural voice
      const voices = synth.getVoices()
      const preferred = voices.find(
        v => /samantha|google.*us|female.*en|en.*us/i.test(v.name)
      ) || voices.find(v => v.lang.startsWith('en'))
      if (preferred) utterance.voice = preferred

      utterance.onend = () => {
        setState(prev => ({ ...prev, isSpeaking: false }))
        resolve()
      }
      utterance.onerror = () => {
        setState(prev => ({ ...prev, isSpeaking: false }))
        resolve()
      }

      setState(prev => ({ ...prev, isSpeaking: true }))
      synth.speak(utterance)
    })
  }, [])

  const processTranscript = useCallback(async (text: string) => {
    if (!text.trim()) return

    const userMsg: VoiceMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: Date.now(),
    }

    setState(prev => ({
      ...prev,
      isProcessing: true,
      messages: [...prev.messages, userMsg],
      transcript: '',
    }))

    // Parse and generate response
    const parsed = parseCommand(text)
    const reminderCount = stateRef.current.messages.filter(
      m => m.action?.type === 'reminder'
    ).length
    const { text: responseText, action } = generateResponse(parsed.intent, parsed.entities, reminderCount)

    const agentMsg: VoiceMessage = {
      id: (Date.now() + 1).toString(),
      role: 'agent',
      text: responseText,
      timestamp: Date.now(),
      action,
    }

    setState(prev => ({
      ...prev,
      isProcessing: false,
      messages: [...prev.messages, agentMsg],
    }))

    // Speak the response
    await speak(responseText)

    return action
  }, [speak])

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setState(prev => ({ ...prev, error: 'Speech recognition is not supported in this browser. Please use Chrome.' }))
      return
    }

    // Stop any ongoing speech
    synthRef.current?.cancel()

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setState(prev => ({ ...prev, isListening: true, error: null }))
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      setState(prev => ({ ...prev, transcript: interimTranscript || finalTranscript }))

      if (finalTranscript) {
        processTranscript(finalTranscript)
      }
    }

    recognition.onerror = (event: any) => {
      const errorMsg = event.error === 'no-speech'
        ? "I didn't hear anything. Please try again."
        : event.error === 'audio-capture'
        ? "I couldn't access your microphone. Please check permissions."
        : `Something went wrong: ${event.error}`
      setState(prev => ({ ...prev, isListening: false, error: errorMsg }))
    }

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }))
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [processTranscript])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setState(prev => ({ ...prev, isListening: false }))
  }, [])

  const toggleListening = useCallback(() => {
    if (stateRef.current.isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [startListening, stopListening])

  const sendText = useCallback(async (text: string) => {
    return processTranscript(text)
  }, [processTranscript])

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [] }))
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    toggleListening,
    startListening,
    stopListening,
    sendText,
    speak,
    clearMessages,
    clearError,
  }
}
