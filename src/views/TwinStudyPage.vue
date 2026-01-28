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
import { ref, computed, onMounted, watch } from 'vue'
import Sidebar from '../components/TwinStudy/Sidebar.vue'
import MainContent from '../components/TwinStudy/MainContent.vue'
import { apiService } from '../services/twinStudy/apiService'

// 状态管理
const isSidebarOpen = ref(true)
const sessions = ref([])
const currentSessionId = ref(null)
const modelMode = ref('fast')
const currentAbortController = ref(null)

// 获取用户ID
const getUserId = () => {
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

const currentUserId = getUserId()
const STORAGE_KEY = `bailian_sessions_${currentUserId}`

// 计算属性
const currentSession = computed(() => {
  return sessions.value.find(s => s.id === currentSessionId.value)
})

// 方法
const startNewChat = () => {
  currentSessionId.value = null
}

const selectSession = async (id) => {
  if (id === currentSessionId.value) {
    return
  }
  
  currentSessionId.value = id
  const session = sessions.value.find(s => s.id === id)
  
  if (session && session.chat_id) {
    // 加载历史消息
    await loadHistoryMessages(session.chat_id, id)
  }
}

// 加载历史消息
const loadHistoryMessages = async (chatId, sessionId) => {
  try {
    const messages = await apiService.getChatMessages(chatId, currentUserId)
    
    if (messages && messages.length > 0) {
      // 转换消息格式
      const formattedMessages = messages.map(msg => ({
        id: `${msg.id || Date.now()}-${msg.role}`,
        role: msg.role === 'user' ? 'user' : 'model',
        content: msg.content || '',
        timestamp: msg.createTime ? new Date(msg.createTime) : new Date(),
        thought: msg.thought || '',
        workflow: msg.workflow,
        references: msg.references || [],
        knowledgeBase: msg.knowledgeBase || '',
        isStreaming: false
      }))
      
      // 更新会话的消息列表
      sessions.value = sessions.value.map(s => 
        s.id === sessionId 
          ? { ...s, messages: formattedMessages }
          : s
      )
      
      // 保存到localStorage
      saveSessionsToStorage()
    }
  } catch (error) {
    console.error('加载历史消息失败:', error)
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
    // 创建新会话
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
      console.error("Failed to initialize chat session", err)
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
  if (!targetSession) return
  
  let chatId = targetSession.chat_id

  if (!chatId) {
    try {
      chatId = await apiService.getChatId()
      sessions.value = sessions.value.map(s => 
        s.id === activeSessionId ? { ...s, chat_id: chatId } : s
      )
      saveSessionsToStorage()
    } catch (err) {
      console.error("Failed to initialize chat session", err)
      const errorMsg = {
        id: Date.now().toString() + '-error',
        role: 'model',
        content: `Failed to initialize session: ${err.message}.`,
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
    let rawText = ''
    let thoughtText = '' // 单独跟踪思考内容
    let isInThinking = false // 是否在思考标签内
    let currentWorkflow = undefined
    let lastNodeId = ''
    let references = []
    let knowledgeBase = ''

    // 创建新的AbortController
    const abortController = new AbortController()
    currentAbortController.value = abortController

    const stream = apiService.streamChat(chatId, content, abortController.signal)

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
        const content = chunk.content
        
        // 检查是否是独立的闭合标签（只有 </think>）
        // 注意：必须是完全独立的，trim后就是闭合标签
        const trimmedContent = content.trim()
        if (trimmedContent === '</think>') {
          // 闭合标签，结束思考状态
          isInThinking = false
          // 不添加到 rawText，因为这是思考内容的结束标记
          continue
        }
        
        // 检查是否包含开始标签
        if (content.includes('<think>')) {
          isInThinking = true
          // 移除开始标签，提取标签后的内容
          const afterTag = content.replace(/<think>/, '')
          if (afterTag.trim()) {
            thoughtText += afterTag
          }
          continue
        }
        
        // 检查是否包含闭合标签（但不是独立的，说明标签被分割了）
        if (content.includes('</think>')) {
          // 提取闭合标签前的内容
          const beforeClose = content.split('</think>')[0]
          if (beforeClose.trim()) {
            thoughtText += beforeClose
          }
          isInThinking = false
          // 闭合标签后的内容添加到显示内容
          const afterClose = content.split('</think>').slice(1).join('</think>')
          if (afterClose.trim()) {
            rawText += afterClose
          }
          continue
        }
        
        // 如果在思考标签内，添加到思考内容
        if (isInThinking) {
          thoughtText += content
        } else {
          // 否则添加到显示内容
          rawText += content
        }
      }

      // 清理编码并移除 <details> 标签（通常用于调试信息）
      const cleanedThought = thoughtText
        .replace(/&#32;/g, ' ')
        .replace(/&#92n/g, '\n')
        .replace(/<details>[\s\S]*?<\/details>/gi, '')
        .trim()
      
      const cleanedDisplay = rawText
        .replace(/&#32;/g, ' ')
        .replace(/&#92n/g, '\n')
        .replace(/<details>[\s\S]*?<\/details>/gi, '')
        .trim()
      
      const thoughtContent = cleanedThought
      const displayContent = cleanedDisplay

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

// 保存会话列表到localStorage
const saveSessionsToStorage = () => {
  try {
    // 只保存必要的字段，避免存储过大的数据
    const sessionsToSave = sessions.value.map(s => ({
      id: s.id,
      chat_id: s.chat_id,
      title: s.title,
      updatedAt: s.updatedAt,
      lastMessageTime: s.lastMessageTime,
      // 不保存消息内容，消息从后端加载
      messageCount: s.messages?.length || 0
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionsToSave))
  } catch (error) {
    console.error('保存会话列表失败:', error)
  }
}

// 从localStorage加载会话列表
const loadSessionsFromStorage = () => {
  try {
    const savedSessions = localStorage.getItem(STORAGE_KEY)
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions)
      // 按最后消息时间排序
      parsed.sort((a, b) => new Date(b.lastMessageTime || b.updatedAt) - new Date(a.lastMessageTime || a.updatedAt))
      sessions.value = parsed.map(s => ({
        ...s,
        messages: [], // 消息列表为空，切换会话时会从后端加载
        updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date()
      }))
    }
  } catch (error) {
    console.error('加载会话列表失败:', error)
    sessions.value = []
  }
}

// 注意：消息内容不保存到localStorage，只保存会话基本信息
// 消息内容在切换会话时从后端加载

onMounted(() => {
  loadSessionsFromStorage()
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
