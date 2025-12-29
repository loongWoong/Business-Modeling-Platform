import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // 确保代理正确处理UTF-8编码
        headers: {
          'Accept': 'application/json;charset=UTF-8',
          'Accept-Charset': 'UTF-8'
        }
      }
    }
  },
  // 确保构建时使用UTF-8编码
  build: {
    charset: 'utf8'
  }
})