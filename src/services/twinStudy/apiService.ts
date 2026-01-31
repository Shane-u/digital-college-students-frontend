import { createBailianChat, getBailianChatMessages } from '../../api/bailianChatApi'

const API_BASE = '/api/bailian'

export class ExternalApiService {
  /**
   * 创建新的聊天会话
   * POST /bailian/chat/create
   * @returns Promise<string> 返回 chatId
   */
  async getChatId(): Promise<string> {
    const data = await createBailianChat()
    console.log('[apiService] 创建会话返回的 data:', data)
    
    if (!data || typeof data !== 'object') {
      throw new Error('创建会话返回的数据格式错误')
    }
    
    // 尝试多种可能的 key：chatId, id, sessionId, chat_id, 以及第一个非空字符串值
    const possibleKeys = ['chatId', 'id', 'sessionId', 'chat_id', 'chatId']
    for (const key of possibleKeys) {
      const value = (data as Record<string, unknown>)[key]
      if (value != null && String(value).trim() !== '') {
        const chatId = String(value).trim()
        console.log('[apiService] 从 data 中提取到 chatId:', chatId, 'key:', key)
        return chatId
      }
    }
    
    // 如果所有 key 都不匹配，尝试取第一个非空字符串值
    const entries = Object.entries(data)
    for (const [key, value] of entries) {
      if (value != null && String(value).trim() !== '') {
        const chatId = String(value).trim()
        console.log('[apiService] 使用第一个非空值作为 chatId:', chatId, 'key:', key)
        return chatId
      }
    }
    
    console.error('[apiService] 无法从返回数据中提取 chatId，data:', data)
    throw new Error(`创建会话成功但未返回 chatId，返回数据: ${JSON.stringify(data)}`)
  }

  /**
   * 流式发送聊天消息
   * @param chatId 会话ID
   * @param question 用户问题
   * @param signal AbortSignal 用于取消请求
   * @param userId 用户ID（可选，缺省时从 userInfo 取）
   * @yields 返回流式数据块，格式：{ content?: string, node_id?: string, node_dict?: any, knowledge?: string, references?: any[] }
   */
  async *streamChat(chatId: string, question: string, signal?: AbortSignal, userId?: number) {
    const uid = userId ?? this.getUserId()
    console.log('[apiService.streamChat] 调用流式接口，chatId:', chatId, 'userId:', uid, 'question:', question.substring(0, 50))
    
    const response = await fetch(`${API_BASE}/chat/stream/flux`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        chat_id: chatId, // 后端 DTO 使用 chat_id
        question: question,
        userId: uid, // 添加 userId，后端需要用它来保存消息
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

          if (decoded && decoded.includes('<think>') && decoded.includes('</think>')) {
              // 跳过这个聚合块的渲染，但已累积到 rawContentForSave
              continue;
          }

          // 过滤掉空内容或只有换行符的内容（重复的结束标记）
          // const trimmedDecoded = decoded.trim()
          // if (!trimmedDecoded || trimmedDecoded === '\n') {
          //   continue
          // }

          // 将解码后的文本内容包装成与原有格式兼容的对象
          // 原有代码期望：{ content?: string, node_id?: string, node_dict?: any, knowledge?: string, references?: any[] }
          yield {
            content: decoded
          }
          // 参考 bailian-chat.demo：每次 yield 后让出主线程，便于浏览器重绘，实现边输出边渲染
          await new Promise((r) => setTimeout(r, 0))
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
            yield { content: decoded }
          }
        } catch (e) {
          // 如果不是 JSON，则作为纯文本处理并解码
          const decoded = data
            .replace(/&#32;/g, ' ')
            .replace(/&#92n/g, '\n')
          // const trimmedDecoded = decoded.trim()
          // 过滤掉空内容
          // if (!trimmedDecoded || trimmedDecoded === '\n') {
          //   return
          // }
          yield { content: decoded }
        }
      }
    }
  }

  /**
   * 获取会话的历史消息（聊天记录持久化）
   * GET /bailian/chat/{chatId}/messages?userId=
   * @param chatId 会话ID
   * @param userId 用户ID（可选，缺省时从 userInfo 取）
   * @returns Promise<Array> 返回消息列表（ChatMessageVO[]）
   */
  async getChatMessages(chatId: string, userId?: number): Promise<any[]> {
    const list = await getBailianChatMessages({
      chatId,
      userId: userId ?? this.getUserId()
    })
    return Array.isArray(list) ? list : []
  }

  /**
   * 保存最终的助手回复到后端
   * POST /bailian/chat/save-final-message
   */
  async saveFinalMessage(chatId: string, finalContent: string, userId?: number): Promise<void> {
    const uid = userId ?? this.getUserId()
    try {
        console.log('[apiService] 开始保存最终消息，chatId:', chatId, 'length:', finalContent.length)
        const response = await fetch(`${API_BASE}/chat/save-final-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chatId: chatId,
                userId: uid,
                finalContent: finalContent
            })
        });
        
        const result = await response.json();
        if (result.code !== 0) {
            console.error('[apiService] 保存最终消息失败:', result.message);
        } else {
            console.log('[apiService] 最终消息保存成功');
        }
    } catch (e) {
        console.error('[apiService] 保存最终消息异常:', e);
    }
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
