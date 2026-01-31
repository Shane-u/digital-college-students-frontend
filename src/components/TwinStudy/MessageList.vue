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
          <component v-if="msg.role === 'model' && msg.thought" :is="ThinkingBlockComponent" :content="msg.thought" :thoughtDone="msg.thoughtDone !== false" :isStreaming="msg.isStreaming" />

          <div v-if="msg.role === 'model' && msg.thought && msg.content" class="thinking-divider"></div>

          <div v-if="msg.role === 'model' && !msg.isStreaming && msg.knowledgeBase" class="knowledge-base">
            <BookOpenIcon />
            <span>已检索知识库: {{ msg.knowledgeBase }}</span>
          </div>

          <!-- 流式时：仅挂 ref，由 TwinStudyPage 直接设置 innerHTML（参考 bailian-chat.demo） -->
          <div v-if="msg.isStreaming" class="markdown-content" :ref="(el) => setStreamingElRef(el, msg)"></div>
          <!-- 非流式时：用 v-html 渲染，避免覆盖父级直接写入的内容 -->
          <div v-else class="markdown-content" v-html="renderMarkdown(getDisplayContent(msg))"></div>

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

          <component v-if="msg.role === 'model' && !msg.isStreaming && msg.knowledgeParagraphs && msg.knowledgeParagraphs.length > 0" :is="KnowledgeSourceComponent" :paragraphs="msg.knowledgeParagraphs" @open-modal="openKnowledgeModal(msg)" />

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

    <!-- 知识库引用弹窗：图二内容 + 图三样式 -->
    <Teleport to="body">
      <div v-if="showKnowledgeModal" class="knowledge-modal-mask" @click.self="closeKnowledgeModal">
        <div class="knowledge-modal" :class="{ 'has-multiple-refs': modalParagraphs.length > 1 }">
          <div class="knowledge-modal-header">
            <span class="knowledge-modal-title">知识库引用</span>
            <button type="button" class="knowledge-modal-close" aria-label="关闭" @click="closeKnowledgeModal">×</button>
          </div>
          <div class="knowledge-modal-body">
            <div class="knowledge-modal-section">
              <div class="knowledge-modal-label">用户问题</div>
              <div class="knowledge-modal-question">{{ modalUserQuestion }}</div>
            </div>
            <div class="knowledge-modal-section">
              <div class="knowledge-modal-label">引用</div>
              <div v-for="(p, idx) in modalParagraphs" :key="p.id || idx" class="knowledge-modal-card">
                <div class="knowledge-modal-card-top">
                  <span class="knowledge-modal-top-tag">TOP{{ idx + 1 }}</span>
                  <span class="knowledge-modal-recall">召回标题: 分段{{ p.segment_id ?? idx + 1 }}</span>
                  <span class="knowledge-modal-stars">{{ scoreToStars(p.similarity ?? p.score ?? 0) }}</span>
                  <span class="knowledge-modal-score">{{ typeof (p.similarity ?? p.score) === 'number' ? (p.similarity ?? p.score).toFixed(3) : (p.similarity ?? p.score ?? '') }}</span>
                </div>
                <div class="knowledge-modal-card-content" v-html="renderMarkdown(p.content || p.text || '')"></div>
                <div class="knowledge-modal-card-footer">
                  <a :href="getDocHref(p)" target="_blank" rel="noopener noreferrer" class="knowledge-modal-doc-link">
                    <span class="knowledge-modal-doc-icon">📄</span>
                    {{ p.document_name || p.documentName || '文档' }}
                  </a>
                  <span v-if="p.dataset_name || p.datasetName" class="knowledge-modal-platform">{{ p.dataset_name || p.datasetName }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted, inject } from 'vue'
import { h } from 'vue'
import WorkflowSteps from './WorkflowSteps.vue'
import { renderMarkdownToHtml } from '../../utils/markdownRender'
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

