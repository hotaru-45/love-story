import { useEffect, useState } from 'react'

export function useTypewriter(text, speed = 70, onComplete) {
  const [shown, setShown] = useState('')

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      i += 1
      setShown(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(id)
        onComplete?.()
      }
    }, speed)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed])

  return shown
}

// Hiện từng dòng trong `lines` lần lượt, dòng sau chỉ bắt đầu khi dòng
// trước gõ xong. Dùng cho intro nhiều câu kiểu cinematic.
export function useTypewriterSequence(lines, speed = 60, pauseMs = 500) {
  const [lineIndex, setLineIndex] = useState(0)
  const [completedLines, setCompletedLines] = useState([])

  const current = useTypewriter(lines[lineIndex] ?? '', speed, () => {
    setTimeout(() => {
      setCompletedLines((prev) => [...prev, lines[lineIndex]])
      setLineIndex((i) => Math.min(i + 1, lines.length))
    }, pauseMs)
  })

  const currentLine = lineIndex < lines.length ? current : ''
  return { completedLines, currentLine, done: lineIndex >= lines.length }
}
