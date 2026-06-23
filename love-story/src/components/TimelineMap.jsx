import { motion } from 'framer-motion'
import { stories, moodMeta, lockedChapterId } from '../data/storyData'
import { useUnlockSystem } from '../hooks/unlockContext'

function MapNode({ story, index, onOpen }) {
  const theme = moodMeta[story.mood]
  const { isUnlocked } = useUnlockSystem()
  const locked = story.locked && !isUnlocked(story.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className="group relative flex items-center gap-4"
    >
      <button
        type="button"
        onClick={() => !locked && onOpen(index)}
        className={`relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-xl shadow-md transition-transform ${
          locked
            ? 'bg-white/10 text-rose-200/40'
            : `animate-glow-pulse bg-gradient-to-br ${theme.gradient} group-hover:scale-110`
        }`}
      >
        {locked ? '🔒' : theme.emoji}
      </button>

      <div className="glass-card flex-1 rounded-2xl p-4 transition-transform group-hover:scale-[1.02]">
        {locked ? (
          <p className="text-sm text-rose-200/70">Chương bí mật — vẫn còn bị khoá 🔒</p>
        ) : (
          <>
            <p className="text-xs uppercase tracking-wide text-rose-200/70">{story.date}</p>
            <p className="text-sm font-semibold text-white">{story.title}</p>
          </>
        )}
      </div>
    </motion.div>
  )
}

function HiddenHeartNode() {
  const { unlock, isUnlocked } = useUnlockSystem()
  const target = stories.find((s) => s.id === lockedChapterId)
  if (isUnlocked(lockedChapterId)) return null

  return (
    <button
      type="button"
      onClick={() => unlock(lockedChapterId, target.title)}
      aria-label="tim ẩn"
      className="ml-7 w-fit text-base opacity-20 transition-opacity hover:opacity-80"
    >
      ✨
    </button>
  )
}

export default function TimelineMap({ onOpen }) {
  return (
    <section id="timeline-map" className="relative px-6 py-20">
      <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl">
        🧭 Bản Đồ Kỷ Niệm
      </h2>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-rose-200/80">
        Mỗi điểm là một mốc kỷ niệm. Có một thứ ẩn trên con đường này — để ý kỹ nhé.
      </p>

      <div className="relative mx-auto mt-12 max-w-xl">
        <div className="absolute left-7 top-2 h-[calc(100%-2rem)] w-0.5 bg-gradient-to-b from-rose-400/50 via-purple-400/40 to-rose-400/10" />

        <div className="flex flex-col gap-8">
          {stories.map((story, idx) => (
            <MapNode key={story.id} story={story} index={idx} onOpen={onOpen} />
          ))}
          <HiddenHeartNode />
        </div>
      </div>
    </section>
  )
}
