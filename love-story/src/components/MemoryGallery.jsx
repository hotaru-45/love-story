import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { stories, moodMeta, galleryPhotos } from '../data/storyData'
import { useUnlockSystem } from '../hooks/unlockContext'
import MemoryViewer from './MemoryViewer'

function PhotoLightbox({ photo, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card max-w-md overflow-hidden rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={photo.src} alt={photo.caption} className="max-h-[70vh] w-full object-cover" />
        <div className="flex items-center justify-between p-4">
          <p className="text-sm text-rose-100">{photo.caption}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-rose-100 hover:bg-white/25"
          >
            ✕ Đóng
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function MemoryGallery() {
  const [activeId, setActiveId] = useState(null)
  const [activePhotoId, setActivePhotoId] = useState(null)
  const { isUnlocked } = useUnlockSystem()
  const visibleStories = stories.filter((s) => !s.locked || isUnlocked(s.id))
  const activeIndex = stories.findIndex((s) => s.id === activeId)
  const activePhoto = galleryPhotos.find((p) => p.id === activePhotoId)

  return (
    <section id="gallery" className="px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-3xl text-center"
      >
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">🖼️ Bộ Sưu Tập Kỷ Niệm</h2>
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
                  loading="lazy"
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

      {galleryPhotos.length > 0 && (
        <>
          <h3 className="mx-auto mt-14 max-w-3xl text-center text-lg font-medium text-rose-100">
            📷 Ảnh kỷ niệm khác
          </h3>
          <div className="mx-auto mt-6 grid max-w-3xl grid-cols-3 gap-2 sm:gap-3">
            {galleryPhotos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setActivePhotoId(photo.id)}
                className="group aspect-square overflow-hidden rounded-xl bg-white/10 shadow-sm"
              >
                <img
                  src={photo.src}
                  alt={photo.caption}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </>
      )}

      {activeIndex !== -1 && (
        <MemoryViewer story={stories[activeIndex]} onClose={() => setActiveId(null)} />
      )}

      <AnimatePresence>
        {activePhoto && (
          <PhotoLightbox photo={activePhoto} onClose={() => setActivePhotoId(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}
