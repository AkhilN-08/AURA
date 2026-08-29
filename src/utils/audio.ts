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
