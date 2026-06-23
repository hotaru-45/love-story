import FloatingHearts from './components/FloatingHearts'
import Hero from './components/Hero'
import Timeline from './components/Timeline'
import Gallery from './components/Gallery'
import Letter from './components/Letter'
import MusicToggle from './components/MusicToggle'
import Footer from './components/Footer'

function App() {
  return (
    <div className="relative min-h-svh overflow-x-hidden bg-gradient-to-b from-rose-50 via-pink-50 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-rose-950">
      <FloatingHearts />
      <div className="relative z-10">
        <Hero />
        <Timeline />
        <Gallery />
        <Letter />
        <Footer />
      </div>
      <MusicToggle />
    </div>
  )
}

export default App
