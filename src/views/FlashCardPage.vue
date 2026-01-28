<template>
  <div class="flash-card-page">
    <div class="flash-card-container">
      <header class="flash-card-header">
        <h1>📚 记忆闪卡</h1>
        <div class="mode-switch">
          <button 
            :class="['mode-btn', { active: currentMode === 'list' }]" 
            @click="switchMode('list')"
          >
            列表模式
          </button>
          <button 
            :class="['mode-btn', { active: currentMode === 'review' }]" 
            @click="switchMode('review')"
          >
            复习模式
          </button>
        </div>
      </header>

      <!-- 列表模式 -->
      <div v-if="currentMode === 'list'" class="list-mode">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>
        <div v-else-if="flashCards.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <div class="empty-text">暂无闪卡，快去生成一些吧！</div>
        </div>
        <div v-else class="flash-cards-grid">
          <div 
            v-for="card in flashCards" 
            :key="card.id"
            class="flash-card-item"
            @click="openCard(card)"
          >
            <div class="flash-card-header-item">
              <div class="flash-card-title">{{ card.title || '未命名' }}</div>
              <div class="flash-card-content-preview">
                {{ getContentPreview(card.content || '') }}
              </div>
            </div>
            <div class="flash-card-info">
              复习次数: {{ card.reviewCount || 0 }} | 
              下次复习: {{ formatNextReviewTime(card.nextReviewTime) }}
            </div>
            <div class="flash-card-actions" @click.stop>
              <button class="action-btn btn-edit" @click="editCard(card)">编辑</button>
              <button class="action-btn btn-ai" @click="aiAssist(card)">AI辅助</button>
              <button class="action-btn btn-delete" @click="deleteCard(card.id)">删除</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 复习模式 -->
      <div v-if="currentMode === 'review'" class="review-mode">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>
        <div v-else-if="reviewCards.length === 0" class="empty-state">
          <div class="empty-icon">🎉</div>
          <div class="empty-text">暂无需要复习的闪卡！</div>
        </div>
        <div v-else-if="currentReviewIndex >= reviewCards.length" class="empty-state">
          <div class="empty-icon">✅</div>
          <div class="empty-text">恭喜！所有闪卡都已复习完成！</div>
          <button class="restart-review-btn" @click="loadReviewCards">重新开始</button>
        </div>
        <div v-else class="review-card-container">
          <div class="review-card">
            <div class="review-card-title">{{ reviewCards[currentReviewIndex]?.title || '未命名' }}</div>
            <div 
              class="review-card-content" 
              v-html="reviewCards[currentReviewIndex]?.htmlContent || sanitizeHtml(reviewCards[currentReviewIndex]?.content || '')"
            ></div>
            <div class="review-buttons">
              <button class="review-btn restart" @click="reviewCard(1)">重来 (&lt;1分钟)</button>
              <button class="review-btn hard" @click="reviewCard(2)">困难 (6分钟)</button>
              <button class="review-btn good" @click="reviewCard(3)">良好 (10分钟)</button>
              <button class="review-btn easy" @click="reviewCard(4)">简单 (4天)</button>
            </div>
            <div class="review-progress">
              {{ currentReviewIndex + 1 }} / {{ reviewCards.length }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑模态框 -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">编辑闪卡</h2>
          <button class="close-btn" @click="closeEditModal">&times;</button>
        </div>
        <form @submit.prevent="saveEdit">
          <input type="hidden" v-model="editingCard.id">
          <div class="form-group">
            <label class="form-label">标题</label>
            <input 
              type="text" 
              v-model="editingCard.title" 
              class="form-input" 
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">内容</label>
            <textarea 
              v-model="editingCard.content" 
              class="form-textarea" 
              required
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">HTML内容（可选）</label>
            <textarea 
              v-model="editingCard.htmlContent" 
              class="form-textarea"
            ></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeEditModal">取消</button>
            <button type="submit" class="btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>

    <!-- AI辅助模态框 -->
    <div v-if="showAiModal" class="modal-overlay" @click="closeAiModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">AI 辅助修改</h2>
          <button class="close-btn" @click="closeAiModal">&times;</button>
        </div>
        <form @submit.prevent="saveAiAssist">
          <input type="hidden" v-model="aiCardId">
          <div class="form-group">
            <label class="form-label">请描述您想要如何修改闪卡（样式或内容）</label>
            <textarea 
              v-model="aiPrompt" 
              class="form-textarea" 
              placeholder="例如：将背景色改为蓝色，或者简化内容..."
              required
            ></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeAiModal">取消</button>
            <button type="submit" class="btn-primary">生成</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 查看闪卡详情模态框 -->
    <div v-if="showCardDetail" class="modal-overlay" @click="closeCardDetail">
      <div class="modal-content card-detail-modal" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">{{ viewingCard?.title || '闪卡详情' }}</h2>
          <button class="close-btn" @click="closeCardDetail">&times;</button>
        </div>
        <div 
          class="card-detail-content" 
          v-html="viewingCard?.htmlContent || sanitizeHtml(viewingCard?.content || '')"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { flashCardApi } from '../api/flashCard'
import { sanitizeHtml } from '../utils/sanitizeHtml'

const currentMode = ref('list')
const flashCards = ref([])
const reviewCards = ref([])
const currentReviewIndex = ref(0)
const loading = ref(false)
const showEditModal = ref(false)
const showAiModal = ref(false)
const showCardDetail = ref(false)
const editingCard = ref({})
const aiCardId = ref(null)
const aiPrompt = ref('')
const viewingCard = ref(null)

let ws = null
let notificationEl = null

// WebSocket初始化
const initWebSocket = () => {
  const tryConnect = () => {
    // 检查是否支持WebSocket
    if (typeof window.SockJS === 'undefined' || typeof window.Stomp === 'undefined') {
      console.warn('WebSocket库未加载，将在库加载后重试')
      setTimeout(tryConnect, 1000)
      return
    }

    const wsUrl = `${window.location.protocol === 'https:' ? 'https' : 'http'}://${window.location.host}/api/ws/flashcard`

    try {
      const socket = new window.SockJS(wsUrl)
      ws = window.Stomp.over(socket)
      if (ws.debug) {
        ws.debug = null
      }

      ws.connect({}, function(frame) {
        console.log('WebSocket连接成功')
        ws.subscribe('/user/queue/flashcard', function(message) {
          try {
            const data = JSON.parse(message.body)
            handleFlashCardNotification(data)
          } catch (error) {
            console.error('解析WebSocket消息失败:', error)
          }
        })
      }, function(error) {
        console.warn('WebSocket连接失败:', error)
        ws = null
      })
    } catch (error) {
      console.warn('初始化WebSocket失败:', error)
      ws = null
    }
  }

  tryConnect()
}

const handleFlashCardNotification = (data) => {
  if (data.type === 'flashcard_generated' && data.status === 'success') {
    showNotification('闪卡生成完成！', 'success')
    if (currentMode.value === 'list') {
      loadFlashCards()
    }
  } else if (data.type === 'flashcard_failed' && data.status === 'failed') {
    showNotification('闪卡生成失败: ' + (data.error || '未知错误'), 'error')
  }
}

const showNotification = (message, type) => {
  // 移除之前的通知
  if (notificationEl) {
    notificationEl.remove()
  }

  notificationEl = document.createElement('div')
  notificationEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: ${type === 'success' ? '#10B981' : '#EF4444'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `
  notificationEl.textContent = message
  document.body.appendChild(notificationEl)

  setTimeout(() => {
    if (notificationEl) {
      notificationEl.style.animation = 'slideOut 0.3s ease'
      setTimeout(() => {
        if (notificationEl) {
          notificationEl.remove()
          notificationEl = null
        }
      }, 300)
    }
  }, 3000)
}

const switchMode = (mode) => {
  currentMode.value = mode
  if (mode === 'list') {
    loadFlashCards()
  } else {
    loadReviewCards()
  }
}

const loadFlashCards = async () => {
  loading.value = true
  try {
    const result = await flashCardApi.list()
    console.log(result);
    if (result.code === 0) {
      flashCards.value = result.data || []
    } else {
      showNotification('加载闪卡失败: ' + result.message, 'error')
    }
  } catch (error) {
    console.error('加载闪卡失败:', error)
    showNotification('加载闪卡失败: ' + error.message, 'error')
  } finally {
    loading.value = false
  }
}

const loadReviewCards = async () => {
  loading.value = true
  try {
    const result = await flashCardApi.reviewList()
    if (result.code === 0) {
      reviewCards.value = result.data || []
      currentReviewIndex.value = 0
    } else {
      showNotification('加载复习闪卡失败: ' + result.message, 'error')
    }
  } catch (error) {
    console.error('加载复习闪卡失败:', error)
    showNotification('加载复习闪卡失败: ' + error.message, 'error')
  } finally {
    loading.value = false
  }
}

const getContentPreview = (content) => {
  if (!content) return ''
  const text = content.replace(/<[^>]*>/g, '')
  return text.length > 100 ? text.substring(0, 100) + '...' : text
}

const formatNextReviewTime = (timeStr) => {
  if (!timeStr) return '未设置'
  const date = new Date(timeStr)
  const now = new Date()
  const diff = date - now

  if (diff < 0) return '已到期'
  if (diff < 60000) return '即将到期'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟后`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时后`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const openCard = (card) => {
  viewingCard.value = card
  showCardDetail.value = true
}

const closeCardDetail = () => {
  showCardDetail.value = false
  viewingCard.value = null
}

const editCard = (card) => {
  editingCard.value = {
    id: card.id,
    title: card.title || '',
    content: card.content || '',
    htmlContent: card.htmlContent || ''
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingCard.value = {}
}

const saveEdit = async () => {
  try {
    const result = await flashCardApi.update(editingCard.value)
    if (result.code === 0) {
      showNotification('保存成功', 'success')
      closeEditModal()
      loadFlashCards()
    } else {
      showNotification('保存失败: ' + result.message, 'error')
    }
  } catch (error) {
    console.error('保存失败:', error)
    showNotification('保存失败: ' + error.message, 'error')
  }
}

const aiAssist = (card) => {
  aiCardId.value = card.id
  aiPrompt.value = ''
  showAiModal.value = true
}

const closeAiModal = () => {
  showAiModal.value = false
  aiCardId.value = null
  aiPrompt.value = ''
}

const saveAiAssist = async () => {
  try {
    const result = await flashCardApi.aiAssist(aiCardId.value, aiPrompt.value)
    if (result.code === 0) {
      showNotification('AI辅助处理中，请稍候...', 'success')
      closeAiModal()
      loadFlashCards()
    } else {
      showNotification('AI辅助失败: ' + result.message, 'error')
    }
  } catch (error) {
    console.error('AI辅助失败:', error)
    showNotification('AI辅助失败: ' + error.message, 'error')
  }
}

const deleteCard = async (cardId) => {
  if (!confirm('确定要删除这个闪卡吗？')) return

  try {
    const result = await flashCardApi.delete(cardId)
    if (result.code === 0) {
      showNotification('删除成功', 'success')
      loadFlashCards()
    } else {
      showNotification('删除失败: ' + result.message, 'error')
    }
  } catch (error) {
    console.error('删除失败:', error)
    showNotification('删除失败: ' + error.message, 'error')
  }
}

const reviewCard = async (difficultyLevel) => {
  const card = reviewCards.value[currentReviewIndex.value]
  if (!card) return

  try {
    const result = await flashCardApi.review(card.id, difficultyLevel)
    if (result.code === 0) {
      currentReviewIndex.value++
    } else {
      showNotification('复习失败: ' + result.message, 'error')
    }
  } catch (error) {
    console.error('复习失败:', error)
    showNotification('复习失败: ' + error.message, 'error')
  }
}

onMounted(() => {
  loadFlashCards()
  
  // 动态加载WebSocket库
  const loadWebSocketLibs = () => {
    return new Promise((resolve) => {
      if (typeof window.SockJS !== 'undefined' && typeof window.Stomp !== 'undefined') {
        resolve()
        return
      }

      let loadedCount = 0
      const checkLoaded = () => {
        loadedCount++
        if (loadedCount === 2) {
          resolve()
        }
      }

      if (typeof window.SockJS === 'undefined') {
        const sockjsScript = document.createElement('script')
        sockjsScript.src = 'https://cdn.jsdelivr.net/npm/sockjs-client@1.6.1/dist/sockjs.min.js'
        sockjsScript.onload = checkLoaded
        sockjsScript.onerror = () => {
          console.warn('SockJS库加载失败')
          checkLoaded()
        }
        document.head.appendChild(sockjsScript)
      } else {
        checkLoaded()
      }

      if (typeof window.Stomp === 'undefined') {
        const stompScript = document.createElement('script')
        stompScript.src = 'https://cdn.jsdelivr.net/npm/stompjs@2.3.3/lib/stomp.min.js'
        stompScript.onload = checkLoaded
        stompScript.onerror = () => {
          console.warn('Stomp库加载失败')
          checkLoaded()
        }
        document.head.appendChild(stompScript)
      } else {
        checkLoaded()
      }
    })
  }

  loadWebSocketLibs().then(() => {
    initWebSocket()
  })
})

onUnmounted(() => {
  if (ws && ws.connected) {
    ws.disconnect()
  }
  if (notificationEl) {
    notificationEl.remove()
  }
})
</script>

<style scoped>
.flash-card-page {
  min-height: 100vh;
  background: #F8FAFC;
  padding: 20px;
}

.flash-card-container {
  max-width: 1200px;
  margin: 0 auto;
}

.flash-card-header {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flash-card-header h1 {
  color: #2563EB;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.mode-switch {
  display: flex;
  gap: 12px;
}

.mode-btn {
  padding: 8px 16px;
  border: 2px solid #2563EB;
  background: white;
  color: #2563EB;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  font-weight: 500;
}

.mode-btn:hover {
  background: #EFF6FF;
}

.mode-btn.active {
  background: #2563EB;
  color: white;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748B;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #E2E8F0;
  border-top-color: #2563EB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  color: #64748B;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  margin-bottom: 20px;
}

.restart-review-btn {
  padding: 10px 20px;
  background: #2563EB;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.restart-review-btn:hover {
  background: #1D4ED8;
}

.flash-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.flash-card-item {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.flash-card-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.flash-card-header-item {
  flex: 1;
}

.flash-card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 8px;
}

.flash-card-content-preview {
  color: #64748B;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
}

.flash-card-info {
  font-size: 12px;
  color: #94A3B8;
  margin-bottom: 12px;
}

.flash-card-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
  font-weight: 500;
}

.btn-edit {
  background: #2563EB;
  color: white;
}

.btn-ai {
  background: #F59E0B;
  color: white;
}

.btn-delete {
  background: #EF4444;
  color: white;
}

.action-btn:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

.review-mode {
  min-height: 400px;
}

.review-card-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.review-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.review-card-title {
  font-size: 24px;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 20px;
}

.review-card-content {
  font-size: 16px;
  color: #475569;
  line-height: 1.8;
  margin-bottom: 30px;
  min-height: 200px;
  text-align: left;
}

.review-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.review-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.review-btn.restart {
  background: #EF4444;
  color: white;
}

.review-btn.hard {
  background: #F59E0B;
  color: white;
}

.review-btn.good {
  background: #2563EB;
  color: white;
}

.review-btn.easy {
  background: #10B981;
  color: white;
}

.review-btn:hover {
  opacity: 0.8;
  transform: translateY(-2px);
}

.review-progress {
  margin-top: 20px;
  color: #94A3B8;
  font-size: 12px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 30px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.card-detail-modal {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #1E293B;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #94A3B8;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #F1F5F9;
  color: #64748B;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #1E293B;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #E2E8F0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-textarea {
  min-height: 200px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-primary {
  background: #2563EB;
  color: white;
}

.btn-primary:hover {
  background: #1D4ED8;
}

.btn-secondary {
  background: #E2E8F0;
  color: #475569;
}

.btn-secondary:hover {
  background: #CBD5E1;
}

.card-detail-content {
  margin-top: 20px;
  line-height: 1.8;
  color: #475569;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>
