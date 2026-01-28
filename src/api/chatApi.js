import { ElMessage } from 'element-plus'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    config.withCredentials = true
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果返回的状态码不是 0，说明接口请求失败
    if (res.code !== 0) {
      ElMessage.error(res.message || '请求失败')
      
      // 401: 未授权，跳转到登录页
      if (res.code === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        window.location.href = '/login'
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    return res.data
  },
  error => {
    console.error('响应错误:', error)
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(error.response.data?.message || '请求失败')
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

// 注意：流式聊天接口（SSE）必须使用 fetch API，因为 axios 不支持 SSE 流式响应
// 但是我们可以使用 axios 的适配器功能，或者使用 request 实例来获取完整的配置
// 其他接口（创建会话、获取会话列表等）使用 request.js 中封装的 axios 实例

/**
 * 获取用户ID
 * @returns {number} 用户ID
 */
const getUserId = () => {
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo)
      return user.id || user.userId || 1
    } catch (e) {
      return 1
    }
  }
  return 1
}

/**
 * 使用 request 拦截器的逻辑来构建 fetch 请求
 * 完全模拟 request.js 中 axios 实例的行为，确保和 axios 请求一致
 * 走 vite.config.js 中的 /api 全局代理
 * @param {string} url - 请求URL（相对路径，如 '/chat/completions/stream'）
 * @param {Object} data - 请求数据
 * @returns {Object} 配置好的 fetch 参数 {url, options}
 */
const getRequestConfig = (url, data) => {
  // 完全使用 request 实例的配置（和 axios 一样）
  const baseURL = request.defaults.baseURL // '/api'
  const withCredentials = request.defaults.withCredentials // true
  
  // 构建 headers（确保 Content-Type 正确设置）
  // request.js 中设置的默认 headers 是 'application/json;charset=UTF-8'
  const headers = {
    'Content-Type': 'application/json;charset=UTF-8',
    'Accept': 'text/event-stream, application/json, text/plain, */*'
  }
  
  // 应用请求拦截器逻辑（和 request.interceptors.request.use 完全一致）
  const token = localStorage.getItem('token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  // 构建完整 URL（完全模拟 axios 的行为）
  // url: '/chat/completions/stream'
  // baseURL: '/api'
  // 最终: '/api/chat/completions/stream'
  // 关键：使用相对路径 '/api/...'，vite 代理会拦截并转发到后端
  // vite.config.js 中配置了 /api 代理，会转发到 http://172.27.109.72:8121
  let fullUrl
  if (url.startsWith('http')) {
    // 如果已经是完整 URL，直接使用
    fullUrl = url
  } else {
    // 确保 url 以 / 开头
    const path = url.startsWith('/') ? url : `/${url}`
    // 拼接 baseURL，确保只有一个 / 分隔符
    fullUrl = `${baseURL}${path}`
  }
  
  // 转换为 fetch 选项（完全对应 axios 的配置）
  const fetchOptions = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data),
    credentials: withCredentials ? 'include' : 'same-origin'
  }
  
  return { url: fullUrl, options: fetchOptions }
}

/**
 * 应用 request 响应拦截器的错误处理逻辑
 * @param {Response} response - fetch 响应对象
 * @param {Function} onError - 错误回调
 */
const handleResponseError = async (response, onError) => {
  if (!response.ok) {
    // 应用响应拦截器的错误处理逻辑
    const errorText = await response.text().catch(() => '无法获取错误信息')
    let errorMessage = '请求失败'
    
    try {
      const errorData = JSON.parse(errorText)
      errorMessage = errorData.message || errorMessage
      
      // 处理 401 错误（对应响应拦截器的逻辑）
      if (response.status === 401) {
        ElMessage.error('未授权，请重新登录')
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        window.location.href = '/login'
        if (onError) {
          onError(new Error(errorMessage))
        }
        return
      }
    } catch (e) {
      // 如果不是 JSON，使用原始错误文本
      errorMessage = errorText || errorMessage
    }
    
    // 应用响应拦截器的状态码处理
    switch (response.status) {
      case 401:
        ElMessage.error('未授权，请重新登录')
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        window.location.href = '/login'
        break
      case 403:
        ElMessage.error('拒绝访问')
        break
      case 404:
        ElMessage.error('请求的资源不存在')
        break
      case 500:
        ElMessage.error('服务器错误')
        break
      default:
        ElMessage.error(errorMessage || '请求失败')
    }
    
    if (onError) {
      onError(new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`))
    } else {
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`)
    }
  }
}

