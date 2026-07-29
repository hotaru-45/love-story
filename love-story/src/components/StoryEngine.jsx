import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { App as AntdApp, Modal, Dropdown, Button } from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  MoreOutlined,
  LockOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons'
import { moodMeta } from '../data/moodMeta'
import { useUnlockSystem } from '../hooks/unlockContext'
import { useLoveStoryData } from '../hooks/loveStoryDataContext'
import StoryChapterEditor from './StoryChapterEditor'

function StoryChapterCard({ story, index, onOpen, onEdit, onDelete }) {
  const theme = moodMeta[story.mood]
  const { isUnlocked } = useUnlockSystem()
  const [revealed, setRevealed] = useState(false)
  const [rewinding, setRewinding] = useState(false)

  const locked = story.locked && !isUnlocked(story.id)
  const chapterNumber = String(index + 1).padStart(2, '0')

  const menuItems = [
    { key: 'edit', label: 'Sửa chương', icon: <EditOutlined /> },
    { key: 'delete', label: 'Xoá chương', icon: <DeleteOutlined />, danger: true },
  ]

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className="group relative overflow-hidden rounded-3xl glass-card transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-500/10"
    >
      <div className="absolute right-3 top-3 z-20" onClick={(e) => e.stopPropagation()}>
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          menu={{
            items: menuItems,
            onClick: ({ key }) => (key === 'edit' ? onEdit(story) : onDelete(story)),
          }}
        >
          <button
            type="button"
            aria-label="Tuỳ chọn chương"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 text-white opacity-100 backdrop-blur transition-opacity hover:bg-black/50 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
          >
            <MoreOutlined />
          </button>
        </Dropdown>
      </div>

      <div className="flex flex-col lg:flex-row">
        <div
          onPointerDown={() => setRewinding(true)}
          onPointerUp={() => setRewinding(false)}
          onPointerLeave={() => setRewinding(false)}
          className="relative h-56 w-full flex-shrink-0 select-none overflow-hidden sm:h-64 lg:h-auto lg:w-[38%]"
        >
          {story.image ? (
            <img
              src={story.image}
              alt=""
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                rewinding ? 'rewind-filter' : ''
              } ${locked ? 'scale-105 blur-md brightness-[0.45]' : ''}`}
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${theme.gradient} text-6xl ${
                locked ? 'blur-sm brightness-[0.45]' : ''
              }`}
            >
              {theme.emoji}
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0" />

          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold tracking-wide text-rose-600 shadow-sm">
            Chương {chapterNumber}
          </span>

          {rewinding && (
            <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[11px] text-rose-100">
              ⏪ Đang tua lại ký ức...
            </span>
          )}

          {locked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
              <LockOutlined className="animate-lock-pulse text-3xl text-white" />
              <p className="text-xs text-rose-50/90">Chương {index + 1} vẫn còn bị khoá</p>
            </div>
          )}
        </div>

        {locked ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center sm:p-7">
            <p className="text-sm text-rose-200/70">
              Chương bí mật — khám phá thêm để tìm cách mở khoá.
            </p>
          </div>
        ) : (
          <div
            onClick={() => setRevealed((r) => !r)}
            className="flex flex-1 cursor-pointer flex-col gap-3 p-6 sm:p-7"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-rose-100">
                {theme.emoji} {theme.label}
              </span>
              <span className="text-xs text-rose-200/60">{story.date}</span>
            </div>

            <h3 className="text-xl font-semibold text-white sm:text-2xl">{story.title}</h3>
            <p className="line-clamp-3 text-sm leading-relaxed text-rose-100/70">{story.content}</p>

            <AnimatePresence>
              {revealed && story.hiddenThought && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="rounded-2xl bg-white/10 px-4 py-3 text-sm italic text-rose-100"
                >
                  💭 {story.hiddenThought}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="mt-auto flex items-center justify-between gap-3 pt-2">
              <span className="text-xs text-rose-200/50">
                {story.hiddenThought ? '💭 Bấm vào thẻ để xem suy nghĩ ẩn' : ''}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpen(index)
                }}
                className="flex-shrink-0 text-sm font-medium text-rose-300 transition-colors hover:text-rose-200"
              >
                Đọc toàn bộ →
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.article>
  )
}

function DeleteChapterModal({ story, onCancel, onConfirm }) {
  const [deleting, setDeleting] = useState(false)

  async function handleConfirm() {
    setDeleting(true)
    try {
      await onConfirm(story.id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal
      open={Boolean(story)}
      onCancel={deleting ? undefined : onCancel}
      closable={!deleting}
      mask={{ closable: !deleting }}
      footer={null}
      width={400}
      centered
      destroyOnHidden
    >
      <div className="flex flex-col items-center gap-3 py-1 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
          <ExclamationCircleFilled className="text-2xl" />
        </span>
        <h3 className="text-lg font-semibold text-gray-900">Xoá chương này?</h3>
        <p className="text-sm text-gray-500">
          Chương <span className="font-medium text-gray-700">&ldquo;{story?.title}&rdquo;</span> sẽ bị xoá vĩnh
          viễn. Hành động này không thể hoàn tác.
        </p>
        <div className="mt-3 flex w-full gap-3">
          <Button block size="large" onClick={onCancel} disabled={deleting}>
            Giữ lại
          </Button>
          <Button block size="large" danger type="primary" loading={deleting} onClick={handleConfirm}>
            Xoá chương
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default function StoryEngine({ onOpen }) {
  const { stories, deleteStory } = useLoveStoryData()
  const { message } = AntdApp.useApp()
  const [editing, setEditing] = useState(null) // story | null khi sửa, undefined khi đóng
  const [adding, setAdding] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  async function handleDelete(id) {
    try {
      await deleteStory(id)
      message.success('Đã xoá chương')
      setDeleteTarget(null)
    } catch (err) {
      message.error(err.message || 'Xoá thất bại')
    }
  }

  return (
    <section id="story-engine" className="relative px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">📖 Thế Giới Câu Chuyện</h2>
          <p className="mt-2 text-sm text-rose-200/70">
            Mỗi thẻ là một mảnh ký ức — bấm vào để xem suy nghĩ ẩn, giữ ảnh để &quot;tua lại&quot; khoảnh khắc.
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-400 to-fuchsia-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/25"
          >
            <PlusOutlined /> Thêm chương mới
          </motion.button>
        </div>

        <div className="mt-10 flex flex-col gap-6">
          {stories.map((story, idx) => (
            <StoryChapterCard
              key={story.id}
              story={story}
              index={idx}
              onOpen={onOpen}
              onEdit={setEditing}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      </div>

      <StoryChapterEditor open={adding} story={null} onClose={() => setAdding(false)} />
      <StoryChapterEditor open={Boolean(editing)} story={editing} onClose={() => setEditing(null)} />
      <DeleteChapterModal story={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </section>
  )
}
