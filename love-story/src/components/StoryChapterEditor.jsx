import { useEffect, useState } from 'react'
import { App as AntdApp, Modal, Form, Input, Switch, Button } from 'antd'
import { BookOutlined, AudioOutlined, LockOutlined } from '@ant-design/icons'
import { moodMeta } from '../data/moodMeta'
import { useLoveStoryData } from '../hooks/loveStoryDataContext'
import ImagePickerField from './ImagePickerField'

const { TextArea } = Input

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

// Nhận value/onChange từ Form.Item như một input bình thường — chỉ đổi
// phần hiển thị (pill chọn mood) so với <Select> mặc định trước đây.
function MoodSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(moodMeta).map(([key, meta]) => {
        const active = value === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-colors ${
              active
                ? 'border-rose-400 bg-rose-50 font-medium text-rose-600'
                : 'border-gray-200 bg-white text-gray-500 hover:border-rose-200 hover:bg-rose-50/60'
            }`}
          >
            <span>{meta.emoji}</span>
            <span>{meta.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// Nhận checked/onChange từ Form.Item (valuePropName="checked") — gói icon +
// tiêu đề + mô tả + Switch thành 1 "setting row", thay cho Form.Item label
// + Switch rời rạc trước đây.
function SettingRow({ icon, title, description, checked, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3.5">
      <div className="flex items-start gap-3 pr-2">
        <span className="mt-0.5 text-base text-rose-400">{icon}</span>
        <div>
          <p className="text-sm font-medium text-gray-800">{title}</p>
          {description && <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{description}</p>}
        </div>
      </div>
      <Switch checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  )
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
      onCancel={submitting ? undefined : onClose}
      closable={!submitting}
      mask={{ closable: !submitting }}
      destroyOnHidden
      centered
      width={{ xs: '100vw', sm: '92vw', md: '88vw', lg: 960, xl: 960 }}
      rootClassName="story-chapter-modal"
      styles={{ body: { maxHeight: '68vh', overflowY: 'auto' } }}
      title={
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-50 text-lg text-rose-500">
            <BookOutlined />
          </span>
          <div>
            <p className="text-base font-semibold text-gray-900">
              {story ? 'Chỉnh sửa chương' : 'Thêm chương mới'}
            </p>
            <p className="text-xs font-normal text-gray-400">
              {story ? 'Cập nhật lại một mảnh ký ức đã có' : 'Ghi lại một mảnh ký ức mới của hai người'}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button size="large" onClick={onClose} disabled={submitting}>
            Huỷ
          </Button>
          <Button size="large" type="primary" loading={submitting} onClick={handleSubmit}>
            {story ? 'Lưu thay đổi' : 'Thêm chương'}
          </Button>
        </div>
      }
    >
      <Form key={story?.id ?? 'new'} form={form} layout="vertical" initialValues={initialValuesFor(story)}>
        <div className="grid gap-6 lg:grid-cols-[38%_1fr] lg:gap-8">
          <div className="flex flex-col">
            <ImagePickerField
              size="large"
              previewUrl={previewUrl}
              onPick={(file, preview) => {
                setImageFile(file)
                setPreviewUrl(preview)
              }}
            />
            <p className="mt-3 text-xs leading-relaxed text-gray-400">
              Ảnh đại diện sẽ xuất hiện trên thẻ chương và khi mở rộng câu chuyện.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Form.Item
                name="date"
                label="Ngày"
                rules={[{ required: true, message: 'Nhập ngày' }]}
                className="!mb-0 sm:w-40"
              >
                <Input placeholder="24/12/2025" />
              </Form.Item>
              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[{ required: true, message: 'Nhập tiêu đề' }]}
                className="!mb-0 flex-1"
              >
                <Input placeholder="Tên chương kỷ niệm" />
              </Form.Item>
            </div>

            <Form.Item
              name="content"
              label="Nội dung"
              rules={[{ required: true, message: 'Nhập nội dung' }]}
              className="!mb-0"
            >
              <TextArea rows={4} className="resize-y" placeholder="Kể lại câu chuyện của chương này..." />
            </Form.Item>

            <Form.Item name="hiddenThought" label="Suy nghĩ ẩn" className="!mb-0">
              <TextArea rows={3} className="resize-y" placeholder="Một dòng suy nghĩ nhỏ giấu riêng, chỉ hiện khi bấm vào thẻ..." />
            </Form.Item>

            <Form.Item name="mood" label="Tâm trạng" rules={[{ required: true }]} className="!mb-0">
              <MoodSelector />
            </Form.Item>

            <div className="flex flex-col gap-3">
              <Form.Item name="hasVoiceNote" valuePropName="checked" noStyle>
                <SettingRow
                  icon={<AudioOutlined />}
                  title="Có ghi âm"
                  description="Hiện nút nghe giọng nói khi mở rộng câu chuyện"
                />
              </Form.Item>

              <Form.Item name="locked" valuePropName="checked" noStyle>
                <SettingRow
                  icon={<LockOutlined />}
                  title="Khoá chương (mở bằng mã bí mật)"
                  description={
                    otherLockedChapter
                      ? `Đang khoá chương "${otherLockedChapter.title}" rồi — chỉ 1 chương được khoá cùng lúc.`
                      : 'Nội dung sẽ ẩn cho tới khi khách khám phá đúng mã bí mật.'
                  }
                  disabled={Boolean(otherLockedChapter)}
                />
              </Form.Item>
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  )
}
