import { motion } from 'framer-motion'
import { timelineEvents } from '../data/loveData'

function TimelineCard({ event, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className="relative pl-12"
    >
      <div className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 text-sm font-medium text-white shadow-md">
        {index + 1}
      </div>

      <div className="rounded-2xl bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:bg-white/10">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="mb-3 h-40 w-full rounded-xl object-cover"
          />
        ) : (
          <div className="mb-3 flex h-40 w-full items-center justify-center rounded-xl bg-gradient-to-br from-rose-200 to-pink-300 text-5xl dark:from-rose-800 dark:to-pink-900">
            {event.emoji}
          </div>
        )}
        <p className="text-xs font-medium uppercase tracking-wide text-rose-400">
          {event.date}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-rose-700 dark:text-rose-200">
          {event.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-rose-500/90 dark:text-rose-300/90">
          {event.description}
        </p>
      </div>
    </motion.div>
  )
}

export default function Timeline() {
  return (
    <section className="relative px-6 py-20">
      <h2 className="text-center text-2xl font-semibold text-rose-700 dark:text-rose-200 sm:text-3xl">
        Câu chuyện của chúng mình
      </h2>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-rose-400 dark:text-rose-300">
        Những mốc thời gian đáng nhớ trên hành trình yêu nhau
      </p>

      <div className="relative mx-auto mt-12 max-w-2xl">
        <div className="absolute left-[17px] top-2 h-[calc(100%-2rem)] w-0.5 bg-rose-200 dark:bg-rose-700" />

        <div className="flex flex-col gap-10">
          {timelineEvents.map((event, idx) => (
            <TimelineCard key={event.id} event={event} index={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}
