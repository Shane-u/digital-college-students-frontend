<template>
  <div class="twin-study-page">
    <div class="flex h-screen w-full bg-white overflow-hidden text-[#1f1f1f]">
      <Sidebar 
        :isOpen="isSidebarOpen" 
        :toggleOpen="() => isSidebarOpen = !isSidebarOpen"
        :sessions="sessions"
        :currentSessionId="currentSessionId"
        :onNewChat="startNewChat"
        :onSelectSession="selectSession"
        @updateSession="handleUpdateSession"
        @deleteSession="handleDeleteSession"
        @deleteSessions="handleDeleteSessions"
      />
      <MainContent 
        :currentSession="currentSession"
        :modelMode="modelMode"
        :setModelMode="setModelMode"
        :onSendMessage="sendMessage"
        :onAbortStream="abortCurrentStream"
        :isSidebarOpen="isSidebarOpen"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Sidebar from '../components/TwinStudy/Sidebar.vue'
import MainContent from '../components/TwinStudy/MainContent.vue'
import { apiService } from '../services/twinStudy/apiService'

// 状态管理
const isSidebarOpen = ref(true)
const sessions = ref([])
const currentSessionId = ref(null)
const modelMode = ref('fast')
const currentAbortController = ref(null)

// 获取用户ID（与 bailianChatApi.js 保持一致）
const getUserId = () => {
  try {
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr)
      // 尝试多种可能的字段：id, userId
      return userInfo.id ?? userInfo.userId ?? 1
    }
  } catch (e) {
    console.warn('获取用户ID失败:', e)
  }
  return 1
}

