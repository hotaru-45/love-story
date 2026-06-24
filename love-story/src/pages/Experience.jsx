import { lazy, Suspense, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { stories } from '../data/storyData'
import { usePreferences } from '../hooks/preferencesContext'
import FloatingHearts from '../components/FloatingHearts'
import HomeIntro from '../components/HomeIntro'
import UnlockSystem from '../components/UnlockSystem'
import ScrollDepthUnlocker from '../components/ScrollDepthUnlocker'
import MusicToggle from '../components/MusicToggle'
import Footer from '../components/Footer'

const StoryEngine = lazy(() => import('../components/StoryEngine'))
const TimelineMap = lazy(() => import('../components/TimelineMap'))
const MemoryGallery = lazy(() => import('../components/MemoryGallery'))
const ChatReplay = lazy(() => import('../components/ChatReplay'))
const FinalLetter = lazy(() => import('../components/FinalLetter'))
const StoryViewer = lazy(() => import('../components/StoryViewer'))
const MemoryAssistant = lazy(() => import('../components/MemoryAssistant'))

function SectionSkeleton() {
  return (
    <div className="mx-auto my-10 h-40 w-full max-w-3xl animate-pulse rounded-3xl bg-white/5" />
  )
}

export default function Experience({ onRelock }) {
  const [storyIndex, setStoryIndex] = useState(null)
  const { lite } = usePreferences()

  return (
    <div
      className={`relative min-h-svh overflow-x-hidden bg-gradient-to-b from-[#1a0b1f] via-[#2b1030] to-[#1a0b1f] ${
        lite ? 'lite-mode' : ''
      }`}
    >
      <FloatingHearts />

      <div className="relative z-10">
        <HomeIntro />
        <Suspense fallback={<SectionSkeleton />}>
          <StoryEngine onOpen={setStoryIndex} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <TimelineMap onOpen={setStoryIndex} />
        </Suspense>
        <div className="px-6">
          <UnlockSystem />
        </div>
        <Suspense fallback={<SectionSkeleton />}>
          <MemoryGallery />
        </Suspense>
        <ScrollDepthUnlocker />
        <Suspense fallback={<SectionSkeleton />}>
          <ChatReplay onOpenStory={setStoryIndex} />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <FinalLetter />
        </Suspense>
        <Footer onRelock={onRelock} />
      </div>

      <MusicToggle />
      <Suspense fallback={null}>
        <MemoryAssistant onOpenStory={setStoryIndex} />
      </Suspense>

      <AnimatePresence>
        {storyIndex !== null && (
          <Suspense fallback={null}>
            <StoryViewer
              stories={stories}
              index={storyIndex}
              onClose={() => setStoryIndex(null)}
              onChangeIndex={setStoryIndex}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  )
}
