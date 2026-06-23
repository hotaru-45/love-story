import { useEffect, useRef, useState } from 'react'
import { musicSrc } from '../data/loveData'

export default function MusicToggle() {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.play().catch(() => setPlaying(false))
    } else {
      audio.pause()
    }
  }, [playing])

  return (
    <>
      <audio ref={audioRef} src={musicSrc} loop />
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-xl text-white shadow-lg transition-transform hover:scale-105"
      >
        {playing ? '🔊' : '🔈'}
      </button>
    </>
  )
}
