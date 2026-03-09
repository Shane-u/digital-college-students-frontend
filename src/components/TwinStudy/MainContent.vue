<template>
  <div class="main-content">
    <header class="main-header">
      <div class="main-header-title">
        孪孪伴学<span class="main-header-disclaimer">（内容由AI生成，仅供参考）</span>
      </div>
      <div class="main-header-actions">
        <button @click="openFlashCardPage" class="header-action-btn flashcard-btn-wrapper" title="记忆闪卡">
          <!-- 进度条（环形）：生成中 或 已生成待查看 时都显示 -->
          <svg
            v-if="flashCardState.isGenerating.value || flashCardState.progress.value === 100"
            class="progress-ring"
            viewBox="0 0 36 36"
          >
            <circle
              class="progress-ring-circle"
              stroke="#CE89D1"
              stroke-width="3"
              fill="none"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="progressOffset"
              cx="18"
              cy="18"
              r="15"
            />
          </svg>
          <FlashCardHeaderIcon />
        </button>
        <div v-if="userAvatar" class="user-avatar-small">
          <img :src="userAvatar" alt="用户头像" class="user-avatar-img" />
        </div>
        <div v-else class="user-avatar-small">{{ userDisplayName }}</div>
      </div>
    </header>

    <div class="main-messages">
      <!-- 历史消息加载骨架屏：切换会话或恢复会话时展示，占据原对话区域 -->
      <div v-if="isLoading" class="skeleton-wrapper">
        <div class="skeleton-header">
          <div class="skeleton-pill skeleton-pill--short"></div>
          <div class="skeleton-pill skeleton-pill--long"></div>
        </div>
        <div class="skeleton-card">
          <div class="skeleton-line skeleton-line--title"></div>
          <div class="skeleton-line-group">
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line skeleton-line--short"></div>
          </div>
        </div>
        <div class="skeleton-card">
          <div class="skeleton-line skeleton-line--title"></div>
          <div class="skeleton-line-group">
            <div class="skeleton-line"></div>
            <div class="skeleton-line skeleton-line--medium"></div>
          </div>
        </div>
      </div>
      <div v-else-if="isStudyPathScene && (pathMessageList.length > 0 || isPathStreaming)" class="path-conversation-wrap">
        <LearningPathMessageList
          :messages="pathMessageList"
          @confirm="handlePathConfirm"
          @polish="focusPathInput"
        />
      </div>
      <div v-else-if="!currentSession || currentSession.messages.length === 0" class="welcome-screen">
        <div class="welcome-content">
          <div class="welcome-title">
            <SparklesIcon />
            <span>你好！{{ userName }}</span>
          </div>
          <div class="welcome-subtitle">
            <span>{{ welcomeSubtitleText }}</span>
          </div>
          <VintageCardGallery :scene="scene" @cardClick="handleCardClick" />
        </div>
      </div>
      <MessageList v-else :messages="currentSession.messages" :streamingContent="streamingContent" />
    </div>

    <div class="main-input-area">
      <div class="input-container">
        <div class="input-wrapper">
          <textarea
            ref="inputTextareaRef"
            v-model="inputValue"
            @keydown="handleKeyDown"
            :placeholder="placeholderText"
            rows="1"
            class="input-textarea"
            @input="handleInput"
          />
          
          <div class="input-footer">
            <div class="input-footer-left">
              <button class="input-icon-btn">
                <PlusIcon />
                <span class="tooltip">Add files</span>
              </button>
               <div class="keyboard-hint">
                <KeyboardIcon />
                <span>Enter 发送，Shift + Enter 换行</span>
              </div>
            </div>

            <div class="input-footer-right">
              <ModelSelector :mode="modelMode" :setMode="setModelMode" />
              <button 
                v-if="!isSending && !inputValue.trim()" 
                @click="toggleRecording" 
                class="input-icon-btn"
                :class="{ 'recording': isRecording }"
                :title="isRecording ? '停止录音' : '语音输入'"
              >
                <MicIcon />
              </button>
              <button 
                v-if="inputValue.trim() && !effectiveSending"
                @click="handleSend"
                class="send-button"
              >
                <ArrowRightIcon />
              </button>
              <button
                v-if="effectiveSending"
                @click="handleAbort"
                class="send-button stop-button"
                title="终止"
              >
                <StopCircleIcon />
              </button>
            </div>
          </div>
        </div>
        
        <div class="input-disclaimer">
          <!-- 内容由AI生成，仅供参考。 -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted, watch, computed } from 'vue'