const FLASHCARD_SVG_PATH = 'M688 925.504l-8.928-2.272a61.472 61.472 0 0 1-8.8-3.2 6.944 6.944 0 0 0-1.248-0.352 25.312 25.312 0 0 1-6.176-1.984c-3.424-1.664-6.4-1.696-10.048-3.2a25.6 25.6 0 0 0-6.4-1.984c-3.2-0.608-6.016-2.816-9.248-3.2a17.728 17.728 0 0 1-5.184-1.728 25.6 25.6 0 0 0-6.4-1.984c-3.2-0.576-6.016-2.72-9.184-3.2-3.904-0.576-7.392-2.944-11.68-3.808a27.456 27.456 0 0 1-6.208-2.304 4.704 4.704 0 0 0-0.96-0.352l-3.712-0.896q-8.672-2.624-55.936-18.56c-4.032-1.376-7.808-1.856-12.064-3.2q-26.624-9.28-53.024-17.888-3.424-1.12-5.536-1.568c-3.968-0.896-6.784-2.88-10.432-3.456s-7.104-3.2-11.2-3.808c-3.2-0.576-5.856-2.56-9.248-3.2s-6.912-2.88-10.752-3.584a17.888 17.888 0 0 1-4.896-1.568c-3.616-1.792-7.232-1.856-11.04-3.808a18.816 18.816 0 0 0-4.736-1.504 29.6 29.6 0 0 1-6.976-2.464 8.096 8.096 0 0 0-2.112-0.704c-4.384-0.832-7.712-2.784-11.648-3.744s-6.784-2.72-10.88-3.52a25.6 25.6 0 0 1-6.144-2.304 8.672 8.672 0 0 0-1.728-0.608c-7.488-1.728-16-4.896-23.328-7.328q-18.144-5.952-25.6-8.512a85.504 85.504 0 0 1-9.6-3.2 9.312 9.312 0 0 0-1.696-0.64 52.928 52.928 0 0 1-9.824-3.456 19.2 19.2 0 0 0-5.76-1.76 19.872 19.872 0 0 1-8.992-4.544 53.44 53.44 0 0 0-2.24-2.048 9.824 9.824 0 0 0-1.696-1.024l-4.832-2.368-0.288-0.192q-7.2-6.848-14.976-15.104a13.696 13.696 0 0 1-2.56-4 0.672 0.672 0 0 1 0-0.64 0.64 0.64 0 0 1 0.544-0.288h355.392a73.408 73.408 0 0 0 12.32-0.864 157.216 157.216 0 0 0 23.36-5.056q6.4-2.144 7.36-2.336a27.008 27.008 0 0 0 7.264-2.464q3.648-1.856 11.616-5.088a174.592 174.592 0 0 0 18.912-10.4c3.712-2.08 8.448-6.656 12.8-9.6a44.8 44.8 0 0 0 5.12-3.84 125.024 125.024 0 0 0 22.816-25.344 17.088 17.088 0 0 1 1.792-2.464 25.376 25.376 0 0 0 5.088-7.008 22.048 22.048 0 0 1 4.096-6.08 1.824 1.824 0 0 0 0.32-0.448l9.6-18.88a5.312 5.312 0 0 0 0.48-1.472l0.512-2.944a8 8 0 0 1 0.576-1.888 86.976 86.976 0 0 0 5.344-15.008q2.016-9.152 3.008-14.56a136 136 0 0 0 1.952-23.68v-270.016a8.352 8.352 0 0 1 1.312-4.704 0.896 0.896 0 0 1 0.576-0.384 0.896 0.896 0 0 1 0.672 0.16 18.592 18.592 0 0 0 7.296 3.488q3.552 0.8 6.08 1.6c9.088 2.944 18.368 5.28 26.56 8.192a18.4 18.4 0 0 0 3.2 0.864c4.064 0.672 7.328 3.008 10.72 3.488s6.88 3.008 10.624 3.52 6.048 2.72 9.6 3.2a27.264 27.264 0 0 1 4.8 1.248q5.888 2.08 14.656 4.384a20.544 20.544 0 0 1 3.456 1.248 39.68 39.68 0 0 0 9.6 3.744 24.576 24.576 0 0 1 8.736 3.872q6.976 5.056 8.704 5.952a7.264 7.264 0 0 1 1.6 1.12 106.144 106.144 0 0 1 9.92 8.96 107.264 107.264 0 0 1 10.784 13.504q1.536 2.56 4.896 7.2a17.952 17.952 0 0 1 2.56 5.152 124.8 124.8 0 0 1 5.152 16.928c0.48 3.68 1.888 7.168 2.176 11.328a107.744 107.744 0 0 1-0.672 20.288 54.4 54.4 0 0 1-1.696 8.832 101.408 101.408 0 0 1-4.544 15.52c-1.472 3.008-1.344 6.08-2.976 9.152s-1.888 7.36-3.584 10.816a15.456 15.456 0 0 0-1.696 4.96c-0.416 3.552-2.752 6.624-3.2 10.208s-3.2 7.04-3.648 10.656-2.944 6.656-3.424 10.56-3.2 7.04-3.584 11.36a3.2 3.2 0 0 1-0.256 1.056l-2.528 5.696a5.984 5.984 0 0 0-0.448 1.632 23.168 23.168 0 0 1-2.752 8.064c-0.896 1.632-0.864 5.088-1.984 7.296a21.216 21.216 0 0 0-2.144 6.08c-0.544 3.744-3.2 7.2-3.616 10.432-0.384 3.84-2.784 6.72-3.392 10.56a16.608 16.608 0 0 1-1.632 5.024 26.368 26.368 0 0 0-2.272 7.136 6.592 6.592 0 0 1-0.384 1.312l-2.24 5.184a4.64 4.64 0 0 0-0.32 1.024 23.072 23.072 0 0 1-1.6 5.792 19.808 19.808 0 0 0-1.792 5.024q0 0.864-3.2 10.4a56.864 56.864 0 0 1-2.016 5.728c-1.088 2.432-1.472 4.8-2.496 7.712q-3.2 8.64-5.856 17.344-2.208 6.944-8.384 25.088-4.64 13.664-9.216 27.424-4.896 14.688-11.264 34.4-1.824 5.696-2.752 8.896-1.888 6.656-2.656 8.896l-27.392 82.496a56.672 56.672 0 0 1-3.968 8.96 4.352 4.352 0 0 0-0.48 1.44 46.016 46.016 0 0 1-7.776 16 38.4 38.4 0 0 1-4.448 5.824 139.104 139.104 0 0 1-16.512 16.736 8.544 8.544 0 0 1-1.728 1.088 66.912 66.912 0 0 0-10.88 6.944l-0.512 0.32-2.592 1.312a13.92 13.92 0 0 1-2.272 0.896 66.976 66.976 0 0 0-10.656 4.064 7.84 7.84 0 0 1-2.24 0.704c-5.152 0.768-9.44 2.016-14.752 2.336-2.592 0-5.216 0.256-7.776 0.256a86.4 86.4 0 0 1-21.824-2.496zM599.872 691.2l-413.664-0.8A90.368 90.368 0 0 1 96 599.904l0.736-413.696A90.368 90.368 0 0 1 187.232 96l413.664 0.736A90.368 90.368 0 0 1 691.2 187.232l-0.736 413.696A90.368 90.368 0 0 1 600 691.2zM185.6 186.752v324.448a1.152 1.152 0 0 0 1.152 1.152h413.664a1.152 1.152 0 0 0 1.152-1.152V186.752a1.152 1.152 0 0 0-1.152-1.152H186.816a1.152 1.152 0 0 0-1.216 1.152z'
const FlashCardIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 1024 1024', fill: '#CE89D1' }, [
  h('path', { d: FLASHCARD_SVG_PATH })
])

