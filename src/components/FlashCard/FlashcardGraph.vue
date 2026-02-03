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

    <!-- 图谱区域（有 Neo4j nodes/links 或闪卡列表即显示图谱） -->
    <div ref="graphContainer" class="graph-area">
      <div v-if="!hasGraphData" class="empty-graph">
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
    
    <!-- 节点内容：从左侧滑出的抽屉，不遮挡图谱 -->
    <Transition name="drawer-left">
      <div v-if="showNodeCard" class="node-card-drawer-wrapper">
        <div class="node-card-drawer">
          <div class="node-card-header">
            <h3 class="node-card-title">{{ nodeCardData.title || '节点内容' }}</h3>
            <button class="node-card-close" @click="closeNodeCard" aria-label="关闭">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div class="node-card-body">
            <div class="node-card-content" v-html="sanitizedContent"></div>
          </div>
          <div class="node-card-footer">
            <button type="button" class="node-card-btn node-card-btn-edit" @click="openEditModal">编辑</button>
            <button type="button" class="node-card-btn node-card-btn-delete" @click="handleDelete">删除</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 编辑弹窗：修改路径与卡片内容 -->
    <Teleport to="body">
      <div v-if="showEditModal" class="node-edit-modal-overlay" @click.self="closeEditModal">
        <div class="node-edit-modal">
          <div class="node-edit-modal-header">
            <h3 class="node-edit-modal-title">编辑闪卡</h3>
            <button type="button" class="node-edit-modal-close" @click="closeEditModal" aria-label="关闭">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <form class="node-edit-form" @submit.prevent="submitEdit">
            <div class="node-edit-field">
              <label class="node-edit-label">层级路径</label>
              <input v-model="editForm.hierarchyPath" type="text" class="node-edit-input" placeholder="例如：根/Web课程/Vue" />
            </div>
            <div class="node-edit-field">
              <label class="node-edit-label">标题</label>
              <input v-model="editForm.title" type="text" class="node-edit-input" required />
            </div>
            <div class="node-edit-field">
              <label class="node-edit-label">内容</label>
              <textarea v-model="editForm.content" class="node-edit-textarea" rows="6"></textarea>
            </div>
            <div class="node-edit-field">
              <label class="node-edit-label">HTML 内容（可选）</label>
              <textarea v-model="editForm.htmlContent" class="node-edit-textarea" rows="4" placeholder="留空则使用上面内容渲染"></textarea>
            </div>
            <div class="node-edit-actions">
              <button type="button" class="node-card-btn node-card-btn-secondary" @click="closeEditModal">取消</button>
              <button type="submit" class="node-card-btn node-card-btn-primary">保存</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as d3 from 'd3'
import { sanitizeHtml } from '../../utils/sanitizeHtml'
import { flashCardApi } from '../../api/flashCard'