/**
 * 流式聊天接口（SSE）
 * @param {Object} params - 请求参数
 * @param {Array} params.messages - 消息列表
 * @param {string} params.model - 模型名称（可选）
 * @param {number} params.temperature - 温度参数（可选，默认0.7）
 * @param {boolean} params.stream - 是否流式输出（默认true）
 * @param {number} params.maxTokens - 最大生成令牌数（可选）
 * @param {string} params.sessionId - 会话ID（可选）
 * @param {Function} onMessage - 接收消息的回调函数 (reasoning, content, type) => {}
 *   - reasoning: 完整的思考过程内容（累积）
 *   - content: 完整的响应内容（累积）
 *   - type: 'reasoning' | 'content' - 表示当前更新的是思考内容还是响应内容
 * @param {Function} onError - 错误回调函数
 * @param {Function} onComplete - 完成回调函数 (reasoning, content) => {}
 *   - reasoning: 完整的思考过程内容
 *   - content: 完整的响应内容
 * @returns {Promise} 返回 AbortController 用于取消请求
 * 
 * 支持的数据格式：
 * - SSE 格式：data: {...} 或 data:data: {...}（重复前缀）
 * - 事件类型：event:message, event:done
 * - 数据字段：
 *   - choices[0].delta.reasoning_content: 思考过程增量
 *   - choices[0].delta.content: 响应内容增量
 *   - deltaContent: 响应内容增量（备用字段）
 *   - finished: 是否完成
 *   - finish_reason: 完成原因
 */
