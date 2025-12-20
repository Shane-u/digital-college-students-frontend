# Vite代理和Session配置说明

## 🔧 配置内容

### 1. Vite代理配置 (`vite.config.js`)

```javascript
server: {
  port: 3000,
  open: true,
  // 配置代理解决跨域问题
  proxy: {
    '/api': {
      target: 'http://192.168.147.38:8121', // 后端服务地址
      changeOrigin: true, // 允许跨域
      secure: false, // 如果是https接口，需要配置这个参数
      ws: true, // 支持websocket
      configure: (proxy, options) => {
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
```

### 2. Axios配置 (`src/api/userApi.js`)

```javascript
const api = axios.create({
  baseURL: '/api', // 使用代理，不需要完整URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // 允许携带cookie和session
})
```

## 📋 工作原理

### 代理流程

1. **前端请求**: `http://172.27.63.134:3000/api/user/login`
2. **Vite代理**: 将请求转发到 `http://192.168.147.38:8121/api/user/login`
3. **后端响应**: 返回数据和Set-Cookie头
4. **浏览器保存**: 自动保存cookie（因为withCredentials: true）
5. **后续请求**: 自动携带cookie

### 为什么需要代理？

- **解决跨域**: 浏览器的同源策略限制了跨域请求
- **简化配置**: 不需要后端配置CORS
- **保持Session**: 代理可以正确转发cookie

### withCredentials的作用

- **允许携带Cookie**: 跨域请求时携带cookie
- **保持Session**: 服务器可以通过cookie识别用户
- **自动管理**: 浏览器自动处理cookie的发送和接收

## 🚀 使用方法

### 1. 重启开发服务器

修改配置后需要重启：

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

### 2. 请求示例

前端代码不需要修改，直接使用相对路径：

```javascript
// ✅ 正确 - 使用代理
await userApi.login({ account, password })
// 实际请求: http://172.27.63.134:3000/api/user/login
// 代理转发: http://192.168.147.38:8121/api/user/login

// ❌ 错误 - 不要使用完整URL
await axios.get('http://192.168.147.38:8121/api/user/login')
```

### 3. Session验证

登录成功后，后续请求会自动携带session cookie：

```javascript
// 登录
await userApi.login({ account, password })
// 后端设置cookie: JSESSIONID=xxx

// 后续请求自动携带cookie
await userApi.getCurrentUser()
// 请求头自动包含: Cookie: JSESSIONID=xxx
```

## 🔍 调试方法

### 1. 检查代理是否工作

打开浏览器开发者工具（F12）→ Network标签：

```
Request URL: http://172.27.63.134:3000/api/user/login
Status: 200
```

如果看到`172.27.63.134:3000`而不是`192.168.147.38:8121`，说明代理正在工作。

### 2. 检查Cookie

在Application标签 → Cookies → `http://172.27.63.134:3000`：

应该能看到：
- `JSESSIONID` 或其他session cookie
- `Domain`: 172.27.63.134
- `Path`: /
- `HttpOnly`: ✓

### 3. 检查请求头

在Network标签中点击某个请求 → Headers：

**Request Headers**应该包含：
```
Cookie: JSESSIONID=xxx
```

**Response Headers**应该包含（首次登录时）：
```
Set-Cookie: JSESSIONID=xxx; Path=/; HttpOnly
```

## ⚠️ 注意事项

### 1. 后端配置

后端需要配置CORS以支持credentials：

```java
// Spring Boot示例
@CrossOrigin(origins = "http://172.27.63.134:3000", allowCredentials = "true")
```

或者在配置类中：

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("http://172.27.63.134:3000");
        config.setAllowCredentials(true);
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

### 2. 生产环境

生产环境不使用Vite代理，需要：

1. **配置Nginx反向代理**：
```nginx
location /api {
    proxy_pass http://backend-server:8121;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_cookie_domain backend-server 172.27.63.134;
}
```

2. **或者配置后端CORS**：
允许前端域名访问并支持credentials

### 3. Cookie Domain

开发环境：
- 前端: `172.27.63.134:3000`
- Cookie Domain: `172.27.63.134`

生产环境：
- 前端: `www.example.com`
- 后端: `api.example.com`
- Cookie Domain: `.example.com`（注意前面的点）

## 🧪 测试清单

- [ ] 启动后端服务
- [ ] 重启前端开发服务器
- [ ] 打开浏览器访问 `http://172.27.63.134:3000`
- [ ] 打开开发者工具（F12）
- [ ] 尝试登录
- [ ] 检查Network标签，确认请求URL是172.27.63.134:3000
- [ ] 检查Application标签，确认cookie已保存
- [ ] 刷新页面，确认session保持
- [ ] 调用需要登录的接口，确认自动携带cookie

## 📞 常见问题

### Q1: 代理不工作？
**A**: 确保已重启开发服务器，修改vite.config.js后必须重启。

### Q2: Cookie没有保存？
**A**: 检查：
1. `withCredentials: true` 是否配置
2. 后端是否返回了Set-Cookie头
3. Cookie的Domain和Path是否正确

### Q3: Session丢失？
**A**: 检查：
1. Cookie是否过期
2. 后端session超时时间
3. 是否清除了浏览器缓存

### Q4: 生产环境如何配置？
**A**: 使用Nginx反向代理或配置后端CORS，不使用Vite代理。

## 📝 相关文件

- `vite.config.js` - Vite配置文件
- `src/api/userApi.js` - Axios配置文件
- `src/views/LoginPage.vue` - 登录页面

## 🔗 参考资料

- [Vite Server Options](https://vitejs.dev/config/server-options.html)
- [Axios withCredentials](https://axios-http.com/docs/req_config)
- [MDN - Credentials](https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials)


