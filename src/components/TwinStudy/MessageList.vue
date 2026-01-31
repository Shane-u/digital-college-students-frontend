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
          <component v-if="msg.role === 'model' && msg.thought" :is="ThinkingBlockComponent" :content="msg.thought" :isStreaming="msg.isStreaming" />

          <div v-if="msg.role === 'model' && msg.thought && msg.content" class="thinking-divider"></div>

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

          <component v-if="msg.role === 'model' && msg.knowledgeParagraphs && msg.knowledgeParagraphs.length > 0" :is="KnowledgeSourceComponent" :paragraphs="msg.knowledgeParagraphs" />

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
          <button 
            v-if="msg.content && msg.content.trim().length > 50" 
            @click="generateFlashCard(msg.content)" 
            class="action-btn flash-card-btn"
            :disabled="flashCardGenerating"
            :title="flashCardGenerating ? '生成中...' : '生成记忆闪卡'"
          >
            <FlashCardIcon />
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
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import MarkdownIt from 'markdown-it'
import { h } from 'vue'
import DOMPurify from 'dompurify'


const md = new MarkdownIt({
  html: true, // 允许输出 HTML 标签
  linkify: true, // 自动将像 URL 的文本转换为链接
  typographer: true, // 启用一些排版替换，如 "foo" -> “foo”
  breaks: true // 将 \n 转换为 <br>
})
import WorkflowSteps from './WorkflowSteps.vue'
import { sanitizeHtml } from '../../utils/sanitizeHtml'
import { flashCardApi } from '../../api/flashCard'

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

const FlashCardIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('rect', { x: 2, y: 3, width: 20, height: 14, rx: 2, ry: 2 }),
  h('line', { x1: 8, y1: 21, x2: 16, y2: 21 }),
  h('line', { x1: 12, y1: 17, x2: 12, y2: 21 })
])

