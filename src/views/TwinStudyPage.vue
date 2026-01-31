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
        :streamingContent="streamingContent"
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
import { ref, computed, onMounted, nextTick, provide } from 'vue'
import { ElMessage } from 'element-plus'
import Sidebar from '../components/TwinStudy/Sidebar.vue'
import MainContent from '../components/TwinStudy/MainContent.vue'
import { apiService } from '../services/twinStudy/apiService'
import { renderMarkdownToHtml } from '../utils/markdownRender'

// 状态管理
const isSidebarOpen = ref(true)
const sessions = ref([])
const currentSessionId = ref(null)
const modelMode = ref('fast')
const currentAbortController = ref(null)
// 流式输出时实时显示的 Markdown 文本（仍用于非直接 DOM 时的回退）
const streamingContent = ref('')
// 流式消息内容 DOM 元素 ref，参考 bailian-chat.demo 在循环内直接设置 innerHTML 实现边输出边渲染
const streamingContentElRef = ref(null)
provide('streamingContentElRef', streamingContentElRef)

// ============ 内容处理函数 ============
/**
 * 解析流式数据：提取内容、思考过程、知识来源
 * 返回 structured object: { content, thought, knowledgeParagraphs }
 */
const parseStreamData = (text) => {
  if (!text) return { content: '', thought: '', knowledgeParagraphs: [] }

  let tempContent = text
  let knowledgeParagraphs = []
  
  // 辅助函数：将 Python 字典格式转换为 JSON 格式
  const convertPythonDictToJson = (str) => {
    try {
      // 先尝试直接解析（可能已经是 JSON）
      return JSON.parse(str)
    } catch (e) {
      // 如果不是 JSON，尝试转换 Python 字典格式
      let jsonStr = str.trim()
      
      // 方法1: 使用更智能的正则表达式替换
      // 替换键的单引号: 'key': -> "key":
      jsonStr = jsonStr.replace(/'([a-zA-Z_][a-zA-Z0-9_]*)':/g, '"$1":')
      
      // 替换字符串值的单引号，但要小心处理字符串中的单引号
      // 匹配 : '...' 模式，但要注意字符串中可能包含转义的单引号
      // 使用负向前瞻来避免匹配字符串中的单引号
      jsonStr = jsonStr.replace(/: '((?:[^'\\]|\\.)*)'/g, (match, content) => {
        // 转义内容中的双引号
        const escaped = content.replace(/"/g, '\\"')
        return `: "${escaped}"`
      })
      
      // 处理空字符串值
      jsonStr = jsonStr.replace(/: ''/g, ': ""')
      
      // 处理布尔值和 null
      jsonStr = jsonStr.replace(/: True/g, ': true')
      jsonStr = jsonStr.replace(/: False/g, ': false')
      jsonStr = jsonStr.replace(/: None/g, ': null')
      
      try {
        return JSON.parse(jsonStr)
      } catch (e2) {
        // 如果还是失败，尝试更简单但可能不完美的替换
        console.warn('[convertPythonDictToJson] 智能替换失败，尝试简单替换')
        const simpleJson = jsonStr.replace(/'/g, '"')
        try {
          return JSON.parse(simpleJson)
        } catch (e3) {
          // 最后尝试：使用 Function 构造器（相对安全，因为只处理数据结构）
          if (jsonStr.trim().startsWith('[') || jsonStr.trim().startsWith('{')) {
            try {
              // 创建一个安全的执行环境
              const func = new Function('return ' + jsonStr.replace(/'/g, '"'))
              const result = func()
              console.log('[convertPythonDictToJson] 使用 Function 构造器成功')
              return result
            } catch (e4) {
              throw new Error(`无法解析 JSON 格式: ${e4.message}`)
            }
          }
          throw e3
        }
      }
    }
  }
  
  // 1. 提取并移除 outputList (知识来源 JSON)
  const outputListPattern = /<details><summary>(outputList(?:\.output)?)<\/summary>([\s\S]*?)<\/details>/g
  let match
  
  while ((match = outputListPattern.exec(text)) !== null) {
      const summary = match[1]
      const content = match[2]
      if (summary === 'outputList') {
          try {
              let parsed
              const contentStr = content.trim()
              
              // 尝试使用改进的转换函数
              try {
                parsed = convertPythonDictToJson(contentStr)
              } catch (e) {
                // 如果转换失败，尝试直接使用 Function 构造器解析 Python 字典格式
                console.warn('[parseStreamData] JSON 解析失败，尝试使用 Function 构造器:', e.message)
                try {
                  // 对于 Python 字典格式，使用 Function 构造器是最可靠的方法
                  // 因为 Python 字典和 JavaScript 对象语法几乎相同，只是引号不同
                  const func = new Function('return ' + contentStr)
                  parsed = func()
                  console.log('[parseStreamData] Function 构造器解析成功')
                } catch (funcError) {
                  // 如果 Function 也失败，尝试简单替换（可能会破坏某些内容）
                  console.warn('[parseStreamData] Function 构造器也失败，尝试简单替换:', funcError.message)
                  const simpleJson = contentStr.replace(/'/g, '"')
                  parsed = JSON.parse(simpleJson)
                }
              }
              
              console.log('[parseStreamData] 解析outputList成功，类型:', Array.isArray(parsed) ? 'Array' : typeof parsed, '长度:', Array.isArray(parsed) ? parsed.length : 'N/A')
              
              if (Array.isArray(parsed)) {
                  parsed.forEach((p, idx) => {
                      // 检查是否已存在（通过id或document_name+content组合）
                      const exists = knowledgeParagraphs.some(kp => 
                          (kp.id && p.id && kp.id === p.id) || 
                          (kp.document_name === p.document_name && kp.content === p.content)
                      )
                      if (!exists) {
                          knowledgeParagraphs.push(p)
                          console.log(`[parseStreamData] 添加知识段落 ${idx + 1}:`, {
                              id: p.id,
                              document_name: p.document_name,
                              content_length: p.content?.length || 0
                          })
                      }
                  })
              } else if (typeof parsed === 'object' && parsed !== null) {
                  // 如果不是数组但是对象，尝试提取可能的数组字段
                  console.log('[parseStreamData] outputList不是数组，尝试查找数组字段')
                  Object.keys(parsed).forEach(key => {
                      if (Array.isArray(parsed[key])) {
                          parsed[key].forEach(p => {
                              const exists = knowledgeParagraphs.some(kp => 
                                  (kp.id && p.id && kp.id === p.id) || 
                                  (kp.document_name === p.document_name && kp.content === p.content)
                              )
                              if (!exists) {
                                  knowledgeParagraphs.push(p)
                              }
                          })
                      }
                  })
              }
          } catch (e) {
              console.warn('[parseStreamData] 解析outputList失败:', e.message, '原始内容前200字符:', content.substring(0, 200))
              // 所有解析方法都失败了，记录错误但不中断流程
          }
      }
  }
  tempContent = tempContent.replace(outputListPattern, '').trim()
  
  console.log('[parseStreamData] 最终提取的knowledgeParagraphs数量:', knowledgeParagraphs.length)

  // 2. 提取并移除 <think> 块
  // 支持未闭合的 <think> (流式传输中)
  let thought = ''
  
  // 优先匹配完整的 <think>...</think>
  const fullThinkPattern = /<think>([\s\S]*?)<\/think>/g
  const thinkBlocks = []
  let thinkMatch
  
  if (fullThinkPattern.test(tempContent)) {
    // 重置 lastIndex
    fullThinkPattern.lastIndex = 0
    while ((thinkMatch = fullThinkPattern.exec(tempContent)) !== null) {
        thinkBlocks.push(thinkMatch[0])
    }
    
    // 使用倒数第二个或第一个 think 块 (Agent 逻辑)
    if (thinkBlocks.length >= 2) {
        thought = thinkBlocks[thinkBlocks.length - 2].replace(/<think>|<\/think>/g, '').trim()
    } else if (thinkBlocks.length === 1) {
        thought = thinkBlocks[0].replace(/<think>|<\/think>/g, '').trim()
    }
    tempContent = tempContent.replace(fullThinkPattern, '').trim()
  } else {
    // 如果没有完整的闭合块，检查是否有未闭合的 <think>
    // 这意味着整个 <think> 后面的内容都是思考过程，还没有结束
    const openThinkPattern = /<think>([\s\S]*)/
    const openMatch = openThinkPattern.exec(tempContent)
    if (openMatch) {
      thought = openMatch[1].trim() // 提取 <think> 之后的所有内容作为思考
      tempContent = tempContent.replace(openThinkPattern, '').trim() // 从正文中移除
    }
  }
  
  // 3. 去重逻辑 (X + X 模式)
  const len = tempContent.length
  if (len > 0 && len % 2 === 0) {
      const tempHalf = len / 2
      const firstHalf = tempContent.substring(0, tempHalf)
      const secondHalf = tempContent.substring(tempHalf)
      if (firstHalf.trim() === secondHalf.trim()) {
          tempContent = firstHalf.trim()
      }
  }

  return {
      content: tempContent,
      thought: thought,
      knowledgeParagraphs: knowledgeParagraphs
  }
}

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
      // 1. 基础转换 后端返回的 content 可能包含 <think> 和 outputList 等原始数据
      let content = msg.content || ''
      let thought = msg.thought || ''
      let knowledgeParagraphs = msg.knowledgeParagraphs || [] // 如果后端支持该字段
      
      // 2. 尝试从 content 中解析 thought 和 knowledge
      if (content && typeof content === 'string') {
         // 使用 parseStreamData 解析原始文本以提取 <think> 和 outputList
         const parsed = parseStreamData(content)
         console.log('[loadHistoryMessages] 解析消息，原始content长度:', content.length, '解析后的knowledgeParagraphs数量:', parsed.knowledgeParagraphs?.length || 0)
         content = parsed.content
         if (parsed.thought) {
             thought = parsed.thought
         }
         if (parsed.knowledgeParagraphs && parsed.knowledgeParagraphs.length > 0) {
             knowledgeParagraphs = parsed.knowledgeParagraphs
             console.log('[loadHistoryMessages] 提取到knowledgeParagraphs:', knowledgeParagraphs)
         }
      }

      return {
        id: `${msg.id || Date.now()}-${msg.role}`,
        role: msg.role === 'user' ? 'user' : 'model',
        content: content,
        timestamp: msg.createTime ? new Date(msg.createTime) : new Date(),
        thought: thought,
        workflow: msg.workflow,
        references: msg.references || [],
        knowledgeBase: msg.knowledgeBase || '',
        knowledgeParagraphs: knowledgeParagraphs,
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
  streamingContent.value = ''
  streamingContentElRef.value = null
  // 等 Vue 挂载流式消息的 div 并设置 ref 后再开始收 chunk，否则首 chunk 时 ref 可能为空
  await nextTick()

  try {
    // 只保留一份累积内容 rawContentForSave，流式与结束时都用它解析，保证渲染结果与最终一模一样（参考 demo）
    let rawContentForSave = ''
    let currentWorkflow = undefined
    let lastNodeId = ''
    let references = []
    let knowledgeBase = ''
    let isFirstData = true // 用于跳过第一个 data 事件

    // 创建新的AbortController
    const abortController = new AbortController()
    currentAbortController.value = abortController

    // 每次都重新获取用户ID，确保使用最新的 userInfo
    const userId = getUserId()
    console.log('[sendMessage] 调用流式接口，chatId:', chatId, 'userId:', userId, 'content:', content.substring(0, 50))
    const stream = apiService.streamChat(chatId, content, abortController.signal, userId)

    for await (const chunk of stream) {
      // 收集工作流和引用信息
      if (chunk.node_id) lastNodeId = chunk.node_id
      if (chunk.node_dict && chunk.node_dict.nodes) {
        currentWorkflow = {
          nodes: chunk.node_dict.nodes,
          edges: chunk.node_dict.edges || []
        }
      }
      if (chunk.knowledge) {
        knowledgeBase = chunk.knowledge
        const kStr = typeof chunk.knowledge === 'string' ? chunk.knowledge : JSON.stringify(chunk.knowledge)
        rawContentForSave += `\n\n<details><summary>outputList</summary>${kStr}</details>`
      }
      if (chunk.references) references = chunk.references

      // 处理内容块
      if (chunk.content && typeof chunk.content === 'string') {
        const decoded = chunk.content.replace(/&#32;/g, ' ').replace(/&#92n/g, '\n')
        if (isFirstData) {
          isFirstData = false
          continue
        }
        rawContentForSave += decoded
        // 与结束时一致：始终用 rawContentForSave 解析，保证流式渲染结果和最终一模一样
        const { content: cleanContent, thought, knowledgeParagraphs } = parseStreamData(rawContentForSave)
        if (streamingContentElRef.value) {
          streamingContentElRef.value.innerHTML = renderMarkdownToHtml(cleanContent)
        }
        streamingContent.value = cleanContent
        
        // 更新会话中的消息
        sessions.value = sessions.value.map(s =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: s.messages.map(m =>
                  m.id === modelMessage.id
                    ? {
                        ...m,
                        content: cleanContent,
                        thought: thought || m.thought, // 优先使用提取到的 thought
                        workflow: currentWorkflow || m.workflow,
                        currentNodeId: lastNodeId,
                        references: references.length > 0 ? references : m.references,
                        knowledgeBase: knowledgeBase || m.knowledgeBase,
                        // 合并知识来源，优先使用新解析的
                        knowledgeParagraphs: knowledgeParagraphs.length > 0 ? knowledgeParagraphs : (m.knowledgeParagraphs || [])
                      }
                    : m
                ),
                updatedAt: new Date(),
                lastMessageTime: new Date().toISOString()
              }
            : s
        )
        
        saveSessionsToStorage()
        // 让出主线程：nextTick 等 Vue 更新 DOM，setTimeout 等浏览器重绘后再处理下一 chunk
        await nextTick()
        await new Promise(r => setTimeout(r, 0))
      }
    }

    // 流式结束，再次解析完整的rawContentForSave以确保提取所有knowledgeParagraphs
    const finalParsed = parseStreamData(rawContentForSave)
    console.log('[sendMessage] 流式结束，最终解析的knowledgeParagraphs:', finalParsed.knowledgeParagraphs)
    
    streamingContent.value = ''
    streamingContentElRef.value = null
    
    // 流式结束，标记消息完成并更新最终解析的knowledgeParagraphs
    sessions.value = sessions.value.map(s =>
      s.id === activeSessionId
        ? {
            ...s,
            messages: s.messages.map(m =>
              m.id === modelMessage.id 
                ? { 
                    ...m, 
                    isStreaming: false,
                    // 使用最终解析的knowledgeParagraphs，确保完整
                    knowledgeParagraphs: finalParsed.knowledgeParagraphs.length > 0 
                      ? finalParsed.knowledgeParagraphs 
                      : (m.knowledgeParagraphs || []),
                    // 更新content和thought为最终解析的结果
                    content: finalParsed.content || m.content,
                    thought: finalParsed.thought || m.thought
                  } 
                : m
            ),
            updatedAt: new Date(),
            lastMessageTime: new Date().toISOString()
          }
        : s
    )

    saveSessionsToStorage()

    if (rawContentForSave && rawContentForSave.trim()) {
      await apiService.saveFinalMessage(chatId, rawContentForSave, userId)
    }

    // 流式传输完成，清除AbortController
    currentAbortController.value = null
  } catch (error) {
    console.error("Streaming error:", error)
    streamingContent.value = ''
    streamingContentElRef.value = null
    const errorMessage = error.name === 'AbortError' || (currentAbortController.value?.signal.aborted)
      ? '已取消'
      : `错误: ${error.message}`

    sessions.value = sessions.value.map(s =>
      s.id === activeSessionId
        ? {
            ...s,
            messages: s.messages.map(m =>
              m.id === modelMessage.id
                ? { ...m, content: m.content + (m.content ? `\n\n[${errorMessage}]` : `[${errorMessage}]`), isStreaming: false }
                : m
            )
          }
        : s
    )

    saveSessionsToStorage()

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

// 保存会话列表与当前会话ID到localStorage（仅元数据，不含消息内容）
const saveSessionsToStorage = () => {
  try {
    const sessionsToSave = sessions.value.map(s => ({
      id: s.id,
      chat_id: s.chat_id,
      title: s.title,
      updatedAt: s.updatedAt,
      lastMessageTime: s.lastMessageTime,
      messageCount: s.messages?.length || 0,
      // 不保存消息内容到本地，完全依赖后端
      messages: [] 
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

// 从localStorage加载会话列表并恢复当前会话ID
const loadSessionsFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    const list = Array.isArray(parsed) ? parsed : (parsed?.sessions ?? [])
    if (!Array.isArray(list) || list.length === 0) return
    list.sort((a, b) => new Date(b.lastMessageTime || b.updatedAt) - new Date(a.lastMessageTime || a.updatedAt))
    const ids = new Set(list.map(s => s.id))
    
    // 初始化会话列表，消息为空
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
