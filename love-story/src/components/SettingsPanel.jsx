import { motion } from 'framer-motion'
import { usePreferences } from '../hooks/preferencesContext'

function Toggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-left"
    >
      <span className="text-sm text-rose-100">{label}</span>
      <span
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
          checked ? 'bg-rose-500' : 'bg-white/20'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}

export default function SettingsPanel({ onClose, onRelock }) {
  const { music, reducedMotion, performanceMode, setMusic, setReducedMotion, setPerformanceMode } =
    usePreferences()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card flex w-full max-w-sm flex-col gap-3 rounded-3xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">⚙️ Cài đặt</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/15 px-3 py-1 text-sm text-white hover:bg-white/25"
          >
            ✕
          </button>
        </div>

        <Toggle label="🎵 Nhạc nền" checked={music} onChange={setMusic} />
        <Toggle label="🐢 Giảm hiệu ứng động" checked={reducedMotion} onChange={setReducedMotion} />
        <Toggle
          label="📱 Chế độ tiết kiệm hiệu năng"
          checked={performanceMode}
          onChange={setPerformanceMode}
        />

        <button
          type="button"
          onClick={() => {
            onClose()
            onRelock?.()
          }}
          className="mt-2 rounded-full bg-rose-500/90 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-600"
        >
          🔒 Khoá lại
        </button>
      </motion.div>
    </motion.div>
  )
}
