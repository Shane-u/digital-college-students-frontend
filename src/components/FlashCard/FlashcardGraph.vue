<template>
  <div class="flashcard-graph-container">
    <!-- 工具栏 -->
    <div v-if="!hideToolbar" class="graph-toolbar">
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
            @keyup.enter="handleSearch"
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
    <div v-if="!hideToolbar" class="graph-legend">
      <h4 class="legend-title">图谱图例</h4>
      <div class="legend-items">
        <div class="legend-item">
          <span class="legend-dot category"></span>
          <span class="legend-label">知识分类层级</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot flashcard"></span>
          <span class="legend-label">学习闪卡节点</span>
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
            <div class="node-edit-actions">
              <button type="button" class="node-card-btn node-card-btn-secondary" @click="closeEditModal">取消</button>
              <button type="submit" class="node-card-btn node-card-btn-primary" :disabled="savingEdit">
                <span v-if="!savingEdit">保存</span>
                <span v-else class="btn-loading">
                  <span class="btn-loading-spinner"></span>
                  正在保存...
                </span>
              </button>
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
import { ElMessage } from 'element-plus'
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
  },
  /** 需要高亮的业务闪卡 ID 列表（来自 Neo4j 图谱查询接口结果） */
  highlightIds: {
    type: Array,
    default: () => []
  },
  /** 是否隐藏工具栏和图例（对比模式下使用） */
  hideToolbar: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['nodeClick', 'goToTemp', 'compare', 'refresh', 'search'])

const searchKeyword = ref('')
const timeRange = ref('ALL')
const graphContainer = ref(null)
const svgRef = ref(null)
const dimensions = ref({ width: 0, height: 0 })
const showNodeCard = ref(false)
// id: 业务闪卡ID（用于后端 update/delete）；graphId: 图谱节点ID（用于从 links 还原层级路径）
const nodeCardData = ref({ id: '', graphId: '', title: '', content: '', htmlContent: '', hierarchyPath: '' })
const showEditModal = ref(false)
const editForm = ref({ id: '', graphId: '', title: '', content: '', htmlContent: '', hierarchyPath: '' })
const loadingDetail = ref(false)
const savingEdit = ref(false)

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
  
  // 时间范围过滤（搜索不再在前端过滤，只用于回车触发后端图谱查询，避免每敲一个字重绘图谱）
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
  
  return result
})

// 触发后端图谱搜索（Neo4j），当前仅在按下回车时触发
const handleSearch = () => {
  const keyword = searchKeyword.value.trim()
  emit('search', keyword)
}

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
let zoomBehavior = null
let gRoot = null
let linkSel = null
let nodeSel = null
let textSel = null

// 交互状态：用于“初始全显示 + 双击收起/展开”
const nodeUiState = new Map() // id -> { expanded:boolean, oldX:number, oldY:number }
let masterGraph = { nodes: [], links: [] } // 全量数据快照（渲染时更新）
let visibleNodeIds = new Set() // 当前可见节点集合（初始为全量）
let prevMasterNodeIds = new Set() // 上一轮全量节点 id，用于识别“新节点”并默认显示
let savedNodePositions = new Map() // id -> {x,y} 收起后保留剩余节点位置，避免弹动

const FAST_FORCE = {
  frictionAlphaTarget: 0.35,
  linkDistance: 120,
  linkStrength: 0.55,
  charge: -320,
  radialStrength: 0.18,
  collisionPadding: 6
}

// 动画参数（与参考组件一致：duration 900-1000ms, easeOutQuad）
const ANIM_DURATION = 1000
const ANIM_EASING = d3.easeQuadOut
const NEO4J = {
  // 参考图谱模板：整体偏蓝紫色调
  categoryFill: '#7880f0',
  categoryStroke: '#ffffff',
  flashcardFill: '#F2A73D',
  flashcardStroke: '#ffffff',
  rootFill: '#A78BFA',
  linkStroke: '#A5ABB6',
  labelFill: '#333333',
  nodeStrokeWidth: 2
}

