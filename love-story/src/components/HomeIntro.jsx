import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { coupleInfo, loveQuotes, lockedChapterId, stories } from '../data/storyData'
import { useTypewriterSequence } from '../hooks/useTypewriter'
import { useUnlockSystem } from '../hooks/unlockContext'
import LoveCounter from './LoveCounter'

const LOGO_EASTER_EGG_THRESHOLD = 5

export default function HomeIntro() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const blobY1 = useTransform(scrollYProgress, [0, 1], [0, 120])
  const blobY2 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const { completedLines, currentLine } = useTypewriterSequence(coupleInfo.tagline)
  const { unlock } = useUnlockSystem()
  const lockedChapter = stories.find((s) => s.id === lockedChapterId)

  const [logoClicks, setLogoClicks] = useState(0)
  const [quote, setQuote] = useState(null)
  const [transitioning, setTransitioning] = useState(false)

  function handleLogoClick() {
    const next = logoClicks + 1
    setLogoClicks(next)
    if (next >= LOGO_EASTER_EGG_THRESHOLD) {
      unlock(lockedChapterId, lockedChapter.title)
      setLogoClicks(0)
    }
  }

  function revealQuote() {
    setQuote(loveQuotes[Math.floor(Math.random() * loveQuotes.length)])
  }

  function enterMemoryWorld() {
    setTransitioning(true)
    setTimeout(() => {
      document.getElementById('story-engine')?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => setTransitioning(false), 400)
    }, 350)
  }

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-20 text-center"
    >
      <motion.div
        style={{ y: blobY1 }}
        className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-purple-600/30 blur-3xl"
      />
      <motion.div
        style={{ y: blobY2 }}
        className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-rose-500/30 blur-3xl"
      />

      <motion.div style={{ opacity: contentOpacity }} className="relative flex flex-col items-center">
        <motion.button
          type="button"
          onClick={handleLogoClick}
          whileTap={{ scale: 0.9 }}
          className="select-none text-sm font-medium uppercase tracking-[0.2em] text-rose-200/80"
        >
          💌 Our Story
        </motion.button>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-4 text-3xl font-light tracking-wide text-white sm:text-5xl"
        >
          {coupleInfo.person1} &amp; {coupleInfo.person2}
        </motion.h1>

        <div className="mt-3 min-h-14 text-base text-rose-200 sm:text-lg">
          {completedLines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
          <p>
            {currentLine}
            <span className="animate-pulse">|</span>
          </p>
        </div>

        <div className="mt-8">
          <LoveCounter />
        </div>

        <div className="mt-8 flex items-center gap-3">
          <motion.button
            type="button"
            onClick={enterMemoryWorld}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-rose-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600"
          >
            Enter Memory World ↓
          </motion.button>

          <motion.button
            type="button"
            onMouseEnter={revealQuote}
            onClick={revealQuote}
            whileTap={{ scale: 0.9 }}
            aria-label="love quote"
            className="rounded-full bg-white/10 p-3 text-xl hover:bg-white/20"
          >
            💗
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {quote && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass-card absolute bottom-10 max-w-xs rounded-2xl px-5 py-4 text-sm italic text-rose-100"
            onClick={() => setQuote(null)}
          >
            “{quote}”
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {transitioning && (
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 2.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeIn' }}
            className="fixed inset-0 z-[70] rounded-full bg-rose-500 blur-2xl"
            style={{ transformOrigin: 'center' }}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