const props = defineProps({
  flashcards: {
    type: Array,
    default: () => []
  },
  /** Neo4j 代理返回的原始节点 [{ id, label, properties }] */
  graphNodes: {
    type: Array,
    default: () => []
  },
  /** Neo4j 代理返回的原始边 [{ source, target, type }] */
  graphLinks: {
    type: Array,
    default: () => []
  },
  /** 当前用户 ID，用于 Neo4j 更新/删除时指定数据库 */
  userId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['nodeClick', 'goToTemp', 'compare', 'refresh'])

const searchKeyword = ref('')
const timeRange = ref('ALL')
const graphContainer = ref(null)
const svgRef = ref(null)
const dimensions = ref({ width: 0, height: 0 })
const showNodeCard = ref(false)
const nodeCardData = ref({ id: '', title: '', content: '', htmlContent: '', hierarchyPath: '' })
const showEditModal = ref(false)
const editForm = ref({ id: '', title: '', content: '', htmlContent: '', hierarchyPath: '' })

const timeRanges = [
  { value: 'ALL', label: '全部' },
  { value: '7D', label: '近7天' },
  { value: '15D', label: '近半个月' },
  { value: '1M', label: '近1个月' },
  { value: '6M', label: '近半年' },
  { value: '1Y', label: '近一年' },
  { value: 'BEFORE_1Y', label: '一年前' }
]

// 是否有图谱数据（Neo4j 原始节点或闪卡列表）
const hasGraphData = computed(() => {
  if (props.graphNodes && props.graphNodes.length > 0) return true
  return props.flashcards && props.flashcards.length > 0
})

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

// 解析层级路径：支持 "根/课程/名" 与 "根 / 课程 / 名"
function parseHierarchyPath(pathStr) {
  if (!pathStr || typeof pathStr !== 'string') return []
  const raw = pathStr.trim().replace(/\s*\/\s*/g, '/').replace(/\/+/g, '/')
  if (!raw) return []
  return raw.split('/').map(s => s.trim()).filter(Boolean)
}

// 由路径段生成从根到叶的完整路径列表，用于构建层级节点
function pathPrefixes(parts) {
  const prefixes = []
  for (let i = 0; i < parts.length; i++) {
    prefixes.push(parts.slice(0, i + 1).join('/'))
  }
  return prefixes
}

// 节点显示名函数：优先 name，没有则 title，再没有才用 label 或 id（避免显示 userId）
const getNodeDisplayName = (d) => {
  if (d.properties) {
    if (d.properties.name) return d.properties.name
    if (d.properties.title) return d.properties.title
  }
  // 如果 label 包含 userId 模式（如 User_xxx_xxx），尝试提取 title
  if (d.label && typeof d.label === 'string' && d.label.includes('_')) {
    const parts = d.label.split('_')
    if (parts.length >= 3 && parts[0] === 'User') {
      // 可能是 User_userId_xxx 格式，尝试用 properties.title
      if (d.properties && d.properties.title) return d.properties.title
    }
  }
  return d.label || d.id
}

// 渲染D3图谱（支持 根/课程/名 路径格式，Neo4j 风格节点）
let simulation = null
const NEO4J = {
  categoryFill: '#58c4dc',
  categoryStroke: '#ffffff',
  flashcardFill: '#F2A73D',
  flashcardStroke: '#ffffff',
  linkStroke: '#A5ABB6',
  labelFill: '#333333',
  nodeStrokeWidth: 2
}

const renderGraph = () => {
  updateDimensions()
  if (!svgRef.value || dimensions.value.width === 0 || dimensions.value.height === 0) return
  const { width, height } = dimensions.value
  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()
  svg.attr('width', width).attr('height', height)
  
  let nodes = []
  let links = []
  
  // 有 Neo4j 返回的 nodes/links 时直接渲染（与 knowledge-graph/index.html 一致）
  if (props.graphNodes && props.graphNodes.length > 0 && props.graphLinks) {
    nodes = props.graphNodes.map(n => ({
      id: n.id,
      label: (n.label || 'Node').toString(),
      properties: n.properties || {}
    }))
    links = props.graphLinks.map(l => ({
      source: typeof l.source === 'object' ? l.source.id : l.source,
      target: typeof l.target === 'object' ? l.target.id : l.target,
      type: l.type || 'RELATES_TO'
    }))
  } else {
    const seenNodeIds = new Set()
    // 从每张闪卡的 category / hierarchyPath 构建层级分类节点
    filteredFlashcards.value.forEach(card => {
    const pathStr = card.hierarchyPath || card.category || ''
    const parts = parseHierarchyPath(pathStr)
    if (parts.length === 0) return
    
    const prefixes = pathPrefixes(parts)
    prefixes.forEach((fullPath, i) => {
      if (seenNodeIds.has(fullPath)) return
      seenNodeIds.add(fullPath)
      const label = parts[i] || '未分类'
      nodes.push({
        id: fullPath,
        label,
        type: 'category',
        color: NEO4J.categoryFill,
        stroke: NEO4J.categoryStroke
      })
    })
    
    // 层级之间的边：父路径 -> 子路径
    for (let i = 0; i < prefixes.length - 1; i++) {
      links.push({
        source: prefixes[i],
        target: prefixes[i + 1],
        type: 'parent_of'
      })
    }
  })
  
  // 闪卡节点，并连到其分类路径的叶子节点
  filteredFlashcards.value.forEach(card => {
    const pathStr = card.hierarchyPath || card.category || ''
    const parts = parseHierarchyPath(pathStr)
    const leafPath = parts.length > 0 ? pathPrefixes(parts).pop() : null
    
    nodes.push({
      id: card.id,
      label: card.title || '无标题',
      type: 'flashcard',
      color: NEO4J.flashcardFill,
      stroke: NEO4J.flashcardStroke,
      data: card
    })
    if (leafPath) {
      links.push({
        source: leafPath,
        target: card.id,
        type: 'belongs_to'
      })
    }
  })
  }
  
  // 边去重（同一对 source-target 只保留一条）
  const linkKeys = new Set()
  const uniqueLinks = links.filter(l => {
    const sid = typeof l.source === 'object' ? l.source.id : l.source
    const tid = typeof l.target === 'object' ? l.target.id : l.target
    const key = `${sid}\0${tid}`
    if (linkKeys.has(key)) return false
    linkKeys.add(key)
    return true
  })
  
  if (nodes.length === 0) return
  
  const g = svg.append('g')
  const zoom = d3.zoom().scaleExtent([0.1, 4]).on('zoom', (ev) => g.attr('transform', ev.transform))
  svg.call(zoom)
  
  // 力导向（与 knowledge-graph 一致）
  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(uniqueLinks).id(d => d.id).distance(180))
    .force('charge', d3.forceManyBody().strength(-550))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(40))
  
  const linkLayer = g.append('g').attr('class', 'links').attr('stroke', '#A5ABB6').attr('stroke-opacity', 0.8)
  const nodeLayer = g.append('g').attr('class', 'nodes')
  const textLayer = g.append('g').attr('class', 'texts')
  
  const link = linkLayer.selectAll('line').data(uniqueLinks).join('line').attr('stroke-width', 2)
  const node = nodeLayer.selectAll('circle').data(nodes).join('circle')
    .attr('r', 20)
    .attr('fill', d => (d.label && /FlashCard|Flashcard/i.test(d.label)) ? NEO4J.flashcardFill : NEO4J.categoryFill)
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .call(d3.drag()
      .on('start', (ev) => { if (!ev.active) simulation.alphaTarget(0.3).restart(); ev.subject.fx = ev.subject.x; ev.subject.fy = ev.subject.y })
      .on('drag', (ev) => { ev.subject.fx = ev.x; ev.subject.fy = ev.y })
      .on('end', (ev) => { if (!ev.active) simulation.alphaTarget(0); ev.subject.fx = null; ev.subject.fy = null }))
  
  node.append('title').text(getNodeDisplayName)
  const text = textLayer.selectAll('text').data(nodes).join('text')
    .text(getNodeDisplayName)
    .attr('font-size', '12px')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .style('fill', NEO4J.labelFill)
    .style('pointer-events', 'none')
  
  // 点击节点显示 content 小卡片
  node.on('click', (ev, d) => {
    ev.stopPropagation()
    const content = (d.properties && d.properties.content) || ''
    if (content) {
      showNodeCardFunc(ev, d, content)
    }
  })
  
  simulation.on('tick', () => {
    link.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y)
    node.attr('cx', d => d.x).attr('cy', d => d.y)
    text.attr('x', d => d.x).attr('y', d => d.y)
  })
}

