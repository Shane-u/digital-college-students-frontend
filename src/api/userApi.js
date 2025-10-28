import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api', // 使用代理，不需要完整URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // 允许携带cookie和session
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 可以在这里添加token等认证信息
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 如果是blob类型，直接返回blob数据
    if (response.config.responseType === 'blob') {
      return response.data
    }
    // 其他情况返回data
    return response.data
  },
  error => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

// 用户相关API接口
export const userApi = {
  // 1. 获取图形验证码（后端返回base64格式）
  getCaptcha() {
    return api.get('/user/captcha')
  },

  // 2. 发送验证码（手机/邮箱）
  sendCode(account) {
    return api.post('/user/sendCode', null, {
      params: { account }
    })
  },

  // 3. 账号密码登录
  loginByPassword(data) {
    return api.post('/user/login', data)
  },

  // 4. 验证码登录
  loginByCode(data) {
    return api.post('/user/login/code', data)
  },

  // 5. 用户注册
  register(data) {
    return api.post('/user/register', data)
  },

  // 6. 用户登录（简化版）
  login(data) {
    return api.post('/user/login', data)
  },

  // 7. 用户注销
  logout() {
    return api.post('/user/logout')
  },

  // 8. 获取当前登录用户
  getCurrentUser() {
    return api.get('/user/get/login')
  },

  // 9. 验证图形验证码
  verifyCaptcha(captcha) {
    return api.post('/user/verifyCaptcha', { captcha })
  }
}

export default userApi

