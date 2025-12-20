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
      />
      <MainContent 
        :currentSession="currentSession"
        :modelMode="modelMode"
        :setModelMode="setModelMode"
        :onSendMessage="sendMessage"
        :isSidebarOpen="isSidebarOpen"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '../components/TwinStudy/Sidebar.vue'
import MainContent from '../components/TwinStudy/MainContent.vue'
import { apiService } from '../services/twinStudy/apiService'

// 状态管理
const isSidebarOpen = ref(true)
const sessions = ref([])
const currentSessionId = ref(null)
const modelMode = ref('fast')

// 计算属性
const currentSession = computed(() => {
  return sessions.value.find(s => s.id === currentSessionId.value)
})

// 方法
const startNewChat = () => {
  currentSessionId.value = null
}

const selectSession = (id) => {
  currentSessionId.value = id
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
    const newId = Date.now().toString()
    const newSession = {
      id: newId,
      title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
      messages: [userMessage],
      updatedAt: new Date()
    }
    sessions.value = [newSession, ...sessions.value]
    activeSessionId = newId
    currentSessionId.value = newId
  } else {
    sessions.value = sessions.value.map(s => 
      s.id === activeSessionId 
        ? { ...s, messages: [...s.messages, userMessage], updatedAt: new Date() } 
        : s
    )
  }

  let targetSession = sessions.value.find(s => s.id === activeSessionId) || { id: activeSessionId, messages: [userMessage] }
  let chatId = targetSession.chat_id

  if (!chatId) {
    try {
      chatId = await apiService.getChatId()
      sessions.value = sessions.value.map(s => 
        s.id === activeSessionId ? { ...s, chat_id: chatId } : s
      )
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
    let currentWorkflow = undefined
    let lastNodeId = ''
    let references = []
    let knowledgeBase = ''

    const stream = apiService.streamChat(chatId, content)

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
        rawText += chunk.content
      }

      let displayContent = rawText
      let thoughtContent = ''
      
      const thinkMatch = rawText.match(/<think>([\s\S]*?)(?:<\/think>|$)/)
      if (thinkMatch) {
        thoughtContent = thinkMatch[1]
        displayContent = rawText.replace(/<think>[\s\S]*?(?:<\/think>|$)/, '').trim()
      }

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
              ) 
            } 
          : s
      )
    }

    sessions.value = sessions.value.map(s => 
      s.id === activeSessionId 
        ? { 
            ...s, 
            messages: s.messages.map(m => 
              m.id === modelMessage.id ? { ...m, isStreaming: false } : m
            ) 
          } 
        : s
    )
  } catch (error) {
    console.error("Streaming error:", error)
    sessions.value = sessions.value.map(s => 
      s.id === activeSessionId 
        ? { 
            ...s, 
            messages: s.messages.map(m => 
              m.id === modelMessage.id ? { ...m, content: m.content + `\n\n[Error: ${error.message}]`, isStreaming: false } : m
            ) 
          } 
        : s
    )
  }
}

onMounted(() => {
  sessions.value = []
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