export const streamChat = async (params = {}, onMessage, onError, onComplete) => {
  const userId = getUserId()
  
  const requestBody = {
    messages: params.messages || [],
    model: params.model || 'doubao-seed-1-6-251015',
    temperature: params.temperature !== undefined ? params.temperature : 0.7,
    stream: params.stream !== undefined ? params.stream : true,
    maxTokens: params.maxTokens || 2048,
    userId: params.userId || userId,
    thinking: {
      type: params.thinkingType || 'disabled'
    }
  }
  
  // 只有当 sessionId 存在且不为空时才添加
  if (params.sessionId) {
    requestBody.sessionId = params.sessionId
  }
  
  const abortController = new AbortController()
  
  try {
    // 使用 @microsoft/fetch-event-source 以获得更快的事件分发
    const { url: apiUrl, options: fetchOptions } = getRequestConfig('/chat/stream/flux', requestBody)
    console.log('发送流式聊天请求到(Flux):', apiUrl)
    let finished = false
    let reasoningContent = ''
    let content = ''
    const decodeChunk = (text = '') => {
      return text
        .replace(/&#32;/g, ' ')
        .replace(/&#92n/g, '\n')
        .replace(/&#92;/g, '\\')
    }
    // 处理解析后的数据
    const processData = (jsonData) => {
      // 处理 choices[0].delta 结构（兼容多种格式）
      let delta = null
      if (jsonData.choices && jsonData.choices[0] && jsonData.choices[0].delta) {
        delta = jsonData.choices[0].delta
      } else if (jsonData.delta) {
        delta = jsonData.delta
      } else {
        delta = jsonData
      }
      
      // 处理思考过程（reasoning_content）
      // 支持 reasoning_content 在 delta 中或直接在 jsonData 中
      // 只有当值不为 null、undefined 且不为空字符串时才处理
      let reasoningDelta = null
      if (delta.reasoning_content !== undefined && delta.reasoning_content !== null && delta.reasoning_content !== '') {
        reasoningDelta = delta.reasoning_content
      } else if (jsonData.reasoning_content !== undefined && jsonData.reasoning_content !== null && jsonData.reasoning_content !== '') {
        reasoningDelta = jsonData.reasoning_content
      }
      
      // 如果有思考内容，累积并触发回调
      if (reasoningDelta !== null && reasoningDelta !== undefined && reasoningDelta !== '') {
        reasoningContent += reasoningDelta
        if (onMessage) {
          // 追加式回调：第四个参数传本次增量，便于前端拼接
          onMessage(reasoningContent, content, 'reasoning', reasoningDelta)
        }
      }
      
      // 处理正常内容（content）
      // 支持多种格式：delta.content, jsonData.content, jsonData.deltaContent
      // 只有当值不为 null、undefined 且不为空字符串时才处理
      let contentDelta = null
      if (delta.content !== undefined && delta.content !== null && delta.content !== '') {
        contentDelta = delta.content
      } else if (jsonData.content !== undefined && jsonData.content !== null && jsonData.content !== '') {
        contentDelta = jsonData.content
      } else if (jsonData.deltaContent !== undefined && jsonData.deltaContent !== null && jsonData.deltaContent !== '') {
        contentDelta = jsonData.deltaContent
      }
      
      // 如果有响应内容，累积并触发回调
      if (contentDelta !== null && contentDelta !== undefined && contentDelta !== '') {
        content += contentDelta
        if (onMessage) {
          // 追加式回调：第四个参数传本次增量，便于前端拼接
          onMessage(reasoningContent, content, 'content', contentDelta)
        }
      }
      
      // 检查是否完成
      // 支持多种完成标记：finished, done, finish_reason
      const isFinished = jsonData.finished === true || 
                        jsonData.done === true ||
                        (jsonData.finish_reason && jsonData.finish_reason !== null)
      
      if (isFinished) {
        console.log('收到完成标记:', jsonData.finish_reason || jsonData.finished || jsonData.done)
        if (onComplete) {
          onComplete(reasoningContent, content)
        }
        return true // 表示已完成
      }
      
      return false // 表示未完成
    }
    
    await fetchEventSource(apiUrl, {
      method: fetchOptions.method,
      headers: fetchOptions.headers,
      body: fetchOptions.body,
      signal: abortController.signal,
      openWhenHidden: true,
      async onopen(response) {
        if (!response.ok) {
          await handleResponseError(response, onError)
          throw new Error(`连接SSE失败: ${response.status}`)
        }
      },
      onmessage(ev) {
        if (finished) return
        const evt = ev.event || 'message'
        let dataStr = (ev.data || '')
        if (!dataStr || !dataStr.trim()) return
        dataStr = decodeChunk(dataStr.trim())
        if (!dataStr) return
        if (evt === 'done') {
          finished = true
          if (onComplete) onComplete(reasoningContent, content)
          return
        }
        if (evt === 'thinking' || evt === 'reasoning') {
          if (dataStr === '[DONE]') {
            if (onMessage) {
              onMessage(reasoningContent, content, 'reasoning', '')
            }
            return
          }
          reasoningContent += dataStr
          if (onMessage) {
            onMessage(reasoningContent, content, 'reasoning', dataStr)
          }
          return
        }
        if (dataStr === '[DONE]') {
          finished = true
          if (onComplete) onComplete(reasoningContent, content)
          return
        }
        try {
          const json = JSON.parse(dataStr)
          const isFinished = processData(json)
          if (isFinished) {
            finished = true
          }
        } catch (e) {
          // 非JSON的纯文本内容，直接拼接
          content += dataStr
          if (onMessage) {
            onMessage(reasoningContent, content, 'content', dataStr)
          }
        }
      },
      onclose() {
        if (!finished) {
          finished = true
          if (onComplete) onComplete(reasoningContent, content)
        }
      },
      onerror(err) {
        if (err?.name === 'AbortError') return
        if (onError) onError(err)
        throw err
      }
    })
    
    return abortController
  } catch (error) {
    console.error('发送流式聊天请求失败:', error)
    if (error.name === 'AbortError') {
      console.log('请求已取消')
      return abortController
    }
    if (onError) {
      onError(error)
    } else {
      throw error
    }
    return abortController
  }
}

/**
 * 创建聊天会话
 * @param {Object} params - 请求参数
 * @param {string} params.title - 会话标题（可选）
 * @param {number} params.userId - 用户ID（可选）
 * @returns {Promise} 返回会话信息
 */
export const createChatSession = async (params = {}) => {
  const userId = params.userId || getUserId()
  // 按照 growthRecord.js 的方式使用 request
  return request({
    url: '/chat/sessions',
    method: 'post',
    data: {
      title: params.title || '',
      userId: userId
    }
  })
}

/**
 * 获取用户的会话列表
 * @param {Object} params - 请求参数
 * @param {number} params.userId - 用户ID（可选）
 * @returns {Promise} 返回会话列表
 */
export const getChatSessions = async (params = {}) => {
  const userId = params.userId || getUserId()
  // 按照 growthRecord.js 的方式使用 request
  return request({
    url: '/chat/sessions',
    method: 'get',
    params: {
      userId: userId
    }
  })
}

/**
 * 获取会话的消息列表
 * @param {Object} params - 请求参数
 * @param {string} params.sessionId - 会话ID
 * @param {number} params.userId - 用户ID（可选）
 * @returns {Promise} 返回消息列表
 */
export const getChatMessages = async (params = {}) => {
  const userId = params.userId || getUserId()
  const { sessionId } = params
  if (!sessionId) {
    throw new Error('sessionId 是必需的')
  }
  // 按照 growthRecord.js 的方式使用 request
  return request({
    url: `/chat/sessions/${sessionId}/messages`,
    method: 'get',
    params: {
      userId: userId
    }
  })
}

/**
 * 删除会话（软删除）
 * @param {Object} params - 请求参数
 * @param {string} params.sessionId - 会话ID
 * @param {number} params.userId - 用户ID（可选）
 * @returns {Promise} 返回删除结果
 */
export const deleteChatSession = async (params = {}) => {
  const userId = params.userId || getUserId()
  const { sessionId } = params
  if (!sessionId) {
    throw new Error('sessionId 是必需的')
  }
  // 按照 growthRecord.js 的方式使用 request
  return request({
    url: `/chat/sessions/${sessionId}`,
    method: 'delete',
    params: {
      userId: userId
    }
  })
}

/**
 * AI润色文本
 * @param {string} text - 待润色的文本
 * @returns {Promise<string>} 返回润色后的文本
 */
export const polishText = async (text) => {
  if (!text || !text.trim()) {
    throw new Error('请先输入内容')
  }
  
  return new Promise((resolve, reject) => {
    const userId = getUserId()
    let polishedContent = ''
    
    streamChat(
      {
        messages: [
          {
            role: 'system',
            content: '你现在只需要对用户输入的内容进行润色，要符合实际情况，如果用户输入的内容是markdown格式，那你给出的内容也是markdown格式。只输出你润色的内容，其他的都不要输出'
          },
          {
            role: 'user',
            content: text
          }
        ],
        model: 'doubao-seed-1-6-251015',
        stream: true,
        maxTokens: 10000,
        thinkingType: 'disabled'
      },
      // onMessage 回调 - 只处理content类型，忽略reasoning
      (reasoning, content, type, delta) => {
        // 只处理content类型的增量数据
        if (type === 'content' && delta) {
          polishedContent += delta
        }
      },
      // onError 回调
      (error) => {
        console.error('AI润色失败:', error)
        reject(error)
      },
      // onComplete 回调
      (reasoning, content) => {
        // 使用content参数或累积的polishedContent
        const result = content || polishedContent
        if (result && result.trim()) {
          resolve(result.trim())
        } else {
          // 如果没有润色结果，返回原文本
          resolve(text)
        }
      }
    )
  })
}

