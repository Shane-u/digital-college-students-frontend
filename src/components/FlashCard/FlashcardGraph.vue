<template>
  <div class="flashcard-graph-container">
    <!-- 工具栏 -->
    <div class="graph-toolbar">
      <div class="toolbar-left">
        <!-- 搜索框 -->
        <div class="search-wrapper">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input 
            v-model="searchKeyword"
            type="text" 
            placeholder="搜索标题或内容..." 
            class="search-input"
          />
        </div>
        
        <!-- 时间范围选择 -->
        <div class="time-range-group">
          <button 
            v-for="range in timeRanges"
            :key="range.value"
            :class="['time-range-btn', { active: timeRange === range.value }]"
            @click="timeRange = range.value"
          >
            {{ range.label }}
          </button>
        </div>
      </div>
      
      <div class="toolbar-right">
        <button class="action-btn btn-compare" @click="handleCompare">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          对比模式
        </button>
        <button class="action-btn btn-temp" @click="handleGoToTemp">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
          暂存区
        </button>
      </div>
    </div>

    <!-- 图谱区域 -->
    <div ref="graphContainer" class="graph-area">
      <div v-if="filteredFlashcards.length === 0" class="empty-graph">
        <div class="empty-icon">📊</div>
        <p class="empty-text">图谱暂无内容</p>
        <p class="empty-hint">请先生成闪卡并保存入库</p>
      </div>
      <svg v-else ref="svgRef" class="graph-svg"></svg>
    </div>

    <!-- 图例 -->
    <div class="graph-legend">
      <h4 class="legend-title">图谱图例</h4>
      <div class="legend-items">
        <div class="legend-item">
          <span class="legend-dot category"></span>
          <span class="legend-label">知识分类层级 (Category)</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot flashcard"></span>
          <span class="legend-label">学习闪卡节点 (Flashcard)</span>
        </div>
      </div>
      <div class="legend-hints">
        <p>🖱️ 单击节点复习内容</p>
        <p>🔍 滚轮缩放图谱视野</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  flashcards: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['nodeClick', 'goToTemp', 'compare'])

const searchKeyword = ref('')
const timeRange = ref('ALL')
const graphContainer = ref(null)
const svgRef = ref(null)
const dimensions = ref({ width: 0, height: 0 })

const timeRanges = [
  { value: 'ALL', label: '全部' },
  { value: '7D', label: '近7天' },
  { value: '15D', label: '近半个月' },
  { value: '1M', label: '近1个月' },
  { value: '6M', label: '近半年' },
  { value: '1Y', label: '近一年' },
  { value: 'BEFORE_1Y', label: '一年前' }
]

// 过滤闪卡
const filteredFlashcards = computed(() => {
  let result = [...props.flashcards]
  const now = new Date()
  
  // 时间范围过滤
  if (timeRange.value !== 'ALL') {
    const ranges = {
      '7D': 7,
      '15D': 15,
      '1M': 30,
      '6M': 180,
      '1Y': 365,
      'BEFORE_1Y': Infinity
    }
    const days = ranges[timeRange.value]
    if (days !== Infinity) {
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      result = result.filter(c => new Date(c.createdAt) >= cutoffDate)
    } else {
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      result = result.filter(c => new Date(c.createdAt) < oneYearAgo)
    }
  }
  
  // 搜索过滤（标题、内容、标签）
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(c => {
      const titleMatch = (c.title || '').toLowerCase().includes(keyword)
      const contentMatch = (c.content || '').toLowerCase().includes(keyword)
      const tagsMatch = (c.tags || []).some(tag => tag.toLowerCase().includes(keyword))
      return titleMatch || contentMatch || tagsMatch
    })
  }
  
  return result
})

// 更新容器尺寸
const updateDimensions = () => {
  if (graphContainer.value) {
    dimensions.value = {
      width: graphContainer.value.clientWidth,
      height: graphContainer.value.clientHeight
    }
  }
}

