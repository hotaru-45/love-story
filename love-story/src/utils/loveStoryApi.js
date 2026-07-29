// Client GraphQL cho toàn bộ nội dung "Love Story" (chương kỷ niệm, ảnh, chat,
// cấu hình chung...) — thay thế dữ liệu tĩnh cũ ở `data/storyData.js`.
import { API_BASE_URL, COMPANY_CODE } from './api'
import { getToken, getTenant, notifyAuthExpired } from './auth'

const FILE_FRAGMENT = `_id FILE`

// Xem `backend/graphql/auth/index.js` — middleware `authentication()`/
// `check_tenant()` ném đúng các message này khi token thiếu/sai/hết hạn
// (>12h) hoặc tenant trong token không còn tồn tại (DB bị reset/đổi).
const AUTH_ERROR_MESSAGES = [
  'You are not authenticated!',
  'You are not authentication_master!',
  'tenant not exist',
]

async function graphqlRequest(query, variables) {
  const response = await fetch(`${API_BASE_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token: getToken() || '',
      tenant: getTenant() || '',
    },
    body: JSON.stringify({ query, variables }),
  })
  const json = await response.json().catch(() => null)
  if (json?.errors?.length) {
    const message = json.errors[0]?.message || 'Đã có lỗi xảy ra'
    if (AUTH_ERROR_MESSAGES.includes(message)) {
      notifyAuthExpired()
      throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.')
    }
    throw new Error(message)
  }
  return json?.data
}

// Ảnh phục vụ qua /load-file, xác thực bằng query string vì <img src> không
// gửi được header tuỳ biến. Xem `backend/router/utils/verifyToken.js`.
export function fileUrl(file) {
  if (!file?.FILE) return null
  const params = new URLSearchParams({ token: getToken() || '', tenant: getTenant() || '' })
  return `${API_BASE_URL}/load-file/${file.FILE}?${params.toString()}`
}

export async function uploadImage(file, documentCode) {
  const formData = new FormData()
  formData.append('document_code', documentCode)
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: { token: getToken() || '', tenant: getTenant() || '' },
    body: formData,
  })
  const json = await response.json().catch(() => null)
  if (json?.error === 'Unauthorized') {
    notifyAuthExpired()
    throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.')
  }
  if (json?.error) throw new Error(json.error)
  const uploaded = json?.files?.[0]
  if (!uploaded?._id) throw new Error('Tải ảnh lên thất bại')
  return uploaded._id
}

const LOVE_STORY_PAGE_QUERY = `
  query LoveStoryPage {
    LoveStory_page {
      settings {
        _id couple_person1 couple_person2 start_date tagline
        anniversary_password secret_code
        love_quotes final_letter_intro final_letter_title final_letter_paragraphs final_letter_signature
        footer_made_by music_src track_title
        FILE_HERO_BACKGROUND { ${FILE_FRAGMENT} }
        FILE_FINAL_BACKGROUND { ${FILE_FRAGMENT} }
      }
      stories {
        _id date title content hidden_thought mood has_voice_note locked sort_order
        FILE_IMAGE { ${FILE_FRAGMENT} }
      }
      gallery {
        _id caption sort_order
        FILE_SRC { ${FILE_FRAGMENT} }
      }
      chat {
        _id sender text time story_id sort_order
      }
    }
  }
`

export async function fetchLoveStoryPage() {
  const data = await graphqlRequest(LOVE_STORY_PAGE_QUERY)
  return data.LoveStory_page
}

const PUBLIC_SETTINGS_QUERY = `
  query LoveStoryPublicSettings($code_company: String!) {
    LoveStory_public_settings(code_company: $code_company) {
      couple_person1 couple_person2 start_date tagline anniversary_password
      FILE_HERO_BACKGROUND { ${FILE_FRAGMENT} }
    }
  }
`

// Dùng cho trang Login (chưa đăng nhập, chưa có token) — trả anniversary_password
// vì cổng vào vẫn check ngày kỷ niệm ở client (như bản tĩnh cũ), nhưng KHÔNG bao
// giờ trả secret_code (mã mở chương khoá) vốn chỉ cần sau khi đã đăng nhập.
export async function fetchPublicSettings() {
  const data = await graphqlRequest(PUBLIC_SETTINGS_QUERY, { code_company: COMPANY_CODE })
  return data.LoveStory_public_settings
}

const STORY_CHAPTER_FIELDS = `
  _id date title content hidden_thought mood has_voice_note locked sort_order
  FILE_IMAGE { ${FILE_FRAGMENT} }
`

export async function createStoryChapter(input) {
  const data = await graphqlRequest(
    `mutation Create($date: String, $title: String, $content: String, $hidden_thought: String, $mood: String, $image: String, $has_voice_note: Boolean, $locked: Boolean, $sort_order: Int) {
      StoryChapter_create(date: $date, title: $title, content: $content, hidden_thought: $hidden_thought, mood: $mood, image: $image, has_voice_note: $has_voice_note, locked: $locked, sort_order: $sort_order) { ${STORY_CHAPTER_FIELDS} }
    }`,
    input,
  )
  return data.StoryChapter_create
}

export async function updateStoryChapter(input) {
  const data = await graphqlRequest(
    `mutation Update($_id: ID!, $date: String, $title: String, $content: String, $hidden_thought: String, $mood: String, $image: String, $has_voice_note: Boolean, $locked: Boolean, $sort_order: Int) {
      StoryChapter_update(_id: $_id, date: $date, title: $title, content: $content, hidden_thought: $hidden_thought, mood: $mood, image: $image, has_voice_note: $has_voice_note, locked: $locked, sort_order: $sort_order) { ${STORY_CHAPTER_FIELDS} }
    }`,
    input,
  )
  return data.StoryChapter_update
}

export async function deleteStoryChapter(_id) {
  const data = await graphqlRequest(`mutation Delete($_id: ID!) { StoryChapter_delete(_id: $_id) }`, { _id })
  return data.StoryChapter_delete
}

const GALLERY_PHOTO_FIELDS = `_id caption sort_order FILE_SRC { ${FILE_FRAGMENT} }`

export async function createGalleryPhoto(input) {
  const data = await graphqlRequest(
    `mutation Create($src: String, $caption: String, $sort_order: Int) {
      GalleryPhoto_create(src: $src, caption: $caption, sort_order: $sort_order) { ${GALLERY_PHOTO_FIELDS} }
    }`,
    input,
  )
  return data.GalleryPhoto_create
}

export async function updateGalleryPhoto(input) {
  const data = await graphqlRequest(
    `mutation Update($_id: ID!, $src: String, $caption: String, $sort_order: Int) {
      GalleryPhoto_update(_id: $_id, src: $src, caption: $caption, sort_order: $sort_order) { ${GALLERY_PHOTO_FIELDS} }
    }`,
    input,
  )
  return data.GalleryPhoto_update
}

export async function deleteGalleryPhoto(_id) {
  const data = await graphqlRequest(`mutation Delete($_id: ID!) { GalleryPhoto_delete(_id: $_id) }`, { _id })
  return data.GalleryPhoto_delete
}

const CHAT_MESSAGE_FIELDS = `_id sender text time story_id sort_order`

export async function createChatMessage(input) {
  const data = await graphqlRequest(
    `mutation Create($sender: String, $text: String, $time: String, $story_id: String, $sort_order: Int) {
      ChatMessage_create(sender: $sender, text: $text, time: $time, story_id: $story_id, sort_order: $sort_order) { ${CHAT_MESSAGE_FIELDS} }
    }`,
    input,
  )
  return data.ChatMessage_create
}

export async function updateChatMessage(input) {
  const data = await graphqlRequest(
    `mutation Update($_id: ID!, $sender: String, $text: String, $time: String, $story_id: String, $sort_order: Int) {
      ChatMessage_update(_id: $_id, sender: $sender, text: $text, time: $time, story_id: $story_id, sort_order: $sort_order) { ${CHAT_MESSAGE_FIELDS} }
    }`,
    input,
  )
  return data.ChatMessage_update
}

export async function deleteChatMessage(_id) {
  const data = await graphqlRequest(`mutation Delete($_id: ID!) { ChatMessage_delete(_id: $_id) }`, { _id })
  return data.ChatMessage_delete
}

const SETTINGS_FIELDS = `
  _id couple_person1 couple_person2 start_date tagline
  anniversary_password secret_code
  love_quotes final_letter_intro final_letter_title final_letter_paragraphs final_letter_signature
  footer_made_by music_src track_title
  FILE_HERO_BACKGROUND { ${FILE_FRAGMENT} }
  FILE_FINAL_BACKGROUND { ${FILE_FRAGMENT} }
`

export async function updateLoveStorySettings(input) {
  const data = await graphqlRequest(
    `mutation Update($couple_person1: String, $couple_person2: String, $start_date: String, $tagline: [String], $anniversary_password: String, $secret_code: String, $hero_background: String, $final_background: String, $love_quotes: [String], $final_letter_intro: [String], $final_letter_title: String, $final_letter_paragraphs: [String], $final_letter_signature: String, $footer_made_by: String, $music_src: String, $track_title: String) {
      LoveStorySettings_update(couple_person1: $couple_person1, couple_person2: $couple_person2, start_date: $start_date, tagline: $tagline, anniversary_password: $anniversary_password, secret_code: $secret_code, hero_background: $hero_background, final_background: $final_background, love_quotes: $love_quotes, final_letter_intro: $final_letter_intro, final_letter_title: $final_letter_title, final_letter_paragraphs: $final_letter_paragraphs, final_letter_signature: $final_letter_signature, footer_made_by: $footer_made_by, music_src: $music_src, track_title: $track_title) { ${SETTINGS_FIELDS} }
    }`,
    input,
  )
  return data.LoveStorySettings_update
}
