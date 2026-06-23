import { useEffect, useRef } from 'react'
import { useInView } from 'framer-motion'
import { lockedChapterId, stories } from '../data/storyData'
import { useUnlockSystem } from '../hooks/unlockContext'

// Sentinel vô hình — khi người dùng cuộn tới đây, tự động unlock chapter bí
// mật. Một trong 4 cách unlock (cùng với logo x5, heart ẩn, nhập mã).
export default function ScrollDepthUnlocker() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const { unlock, isUnlocked } = useUnlockSystem()

  useEffect(() => {
    if (!inView || isUnlocked(lockedChapterId)) return
    const target = stories.find((s) => s.id === lockedChapterId)
    unlock(lockedChapterId, target.title)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  return <div ref={ref} className="h-px w-full" aria-hidden="true" />
}