const ThinkingBlock = {
  props: {
    content: {
      type: String,
      required: true
    },
    isStreaming: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const isExpanded = ref(true)
    
    // 监听isStreaming变化，当流式传输结束时自动收缩
    watch(() => props.isStreaming, (newVal, oldVal) => {
      if (oldVal && !newVal) {
        // 从streaming变为非streaming，自动收缩
        isExpanded.value = false
      }
    })
    
    return () => {
      if (!props.content) return null
      
      // 移除 <details> 标签及其内容（通常用于调试信息）
      const cleanedContent = props.content.replace(/<details>[\s\S]*?<\/details>/gi, '')
      
      return h('div', { class: 'thinking-block' }, [
        h('button', {
          onClick: () => isExpanded.value = !isExpanded.value,
          class: 'thinking-toggle'
        }, [
          h('span', '思考过程'),
          h(isExpanded.value ? ChevronUpIcon : ChevronDownIcon, { size: 14 })
        ]),
        isExpanded.value && h('div', { class: 'thinking-content', innerHTML: renderMarkdown(cleanedContent) })
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

const StarIcon = (props = {}) => h('svg', { width: props.size || 14, height: props.size || 14, viewBox: '0 0 24 24', fill: props.fill || 'currentColor', stroke: 'currentColor', 'stroke-width': 2, class: props.class }, [
  h('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' })
])

const FileTextIcon = (props = {}) => h('svg', { width: props.size || 14, height: props.size || 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
  h('polyline', { points: '14 2 14 8 20 8' }),
  h('line', { x1: 16, y1: 13, x2: 8, y2: 13 }),
  h('line', { x1: 16, y1: 17, x2: 8, y2: 17 }),
  h('polyline', { points: '10 9 9 9 8 9' })
])

const BookOpenTextIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' }),
  h('path', { d: 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' }),
  h('path', { d: 'M10 12H8' }),
  h('path', { d: 'M16 12h2' }),
  h('path', { d: 'M16 18h2' }),
  h('path', { d: 'M10 18H8' })
])

const KnowledgeSource = {
  props: {
    paragraphs: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    return () => {
      // console.log('[KnowledgeSource] 接收到的paragraphs:', props.paragraphs)
      if (!props.paragraphs || props.paragraphs.length === 0) {
        // console.log('[KnowledgeSource] paragraphs为空，不渲染')
        return null
      }
      // console.log('[KnowledgeSource] 准备渲染', props.paragraphs.length, '个知识来源')
      
      // 获取文档名称（从第一个段落或所有段落中提取）
      const getDocumentName = () => {
        if (props.paragraphs.length > 0) {
          return props.paragraphs[0].document_name || '知识来源'
        }
        return '知识来源'
      }
      
      return h('div', { class: 'knowledge-sources-container' }, [
        h('div', { class: 'knowledge-sources-header' }, [
          h(FileTextIcon, { size: 20 }),
          h('span', { class: 'knowledge-sources-title' }, '知识来源')
        ]),
        ...props.paragraphs.map((p, idx) => {
          const similarity = p.similarity || p.score || 0
          const documentName = p.document_name || p.documentName || '未知文档'
          const title = p.problem_title || p.problemTitle || p.title || ''
          const content = p.content || p.text || ''
          const link = p.url || p.link || p.source_url || p.sourceUrl || ''
          const datasetName = p.dataset_name || p.datasetName || ''
          
          return h('details', { 
            key: p.id || idx,
            class: 'knowledge-source-detail',
            open: idx === 0 // 默认展开第一个
          }, [
            h('summary', { class: 'knowledge-source-summary' }, [
              h(BookOpenTextIcon),
              h('span', { class: 'knowledge-source-summary-text' }, 
                documentName || `知识来源 ${idx + 1}`
              )
            ]),
            h('div', { class: 'knowledge-source-detail-content' }, [
              // 排序和得分
              h('div', { class: 'knowledge-source-meta' }, [
                h('span', { class: 'knowledge-source-rank' }, `排序: ${idx + 1}`),
                similarity > 0 && h('span', { class: 'knowledge-source-score' }, `得分: ${typeof similarity === 'number' ? similarity.toFixed(3) : similarity}`)
              ]),
              // 标题
              title && title !== documentName && h('div', { class: 'knowledge-source-item-title' }, title),
              // 内容
              content && h('div', { 
                class: 'knowledge-source-item-content',
                innerHTML: renderMarkdown(content)
              }),
              // 链接
              link && h('div', { class: 'knowledge-source-item-link' }, [
                h('a', {
                  href: link,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  class: 'knowledge-source-link'
                }, [
                  h(LinkIcon, { size: 14 }),
                  h('span', '查看原文')
                ])
              ]),
              // 数据集名称
              datasetName && h('div', { class: 'knowledge-source-dataset' }, [
                h('span', { class: 'knowledge-source-dataset-label' }, '数据集:'),
                h('span', { class: 'knowledge-source-dataset-name' }, datasetName)
              ])
            ])
          ])
        })
      ])
    }
  }
}

const props = defineProps({
  messages: {
    type: Array,
    required: true
  }
})

const endRef = ref(null)
const flashCardGenerating = ref(false)

// 注册 ThinkingBlock 组件
const ThinkingBlockComponent = ThinkingBlock

// 注册 KnowledgeSource 组件
const KnowledgeSourceComponent = KnowledgeSource

const renderMarkdown = (text) => {
  if (!text) return ''

  try {
    const cleanedText = text.replace(/<details>[\s\S]*?<\/details>/gi, '')

    let finalHtml = ''
    let textToProcess = cleanedText

    const codeBlockMarker = '```'
    const codeBlockCount = (textToProcess.match(/```/g) || []).length

    if (codeBlockCount % 2 !== 0) {
      // 存在未闭合的代码块
      const lastOpeningCodeBlockIndex = textToProcess.lastIndexOf(codeBlockMarker)
      if (lastOpeningCodeBlockIndex !== -1) {
        // 渲染最后一个未闭合代码块之前的部分
        const textBeforeCodeBlock = textToProcess.substring(0, lastOpeningCodeBlockIndex)
        // 未闭合的代码块部分
        const codeBlockFragment = textToProcess.substring(lastOpeningCodeBlockIndex)

        finalHtml += md.render(textBeforeCodeBlock)
        // 将未闭合的代码块作为纯文本预格式化显示
        finalHtml += `<pre class="streaming-code-fragment">${codeBlockFragment}</pre>`
      } else {
        // 理论上不应该出现，但作为兜底，如果找不到` ``` `就直接渲染
        finalHtml += md.render(textToProcess)
      }
    } else {
      // 代码块是闭合的，或者没有代码块，直接渲染所有内容
      finalHtml += md.render(textToProcess)
    }

    // Ensure DOMPurify is still used for the final output.
    return DOMPurify.sanitize(finalHtml)

  } catch (e) {
    console.error('[renderMarkdown] Markdown rendering error:', e)
    // 兜底：作为纯文本显示（转义）
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const generateFlashCard = async (content) => {
  if (flashCardGenerating.value) return
  
  try {
    flashCardGenerating.value = true
    
    // 使用原生fetch以便检查HTTP状态码
    const response = await fetch('/api/flash-card/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        originalContent: content
      })
    })
    
    // 使用HTTP状态码200来判断成功
    if (response.ok && response.status === 200) {
      // 显示成功消息
      const notification = document.createElement('div')
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: #10B981;
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
      `
      notification.textContent = '闪卡生成中，完成后会通知您'
      document.body.appendChild(notification)
      
      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease'
        setTimeout(() => notification.remove(), 300)
      }, 3000)
    } else {
      // HTTP状态码不是200，尝试解析错误信息
      let errorMessage = '生成失败'
      try {
        const result = await response.json()
        errorMessage = result.message || result.error || errorMessage
      } catch (e) {
        errorMessage = `HTTP错误: ${response.status}`
      }
      throw new Error(errorMessage)
    }
  } catch (error) {
    console.error('生成闪卡失败:', error)
    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: #EF4444;
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `
    notification.textContent = `生成闪卡失败: ${error.message}`
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease'
      setTimeout(() => notification.remove(), 300)
    }, 3000)
  } finally {
    flashCardGenerating.value = false
  }
}

const isUserScrolling = ref(false)

const handleScroll = () => {
  const el = endRef.value?.parentElement
  if (el) {
    // 如果滚动条不在底部20px范围内，则认为用户正在滚动
    isUserScrolling.value = el.scrollHeight - el.scrollTop > el.clientHeight + 20
  }
}

// 监听消息变化时自动滚动，但要考虑用户是否在手动滚动
watch(() => props.messages, () => {
  nextTick(() => {
    if (endRef.value && !isUserScrolling.value) {
      endRef.value.scrollIntoView({ behavior: 'smooth' })
    }
  })
}, { deep: true })

// 挂载时监听滚动事件，卸载时移除
onMounted(() => {
  const el = endRef.value?.parentElement
  if (el) {
    el.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  const el = endRef.value?.parentElement
  if (el) {
    el.removeEventListener('scroll', handleScroll)
  }
})
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
  background: white;
  color: #1f1f1f;
}

.message-user-bubble {
  background: #f0f4f9;
  color: #1f1f1f;
  width: fit-content;
  max-width: 100%;
  display: flex;
  align-items: center;
  padding: 10px 16px;
  min-height: auto;
}

.workflow-container {
  width: 100%;
  margin-bottom: 16px;
}

.thinking-block {
  width: 100%;
  margin-bottom: 16px;
}

.thinking-block :deep(button.thinking-toggle),
button.thinking-toggle {
  display: inline-flex !important;
  align-items: center;
  gap: 8px;
  color: #6366f1 !important;
  font-size: 13px;
  font-weight: 500;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(139, 92, 246, 0.06) 100%) !important;
  border: none !important;
  outline: none !important;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  user-select: none;
}

.thinking-block :deep(button.thinking-toggle::before),
button.thinking-toggle::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.thinking-block :deep(button.thinking-toggle:hover),
button.thinking-toggle:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%) !important;
  color: #4f46e5 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.thinking-block :deep(button.thinking-toggle:hover::before),
