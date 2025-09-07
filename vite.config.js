import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ZikaFit-/',   // ← لازم يبقى نفس اسم الريبو بالظبط (عندك فيه شرطة في الآخر)
})
