import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  App as AntdApp,
  Tabs,
  Form,
  Input,
  Button,
  Select,
  List,
  Popconfirm,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useLoveStoryData } from '../hooks/loveStoryDataContext'
import ImagePickerField from './ImagePickerField'

const { TextArea } = Input

// Textarea nhiều dòng <-> mảng string (mỗi dòng 1 phần tử) — đủ dùng cho
// tagline/quotes/thư cuối mà không cần dựng UI Form.List phức tạp.
function linesToArray(text) {
  return (text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function GeneralSettingsForm({ onClose }) {
  const { coupleInfo, heroBackground, finalBackground, loveQuotes, finalLetter, footerInfo, musicSrc, trackTitle, secretCode, anniversaryPassword, updateSettings, uploadImage } =
    useLoveStoryData()
  const { message } = AntdApp.useApp()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [heroFile, setHeroFile] = useState(null)
  const [finalFile, setFinalFile] = useState(null)
  const [heroPreview, setHeroPreview] = useState(heroBackground)
  const [finalPreview, setFinalPreview] = useState(finalBackground)

  useEffect(() => {
    form.setFieldsValue({
      person1: coupleInfo.person1,
      person2: coupleInfo.person2,
      startDate: coupleInfo.startDate,
      tagline: (coupleInfo.tagline || []).join('\n'),
      anniversaryPassword,
      secretCode,
      loveQuotes: (loveQuotes || []).join('\n'),
      finalLetterTitle: finalLetter.title,
      finalLetterIntro: (finalLetter.intro || []).join('\n'),
      finalLetterParagraphs: (finalLetter.paragraphs || []).join('\n'),
      finalLetterSignature: finalLetter.signature,
      footerMadeBy: footerInfo.madeBy,
      musicSrc,
      trackTitle,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit() {
    let values
    try {
      values = await form.validateFields()
    } catch {
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        couple_person1: values.person1,
        couple_person2: values.person2,
        start_date: values.startDate,
        tagline: linesToArray(values.tagline),
        anniversary_password: values.anniversaryPassword,
        secret_code: values.secretCode,
        love_quotes: linesToArray(values.loveQuotes),
        final_letter_title: values.finalLetterTitle,
        final_letter_intro: linesToArray(values.finalLetterIntro),
        final_letter_paragraphs: linesToArray(values.finalLetterParagraphs),
        final_letter_signature: values.finalLetterSignature,
        footer_made_by: values.footerMadeBy,
        music_src: values.musicSrc,
        track_title: values.trackTitle,
      }
      if (heroFile) payload.hero_background = await uploadImage(heroFile, 'love-story-settings')
      if (finalFile) payload.final_background = await uploadImage(finalFile, 'love-story-settings')

      await updateSettings(payload)
      message.success('Đã lưu cấu hình')
      onClose()
    } catch (err) {
      message.error(err.message || 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form form={form} layout="vertical" preserve={false}>
      <div className="grid grid-cols-2 gap-4">
        <Form.Item label="Tên người 1" name="person1" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Tên người 2" name="person2" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </div>

      <Form.Item label="Ngày bắt đầu (ISO, vd 2025-12-24T00:00:00)" name="startDate" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="Tagline (mỗi dòng 1 câu)" name="tagline">
        <TextArea rows={2} />
      </Form.Item>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item label="Mật khẩu ngày kỷ niệm (DD/MM/YYYY)" name="anniversaryPassword" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Mã bí mật mở chương khoá" name="secretCode" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item label="Ảnh nền đầu hành trình">
          <ImagePickerField
            previewUrl={heroPreview}
            onPick={(file, preview) => {
              setHeroFile(file)
              setHeroPreview(preview)
            }}
          />
        </Form.Item>
        <Form.Item label="Ảnh nền cuối hành trình">
          <ImagePickerField
            previewUrl={finalPreview}
            onPick={(file, preview) => {
              setFinalFile(file)
              setFinalPreview(preview)
            }}
          />
        </Form.Item>
      </div>

      <Form.Item label="Câu quote yêu thương (mỗi dòng 1 câu)" name="loveQuotes">
        <TextArea rows={3} />
      </Form.Item>

      <Form.Item label="Tiêu đề lá thư cuối" name="finalLetterTitle">
        <Input />
      </Form.Item>
      <Form.Item label="Đoạn mở đầu lá thư (mỗi dòng 1 câu)" name="finalLetterIntro">
        <TextArea rows={2} />
      </Form.Item>
      <Form.Item label="Nội dung lá thư (mỗi dòng 1 đoạn)" name="finalLetterParagraphs">
        <TextArea rows={4} />
      </Form.Item>
      <Form.Item label="Chữ ký" name="finalLetterSignature">
        <Input />
      </Form.Item>

      <div className="grid grid-cols-2 gap-4">
        <Form.Item label="Tên hiển thị ở footer" name="footerMadeBy">
          <Input />
        </Form.Item>
        <Form.Item label="Tên bài hát" name="trackTitle">
          <Input />
        </Form.Item>
      </div>
      <Form.Item label="Đường dẫn nhạc nền" name="musicSrc">
        <Input />
      </Form.Item>

      <Button type="primary" block loading={submitting} onClick={handleSubmit} className="!rounded-full">
        Lưu cấu hình
      </Button>
    </Form>
  )
}

function ChatMessageRow({ msg, stories }) {
  const { updateChatMessage, deleteChatMessage } = useLoveStoryData()
  const { message } = AntdApp.useApp()
  const [editing, setEditing] = useState(false)
  const [form] = Form.useForm()

  async function save() {
    let values
    try {
      values = await form.validateFields()
    } catch {
      return
    }
    try {
      await updateChatMessage(msg.id, { sender: values.sender, text: values.text, time: values.time, story_id: values.storyId || '' })
      setEditing(false)
    } catch (err) {
      message.error(err.message || 'Cập nhật thất bại')
    }
  }

  async function remove() {
    try {
      await deleteChatMessage(msg.id)
    } catch (err) {
      message.error(err.message || 'Xoá thất bại')
    }
  }

  if (editing) {
    return (
      <List.Item>
        <Form
          form={form}
          layout="inline"
          className="w-full flex-wrap gap-2"
          initialValues={{ sender: msg.sender, text: msg.text, time: msg.time, storyId: msg.storyId || undefined }}
        >
          <Form.Item name="sender" rules={[{ required: true }]}>
            <Select
              style={{ width: 90 }}
              options={[
                { value: 'me', label: 'Mình' },
                { value: 'her', label: 'Người ấy' },
              ]}
            />
          </Form.Item>
          <Form.Item name="text" rules={[{ required: true }]} className="!flex-1">
            <Input placeholder="Nội dung tin nhắn" />
          </Form.Item>
          <Form.Item name="time">
            <Input placeholder="23:53" style={{ width: 80 }} />
          </Form.Item>
          <Form.Item name="storyId">
            <Select
              allowClear
              placeholder="Gắn chương"
              style={{ width: 140 }}
              options={stories.map((s) => ({ value: s.id, label: s.title }))}
            />
          </Form.Item>
          <Button size="small" type="primary" onClick={save}>
            Lưu
          </Button>
          <Button size="small" onClick={() => setEditing(false)}>
            Huỷ
          </Button>
        </Form>
      </List.Item>
    )
  }

  return (
    <List.Item
      actions={[
        <button key="edit" type="button" onClick={() => setEditing(true)} className="text-rose-500 hover:text-rose-600">
          <EditOutlined />
        </button>,
        <Popconfirm key="delete" title="Xoá tin nhắn này?" okText="Xoá" cancelText="Huỷ" onConfirm={remove}>
          <button type="button" className="text-rose-500 hover:text-red-600">
            <DeleteOutlined />
          </button>
        </Popconfirm>,
      ]}
    >
      <List.Item.Meta
        title={`${msg.sender === 'me' ? 'Mình' : 'Người ấy'} · ${msg.time}`}
        description={msg.text}
      />
    </List.Item>
  )
}

function ChatMessagesEditor() {
  const { chatMessages, stories, createChatMessage } = useLoveStoryData()
  const { message } = AntdApp.useApp()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  async function handleAdd() {
    let values
    try {
      values = await form.validateFields()
    } catch {
      return
    }
    setSubmitting(true)
    try {
      await createChatMessage({ sender: values.sender, text: values.text, time: values.time, story_id: values.storyId || '' })
      form.resetFields()
      message.success('Đã thêm tin nhắn')
    } catch (err) {
      message.error(err.message || 'Thêm thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Form form={form} layout="inline" className="mb-4 flex-wrap gap-2" initialValues={{ sender: 'me' }}>
        <Form.Item name="sender" rules={[{ required: true }]}>
          <Select
            style={{ width: 90 }}
            options={[
              { value: 'me', label: 'Mình' },
              { value: 'her', label: 'Người ấy' },
            ]}
          />
        </Form.Item>
        <Form.Item name="text" rules={[{ required: true, message: 'Nhập nội dung' }]} className="!flex-1">
          <Input placeholder="Tin nhắn mới..." />
        </Form.Item>
        <Form.Item name="time">
          <Input placeholder="23:53" style={{ width: 80 }} />
        </Form.Item>
        <Form.Item name="storyId">
          <Select
            allowClear
            placeholder="Gắn chương"
            style={{ width: 140 }}
            options={stories.map((s) => ({ value: s.id, label: s.title }))}
          />
        </Form.Item>
        <Button type="primary" loading={submitting} onClick={handleAdd}>
          <PlusOutlined /> Thêm
        </Button>
      </Form>

      <List
        bordered
        dataSource={chatMessages}
        renderItem={(msg) => <ChatMessageRow key={msg.id} msg={msg} stories={stories} />}
      />
    </div>
  )
}

export default function ContentSettingsEditor({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-3 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0 }}
        className="glass-card flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">✏️ Chỉnh sửa nội dung</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/15 px-3 py-1 text-sm text-white hover:bg-white/25"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto rounded-2xl bg-white p-4">
          <Tabs
            items={[
              { key: 'general', label: 'Thông tin chung', children: <GeneralSettingsForm onClose={onClose} /> },
              { key: 'chat', label: 'Tin nhắn chat', children: <ChatMessagesEditor /> },
            ]}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
