import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { secretCode, lockedChapterId, stories } from '../data/storyData'
import { useUnlockSystem } from '../hooks/unlockContext'

export default function UnlockSystem() {
  const { lastUnlocked, clearToast, unlock, isUnlocked } = useUnlockSystem()
  const [code, setCode] = useState('')
  const [wrong, setWrong] = useState(false)

  useEffect(() => {
    if (!lastUnlocked) return
    const id = setTimeout(clearToast, 3500)
    return () => clearTimeout(id)
  }, [lastUnlocked, clearToast])
  const lockedChapter = stories.find((s) => s.id === lockedChapterId)
  const alreadyUnlocked = isUnlocked(lockedChapterId)

  function submitCode(e) {
    e.preventDefault()
    if (code.trim().toLowerCase() === secretCode) {
      unlock(lockedChapterId, lockedChapter.title)
      setCode('')
      setWrong(false)
    } else {
      setWrong(true)
    }
  }

  return (
    <>
      {!alreadyUnlocked && (
        <details className="glass-card mx-auto mt-10 w-full max-w-sm rounded-2xl p-4 text-center open:text-left">
          <summary className="cursor-pointer text-sm font-medium text-rose-200/80">
            🔐 Bạn biết mã bí mật?
          </summary>
          <form onSubmit={submitCode} className="mt-3 flex gap-2">
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setWrong(false)
              }}
              placeholder="Nhập mã bí mật..."
              className="flex-1 rounded-full bg-white/10 px-4 py-2 text-sm text-white placeholder:text-rose-200/50 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
            >
              Mở khoá
            </button>
          </form>
          {wrong && <p className="mt-2 text-xs text-rose-300">Sai mã rồi, thử lại nha 🙈</p>}
        </details>
      )}

      <AnimatePresence>
        {lastUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: -40, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -40, x: '-50%' }}
            transition={{ duration: 0.4 }}
            className="animate-glow-pulse fixed left-1/2 top-6 z-[60] flex items-center gap-3 rounded-full border border-rose-300/40 bg-gradient-to-r from-rose-500/90 to-purple-500/90 px-5 py-3 text-sm font-medium text-white shadow-xl"
          >
            <span className="text-lg">🏆</span>
            <span>Đã mở khoá: {lastUnlocked.label}!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