// 识别节点层级/类型，用于动态大小与颜色
const getGraphNodeDepth = (d) => {
  // 1) Neo4j 的 label：User_xxx_Root / User_xxx_Level1 / Level2 / Level3 / FlashCard
  const label = (d?.label || '').toString()
  if (/Root/i.test(label)) return 1
  const m = label.match(/Level(\d+)/i)
  if (m && m[1]) {
    const lv = parseInt(m[1], 10)
    if (!Number.isNaN(lv)) return lv + 1 // Root=1, Level1=2, Level2=3 ...
  }

  // 2) 前端构造的分类节点：id = "根/课程/..."
  const id = d?.id
  if (typeof id === 'string' && id.includes('/')) return parseHierarchyPath(id).length

  // 3) fallback：用显示名判断根
  const name = getNodeDisplayName(d)
  if (name === '根') return 1

  return 2
}

const isFlashcardNode = (d) => {
  if (d?.type === 'flashcard') return true
  const label = (d?.label || '').toString()
  return /FlashCard|Flashcard/i.test(label)
}

const isRootNode = (d) => {
  const label = (d?.label || '').toString()
  if (/Root/i.test(label)) return true
  const id = d?.id
  if (id === '根') return true
  const name = getNodeDisplayName(d)
  return name === '根'
}

// 从当前图谱关系中还原某个节点的层级路径（用于编辑时回填）
const buildHierarchyPathFromGraph = (graphNodeId) => {
  if (!graphNodeId) return ''
  const nodesById = new Map((props.graphNodes || []).map(n => [String(n.id), n]))
  const links = props.graphLinks || []

  // 通过「指向当前节点」的边，找父节点；兼容 LINK_TO / parent_of / belongs_to 等命名
  const getParents = (id) => {
    const pid = String(id)
    const parents = []
    for (const l of links) {
      const src = typeof l.source === 'object' ? l.source?.id : l.source
      const tgt = typeof l.target === 'object' ? l.target?.id : l.target
      if (tgt == null || src == null) continue
      if (String(tgt) !== pid) continue
      const p = nodesById.get(String(src))
      if (p) parents.push(p)
    }
    return parents
  }

  const parts = []
  let cur = nodesById.get(String(graphNodeId))
  if (!cur) return ''

  // 如果当前节点是闪卡，先找它的父分类节点作为起点
  const isFlash = (cur.label && /FlashCard|Flashcard/i.test(String(cur.label)))
  if (isFlash) {
    const parents = getParents(cur.id).filter(p => !(p.label && /FlashCard|Flashcard/i.test(String(p.label))))
    if (parents.length > 0) cur = parents[0]
  }

  const visited = new Set()
  while (cur && !visited.has(String(cur.id))) {
    visited.add(String(cur.id))
    const name = cur.properties?.name || cur.properties?.label || cur.properties?.title || cur.label || ''
    if (name) parts.push(String(name))
    if (isRootNode({ id: cur.id, label: cur.label, properties: cur.properties })) break
    const parents = getParents(cur.id)
      .filter(p => !(p.label && /FlashCard|Flashcard/i.test(String(p.label))))
    if (parents.length === 0) break
    cur = parents[0]
  }

  const rev = parts.reverse().filter(Boolean)
  if (rev.length === 0) return ''
  // 统一成 “根/...” 格式
  if (rev[0] !== '根') rev.unshift('根')
  return rev.join('/')
}

const getNodeRadius = (d) => {
  // 闪卡节点最小，但不至于太小
  if (isFlashcardNode(d)) return 14

  const depth = getGraphNodeDepth(d)
  // 根最大，越往下越小（最低不小于 16）
  if (depth <= 1) return 30
  if (depth === 2) return 26
  if (depth === 3) return 22
  if (depth === 4) return 19
  return 16
}

const getNodeFill = (d) => {
  if (isFlashcardNode(d)) return NEO4J.flashcardFill
  if (isRootNode(d)) return NEO4J.rootFill
  return NEO4J.categoryFill
}

// 根据层级决定节点在径向布局中的半径（越深越远）
const radialByDepth = (depth) => {
  if (depth <= 1) return 0              // 根在中心
  if (depth === 2) return 180
  if (depth === 3) return 280
  if (depth === 4) return 360
  return 430
}

const getRadialDistance = (d) => {
  const depth = getGraphNodeDepth(d)
  // 闪卡节点统一推到最外圈，让连线朝外延伸，而不是朝根收缩
  if (isFlashcardNode(d)) return 480
  return radialByDepth(depth)
}

const getNodeFontSize = (d) => {
  if (isRootNode(d)) return 26
  if (isFlashcardNode(d)) return 13
  const depth = getGraphNodeDepth(d)
  if (depth <= 2) return 15
  if (depth === 3) return 14
  return 13
}

