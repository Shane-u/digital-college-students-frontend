import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true,
    // 配置代理解决跨域问题
    proxy: {
      '/api': {
        target: 'http://192.168.147.38:8121', // 后端服务地址
        changeOrigin: true, // 允许跨域
        secure: false, // 如果是https接口，需要配置这个参数
        // rewrite: (path) => path.replace(/^\/api/, '') // 如果不需要/api前缀，可以重写路径
        ws: true, // 支持websocket
        configure: (proxy, options) => {
          // 配置代理选项
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 设置credentials，允许携带cookie
            proxyReq.setHeader('credentials', 'include');
          });
        }
      }
    },
    // 配置CORS
    cors: {
      origin: '*', // 允许所有来源
      credentials: true // 允许携带凭证（cookies）
    }
  }
})