// 渲染D3图谱
let simulation = null
const renderGraph = () => {
  if (!svgRef.value || dimensions.value.width === 0 || dimensions.value.height === 0) return
  
  const { width, height } = dimensions.value
  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()
  
  const nodes = []
  const links = []
  
  // 提取分类节点
  const categoriesSet = new Set()
  filteredFlashcards.value.forEach(card => {
    if (card.category) {
      categoriesSet.add(card.category)
    }
  })
  
  categoriesSet.forEach(cat => {
    const parts = cat.split(' / ')
    const label = parts[parts.length - 1] || '未分类'
    nodes.push({
      id: cat,
      label,
      type: 'category',
      color: '#4f46e5'
    })
  })
  
  // 添加闪卡节点
  filteredFlashcards.value.forEach(card => {
    nodes.push({
      id: card.id,
      label: card.title || '无标题',
      type: 'flashcard',
      color: '#9333ea',
      data: card
    })
    if (card.category) {
      links.push({
        source: card.category,
        target: card.id,
        type: 'belongs_to'
      })
    }
  })
  
  if (nodes.length === 0) return
  
  const g = svg.append('g')
  
  // 缩放
  const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform)
    })
  
  svg.call(zoom)
  
  // 力导向图
  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(120))
    .force('charge', d3.forceManyBody().strength(-400))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(60))
  
  // 绘制连线
  const link = g.append('g')
    .attr('stroke', '#e2e8f0')
    .attr('stroke-opacity', 0.6)
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke-width', 1.5)
  
  // 绘制节点
  const node = g.append('g')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .attr('class', 'graph-node')
    .style('cursor', d => d.type === 'flashcard' ? 'pointer' : 'default')
      .on('dblclick', (event, d) => {
        // 双击展开/收缩（参考矿物图谱逻辑）
        if (d.type === 'category') {
          d.isExpanded = !d.isExpanded
          // TODO: 实现展开/收缩逻辑
        }
      })
      .on('click', (event, d) => {
        if (d.type === 'flashcard' && d.data) {
          // 单击闪卡节点：进入复习或编辑
          // 可以通过右键或长按进入编辑模式
          emit('nodeClick', d.data, 'review')
        }
      })
      .on('contextmenu', (event, d) => {
        event.preventDefault()
        if (d.type === 'flashcard' && d.data) {
          emit('nodeClick', d.data, 'edit')
        }
      })
    .call(d3.drag()
      .on('start', (event) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      })
      .on('drag', (event) => {
        event.subject.fx = event.x
        event.subject.fy = event.y
      })
      .on('end', (event) => {
        if (!event.active) simulation.alphaTarget(0)
        event.subject.fx = null
        event.subject.fy = null
      }))
  
  // 节点圆圈
  node.append('circle')
    .attr('r', d => d.type === 'category' ? 24 : 16)
    .attr('fill', d => d.color || '#ccc')
    .attr('stroke', '#fff')
    .attr('stroke-width', 3)
  
  // 节点标签
  node.append('text')
    .attr('dy', 40)
    .attr('text-anchor', 'middle')
    .attr('class', 'node-label')
    .style('font-size', d => d.type === 'category' ? '12px' : '10px')
    .style('font-weight', 'bold')
    .style('fill', '#475569')
    .style('pointer-events', 'none')
    .text(d => {
      const lbl = d.label || ''
      return lbl.length > 15 ? lbl.slice(0, 12) + '...' : lbl
    })
  
  // 更新位置
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x || 0)
      .attr('y1', d => d.source.y || 0)
      .attr('x2', d => d.target.x || 0)
      .attr('y2', d => d.target.y || 0)
    
    node.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`)
  })
}

// 监听变化
watch([filteredFlashcards, dimensions], () => {
  nextTick(() => {
    if (simulation) {
      simulation.stop()
    }
    renderGraph()
  })
}, { deep: true })

onMounted(() => {
  updateDimensions()
  const resizeObserver = new ResizeObserver(() => {
    updateDimensions()
  })
  if (graphContainer.value) {
    resizeObserver.observe(graphContainer.value)
  }
  window.addEventListener('resize', updateDimensions)
  
  onUnmounted(() => {
    resizeObserver.disconnect()
    window.removeEventListener('resize', updateDimensions)
    if (simulation) {
      simulation.stop()
    }
  })
})

const handleCompare = () => {
  emit('compare')
}

const handleGoToTemp = () => {
  emit('goToTemp')
}
</script>

<style scoped>
.flashcard-graph-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8fafc;
  position: relative;
  overflow: hidden;
}

.graph-toolbar {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  padding: 10px 16px 10px 44px;
  background: #f1f5f9;
  border: 2px solid transparent;
  border-radius: 16px;
  font-size: 14px;
  width: 288px;
  outline: none;
  transition: all 0.2s;
}

.search-input:focus {
  background: white;
  border-color: #4f46e5;
}

.time-range-group {
  display: flex;
  background: #f1f5f9;
  padding: 6px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  gap: 4px;
}

.time-range-btn {
  padding: 8px 20px;
  font-size: 12px;
  font-weight: 900;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.time-range-btn:hover {
  color: #475569;
}

.time-range-btn.active {
  background: white;
  color: #4f46e5;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-btn {
  padding: 10px 24px;
  font-size: 14px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  transition: all 0.2s;
}

.btn-compare {
  background: #1e293b;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-compare:hover {
  background: #0f172a;
}

.btn-temp {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-temp:hover {
  background: #f8fafc;
}

.graph-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #f8fafc;
}

.graph-svg {
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
}

.empty-graph {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  pointer-events: none;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.2;
}

.empty-text {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px;
}

.empty-hint {
  font-size: 14px;
  margin: 0;
}

.graph-legend {
  position: absolute;
  bottom: 40px;
  right: 40px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  padding: 24px;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  z-index: 20;
  pointer-events: none;
  max-width: 192px;
}

.legend-title {
  font-size: 10px;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 16px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}

.legend-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.legend-dot.category {
  background: #4f46e5;
}

.legend-dot.flashcard {
  background: #9333ea;
}

.legend-hints {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.legend-hints p {
  font-size: 10px;
  color: #94a3b8;
  line-height: 1.6;
  margin: 4px 0;
  font-weight: 500;
}

.graph-node:hover circle {
  transform: scale(1.1);
  transition: transform 0.2s;
}
</style>

