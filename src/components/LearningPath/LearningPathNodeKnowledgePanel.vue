<template>
  <div class="lp-knowledge-card">
    <div class="lp-knowledge-header">
      <span class="lp-knowledge-title">相关知识点推荐</span>
      <span class="lp-knowledge-ai-hint">（内容由AI生成）</span>
    </div>

    <div v-if="loading" class="lp-knowledge-loading">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="loading-text">正在为你整理这部分要学的关键知识点...</span>
    </div>

    <div v-else-if="error" class="lp-knowledge-error">
      <span class="error-text">{{ error }}</span>
      <button type="button" class="error-retry" @click="refresh">重试</button>
    </div>

    <ul v-else-if="items.length" class="lp-knowledge-list">
      <li
        v-for="(item, idx) in items"
        :key="idx"
        class="lp-knowledge-item"
        @click="handleItemClick(item)"
      >
        <span class="bullet"></span>
        <div class="content">
          {{ item }}
        </div>
      </li>
    </ul>

    <div v-else class="lp-knowledge-empty">
      暂无推荐知识点，建议先完善该节点的名称与上下游结构。
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { learningPathApi } from '../../api/learningPath'

const props = defineProps({
  /** 节点主题文案：用于提示 & 作为接口入参 topic */
  topic: { type: String, default: '' },
  userId: { type: [String, Number], default: null },
})

const loading = ref(false)
const error = ref('')
const items = ref([])

const normalizeItems = (raw) => {
  if (!raw) return []
  const arr = Array.isArray(raw)
    ? raw
    : (raw.items || (raw.data && raw.data.items) || raw.list || [])
  return arr
    .map((it) => {
      if (!it) return ''
      if (typeof it === 'string') return it.trim()
      return (
        // 后端结构：{ title, question }，只展示 question 内容
        it.question ||
        it.content ||
        it.detail ||
        it.description ||
        it.text ||
        it.body ||
        ''
      )
    })
    .map((s) => String(s || '').trim())
    .filter(Boolean)
}

const fetchData = async () => {
  const topic = (props.topic || '').trim()
  if (!topic) {
    items.value = []
    error.value = ''
    return
  }
  loading.value = true
  error.value = ''
  try {
    const data = await learningPathApi.recommendNodeKnowledge(
      { topic },
      props.userId ?? undefined
    )
    items.value = normalizeItems(data)
  } catch (e) {
    error.value = e?.message || '知识点推荐获取失败，请稍后重试'
    items.value = []
  } finally {
    loading.value = false
  }
}

const refresh = () => {
  fetchData()
}

const handleItemClick = (content) => {
  const text = String(content || '').trim()
  if (!text) return
  try {
    sessionStorage.setItem(
      'twin_study_pending_input',
      JSON.stringify({ source: 'learning-path-node', text })
    )
  } catch (_) {}
  window.location.href = '/twin-study'
}

watch(
  () => props.topic,
  () => {
    fetchData()
  },
  { immediate: true }
)
</script>

<style scoped>
.lp-knowledge-card {
  margin-top: 16px;
  padding: 14px 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: linear-gradient(135deg, #f9fafb, #f5f3ff);
}

.lp-knowledge-header {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 10px;
}

.lp-knowledge-title {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
}

.lp-knowledge-ai-hint {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.lp-knowledge-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 10px;
  border-radius: 12px;
  background: rgba(239, 246, 255, 0.9);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #6366f1;
  animation: blink 1s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.12s;
}

.dot:nth-child(3) {
  animation-delay: 0.24s;
}

.loading-text {
  font-size: 12px;
  color: #4b5563;
}

.lp-knowledge-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(254, 242, 242, 0.9);
  border: 1px solid rgba(248, 113, 113, 0.45);
}

.error-text {
  font-size: 12px;
  color: #b91c1c;
  font-weight: 700;
}

.error-retry {
  border-radius: 999px;
  padding: 4px 10px;
  border: 1px solid rgba(220, 38, 38, 0.35);
  background: #fff;
  color: #b91c1c;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.lp-knowledge-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lp-knowledge-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
}

.bullet {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #6366f1;
  margin-top: 6px;
  flex-shrink: 0;
}

.content {
  font-size: 13px;
  color: #374151;
  line-height: 1.7;
}

.lp-knowledge-item:hover .content {
  color: #7c3aed;
  text-decoration: underline;
}

.lp-knowledge-empty {
  padding: 10px 12px;
  border-radius: 12px;
  background: #f9fafb;
  font-size: 12px;
  color: #6b7280;
}

@keyframes blink {
  0%, 100% {
    opacity: 0.4;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-1px);
  }
}
</style>

