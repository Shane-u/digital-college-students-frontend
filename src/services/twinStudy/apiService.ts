const API_BASE = '/api/bailian'

export class ExternalApiService {
  /**
   * 创建新的聊天会话
   * @returns Promise<string> 返回 chatId
   */
  async getChatId(): Promise<string> {
    const response = await fetch(`${API_BASE}/chat/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    if (result.code === 0 && result.data?.chatId) {
      return result.data.chatId
    }
    throw new Error(result.message || 'Failed to get chat_id')
  }

  /**
   * 流式发送聊天消息
   * @param chatId 会话ID
   * @param question 用户问题
   * @param signal AbortSignal 用于取消请求
   * @yields 返回流式数据块，格式：{ content?: string, node_id?: string, node_dict?: any, knowledge?: string, references?: any[] }
   */
  async *streamChat(chatId: string, question: string, signal?: AbortSignal) {
    const response = await fetch(`${API_BASE}/chat/stream/flux`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        chat_id: chatId, // 后端 DTO 使用 chat_id
        question: question,
        stream: true
      }),
      signal
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    if (!response.body) throw new Error('ReadableStream not supported')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    // 是否已经向上游发出过第一个纯文本内容块（用于忽略首条调试/提示消息）
    let hasEmittedTextChunk = false

    try {
      while (true) {
        // 检查是否已取消
        if (signal?.aborted) {
          reader.cancel()
          break
        }

        const { value, done } = await reader.read()
        if (done) break

      buffer += decoder.decode(value, { stream: true })
      
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留最后一个不完整的行

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue

        // 跳过 event:done 事件（流式传输结束的重复标记）
        if (trimmed === 'event:done') {
          continue
        }

        // 跳过 event: 行
        if (trimmed.startsWith('event:')) {
          continue
        }

        // 处理 data: 行
        if (trimmed.startsWith('data:')) {
          const data = trimmed.substring(5).trim()
          
          // 跳过 [DONE] 标记
          if (data === '[DONE]') {
            continue
          }

          try {
            // 尝试解析为 JSON 对象（如果后端返回结构化数据）
            const json = JSON.parse(data)
            // 如果解析成功且是对象，直接返回
            if (typeof json === 'object' && json !== null) {
              yield json
              continue
            }
          } catch (e) {
            // 如果不是 JSON，则作为纯文本处理
          }

          // Flux 接口返回的内容已经编码，需要解码
          const decoded = data
            .replace(/&#32;/g, ' ')
            .replace(/&#92n/g, '\n')

          // 过滤掉空内容或只有换行符的内容（重复的结束标记）
          const trimmedDecoded = decoded.trim()
          if (!trimmedDecoded || trimmedDecoded === '\n') {
            continue
          }

          // 忽略第一个纯文本内容块（通常是调试前缀或无用提示，例如 "xxx"）
          if (!hasEmittedTextChunk) {
            hasEmittedTextChunk = true
            continue
          }

          // 将解码后的文本内容包装成与原有格式兼容的对象
          // 原有代码期望：{ content?: string, node_id?: string, node_dict?: any, knowledge?: string, references?: any[] }
          yield {
            content: decoded
          }
        }
      }
      }
    } catch (error) {
      // 如果是取消操作，不抛出错误
      if (signal?.aborted || error.name === 'AbortError') {
        reader.cancel()
        return
      }
      throw error
    }
    
    // 处理最后剩余的 buffer
    if (buffer.trim()) {
      const trimmed = buffer.trim()
      // 跳过 event:done
      if (trimmed === 'event:done') {
        return
      }
      if (trimmed.startsWith('data:')) {
        const data = trimmed.substring(5).trim()
        // 跳过 [DONE] 标记
        if (data === '[DONE]') {
          return
        }
        try {
          // 尝试解析为 JSON 对象
          const json = JSON.parse(data)
          if (typeof json === 'object' && json !== null) {
            yield json
          } else {
            const decoded = data
              .replace(/&#32;/g, ' ')
              .replace(/&#92n/g, '\n')
            const trimmedDecoded = decoded.trim()
            // 过滤掉空内容
            if (!trimmedDecoded || trimmedDecoded === '\n') {
              return
            }
            // 忽略第一个纯文本内容块
            if (!hasEmittedTextChunk) {
              hasEmittedTextChunk = true
              return
            }
            yield { content: decoded }
          }
        } catch (e) {
          // 如果不是 JSON，则作为纯文本处理并解码
          const decoded = data
            .replace(/&#32;/g, ' ')
            .replace(/&#92n/g, '\n')
          const trimmedDecoded = decoded.trim()
          // 过滤掉空内容
          if (!trimmedDecoded || trimmedDecoded === '\n') {
            return
          }
          // 忽略第一个纯文本内容块
          if (!hasEmittedTextChunk) {
            hasEmittedTextChunk = true
            return
          }
          yield { content: decoded }
        }
      }
    }
  }

  /**
   * 获取会话的历史消息
   * @param chatId 会话ID
   * @param userId 用户ID（可选）
   * @returns Promise<Array> 返回消息列表
   */
  async getChatMessages(chatId: string, userId?: number): Promise<any[]> {
    const userIdParam = userId || this.getUserId()
    const response = await fetch(`${API_BASE}/chat/${chatId}/messages?userId=${userIdParam}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    if (result.code === 0 && result.data) {
      return result.data
    }
    return []
  }

  /**
   * 获取用户ID（从localStorage或默认值）
   */
  private getUserId(): number {
    try {
      const userInfoStr = localStorage.getItem('userInfo')
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr)
        return userInfo.userId || 1
      }
    } catch (e) {
      console.warn('获取用户ID失败:', e)
    }
    return 1
  }
}

export const apiService = new ExternalApiService()
