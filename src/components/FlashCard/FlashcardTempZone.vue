<template>
  <div class="flashcard-temp-zone">
    <div class="temp-zone-header">
      <h2 class="temp-zone-title">待确认的闪卡</h2>
      <span class="temp-zone-subtitle">(7天后自动删除)</span>
    </div>

    <div v-if="flashcards.length === 0" class="empty-state">
      <div class="empty-icon">📦</div>
      <p class="empty-text">暂存区暂无内容</p>
    </div>

    <div v-else class="flashcards-grid">
      <div 
        v-for="card in flashcards" 
        :key="card.id"
        class="flashcard-card"
      >
        <!-- 卡片头部 -->
        <div class="card-header">
          <h3 :class="['card-title', { 'generating': card.isGenerating }]">
            {{ card.isGenerating ? '闪卡生成中...' : card.title }}
          </h3>
          <div v-if="!card.isGenerating" class="card-expiry">
            <span class="expiry-text">{{ getExpiryDays(card.createdAt) }}天后过期</span>
          </div>
        </div>

        <!-- 卡片内容 -->
        <div class="card-body">
          <!-- 生成中状态 -->
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
            <p class="card-content-preview">{{ getContentPreview(card.content) }}</p>
            <div class="card-actions">
              <button 
                class="action-btn btn-confirm"
                @click="handleConfirmSave(card)"
              >
                确认保存
              </button>
              <button 
                class="action-btn btn-preview"
                @click="handlePreview(card)"
              >
                预览
              </button>
              <button 
                class="action-btn btn-delete"
                @click="handleDelete(card.id)"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProgressCircle from './ProgressCircle.vue'

const props = defineProps({
  flashcards: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['confirmSave', 'preview', 'delete', 'cardClick'])

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
</script>

<style scoped>
.flashcard-temp-zone {
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px 32px;
}

.temp-zone-header {
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.temp-zone-title {
  font-size: 24px;
  font-weight: 900;
  color: #1e293b;
  margin: 0;
}

.temp-zone-subtitle {
  font-size: 14px;
  color: #94a3b8;
  font-weight: 700;
}

.empty-state {
  height: 256px;
  border: 2px dashed #e2e8f0;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
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
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
}

.flashcard-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;
  overflow: hidden;
  min-height: 220px;
  display: flex;
  flex-direction: column;
}

.flashcard-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 32px 32px 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-title {
  font-size: 18px;
  font-weight: 900;
  color: #1e293b;
  margin: 0;
}

.card-title.generating {
  color: #4f46e5;
}

.card-expiry {
  font-size: 10px;
  font-weight: 900;
  color: #cbd5e1;
  text-transform: uppercase;
}

.expiry-text {
  display: block;
}

.card-body {
  padding: 0 32px 32px;
  flex: 1;
  display: flex;
  flex-direction: column;
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
  line-height: 1.6;
  margin-bottom: 24px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 900;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm {
  background: #4f46e5;
  color: white;
}

.btn-confirm:hover {
  background: #4338ca;
}

.btn-preview {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #f1f5f9;
}

.btn-preview:hover {
  background: #f1f5f9;
}

.btn-delete {
  background: white;
  color: #94a3b8;
  border: 1px solid #f1f5f9;
}

.btn-delete:hover {
  color: #ef4444;
  background: #fef2f2;
}
</style>

