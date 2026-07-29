import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works on GitHub Pages project pages
  // regardless of the repository name (no need to hardcode it here).
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    // antd (dùng gần như ở mọi trang: Form, Modal, DatePicker, Upload...) tự
    // nó đã hơn 900kB sau khi tách riêng ở dưới — không tách nhỏ thêm được
    // bao nhiêu, nên nới ngưỡng cảnh báo thay vì cố ép xuống 500kB mặc định.
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      output: {
        // Tách các lib nặng (antd, framer-motion, react-router...) ra khỏi
        // chunk chính — trước đó tất cả gộp vào 1 file ~1MB do được import
        // trực tiếp (không lazy) ở App.jsx/Login.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('@ant-design') || id.includes('/antd/')) return 'antd'
          if (id.includes('framer-motion')) return 'framer-motion'
          if (id.includes('react-router') || id.includes('/react-dom/') || id.includes('/react/') || id.includes('/scheduler/')) {
            return 'react-vendor'
          }
          return 'vendor'
        },
      },
    },
  },
})
