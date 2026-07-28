import { useCallback, useEffect, useMemo, useState } from 'react'
import { LoveStoryDataContext } from '../hooks/loveStoryDataContext'
import {
  fetchLoveStoryPage,
  fileUrl,
  uploadImage as uploadImageRequest,
  createStoryChapter,
  updateStoryChapter,
  deleteStoryChapter,
  createGalleryPhoto as createGalleryPhotoRequest,
  updateGalleryPhoto as updateGalleryPhotoRequest,
  deleteGalleryPhoto as deleteGalleryPhotoRequest,
  createChatMessage as createChatMessageRequest,
  updateChatMessage as updateChatMessageRequest,
  deleteChatMessage as deleteChatMessageRequest,
  updateLoveStorySettings,
} from '../utils/loveStoryApi'

function mapStory(s) {
  return {
    id: s._id,
    date: s.date,
    title: s.title,
    content: s.content,
    hiddenThought: s.hidden_thought,
    mood: s.mood,
    image: fileUrl(s.FILE_IMAGE),
    hasVoiceNote: s.has_voice_note,
    locked: s.locked,
    sortOrder: s.sort_order,
  }
}

function mapGalleryPhoto(p) {
  return { id: p._id, src: fileUrl(p.FILE_SRC), caption: p.caption, sortOrder: p.sort_order }
}

function mapChatMessage(m) {
  return { id: m._id, sender: m.sender, text: m.text, time: m.time, storyId: m.story_id || null, sortOrder: m.sort_order }
}

function mapSettings(s) {
  return {
    coupleInfo: {
      person1: s?.couple_person1 || '',
      person2: s?.couple_person2 || '',
      startDate: s?.start_date || '',
      tagline: s?.tagline || [],
    },
    heroBackground: fileUrl(s?.FILE_HERO_BACKGROUND),
    finalBackground: fileUrl(s?.FILE_FINAL_BACKGROUND),
    loveQuotes: s?.love_quotes || [],
    finalLetter: {
      intro: s?.final_letter_intro || [],
      title: s?.final_letter_title || '',
      paragraphs: s?.final_letter_paragraphs || [],
      signature: s?.final_letter_signature || '',
    },
    footerInfo: { madeBy: s?.footer_made_by || '' },
    musicSrc: s?.music_src || '',
    trackTitle: s?.track_title || '',
    secretCode: (s?.secret_code || '').trim().toLowerCase(),
    anniversaryPassword: s?.anniversary_password || '',
  }
}

export default function LoveStoryDataProvider({ children }) {
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchLoveStoryPage()
      setPage(data)
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const stories = useMemo(() => (page?.stories || []).map(mapStory), [page])
  const galleryPhotos = useMemo(() => (page?.gallery || []).map(mapGalleryPhoto), [page])
  const chatMessages = useMemo(() => (page?.chat || []).map(mapChatMessage), [page])
  const settings = useMemo(() => mapSettings(page?.settings), [page])
  const lockedChapterId = useMemo(() => stories.find((s) => s.locked)?.id ?? null, [stories])

  const value = useMemo(
    () => ({
      loading,
      error,
      refetch: load,

      stories,
      galleryPhotos,
      chatMessages,
      lockedChapterId,
      ...settings,

      uploadImage: uploadImageRequest,

      createStory: async (input) => {
        await createStoryChapter(input)
        await load()
      },
      updateStory: async (id, input) => {
        await updateStoryChapter({ _id: id, ...input })
        await load()
      },
      deleteStory: async (id) => {
        await deleteStoryChapter(id)
        await load()
      },

      createGalleryPhoto: async (input) => {
        await createGalleryPhotoRequest(input)
        await load()
      },
      updateGalleryPhoto: async (id, input) => {
        await updateGalleryPhotoRequest({ _id: id, ...input })
        await load()
      },
      deleteGalleryPhoto: async (id) => {
        await deleteGalleryPhotoRequest(id)
        await load()
      },

      createChatMessage: async (input) => {
        await createChatMessageRequest(input)
        await load()
      },
      updateChatMessage: async (id, input) => {
        await updateChatMessageRequest({ _id: id, ...input })
        await load()
      },
      deleteChatMessage: async (id) => {
        await deleteChatMessageRequest(id)
        await load()
      },

      updateSettings: async (input) => {
        await updateLoveStorySettings(input)
        await load()
      },
    }),
    [loading, error, load, stories, galleryPhotos, chatMessages, lockedChapterId, settings],
  )

  if (loading && !page) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-b from-[#1a0b1f] via-[#2b1030] to-[#1a0b1f] text-rose-100">
        <div className="flex flex-col items-center gap-3">
          <span className="text-3xl animate-pulse">❤️</span>
          <p className="text-sm text-rose-200/80">Đang tải kỷ niệm của hai người...</p>
        </div>
      </div>
    )
  }

  if (error && !page) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-b from-[#1a0b1f] via-[#2b1030] to-[#1a0b1f] px-6 text-center text-rose-100">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-rose-200/80">Không thể tải dữ liệu: {error}</p>
          <button
            type="button"
            onClick={load}
            className="rounded-full bg-rose-500 px-5 py-2 text-sm font-medium text-white hover:bg-rose-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return <LoveStoryDataContext.Provider value={value}>{children}</LoveStoryDataContext.Provider>
}
