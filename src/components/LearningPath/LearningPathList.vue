<template>
  <div class="path-list">
    <div v-if="loading" class="path-list-loading">加载中...</div>
    <div v-else-if="!list || list.length === 0" class="path-list-empty">
      <p>暂无学习路径</p>
      <p class="path-list-empty-hint">在孪孪伴学中生成并保存学习路径后，将在此展示</p>
    </div>
    <div v-else class="path-list-grid">
      <div
        v-for="item in list"
        :key="item.id"
        class="path-list-card"
      >
        <div class="path-list-card-main">
          <h3 class="path-list-card-title">{{ item.topic || '未命名路径' }}</h3>
          <p v-if="item.description" class="path-list-card-desc">{{ item.description }}</p>
          <p class="path-list-card-time">{{ formatTime(item.createTime) }}</p>
        </div>
        <div class="path-list-card-actions">
          <button type="button" class="path-list-card-btn path-list-card-view" @click="$emit('view', item)">查看</button>
          <button type="button" class="path-list-card-btn path-list-card-delete" @click="$emit('delete', item)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  list: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

defineEmits(['view', 'delete'])

function formatTime(str) {
  if (!str) return ''
  try {
    const d = new Date(str)
    if (Number.isNaN(d.getTime())) return str
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch {
    return str
  }
}
</script>

<style scoped>
.path-list {
  padding: 24px;
}

.path-list-loading,
.path-list-empty {
  text-align: center;
  padding: 48px 24px;
  color: #6b7280;
  font-size: 15px;
}

.path-list-empty-hint {
  margin-top: 8px;
  font-size: 13px;
  color: #9ca3af;
}

.path-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.path-list-card {
  background: #fff;
  border: 1px solid rgba(120, 128, 240, 0.2);
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.08);
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: box-shadow 0.25s, border-color 0.25s, transform 0.2s;
}

.path-list-card:hover {
  border-color: rgba(124, 58, 237, 0.35);
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.15);
  transform: translateY(-2px);
}

.path-list-card-main {
  flex: 1;
  min-height: 0;
}

.path-list-card-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f1f1f;
}

.path-list-card-desc {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.path-list-card-time {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

.path-list-card-actions {
  display: flex;
  gap: 10px;
}

.path-list-card-btn {
  flex: 1;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.path-list-card-view {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #fff;
}

.path-list-card-view:hover {
  background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
}

.path-list-card-delete {
  background: #fef2f2;
  color: #dc2626;
}

.path-list-card-delete:hover {
  background: #fee2e2;
}
</style>
