// Theme (emoji/label/gradient) theo mood — thuần hiển thị, không phải nội
// dung của cặp đôi nên vẫn giữ tĩnh ở FE thay vì đưa xuống BE.
export const moodMeta = {
  happy: {
    label: 'Vui',
    emoji: '😄',
    gradient: 'from-amber-300 via-orange-300 to-pink-400',
  },
  sad: {
    label: 'Lắng đọng',
    emoji: '🥺',
    gradient: 'from-slate-400 via-indigo-400 to-slate-600',
  },
  funny: {
    label: 'Hài hước',
    emoji: '😂',
    gradient: 'from-yellow-300 via-lime-300 to-emerald-400',
  },
  deep: {
    label: 'Sâu lắng',
    emoji: '🌙',
    gradient: 'from-indigo-400 via-purple-500 to-rose-500',
  },
  love: {
    label: 'Yêu thương',
    emoji: '💖',
    gradient: 'from-rose-400 via-pink-500 to-red-500',
  },
}
