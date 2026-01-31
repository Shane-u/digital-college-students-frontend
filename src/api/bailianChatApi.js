/**
 * 百炼聊天列表接口（聊天记录持久化、建立新对话）
 * @see 接口/聊天列表接口.md
 */
import request from './request'

/**
 * 获取当前用户 ID
 * @returns {number}
 */
function getUserId() {
  try {
    const raw = localStorage.getItem('userInfo')
    if (raw) {
      const user = JSON.parse(raw)
      return user.id ?? user.userId ?? 1
    }
  } catch (e) {
    console.warn('bailianChatApi: 解析 userInfo 失败', e)
  }
  return 1
}

/**
 * 创建聊天会话（建立新对话）
 * POST /bailian/chat/create
 * @returns {Promise<{ chatId?: string; [key: string]: string }>} 返回 data（MapString），通常含 chatId
 * @throws 接口失败时由 request 拦截器统一处理
 */
export function createBailianChat() {
  return request({
    url: '/bailian/chat/create',
    method: 'post',
    data: {}
  })
}

/**
 * 获取会话的消息列表（聊天记录持久化）
 * GET /bailian/chat/{chatId}/messages?userId=
 * @param {Object} params
 * @param {string} params.chatId - 会话 ID（path）
 * @param {number} [params.userId] - 用户 ID（query），缺省时从 userInfo 取
 * @returns {Promise<Array<{ id?: string; sessionId?: string; userId?: number; role?: string; content?: string; imageUrls?: string[]; videoUrls?: string[]; createTime?: string }>>} 消息列表（ChatMessageVO[]）
 * @throws 接口失败时由 request 拦截器统一处理
 */
export function getBailianChatMessages(params) {
  const { chatId, userId } = params
  if (!chatId || String(chatId).trim() === '') {
    return Promise.reject(new Error('bailianChatApi.getBailianChatMessages: chatId 必填'))
  }
  const uid = userId ?? getUserId()
  return request({
    url: `/bailian/chat/${encodeURIComponent(String(chatId).trim())}/messages`,
    method: 'get',
    params: { userId: uid }
  })
}

