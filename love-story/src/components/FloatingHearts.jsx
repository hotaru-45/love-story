import { useMemo } from 'react'
import { usePreferences } from '../hooks/preferencesContext'

function randomHeart(seed) {
  return {
    left: Math.random() * 100,
    size: 12 + Math.random() * 20,
    duration: 10 + Math.random() * 12,
    delay: -Math.random() * 20,
    opacity: 0.25 + Math.random() * 0.4,
    key: seed,
  }
}

export default function FloatingHearts() {
  const { reducedMotion, performanceMode } = usePreferences()
  const count = reducedMotion ? 4 : performanceMode ? 7 : 14

  const hearts = useMemo(
    () => Array.from({ length: count }, (_, i) => randomHeart(i)),
    [count],
  )

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {hearts.map((h) => (
        <span
          key={h.key}
          className="absolute bottom-0 select-none text-rose-400 will-change-transform animate-float-up"
          style={{
            left: `${h.left}%`,
            fontSize: `${h.size}px`,
            opacity: h.opacity,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
          }}
        >
          ❤
        </span>
      ))}
    </div>
  )
}
