<template>
  <div class="compare-view-container">
    <div class="compare-header">
      <h2 class="compare-title">对比模式：闪卡图谱 vs 技能图谱</h2>
      <button class="close-btn" @click="handleClose">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <div class="compare-content" ref="containerRef">
      <!-- 左侧：技能图谱 -->
      <div 
        class="compare-panel"
        :style="{ width: `${leftWidth}%` }"
      >
        <div class="panel-header">
          <h3 class="panel-title">技能图谱</h3>
        </div>
        <div class="panel-body">
          <iframe 
            src="/knowledge-graph/index.html"
            class="knowledge-graph-iframe"
            frameborder="0"
            title="技能图谱"
          ></iframe>
        </div>
      </div>

      <!-- 分割线 -->
      <div 
        class="compare-divider"
        :class="{ 'dragging': isDragging }"
        @mousedown="startDragging"
      >
        <div class="divider-handle">
          <div class="handle-dot"></div>
          <div class="handle-dot"></div>
          <div class="handle-dot"></div>
        </div>
      </div>

      <!-- 右侧：闪卡图谱 -->
      <div 
        class="compare-panel"
        :style="{ width: `${100 - leftWidth}%` }"
      >
        <div class="panel-header">
          <h3 class="panel-title">闪卡图谱</h3>
        </div>
        <div class="panel-body">
          <FlashcardGraph 
            :flashcards="flashcardData"
            @node-click="handleFlashcardNodeClick"
            @go-to-temp="handleGoToTemp"
            @compare="() => {}"
          />
        </div>
      </div>
    </div>
    
    <!-- 拖动时的遮罩层 -->
    <div v-if="isDragging" class="drag-overlay"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import FlashcardGraph from './FlashcardGraph.vue'
import { flashCardApi } from '../../api/flashCard'

const props = defineProps({
  flashcards: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'nodeClick', 'goToTemp'])

const flashcardData = ref([])
const containerRef = ref(null)
const leftWidth = ref(50) // 左侧面板宽度百分比
const isDragging = ref(false)
let rafId = null
let startX = 0
let startWidth = 50

onMounted(async () => {
  // 加载闪卡图谱数据
  try {
    const data = await flashCardApi.getGraphData()
    flashcardData.value = data.flashcards || props.flashcards || []
  } catch (error) {
    console.error('加载闪卡图谱数据失败:', error)
    flashcardData.value = props.flashcards || []
  }
})

onUnmounted(() => {
  // 清理可能存在的动画帧
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
  }
  // 确保清理事件监听
  window.removeEventListener('mousemove', handleDragMove)
  window.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('mouseleave', handleDragEnd)
})

const startDragging = (e) => {
  e.preventDefault()
  e.stopPropagation()
  
  if (!containerRef.value) return
  
  isDragging.value = true
  startX = e.clientX
  startWidth = leftWidth.value
  
  // 设置全局样式
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  document.body.style.pointerEvents = 'none'
  
  // 添加事件监听（只在拖动时添加）
  window.addEventListener('mousemove', handleDragMove, { passive: false })
  window.addEventListener('mouseup', handleDragEnd)
  document.addEventListener('mouseleave', handleDragEnd)
}

const handleDragMove = (e) => {
  if (!isDragging.value || !containerRef.value) return
  
  e.preventDefault()
  
  // 使用 requestAnimationFrame 优化性能
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
  }
  
  rafId = requestAnimationFrame(() => {
    const containerRect = containerRef.value.getBoundingClientRect()
    const deltaX = e.clientX - startX
    const deltaPercent = (deltaX / containerRect.width) * 100
    const newLeftWidth = startWidth + deltaPercent
    
    // 限制拖动范围，防止面板过小（20% - 80%）
    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      leftWidth.value = newLeftWidth
    } else if (newLeftWidth < 20) {
      leftWidth.value = 20
    } else if (newLeftWidth > 80) {
      leftWidth.value = 80
    }
    
    rafId = null
  })
}

const handleDragEnd = () => {
  if (!isDragging.value) return
  
  // 清理动画帧
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  
  isDragging.value = false
  
  // 恢复全局样式
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  document.body.style.pointerEvents = ''
  
  // 移除事件监听
  window.removeEventListener('mousemove', handleDragMove)
  window.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('mouseleave', handleDragEnd)
}

const handleClose = () => {
  emit('close')
}

const handleFlashcardNodeClick = (card, mode) => {
  emit('nodeClick', card, mode)
}

const handleGoToTemp = () => {
  emit('goToTemp')
}
</script>

<style scoped>
.compare-view-container {
  position: fixed;
  inset: 0;
  background: #f8fafc;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.compare-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.compare-title {
  font-size: 20px;
  font-weight: 900;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  padding: 8px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #475569;
}

.compare-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.compare-divider {
  width: 6px;
  background: #e2e8f0;
  cursor: col-resize;
  flex-shrink: 0;
  position: relative;
  z-index: 20;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.compare-divider:hover {
  background: #cbd5e1;
}

.compare-divider.dragging {
  background: #9333ea;
}

.divider-handle {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  pointer-events: none;
}

.handle-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #94a3b8;
  transition: background 0.2s;
}

.compare-divider:hover .handle-dot,
.compare-divider.dragging .handle-dot {
  background: white;
}

.drag-overlay {
  position: fixed;
  inset: 0;
  z-index: 15;
  cursor: col-resize;
  pointer-events: auto; /* 允许捕获鼠标事件 */
  user-select: none;
}

.compare-panel {
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0; /* 允许flex子元素缩小 */
  transition: none; /* 拖动时禁用过渡动画 */
}

.panel-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #475569;
  margin: 0;
}

.panel-body {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.knowledge-graph-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>

