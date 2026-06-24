import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { anniversaryPassword } from '../data/storyData'
import { usePreferences } from '../hooks/preferencesContext'
import FloatingHearts from './FloatingHearts'

function formatDateInput(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  const parts = []
  if (digits.length > 0) parts.push(digits.slice(0, 2))
  if (digits.length > 2) parts.push(digits.slice(2, 4))
  if (digits.length > 4) parts.push(digits.slice(4, 8))
  return parts.join('/')
}

export default function PasswordGate({ onUnlock }) {
  const { lite } = usePreferences()
  const [value, setValue] = useState('')
  const [wrong, setWrong] = useState(false)
  const [unlocking, setUnlocking] = useState(false)

  function submit(e) {
    e.preventDefault()
    if (value === anniversaryPassword) {
      setWrong(false)
      setUnlocking(true)
      setTimeout(onUnlock, 550)
    } else {
      setWrong(false)
      requestAnimationFrame(() => setWrong(true))
    }
  }

  return (
    <motion.div
      key="gate"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#1a0b1f] via-[#2b1030] to-[#1a0b1f] px-6 ${
        lite ? 'lite-mode' : ''
      }`}
    >
      <FloatingHearts />

      <motion.form
        onSubmit={submit}
        onAnimationEnd={() => setWrong(false)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`glass-card relative z-10 flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl px-7 py-10 text-center ${
          wrong ? 'animate-shake' : ''
        }`}
      >
        <span
          className={`text-5xl ${unlocking ? '' : 'animate-lock-pulse'}`}
          aria-hidden="true"
        >
          {unlocking ? '🔓' : '🔒'}
        </span>

        <h1 className="text-xl font-semibold text-white">Only us know this secret ❤️</h1>
        <p className="text-sm text-rose-200/80">Enter the date our story began</p>

        <input
          value={value}
          onChange={(e) => setValue(formatDateInput(e.target.value))}
          inputMode="numeric"
          autoComplete="off"
          placeholder="12/08/2024"
          maxLength={10}
          className="w-full rounded-full bg-white/10 px-5 py-3 text-center text-lg tracking-widest text-white placeholder:text-rose-200/40 focus:outline-none focus:ring-2 focus:ring-rose-400/60"
        />

        <button
          type="submit"
          className="w-full rounded-full bg-rose-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600"
        >
          Enter
        </button>

        <AnimatePresence>
          {wrong && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-rose-300"
            >
              Hmm... that's not our day.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.form>
    </motion.div>
  )
}
