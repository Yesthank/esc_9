import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: https://yesthank.github.io/esc_9/
// https://vite.dev/config/
export default defineConfig({
  base: '/esc_9/',
  plugins: [react()],
})
