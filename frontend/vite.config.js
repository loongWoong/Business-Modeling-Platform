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
        target: 'http://127.0.0.1:5000',
        changeOrigin: true, // 改变请求头中的 origin，确保后端能够正确识别
        secure: false, // 如果是 https 接口，需要配置这个参数
        ws: true, // 支持 websocket
        rewrite: (path) => path, // 保持路径不变
        // 配置代理选项，确保跨域请求正常工作
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.error('代理错误:', err);
          });
        },
      }
    }
  },
  // 确保构建时使用UTF-8编码
  build: {
    charset: 'utf8'
  }
})