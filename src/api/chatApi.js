import { ElMessage } from 'element-plus'
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
    userId: params.userId || userId
  }
  
  // 只有当 sessionId 存在且不为空时才添加
  if (params.sessionId) {
    requestBody.sessionId = params.sessionId
  }
  
  const abortController = new AbortController()
  
  try {
    // 流式接口必须使用 fetch API（axios 不支持 SSE 流式响应）
    // 关键：使用相对路径 '/chat/completions/stream'，getRequestConfig 会自动加上 baseURL '/api'
    // 最终 URL 是 '/api/chat/completions/stream'
    // vite.config.js 中配置了 '/api' 全局代理，会拦截此请求并转发到后端服务器
    const { url: apiUrl, options: fetchOptions } = getRequestConfig('/chat/completions/stream', requestBody)
    
    // 添加 signal 到 fetchOptions（用于取消请求）
    fetchOptions.signal = abortController.signal
    
    console.log('发送流式聊天请求到:', apiUrl)
    console.log('完整请求配置:', { url: apiUrl, method: fetchOptions.method, headers: fetchOptions.headers })
    console.log('请求体:', JSON.stringify(requestBody, null, 2))
    
    // 使用 fetch 发送请求
    // 相对路径 '/api/chat/completions/stream' 会被 vite 开发服务器的代理拦截
    // 代理会将请求转发到 vite.config.js 中配置的后端地址
    const response = await fetch(apiUrl, fetchOptions)
    
    console.log('响应状态:', response.status, response.statusText)
    console.log('响应头:', response.headers.get('Content-Type'))
    
    // 应用响应拦截器的错误处理逻辑
    if (!response.ok) {
      await handleResponseError(response, onError)
      return abortController
    }
    
    // 检查 Content-Type 是否是 SSE 格式
    const contentType = response.headers.get('Content-Type') || ''
    if (!contentType.includes('text/event-stream') && !contentType.includes('text/plain')) {
      console.warn('响应Content-Type不是SSE格式:', contentType)
    }
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let reasoningContent = ''
    let content = ''
    let hasReceivedData = false
    let currentEvent = null // 当前事件类型
    
    /**
     * 解析 SSE 数据行
     * 支持格式：
     * - data: {...}
     * - data:data: {...} (重复的 data 前缀)
     * - event:message
     * - event:done
     */
    const parseSSELine = (line) => {
      const trimmedLine = line.trim()
      if (!trimmedLine) return null
      
      // 处理事件类型: event:message, event:done
      if (trimmedLine.startsWith('event: ')) {
        currentEvent = trimmedLine.slice(7).trim()
        console.log('收到事件:', currentEvent)
        // 如果是 done 事件，返回完成标记
        if (currentEvent === 'done') {
          return { type: 'done' }
        }
        return null
      }
      
      // 处理 data 行
      if (trimmedLine.startsWith('data:')) {
        // 处理重复的 data: 前缀，如 data:data: {...}
        let dataStr = trimmedLine
        while (dataStr.startsWith('data:')) {
          dataStr = dataStr.slice(5).trim()
          if (dataStr.startsWith(':')) {
            dataStr = dataStr.slice(1).trim()
          }
        }
        
        // 空 data 行：跳过，不作为结束
        if (dataStr === '') {
          return null
        }
        
        // 处理 [DONE] 标记
        if (dataStr === '[DONE]') {
          console.log('收到结束标记 [DONE]')
          return { type: 'done' }
        }
        
        // 解析 JSON 数据
        try {
          const json = JSON.parse(dataStr)
          return { type: 'data', data: json }
        } catch (e) {
          // 如果解析失败，记录警告但继续处理
          if (dataStr && dataStr !== '[DONE]') {
            console.warn('解析SSE数据失败:', e, '原始数据:', dataStr)
          }
          return null
        }
      }
      
      // 忽略其他 SSE 字段（id, retry 等）
      if (trimmedLine.startsWith('id: ') || trimmedLine.startsWith('retry: ')) {
        return null
      }
      
      // 如果不是标准 SSE 格式，尝试直接解析为 JSON
      try {
        const json = JSON.parse(trimmedLine)
        return { type: 'data', data: json }
      } catch (e) {
        // 不是 JSON，忽略
        return null
      }
    }
    
    /**
     * 处理解析后的数据
     */
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
    
    const processStream = async () => {
      try {
        let yieldCounter = 0
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) {
            console.log('流式输出完成, reasoning:', reasoningContent.length, 'content:', content.length)
            if (onComplete) {
              onComplete(reasoningContent, content)
            }
            break
          }
          
          hasReceivedData = true
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // 保留最后一个不完整的行
          
          for (const line of lines) {
            const parsed = parseSSELine(line)
            
            if (!parsed) continue
            
            // 处理完成标记
            if (parsed.type === 'done') {
              if (onComplete) {
                onComplete(reasoningContent, content)
              }
              return
            }
            
            // 处理数据
            if (parsed.type === 'data' && parsed.data) {
              const isFinished = processData(parsed.data)
              if (isFinished) {
                return
              }
              // 定期让出事件循环，避免长时间占用导致 UI 不刷新
              yieldCounter++
              if (yieldCounter % 20 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0))
              }
            }
          }
        }
        
        // 如果流结束但没有收到数据，可能是错误
        if (!hasReceivedData && !content && !reasoningContent) {
          console.warn('流式输出完成但没有收到任何数据')
          if (onError) {
            onError(new Error('流式输出完成但没有收到任何数据'))
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('请求已取消')
          return
        }
        console.error('处理流式输出时出错:', error)
        if (onError) {
          onError(error)
        } else {
          throw error
        }
      }
    }
    
    // 异步处理流
    processStream()
    
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

