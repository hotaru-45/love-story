import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { finalLetter } from '../data/storyData'

export default function FinalLetter() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -100px 0px' })
  const [opened, setOpened] = useState(false)

  return (
    <section
      ref={ref}
      className={`relative px-6 py-24 transition-colors duration-1000 ${
        opened ? 'bg-gradient-to-b from-amber-900/20 via-rose-900/30 to-transparent' : ''
      }`}
    >
      {inView && !opened && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setOpened(true)}
          className="glass-card mx-auto flex max-w-sm flex-col items-center gap-3 rounded-3xl px-8 py-10 text-center"
        >
          <span className="text-4xl">💌</span>
          <p className="text-sm font-medium text-rose-100">
            {finalLetter.intro[0]}
            <br />
            {finalLetter.intro[1]}
          </p>
          <span className="text-xs text-rose-300">Bấm để mở lá thư cuối</span>
        </motion.button>
      )}

      <AnimatePresence>
        {opened && (
          <motion.div
            initial={{ opacity: 0, scale: 1.4, filter: 'blur(16px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="glass-card mx-auto max-w-xl rounded-3xl p-8 sm:p-10"
          >
            <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl">
              {finalLetter.title}
            </h2>
            <div className="mt-6 space-y-4 font-serif text-[15px] italic leading-relaxed text-rose-100/90 sm:text-base">
              {finalLetter.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <p className="mt-6 text-right text-sm font-medium text-rose-300">
              {finalLetter.signature}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
