import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'

// 自定义插件：处理 Live2D 的 JSON 文件
const live2dJsonPlugin = () => {
  return {
    name: 'live2d-json-handler',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // 拦截 wanko 目录下的 JSON 文件请求
        if (req.url && req.url.includes('/wanko/') && 
            (req.url.endsWith('.model3.json') || 
             req.url.endsWith('.motion3.json') || 
             req.url.endsWith('.physics3.json') || 
             req.url.endsWith('.cdi3.json'))) {
          
          // 构建文件路径
          const filePath = path.join(process.cwd(), 'public', req.url.split('?')[0])
          
          // 检查文件是否存在
          if (fs.existsSync(filePath)) {
            // 读取并直接返回 JSON 文件内容
            const content = fs.readFileSync(filePath, 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Cache-Control', 'no-cache')
            res.end(content)
            return
          }
        }
        next()
      })
    }
  }
}

export default defineConfig({
  plugins: [vue(), live2dJsonPlugin()],
  server: {
    port: 3000,
    open: true,
    // 添加中间件处理 Live2D JSON 文件
    middlewareMode: false,
    fs: {
      strict: false
    },
    // 配置代理解决跨域问题
    proxy: {
      '/api': {
        target: 'http://172.27.15.80:8121', // 后端服务地址
        changeOrigin: true, // 允许跨域
        secure: false, // 如果是https接口，需要配置这个参数
        // rewrite: (path) => path.replace(/^\/api/, '') // 如果后端不需要/api前缀，可以取消注释此行
        ws: true, // 支持websocket
        // 保持连接，支持流式响应（SSE）
        timeout: 600000, // 10分钟超时，适合流式请求（默认2分钟可能不够）
        configure: (proxy, options) => {
          // 配置代理选项
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 设置credentials，允许携带cookie
            proxyReq.setHeader('credentials', 'include');
            // 对于流式请求，确保Accept头部正确
            if (req.url && req.url.includes('/stream')) {
              // 流式请求优先接受 text/event-stream
              proxyReq.setHeader('Accept', 'text/event-stream, application/json, text/plain, */*');
            }
          });
          // 处理代理响应，确保流式响应正确传递
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // 对于流式请求，确保连接保持活跃
            if (req.url && req.url.includes('/stream')) {
              // 确保响应不被缓冲，直接流式传输
              res.setHeader('X-Accel-Buffering', 'no'); // 禁用缓冲
              // 保持连接活跃
              if (!res.headersSent) {
                res.setHeader('Connection', 'keep-alive');
              }
            }
          });
        }
      }
    },
    // 配置CORS
    cors: {
      origin: '*', // 允许所有来源
      credentials: true // 允许携带凭证（cookies）
    },
    compress: false
  }
})





