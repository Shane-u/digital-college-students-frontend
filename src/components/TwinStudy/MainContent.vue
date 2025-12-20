<template>
  <div class="main-content">
    <header class="main-header">
      <div class="main-header-title">孪孪伴学</div>
      <div class="main-header-actions">
        <div v-if="userAvatar" class="user-avatar-small">
          <img :src="userAvatar" alt="用户头像" class="user-avatar-img" />
        </div>
        <div v-else class="user-avatar-small">{{ userDisplayName }}</div>
      </div>
    </header>

    <div class="main-messages">
      <div v-if="!currentSession || currentSession.messages.length === 0" class="welcome-screen">
        <div class="welcome-content">
          <div class="welcome-title">
            <SparklesIcon />
            <span>你好！{{ userName }}</span>
          </div>
          <div class="welcome-subtitle">
            <span>孪孪伴学，智识相协</span>
          </div>
          <VintageCardGallery @cardClick="handleCardClick" />
        </div>
      </div>
      <MessageList v-else :messages="currentSession.messages" />
    </div>

    <div class="main-input-area">
      <div class="input-container">
        <div class="input-wrapper">
          <textarea
            v-model="inputValue"
            @keydown="handleKeyDown"
            :placeholder="`问孪孪伴学...`"
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
                <span>Ctrl + Enter to send</span>
              </div>
            </div>

            <div class="input-footer-right">
              <ModelSelector :mode="modelMode" :setMode="setModelMode" />
              <button class="input-icon-btn">
                <MicIcon />
              </button>
              <button 
                v-if="inputValue.trim()"
                @click="handleSend"
                class="send-button"
              >
                <ArrowRightIcon />
              </button>
            </div>
          </div>
        </div>
        
        <div class="input-disclaimer">
          Gemini can make mistakes, so double-check it. <a href="#" class="disclaimer-link">Your privacy & Gemini Apps</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { h } from 'vue'
import MessageList from './MessageList.vue'
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

const props = defineProps({
  currentSession: {
    type: Object,
    default: null
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
  isSidebarOpen: {
    type: Boolean,
    required: true
  }
})

const inputValue = ref('')
const userAvatar = ref('')
const userDisplayName = ref('U')
const userName = ref('')

const setInputValue = (value) => {
  inputValue.value = value
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
    props.onSendMessage(inputValue.value)
    inputValue.value = ''
    const textarea = document.querySelector('.input-textarea')
    if (textarea) textarea.style.height = 'auto'
  }
}

const handleKeyDown = (e) => {
  if (e.key === 'Enter' && e.ctrlKey) {
    e.preventDefault()
    handleSend()
  }
}

const handleInput = (e) => {
  const target = e.target
  target.style.height = 'auto'
  target.style.height = target.scrollHeight + 'px'
}
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

.main-messages {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 0;
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
</style>