const ThinkingBlock = {
  props: {
    content: {
      type: String,
      required: true
    },
    /** 思考内容是否已结束（出现 </think> 即 true），用于思考一结束就收起，不等整条回复结束 */
    thoughtDone: {
      type: Boolean,
      default: false
    },
    isStreaming: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const isExpanded = ref(!props.thoughtDone)
    watch(() => props.thoughtDone, (done) => {
      if (done) isExpanded.value = false
    })
    watch(() => props.isStreaming, (streaming) => {
      if (streaming) isExpanded.value = true
    })
    const toggleReasoning = () => {
      if (!props.thoughtDone) return
      isExpanded.value = !isExpanded.value
    }
    return () => {
      if (!props.content) return null
      const cleanedContent = props.content.replace(/<details>[\s\S]*?<\/details>/gi, '')
      const collapsed = props.thoughtDone && !isExpanded.value
      return h('div', {
        class: ['reasoning-content', { collapsed }]
      }, [
        h('div', { class: 'reasoning-label' }, [
          props.thoughtDone
            ? h('span', { class: 'reasoning-label-text' }, '✅ 深度思考已完成')
            : h('span', { class: 'reasoning-label-text' }, '🧠 孪孪正在头脑风暴中...'),
          ...(props.thoughtDone
            ? [
                h('span', {
                  class: 'reasoning-link',
                  role: 'button',
                  tabindex: 0,
                  onClick: toggleReasoning,
                  onKeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleReasoning() } }
                }, [ collapsed ? '展开' : '收起' ])
              ]
            : [])
        ]),
        h('div', {
          class: 'reasoning-text',
          style: { display: !props.thoughtDone || isExpanded.value ? undefined : 'none' },
          innerHTML: renderMarkdown(cleanedContent)
        }),
        (!props.thoughtDone || isExpanded.value) && h('div', { class: 'reasoning-divider' })
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

/** 图一：链式/链接图标，用于知识来源标题栏 */
const ChainLinkIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' }),
  h('path', { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' })
])

const KnowledgeSource = {
  props: {
    paragraphs: { type: Array, required: true }
  },
  emits: ['open-modal'],
  setup(props, { emit }) {
    const expanded = ref(false)
    return () => {
      if (!props.paragraphs || props.paragraphs.length === 0) return null
      const count = props.paragraphs.length
      const toggleExpand = () => { expanded.value = !expanded.value }
      const openModal = (e) => { e.stopPropagation(); emit('open-modal') }
      const baseUrl = 'https://bailian.cdut.edu.cn'
      return h('div', { class: 'knowledge-sources-inline' }, [
        h('div', {
          class: ['knowledge-sources-inline-header', { 'is-expanded': expanded.value }],
          onClick: toggleExpand
        }, [
          h(ChainLinkIcon),
          h('span', {
            class: 'knowledge-sources-inline-title',
            onClick: openModal
          }, '知识来源'),
          h('span', { class: 'knowledge-sources-inline-dot' }, '·'),
          h('span', { class: 'knowledge-sources-inline-count' }, String(count)),
          h('span', { class: 'knowledge-sources-inline-chevron' }, [
            expanded.value ? h(ChevronUpIcon) : h(ChevronDownIcon)
          ])
        ]),
        expanded.value && h('ol', { class: 'knowledge-sources-inline-list' }, props.paragraphs.map((p, idx) => {
          const docName = p.document_name || p.documentName || `知识来源 ${idx + 1}`
          const link = p.url || p.link || p.source_url || p.sourceUrl || ''
          const href = link ? (link.startsWith('http') ? link : baseUrl + link) : 'javascript:void(0)'
          return h('li', { class: 'knowledge-sources-inline-item', key: p.id || idx }, [
            h('span', { class: 'knowledge-sources-inline-num' }, String(idx + 1)),
            link
              ? h('a', { href, target: '_blank', rel: 'noopener noreferrer', class: 'knowledge-sources-inline-link' }, docName)
              : h('span', { class: 'knowledge-sources-inline-link' }, docName)
          ])
        }))
      ])
    }
  }
}

const props = defineProps({
  messages: {
    type: Array,
    required: true
  },
  /** 流式输出时由父组件每 chunk 更新的内容，用于边输出边渲染 */
  streamingContent: {
    type: String,
    default: ''
  }
})

const endRef = ref(null)
/** 流式消息内容 DOM 的 ref，由 TwinStudyPage provide，用于直接 innerHTML 实现边输出边渲染（参考 bailian-chat.demo） */
const streamingContentElRef = inject('streamingContentElRef', null)

/** 流式时把当前消息的 markdown 容器挂到 provide 的 ref，供父组件直接写 innerHTML；元素卸载时清空 ref */
function setStreamingElRef(el, msg) {
  if (!streamingContentElRef) return
  if (el && msg.role === 'model' && msg.isStreaming) {
    streamingContentElRef.value = el
  } else {
    streamingContentElRef.value = null
  }
}

/** 当前条消息要显示的内容：流式时用 streamingContent，否则用 msg.content */
function getDisplayContent(msg) {
  if (msg.role === 'model' && msg.isStreaming && props.streamingContent != null) {
    return props.streamingContent || (msg.workflow ? '' : '...')
  }
  return msg.content || ''
}
const flashCardGenerating = ref(false)

/** 知识库引用弹窗：图二内容 + 图三样式 */
const showKnowledgeModal = ref(false)
const modalParagraphs = ref([])
const modalUserQuestion = ref('')

function getUserQuestionForMsg(msg) {
  const list = props.messages || []
  const idx = list.findIndex(m => m.id === msg.id)
  if (idx <= 0) return ''
  for (let i = idx - 1; i >= 0; i--) {
    if (list[i].role === 'user') return list[i].content || ''
  }
  return ''
}

function scoreToStars(score) {
  if (typeof score !== 'number' || score <= 0) return '☆☆☆☆☆'
  const n = Math.min(5, Math.round(score * 5))
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

function openKnowledgeModal(msg) {
  modalParagraphs.value = msg.knowledgeParagraphs || []
  modalUserQuestion.value = getUserQuestionForMsg(msg)
  showKnowledgeModal.value = true
}

function closeKnowledgeModal() {
  showKnowledgeModal.value = false
}

function getDocHref(p) {
  const u = p.url || p.link || p.source_url || p.sourceUrl || ''
  if (!u) return 'javascript:void(0)'
  return u.startsWith('http') ? u : 'https://bailian.cdut.edu.cn' + u
}

// 注册 ThinkingBlock 组件
const ThinkingBlockComponent = ThinkingBlock

// 注册 KnowledgeSource 组件
const KnowledgeSourceComponent = KnowledgeSource

// 与 TwinStudyPage 流式渲染使用同一函数，保证流式与最终显示一模一样（参考 bailian-chat.demo）
const renderMarkdown = renderMarkdownToHtml

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
      // 设置首次生成标记
      localStorage.setItem('flashcard_first_generate', 'true')
      
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
  /* 预留头像(32px) + 间距(16px)，避免气泡“撑到”对侧头像区域 */
  max-width: calc(100% - 48px);
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
  /* 避免超长字符串/链接把气泡撑破布局 */
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
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

/* 用户气泡内文字上下居中 */
.message-user-bubble .markdown-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.message-user-bubble .markdown-content :deep(p) {
  margin: 0.25em 0;
}
.message-user-bubble .markdown-content :deep(p:first-child) {
  margin-top: 0;
}
.message-user-bubble .markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}

.workflow-container {
  width: 100%;
  margin-bottom: 16px;
}

/* 思考过程样式：与 WankoAssistant 深度思考一致 */
.reasoning-content {
  margin-bottom: 0;
  padding: 12px 12px 8px 12px;
  background: #e8f3ff;
  border-left: 3px solid #5a8dee;
  border-radius: 8px;
  border: 1px solid rgba(90, 141, 238, 0.3);
  box-shadow: 0 2px 6px rgba(90, 141, 238, 0.12);
  transition: background 0.2s ease, padding 0.2s ease;
}

.reasoning-content.collapsed {
  padding: 10px 12px 6px 12px;
  background: rgba(232, 243, 255, 0.6);
  border-color: rgba(90, 141, 238, 0.2);
  box-shadow: none;
  margin-bottom: 10px;
}

/* 统一整行高度，保证「深度思考已完成」与「展开/收起」视觉一致 */
.message-bubble :deep(.reasoning-label) {
  font-size: 12px;
  line-height: 1.5;
  color: #3a70c1;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.message-bubble :deep(.reasoning-label-text) {
  margin-right: 4px;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 400;
  color: #1f1f1f;
}
.message-bubble :deep(.reasoning-link) {
  font-size: 11px;
  line-height: 1.5;
  font-weight: 550;
}

.reasoning-text {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  overflow-wrap: break-word;
  padding-left: 2px;
}

.reasoning-text :deep(p) {
  margin: 0 0 6px 0;
}

/* 思考块内有序列表：数字在内容框内，与文字对齐；用 .message-bubble :deep 确保子组件内生效 */
.message-bubble :deep(.reasoning-text ol) {
  margin: 0 0 8px 0;
  padding-left: 1.5em;
  list-style-position: inside;
  list-style-type: decimal;
}

.message-bubble :deep(.reasoning-text ul) {
  margin: 0 0 8px 0;
  padding-left: 1.2em;
}

.message-bubble :deep(.reasoning-text li) {
  margin-bottom: 4px;
  padding-left: 0.25em;
  display: list-item;
}

.reasoning-divider {
  height: 1px;
  background: rgba(90, 141, 238, 0.25);
  margin-top: 8px;
}

/* 展开/收起：与左侧文案同高同字号，超链接样式 */
.message-bubble :deep(.reasoning-link) {
  margin-left: 12px;
  color: #3a70c1;
  cursor: pointer;
  text-decoration: none;
  user-select: none;
  white-space: nowrap;
  display: inline-block;
  vertical-align: baseline;
}

.message-bubble :deep(.reasoning-link:hover) {
  color: #15803d;
  text-decoration: underline;
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


/* 图一知识来源由子组件 KnowledgeSource 渲染，须用 :deep 穿透 scoped 才能生效 */
.message-bubble :deep(.knowledge-sources-inline) {
  width: 100%;
  margin-top: 20px;
}

.message-bubble :deep(.knowledge-sources-inline-header) {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  color: #2563eb;
}

.message-bubble :deep(.knowledge-sources-inline-header .knowledge-sources-inline-title) {
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #2563eb;
}

.message-bubble :deep(.knowledge-sources-inline-header .knowledge-sources-inline-title:hover) {
  text-decoration: underline;
}

.message-bubble :deep(.knowledge-sources-inline-dot) {
  color: #2563eb;
  font-weight: 600;
}

.message-bubble :deep(.knowledge-sources-inline-count) {
  font-size: 14px;
  font-weight: 600;
  color: #2563eb;
}

/* 折叠/展开箭头：紧挨数字后面，灰色，引导用户点击折叠或展开 */
.message-bubble :deep(.knowledge-sources-inline-chevron) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-left: 4px;
  color: #6b7280;
  flex-shrink: 0;
}

.message-bubble :deep(.knowledge-sources-inline-chevron svg) {
  width: 16px;
  height: 16px;
}

.message-bubble :deep(.knowledge-sources-inline-list) {
  margin: 10px 0 0 0;
  padding-left: 1.5em;
  list-style: none;
  counter-reset: ks-num;
}

.message-bubble :deep(.knowledge-sources-inline-item) {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: #e5f2fa;
  border-radius: 6px;
  counter-increment: ks-num;
}

.message-bubble :deep(.knowledge-sources-inline-item::before) {
  content: counter(ks-num);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 4px;
  background: #5588f5;
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
  flex-shrink: 0;
}

.message-bubble :deep(.knowledge-sources-inline-num) {
  display: none;
}

.message-bubble :deep(.knowledge-sources-inline-link) {
  font-size: 13px;
  color: #2563eb;
  text-decoration: none;
  flex: 1;
}

.message-bubble :deep(a.knowledge-sources-inline-link:hover) {
  text-decoration: underline;
}

/* ========== 图二/图三：知识库引用弹窗样式 ========== */
.knowledge-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.knowledge-modal {
  width: 90%;
  max-width: 1100px;
  max-height: 85vh;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.knowledge-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.knowledge-modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.knowledge-modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
}

.knowledge-modal-close:hover {
  color: #1f2937;
}

.knowledge-modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.knowledge-modal-section {
  margin-bottom: 20px;
}

.knowledge-modal-section:last-child {
  margin-bottom: 0;
}

.knowledge-modal-label {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.knowledge-modal-question {
  padding: 12px 14px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 15px;
  color: #374151;
  line-height: 1.55;
}

.knowledge-modal-card {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  margin-bottom: 12px;
}

.knowledge-modal-card:last-child {
  margin-bottom: 0;
}

.knowledge-modal-card-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.knowledge-modal-top-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #2563eb;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  border-radius: 4px;
  flex-shrink: 0;
}

/* 召回标题、星级、得分整体靠右，TOP 留在左边 */
.knowledge-modal-recall {
  margin-left: auto;
  font-size: 14px;
  color: #b45309;
}

.knowledge-modal-stars {
  font-size: 16px;
  color: #eab308;
  letter-spacing: 1px;
}

.knowledge-modal-score {
  font-size: 14px;
  color: #b45309;
}

.knowledge-modal-card-content {
  font-size: 15px;
  line-height: 1.65;
  color: #374151;
  margin-bottom: 12px;
}

/* 多条引用时：每条内容只显示约 5 行，其余用滚动条（:deep 确保 Teleport 到 body 后仍生效） */
.knowledge-modal.has-multiple-refs :deep(.knowledge-modal-card-content) {
  max-height: 140px;
  overflow-y: auto;
  overflow-x: hidden;
}

.knowledge-modal-card-content :deep(p) {
  margin: 0 0 6px 0;
}

.knowledge-modal-card-content :deep(p:last-child) {
  margin-bottom: 0;
}

.knowledge-modal-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.knowledge-modal-doc-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #1e40af;
  text-decoration: underline;
}

.knowledge-modal-doc-link:hover {
  color: #1d4ed8;
}

.knowledge-modal-doc-icon {
  font-size: 14px;
}

.knowledge-modal-platform {
  font-size: 13px;
  color: #9ca3af;
}

/* 保留旧类名以防别处引用（可后续删除） */
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
  font-size: 16px;
  line-height: 1.6;
}

.markdown-content :deep(h1) {
  font-size: 1.55rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.markdown-content :deep(h2) {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.markdown-content :deep(h3) {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.markdown-content :deep(p) {
  font-size: 1em;
  margin-bottom: 1rem;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.25rem;
  font-size: 1em;
}

.markdown-content :deep(code) {
  background-color: #f0f4f9;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 1em;
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

/* 表格撑满回答框、每列平均分配宽度 */
.markdown-content :deep(table) {
  width: 100%;
  max-width: 100%;
  margin: 1rem 0;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  padding: 0.75rem 1.25rem;
  border: 1px solid #e2e8f0;
  text-align: left;
  word-wrap: break-word;
  overflow-wrap: break-word;
  box-sizing: border-box;
}

.markdown-content :deep(th) {
  background: #f7fafc;
  font-weight: 600;
  font-size: 1.1em;
  color: #2d3748;
}

.markdown-content :deep(td) {
  font-size: 1.1em;
}

.markdown-content :deep(tr:not(:first-child) td) {
  background: #fff;
}

.markdown-content :deep(tr:hover td) {
  background: #f8fafc;
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

/* 与气泡内文字左对齐（padding 与 .message-bubble 一致），并靠拢上方 */
.message-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: -14px;
  padding-left: 20px;
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

<!-- 弹窗 Teleport 到 body 后无 scoped 属性，单独用非 scoped 块保证「多条引用时每条限高+滚动」生效 -->
<style>
.knowledge-modal.has-multiple-refs .knowledge-modal-card-content {
  max-height: 130px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}
.knowledge-modal.has-multiple-refs .knowledge-modal-card-content::-webkit-scrollbar {
  width: 4px;
}
.knowledge-modal.has-multiple-refs .knowledge-modal-card-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}
.knowledge-modal.has-multiple-refs .knowledge-modal-card-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.knowledge-modal.has-multiple-refs .knowledge-modal-card-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
