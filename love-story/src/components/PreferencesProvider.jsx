import { useMemo } from 'react'
import { PreferencesContext } from '../hooks/preferencesContext'
import { useLocalStorage } from '../hooks/useLocalStorage'

function detectReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

function detectMobileDevice() {
  if (typeof window === 'undefined') return false
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false
  return coarsePointer || window.innerWidth < 768
}

const DEFAULT_PREFERENCES = {
  music: true,
  reducedMotion: detectReducedMotion(),
  performanceMode: detectMobileDevice(),
}

export default function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useLocalStorage('love-story-preferences', DEFAULT_PREFERENCES)

  const value = useMemo(
    () => ({
      music: prefs.music,
      reducedMotion: prefs.reducedMotion,
      performanceMode: prefs.performanceMode,
      lite: prefs.reducedMotion || prefs.performanceMode,
      setMusic: (music) => setPrefs((prev) => ({ ...prev, music })),
      setReducedMotion: (reducedMotion) => setPrefs((prev) => ({ ...prev, reducedMotion })),
      setPerformanceMode: (performanceMode) => setPrefs((prev) => ({ ...prev, performanceMode })),
    }),
    [prefs, setPrefs],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}