button.thinking-toggle:hover::before {
  opacity: 1;
}

.thinking-block :deep(button.thinking-toggle:active),
button.thinking-toggle:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.2);
}

.thinking-block :deep(button.thinking-toggle > *),
button.thinking-toggle > * {
  position: relative;
  z-index: 1;
}

.thinking-content {
  margin-top: 8px;
  color: #5e5e5e;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  font-style: italic;
}

.thinking-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #e0e0e0, transparent);
  margin: 16px 0;
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

/* 知识来源容器 */
.knowledge-sources-container {
  width: 100%;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px dashed #cccccc;
}

.knowledge-sources-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 16px;
}

.knowledge-sources-title {
  font-size: 16px;
  font-weight: 600;
  color: #4a5568;
}

/* 知识来源详情项 */
.knowledge-source-detail {
  margin-bottom: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.knowledge-source-summary {
  padding: 12px 16px;
  font-weight: 600;
  cursor: pointer;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 8px;
  list-style: none;
  user-select: none;
  transition: background-color 0.2s;
}

.knowledge-source-summary::-webkit-details-marker {
  display: none;
}

.knowledge-source-summary:hover {
  background: #f5f7fa;
}

.knowledge-source-detail[open] .knowledge-source-summary {
  border-bottom: 1px solid #e0e0e0;
}

.knowledge-source-summary-text {
  flex: 1;
}

.knowledge-source-detail-content {
  padding: 12px 16px;
  border-top: 1px solid #e0e0e0;
  background: #fcfcfc;
}

.knowledge-source-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #666;
}

.knowledge-source-rank {
  font-weight: 500;
}

.knowledge-source-score {
  font-weight: 500;
  color: #667eea;
}

.knowledge-source-item-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.5;
}

.knowledge-source-item-content {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 13px;
  line-height: 1.6;
  color: #2c3e50;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.knowledge-source-item-content :deep(p) {
  margin: 0 0 8px 0;
}

.knowledge-source-item-content :deep(p:last-child) {
  margin-bottom: 0;
}

.knowledge-source-item-content :deep(code) {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.9em;
}

.knowledge-source-item-content :deep(pre) {
  background: #282c34;
  color: #abb2bf;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
}

.knowledge-source-item-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
}

.knowledge-source-item-link {
  margin-bottom: 8px;
}

.knowledge-source-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #667eea;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: color 0.2s;
}

.knowledge-source-link:hover {
  color: #5568d3;
  text-decoration: underline;
}

.knowledge-source-dataset {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.knowledge-source-dataset-label {
  font-weight: 500;
  color: #888;
}

.knowledge-source-dataset-name {
  color: #667eea;
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

.flash-card-btn {
  color: #2563EB;
}

.flash-card-btn:hover {
  background: rgba(37, 99, 235, 0.1);
}

.flash-card-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
.streaming-code-fragment {
  background-color: #f0f4f9;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1rem;
  color: #5e5e5e;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  opacity: 0.8;
}
</style>
