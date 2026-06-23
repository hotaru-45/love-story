import { useMemo, useState } from 'react'
import { UnlockContext, playChime } from '../hooks/unlockContext'
import { useLocalStorage } from '../hooks/useLocalStorage'

export default function UnlockProvider({ children }) {
  const [unlockedIds, setUnlockedIds] = useLocalStorage('love-story-unlocks', [])
  const [lastUnlocked, setLastUnlocked] = useState(null)

  const value = useMemo(
    () => ({
      isUnlocked: (id) => unlockedIds.includes(id),
      unlock: (id, label) => {
        setUnlockedIds((prev) => {
          if (prev.includes(id)) return prev
          playChime()
          setLastUnlocked({ id, label, key: Date.now() })
          return [...prev, id]
        })
      },
      lastUnlocked,
      clearToast: () => setLastUnlocked(null),
    }),
    [unlockedIds, lastUnlocked, setUnlockedIds],
  )

  return <UnlockContext.Provider value={value}>{children}</UnlockContext.Provider>
}