// 仅在有数据变化时渲染一次（不监听 dimensions，避免卡死）
watch(
  () => [props.graphNodes?.length, props.graphLinks?.length, filteredFlashcards.value.length],
  () => {
    if (simulation) simulation.stop()
    nextTick(renderGraph)
  },
  { deep: false }
)

onMounted(() => {
  updateDimensions()
  if (graphContainer.value) {
    const ro = new ResizeObserver(() => updateDimensions())
    ro.observe(graphContainer.value)
    onUnmounted(() => ro.disconnect())
  }
  window.addEventListener('resize', updateDimensions)
  onUnmounted(() => {
    window.removeEventListener('resize', updateDimensions)
    if (simulation) simulation.stop()
  })
  if (props.graphNodes?.length > 0) {
    nextTick(() => { setTimeout(renderGraph, 50) })
  }
})

const handleCompare = () => {
  emit('compare')
}

const handleGoToTemp = () => {
  emit('goToTemp')
}

// 显示节点内容小卡片
const showNodeCardFunc = (event, node, content) => {
  const title = getNodeDisplayName(node)
  const props_ = node.properties || {}
  const data = node.data || {}
  // 删除/编辑接口要用 properties.id（业务闪卡 ID），不能用节点顶层 id（图谱内部 id）
  const apiId = props_.id ?? data.id ?? node.id
  nodeCardData.value = {
    id: apiId != null ? String(apiId) : '',
    title: props_.title ?? data.title ?? title,
    content: props_.content ?? data.content ?? content ?? '暂无内容',
    htmlContent: props_.htmlContent ?? data.htmlContent ?? props_.content ?? data.content ?? '',
    hierarchyPath: props_.hierarchyPath ?? data.hierarchyPath ?? data.category ?? ''
  }
  showNodeCard.value = true
}

// 关闭节点卡片
const closeNodeCard = () => {
  showNodeCard.value = false
  nodeCardData.value = { id: '', title: '', content: '', htmlContent: '', hierarchyPath: '' }
}

// 打开编辑弹窗
const openEditModal = () => {
  editForm.value = {
    id: nodeCardData.value.id,
    title: nodeCardData.value.title,
    content: nodeCardData.value.content,
    htmlContent: nodeCardData.value.htmlContent,
    hierarchyPath: nodeCardData.value.hierarchyPath
  }
  showEditModal.value = true
}

// 关闭编辑弹窗
const closeEditModal = () => {
  showEditModal.value = false
}

