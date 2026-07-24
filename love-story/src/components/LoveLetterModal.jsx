import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoveLetterIcon from './LoveLetterIcon'

// Nội dung thư được viết dạng template string nhiều dòng — tách thành
// từng đoạn theo dòng trống, gộp khoảng trắng/indent thừa trong mỗi đoạn.
function parseLetterContent(content) {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

export default function LoveLetterModal({ letter, onClose, onRead }) {
  const [stage, setStage] = useState('envelope')
  const paragraphs = parseLetterContent(letter.content)

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  function openEnvelope() {
    setStage('letter')
    onRead()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng lá thư"
        className="absolute right-4 top-4 z-10 rounded-full bg-white/15 px-3 py-1.5 text-sm text-white hover:bg-white/25 sm:right-6 sm:top-6"
      >
        ✕
      </button>

      <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait">
          {stage === 'envelope' ? (
            <motion.button
              key="envelope"
              type="button"
              onClick={openEnvelope}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, filter: 'blur(4px)' }}
              transition={{ duration: 0.4 }}
              className="glass-card mx-auto flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl px-8 py-12 text-center"
            >
              <span className="animate-glow-pulse flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-white">
                <LoveLetterIcon className="h-7 w-7" />
              </span>
              <p className="text-sm font-medium text-rose-100">{letter.subtitle}</p>
              <span className="text-xs text-rose-300">Chạm để mở lá thư</span>
            </motion.button>
          ) : (
            <motion.div
              key="letter"
              initial={{ opacity: 0, scale: 1.08, filter: 'blur(12px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="glass-card relative flex max-h-[80vh] flex-col overflow-hidden rounded-3xl"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-rose-500/10" />

              <div className="relative flex flex-1 flex-col gap-5 overflow-y-auto p-6 sm:p-10">
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-3xl">💌</span>
                  <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">{letter.title}</h2>
                  <p className="text-sm italic text-rose-200/80">{letter.subtitle}</p>
                </div>

                <div className="mx-auto h-px w-16 bg-gradient-to-r from-transparent via-rose-300/50 to-transparent" />

                <div className="space-y-4 text-[15px] italic leading-relaxed text-rose-100/90 sm:text-base">
                  {paragraphs.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>

                <div className="mx-auto h-px w-16 bg-gradient-to-r from-transparent via-rose-300/50 to-transparent" />

                <p className="text-right text-sm font-medium text-rose-300">{letter.signature}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
