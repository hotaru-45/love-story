import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { coupleInfo } from '../data/storyData'

function getElapsed(startDate) {
  const start = new Date(startDate).getTime()
  const diff = Math.max(0, Date.now() - start)

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function TimeUnit({ value, label, beat }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-white/20 bg-white/10 px-3 py-3 backdrop-blur-md sm:px-5 sm:py-4">
      <motion.span
        key={beat}
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="text-2xl font-semibold text-rose-100 sm:text-4xl"
      >
        {String(value).padStart(2, '0')}
      </motion.span>
      <span className="mt-1 text-[11px] uppercase tracking-wide text-rose-200/80 sm:text-xs">
        {label}
      </span>
    </div>
  )
}

export default function LoveCounter({ compact = false }) {
  const [elapsed, setElapsed] = useState(() => getElapsed(coupleInfo.startDate))

  useEffect(() => {
    const id = setInterval(() => setElapsed(getElapsed(coupleInfo.startDate)), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="animate-glow-pulse flex flex-col items-center gap-3 rounded-3xl p-4">
      {!compact && (
        <span key={elapsed.seconds} className="animate-pulse-once text-3xl">
          💓
        </span>
      )}
      <div
        className={`grid grid-cols-4 gap-2 sm:gap-4 ${compact ? 'max-w-xs' : 'max-w-md'} mx-auto`}
      >
        <TimeUnit value={elapsed.days} label="Ngày" beat={`d${elapsed.seconds}`} />
        <TimeUnit value={elapsed.hours} label="Giờ" beat={`h${elapsed.seconds}`} />
        <TimeUnit value={elapsed.minutes} label="Phút" beat={`m${elapsed.seconds}`} />
        <TimeUnit value={elapsed.seconds} label="Giây" beat={`s${elapsed.seconds}`} />
      </div>
    </div>
  )
}
