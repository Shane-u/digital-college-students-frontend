<template>
  <div class="message-list">
    <div 
      v-for="msg in messages"
      :key="msg.id"
      :class="['message-item', { 'message-user': msg.role === 'user', 'message-model': msg.role === 'model' }]"
    >
      <div v-if="msg.role === 'model'" class="message-avatar">
        <LoaderIcon v-if="msg.isStreaming" class="spinner" />
        <SparklesIcon v-else />
      </div>

      <div :class="['message-content-wrapper', { 'message-user-wrapper': msg.role === 'user' }]">
        <div v-if="msg.role === 'model' && msg.workflow" class="workflow-container">
          <WorkflowSteps :workflow="msg.workflow" :currentNodeId="msg.currentNodeId" />
        </div>

        <div :class="['message-bubble', { 'message-user-bubble': msg.role === 'user' }]">
          <component v-if="msg.role === 'model' && msg.thought" :is="ThinkingBlockComponent" :content="msg.thought" />

          <div v-if="msg.role === 'model' && msg.knowledgeBase" class="knowledge-base">
            <BookOpenIcon />
            <span>已检索知识库: {{ msg.knowledgeBase }}</span>
          </div>

          <div class="markdown-content" v-html="renderMarkdown(msg.content || (msg.isStreaming && !msg.workflow ? '...' : ''))"></div>

          <div v-if="msg.role === 'model' && msg.references && msg.references.length > 0" class="references">
            <div class="references-header">
              <LinkIcon />
              <span>参考内容</span>
            </div>
            <div class="references-list">
              <a 
                v-for="(ref, i) in msg.references"
                :key="ref.id || i"
                :href="ref.url"
                target="_blank"
                rel="noopener noreferrer"
                class="reference-item"
              >
                <span class="reference-index">[{{ i + 1 }}]</span> {{ ref.title }}
              </a>
            </div>
          </div>

          <span v-if="msg.isStreaming && !msg.content && !msg.workflow && !msg.thought" class="streaming-indicator">
            Generating...
          </span>
        </div>

        <div v-if="msg.role === 'model' && !msg.isStreaming" class="message-actions">
          <button class="action-btn"><ThumbsUpIcon /></button>
          <button class="action-btn"><ThumbsDownIcon /></button>
          <button class="action-btn"><ShareIcon /></button>
          <button class="action-btn"><RotateCcwIcon /></button>
          <button @click="copyToClipboard(msg.content)" class="action-btn">
            <CopyIcon />
          </button>
        </div>
      </div>

      <div v-if="msg.role === 'user'" class="message-avatar user-avatar">
        Z
      </div>
    </div>
    <div ref="endRef"></div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { marked } from 'marked'
import { h } from 'vue'
import WorkflowSteps from './WorkflowSteps.vue'

const SparklesIcon = () => h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'currentColor' }, [
  h('path', { d: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' })
])

const LoaderIcon = () => h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, class: 'spinner' }, [
  h('line', { x1: 12, y1: 2, x2: 12, y2: 6 }),
  h('line', { x1: 12, y1: 18, x2: 12, y2: 22 }),
  h('line', { x1: 4.93, y1: 4.93, x2: 7.76, y2: 7.76 }),
  h('line', { x1: 16.24, y1: 16.24, x2: 19.07, y2: 19.07 }),
  h('line', { x1: 2, y1: 12, x2: 6, y2: 12 }),
  h('line', { x1: 18, y1: 12, x2: 22, y2: 12 }),
  h('line', { x1: 4.93, y1: 19.07, x2: 7.76, y2: 16.24 }),
  h('line', { x1: 16.24, y1: 7.76, x2: 19.07, y2: 4.93 })
])

const BookOpenIcon = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' }),
  h('path', { d: 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' })
])

const LinkIcon = () => h('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' }),
  h('path', { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' })
])

const ThumbsUpIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3' })
])

const ThumbsDownIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17' })
])

const ShareIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('circle', { cx: 18, cy: 5, r: 3 }),
  h('circle', { cx: 6, cy: 12, r: 3 }),
  h('circle', { cx: 18, cy: 19, r: 3 }),
  h('line', { x1: 8.59, y1: 13.51, x2: 15.42, y2: 17.49 }),
  h('line', { x1: 15.41, y1: 6.51, x2: 8.59, y2: 10.49 })
])

const RotateCcwIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('polyline', { points: '1 4 1 10 7 10' }),
  h('path', { d: 'M3.51 15a9 9 0 1 0 2.13-9.36L1 10' })
])

const CopyIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('rect', { x: 9, y: 9, width: 13, height: 13, rx: 2, ry: 2 }),
  h('path', { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' })
])

const ThinkingBlock = {
  props: {
    content: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const isExpanded = ref(true)
    return () => {
      if (!props.content) return null
      return h('div', { class: 'thinking-block' }, [
        h('button', {
          onClick: () => isExpanded.value = !isExpanded.value,
          class: 'thinking-toggle'
        }, [
          h('span', '思考过程'),
          h(isExpanded.value ? ChevronUpIcon : ChevronDownIcon)
        ]),
        isExpanded.value && h('div', { class: 'thinking-content' }, props.content)
      ])
    }
  }
}

const ChevronUpIcon = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('polyline', { points: '18 15 12 9 6 15' })
])

const ChevronDownIcon = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('polyline', { points: '6 9 12 15 18 9' })
])

const props = defineProps({
  messages: {
    type: Array,
    required: true
  }
})

const endRef = ref(null)

// 注册 ThinkingBlock 组件
const ThinkingBlockComponent = ThinkingBlock

const renderMarkdown = (text) => {
  if (!text) return ''
  try {
    return marked.parse(text)
  } catch (e) {
    return text
  }
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

watch(() => props.messages, () => {
  nextTick(() => {
    if (endRef.value) {
      endRef.value.scrollIntoView({ behavior: 'smooth' })
    }
  })
}, { deep: true })
</script>

<style scoped>
.message-list {
  width: 100%;
  max-width: 64rem;
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.message-item {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}

.message-item.message-model {
  justify-content: flex-start;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e0f2fe;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0284c7;
  flex-shrink: 0;
  margin-top: 4px;
}

.message-avatar.user-avatar {
  background: linear-gradient(to top right, #a855f7, #ec4899);
  color: white;
  font-size: 12px;
  font-weight: 700;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.message-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 85%;
  align-items: flex-start;
}

.message-user-wrapper {
  align-items: flex-end;
}

.message-bubble {
  padding: 14px 20px;
  border-radius: 24px;
  font-size: 16px;
  line-height: 1.6;
  transition: all 0.2s;
}

.message-user-bubble {
  background: #f0f4f9;
  color: #1f1f1f;
}

.workflow-container {
  width: 100%;
  margin-bottom: 16px;
}

.thinking-block {
  width: 100%;
  margin-bottom: 16px;
  border-left: 2px solid #d3e3fd;
  padding-left: 16px;
}

.thinking-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #444746;
  font-size: 14px;
  font-weight: 500;
  background: transparent;
  border: none;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.thinking-toggle:hover {
  background: #f0f4f9;
}

.thinking-content {
  margin-top: 8px;
  color: #5e5e5e;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  font-style: italic;
}

.knowledge-base {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #2563eb;
  font-weight: 500;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #dbeafe;
}

.markdown-content {
  line-height: 1.6;
}

.markdown-content :deep(h1) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.markdown-content :deep(h2) {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.markdown-content :deep(h3) {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.markdown-content :deep(p) {
  margin-bottom: 1rem;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.25rem;
}

.markdown-content :deep(code) {
  background-color: #f0f4f9;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background-color: #f0f4f9;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #d3e3fd;
  padding-left: 1rem;
  color: #444746;
  font-style: italic;
  margin-bottom: 1rem;
}

.references {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #edf2f7;
}

.references-header {
  font-size: 12px;
  font-weight: 700;
  color: #444746;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.references-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reference-item {
  font-size: 13px;
  color: #3b82f6;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reference-item:hover {
  text-decoration: underline;
}

.reference-index {
  opacity: 0.6;
}

.streaming-indicator {
  animation: pulse 1.5s ease-in-out infinite;
  opacity: 0.5;
  font-style: italic;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.message-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  margin-left: -8px;
}

.action-btn {
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

.action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}
</style>
