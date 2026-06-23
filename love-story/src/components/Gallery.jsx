import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { galleryImages } from '../data/loveData'

function GalleryTile({ item, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-rose-200 to-pink-300 shadow-sm dark:from-rose-800 dark:to-pink-900"
    >
      {item.src ? (
        <img
          src={item.src}
          alt={item.caption}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-4xl transition-transform duration-300 group-hover:scale-110">
          {item.emoji}
        </div>
      )}
    </button>
  )
}

export default function Gallery() {
  const [active, setActive] = useState(null)

  return (
    <section className="px-6 py-20">
      <h2 className="text-center text-2xl font-semibold text-rose-700 dark:text-rose-200 sm:text-3xl">
        Bộ sưu tập ảnh
      </h2>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-rose-400 dark:text-rose-300">
        Nhấn vào ảnh để xem lớn hơn
      </p>

      <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-2 sm:gap-3">
        {galleryImages.map((item) => (
          <GalleryTile key={item.id} item={item} onClick={() => setActive(item)} />
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md rounded-2xl bg-white p-3 shadow-xl dark:bg-rose-950"
              onClick={(e) => e.stopPropagation()}
            >
              {active.src ? (
                <img
                  src={active.src}
                  alt={active.caption}
                  className="max-h-[70vh] w-full rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-72 w-full items-center justify-center rounded-xl bg-gradient-to-br from-rose-200 to-pink-300 text-7xl dark:from-rose-800 dark:to-pink-900">
                  {active.emoji}
                </div>
              )}
              <p className="mt-3 text-center text-sm text-rose-500 dark:text-rose-300">
                {active.caption}
              </p>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="mt-3 w-full rounded-full bg-rose-500 py-2 text-sm font-medium text-white hover:bg-rose-600"
              >
                Đóng
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
