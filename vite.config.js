import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  clearScreen: false,
  plugins: [react(), tailwindcss()],
  base: './',
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  // Windows에서 큰 번들 gzip 리포팅 단계에서 부담을 줄임
  build: {
    reportCompressedSize: false,
    chunkSizeWarningLimit: 2000,
    minify: 'esbuild',
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
