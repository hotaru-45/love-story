import { createContext, useContext } from 'react'

export const UnlockContext = createContext(null)

export function useUnlockSystem() {
  const ctx = useContext(UnlockContext)
  if (!ctx) throw new Error('useUnlockSystem must be used within UnlockProvider')
  return ctx
}

export function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(660, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(990, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.5)
  } catch {
    // Web Audio not available — unlock still works, just silent.
  }
}
