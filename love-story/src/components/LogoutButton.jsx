import { motion } from 'framer-motion'

export default function LogoutButton({ onRelock }) {
  return (
    <motion.button
      type="button"
      onClick={onRelock}
      whileTap={{ scale: 0.95 }}
      aria-label="Đăng xuất và khoá lại trang"
      className="glass-card fixed left-5 top-5 z-40 flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-rose-100 shadow-lg hover:bg-white/20"
    >
      <span className="text-base">🔒</span>
      <span className="hidden sm:inline">Khoá trang</span>
    </motion.button>
  )
}
