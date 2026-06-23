import { useState } from 'react'
import { motion } from 'framer-motion'
import { stories, moodMeta } from '../data/storyData'
import { useUnlockSystem } from '../hooks/unlockContext'
import MemoryViewer from './MemoryViewer'

export default function MemoryGallery() {
  const [activeId, setActiveId] = useState(null)
  const { isUnlocked } = useUnlockSystem()
  const visibleStories = stories.filter((s) => !s.locked || isUnlocked(s.id))
  const activeIndex = stories.findIndex((s) => s.id === activeId)

  return (
    <section id="gallery" className="px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-3xl text-center"
      >
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">🖼️ Memory Gallery</h2>
        <p className="mt-2 text-sm text-rose-200/80">
          Bấm vào ảnh để zoom, đọc lại chuyện ngày đó, hoặc thêm một note nhỏ
        </p>
      </motion.div>

      <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-2 sm:gap-3">
        {visibleStories.map((story) => {
          const theme = moodMeta[story.mood]
          return (
            <button
              key={story.id}
              type="button"
              onClick={() => setActiveId(story.id)}
              className={`group aspect-square overflow-hidden rounded-xl bg-gradient-to-br ${theme.gradient} shadow-sm`}
            >
              {story.image ? (
                <img
                  src={story.image}
                  alt={story.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl transition-transform duration-300 group-hover:scale-110">
                  {theme.emoji}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {activeIndex !== -1 && (
        <MemoryViewer story={stories[activeIndex]} onClose={() => setActiveId(null)} />
      )}
    </section>
  )
}