import { h } from 'vue'
import { useRouter } from 'vue-router'
import MessageList from './MessageList.vue'
import LearningPathMessageList from '../LearningPath/LearningPathMessageList.vue'
import { useFlashCardGeneration } from '../../composables/useFlashCardGeneration'
import ModelSelector from './ModelSelector.vue'
import VintageCardGallery from './VintageCardGallery.vue'
import { getMyProfile } from '../../api/user'
import { normalizeProfile } from '../../utils/profile'

const SparklesIcon = () => h('svg', { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'currentColor', class: 'text-blue-500' }, [
  h('path', { d: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' })
])

const ArrowRightIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2.5 }, [
  h('line', { x1: 5, y1: 12, x2: 19, y2: 12 }),
  h('polyline', { points: '12 5 19 12 12 19' })
])

const PlusIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('line', { x1: 12, y1: 5, x2: 12, y2: 19 }),
  h('line', { x1: 5, y1: 12, x2: 19, y2: 12 })
])

const KeyboardIcon = () => h('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('rect', { x: 2, y: 6, width: 20, height: 12, rx: 2 }),
  h('line', { x1: 6, y1: 10, x2: 6, y2: 10 }),
  h('line', { x1: 10, y1: 10, x2: 10, y2: 10 }),
  h('line', { x1: 14, y1: 10, x2: 14, y2: 10 }),
  h('line', { x1: 18, y1: 10, x2: 18, y2: 10 })
])

const MicIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z' }),
  h('path', { d: 'M19 10v2a7 7 0 0 1-14 0v-2' }),
  h('line', { x1: 12, y1: 19, x2: 12, y2: 23 }),
  h('line', { x1: 8, y1: 23, x2: 16, y2: 23 })
])