// 提交编辑：走后端 /flash-card/update（后端负责同步 Neo4j）
const submitEdit = async () => {
  const { id, title, content, htmlContent, hierarchyPath } = editForm.value
  const idStr = id != null ? String(id) : ''
  if (!idStr.trim()) return
  try {
    await flashCardApi.update({
      id: idStr,
      title: title || '',
      content: content || '',
      htmlContent: htmlContent ?? content ?? ''
    })
    nodeCardData.value = {
      ...nodeCardData.value,
      title: title || nodeCardData.value.title,
      content: content || nodeCardData.value.content,
      htmlContent: htmlContent ?? content ?? nodeCardData.value.htmlContent,
      hierarchyPath: hierarchyPath || nodeCardData.value.hierarchyPath
    }
    closeEditModal()
    emit('refresh')
  } catch (err) {
    console.error('保存失败', err)
    alert(err?.message || err?.response?.data?.message || '保存失败，请重试')
  }
}

// 删除：走后端 /flash-card/delete（后端负责同步 Neo4j）
const handleDelete = async () => {
  if (!confirm('确定要删除这个闪卡吗？')) return
  const idStr = nodeCardData.value.id != null ? String(nodeCardData.value.id) : ''
  if (!idStr.trim()) return
  try {
    await flashCardApi.delete(idStr)
    closeNodeCard()
    emit('refresh')
  } catch (err) {
    console.error('删除失败', err)
    alert(err?.message || err?.response?.data?.message || '删除失败，请重试')
  }
}

// 安全渲染 HTML content（优先使用 htmlContent，否则用 content）
const sanitizedContent = computed(() => {
  const raw = nodeCardData.value.htmlContent || nodeCardData.value.content
  if (!raw) return ''
  return sanitizeHtml(raw)
})

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
  background: #58c4dc;
  border: 2px solid #fff;
  box-sizing: border-box;
}

.legend-dot.flashcard {
  background: #F2A73D;
  border: 2px solid #fff;
  box-sizing: border-box;
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

.graph-node.neo4j-node:hover circle {
  filter: brightness(1.1);
}
.graph-node.neo4j-node circle {
  transition: filter 0.2s;
}

/* 节点内容：从左侧滑出的抽屉，不遮挡图谱 */
.node-card-drawer-wrapper {
  position: fixed;
  top: 150px;
  left: 0;
  bottom: 0;
  z-index: 1000;
  pointer-events: none;
}

/* 抽屉进入/离开过渡（与展开同曲线） */
.drawer-left-enter-active,
.drawer-left-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-left-enter-from,
.drawer-left-leave-to {
  transform: translateX(-100%);
}

.drawer-left-enter-to,
.drawer-left-leave-from {
  transform: translateX(0);
}

.node-card-drawer {
  width: 420px;
  max-width: 85vw;
  height: 80%;
  background: white;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  pointer-events: auto;
  animation: slideInFromLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 0px 40px 40px 0;
}

@keyframes slideInFromLeft {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.node-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.node-card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.node-card-close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.node-card-close:hover {
  background: #f1f5f9;
  color: #475569;
}

.node-card-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.node-card-content {
  color: #475569;
  line-height: 1.6;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
}

.node-card-content :deep(p) {
  margin: 0 0 12px;
}

.node-card-content :deep(p:last-child) {
  margin-bottom: 0;
}

/* 卡片底部操作按钮（参考图二样式） */
.node-card-footer {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid #e5e6eb;
  flex-shrink: 0;
  background: #fff;
}

.node-card-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e5e6eb;
  background: white;
  color: #4e5969;
}

.node-card-btn-edit:hover {
  border-color: #3370ff;
  color: #3370ff;
  background: #f0f5ff;
}

.node-card-btn-delete:hover {
  border-color: #f53f3f;
  color: #f53f3f;
  background: #fff1f0;
}

.node-card-btn-primary {
  background: #3370ff;
  color: white;
  border: none;
}

.node-card-btn-primary:hover {
  background: #2b5ed9;
}

.node-card-btn-secondary {
  background: white;
  color: #4e5969;
  border: 1px solid #e5e6eb;
}

.node-card-btn-secondary:hover {
  background: #f5f7fa;
}

/* 编辑弹窗 */
.node-edit-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(29, 33, 41, 0.6);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.node-edit-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.15);
}

.node-edit-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e6eb;
}

.node-edit-modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.node-edit-modal-close {
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

.node-edit-modal-close:hover {
  background: #f2f3f5;
  color: #4e5969;
}

.node-edit-form {
  padding: 24px;
}

.node-edit-field {
  margin-bottom: 16px;
}

.node-edit-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #4e5969;
  margin-bottom: 8px;
}

.node-edit-input,
.node-edit-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  font-size: 14px;
  background: #f2f3f5;
  transition: all 0.2s;
}

.node-edit-input:focus,
.node-edit-textarea:focus {
  outline: none;
  border-color: #3370ff;
  background: white;
  box-shadow: 0 0 0 2px rgba(51, 112, 255, 0.1);
}

.node-edit-textarea {
  resize: vertical;
  min-height: 80px;
}

.node-edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e6eb;
}
</style>

