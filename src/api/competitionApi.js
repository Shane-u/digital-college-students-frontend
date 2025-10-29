
import axios from 'axios';
// 封装获取竞赛列表的接口请求
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
export const getCompetitionList = async () => {
  try {
    const response = await api.get('/competition/latest');
    // console.log(response);
    if (response.code === 0) {
      console.log(response.data);
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('获取竞赛列表失败:', error);
    throw error;
  }
};