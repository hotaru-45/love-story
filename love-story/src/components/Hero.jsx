import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { coupleInfo } from '../data/loveData'

const EASTER_EGG_THRESHOLD = 10

function getElapsed(startDate) {
  const start = new Date(startDate).getTime()
  const now = Date.now()
  const diff = Math.max(0, now - start)

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return { days, hours, minutes, seconds }
}

function useTypewriter(text, speed = 70) {
  const [shown, setShown] = useState('')

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      i += 1
      setShown(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  return shown
}

function TimeUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white/60 px-3 py-3 shadow-sm backdrop-blur-sm dark:bg-white/10 sm:px-5 sm:py-4">
      <span className="text-2xl font-semibold text-rose-600 dark:text-rose-300 sm:text-4xl">
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-1 text-[11px] uppercase tracking-wide text-rose-400 sm:text-xs">
        {label}
      </span>
    </div>
  )
}

export default function Hero() {
  const [elapsed, setElapsed] = useState(() => getElapsed(coupleInfo.startDate))
  const [clicks, setClicks] = useState(0)
  const [showEgg, setShowEgg] = useState(false)
  const typed = useTypewriter(coupleInfo.tagline)

  useEffect(() => {
    const id = setInterval(() => setElapsed(getElapsed(coupleInfo.startDate)), 1000)
    return () => clearInterval(id)
  }, [])

  function handleHeartClick() {
    const next = clicks + 1
    setClicks(next)
    if (next >= EASTER_EGG_THRESHOLD) {
      setShowEgg(true)
      setClicks(0)
    }
  }

  const startDateLabel = new Date(coupleInfo.startDate).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      <motion.button
        type="button"
        aria-label="heart"
        onClick={handleHeartClick}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="animate-heartbeat select-none text-6xl drop-shadow-sm sm:text-7xl"
      >
        💖
      </motion.button>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="mt-6 text-3xl font-semibold text-rose-700 dark:text-rose-200 sm:text-5xl"
      >
        {coupleInfo.person1} &amp; {coupleInfo.person2}
      </motion.h1>

      <p className="mt-3 h-7 text-base text-rose-500 dark:text-rose-300 sm:text-lg">
        {typed}
        <span className="animate-pulse">|</span>
      </p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="mt-6 text-sm text-rose-400 dark:text-rose-300 sm:text-base"
      >
        We&apos;ve been together since <span className="font-medium">{startDateLabel}</span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.8 }}
        className="mt-6 grid grid-cols-4 gap-2 sm:gap-4"
      >
        <TimeUnit value={elapsed.days} label="Ngày" />
        <TimeUnit value={elapsed.hours} label="Giờ" />
        <TimeUnit value={elapsed.minutes} label="Phút" />
        <TimeUnit value={elapsed.seconds} label="Giây" />
      </motion.div>

      {showEgg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/40 p-6"
          onClick={() => setShowEgg(false)}
        >
          <div className="relative max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl dark:bg-rose-950">
            <p className="text-4xl">💕🎁💕</p>
            <p className="mt-4 text-lg font-medium text-rose-600 dark:text-rose-200">
              Bạn tìm ra easter egg rồi! Anh/em yêu bạn nhiều lắm 🥰
            </p>
            <button
              type="button"
              onClick={() => setShowEgg(false)}
              className="mt-5 rounded-full bg-rose-500 px-5 py-2 text-sm font-medium text-white hover:bg-rose-600"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
