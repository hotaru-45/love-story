import { useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { LOVE_LETTER_CONFIG, loveLetterConfig, getMonthlyLetter } from '../data/loveLetterData'

// Một vài tháng không có đủ ngày (vd. ngày 31 vào tháng 2) — clamp về
// ngày cuối cùng của tháng đó thay vì bỏ qua hẳn kỷ niệm tháng ấy.
function getEffectiveAnniversaryDay(year, monthIndex) {
  const configuredDay = LOVE_LETTER_CONFIG.anniversaryDay ?? new Date(loveLetterConfig.anniversaryDate).getDate()
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0).getDate()
  return Math.min(configuredDay, lastDayOfMonth)
}

export function useMonthlyAnniversary() {
  const now = useMemo(() => new Date(), [])
  const year = now.getFullYear()
  const monthIndex = now.getMonth()
  const monthNumber = monthIndex + 1

  const isAnniversaryToday = now.getDate() === getEffectiveAnniversaryDay(year, monthIndex)
  const isActive = LOVE_LETTER_CONFIG.enabled && (LOVE_LETTER_CONFIG.forceShow || isAnniversaryToday)

  const letter = useMemo(() => getMonthlyLetter(monthNumber), [monthNumber])

  const readKey = `love-letter-read-${year}-${String(monthNumber).padStart(2, '0')}`
  const [isRead, setIsRead] = useLocalStorage(readKey, false)

  return { isActive, letter, isRead, markAsRead: () => setIsRead(true) }
}