const FLASHCARD_SVG_PATH = 'M688 925.504l-8.928-2.272a61.472 61.472 0 0 1-8.8-3.2 6.944 6.944 0 0 0-1.248-0.352 25.312 25.312 0 0 1-6.176-1.984c-3.424-1.664-6.4-1.696-10.048-3.2a25.6 25.6 0 0 0-6.4-1.984c-3.2-0.608-6.016-2.816-9.248-3.2a17.728 17.728 0 0 1-5.184-1.728 25.6 25.6 0 0 0-6.4-1.984c-3.2-0.576-6.016-2.72-9.184-3.2-3.904-0.576-7.392-2.944-11.68-3.808a27.456 27.456 0 0 1-6.208-2.304 4.704 4.704 0 0 0-0.96-0.352l-3.712-0.896q-8.672-2.624-55.936-18.56c-4.032-1.376-7.808-1.856-12.064-3.2q-26.624-9.28-53.024-17.888-3.424-1.12-5.536-1.568c-3.968-0.896-6.784-2.88-10.432-3.456s-7.104-3.2-11.2-3.808c-3.2-0.576-5.856-2.56-9.248-3.2s-6.912-2.88-10.752-3.584a17.888 17.888 0 0 1-4.896-1.568c-3.616-1.792-7.232-1.856-11.04-3.808a18.816 18.816 0 0 0-4.736-1.504 29.6 29.6 0 0 1-6.976-2.464 8.096 8.096 0 0 0-2.112-0.704c-4.384-0.832-7.712-2.784-11.648-3.744s-6.784-2.72-10.88-3.52a25.6 25.6 0 0 1-6.144-2.304 8.672 8.672 0 0 0-1.728-0.608c-7.488-1.728-16-4.896-23.328-7.328q-18.144-5.952-25.6-8.512a85.504 85.504 0 0 1-9.6-3.2 9.312 9.312 0 0 0-1.696-0.64 52.928 52.928 0 0 1-9.824-3.456 19.2 19.2 0 0 0-5.76-1.76 19.872 19.872 0 0 1-8.992-4.544 53.44 53.44 0 0 0-2.24-2.048 9.824 9.824 0 0 0-1.696-1.024l-4.832-2.368-0.288-0.192q-7.2-6.848-14.976-15.104a13.696 13.696 0 0 1-2.56-4 0.672 0.672 0 0 1 0-0.64 0.64 0.64 0 0 1 0.544-0.288h355.392a73.408 73.408 0 0 0 12.32-0.864 157.216 157.216 0 0 0 23.36-5.056q6.4-2.144 7.36-2.336a27.008 27.008 0 0 0 7.264-2.464q3.648-1.856 11.616-5.088a174.592 174.592 0 0 0 18.912-10.4c3.712-2.08 8.448-6.656 12.8-9.6a44.8 44.8 0 0 0 5.12-3.84 125.024 125.024 0 0 0 22.816-25.344 17.088 17.088 0 0 1 1.792-2.464 25.376 25.376 0 0 0 5.088-7.008 22.048 22.048 0 0 1 4.096-6.08 1.824 1.824 0 0 0 0.32-0.448l9.6-18.88a5.312 5.312 0 0 0 0.48-1.472l0.512-2.944a8 8 0 0 1 0.576-1.888 86.976 86.976 0 0 0 5.344-15.008q2.016-9.152 3.008-14.56a136 136 0 0 0 1.952-23.68v-270.016a8.352 8.352 0 0 1 1.312-4.704 0.896 0.896 0 0 1 0.576-0.384 0.896 0.896 0 0 1 0.672 0.16 18.592 18.592 0 0 0 7.296 3.488q3.552 0.8 6.08 1.6c9.088 2.944 18.368 5.28 26.56 8.192a18.4 18.4 0 0 0 3.2 0.864c4.064 0.672 7.328 3.008 10.72 3.488s6.88 3.008 10.624 3.52 6.048 2.72 9.6 3.2a27.264 27.264 0 0 1 4.8 1.248q5.888 2.08 14.656 4.384a20.544 20.544 0 0 1 3.456 1.248 39.68 39.68 0 0 0 9.6 3.744 24.576 24.576 0 0 1 8.736 3.872q6.976 5.056 8.704 5.952a7.264 7.264 0 0 1 1.6 1.12 106.144 106.144 0 0 1 9.92 8.96 107.264 107.264 0 0 1 10.784 13.504q1.536 2.56 4.896 7.2a17.952 17.952 0 0 1 2.56 5.152 124.8 124.8 0 0 1 5.152 16.928c0.48 3.68 1.888 7.168 2.176 11.328a107.744 107.744 0 0 1-0.672 20.288 54.4 54.4 0 0 1-1.696 8.832 101.408 101.408 0 0 1-4.544 15.52c-1.472 3.008-1.344 6.08-2.976 9.152s-1.888 7.36-3.584 10.816a15.456 15.456 0 0 0-1.696 4.96c-0.416 3.552-2.752 6.624-3.2 10.208s-3.2 7.04-3.648 10.656-2.944 6.656-3.424 10.56-3.2 7.04-3.584 11.36a3.2 3.2 0 0 1-0.256 1.056l-2.528 5.696a5.984 5.984 0 0 0-0.448 1.632 23.168 23.168 0 0 1-2.752 8.064c-0.896 1.632-0.864 5.088-1.984 7.296a21.216 21.216 0 0 0-2.144 6.08c-0.544 3.744-3.2 7.2-3.616 10.432-0.384 3.84-2.784 6.72-3.392 10.56a16.608 16.608 0 0 1-1.632 5.024 26.368 26.368 0 0 0-2.272 7.136 6.592 6.592 0 0 1-0.384 1.312l-2.24 5.184a4.64 4.64 0 0 0-0.32 1.024 23.072 23.072 0 0 1-1.6 5.792 19.808 19.808 0 0 0-1.792 5.024q0 0.864-3.2 10.4a56.864 56.864 0 0 1-2.016 5.728c-1.088 2.432-1.472 4.8-2.496 7.712q-3.2 8.64-5.856 17.344-2.208 6.944-8.384 25.088-4.64 13.664-9.216 27.424-4.896 14.688-11.264 34.4-1.824 5.696-2.752 8.896-1.888 6.656-2.656 8.896l-27.392 82.496a56.672 56.672 0 0 1-3.968 8.96 4.352 4.352 0 0 0-0.48 1.44 46.016 46.016 0 0 1-7.776 16 38.4 38.4 0 0 1-4.448 5.824 139.104 139.104 0 0 1-16.512 16.736 8.544 8.544 0 0 1-1.728 1.088 66.912 66.912 0 0 0-10.88 6.944l-0.512 0.32-2.592 1.312a13.92 13.92 0 0 1-2.272 0.896 66.976 66.976 0 0 0-10.656 4.064 7.84 7.84 0 0 1-2.24 0.704c-5.152 0.768-9.44 2.016-14.752 2.336-2.592 0-5.216 0.256-7.776 0.256a86.4 86.4 0 0 1-21.824-2.496zM599.872 691.2l-413.664-0.8A90.368 90.368 0 0 1 96 599.904l0.736-413.696A90.368 90.368 0 0 1 187.232 96l413.664 0.736A90.368 90.368 0 0 1 691.2 187.232l-0.736 413.696A90.368 90.368 0 0 1 600 691.2zM185.6 186.752v324.448a1.152 1.152 0 0 0 1.152 1.152h413.664a1.152 1.152 0 0 0 1.152-1.152V186.752a1.152 1.152 0 0 0-1.152-1.152H186.816a1.152 1.152 0 0 0-1.216 1.152z'
const FlashCardHeaderIcon = () => h('svg', { width: 24, height: 24, viewBox: '0 0 1024 1024', fill: '#CE89D1' }, [
  h('path', { d: FLASHCARD_SVG_PATH })
])