const getNodeFontWeight = (d) => (isRootNode(d) ? 900 : 800)

const getNodeTextFill = (d) => {
  // 根节点：白色文字配紫色背景，其它节点：深灰
  if (isRootNode(d)) return '#ffffff'
  return '#111827'
}

const getNodeTextStroke = (d) => {
  // 根节点不要描边（纯黑字），其它节点保留白色描边以便阅读
  return isRootNode(d) ? 'none' : 'rgba(255,255,255,0.85)'
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
      properties: n.properties || {},
      // 业务闪卡 ID：用于与 Neo4j 查询结果做高亮匹配
      businessId: n.properties?.id != null ? String(n.properties.id) : (n.id != null ? String(n.id) : null)
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
          stroke: NEO4J.categoryStroke,
          businessId: null
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
      data: card,
      businessId: card.id != null ? String(card.id) : null
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

  // 更新全量图谱快照 + 初始化可见集合（保留“初始显示全部节点”逻辑）
  masterGraph = { nodes: [...nodes], links: [...uniqueLinks] }
  const currentMasterIds = new Set(masterGraph.nodes.map(n => n.id))

  if (visibleNodeIds.size === 0) {
    visibleNodeIds = new Set(currentMasterIds)
  } else {
    // 清理已不存在的节点 id
    visibleNodeIds = new Set([...visibleNodeIds].filter(id => currentMasterIds.has(id)))
    // 仅将「新出现的节点」加入可见（后端刷新后新增的节点），不把用户故意收起的节点加回
    currentMasterIds.forEach(id => {
      if (!prevMasterNodeIds.has(id)) visibleNodeIds.add(id)
    })
  }
  prevMasterNodeIds = new Set(currentMasterIds)

  // 当前渲染用可见子集，并恢复上次保存的位置（收起后避免弹动）
  const visibleNodes = masterGraph.nodes.filter(n => visibleNodeIds.has(n.id))
  const cx = width / 2
  const cy = height / 2
  visibleNodes.forEach(n => {
    const pos = savedNodePositions.get(n.id)
    if (pos != null) {
      n.x = pos.x
      n.y = pos.y
    } else if (n.x == null || n.y == null) {
      n.x = cx
      n.y = cy
    }
  })
  const visibleNodeIdSet = new Set(visibleNodes.map(n => n.id))
  const visibleLinks = masterGraph.links.filter(l => {
    const sid = typeof l.source === 'object' ? l.source.id : l.source
    const tid = typeof l.target === 'object' ? l.target.id : l.target
    return visibleNodeIdSet.has(sid) && visibleNodeIdSet.has(tid)
  })

  // 高亮集合：来自 Neo4j 图谱查询的业务闪卡 ID
  const highlightIdSet = new Set(
    (props.highlightIds || [])
      .map(id => (id != null ? String(id) : ''))
      .filter(s => s !== '')
  )

  // 命中的节点（闪卡节点）以及它们的邻居节点（包括所属层级）
  const hitNodeIds = new Set()
  if (highlightIdSet.size > 0) {
    nodes.forEach(n => {
      if (n.businessId && highlightIdSet.has(String(n.businessId))) {
        hitNodeIds.add(n.id)
      }
    })
  }

  const neighborNodeIds = new Set(hitNodeIds)
  if (hitNodeIds.size > 0) {
    uniqueLinks.forEach(l => {
      const sid = typeof l.source === 'object' ? l.source.id : l.source
      const tid = typeof l.target === 'object' ? l.target.id : l.target
      if (hitNodeIds.has(sid) || hitNodeIds.has(tid)) {
        neighborNodeIds.add(sid)
        neighborNodeIds.add(tid)
      }
    })
  }

  const hasHighlight = highlightIdSet.size > 0 && neighborNodeIds.size > 0
  const isDimmedNode = (d) => {
    if (!hasHighlight) return false
    return !neighborNodeIds.has(d.id)
  }
  
  gRoot = svg.append('g')
  zoomBehavior = d3.zoom().scaleExtent([0.1, 10]).on('zoom', (ev) => gRoot.attr('transform', ev.transform))
  svg.call(zoomBehavior)

  // 平滑缩放至适应视口并居中（参考组件 zoomFit，展开/收缩后调用）
  const smoothZoomFit = (nodesToFit, duration = ANIM_DURATION) => {
    if (!nodesToFit || nodesToFit.length === 0) return
    const pad = 80
    const xs = nodesToFit.map(n => n.x ?? n.oldX ?? width / 2).filter(Number.isFinite)
    const ys = nodesToFit.map(n => n.y ?? n.oldY ?? height / 2).filter(Number.isFinite)
    if (xs.length === 0 || ys.length === 0) return
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const bw = Math.max(maxX - minX, 1)
    const bh = Math.max(maxY - minY, 1)
    const scale = Math.min(width / (bw + pad), height / (bh + pad), 2)
    const midX = (minX + maxX) / 2
    const midY = (minY + maxY) / 2
    const target = d3.zoomIdentity.translate(width / 2, height / 2).scale(scale).translate(-midX, -midY)
    svg.transition().duration(duration).ease(ANIM_EASING).call(zoomBehavior.transform, target)
  }
  
  // 力导向 + 温和径向约束：既保持关系结构，又整体呈“圆圈向外扩展”的趋势
  simulation = d3.forceSimulation(visibleNodes)
    .force(
      'link',
      d3.forceLink(visibleLinks)
        .id(d => d.id)
        .distance(140)
        .strength(0.5)
    )
    .force('charge', d3.forceManyBody().strength(-260))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force(
      'radial',
      d3.forceRadial(d => getRadialDistance(d), width / 2, height / 2).strength(0.25)
    )
    .force('collision', d3.forceCollide().radius(d => getNodeRadius(d) + 6))
  
  const linkLayer = gRoot.append('g').attr('class', 'links').attr('stroke', '#A5ABB6').attr('stroke-opacity', 0.8)
  const nodeLayer = gRoot.append('g').attr('class', 'nodes')
  const textLayer = gRoot.append('g').attr('class', 'texts')

  const computeLinkOpacity = (d) => {
    if (!hasHighlight) return 0.8
    const sid = typeof d.source === 'object' ? d.source.id : d.source
    const tid = typeof d.target === 'object' ? d.target.id : d.target
    return (neighborNodeIds.has(sid) && neighborNodeIds.has(tid)) ? 0.9 : 0.1
  }
  
  linkSel = linkLayer
    .selectAll('line')
    .data(visibleLinks, d => {
      const sid = typeof d.source === 'object' ? d.source.id : d.source
      const tid = typeof d.target === 'object' ? d.target.id : d.target
      return `${sid}\0${tid}`
    })
    .join('line')
    .attr('stroke-width', 2)
    .style('opacity', computeLinkOpacity)

  // 每个节点用 <g> 包一组：外圈圆环 + 内圈实心圆 + 可选高亮光晕，模仿模板中的双圆样式
  nodeSel = nodeLayer
    .selectAll('g.graph-node')
    .data(visibleNodes, d => d.id)
    .join(
      enter => {
        // 新出现节点：从透明渐入，位置若未初始化则先放到画布中心
        const g = enter.append('g')
          .attr('class', 'graph-node')
          .style('opacity', 0)
        g.transition().duration(220).style('opacity', d => (isDimmedNode(d) ? 0.18 : 1))
        return g
      },
      update => update,
      exit => exit.remove()
    )
    .attr('class', 'graph-node')
    .style('opacity', d => (isDimmedNode(d) ? 0.18 : 1))
    .call(
      d3.drag()
        .on('start', (ev) => {
          if (!ev.active) simulation.alphaTarget(0.3).restart()
          ev.subject.fx = ev.subject.x
          ev.subject.fy = ev.subject.y
          // 拖拽时隐藏连线（参考组件交互）
          if (linkSel) linkSel.style('opacity', 0)
        })
        .on('drag', (ev) => {
          ev.subject.fx = ev.x
          ev.subject.fy = ev.y
        })
        .on('end', (ev) => {
          if (!ev.active) simulation.alphaTarget(0)
          ev.subject.fx = null
          ev.subject.fy = null
          if (linkSel) linkSel.style('opacity', computeLinkOpacity)
        })
    )

  // 高亮用的外层光晕圈（默认透明，hover 时放大+显现）
  nodeSel
    .append('circle')
    .attr('class', 'node-halo')
    .attr('r', d => getNodeRadius(d) + 8)
    .attr('fill', 'none')
    .attr('stroke', 'rgba(255,255,255,0.5)')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', d => (isRootNode(d) ? '4 4' : '0'))
    .style('opacity', 0)

  // 外圈彩色圆环
  nodeSel
    .append('circle')
    .attr('class', 'node-outer')
    .attr('r', d => getNodeRadius(d))
    .attr('fill', 'none')
    .attr('stroke', d => getNodeFill(d))
    .attr('stroke-width', d => (isRootNode(d) ? 6 : 4))

  // 内圈实心圆
  nodeSel
    .append('circle')
    .attr('class', 'node-inner')
    .attr('r', d => getNodeRadius(d) - 4)
    .attr('fill', d => (isRootNode(d) ? NEO4J.rootFill : getNodeFill(d)))
    .attr('stroke', '#f8fafc')
    .attr('stroke-width', 1.5)
  
  nodeSel.append('title').text(getNodeDisplayName)
  textSel = textLayer.selectAll('text').data(visibleNodes, d => d.id).join(
    enter => enter.append('text').style('opacity', 0),
    update => update,
    exit => exit.remove()
  )
    .text(getNodeDisplayName)
    .attr('font-size', d => `${getNodeFontSize(d)}px`)
    .attr('font-weight', getNodeFontWeight)
    .attr('text-anchor', 'middle')
    .attr('dy', 0)
    .style('font-family', '"KaiTi", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif')
    .style('fill', d => {
      const base = getNodeTextFill(d)
      if (!hasHighlight || !isDimmedNode(d)) return base
      // 未命中节点文字整体降为更浅的灰
      return '#cbd5e1'
    })
    // 文字描边/光晕：提升对比度（尤其是“根”）
    .style('paint-order', 'stroke')
    .style('stroke', d => {
      if (!hasHighlight || !isDimmedNode(d)) return getNodeTextStroke(d)
      // 变暗节点的描边也减弱
      return 'rgba(255,255,255,0.4)'
    })
    .style('stroke-width', d => {
      if (isRootNode(d)) return 0
      return hasHighlight && isDimmedNode(d) ? 1.5 : 3
    })
    .style('stroke-linejoin', 'round')
    .style('pointer-events', 'none')
    .style('opacity', d => (hasHighlight && isDimmedNode(d) ? 0.35 : 1))
  textSel.transition().duration(220).style('opacity', d => (hasHighlight && isDimmedNode(d) ? 0.35 : 1))
  
  // 点击节点显示 content 小卡片
  nodeSel.on('click', (ev, d) => {
    ev.stopPropagation()
    const content = (d.properties && d.properties.content) || ''
    if (content) {
      showNodeCardFunc(ev, d, content)
    }
  })

  const hideElementText = () => {
    if (!textSel) return
    textSel.interrupt()
    textSel.transition().duration(120).style('opacity', 0)
  }
  const showElementText = () => {
    if (!textSel) return
    textSel.interrupt()
    textSel.transition().duration(180).style('opacity', d => (hasHighlight && isDimmedNode(d) ? 0.35 : 1))
  }

  // 用于从全量图谱中找某节点的一层子节点（source -> target）
  const findOneLevelChildren = (nodeId) => {
    const out = []
    for (const l of masterGraph.links) {
      const sid = typeof l.source === 'object' ? l.source.id : l.source
      const tid = typeof l.target === 'object' ? l.target.id : l.target
      if (String(sid) === String(nodeId)) out.push(tid)
    }
    return [...new Set(out)]
  }

  // 递归收集当前可见的后代节点（用于收起时渐隐删除）
  const collectVisibleDescendants = (rootId) => {
    const stack = [rootId]
    const visited = new Set([rootId])
    const result = []
    while (stack.length) {
      const cur = stack.pop()
      const children = findOneLevelChildren(cur)
      for (const cid of children) {
        if (visited.has(cid)) continue
        visited.add(cid)
        if (visibleNodeIds.has(cid)) {
          result.push(cid)
          stack.push(cid)
        }
      }
    }
    return result
  }

  const applyFastForce = () => {
    if (!simulation) return
    simulation.force('link').distance(FAST_FORCE.linkDistance).strength(FAST_FORCE.linkStrength)
    simulation.force('charge').strength(FAST_FORCE.charge)
    simulation.force('radial').strength(FAST_FORCE.radialStrength)
    simulation.force('collision').radius(d => getNodeRadius(d) + FAST_FORCE.collisionPadding)
    simulation.alpha(0.6).alphaTarget(0.02).restart()
    setTimeout(() => {
      if (simulation) simulation.alphaTarget(0)
    }, 800)
  }

  // 双击：展开/收起（严格参考组件：平滑动画、无震动、展开/收缩后 zoomFit 居中）
  nodeSel.on('dblclick', (ev, d) => {
    ev.stopPropagation()
    if (isFlashcardNode(d)) return
    const id = d.id
    const st = nodeUiState.get(id) || { expanded: true, oldX: d.x, oldY: d.y }
    st.oldX = d.x
    st.oldY = d.y

    const isExpanded = st.expanded !== false
    const targetX = st.oldX
    const targetY = st.oldY

    if (isExpanded) {
      // 收缩：参考 contractChildNode - 画布平滑移至节点原始位置，子节点平滑收拢至父节点后删除
      st.expanded = false
      nodeUiState.set(id, st)

      const descendantIds = collectVisibleDescendants(id)
      if (descendantIds.length === 0) return

      hideElementText()

      const toRemove = new Set(descendantIds)
      const remaining = visibleNodes.filter(n => !toRemove.has(n.id))

      remaining.forEach(n => {
        savedNodePositions.set(n.id, { x: n.x, y: n.y })
      })

      if (simulation) simulation.stop()

      // 父节点平滑回到原始位置（900ms easeOutQuad）
      nodeSel
        .filter(n => n.id === id)
        .transition()
        .duration(900)
        .ease(ANIM_EASING)
        .attrTween('transform', function () {
          const n = d
          const startX = n.x
          const startY = n.y
          return (t) => {
            n.x = startX + (targetX - startX) * t
            n.y = startY + (targetY - startY) * t
            return `translate(${n.x},${n.y})`
          }
        })

      // 子节点平滑收拢至父节点后渐隐（1000ms easeOutQuad）
      nodeSel
        .filter(n => toRemove.has(n.id))
        .transition()
        .duration(ANIM_DURATION)
        .ease(ANIM_EASING)
        .attrTween('transform', function (n) {
          const startX = n.x
          const startY = n.y
          return (t) => {
            n.x = startX + (targetX - startX) * t
            n.y = startY + (targetY - startY) * t
            return `translate(${n.x},${n.y})`
          }
        })
        .style('opacity', 0)

      if (textSel) {
        textSel
          .filter(n => toRemove.has(n.id))
          .transition()
          .duration(ANIM_DURATION)
          .ease(ANIM_EASING)
          .style('opacity', 0)
      }

      linkLayer
        .selectAll('line')
        .filter(l => {
          const sid = typeof l.source === 'object' ? l.source.id : l.source
          const tid = typeof l.target === 'object' ? l.target.id : l.target
          return toRemove.has(sid) || toRemove.has(tid)
        })
        .transition()
        .duration(ANIM_DURATION)
        .ease(ANIM_EASING)
        .style('opacity', 0)

      if (linkSel) {
        linkSel.filter(l => {
          const sid = typeof l.source === 'object' ? l.source.id : l.source
          const tid = typeof l.target === 'object' ? l.target.id : l.target
          return toRemove.has(sid) || toRemove.has(tid)
        }).transition().duration(ANIM_DURATION).ease(ANIM_EASING).style('opacity', 0)
      }

      // 同步更新连线坐标（动画期间）
      const tickLinks = () => {
        linkSel.attr('x1', l => l.source.x).attr('y1', l => l.source.y).attr('x2', l => l.target.x).attr('y2', l => l.target.y)
      }
      const tickTexts = () => {
        textSel.attr('x', n => n.x).attr('y', n => (isRootNode(n) ? n.y + 4 : n.y + getNodeRadius(n) + 14))
      }
      const ticker = setInterval(() => {
        tickLinks()
        tickTexts()
      }, 16)
      setTimeout(() => {
        clearInterval(ticker)
        descendantIds.forEach(cid => visibleNodeIds.delete(cid))
        savedNodePositions.forEach((_, nid) => {
          if (!visibleNodeIds.has(nid)) savedNodePositions.delete(nid)
        })
        nextTick(() => {
          renderGraph()
          const remainNodes = masterGraph.nodes.filter(n => visibleNodeIds.has(n.id))
          nextTick(() => {
            const nodesForFit = simulation ? simulation.nodes() : remainNodes
            if (nodesForFit && nodesForFit.length > 0) {
              setTimeout(() => {
                smoothZoomFit(nodesForFit)
                if (simulation) simulation.stop()
              }, 100)
            }
            setTimeout(() => {
              if (simulation) simulation.stop()
              showElementText()
            }, 150)
          })
        })
      }, ANIM_DURATION + 50)
      return
    }

    // 展开：子节点从父节点位置平滑散开（与收缩对称，同 duration/easing）
    st.expanded = true
    nodeUiState.set(id, st)

    const childIds = findOneLevelChildren(id)
    if (childIds.length === 0) return

    hideElementText()

    childIds.forEach(cid => visibleNodeIds.add(cid))
    childIds.forEach(cid => {
      const cs = nodeUiState.get(cid) || { expanded: true, oldX: d.x, oldY: d.y }
      cs.oldX = d.x
      cs.oldY = d.y
      nodeUiState.set(cid, cs)
    })

    const parentX = d.x
    const parentY = d.y
    childIds.forEach(cid => savedNodePositions.set(cid, { x: parentX, y: parentY }))

    if (simulation) simulation.stop()
    nextTick(() => {
      renderGraph()
      requestAnimationFrame(() => {
        if (!simulation || !nodeSel) return
        const newNodes = visibleNodes.filter(n => childIds.includes(n.id))
        const N = newNodes.length
        if (N > 0) {
          const radius = 130
          newNodes.forEach((n, i) => {
            const angle = (2 * Math.PI * i) / N
            const tx = parentX + radius * Math.cos(angle)
            const ty = parentY + radius * Math.sin(angle)
            n._targetX = tx
            n._targetY = ty
          })
        }
        const newNodeSel = nodeLayer.selectAll('g.graph-node').filter(n => childIds.includes(n.id))
        if (newNodeSel.size() > 0 && N > 0) {
          newNodeSel
            .style('opacity', 0)
            .transition()
            .duration(ANIM_DURATION)
            .ease(ANIM_EASING)
            .attrTween('transform', function (n) {
              const startX = parentX
              const startY = parentY
              const endX = n._targetX ?? parentX
              const endY = n._targetY ?? parentY
              return (t) => {
                n.x = startX + (endX - startX) * t
                n.y = startY + (endY - startY) * t
                return `translate(${n.x},${n.y})`
              }
            })
            .style('opacity', d => (isDimmedNode(d) ? 0.18 : 1))
            .on('end', function () {
              newNodes.forEach(n => {
                delete n._targetX
                delete n._targetY
              })
              const nodesForFit = simulation ? simulation.nodes() : visibleNodes
              if (nodesForFit && nodesForFit.length > 0) {
                setTimeout(() => {
                  smoothZoomFit(nodesForFit)
                  if (simulation) simulation.stop()
                }, 100)
              } else if (simulation) {
                simulation.stop()
              }
              setTimeout(() => {
                showElementText()
              }, 150)
            })
        } else {
          const nodesForFit = simulation ? simulation.nodes() : visibleNodes
          if (nodesForFit && nodesForFit.length > 0) {
            setTimeout(() => {
              smoothZoomFit(nodesForFit)
              if (simulation) simulation.stop()
            }, 100)
          } else if (simulation) {
            simulation.stop()
          }
          setTimeout(() => {
            showElementText()
          }, 150)
        }
      })
    })
  })

  // hover 高亮：外圈加粗 + 光晕圈显现，模仿模板鼠标悬浮效果
  nodeSel
    .on('mouseover', function (ev, d) {
      const gSel = d3.select(this)
      gSel
        .select('.node-outer')
        .attr('stroke', 'rgba(100,250,100,1)')
        .attr('stroke-width', isRootNode(d) ? 8 : 6)
      gSel
        .select('.node-halo')
        .transition()
        .duration(150)
        .attr('r', getNodeRadius(d) + 14)
        .style('opacity', 1)
      gSel.style('filter', 'drop-shadow(0 0 18px rgba(100,250,100,0.85))')
    })
    .on('mouseout', function (ev, d) {
      const gSel = d3.select(this)
      gSel
        .select('.node-outer')
        .attr('stroke', getNodeFill(d))
        .attr('stroke-width', isRootNode(d) ? 6 : 4)
      gSel
        .select('.node-halo')
        .transition()
        .duration(150)
        .attr('r', getNodeRadius(d) + 8)
        .style('opacity', 0)
      gSel.style('filter', 'none')
    })
  
  simulation.on('tick', () => {
    linkSel
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)

    nodeSel.attr('transform', d => `translate(${d.x},${d.y})`)
    textSel
      .attr('x', d => d.x)
      .attr('y', d => {
        // 根节点文字放在圆圈内部，其它节点仍在下方
        if (isRootNode(d)) return d.y + 4
        return d.y + getNodeRadius(d) + 14
      })

    // 布局稳定后立即停止力导向，避免图谱持续微抖
    if (simulation.alpha() < 0.02) simulation.stop()
  })
}

