<template>
  <div class="temp-page-root">
    <!-- 顶部返回导航 & 操作栏 -->
    <header class="temp-page-header">
      <div class="temp-page-header-inner">
        <button class="back-btn" type="button" @click="handleBackToGraph">
          <span class="back-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="back-text">返回图谱页面</span>
        </button>

        <div class="temp-page-header-actions">
          <button class="icon-btn" type="button">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" stroke-linecap="round" />
            </svg>
          </button>
          <button class="primary-pill-btn" type="button">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14" stroke-linecap="round" />
              <path d="M5 12h14" stroke-linecap="round" />
            </svg>
            <span>新建闪卡</span>
          </button>
        </div>
      </div>
    </header>

    <!-- 主体区域 -->
    <main class="temp-page-main">
      <!-- 标题区 -->
      <div class="temp-zone-header">
        <div class="temp-zone-header-left">
          <div class="temp-zone-title-row">
            <h2 class="temp-zone-title">待确认的闪卡</h2>
          </div>
          <p class="temp-zone-desc">
            <span class="desc-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#5b52f9" stroke-width="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            系统将在 7 天后自动清理未保存的卡片，请及时确认。
          </p>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="flashcards.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <p class="empty-text">暂存区暂无内容</p>
      </div>

      <!-- 卡片网格 -->
      <div v-else class="flashcards-grid">
        <article
          v-for="card in flashcards"
          :key="card.id"
          class="flashcard-card"
        >
          <!-- 右上角过期时间 -->
          <div class="card-expiry" v-if="!card.isGenerating">
            <svg class="card-expiry-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="8" />
              <path d="M12 8v4l2 2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>{{ getExpiryDays(card.createdAt) }}天后过期</span>
          </div>

          <!-- 标题 + 下划线 -->
          <div class="card-header">
            <h3 :class="['card-title', { generating: card.isGenerating }]">
              {{ card.isGenerating ? '闪卡生成中...' : (card.title || '未命名闪卡') }}
            </h3>
            <div class="card-title-underline"></div>
          </div>

          <!-- 内容区域 -->
          <div class="card-body">
            <!-- 生成中状态：进度样式保持原有逻辑 -->
            <div v-if="card.isGenerating" class="generating-content">
              <div class="generating-header">
                <ProgressCircle
                  :is-generating="true"
                  :progress="card.progress || 0"
                  @click="handleCardClick(card)"
                />
              </div>
              <div class="progress-info">
                <div class="progress-bar-wrapper">
                  <div
                    class="progress-bar"
                    :style="{ width: `${card.progress || 0}%` }"
                  ></div>
                </div>
                <div class="progress-text">
                  <span class="progress-message">{{ card.progressMessage || '正在生成中...' }}</span>
                  <span class="progress-percent">{{ card.progress || 0 }}%</span>
                </div>
              </div>
            </div>

            <!-- 已完成状态 -->
            <div v-else class="completed-content">
              <div class="card-content-preview">
                <p
                  v-for="(line, idx) in getPreviewLines(card.content)"
                  :key="idx"
                  class="card-content-line"
                >
                  {{ line }}
                </p>
              </div>

              <div class="card-actions">
                <button
                  class="action-btn btn-confirm"
                  type="button"
                  @click="handleConfirmSave(card)"
                >
                  <span class="btn-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                  <span>确认保存</span>
                </button>
                <button
                  class="action-btn btn-secondary"
                  type="button"
                  @click="handlePreview(card)"
                >
                  <span class="btn-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1.5 12s3.5-7 10.5-7 10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </span>
                  <span>预览</span>
                </button>
                <button
                  class="action-btn btn-secondary"
                  type="button"
                  @click="openEditTemp(card)"
                >
                  <span class="btn-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 20h9" stroke-linecap="round" />
                      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                  <span>编辑</span>
                </button>
                <button
                  class="action-btn btn-danger"
                  type="button"
                  @click="handleDelete(card.id)"
                >
                  <span class="btn-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 7h16" stroke-linecap="round" />
                      <path d="M10 11v6" stroke-linecap="round" />
                      <path d="M14 11v6" stroke-linecap="round" />
                      <path d="M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M9 7V4h6v3" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                  <span>删除</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
    
    <!-- 编辑暂存闪卡弹窗（仅标题 + 内容） -->
    <Teleport to="body">
      <div v-if="showEditModal" class="temp-edit-modal-overlay" @click.self="closeEditTemp">
        <div class="temp-edit-modal">
          <div class="temp-edit-modal-header">
            <h3 class="temp-edit-modal-title">编辑暂存闪卡</h3>
            <button class="temp-edit-modal-close" type="button" @click="closeEditTemp">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <form class="temp-edit-form" @submit.prevent="submitEditTemp">
            <div class="temp-edit-field">
              <label class="temp-edit-label">标题</label>
              <input v-model="editForm.title" type="text" class="temp-edit-input" required />
            </div>
            <div class="temp-edit-field">
              <label class="temp-edit-label">内容（纯文本）</label>
              <textarea
                v-model="editForm.content"
                class="temp-edit-textarea"
                rows="8"
                placeholder="请输入详细知识点内容（纯文本）"
              ></textarea>
            </div>
            <div class="temp-edit-actions">
              <button type="button" class="temp-edit-btn temp-edit-btn-secondary" @click="closeEditTemp">取消</button>
              <button type="submit" class="temp-edit-btn temp-edit-btn-primary" :disabled="savingEdit">
                <span v-if="!savingEdit">保存</span>
                <span v-else class="btn-loading">
                  <span class="btn-loading-spinner"></span>
                  正在保存...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ProgressCircle from './ProgressCircle.vue'
