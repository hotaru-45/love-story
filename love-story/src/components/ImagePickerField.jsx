import { Upload } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

// Ô chọn ảnh dùng chung cho mọi form thêm/sửa (chapter, gallery photo, ảnh
// nền settings) — hiện preview, chưa upload thật cho tới khi form submit.
export default function ImagePickerField({ previewUrl, onPick }) {
  function handleBeforeUpload(file) {
    onPick(file, URL.createObjectURL(file))
    return false
  }

  return (
    <Upload listType="picture-card" showUploadList={false} beforeUpload={handleBeforeUpload} accept="image/*">
      {previewUrl ? (
        <img src={previewUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div>
          <PlusOutlined />
          <div className="mt-1 text-xs">Chọn ảnh</div>
        </div>
      )}
    </Upload>
  )
}
