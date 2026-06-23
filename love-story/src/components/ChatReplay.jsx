import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { chatMessages, stories } from '../data/storyData'

const TYPING_MS = 650
const GAP_MS = 250

function TypingIndicator() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl bg-white/15 px-4 py-2.5">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="h-1.5 w-1.5 rounded-full bg-rose-200"
          style={{ animation: `typing-dot 0.9s ease-in-out ${dot * 0.15}s infinite` }}
        />
      ))}
    </div>
  )
}

export default function ChatReplay({ onOpenStory }) {
  const [expandedId, setExpandedId] = useState(null)
  const [visibleCount, setVisibleCount] = useState(0)
  const [typing, setTyping] = useState(false)
  const containerRef = useRef(null)
  const startedRef = useRef(false)
  const inView = useInView(containerRef, { once: true, margin: '-80px' })

  useEffect(() => {
    if (!inView || startedRef.current) return
    startedRef.current = true
    let cancelled = false

    function step(i) {
      if (cancelled || i >= chatMessages.length) return
      setTyping(true)
      setTimeout(() => {
        if (cancelled) return
        setTyping(false)
        setVisibleCount(i + 1)
        setTimeout(() => step(i + 1), GAP_MS)
      }, TYPING_MS)
    }
    step(0)

    return () => {
      cancelled = true
    }
  }, [inView])

  return (
    <section id="chat-memory" className="px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-3xl text-center"
      >
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">💬 Chat Replay</h2>
        <p className="mt-2 text-sm text-rose-200/80">
          Những đoạn chat đáng nhớ — bấm vào để xem ngữ cảnh câu chuyện
        </p>
      </motion.div>

      <div
        ref={containerRef}
        className="glass-card mx-auto mt-10 flex max-w-md flex-col gap-3 rounded-3xl p-4 sm:p-6"
      >
        {chatMessages.slice(0, visibleCount).map((msg) => {
          const isMe = msg.sender === 'me'
          const story = stories.find((s) => s.id === msg.storyId)
          const expanded = expandedId === msg.id

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <button
                type="button"
                onClick={() => story && setExpandedId(expanded ? null : msg.id)}
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-left text-sm ${
                  isMe ? 'bg-rose-500 text-white' : 'bg-white/15 text-rose-50'
                }`}
              >
                {msg.text}
              </button>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-1 px-1 text-[10px] text-rose-200/60"
              >
                {msg.time}
              </motion.span>

              <AnimatePresence>
                {expanded && story && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 w-full max-w-[85%] overflow-hidden rounded-xl bg-black/30 p-3 text-xs text-rose-100"
                  >
                    <p className="font-medium text-rose-200">📖 {story.title}</p>
                    <p className="mt-1 line-clamp-2 text-rose-100/80">{story.content}</p>
                    <button
                      type="button"
                      onClick={() => onOpenStory(stories.findIndex((s) => s.id === story.id))}
                      className="mt-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium hover:bg-white/25"
                    >
                      Xem câu chuyện đầy đủ →
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}

        {typing && <TypingIndicator />}
      </div>
    </section>
  )
}
