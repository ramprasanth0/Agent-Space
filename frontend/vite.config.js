import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 3000,
    watch: {
      usePolling: true,
      interval: 100,
    },
    proxy: {
      '/chat': {
        target: 'http://backend:8000',
        changeOrigin: true,
        ws: true,
      },
      '/stream': {
        target: 'http://backend:8000',
        changeOrigin: true,
        ws: true,
      }
    }
  }
})
