import { useEffect, useState } from 'react'
import { App as AntdApp, Modal, Form, Input } from 'antd'
import { useLoveStoryData } from '../hooks/loveStoryDataContext'
import ImagePickerField from './ImagePickerField'

// Modal thêm/sửa 1 ảnh rời trong MemoryGallery.
export default function GalleryPhotoEditor({ open, photo, onClose }) {
  const { createGalleryPhoto, updateGalleryPhoto, uploadImage } = useLoveStoryData()
  const { message } = AntdApp.useApp()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    if (!open) return
    setImageFile(null)
    setPreviewUrl(photo?.src || null)
  }, [open, photo])

  async function handleSubmit() {
    let values
    try {
      values = await form.validateFields()
    } catch {
      return
    }
    if (!photo && !imageFile) {
      message.error('Chọn một ảnh trước đã')
      return
    }

    setSubmitting(true)
    try {
      const payload = { caption: values.caption }
      if (imageFile) {
        payload.src = await uploadImage(imageFile, 'gallery-photos')
      }

      if (photo) {
        await updateGalleryPhoto(photo.id, payload)
        message.success('Đã cập nhật ảnh')
      } else {
        await createGalleryPhoto(payload)
        message.success('Đã thêm ảnh mới')
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
      title={photo ? 'Sửa ảnh kỷ niệm' : 'Thêm ảnh mới'}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText={photo ? 'Lưu' : 'Thêm'}
      cancelText="Huỷ"
      destroyOnHidden
    >
      <Form key={photo?.id ?? 'new'} form={form} layout="vertical" initialValues={{ caption: photo?.caption || '' }}>
        <Form.Item label="Ảnh">
          <ImagePickerField
            previewUrl={previewUrl}
            onPick={(file, preview) => {
              setImageFile(file)
              setPreviewUrl(preview)
            }}
          />
        </Form.Item>
        <Form.Item name="caption" label="Chú thích" rules={[{ required: true, message: 'Nhập chú thích' }]}>
          <Input placeholder="Hai đứa đi thuỷ cung 🐠" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