import { flashCardApi } from '../../api/flashCard'

const props = defineProps({
  flashcards: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['confirmSave', 'preview', 'delete', 'cardClick', 'backToGraph'])

const getExpiryDays = (createdAt) => {
  if (!createdAt) return 7
  const created = new Date(createdAt)
  const now = new Date()
  const diffTime = created.getTime() + 7 * 24 * 60 * 60 * 1000 - now.getTime()
  const diffDays = Math.ceil(diffTime / (24 * 60 * 60 * 1000))
  return diffDays > 0 ? diffDays : 0
}

const getContentPreview = (content) => {
  if (!content) return '暂无内容'
  const text = content.replace(/<[^>]*>/g, '').trim()
  return text.length > 100 ? text.substring(0, 100) + '...' : text
}

// 将预览内容拆成多行，模仿截图中的段落效果
const getPreviewLines = (content) => {
  const preview = getContentPreview(content)
  return preview.split('\n').filter(Boolean)
}

const handleBackToGraph = () => {
  emit('backToGraph')
}

const handleConfirmSave = (card) => {
  emit('confirmSave', card)
}

const handlePreview = (card) => {
  emit('preview', card)
}

const handleDelete = (id) => {
  emit('delete', id)
}

const handleCardClick = (card) => {
  emit('cardClick', card)
}

// 编辑暂存闪卡（只改标题和纯文本内容）
const showEditModal = ref(false)
const savingEdit = ref(false)
const editForm = ref({
  id: '',
  title: '',
  content: ''
})
const currentCardRef = ref(null)

const openEditTemp = (card) => {
  currentCardRef.value = card
  editForm.value = {
    id: card.id,
    title: card.title || '',
    content: card.content || ''
  }
  showEditModal.value = true
}

const closeEditTemp = () => {
  showEditModal.value = false
  savingEdit.value = false
}

const submitEditTemp = async () => {
  const { id, title, content } = editForm.value
  if (!id) return
  try {
    savingEdit.value = true
    await flashCardApi.updateTempCard({
      id,
      title: title || '',
      content: content || ''
    })
    // 本地同步更新标题和内容
    if (currentCardRef.value) {
      currentCardRef.value.title = title || currentCardRef.value.title
      currentCardRef.value.content = content || currentCardRef.value.content
    }
    closeEditTemp()
    ElMessage && ElMessage.success('暂存闪卡已更新')
  } catch (err) {
    console.error('更新暂存闪卡失败', err)
    ElMessage && ElMessage.error(err?.message || '更新暂存闪卡失败，请稍后重试')
    savingEdit.value = false
  }
}
</script>

<style scoped>
.temp-page-root {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
}

.temp-page-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid #e2e8f0;
}

.temp-page-header-inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 16px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: #475569;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #eef2ff;
  color: #4f46e5;
}

.back-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.back-text {
  letter-spacing: 0.06em;
}

.temp-page-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  color: #5b52f9;
  background: #eef2ff;
}

.primary-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 999px;
  border: none;
  background: #5b52f9;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(79, 70, 229, 0.25);
  transition: all 0.2s;
}

.primary-pill-btn:hover {
  background: #4a42d9;
  transform: translateY(-1px);
  box-shadow: 0 14px 30px rgba(79, 70, 229, 0.32);
}

.temp-page-main {
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px 32px 56px;
  flex: 1;
}