// 对话框终止按钮图标：外圈圆形 + 内部实心方块
const StopCircleIcon = () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  // 外圈圆形描边
  h('circle', { cx: 12, cy: 12, r: 8 }),
  // 内部实心圆角方块
  h('rect', { x: 9, y: 9, width: 6, height: 6, rx: 1.5, fill: 'currentColor', stroke: 'none' })
])

const props = defineProps({
  currentSession: {
    type: Object,
    default: null
  },
  streamingContent: {
    type: String,
    default: ''
  },
  modelMode: {
    type: String,
    required: true
  },
  setModelMode: {
    type: Function,
    required: true
  },
  onSendMessage: {
    type: Function,
    required: true
  },
  onAbortStream: {
    type: Function,
    default: null
  },
  isSidebarOpen: {
    type: Boolean,
    required: true
  },
  // 历史消息加载中（切换会话或恢复当前会话），用于显示骨架屏
  isLoading: {
    type: Boolean,
    default: false
  },
  // 使用场景：默认对话 / 学习路径规划
  scene: {
    type: String,
    default: 'default'
  },
  // 学习路径场景：对话列表（{ role, content?, pathJson?, isStreaming? }[]）
  learningPathMessages: {
    type: Array,
    default: () => []
  },
  // 学习路径流式生成中
  isPathStreaming: {
    type: Boolean,
    default: false
  },
  // 学习路径生成错误信息
  pathStreamError: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['clearPathError', 'pathConfirm'])

const inputTextareaRef = ref(null)

const inputValue = ref('')
const userAvatar = ref('')
const userDisplayName = ref('U')
const userName = ref('')
const isRecording = ref(false)
const isSending = ref(false) // 新增状态变量
let mediaRecorder = null
let audioChunks = []

const setInputValue = (value) => {
  inputValue.value = value
}

const isStudyPathScene = computed(() => props.scene === 'learningPath')

const effectiveSending = computed(() => {
  return props.isPathStreaming || isSending.value
})

// 学习路径对话展示列表：含进行中的占位条
const pathMessageList = computed(() => {
  const list = [...(props.learningPathMessages || [])]
  if (props.isPathStreaming) {
    list.push({ id: 'streaming', role: 'model', isStreaming: true })
  }
  return list
})

const placeholderText = computed(() => {
  return isStudyPathScene.value
    ? '请在这里输入与你“学习路径规划”相关的问题...'
    : '问孪孪伴学...'
})

const welcomeSubtitleText = computed(() => {
  return isStudyPathScene.value
    ? '一起为你制定专属的学习路径规划'
    : '孪孪伴学，智识相协'
})

const focusPathInput = () => {
  nextTick(() => {
    const el = inputTextareaRef.value || document.querySelector('.input-textarea')
    if (el) el.focus()
  })
}

const handlePathConfirm = (pathJson) => {
  emit('pathConfirm', pathJson)
}

const handleCardClick = (content) => {
  // 将卡片内容填充到输入框，将换行符替换为空格
  inputValue.value = content.replace(/\n/g, ' ')
  // 自动聚焦到输入框
  nextTick(() => {
    const textarea = document.querySelector('.input-textarea')
    if (textarea) {
      textarea.focus()
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
    }
  })
}

// 初始化用户信息
const initUserInfo = async () => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (!userInfoStr) {
    userName.value = '用户'
    return
  }

  const user = JSON.parse(userInfoStr)
  let storedProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')

  try {
    const latestProfile = await getMyProfile()
    if (latestProfile) {
      storedProfile = normalizeProfile(latestProfile, user)
      localStorage.setItem('userProfile', JSON.stringify(storedProfile))
    } else {
      storedProfile = normalizeProfile(storedProfile, user)
    }
  } catch (error) {
    console.warn('获取个人信息失败:', error)
    storedProfile = normalizeProfile(storedProfile, user)
  }
  
  // 设置用户头像和昵称
  userAvatar.value = storedProfile.avatar || user.userAvatar || ''
  const displayName = storedProfile.nickname || user.userName || '用户'
  userDisplayName.value = displayName.length > 1 
    ? displayName.charAt(0).toUpperCase()
    : displayName.toUpperCase()
  userName.value = displayName
}

