import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { stories } from '../data/storyData'

// Trợ lý "AI" giả lập — không gọi API thật (app này không có backend), chỉ
// chọn ngẫu nhiên một chapter có sẵn để gợi nhớ. Ghi rõ là mô phỏng, không
// phải AI thật, để không gây hiểu lầm.
export default function MemoryAssistant({ onOpenStory }) {
  const [suggestion, setSuggestion] = useState(null)

  function recall() {
    const unlockedStories = stories.filter((s) => !s.locked)
    const pick = unlockedStories[Math.floor(Math.random() * unlockedStories.length)]
    setSuggestion(pick)
  }

  return (
    <div className="fixed bottom-5 left-5 z-40 flex flex-col items-start gap-2">
      <AnimatePresence>
        {suggestion && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="glass-card w-64 rounded-2xl p-4 text-sm text-rose-100"
          >
            <p>
              💭 Tớ vừa nhớ ra một kỷ niệm: <strong>{suggestion.title}</strong> vào{' '}
              {suggestion.date}!
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onOpenStory(stories.findIndex((s) => s.id === suggestion.id))
                  setSuggestion(null)
                }}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium hover:bg-white/25"
              >
                Xem lại →
              </button>
              <button
                type="button"
                onClick={() => setSuggestion(null)}
                className="rounded-full bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
              >
                Bỏ qua
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={recall}
        whileTap={{ scale: 0.95 }}
        title="Trợ lý ký ức (mô phỏng, không phải AI thật)"
        className="glass-card flex h-12 w-12 items-center justify-center rounded-full text-xl shadow-lg"
      >
        💭
      </motion.button>
    </div>
  )
}
