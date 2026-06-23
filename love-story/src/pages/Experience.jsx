import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { stories } from '../data/storyData'
import FloatingHearts from '../components/FloatingHearts'
import HomeIntro from '../components/HomeIntro'
import StoryEngine from '../components/StoryEngine'
import TimelineMap from '../components/TimelineMap'
import UnlockSystem from '../components/UnlockSystem'
import MemoryGallery from '../components/MemoryGallery'
import ScrollDepthUnlocker from '../components/ScrollDepthUnlocker'
import ChatReplay from '../components/ChatReplay'
import FinalLetter from '../components/FinalLetter'
import StoryViewer from '../components/StoryViewer'
import MusicToggle from '../components/MusicToggle'
import MemoryAssistant from '../components/MemoryAssistant'
import Footer from '../components/Footer'

export default function Experience() {
  const [storyIndex, setStoryIndex] = useState(null)

  return (
    <div className="relative min-h-svh overflow-x-hidden bg-gradient-to-b from-[#1a0b1f] via-[#2b1030] to-[#1a0b1f]">
      <FloatingHearts />

      <div className="relative z-10">
        <HomeIntro />
        <StoryEngine onOpen={setStoryIndex} />
        <TimelineMap onOpen={setStoryIndex} />
        <div className="px-6">
          <UnlockSystem />
        </div>
        <MemoryGallery />
        <ScrollDepthUnlocker />
        <ChatReplay onOpenStory={setStoryIndex} />
        <FinalLetter />
        <Footer />
      </div>

      <MusicToggle />
      <MemoryAssistant onOpenStory={setStoryIndex} />

      <AnimatePresence>
        {storyIndex !== null && (
          <StoryViewer
            stories={stories}
            index={storyIndex}
            onClose={() => setStoryIndex(null)}
            onChangeIndex={setStoryIndex}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
