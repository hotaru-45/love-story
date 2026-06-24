import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { moodMeta } from '../data/storyData'
import { useLocalStorage } from '../hooks/useLocalStorage'

const EMOTION_STOPS = ['😢', '😐', '🙂', '😄', '🥰']

export default function MemoryViewer({ story, onClose }) {
  const [zoomed, setZoomed] = useState(false)
  const [showStory, setShowStory] = useState(false)
  const [draftNote, setDraftNote] = useState('')
  const [notesByStory, setNotesByStory] = useLocalStorage('love-story-notes', {})
  const [emotionByStory, setEmotionByStory] = useLocalStorage('love-story-emotions', {})
  const theme = moodMeta[story.mood]
  const notes = notesByStory[story.id] || []
  const emotion = emotionByStory[story.id] ?? 50
  const emotionEmoji = EMOTION_STOPS[Math.min(4, Math.floor(emotion / 20))]

  function saveNote() {
    if (!draftNote.trim()) return
    setNotesByStory((prev) => ({
      ...prev,
      [story.id]: [...(prev[story.id] || []), draftNote.trim()],
    }))
    setDraftNote('')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="glass-card flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.4}
          onDragEnd={(_, info) => {
            if (info.offset.y > 80) onClose()
          }}
          className="flex w-full cursor-grab justify-center py-2 active:cursor-grabbing sm:hidden"
        >
          <span className="h-1.5 w-12 rounded-full bg-white/30" />
        </motion.div>

        <div className="relative h-72 w-full overflow-hidden">
          <motion.div
            animate={{ scale: zoomed ? 2 : 1 }}
            drag={zoomed}
            dragConstraints={{ left: -120, right: 120, top: -120, bottom: 120 }}
            dragElastic={0.2}
            transition={{ duration: 0.3 }}
            onClick={() => !zoomed && setZoomed(true)}
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${theme.gradient} text-7xl ${
              zoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
            }`}
          >
            {story.image ? (
              <img
                src={story.image}
                alt={story.title}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              theme.emoji
            )}
          </motion.div>

          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-1 text-[11px] text-white hover:bg-black/60"
          >
            {zoomed ? 'Thu nhỏ' : 'Bấm để zoom'}
          </button>

          <AnimatePresence>
            {showStory && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute inset-x-0 bottom-0 max-h-full overflow-y-auto bg-black/70 p-4 text-sm leading-relaxed text-rose-50 backdrop-blur-md"
              >
                {story.content}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{story.title}</h3>
            <span className="text-xs text-rose-200/80">{story.date}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowStory((s) => !s)}
              className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-rose-100 hover:bg-white/25"
            >
              {showStory ? 'Ẩn câu chuyện' : '❓ Chuyện gì đã xảy ra hôm đó?'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-rose-100 hover:bg-white/25"
            >
              ✕ Đóng
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-rose-200/70">
              Ký ức này khiến bạn cảm thấy...
            </p>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{emotionEmoji}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={emotion}
                onChange={(e) =>
                  setEmotionByStory((prev) => ({ ...prev, [story.id]: Number(e.target.value) }))
                }
                className="flex-1 accent-rose-500"
              />
            </div>
          </div>

          <div className="mt-1 flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-rose-200/70">
              Ghi chú của bạn (lưu trên máy này)
            </p>
            {notes.map((note, i) => (
              <p key={i} className="rounded-xl bg-white/10 px-3 py-2 text-sm text-rose-100">
                📝 {note}
              </p>
            ))}
            <div className="flex gap-2">
              <input
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveNote()}
                placeholder="Thêm một note nhỏ về ký ức này..."
                className="flex-1 rounded-full bg-white/10 px-4 py-2 text-sm text-white placeholder:text-rose-200/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={saveNote}
                className="rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
