import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works on GitHub Pages project pages
  // regardless of the repository name (no need to hardcode it here).
  base: './',
  plugins: [react(), tailwindcss()],
})
