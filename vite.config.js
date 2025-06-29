import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/ahrrri-maple-tools/' : '/', // GitHub Pages 저장소 이름
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: {
    host: '0.0.0.0', // Remote SSH 환경에서 접근 가능하도록 설정
    port: 5173
  }
})
