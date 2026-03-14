<template>
  <div class="path-message-list">
    <template v-for="(msg, idx) in messages" :key="msg.id || idx">
      <!-- 用户消息：右侧（再次润色时携带的 JSON 不展示） -->
      <div v-if="msg.role === 'user'" class="path-msg-item path-msg-user">
        <div class="path-msg-bubble path-msg-bubble-user">
          {{ displayUserContent(msg.content) }}
        </div>
        <div class="path-msg-avatar path-msg-avatar-user">Z</div>
      </div>

      <!-- AI 回复：左侧，思维导图 + 下方纵向两个按钮 -->
      <div v-else-if="msg.role === 'model'" class="path-msg-item path-msg-model">
        <div class="path-msg-avatar path-msg-avatar-model">
          <div v-if="msg.isStreaming" class="path-msg-spinner"></div>
          <span v-else class="path-msg-sparkle">✨</span>
        </div>
        <div class="path-msg-content">
          <template v-if="msg.pathJson">
            <div class="path-msg-bubble path-msg-bubble-model">
              <LearningPathMindmap :pathJson="msg.pathJson" />
            </div>
            <div class="path-msg-actions">
              <div v-if="msg.isStreaming" class="path-msg-loading-inline">正在生成学习路径...</div>
              <template v-else>
                <button class="path-action-btn path-action-confirm" @click="$emit('confirm', msg.pathJson)">确认保存</button>
                <button class="path-action-btn path-action-polish" @click="$emit('polish', msg.pathJson)">润色修改</button>
              </template>
            </div>
          </template>
          <div v-else-if="msg.isStreaming" class="path-msg-loading">正在生成学习路径...</div>
          <div v-else-if="msg.content" class="path-msg-bubble path-msg-bubble-model path-msg-bubble-text">
            {{ displayModelContent(msg.content) }}
          </div>
        </div>
      </div>
    </template>
    <div ref="endRef"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LearningPathMindmap from './LearningPathMindmap.vue'

defineProps({
  messages: {
    type: Array,
    default: () => []
  }
})

defineEmits(['confirm', 'polish'])
const endRef = ref(null)

// 用户消息：再次润色时可能带完整 prompt + JSON，只展示简短文案
function displayUserContent(content) {
  if (content == null || typeof content !== 'string') return ''
  const s = content.trim()
  if (!s) return ''
  if (s.includes('再次润色') && (s.includes('"nodes"') || (s.includes('{') && s.length > 200))) {
    return '再次润色当前学习路径'
  }
  const jsonStart = s.indexOf('{"nodes"')
  if (jsonStart > 0) return s.slice(0, jsonStart).trim() || '再次润色当前学习路径'
  return s
}

// 模型消息：若为纯 JSON 或带大段 JSON 的文本，不展示原始内容（仅保留思维导图时的 fallback 提示）
function displayModelContent(content) {
  if (content == null || typeof content !== 'string') return ''
  const s = content.trim()
  if (!s) return ''
  if (s.includes('"nodes"') && (s.startsWith('{') || s.length > 500)) return '已生成学习路径，请查看上方导图。'
  return s
}
</script>

<style scoped>
.path-message-list {
  width: 100%;
  max-width: 64rem;
  margin: 0 auto;
  padding: 24px 24px 80px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.path-msg-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.path-msg-user {
  justify-content: flex-end;
}

.path-msg-model {
  justify-content: flex-start;
}

.path-msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4px;
}

.path-msg-avatar-user {
  background: linear-gradient(135deg, #a855f7, #ec4899);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.path-msg-avatar-model {
  background: #e0f2fe;
  color: #0284c7;
}

.path-msg-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(2, 132, 199, 0.3);
  border-top-color: #0284c7;
  border-radius: 50%;
  animation: path-spin 0.7s linear infinite;
}

@keyframes path-spin {
  to { transform: rotate(360deg); }
}

.path-msg-bubble {
  max-width: calc(100vw - 120px);
  padding: 14px 18px;
  border-radius: 16px;
  font-size: 15px;
  line-height: 1.55;
}

.path-msg-bubble-user {
  background: #f0f4f9;
  color: #1f1f1f;
}

.path-msg-bubble-model {
  background: #fff;
  border: 1px solid rgba(147, 51, 234, 0.12);
  box-shadow: 0 2px 12px rgba(147, 51, 234, 0.06);
}

.path-msg-bubble-text {
  color: #374151;
  white-space: pre-wrap;
  word-break: break-word;
}

.path-msg-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: calc(100% - 48px);
}

.path-msg-loading {
  padding: 16px 20px;
  background: #f8fafc;
  border-radius: 12px;
  color: #64748b;
  font-size: 14px;
}

.path-msg-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.path-msg-loading-inline {
  font-size: 13px;
  color: #64748b;
}

.path-action-btn {
  min-width: 120px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.path-action-confirm {
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
  color: #fff;
}

.path-action-confirm:hover {
  background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
}

.path-action-polish {
  background: #fff;
  color: #7c3aed;
  border: 1.5px solid rgba(147, 51, 234, 0.4);
}

.path-action-polish:hover {
  background: rgba(147, 51, 234, 0.06);
}
</style>
