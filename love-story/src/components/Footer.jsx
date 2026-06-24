import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { footerInfo } from '../data/storyData'
import SettingsPanel from './SettingsPanel'

export default function Footer({ onRelock }) {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <footer className="flex flex-col items-center gap-3 px-6 py-10 text-center text-sm text-rose-200/70">
      <p>Thực hiện với ❤️ bởi {footerInfo.madeBy}</p>
      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-rose-100 hover:bg-white/20"
      >
        ⚙️ Cài đặt
      </button>

      <AnimatePresence>
        {settingsOpen && (
          <SettingsPanel onClose={() => setSettingsOpen(false)} onRelock={onRelock} />
        )}
      </AnimatePresence>
    </footer>
  )
}
