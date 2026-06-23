import { motion } from 'framer-motion'
import { loveLetter } from '../data/loveData'

export default function Letter() {
  return (
    <section className="px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-xl rounded-3xl bg-white/80 p-8 shadow-sm backdrop-blur-sm dark:bg-white/10 sm:p-10"
      >
        <h2 className="text-center text-2xl font-semibold text-rose-700 dark:text-rose-200 sm:text-3xl">
          {loveLetter.title}
        </h2>

        <div className="mt-6 space-y-4 font-serif text-[15px] leading-relaxed text-rose-600/90 italic dark:text-rose-200/90 sm:text-base">
          {loveLetter.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <p className="mt-6 text-right text-sm font-medium text-rose-500 dark:text-rose-300">
          {loveLetter.signature}
        </p>
      </motion.div>
    </section>
  )
}
