import { AnimatePresence, MotionConfig } from 'framer-motion'
import PreferencesProvider from './components/PreferencesProvider'
import PasswordGate from './components/PasswordGate'
import UnlockProvider from './components/UnlockProvider'
import Experience from './pages/Experience'
import { usePreferences } from './hooks/preferencesContext'
import { useLocalStorage } from './hooks/useLocalStorage'

function Gate() {
  const { reducedMotion } = usePreferences()
  const [unlocked, setUnlocked] = useLocalStorage('love_story_unlocked', false)

  return (
    <MotionConfig reducedMotion={reducedMotion ? 'always' : 'never'}>
      <AnimatePresence mode="wait">
        {!unlocked ? (
          <PasswordGate key="gate" onUnlock={() => setUnlocked(true)} />
        ) : (
          <UnlockProvider key="experience">
            <Experience onRelock={() => setUnlocked(false)} />
          </UnlockProvider>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}

function App() {
  return (
    <PreferencesProvider>
      <Gate />
    </PreferencesProvider>
  )
}

export default App
