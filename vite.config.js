import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/compare-prices/', // GitHub Pages 저장소 이름
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
