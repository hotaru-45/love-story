import { motion } from 'framer-motion'
import LoveLetterIcon from './LoveLetterIcon'

export default function LoveLetterButton({ isRead, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: [0, -6, 0], scale: 1 }}
      transition={{
        opacity: { duration: 0.5 },
        scale: { duration: 0.5 },
        y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Mở lá thư kỷ niệm tháng này"
      title="Có một lá thư dành cho em 💌"
      className="glass-card fixed bottom-24 right-5 z-40 flex items-center gap-2 rounded-full py-2 pl-2 pr-3 shadow-lg"
    >
      <span
        className={`relative flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 text-white ${
          isRead ? '' : 'animate-glow-pulse'
        }`}
      >
        <LoveLetterIcon className="h-4 w-4" />
        {!isRead && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber-300 ring-2 ring-[#1a0b1f]" />
        )}
      </span>
      <span className="hidden max-w-[10rem] truncate text-xs font-medium text-rose-100 sm:block">
        Một lá thư dành cho em...
      </span>
    </motion.button>
  )
}