.temp-zone-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 40px;
}

.temp-zone-header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.temp-zone-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.temp-zone-title {
  font-size: 28px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.02em;
  margin: 0;
}

.temp-zone-badge {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  background: #eef2ff;
  color: #5b52f9;
}

.temp-zone-desc {
  margin: 0;
  font-size: 14px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.desc-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  height: 260px;
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  background: #ffffff;
  border: 1px dashed #e2e8f0;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.06);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-weight: 700;
  margin: 0;
}

.flashcards-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
}

.flashcard-card {
  position: relative;
  background: #ffffff;
  border-radius: 32px;
  border: 1px solid #e5e7eb;
  /* 两侧缩小一点，给按钮留更多水平空间 */
  padding: 32px 24px 32px;
  min-height: 260px;
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.04);
  overflow: hidden; /* 确保所有内容（包括按钮）都在卡片圆角内 */
}

.flashcard-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 26px 60px rgba(79, 70, 229, 0.12);
  border-color: #e0e7ff;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 56px;
  margin-bottom: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-title.generating {
  color: #4f46e5;
}

.card-title-underline {
  width: 40px;
  height: 6px;
  border-radius: 999px;
  background: #5b52f9;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-expiry {
  position: absolute;
  top: 20px;
  right: 26px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #eea29c;
}

.card-expiry-icon {
  color: #eea29c;
}

.generating-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin-top: 32px;
}

.generating-header {
  display: flex;
  justify-content: center;
}

.progress-info {
  width: 100%;
}

.progress-bar-wrapper {
  width: 100%;
  height: 8px;
  background: #f1f5f9;
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-bar {
  height: 100%;
  background: #4f46e5;
  transition: width 0.3s ease;
  border-radius: 9999px;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #94a3b8;
}

.progress-message {
  font-weight: 500;
}

.progress-percent {
  font-weight: 900;
}

.completed-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-content-preview {
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
  margin-bottom: 24px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-content-line {
  margin: 0 0 4px;
}

.card-actions {
  display: flex;
  gap: 6px;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap; /* 水平空间不足时允许换行，确保不被裁剪出卡片外 */
}

.action-btn {
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 800;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-confirm {
  background: #5b52f9;
  color: #ffffff;
  box-shadow: 0 10px 18px rgba(79, 70, 229, 0.25);
}

.btn-confirm:hover {
  background: #4a42d9;
  box-shadow: 0 14px 26px rgba(79, 70, 229, 0.35);
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f9fafb;
  color: #64748b;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #f3f4f6;
  color: #4b5563;
}

.btn-danger {
  background: #ffffff;
  color: #9ca3af;
  border: 1px solid #e5e7eb;
}

.btn-danger:hover {
  color: #ef4444;
  background: #fef2f2;
  border-color: #fee2e2;
}

.temp-edit-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(29, 33, 41, 0.6);
  backdrop-filter: blur(4px);
  z-index: 2100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.temp-edit-modal {
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 760px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.18);
}

.temp-edit-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e6eb;
}

.temp-edit-modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.temp-edit-modal-close {
  background: none;
  border: none;
  color: #86909c;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.temp-edit-modal-close:hover {
  background: #f2f3f5;
  color: #4e5969;
}

.temp-edit-form {
  padding: 24px;
}

.temp-edit-field {
  margin-bottom: 16px;
}

.temp-edit-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #4e5969;
  margin-bottom: 8px;
}

.temp-edit-input,
.temp-edit-textarea {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
  background: #f2f3f5;
  font-size: 14px;
  transition: all 0.2s;
}

.temp-edit-input:focus,
.temp-edit-textarea:focus {
  outline: none;
  border-color: #3370ff;
  background: #ffffff;
  box-shadow: 0 0 0 2px rgba(51, 112, 255, 0.15);
}

.temp-edit-textarea {
  resize: vertical;
  min-height: 160px;
}

.temp-edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e6eb;
}

.temp-edit-btn {
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.temp-edit-btn-primary {
  background: #3370ff;
  color: #ffffff;
  border-color: #3370ff;
}

.temp-edit-btn-primary[disabled] {
  opacity: 0.85;
  cursor: not-allowed;
  box-shadow: none;
}

.temp-edit-btn-secondary {
  background: #ffffff;
  color: #4e5969;
  border-color: #e5e6eb;
}

.temp-edit-btn-secondary:hover {
  background: #f5f7fa;
}

.btn-loading {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-loading-spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-top-color: #ffffff;
  animation: btn-spin 0.6s linear infinite;
}

@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

