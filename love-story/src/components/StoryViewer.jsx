import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { moodMeta } from '../data/storyData'

const VOICE_NOTE_DURATION = 4500

function VoiceNoteButton({ active, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2 self-start rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-rose-100 transition hover:bg-white/25"
    >
      <span>{active ? '⏸️' : '🎙️'}</span>
      <span>{active ? 'Đang nghe voice note...' : 'Nghe voice note'}</span>
      <span className="flex items-end gap-0.5 h-4">
        {[0, 1, 2, 3, 4].map((bar) => (
          <span
            key={bar}
            className="w-0.5 rounded-full bg-rose-200"
            style={{
              height: active ? undefined : '30%',
              animation: active ? `waveform 0.6s ease-in-out ${bar * 0.1}s infinite` : 'none',
            }}
          />
        ))}
      </span>
    </button>
  )
}

export default function StoryViewer({ stories, index, onClose, onChangeIndex }) {
  const [activeVoiceId, setActiveVoiceId] = useState(null)
  const story = stories[index]
  const theme = moodMeta[story.mood]
  const voiceActive = activeVoiceId === story.id

  useEffect(() => {
    if (!voiceActive) return
    const id = setTimeout(() => setActiveVoiceId(null), VOICE_NOTE_DURATION)
    return () => clearTimeout(id)
  }, [voiceActive])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  function goNext() {
    if (index < stories.length - 1) onChangeIndex(index + 1)
  }
  function goPrev() {
    if (index > 0) onChangeIndex(index - 1)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div className="flex w-full max-w-md flex-col gap-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-1.5">
          {stories.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Chapter ${i + 1}`}
              onClick={() => onChangeIndex(i)}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= index ? 'bg-white' : 'bg-white/25'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="self-end rounded-full bg-white/15 px-3 py-1 text-sm text-white hover:bg-white/25"
        >
          ✕ Đóng
        </button>

        <AnimatePresence mode="wait" custom={index}>
          <motion.div
            key={story.id}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) goNext()
              else if (info.offset.x > 80) goPrev()
            }}
            initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="glass-card flex max-h-[80vh] cursor-grab flex-col overflow-hidden rounded-3xl active:cursor-grabbing"
          >
            {story.image ? (
              <img src={story.image} alt={story.title} className="h-56 w-full object-cover" />
            ) : (
              <div
                className={`flex h-56 w-full items-center justify-center bg-gradient-to-br ${theme.gradient} text-7xl`}
              >
                {theme.emoji}
              </div>
            )}

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-rose-100">
                  {theme.emoji} {theme.label}
                </span>
                <span className="text-xs text-rose-200/80">{story.date}</span>
              </div>

              <h2 className="text-xl font-semibold text-white">{story.title}</h2>
              <p className="text-sm leading-relaxed text-rose-100/90">{story.content}</p>

              {story.hasVoiceNote && (
                <VoiceNoteButton
                  active={voiceActive}
                  onToggle={() => setActiveVoiceId(voiceActive ? null : story.id)}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between px-1">
          <button
            type="button"
            onClick={goPrev}
            disabled={index === 0}
            className="rounded-full bg-white/15 px-4 py-2 text-sm text-white disabled:opacity-30"
          >
            ← Trước
          </button>
          <span className="text-xs text-rose-200/70">
            {index + 1} / {stories.length}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={index === stories.length - 1}
            className="rounded-full bg-white/15 px-4 py-2 text-sm text-white disabled:opacity-30"
          >
            Tiếp →
          </button>
        </div>
      </div>
    </motion.div>
  )
}
