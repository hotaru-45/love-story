import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useMonthlyAnniversary } from '../hooks/useMonthlyAnniversary'
import LoveLetterButton from './LoveLetterButton'
import LoveLetterModal from './LoveLetterModal'

export default function MonthlyLoveLetter() {
  const { isActive, letter, isRead, markAsRead } = useMonthlyAnniversary()
  const [open, setOpen] = useState(false)

  if (!isActive) return null

  return (
    <>
      <LoveLetterButton isRead={isRead} onClick={() => setOpen(true)} />
      <AnimatePresence>
        {open && (
          <LoveLetterModal letter={letter} onClose={() => setOpen(false)} onRead={markAsRead} />
        )}
      </AnimatePresence>
    </>
  )
}