onMounted(() => {
  initUserInfo()
})

const handleSend = () => {
  if (inputValue.value.trim()) {
    if (props.scene !== 'learningPath') isSending.value = true
    props.onSendMessage(inputValue.value)
    inputValue.value = ''
    const textarea = document.querySelector('.input-textarea')
    if (textarea) textarea.style.height = 'auto'
  }
}

const handleAbort = () => {
  if (isSending.value) {
    props.onAbortStream()
    isSending.value = false // 停止发送
  }
}

// 监听会话消息，当所有模型消息不再处于流式生成状态时，自动恢复为语音按钮
watch(
  () => props.currentSession && props.currentSession.messages,
  (messages) => {
    if (!messages || !Array.isArray(messages)) return
    const hasStreamingModelMsg = messages.some(
      (m) => m.role === 'model' && m.isStreaming
    )
    if (!hasStreamingModelMsg) {
      isSending.value = false
    }
  },
  { deep: true }
)

const handleKeyDown = (e) => {
  if (e.key !== 'Enter') return
  if (e.shiftKey) {
    // Shift+Enter：框内换行，不阻止默认
    return
  }
  // Enter（无 Shift）：发送
  e.preventDefault()
  if (!effectiveSending.value) {
    handleSend()
  } else {
    handleAbort()
  }
}

