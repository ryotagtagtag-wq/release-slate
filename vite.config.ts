import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// GitHub Pages 用：サブディレクトリ /release-slate/ で配信されるため base を設定
export default defineConfig({
  plugins: [vue()],
  base: '/release-slate/',
})