// 仅在有数据变化时渲染一次（不监听 dimensions，避免卡死）
watch(
  () => [
    props.graphNodes?.length,
    props.graphLinks?.length,
    filteredFlashcards.value.length,
    // 高亮 ID 变化时需要重新渲染以更新明暗状态
    (props.highlightIds || []).join(',')
  ],
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
    graphId: node.id != null ? String(node.id) : '',
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
  nodeCardData.value = { id: '', graphId: '', title: '', content: '', htmlContent: '', hierarchyPath: '' }
}

// 打开编辑弹窗
const openEditModal = () => {
  editForm.value = {
    id: nodeCardData.value.id,
    graphId: nodeCardData.value.graphId,
    title: nodeCardData.value.title,
    content: nodeCardData.value.content,
    htmlContent: nodeCardData.value.htmlContent,
    hierarchyPath: nodeCardData.value.hierarchyPath
  }
  // 1) 先用图谱结构回填层级路径（最可靠，不依赖详情接口）
  if (!editForm.value.hierarchyPath && editForm.value.graphId) {
    const hp = buildHierarchyPathFromGraph(editForm.value.graphId)
    if (hp) editForm.value.hierarchyPath = hp
  }
  // 若当前未拿到层级路径，尝试从详情接口补全
  if (!editForm.value.hierarchyPath && editForm.value.id) {
    loadingDetail.value = true
    flashCardApi.getDetail(editForm.value.id).then((detail) => {
      if (!detail) return
      const hp = detail.hierarchyPath || detail.category || ''
      if (hp) editForm.value.hierarchyPath = hp
      if (!editForm.value.title && detail.title) editForm.value.title = detail.title
      if (!editForm.value.content && detail.content) editForm.value.content = detail.content
      if (!editForm.value.htmlContent && detail.htmlContent) editForm.value.htmlContent = detail.htmlContent
    }).catch(() => {}).finally(() => { loadingDetail.value = false })
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
    savingEdit.value = true
    await flashCardApi.update({
      id: idStr,
      title: title || '',
      content: content || '',
      htmlContent: htmlContent ?? content ?? '',
      // 新增：把层级路径一并传给后端，用于同步 Neo4j 层级结构
      hierarchyPath: (hierarchyPath || '').trim() || undefined
    })
    nodeCardData.value = {
      ...nodeCardData.value,
      title: title || nodeCardData.value.title,
      content: content || nodeCardData.value.content,
      htmlContent: htmlContent ?? content ?? nodeCardData.value.htmlContent,
      hierarchyPath: hierarchyPath || nodeCardData.value.hierarchyPath
    }
    closeEditModal()
    ElMessage && ElMessage.success('保存成功')
    emit('refresh')
  } catch (err) {
    console.error('保存失败', err)
    alert(err?.message || err?.response?.data?.message || '保存失败，请重试')
  } finally {
    savingEdit.value = false
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
  background: #5b52f9;
  color: white;
  box-shadow: 0 4px 6px rgba(91, 82, 249, 0.3);
}

.btn-compare:hover {
  background: #4a42d9;
  box-shadow: 0 6px 12px rgba(91, 82, 249, 0.4);
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
  /* 与根/分类节点主色系统一为紫色系小点 */
  background: #A78BFA;
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
  /* 编辑弹窗更大更宽 */
  max-width: 700px;
  /* 更高一些，仍保留可滚动 */
  height: 86vh;
  max-height: 94vh;
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
  /* 内容区更大一些，跟随弹窗宽度已经是 100%，这里提高默认高度方便编辑长文案 */
  min-height: 340px;
}

.node-edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e6eb;
}

.node-card-btn-primary[disabled] {
  opacity: 0.85;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-loading {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-loading-spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-top-color: #ffffff;
  animation: btn-spin 0.6s linear infinite;
}

@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

