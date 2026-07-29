import { Upload } from 'antd'
import { PlusOutlined, CameraOutlined } from '@ant-design/icons'

// Ô chọn ảnh dùng chung cho mọi form thêm/sửa (chapter, gallery photo, ảnh
// nền settings) — hiện preview, chưa upload thật cho tới khi form submit.
// `size="large"` chỉ đổi kích thước hiển thị (CSS, xem .image-picker-large
// trong styles/index.css) — không đổi hành vi chọn/preview ảnh.
export default function ImagePickerField({ previewUrl, onPick, size = 'default' }) {
  function handleBeforeUpload(file) {
    onPick(file, URL.createObjectURL(file))
    return false
  }

  return (
    <Upload
      listType="picture-card"
      showUploadList={false}
      beforeUpload={handleBeforeUpload}
      accept="image/*"
      className={size === 'large' ? 'image-picker-large' : undefined}
    >
      {previewUrl ? (
        <div className="group/pic relative h-full w-full">
          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
          {size === 'large' && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/0 text-white opacity-0 transition-all duration-200 group-hover/pic:bg-black/45 group-hover/pic:opacity-100">
              <CameraOutlined className="text-xl" />
              <span className="text-xs font-medium">Đổi ảnh khác</span>
            </div>
          )}
        </div>
      ) : (
        <div>
          <PlusOutlined />
          <div className="mt-1 text-xs">Chọn ảnh</div>
        </div>
      )}
    </Upload>
  )
}
