import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { App as AntdApp, Popconfirm } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { moodMeta } from '../data/moodMeta'
import { useUnlockSystem } from '../hooks/unlockContext'
import { useLoveStoryData } from '../hooks/loveStoryDataContext'
import StoryChapterEditor from './StoryChapterEditor'

function Chapter({ story, index, onOpen, onEdit, onDelete }) {
  const theme = moodMeta[story.mood]
  const { isUnlocked } = useUnlockSystem()
  const [revealed, setRevealed] = useState(false)
  const [rewinding, setRewinding] = useState(false)

  const locked = story.locked && !isUnlocked(story.id)

  return (
    <div
      onClick={() => !locked && setRevealed((r) => !r)}
      className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden px-6 py-24 text-center"
    >
      <div className="absolute right-4 top-4 z-10 flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onEdit(story)}
          aria-label="Sửa chương"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
        >
          <EditOutlined />
        </button>
        <Popconfirm
          title="Xoá chương này?"
          description="Không thể hoàn tác."
          okText="Xoá"
          cancelText="Huỷ"
          onConfirm={() => onDelete(story.id)}
        >
          <button
            type="button"
            aria-label="Xoá chương"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-red-600/80"
          >
            <DeleteOutlined />
          </button>
        </Popconfirm>
      </div>

      <div
        onPointerDown={() => setRewinding(true)}
        onPointerUp={() => setRewinding(false)}
        onPointerLeave={() => setRewinding(false)}
        className={`absolute inset-0 -z-10 overflow-hidden bg-gradient-to-br ${theme.gradient} ${
          rewinding ? 'rewind-filter' : ''
        }`}
      >
        {story.image ? (
          <img
            src={story.image}
            alt=""
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            className="animate-ken-burns absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="animate-ken-burns absolute inset-0 flex items-center justify-center text-[14rem] opacity-30">
            {theme.emoji}
          </div>
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {rewinding && (
        <span className="absolute top-8 rounded-full bg-black/50 px-4 py-1.5 text-xs text-rose-100">
          ⏪ Đang tua lại ký ức...
        </span>
      )}

      {locked ? (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          className="relative flex flex-col items-center gap-3"
        >
          <span className="text-5xl">🔒</span>
          <p className="max-w-xs text-sm text-rose-200/80">
            Chương {index + 1} vẫn còn bị khoá — hãy khám phá thêm để mở nó ra.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="relative flex max-w-xl flex-col items-center gap-4"
        >
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-rose-100">
            {theme.emoji} {theme.label} · Chương {index + 1}
          </span>
          <h2 className="text-4xl font-light tracking-wide text-white sm:text-6xl">
            {story.title}
          </h2>
          <p className="text-sm text-rose-200/80">{story.date}</p>
          <p className="text-base leading-relaxed text-rose-50/90">{story.content}</p>

          <AnimatePresence>
            {revealed && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="italic text-rose-200/90"
              >
                💭 {story.hiddenThought}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpen(index)
            }}
            className="mt-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/25"
          >
            Mở rộng câu chuyện →
          </button>

          <p className="text-xs text-rose-200/50">Bấm vào bất kỳ đâu để xem thêm một dòng suy nghĩ ẩn</p>
        </motion.div>
      )}
    </div>
  )
}

export default function StoryEngine({ onOpen }) {
  const { stories, deleteStory } = useLoveStoryData()
  const { message } = AntdApp.useApp()
  const [editing, setEditing] = useState(null) // story | null khi sửa, undefined khi đóng
  const [adding, setAdding] = useState(false)

  async function handleDelete(id) {
    try {
      await deleteStory(id)
      message.success('Đã xoá chương')
    } catch (err) {
      message.error(err.message || 'Xoá thất bại')
    }
  }

  return (
    <section id="story-engine" className="relative">
      <div className="px-6 pt-16 text-center">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">📖 Thế Giới Câu Chuyện</h2>
        <p className="mt-2 text-sm text-rose-200/80">
          Cuộn xuống để bước qua từng chương. Bấm để xem suy nghĩ ẩn, nhấn giữ ảnh nền để
          &quot;tua lại&quot; ký ức.
        </p>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25"
        >
          <PlusOutlined /> Thêm chương mới
        </button>
      </div>

      {stories.map((story, idx) => (
        <Chapter
          key={story.id}
          story={story}
          index={idx}
          onOpen={onOpen}
          onEdit={setEditing}
          onDelete={handleDelete}
        />
      ))}

      <StoryChapterEditor open={adding} story={null} onClose={() => setAdding(false)} />
      <StoryChapterEditor open={Boolean(editing)} story={editing} onClose={() => setEditing(null)} />
    </section>
  )
}
