import { useEffect, useState } from 'react'
import { App as AntdApp, Modal, Form, Input, Select, Switch } from 'antd'
import { moodMeta } from '../data/moodMeta'
import { useLoveStoryData } from '../hooks/loveStoryDataContext'
import ImagePickerField from './ImagePickerField'

const { TextArea } = Input

const MOOD_OPTIONS = Object.entries(moodMeta).map(([value, meta]) => ({
  value,
  label: `${meta.emoji} ${meta.label}`,
}))

function initialValuesFor(story) {
  return {
    date: story?.date || '',
    title: story?.title || '',
    content: story?.content || '',
    hiddenThought: story?.hiddenThought || '',
    mood: story?.mood || 'happy',
    locked: story?.locked || false,
    hasVoiceNote: story?.hasVoiceNote || false,
  }
}

// Modal thêm/sửa 1 chương kỷ niệm (StoryEngine) — ảnh chọn xong chỉ upload
// thật sự lúc bấm Lưu, tránh rác file nếu người dùng huỷ giữa chừng.
export default function StoryChapterEditor({ open, story, onClose }) {
  const { stories, createStory, updateStory, uploadImage } = useLoveStoryData()
  const { message } = AntdApp.useApp()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  // Hệ thống unlock (logo x5, heart ẩn, cuộn trang, mã bí mật) chỉ nhắm vào
  // đúng 1 chương khoá cho cả site — khoá thêm chương khác sẽ kẹt vĩnh viễn,
  // không cách nào mở được, nên chỉ cho phép khoá tối đa 1 chương tại 1 thời điểm.
  const otherLockedChapter = stories.find((s) => s.locked && s.id !== story?.id)

  // Reset ảnh đã chọn mỗi lần mở lại — giá trị text thì Form tự nhận qua
  // `initialValues` + `key` bên dưới (remount Form mỗi khi đổi chương/mở
  // form thêm mới), tránh phải set giá trị thủ công bằng effect.
  useEffect(() => {
    if (!open) return
    setImageFile(null)
    setPreviewUrl(story?.image || null)
  }, [open, story])

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
        date: values.date,
        title: values.title,
        content: values.content,
        hidden_thought: values.hiddenThought,
        mood: values.mood,
        locked: values.locked,
        has_voice_note: values.hasVoiceNote,
      }
      if (imageFile) {
        payload.image = await uploadImage(imageFile, 'story-chapters')
      }

      if (story) {
        await updateStory(story.id, payload)
        message.success('Đã cập nhật chương')
      } else {
        await createStory(payload)
        message.success('Đã thêm chương mới')
      }
      onClose()
    } catch (err) {
      message.error(err.message || 'Có lỗi xảy ra, thử lại nha')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      title={story ? 'Sửa chương kỷ niệm' : 'Thêm chương mới'}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText={story ? 'Lưu' : 'Thêm'}
      cancelText="Huỷ"
      destroyOnHidden
    >
      <Form key={story?.id ?? 'new'} form={form} layout="vertical" initialValues={initialValuesFor(story)}>
        <Form.Item label="Ảnh">
          <ImagePickerField
            previewUrl={previewUrl}
            onPick={(file, preview) => {
              setImageFile(file)
              setPreviewUrl(preview)
            }}
          />
        </Form.Item>
        <Form.Item name="date" label="Ngày" rules={[{ required: true, message: 'Nhập ngày' }]}>
          <Input placeholder="24/12/2025" />
        </Form.Item>
        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Nhập nội dung' }]}>
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item name="hiddenThought" label="Suy nghĩ ẩn">
          <TextArea rows={2} />
        </Form.Item>
        <Form.Item name="mood" label="Tâm trạng" rules={[{ required: true }]}>
          <Select options={MOOD_OPTIONS} />
        </Form.Item>
        <Form.Item name="hasVoiceNote" label="Có ghi âm" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item
          name="locked"
          label="Khoá chương (mở bằng mã bí mật)"
          valuePropName="checked"
          extra={
            otherLockedChapter
              ? `Đang khoá chương "${otherLockedChapter.title}" rồi — chỉ 1 chương được khoá cùng lúc.`
              : undefined
          }
        >
          <Switch disabled={Boolean(otherLockedChapter)} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
