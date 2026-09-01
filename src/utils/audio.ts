let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext()
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** Gentle chime when a pair is matched */
export function playMatchChime() {
  const c = getCtx()
  if (!c) return

  const now = c.currentTime

  // Two-note ascending chime
  const notes = [523.25, 659.25] // C5, E5
  notes.forEach((freq, i) => {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, now + i * 0.12)
    gain.gain.linearRampToValueAtTime(0.15, now + i * 0.12 + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4)
    osc.connect(gain)
    gain.connect(c.destination)
    osc.start(now + i * 0.12)
    osc.stop(now + i * 0.12 + 0.5)
  })
}

/** Celebration chord when game is won */
export function playWinChime() {
  const c = getCtx()
  if (!c) return

  const now = c.currentTime

  // Three-note ascending chord: C5, E5, G5
  const notes = [523.25, 659.25, 783.99]
  notes.forEach((freq, i) => {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, now + i * 0.15)
    gain.gain.linearRampToValueAtTime(0.12, now + i * 0.15 + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.8)
    osc.connect(gain)
    gain.connect(c.destination)
    osc.start(now + i * 0.15)
    osc.stop(now + i * 0.15 + 0.9)
  })
}

/** Gentle tap feedback */
export function playTapSound() {
  const c = getCtx()
  if (!c) return

  const now = c.currentTime
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'sine'
  osc.frequency.value = 440
  gain.gain.setValueAtTime(0.08, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(now)
  osc.stop(now + 0.15)
}

/** Speak text aloud using the browser's speech synthesis */
export function speakText(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.85
  utterance.pitch = 1.0
  utterance.volume = 1.0
  // Try to pick a natural English voice
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'))
    || voices.find(v => v.lang.startsWith('en'))
  if (preferred) utterance.voice = preferred
  window.speechSynthesis.speak(utterance)
}

/** Gentle reminder chime */
export function playReminderChime() {
  const c = getCtx()
  if (!c) return

  const now = c.currentTime
  // Three ascending notes: G4, B4, D5
  const notes = [392, 493.88, 587.33]
  notes.forEach((freq, i) => {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, now + i * 0.2)
    gain.gain.linearRampToValueAtTime(0.15, now + i * 0.2 + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.5)
    osc.connect(gain)
    gain.connect(c.destination)
    osc.start(now + i * 0.2)
    osc.stop(now + i * 0.2 + 0.6)
  })
}

/** Trigger device vibration if available */
export function vibrateDevice(pattern: number[] = [100, 50, 100]) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}