const handleInput = (e) => {
  const target = e.target
  target.style.height = 'auto'
  target.style.height = target.scrollHeight + 'px'
}

const router = useRouter()

// 使用闪卡生成状态
const flashCardState = useFlashCardGeneration()

// 计算进度条相关值
const circumference = 2 * Math.PI * 15 // r=15
const progressOffset = computed(() => {
  const progress = flashCardState.progress.value
  return circumference - (progress / 100) * circumference
})

// 监听闪卡生成状态变化，显示弹窗
watch(() => flashCardState.isGenerating.value, (isGenerating, wasGenerating) => {
  if (isGenerating && !wasGenerating) {
    // 开始生成
    showToast('闪卡开始生成，完成后会通知您', 'info')
  } else if (!isGenerating && wasGenerating) {
    // 生成完成（保留 100% 进度，直到用户点进闪卡页面）
    showToast('闪卡生成完毕，点击右上角的闪卡按钮，即可查看具体内容', 'success')
  }
})

// 监听进度变化
watch(() => flashCardState.progress.value, (progress) => {
  // 进度更新时不需要额外操作，进度条会自动更新
})

// 弹窗组件
let toastElement = null
const showToast = (message, type = 'info') => {
  // 移除之前的弹窗
  if (toastElement) {
    toastElement.remove()
    toastElement = null
  }

  // 创建绿色圆形图标（带白色对勾）
  const successIconSvg = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="10" fill="#10B981"/>
      <path d="M6 10L9 13L14 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
  
  // 创建信息图标（绿色圆形带提示）
  const infoIconSvg = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="10" fill="#10B981"/>
      <circle cx="10" cy="7" r="1.5" fill="white"/>
      <path d="M10 9.5V14.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `

  const iconSvg = type === 'success' ? successIconSvg : infoIconSvg

  toastElement = document.createElement('div')
  toastElement.className = 'flashcard-toast'
  toastElement.style.cssText = `
    position: fixed;
    top: 30px;
    left: 60%;
    transform: translateX(-50%) translateY(-120px);
    // background: #D1FAE5;
    color: #10B981;
    // padding: 16px 24px;
    // border-radius: 9999px;
    // box-shadow: none;
    z-index: 10001;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 15px;
    font-weight: 500;
    max-width: 560px;
    line-height: 1.6;
    animation: toastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  `
  toastElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
      ${iconSvg}
    </div>
    <span style="letter-spacing: 0.02em;">${message}</span>
  `
  document.body.appendChild(toastElement)

  // 添加动画样式
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style')
    style.id = 'toast-styles'
    style.textContent = `
      @keyframes toastSlideIn {
        from {
          transform: translateX(-50%) translateY(-120px);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }
      @keyframes toastSlideOut {
        from {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
        to {
          transform: translateX(-50%) translateY(-120px);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(style)
  }

  // 3秒后自动消失
  setTimeout(() => {
    if (toastElement) {
      toastElement.style.animation = 'toastSlideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      setTimeout(() => {
        if (toastElement) {
          toastElement.remove()
          toastElement = null
        }
      }, 300)
    }
  }, 3000)
}

const openFlashCardPage = async () => {
  // 如果当前正在生成闪卡或有刚生成的闪卡，优先进入暂存区视图
  if (flashCardState.isGenerating.value || flashCardState.progress.value === 100) {
    router.push({ path: '/flashcard-graph', query: { view: 'temp' } })
  } else {
    router.push('/flashcard-graph')
  }

  // 用户点击进入后，清理“新生成”提示状态
  flashCardState.progress.value = 0
  flashCardState.currentFlashCardId.value = null
  flashCardState.progressMessage.value = ''
}

onUnmounted(() => {
  if (toastElement) {
    toastElement.remove()
    toastElement = null
  }
})

const toggleRecording = async () => {
  if (!isRecording.value) {
    await startRecording()
  } else {
    stopRecording()
  }
}

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(track => track.stop())
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
      await sendAudioToAsr(audioBlob)
      isRecording.value = false
    }

    mediaRecorder.start()
    isRecording.value = true
  } catch (error) {
    console.error('无法启动录音:', error)
    alert('无法启动录音，请检查麦克风权限。')
  }
}