// 解析后端返回的内容，将 <think>...</think> 部分拆分为思考过程 + 对外展示内容
// 确保「首次流式展示」与「刷新后通过历史接口展示」的内容一致
const splitThinkingContent = (source) => {
  if (!source) {
    return { display: '', thought: '' }
  }

  // 先做统一的解码和清洗
  let text = String(source)
    .replace(/&#32;/g, ' ')
    .replace(/&#92n/g, '\n')

  let display = ''
  let thought = ''
  let inThinking = false
  let i = 0

  while (i < text.length) {
    const openIdx = text.indexOf('<think>', i)
    const closeIdx = text.indexOf('</think>', i)

    if (!inThinking) {
      if (openIdx === -1) {
        // 后面再也没有 <think>，全部当作展示内容
        display += text.slice(i)
        break
      }
      // 先把 <think> 之前的内容当作展示内容
      display += text.slice(i, openIdx)
      inThinking = true
      i = openIdx + '<think>'.length
    } else {
      if (closeIdx === -1) {
        // 没有闭合标签，全部当作思考内容
        thought += text.slice(i)
        break
      }
      thought += text.slice(i, closeIdx)
      inThinking = false
      i = closeIdx + '</think>'.length
    }
  }

  const stripDetails = (s) =>
    s
      .replace(/<details>[\s\S]*?<\/details>/gi, '')
      .trim()

  return {
    display: stripDetails(display),
    thought: stripDetails(thought)
  }
}

// 注意：currentUserId 在模块加载时计算，如果用户登录后 userInfo 更新，需要刷新页面
// 如果需要动态获取，应该每次都调用 getUserId()，而不是使用常量
const currentUserId = getUserId()
console.log('[TwinStudyPage] 当前用户ID:', currentUserId)
const STORAGE_KEY = `bailian_sessions_${currentUserId}`

// 计算属性
const currentSession = computed(() => {
  return sessions.value.find(s => s.id === currentSessionId.value)
})

// 方法：点击「新的对话」时只清除当前会话，不创建新会话
// 等用户发送第一条消息时，才创建会话并添加到列表，标题根据消息内容命名
const startNewChat = () => {
  currentSessionId.value = null
  saveSessionsToStorage()
}

const selectSession = async (id) => {
  if (id === currentSessionId.value) {
    return
  }
  
  console.log('[selectSession] 选择会话，id:', id)
  currentSessionId.value = id
  const session = sessions.value.find(s => s.id === id)
  
  if (!session) {
    console.warn('[selectSession] 未找到会话，id:', id)
    ElMessage.warning('未找到该会话')
    return
  }
  
  console.log('[selectSession] 找到会话:', session)
  
  if (session.chat_id) {
    // 加载历史消息
    await loadHistoryMessages(session.chat_id, id)
  } else {
    console.warn('[selectSession] 会话缺少 chat_id，无法加载历史消息，session:', session)
    ElMessage.warning('该会话缺少会话ID，无法加载历史消息')
  }
}

// 加载历史消息（始终用接口结果更新会话 messages，含空数组）
const loadHistoryMessages = async (chatId, sessionId) => {
  if (!chatId || String(chatId).trim() === '') {
    console.warn('[loadHistoryMessages] chatId 为空，sessionId:', sessionId)
    ElMessage.warning('会话ID无效，无法加载历史消息')
    return
  }
  
  // 每次都重新获取用户ID，确保使用最新的 userInfo
  const userId = getUserId()
  console.log('[loadHistoryMessages] 开始加载历史消息，chatId:', chatId, 'sessionId:', sessionId, 'userId:', userId)
  
  try {
    const messages = await apiService.getChatMessages(chatId, userId)
    console.log('[loadHistoryMessages] 获取到消息列表:', messages)
    
    const rawList = Array.isArray(messages) ? messages : []

    // 去重：如果后端连续保存了两条完全相同的助手消息，只展示一条，避免“回答两次”
    const deduped = []
    for (const msg of rawList) {
      const prev = deduped[deduped.length - 1]
      if (
        prev &&
        prev.role !== 'user' &&
        msg.role !== 'user' &&
        (prev.content || '').trim() === (msg.content || '').trim()
      ) {
        continue
      }
      deduped.push(msg)
    }

    console.log('[loadHistoryMessages] 去重后消息数量:', deduped.length)
    
    const formattedMessages = deduped.map(msg => {
      const isUser = msg.role === 'user'
      let content = msg.content || ''
      let thought = msg.thought || ''

      // 对助手消息统一做一次 <think> 拆分，保证和流式展示一致
      if (!isUser && content) {
        const parsed = splitThinkingContent(content)
        content = parsed.display
        thought = parsed.thought
      }

      return {
        id: `${msg.id || Date.now()}-${msg.role}`,
        role: isUser ? 'user' : 'model',
        content,
        timestamp: msg.createTime ? new Date(msg.createTime) : new Date(),
        thought,
        workflow: msg.workflow,
        references: msg.references || [],
        knowledgeBase: msg.knowledgeBase || '',
        isStreaming: false
      }
    })
    
    sessions.value = sessions.value.map(s =>
      s.id === sessionId ? { ...s, messages: formattedMessages } : s
    )
    saveSessionsToStorage()
    
    if (deduped.length === 0) {
      console.log('[loadHistoryMessages] 该会话暂无历史消息')
    }
  } catch (error) {
    console.error('[loadHistoryMessages] 加载历史消息失败:', error)
    ElMessage.error(`加载历史消息失败: ${error?.message || '请检查网络连接或稍后重试'}`)
  }
}

const setModelMode = (mode) => {
  modelMode.value = mode
}

const sendMessage = async (content) => {
  let activeSessionId = currentSessionId.value
  
  const userMessage = {
    id: Date.now().toString() + '-user',
    role: 'user',
    content,
    timestamp: new Date()
  }

  if (!activeSessionId) {
    // 无当前会话时先创建（POST /bailian/chat/create），再在该 session 下聊天才会持久化
    try {
      const chatId = await apiService.getChatId()
      const newId = Date.now().toString()
      const newSession = {
        id: newId,
        chat_id: chatId,
        title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
        messages: [userMessage],
        updatedAt: new Date(),
        lastMessageTime: new Date().toISOString()
      }
      sessions.value = [newSession, ...sessions.value]
      activeSessionId = newId
      currentSessionId.value = newId
      saveSessionsToStorage()
    } catch (err) {
      console.error('创建会话失败:', err)
      ElMessage.error(err?.message || '创建会话失败，请重试')
      return
    }
  } else {
    sessions.value = sessions.value.map(s => 
      s.id === activeSessionId 
        ? { ...s, messages: [...s.messages, userMessage], updatedAt: new Date(), lastMessageTime: new Date().toISOString() } 
        : s
    )
    saveSessionsToStorage()
  }

  let targetSession = sessions.value.find(s => s.id === activeSessionId)
  if (!targetSession) {
    console.error('[sendMessage] 未找到目标会话，activeSessionId:', activeSessionId)
    return
  }
  
  let chatId = targetSession.chat_id
  console.log('[sendMessage] 准备发送消息，chatId:', chatId, 'sessionId:', activeSessionId)

  if (!chatId) {
    console.log('[sendMessage] 会话缺少 chatId，正在创建...')
    try {
      chatId = await apiService.getChatId()
      console.log('[sendMessage] 创建成功，chatId:', chatId)
      sessions.value = sessions.value.map(s =>
        s.id === activeSessionId ? { ...s, chat_id: chatId } : s
      )
      saveSessionsToStorage()
    } catch (err) {
      console.error('[sendMessage] 创建会话失败:', err)
      ElMessage.error(err?.message || '创建会话失败，请重试')
      const errorMsg = {
        id: Date.now().toString() + '-error',
        role: 'model',
        content: `创建会话失败：${err?.message || '请重试'}`,
        timestamp: new Date()
      }
      sessions.value = sessions.value.map(s =>
        s.id === activeSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s
      )
      saveSessionsToStorage()
      return
    }
  }

  const modelMessage = {
    id: Date.now().toString() + '-model',
    role: 'model',
    content: '',
    thought: '',
    timestamp: new Date(),
    isStreaming: true
  }

  sessions.value = sessions.value.map(s => 
    s.id === activeSessionId 
      ? { ...s, messages: [...s.messages, modelMessage], updatedAt: new Date() } 
      : s
  )

  try {
    let fullText = '' // 后端流式返回的原始内容累积
    let currentWorkflow = undefined
    let lastNodeId = ''
    let references = []
    let knowledgeBase = ''

    // 创建新的AbortController
    const abortController = new AbortController()
    currentAbortController.value = abortController

    // 每次都重新获取用户ID，确保使用最新的 userInfo
    const userId = getUserId()
    console.log('[sendMessage] 调用流式接口，chatId:', chatId, 'userId:', userId, 'content:', content.substring(0, 50))
    const stream = apiService.streamChat(chatId, content, abortController.signal, userId)

    for await (const chunk of stream) {
      if (chunk.node_id) lastNodeId = chunk.node_id

      if (chunk.node_dict && chunk.node_dict.nodes) {
        currentWorkflow = {
          nodes: chunk.node_dict.nodes,
          edges: chunk.node_dict.edges || []
        }
      }

      if (chunk.knowledge) knowledgeBase = chunk.knowledge
      if (chunk.references) references = chunk.references

      if (chunk.content && typeof chunk.content === 'string') {
        fullText += chunk.content
      }

      const { display: displayContent, thought: thoughtContent } = splitThinkingContent(fullText)

    sessions.value = sessions.value.map(s => 
      s.id === activeSessionId 
        ? { 
            ...s, 
            messages: s.messages.map(m => 
              m.id === modelMessage.id ? { 
                ...m, 
                content: displayContent,
                thought: thoughtContent,
                workflow: currentWorkflow || m.workflow,
                currentNodeId: lastNodeId,
                references: references.length > 0 ? references : m.references,
                knowledgeBase: knowledgeBase || m.knowledgeBase
              } : m
            ),
            updatedAt: new Date(),
            lastMessageTime: new Date().toISOString()
          } 
        : s
    )
    
    // 保存到localStorage
    saveSessionsToStorage()
    }

    sessions.value = sessions.value.map(s => 
      s.id === activeSessionId 
        ? { 
            ...s, 
            messages: s.messages.map(m => 
              m.id === modelMessage.id ? { ...m, isStreaming: false } : m
            ),
            updatedAt: new Date(),
            lastMessageTime: new Date().toISOString()
          } 
        : s
    )
    
    // 保存到localStorage
    saveSessionsToStorage()
    
    // 流式传输完成，清除AbortController
    currentAbortController.value = null
  } catch (error) {
    console.error("Streaming error:", error)
    const errorMessage = error.name === 'AbortError' || (currentAbortController.value?.signal.aborted)
      ? '已取消'
      : `错误: ${error.message}`
    
    sessions.value = sessions.value.map(s => 
      s.id === activeSessionId 
        ? { 
            ...s, 
            messages: s.messages.map(m => 
              m.id === modelMessage.id ? { ...m, content: m.content + (m.content ? `\n\n[${errorMessage}]` : `[${errorMessage}]`), isStreaming: false } : m
            ) 
          } 
        : s
    )
    
    // 错误后清除AbortController
    currentAbortController.value = null
  }
}

// 终止当前流式传输
const abortCurrentStream = () => {
  if (currentAbortController.value) {
    currentAbortController.value.abort()
    currentAbortController.value = null
    
    // 更新当前会话的流式消息状态
    if (currentSessionId.value) {
      sessions.value = sessions.value.map(s => 
        s.id === currentSessionId.value 
          ? { 
              ...s, 
              messages: s.messages.map(m => 
                m.isStreaming ? { ...m, isStreaming: false } : m
              ) 
            } 
          : s
      )
    }
  }
}

const handleUpdateSession = (updatedSession) => {
  sessions.value = sessions.value.map(s => 
    s.id === updatedSession.id ? updatedSession : s
  )
  saveSessionsToStorage()
}

const handleDeleteSession = (sessionId) => {
  sessions.value = sessions.value.filter(s => s.id !== sessionId)
  if (currentSessionId.value === sessionId) {
    currentSessionId.value = null
  }
  saveSessionsToStorage()
}

const handleDeleteSessions = (sessionIds) => {
  sessions.value = sessions.value.filter(s => !sessionIds.includes(s.id))
  if (sessionIds.includes(currentSessionId.value)) {
    currentSessionId.value = null
  }
  saveSessionsToStorage()
}

// 保存会话列表与当前会话ID到localStorage
const saveSessionsToStorage = () => {
  try {
    const sessionsToSave = sessions.value.map(s => ({
      id: s.id,
      chat_id: s.chat_id,
      title: s.title,
      updatedAt: s.updatedAt,
      lastMessageTime: s.lastMessageTime,
      messageCount: s.messages?.length || 0
    }))
    const payload = {
      sessions: sessionsToSave,
      currentSessionId: currentSessionId.value
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch (error) {
    console.error('保存会话列表失败:', error)
  }
}

// 从localStorage加载会话列表并恢复当前会话ID（兼容旧格式：纯数组）
const loadSessionsFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    const list = Array.isArray(parsed) ? parsed : (parsed?.sessions ?? [])
    if (!Array.isArray(list) || list.length === 0) return
    list.sort((a, b) => new Date(b.lastMessageTime || b.updatedAt) - new Date(a.lastMessageTime || a.updatedAt))
    const ids = new Set(list.map(s => s.id))
    sessions.value = list.map(s => ({
      ...s,
      messages: [],
      updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date()
    }))
    const restored = Array.isArray(parsed) ? null : (parsed?.currentSessionId ?? null)
    if (restored != null && ids.has(restored)) {
      currentSessionId.value = restored
    }
  } catch (error) {
    console.error('加载会话列表失败:', error)
    sessions.value = []
  }
}

onMounted(async () => {
  loadSessionsFromStorage()
  const sid = currentSessionId.value
  if (!sid) return
  const session = sessions.value.find(s => s.id === sid)
  if (session?.chat_id) {
    await loadHistoryMessages(session.chat_id, sid)
  }
})
</script>

<style scoped>
.twin-study-page {
  min-height: 100vh;
  background: white;
}

.flex {
  display: flex;
}

.h-screen {
  height: 100vh;
}

.w-full {
  width: 100%;
}

.bg-white {
  background-color: white;
}

.overflow-hidden {
  overflow: hidden;
}

.text-\[\#1f1f1f\] {
  color: #1f1f1f;
}
</style>
