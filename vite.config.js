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
        target: 'http://172.27.83.207:8121', // 后端服务地址
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





