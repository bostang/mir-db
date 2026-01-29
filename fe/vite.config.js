import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0', // **PASTIKAN ADA BARIS INI**
    port: 5173,
    proxy: {
      // Ketika ada request ke /api
      '/api': {
        target: 'http://localhost:5000', // Teruskan request secara internal ke Backend
        changeOrigin: true, // Mengubah header Origin
        secure: false, 
        rewrite: (path) => path.replace(/^\/api/, '') // Menghapus /api dari path sebelum dikirim ke 5000
      }
    }
  },
  plugins: [react()],
})
