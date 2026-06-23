import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { musicSrc, trackTitle } from '../data/storyData'

export default function MusicToggle() {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.play().catch(() => setPlaying(false))
    } else {
      audio.pause()
    }
  }, [playing])

  return (
    <>
      <audio ref={audioRef} src={musicSrc} loop />
      <motion.button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        whileTap={{ scale: 0.95 }}
        aria-label={playing ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
        className="glass-card fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full px-3 py-2 shadow-lg"
      >
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 text-base text-white ${
            playing ? 'animate-pulse-once' : ''
          }`}
        >
          {playing ? '⏸' : '▶'}
        </span>
        <span className="hidden max-w-[9rem] truncate text-xs font-medium text-rose-100 sm:block">
          {playing ? trackTitle : 'Nhạc nền'}
        </span>
        <span className="flex items-end gap-0.5 pr-1">
          {[0, 1, 2].map((bar) => (
            <span
              key={bar}
              className="w-0.5 rounded-full bg-rose-200"
              style={{
                height: playing ? undefined : '20%',
                animation: playing ? `waveform 0.7s ease-in-out ${bar * 0.15}s infinite` : 'none',
              }}
            />
          ))}
        </span>
      </motion.button>
    </>
  )
}