const stopRecording = () => {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop()
  }
}

const sendAudioToAsr = async (audioBlob) => {
  try {
    const formData = new FormData()
    formData.append('file', audioBlob, 'recording.webm')

    // 使用原生fetch，因为axios的request.js拦截器会处理响应格式
    const response = await fetch('/api/asr/transcribe', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })

    const result = await response.json()
    
    if (result.code === 0 && result.data?.text) {
      inputValue.value = result.data.text
      nextTick(() => {
        const textarea = document.querySelector('.input-textarea')
        if (textarea) {
          textarea.focus()
          textarea.style.height = 'auto'
          textarea.style.height = textarea.scrollHeight + 'px'
        }
      })
    } else {
      throw new Error(result.message || '语音识别失败')
    }
  } catch (error) {
    console.error('ASR 请求失败:', error)
    alert(`语音识别失败: ${error.message}`)
  }
}

onUnmounted(() => {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop()
  }
})
</script>

<style scoped>
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  position: relative;
}

.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
}

.main-header-title {
  font-size: 20px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: #444746;
}

.main-header-disclaimer {
  font-size: 12px;
  font-weight: 400;
  color: #6b7280;
  margin-left: 6px;
}

.main-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pro-badge {
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #e3e3e3;
  font-size: 10px;
  font-weight: 700;
  color: #444746;
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(to top right, #a855f7, #ec4899);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 700;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
  overflow: hidden;
}

.user-avatar-small:hover {
  transform: scale(1.05);
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.header-action-btn {
  padding: 8px;
  color: #444746;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.main-messages {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 0;
}

/* ===== 历史消息加载骨架屏样式 ===== */
.skeleton-wrapper {
  width: 100%;
  max-width: 64rem;
  padding: 60px 32px 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.skeleton-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 8px;
}

.skeleton-pill {
  height: 22px;
  border-radius: 9999px;
  background: linear-gradient(90deg, #f4f4f5 0%, #e5e7eb 50%, #f4f4f5 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.2s ease-in-out infinite;
}

.skeleton-pill--short {
  width: 220px;
}

.skeleton-pill--long {
  width: 320px;
}

.skeleton-card {
  padding: 18px 20px;
  border-radius: 16px;
  background: #f4f4f5;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.skeleton-line-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 14px;
  border-radius: 9999px;
  background: linear-gradient(90deg, #e5e7eb 0%, #d4d4d8 50%, #e5e7eb 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.2s ease-in-out infinite;
}

.skeleton-line--title {
  width: 40%;
  height: 18px;
}

.skeleton-line--short {
  width: 55%;
}

.skeleton-line--medium {
  width: 72%;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.main-messages::-webkit-scrollbar {
  width: 8px;
}

.main-messages::-webkit-scrollbar-track {
  background: transparent;
}

.main-messages::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.main-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.path-conversation-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.path-inline-error {
  margin: 12px 24px 0;
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  color: #dc2626;
}

.path-inline-error-btn {
  flex-shrink: 0;
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid #dc2626;
  background: transparent;
  color: #dc2626;
  font-size: 13px;
  cursor: pointer;
}

.path-inline-error-btn:hover {
  background: rgba(220, 38, 38, 0.08);
}

.path-loading-screen,
.path-error-screen {
  width: 100%;
  max-width: 64rem;
  padding: 60px 24px 24px 24px;
  margin: 0 auto;
}

.path-loading-content,
.path-error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.path-loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(147, 51, 234, 0.2);
  border-top-color: #9333ea;
  border-radius: 50%;
  animation: path-spin 0.8s linear infinite;
}

@keyframes path-spin {
  to { transform: rotate(360deg); }
}

.path-loading-text {
  font-size: 15px;
  color: #6b7280;
  margin: 0;
}

.path-error-text {
  font-size: 15px;
  color: #dc2626;
  margin: 0;
  text-align: center;
}

.path-error-retry {
  padding: 8px 20px;
  border-radius: 8px;
  border: 1px solid #9333ea;
  background: transparent;
  color: #7c3aed;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.path-error-retry:hover {
  background: rgba(147, 51, 234, 0.08);
}

.welcome-screen {
  width: 100%;
  max-width: 64rem;
  padding: 60px 16px 10px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.welcome-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 0;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.welcome-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 30px;
  font-weight: 500;
  flex-shrink: 0;
}

.welcome-title svg {
  color: #3b82f6;
  width: 24px;
  height: 24px;
}

.welcome-subtitle {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  flex-shrink: 0;
}

.try-button {
  width: 40px;
  height: 40px;
  background: #d3e3fd;
  color: #2563eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.try-button:hover {
  background: #c2d7fb;
}

.main-input-area {
  width: 100%;
  padding: 12px 16px;
  padding-bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(to top, white, rgba(255, 255, 255, 0.9), transparent);
  flex-shrink: 0;
}

.input-container {
  width: 100%;
  max-width: 64rem;
}

.input-wrapper {
  position: relative;
  background: #f0f4f9;
  border-radius: 28px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid transparent;
  transition: all 0.2s;
}

.input-wrapper:focus-within {
  border-color: #e3e3e3;
  background: white;
}

.input-textarea {
  width: 100%;
  background: transparent;
  border: none;
  padding: 20px 24px;
  font-size: 17px;
  outline: none;
  resize: none;
  overflow: hidden;
  min-height: 64px;
  height: auto;
}

.input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 12px 16px;
}

.input-footer-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.input-icon-btn {
  padding: 12px;
  color: #444746;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-icon-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.input-icon-btn.recording {
  background: #EF4444;
  color: white;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.tooltip {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: #444746;
  color: white;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.input-icon-btn:hover .tooltip {
  opacity: 1;
}

.keyboard-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 9999px;
  font-size: 11px;
  color: #444746;
  font-weight: 500;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.input-footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.send-button {
  padding: 12px;
  background: #2563eb;
  color: white;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  transform: scale(1.1);
  margin-left: 4px;
}

.send-button:hover {
  background: #1d4ed8;
}

/* 终止按钮样式：浅灰圆形 + 黑色图标，接近截图效果 */
.send-button.stop-button {
  background: #f5f5f5;
  color: #111827;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  transform: scale(1);
  border-radius: 50%;
}

.send-button.stop-button:hover {
  background: #e5e5e5;
}

.input-disclaimer {
  margin-top: 12px;
  font-size: 11px;
  color: #5e5e5e;
  text-align: center;
  padding: 0 16px;
}

.disclaimer-link {
  color: #2563eb;
  text-decoration: underline;
}

.text-blue-500 {
  color: #3b82f6;
}

/* 自定义滚动条 */
.main-messages::-webkit-scrollbar {
  width: 8px;
}

.main-messages::-webkit-scrollbar-track {
  background: transparent;
}

.main-messages::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 10px;
}

.main-messages::-webkit-scrollbar-thumb:hover {
  background: #bdbdbd;
}

/* 闪卡按钮进度条样式 */
.flashcard-btn-wrapper {
  position: relative;
}

.progress-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-90deg);
  width: 32px;
  height: 32px;
  pointer-events: none;
}

.progress-ring-circle {
  transition: stroke-dashoffset 0.3s ease;
}
</style>