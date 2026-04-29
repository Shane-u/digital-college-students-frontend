<template>
  <div class="flashcard-graph-container">
    <!-- 顶部标题条：闪卡图谱 -->
    <GraphTopHeader v-if="!hideToolbar" title="闪 卡 图 谱" />

    <!-- 右侧悬挂彩带（默认展开，点头像收起到右上角） -->
    <FlashcardRibbonMenu
      v-if="!hideToolbar"
      :avatar-url="userAvatar"
      :nickname="userNickname"
      :legend-active="showLegend"
      @search="handleRibbonSearch"
      @filter="toggleFilterPopover"
      @compare="handleCompare"
      @temp="handleGoToTemp"
      @stats="openStats"
      @legend="toggleLegend"
    />

    <!-- 图谱区域（有 Neo4j nodes/links 或闪卡列表即显示图谱） -->
    <div ref="graphContainer" class="graph-area">
      <div v-if="!hasGraphData" class="empty-graph">
        <div class="empty-icon">📊</div>
        <p class="empty-text">图谱暂无内容</p>
        <p class="empty-hint">请先生成闪卡并保存入库</p>
      </div>
      <svg v-else ref="svgRef" class="graph-svg" @click="handleBackgroundDblClick"></svg>
    </div>

    <!-- 图例 -->
    <div v-if="!hideToolbar && showLegend" class="graph-legend">
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
        <div class="legend-item">
          <span class="legend-dot testpoint"></span>
          <span class="legend-label">测试点节点</span>
        </div>
      </div>
      <div class="legend-hints">
        <p>🖱️ 单击节点复习内容</p>
        <p>👆 双击分类节点收缩/展开</p>
        <p>🔍 滚轮缩放图谱视野</p>
      </div>
    </div>

    <!-- 彩带弹出：节点搜索 -->
    <FlashcardGraphSearchPopover
      v-if="!hideToolbar"
      :visible="showSearchPopover"
      :keyword="searchKeyword"
      @update:keyword="(val) => (searchKeyword = val)"
      @confirm="confirmSearch"
      @close="closeSearch"
    />

    <!-- 彩带弹出：筛选（时间范围） -->
    <FlashcardGraphFilterPopover
      v-if="!hideToolbar"
      :visible="showFilterPopover"
      :time-ranges="timeRanges"
      :time-range="timeRange"
      @change="handleTimeRangeChange"
      @close="showFilterPopover = false"
    />

    <!-- 彩带弹出：数据统计 -->
    <FlashcardGraphStatsModal
      v-if="!hideToolbar"
      :visible="showStatsModal"
      :active-time-range-label="activeTimeRangeLabel"
      :stats="graphStats"
      @close="closeStats"
    />
    
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
            <button type="button" class="node-card-btn node-card-btn-primary node-card-btn-generate" @click="handleGenerateTest">
              生成测试题
            </button>
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

    <FlashcardTestDifficultyDialog
      :visible="showDifficulty"
      v-model="difficulty"
      :loading="generatingTest"
      @close="showDifficulty = false"
      @confirm="confirmGenerateTest"
    />

    <FlashcardTestPointDrawer
      :visible="showTestPoint"
      :node-id="testPointNodeId"
      :refresh-trigger="drawerRefreshTrigger"
      @close="showTestPoint = false"
      @redo="handleRedoPaper"
      @delete="handleDeletePaper"
      @open-attempts="handleOpenAttempts"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as d3 from 'd3'
import { ElMessage } from 'element-plus'
import { confirmAction } from '../../utils/confirm'
import { sanitizeHtml } from '../../utils/sanitizeHtml'
import { flashCardApi } from '../../api/flashCard'
import { flashCardTestApi } from '../../api/flashCardTest'
import {
  hasTestPoint,
  markHasTestPoint,
  saveFlashcardTestContext,
  saveTestPaper,
  setLatestTestId
} from '../../utils/flashcardTestStorage'
import FlashcardRibbonMenu from './FlashcardRibbonMenu.vue'
import FlashcardGraphSearchPopover from './FlashcardGraphSearchPopover.vue'
import FlashcardGraphFilterPopover from './FlashcardGraphFilterPopover.vue'
import FlashcardGraphStatsModal from './FlashcardGraphStatsModal.vue'
import GraphTopHeader from '../common/GraphTopHeader.vue'
import FlashcardTestDifficultyDialog from './Test/FlashcardTestDifficultyDialog.vue'
import FlashcardTestPointDrawer from './Test/FlashcardTestPointDrawer.vue'

const router = useRouter()

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
  },
  /** 用户头像（用于右侧彩带头像） */
  userAvatar: {
    type: String,
    default: ''
  },
  /** 用户昵称首字母（头像失败时兜底显示） */
  userNickname: {
    type: String,
    default: 'U'
  }
})

const emit = defineEmits(['nodeClick', 'goToTemp', 'compare', 'refresh', 'search', 'filterByTime', 'clearHighlight'])

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
const showDifficulty = ref(false)
const difficulty = ref('medium')
const generatingTest = ref(false)
const pendingGenerateNodeId = ref('')

// 右侧彩带：图例显隐、筛选弹出层、统计弹窗
const showLegend = ref(true)
const showSearchPopover = ref(false)
const showFilterPopover = ref(false)
const showStatsModal = ref(false)

const graphStats = ref({
  flashcards: 0,
  masterNodes: 0,
  masterLinks: 0,
  visibleNodes: 0,
  highlightHits: 0
})

// 双击空白区域：清除高亮（用于对比模式恢复初始状态，也可在普通图谱下清空搜索高亮）
const handleBackgroundDblClick = () => {
  emit('clearHighlight')
}

const timeRanges = [
  { value: 'ALL', label: '全部' },
  { value: '7D', label: '近7天' },
  { value: '15D', label: '近半个月' },
  { value: '1M', label: '近1个月' },
  { value: '6M', label: '近半年' },
  { value: '1Y', label: '近一年' },
  { value: 'BEFORE_1Y', label: '一年前' }
]

const activeTimeRangeLabel = computed(() => {
  const r = timeRanges.find(x => x.value === timeRange.value)
  return r ? r.label : '全部'
})

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
const handleRibbonSearch = () => {
  showSearchPopover.value = true
}

const closeSearch = () => {
  showSearchPopover.value = false
}

const confirmSearch = (keywordFromChild) => {
  const keyword = (keywordFromChild ?? searchKeyword.value ?? '').trim()
  emit('search', keyword)
  showSearchPopover.value = false
}

const toggleFilterPopover = () => {
  showFilterPopover.value = !showFilterPopover.value
}

const handleTimeRangeChange = (value) => {
  timeRange.value = value
  // 通知上层根据时间范围高亮对应节点
  emit('filterByTime', value)
}

const toggleLegend = () => {
  showLegend.value = !showLegend.value
}

const openStats = () => {
  showStatsModal.value = true
}

const closeStats = () => {
  showStatsModal.value = false
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
  if (d?.id === '根' || /Root/i.test(String(d?.label || ''))) return '' // 根节点不显示文字
  const rawLabel = (d?.label || d?.properties?.label || '').toString()
  if (/TestPoint/i.test(rawLabel) || d?.type === 'testpoint') return '测试点'
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

// 绿色勾：以节点数据 litStatus 为准，为 true 显示、为 false 或不存在则不显示
const getNodePassed = (d) => d?.properties?.litStatus === true

// 渲染D3图谱（支持 根/课程/名 路径格式，Neo4j 风格节点）
let simulation = null
let zoomBehavior = null
let gRoot = null
let linkSel = null
let nodeSel = null
let textSel = null
let baseViewBox = { w: 0, h: 0 }

// 交互状态：用于“初始全显示 + 双击收起/展开”
const nodeUiState = new Map() // id -> { expanded:boolean, oldX:number, oldY:number }
let masterGraph = { nodes: [], links: [] } // 全量数据快照（渲染时更新）
/** 当前可见子图 BFS 深度（根=0），用于同级统一节点大小与知识节点紫色层级 */
let nodeDepthById = new Map()
let visibleNodeIds = new Set() // 当前可见节点集合（初始为全量）
let prevMasterNodeIds = new Set() // 上一轮全量节点 id，用于识别“新节点”并默认显示
let savedNodePositions = new Map() // id -> {x,y} 收起后保留剩余节点位置，避免弹动

const FAST_FORCE = {
  frictionAlphaTarget: 0.35,
  linkDistance: 185,
  linkStrength: 0.62,
  charge: -520,
  radialStrength: 0.28,
  collisionPadding: 16
}

// 动画参数（与参考组件一致：duration 900-1000ms, easeOutQuad）
const ANIM_DURATION = 1000
const ANIM_EASING = d3.easeQuadOut
// 图谱连线与辅助色
const NEO4J = {
  linkStroke: '#94a3b8',
  labelFill: '#334155',
  nodeStrokeWidth: 2
}

/** 知识分类节点：统一紫系，每层明度/饱和度有区分 */
const CATEGORY_PURPLE_BY_DEPTH = [
  '#3b0764',
  '#5b21b6',
  '#6d28d9',
  '#7c3aed',
  '#8b5cf6',
  '#a78bfa',
  '#c4b5fd'
]

const FLASHCARD_FILL = '#eab308'
const TEST_POINT_FILL = '#22c55e'

/** 根节点单独更大；其余深度同级等大（depth 0 仅根） */
const ROOT_NODE_RADIUS = 36
/** 同一 BFS 深度的非根节点半径一致 */
const RADIUS_BY_DEPTH = [26, 24, 22, 21, 20, 19, 18]

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
  if (!d) return false
  if (d.type === 'flashcard') return true
  const label = (d?.label || '').toString()
  // 后端已存在的 TestPoint 节点不要当作闪卡
  if (/TestPoint/i.test(label)) return false
  return /FlashCard|Flashcard/i.test(label)
}

const isTestPointNode = (d) => {
  if (!d) return false
  if (d.type === 'testpoint') return true
  const label = (d.label || d.properties?.label || '').toString()
  return /TestPoint/i.test(label)
}

const isRootNode = (d) => {
  const label = (d?.label || '').toString()
  if (/Root/i.test(label)) return true
  const id = d?.id
  if (id === '根') return true
  const name = getNodeDisplayName(d)
  return name === '根'
}

/** 从根节点 BFS，得到每个节点深度（用于同级等大小、知识节点分色） */
const computeBfsDepthsFromRoots = (nodes, links) => {
  const depthMap = new Map()
  const idSet = new Set(nodes.map(n => n.id))
  const children = new Map()
  nodes.forEach(n => children.set(n.id, []))
  links.forEach(l => {
    const s = typeof l.source === 'object' ? l.source.id : l.source
    const t = typeof l.target === 'object' ? l.target.id : l.target
    if (!idSet.has(s) || !idSet.has(t)) return
    children.get(s).push(t)
  })
  const queue = []
  nodes.forEach(n => {
    if (isRootNode(n)) {
      depthMap.set(n.id, 0)
      queue.push(n.id)
    }
  })
  if (queue.length === 0) {
    const incoming = new Set()
    links.forEach(l => {
      const t = typeof l.target === 'object' ? l.target.id : l.target
      incoming.add(t)
    })
    nodes.forEach(n => {
      if (!incoming.has(n.id)) {
        depthMap.set(n.id, 0)
        queue.push(n.id)
      }
    })
  }
  if (queue.length === 0 && nodes[0]) {
    depthMap.set(nodes[0].id, 0)
    queue.push(nodes[0].id)
  }
  while (queue.length) {
    const u = queue.shift()
    const du = depthMap.get(u)
    for (const v of children.get(u) || []) {
      if (!depthMap.has(v)) {
        depthMap.set(v, du + 1)
        queue.push(v)
      }
    }
  }
  nodes.forEach(n => {
    if (!depthMap.has(n.id)) depthMap.set(n.id, 1)
  })
  return depthMap
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
  if (isRootNode(d)) return ROOT_NODE_RADIUS
  const dep = nodeDepthById.get(d.id)
  const idx = dep != null ? Math.min(dep, RADIUS_BY_DEPTH.length - 1) : Math.min(getGraphNodeDepth(d), RADIUS_BY_DEPTH.length - 1)
  return RADIUS_BY_DEPTH[idx]
}

/**
 * 核心放射状环形布局（确定性）
 * - 根/核心节点固定在画布中心
 * - 严格按 BFS 层级分布在同心圆上
 * - 角度用“子树扇区分配”，尽量减少交叉并让连线呈辐射状
 * - 自动调整每一环半径，保证同环节点不重叠
 */
const computeCoreRadialRingLayout = (nodes, links, width, height, depthMap) => {
  const cx = width / 2
  const cy = height / 2
  const byId = new Map(nodes.map(n => [n.id, n]))
  const idSet = new Set(nodes.map(n => n.id))

  // 根节点（优先 Root/根）
  const roots = nodes.filter(n => isRootNode(n))
  const root = roots[0] || nodes[0]
  if (!root) return { angleById: new Map(), posById: new Map() }

  // 出边 children（仅用当前可见子图）
  const outChildren = new Map()
  nodes.forEach(n => outChildren.set(n.id, []))
  links.forEach(l => {
    const s = typeof l.source === 'object' ? l.source.id : l.source
    const t = typeof l.target === 'object' ? l.target.id : l.target
    if (!idSet.has(s) || !idSet.has(t)) return
    outChildren.get(s).push(t)
  })

  // 构造 BFS 树：每个节点只选一个父节点（避免 DAG 造成角度冲突）
  const parent = new Map()
  parent.set(root.id, null)
  const q = [root.id]
  while (q.length) {
    const u = q.shift()
    const ch = outChildren.get(u) || []
    for (const v of ch) {
      if (!idSet.has(v)) continue
      // 优先“更深一层”的边（严格层级）
      const du = depthMap.get(u) ?? 0
      const dv = depthMap.get(v) ?? (du + 1)
      if (dv !== du + 1) continue
      if (!parent.has(v)) {
        parent.set(v, u)
        q.push(v)
      }
    }
  }
  // 未被 BFS 树覆盖的节点：尽量挂到同层级最近的上层父（fallback），否则挂 root
  nodes.forEach(n => {
    if (n.id === root.id) return
    if (parent.has(n.id)) return
    const dn = depthMap.get(n.id) ?? 1
    let p = root.id
    // 在所有可能入边里找一个 depth = dn-1 的 source
    for (const l of links) {
      const s = typeof l.source === 'object' ? l.source.id : l.source
      const t = typeof l.target === 'object' ? l.target.id : l.target
      if (t !== n.id) continue
      const ds = depthMap.get(s)
      if (ds != null && ds === dn - 1) {
        p = s
        break
      }
    }
    parent.set(n.id, p)
  })

  const treeChildren = new Map()
  nodes.forEach(n => treeChildren.set(n.id, []))
  nodes.forEach(n => {
    const p = parent.get(n.id)
    if (!p) return
    if (treeChildren.has(p)) treeChildren.get(p).push(n.id)
  })

  // 子树权重（叶子=1，内部=子权重和）
  const weight = new Map()
  const dfsWeight = (id) => {
    if (weight.has(id)) return weight.get(id)
    const ch = treeChildren.get(id) || []
    if (!ch.length) {
      weight.set(id, 1)
      return 1
    }
    let sum = 0
    for (const c of ch) sum += dfsWeight(c)
    weight.set(id, Math.max(sum, 1))
    return weight.get(id)
  }
  dfsWeight(root.id)

  // 每层节点集合
  const nodesByDepth = new Map()
  nodes.forEach(n => {
    const d = depthMap.get(n.id) ?? 0
    if (!nodesByDepth.has(d)) nodesByDepth.set(d, [])
    nodesByDepth.get(d).push(n.id)
  })

  // 计算每层需要的最小半径（避免同环重叠），并给出均匀环距的基础值
  const ringPadding = 18
  const baseRingGap = 150
  const ringRadiusByDepth = new Map()
  const maxDepth = Math.max(...Array.from(nodesByDepth.keys()))
  let prevR = 0
  for (let d = 0; d <= maxDepth; d++) {
    if (d === 0) {
      ringRadiusByDepth.set(0, 0)
      prevR = 0
      continue
    }
    const ids = nodesByDepth.get(d) || []
    if (!ids.length) {
      ringRadiusByDepth.set(d, prevR + baseRingGap)
      prevR = ringRadiusByDepth.get(d)
      continue
    }
    const minSep = Math.max(...ids.map(id => 2 * getNodeRadius(byId.get(id)) + ringPadding))
    const minRByCount = (ids.length * minSep) / (2 * Math.PI)
    const r = Math.max(prevR + baseRingGap, minRByCount)
    ringRadiusByDepth.set(d, r)
    prevR = r
  }

  // 扇区分配：root 占满 2π
  const angleById = new Map()
  const spanById = new Map()
  spanById.set(root.id, { start: -Math.PI, end: Math.PI })
  angleById.set(root.id, 0)

  const sortChildrenStable = (ids) => {
    // 优先分类节点，再闪卡，再测试点；同类按显示名稳定排序
    const typeRank = (nid) => {
      const n = byId.get(nid)
      if (!n) return 99
      if (isTestPointNode(n)) return 2
      if (isFlashcardNode(n)) return 1
      return 0
    }
    return [...ids].sort((a, b) => {
      const ra = typeRank(a)
      const rb = typeRank(b)
      if (ra !== rb) return ra - rb
      const na = getNodeDisplayName(byId.get(a)) || String(a)
      const nb = getNodeDisplayName(byId.get(b)) || String(b)
      return na.localeCompare(nb, 'zh-Hans-CN')
    })
  }

  const assignAngles = (id) => {
    const span = spanById.get(id)
    if (!span) return
    const chRaw = treeChildren.get(id) || []
    const ch = sortChildrenStable(chRaw)
    if (!ch.length) return
    const totalW = ch.reduce((s, c) => s + (weight.get(c) || 1), 0) || 1
    let cur = span.start
    for (const c of ch) {
      const w = weight.get(c) || 1
      const len = ((span.end - span.start) * w) / totalW
      const s = cur
      const e = cur + len
      spanById.set(c, { start: s, end: e })
      angleById.set(c, (s + e) / 2)
      cur = e
      assignAngles(c)
    }
  }
  assignAngles(root.id)

  // 生成坐标：严格同心圆
  const posById = new Map()
  nodes.forEach(n => {
    const d = depthMap.get(n.id) ?? 0
    const r = ringRadiusByDepth.get(d) ?? (d * baseRingGap)
    const a = angleById.get(n.id) ?? 0
    const x = cx + r * Math.cos(a)
    const y = cy + r * Math.sin(a)
    posById.set(n.id, { x, y, a, r })
  })
  // 根节点强制在中心（锚定）
  posById.set(root.id, { x: cx, y: cy, a: 0, r: 0 })

  return { angleById, posById, rootId: root.id, ringRadiusByDepth }
}

const getNodeFill = (d) => {
  if (isRootNode(d)) return '#2563eb'
  if (isTestPointNode(d)) return TEST_POINT_FILL
  if (isFlashcardNode(d)) return FLASHCARD_FILL
  const dep = nodeDepthById.get(d.id) ?? 0
  return CATEGORY_PURPLE_BY_DEPTH[Math.min(dep, CATEGORY_PURPLE_BY_DEPTH.length - 1)]
}

// 根据层级决定节点在径向布局中的半径（越深越远，环距加大以减少连线交叉）
const radialByDepth = (depth) => {
  if (depth <= 1) return 0
  if (depth === 2) return 210
  if (depth === 3) return 330
  if (depth === 4) return 440
  return 540
}

const getRadialDistance = (d) => {
  const depth = nodeDepthById.get(d.id) ?? getGraphNodeDepth(d)
  if (isTestPointNode(d)) return 580
  if (isFlashcardNode(d)) return 520
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
  if (isRootNode(d)) return '#ffffff'
  return '#111827'
}

const getNodeTextStroke = (d) => {
  return isRootNode(d) ? 'none' : 'rgba(255,255,255,0.85)'
}

const renderGraph = () => {
  updateDimensions()
  if (!svgRef.value || dimensions.value.width === 0 || dimensions.value.height === 0) return
  const { width, height } = dimensions.value
  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()
  // 固定内部坐标系（viewBox），拖拽分栏时只变更外部尺寸，让整张图谱产生“被压缩/拉伸”的效果
  baseViewBox = { w: width, h: height }
  svg
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${baseViewBox.w} ${baseViewBox.h}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
  
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

    // 任意一个闪卡只保留一个测试点节点：按「边的来源」去重，同一节点连出的多个 TestPoint 只保留一个
    const testPointNodes = nodes.filter(n => isTestPointNode(n))
    const testPointIdSet = new Set(testPointNodes.map(n => n.id))
    const nonTestPointNodes = nodes.filter(n => !isTestPointNode(n))
    // 统计每个“来源节点”连出了哪些 TestPoint（source -> [target TestPoint ids]）
    const sourceToTestTargets = new Map()
    for (const l of links) {
      const sid = typeof l.source === 'object' ? l.source.id : l.source
      const tid = typeof l.target === 'object' ? l.target.id : l.target
      if (!testPointIdSet.has(tid)) continue
      if (!sourceToTestTargets.has(sid)) sourceToTestTargets.set(sid, [])
      sourceToTestTargets.get(sid).push(tid)
    }
    const keptTestPointIds = new Set()
    sourceToTestTargets.forEach((targetIds) => {
      if (targetIds.length > 0) keptTestPointIds.add(targetIds[0])
    })
    const uniqueTestPointNodes = testPointNodes.filter(n => keptTestPointIds.has(n.id))
    // 为保留的测试点节点补全 businessId（用于点击打开抽屉）：来自连线的源节点
    const targetToSourceId = new Map()
    for (const l of links) {
      const sid = typeof l.source === 'object' ? l.source.id : l.source
      const tid = typeof l.target === 'object' ? l.target.id : l.target
      if (testPointIdSet.has(tid)) targetToSourceId.set(tid, sid)
    }
    const allNodesForLookup = [...nonTestPointNodes, ...testPointNodes]
    uniqueTestPointNodes.forEach((n) => {
      const sourceId = targetToSourceId.get(n.id)
      const sourceNode = allNodesForLookup.find((x) => x.id === sourceId)
      const bidFromLink = sourceNode?.businessId != null ? String(sourceNode.businessId) : null
      // 若连线来源是闪卡节点，用其 businessId 作为测试点的闪卡 id，保证点击打开抽屉时能按闪卡拉取试卷列表
      if (bidFromLink && isFlashcardNode(sourceNode)) {
        n.businessId = bidFromLink
        if (!n.properties) n.properties = {}
        n.properties.nodeId = bidFromLink
      } else if (!n.businessId && (n.properties?.nodeId == null || n.properties.nodeId === '')) {
        // 否则仅当完全没有时再补（可能来源是分类节点，无 businessId）
        if (bidFromLink) {
          n.businessId = bidFromLink
          if (!n.properties) n.properties = {}
          n.properties.nodeId = bidFromLink
        }
      }
      n.type = 'testpoint'
    })
    nodes = [...nonTestPointNodes, ...uniqueTestPointNodes]
    const keptNodeIds = new Set(nodes.map((n) => n.id))
    links = links.filter((l) => {
      const sid = typeof l.source === 'object' ? l.source.id : l.source
      const tid = typeof l.target === 'object' ? l.target.id : l.target
      return keptNodeIds.has(sid) && keptNodeIds.has(tid)
    })

    // 前端补充“测试点”子节点：仅当该闪卡在图中既没有对应 TestPoint 节点、也没有“闪卡→TestPoint”的边时才补（Neo4j 已有一个测试点则不再补）
    const extraNodes = []
    const extraLinks = []
    const hasLinkFromFlashcardToTestPoint = (flashcardNodeId) => links.some((l) => {
      const sid = typeof l.source === 'object' ? l.source.id : l.source
      const tid = typeof l.target === 'object' ? l.target.id : l.target
      if (sid !== flashcardNodeId) return false
      const targetNode = nodes.find((nn) => nn.id === tid)
      return targetNode && isTestPointNode(targetNode)
    })
    for (const n of nodes) {
      if (!isFlashcardNode(n)) continue
      const bid = n.businessId != null ? String(n.businessId) : null
      if (!bid) continue
      if (!hasTestPoint(bid)) continue
      const backendHasById = nodes.some(x => isTestPointNode(x) && (x.businessId != null ? String(x.businessId) === bid : String(x.properties?.nodeId ?? '') === bid))
      const backendHasByLink = hasLinkFromFlashcardToTestPoint(n.id)
      if (backendHasById || backendHasByLink) continue
      const tpId = `testpoint:${bid}`
      extraNodes.push({
        id: tpId,
        label: '测试点',
        type: 'testpoint',
        properties: { nodeId: bid },
        businessId: bid
      })
      extraLinks.push({ source: n.id, target: tpId, type: 'HAS_TEST_POINT' })
    }
    if (extraNodes.length) nodes = nodes.concat(extraNodes)
    if (extraLinks.length) links = links.concat(extraLinks)
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
          color: CATEGORY_PURPLE_BY_DEPTH[Math.min(i, CATEGORY_PURPLE_BY_DEPTH.length - 1)],
          stroke: '#ffffff',
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
      color: FLASHCARD_FILL,
      stroke: '#ffffff',
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

  // 无 Neo4j 时：有测试记录的闪卡每个只补一个测试点节点，点击后抽屉内展示多套试卷列表
  filteredFlashcards.value.forEach(card => {
    const bid = card.id != null ? String(card.id) : null
    if (!bid || !hasTestPoint(bid)) return
    const tpId = `testpoint:${bid}`
    nodes.push({
      id: tpId,
      label: '测试点',
      type: 'testpoint',
      properties: { nodeId: bid },
      businessId: bid
    })
    links.push({ source: card.id, target: tpId, type: 'HAS_TEST_POINT' })
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
  graphStats.value.masterNodes = masterGraph.nodes.length
  graphStats.value.masterLinks = masterGraph.links.length
  graphStats.value.flashcards = (props.flashcards || []).length
  graphStats.value.highlightHits = (props.highlightIds || []).length
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
  graphStats.value.visibleNodes = visibleNodes.length
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

  // 高亮集合：来自 Neo4j 图谱查询的业务闪卡 ID 或图谱节点 ID
  const highlightIdSet = new Set(
    (props.highlightIds || [])
      .map(id => (id != null ? String(id) : ''))
      .filter(s => s !== '')
  )

  // 命中的节点（包括分类节点 / 根节点 / 闪卡节点），以及它们的邻居节点（包括所属层级）
  const hitNodeIds = new Set()
  if (highlightIdSet.size > 0) {
    nodes.forEach(n => {
      const businessId = n.businessId != null ? String(n.businessId) : null
      const rawId = n.id != null ? String(n.id) : null
      if ((businessId && highlightIdSet.has(businessId)) || (rawId && highlightIdSet.has(rawId))) {
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

  nodeDepthById = computeBfsDepthsFromRoots(visibleNodes, visibleLinks)
  const { posById, rootId, ringRadiusByDepth } = computeCoreRadialRingLayout(visibleNodes, visibleLinks, width, height, nodeDepthById)

  const defs = svg.append('defs')
  defs
    .append('marker')
    .attr('id', 'fc-graph-arrow')
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 9)
    .attr('refY', 5)
    .attr('markerWidth', 7)
    .attr('markerHeight', 7)
    .attr('orient', 'auto')
    .attr('markerUnits', 'userSpaceOnUse')
    .append('path')
    .attr('d', 'M0,0 L10,5 L0,10 Z')
    .attr('fill', NEO4J.linkStroke)

  gRoot = svg.append('g')
  zoomBehavior = d3.zoom().scaleExtent([0.1, 10]).on('zoom', (ev) => gRoot.attr('transform', ev.transform))
  svg.call(zoomBehavior)

  // 背景 rect：捕获空白处单击以清除高亮（在 zoom 层内，确保任何模式下都生效）
  const bgRect = gRoot.insert('rect', ':first-child')
    .attr('class', 'graph-bg-hit')
    .attr('x', -5000)
    .attr('y', -5000)
    .attr('width', 10000)
    .attr('height', 10000)
    .attr('fill', 'transparent')
    .style('cursor', 'default')
  bgRect.on('click', (ev) => {
    ev.stopPropagation()
    emit('clearHighlight')
  })

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
        .distance(185)
        .strength(0.62)
    )
    .force('charge', d3.forceManyBody().strength(-520))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force(
      'radial',
      d3.forceRadial(d => getRadialDistance(d), width / 2, height / 2).strength(0.32)
    )
    .force('collision', d3.forceCollide().radius(d => getNodeRadius(d) + 16))
  
  const linkLayer = gRoot.append('g').attr('class', 'links').attr('stroke', NEO4J.linkStroke).attr('stroke-opacity', 0.75)
  const nodeLayer = gRoot.append('g').attr('class', 'nodes')
  const textLayer = gRoot.append('g').attr('class', 'texts')

  const computeLinkOpacity = (d) => {
    if (!hasHighlight) return 0.8
    const sid = typeof d.source === 'object' ? d.source.id : d.source
    const tid = typeof d.target === 'object' ? d.target.id : d.target
    return (neighborNodeIds.has(sid) && neighborNodeIds.has(tid)) ? 0.9 : 0.1
  }

  /** 径向连线：用平滑曲线，整体“沿半径外扩” */
  const linkPathD = (d) => {
    const s = d.source
    const t = d.target
    const sx = s.x
    const sy = s.y
    const tx = t.x
    const ty = t.y
    if (!Number.isFinite(sx) || !Number.isFinite(tx)) return `M${sx},${sy} L${tx},${ty}`
    const rS = getNodeRadius(s)
    const rT = getNodeRadius(t)
    const dx = tx - sx
    const dy = ty - sy
    const len = Math.hypot(dx, dy)
    if (len < 1e-6) return `M${sx},${sy} L${tx},${ty}`
    const ux = dx / len
    const uy = dy / len
    const arrowGap = 6
    const x1 = sx + ux * rS
    const y1 = sy + uy * rS
    const x2 = tx - ux * (rT + arrowGap)
    const y2 = ty - uy * (rT + arrowGap)
    // 直线：严格径向延伸（不要弯曲）
    return `M${x1},${y1} L${x2},${y2}`
  }

  linkSel = linkLayer
    .selectAll('path')
    .data(visibleLinks, d => {
      const sid = typeof d.source === 'object' ? d.source.id : d.source
      const tid = typeof d.target === 'object' ? d.target.id : d.target
      return `${sid}\0${tid}`
    })
    .join('path')
    .attr('fill', 'none')
    .attr('stroke-width', 2)
    .attr('marker-end', 'url(#fc-graph-arrow)')
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
    // 允许拖拽：保持径向结构的同时给用户“弹性”调整
    .call(
      d3.drag()
        .on('start', (ev) => {
          if (isRootNode(ev.subject)) return
          if (!simulation) return
          // 给予更强的“弹性启动”
          if (!ev.active) simulation.alphaTarget(0.38).restart()
          ev.subject.fx = ev.subject.x
          ev.subject.fy = ev.subject.y
          if (linkSel) linkSel.style('opacity', 0)
        })
        .on('drag', (ev) => {
          if (isRootNode(ev.subject)) return
          ev.subject.fx = ev.x
          ev.subject.fy = ev.y
        })
        .on('end', (ev) => {
          if (isRootNode(ev.subject)) return
          // 松手后给一次回弹能量，再逐步收敛
          if (simulation && !ev.active) simulation.alpha(0.55).alphaTarget(0.06).restart()
          // 松手后释放固定点，让布局力场产生轻微“回弹”
          ev.subject.fx = null
          ev.subject.fy = null
          if (linkSel) linkSel.style('opacity', computeLinkOpacity)
          // 过一会儿再降回静止，避免“刚松手就立刻僵住”
          setTimeout(() => {
            if (simulation) simulation.alphaTarget(0)
          }, 1200)
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
    .attr('stroke-width', 4)

  // 内圈实心圆
  nodeSel
    .append('circle')
    .attr('class', 'node-inner')
    .attr('r', d => Math.max(getNodeRadius(d) - 5, 8))
    .attr('fill', d => getNodeFill(d))
    .attr('stroke', '#f8fafc')
    .attr('stroke-width', 1.5)

  // 通过测试的闪卡：右上角绿色小勾（仅闪卡节点）
  const passedSel = nodeSel
    .filter(d => isFlashcardNode(d) && getNodePassed(d))
    .append('g')
    .attr('class', 'node-pass-badge')
    .attr('transform', d => {
      const r = getNodeRadius(d)
      const x = r - 2
      const y = -r + 2
      return `translate(${x},${y})`
    })

  passedSel
    .append('circle')
    .attr('r', 10)
    .attr('fill', '#22c55e')
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 2)
    .style('filter', 'drop-shadow(0 6px 12px rgba(34, 197, 94, 0.28))')

  passedSel
    .append('path')
    .attr('d', 'M-4 0 L-1 3 L5 -4')
    .attr('fill', 'none')
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 2.4)
    .attr('stroke-linecap', 'round')
    .attr('stroke-linejoin', 'round')
  
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
  
  // 应用确定性布局坐标（锚定中心、分层圆环）
  const applyLayout = () => {
    visibleNodes.forEach(n => {
      const p = posById.get(n.id)
      if (!p) return
      n.x = p.x
      n.y = p.y
    })
    // 根节点强制中心（再次兜底）
    if (rootId) {
      const rNode = visibleNodes.find(n => n.id === rootId)
      if (rNode) {
        rNode.x = width / 2
        rNode.y = height / 2
        rNode.fx = width / 2
        rNode.fy = height / 2
      }
    }
  }
  applyLayout()

  // 点击节点显示 content 小卡片（测试点用 isTestPointNode 判断，兼容后端未带 type 的节点）
  nodeSel.on('click', (ev, d) => {
    ev.stopPropagation()
    if (isTestPointNode(d)) {
      const bid = d?.businessId != null ? String(d.businessId) : (d?.properties?.nodeId != null ? String(d.properties.nodeId) : '')
      if (bid) {
        openTestPointDrawer(bid)
      }
      return
    }
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

      // 同步更新连线几何（动画期间）
      const tickLinks = () => {
        linkSel.attr('d', l => linkPathD(l))
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
        if (!nodeSel) return
        // 新子节点从父节点位置“辐射”到其同心圆目标位置
        const newNodes = visibleNodes.filter(n => childIds.includes(n.id))
        const newNodeSel = nodeLayer.selectAll('g.graph-node').filter(n => childIds.includes(n.id))
        if (newNodeSel.size() > 0 && newNodes.length > 0) {
          newNodeSel
            .style('opacity', 0)
            .transition()
            .duration(ANIM_DURATION)
            .ease(ANIM_EASING)
            .attrTween('transform', function (n) {
              const startX = parentX
              const startY = parentY
              const endPos = posById.get(n.id)
              const endX = endPos?.x ?? parentX
              const endY = endPos?.y ?? parentY
              return (t) => {
                n.x = startX + (endX - startX) * t
                n.y = startY + (endY - startY) * t
                return `translate(${n.x},${n.y})`
              }
            })
            .style('opacity', d => (isDimmedNode(d) ? 0.18 : 1))
            .on('end', function () {
              const nodesForFit = visibleNodes
              if (nodesForFit && nodesForFit.length > 0) {
                setTimeout(() => {
                  smoothZoomFit(nodesForFit)
                }, 100)
              }
              setTimeout(() => {
                showElementText()
              }, 150)
            })
        } else {
          const nodesForFit = visibleNodes
          if (nodesForFit && nodesForFit.length > 0) {
            setTimeout(() => {
              smoothZoomFit(nodesForFit)
            }, 100)
          }
          setTimeout(() => {
            showElementText()
          }, 150)
        }
      })
    })
  })

  // hover 高亮：外圈加粗 + 光晕圈显现（靛蓝主色）
  nodeSel
    .on('mouseover', function (ev, d) {
      const gSel = d3.select(this)
      gSel
        .select('.node-outer')
        .attr('stroke', '#7c3aed')
        .attr('stroke-width', isRootNode(d) ? 7 : 5)
      gSel
        .select('.node-halo')
        .transition()
        .duration(150)
        .attr('r', getNodeRadius(d) + 14)
        .style('opacity', 1)
      gSel.style('filter', 'drop-shadow(0 0 18px rgba(99, 102, 241, 0.5))')
    })
    .on('mouseout', function (ev, d) {
      const gSel = d3.select(this)
      gSel
        .select('.node-outer')
        .attr('stroke', getNodeFill(d))
        .attr('stroke-width', 4)
      gSel
        .select('.node-halo')
        .transition()
        .duration(150)
        .attr('r', getNodeRadius(d) + 8)
        .style('opacity', 0)
      gSel.style('filter', 'none')
    })
  
  // 轻量力场：保留径向分层，但允许用户拖拽并产生弹性回弹
  if (simulation) simulation.stop()
  const radialRadius = (n) => {
    const dep = nodeDepthById.get(n.id) ?? 0
    return ringRadiusByDepth?.get(dep) ?? getRadialDistance(n)
  }
  simulation = d3.forceSimulation(visibleNodes)
    .alpha(0.9)
    // 更慢的衰减 + 更小的阻尼 => 更“弹”
    .alphaDecay(0.035)
    .velocityDecay(0.28)
    .force(
      'link',
      d3.forceLink(visibleLinks)
        .id(d => d.id)
        .distance(175)
        .strength(0.32)
    )
    .force('charge', d3.forceManyBody().strength(-260))
    .force('collision', d3.forceCollide().radius(d => getNodeRadius(d) + 14).strength(0.75))
    // 径向约束改弱一点：保结构但允许更自由的弹性位移
    .force('radial', d3.forceRadial(d => radialRadius(d), cx, cy).strength(0.09))
    .force('center', d3.forceCenter(cx, cy).strength(0.012))

  // 根节点固定在中心
  const rootNode = rootId ? visibleNodes.find(n => n.id === rootId) : null
  if (rootNode) {
    rootNode.fx = cx
    rootNode.fy = cy
  }

  const renderOnce = () => {
    linkSel.attr('d', d => linkPathD(d))
    nodeSel.attr('transform', d => `translate(${d.x},${d.y})`)
    textSel
      .attr('x', d => d.x)
      .attr('y', d => {
        if (isRootNode(d)) return d.y + 4
        return d.y + getNodeRadius(d) + 14
      })
  }

  simulation.on('tick', () => {
    if (rootNode) {
      rootNode.x = cx
      rootNode.y = cy
    }
    renderOnce()
    // 不要太早 stop：保留一点“呼吸感”
    if (simulation.alpha() < 0.008) simulation.stop()
  })

  // 初次渲染 + 适配视口
  renderOnce()
  setTimeout(() => {
    const fitNodes = visibleNodes || []
    if (fitNodes.length > 0) smoothZoomFit(fitNodes, 650)
  }, 0)
}

// 结构变化时完整重绘
watch(
  () => [
    props.graphNodes?.length,
    props.graphLinks?.length,
    filteredFlashcards.value.length
  ],
  () => {
    if (simulation) simulation.stop()
    nextTick(renderGraph)
  },
  { deep: false }
)

// 仅高亮变化时轻量更新（不重建图谱，避免清除高亮时大幅度震动）
watch(
  () => (props.highlightIds || []).join(','),
  () => {
    if (!gRoot || !svgRef.value) return
    const highlightIdSet = new Set(
      (props.highlightIds || [])
        .map(id => (id != null ? String(id) : ''))
        .filter(s => s !== '')
    )
    const hitNodeIds = new Set()
    const nodes = masterGraph.nodes || []
    if (highlightIdSet.size > 0) {
      nodes.forEach(n => {
        const businessId = n.businessId != null ? String(n.businessId) : null
        const rawId = n.id != null ? String(n.id) : null
        if ((businessId && highlightIdSet.has(businessId)) || (rawId && highlightIdSet.has(rawId))) {
          hitNodeIds.add(n.id)
        }
      })
    }
    const uniqueLinks = masterGraph.links || []
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
    const isDimmed = (d) => hasHighlight && !neighborNodeIds.has(d.id)
    const linkOpacity = (d) => {
      if (!hasHighlight) return 0.8
      const sid = typeof d.source === 'object' ? d.source.id : d.source
      const tid = typeof d.target === 'object' ? d.target.id : d.target
      return neighborNodeIds.has(sid) && neighborNodeIds.has(tid) ? 0.9 : 0.1
    }
    const ng = gRoot.select('.nodes')
    const lg = gRoot.select('.links')
    const tg = gRoot.select('.texts')
    if (!ng.empty()) ng.selectAll('.graph-node').transition().duration(120).ease(d3.easeQuadOut).style('opacity', d => (isDimmed(d) ? 0.18 : 1))
    if (!lg.empty()) lg.selectAll('path').transition().duration(120).ease(d3.easeQuadOut).style('opacity', linkOpacity)
    if (!tg.empty()) tg.selectAll('text').transition().duration(120).ease(d3.easeQuadOut).style('opacity', d => (hasHighlight && isDimmed(d) ? 0.35 : 1))
  },
  { deep: false }
)

onMounted(() => {
  updateDimensions()
  if (graphContainer.value) {
    let resizeRaf = null
    const onResize = () => {
      updateDimensions()
      if (resizeRaf) cancelAnimationFrame(resizeRaf)
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null
        // 拖拽分隔线会频繁触发 resize：只更新画布尺寸，不清空重绘，避免“消失又出现/震动”
        try {
          if (svgRef.value && dimensions.value.width && dimensions.value.height) {
            const svg = d3.select(svgRef.value)
            svg
              .attr('width', dimensions.value.width)
              .attr('height', dimensions.value.height)
              // viewBox 不变：产生整体缩放压缩效果
              .attr('viewBox', `0 0 ${baseViewBox.w || dimensions.value.width} ${baseViewBox.h || dimensions.value.height}`)
              .attr('preserveAspectRatio', 'xMidYMid meet')
          }
        } catch (_) {}
      })
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(graphContainer.value)
    onUnmounted(() => {
      ro.disconnect()
      if (resizeRaf) cancelAnimationFrame(resizeRaf)
    })
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
  const ok = await confirmAction('确定要删除这个闪卡吗？')
  if (!ok) return
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

const handleGenerateTest = () => {
  const id = nodeCardData.value?.id
  if (!id) return
  pendingGenerateNodeId.value = String(id)
  difficulty.value = 'medium'
  showDifficulty.value = true
}

const confirmGenerateTest = async () => {
  const nodeId = pendingGenerateNodeId.value
  if (!nodeId) return
  try {
    generatingTest.value = true
    saveFlashcardTestContext(nodeId, {
      flashcardId: String(nodeId),
      title: nodeCardData.value?.title || '',
      hierarchyPath: nodeCardData.value?.hierarchyPath || '',
      content: nodeCardData.value?.content || '',
      htmlContent: nodeCardData.value?.htmlContent || ''
    })
    const res = await flashCardTestApi.generate({ nodeId, pathId: 0, difficulty: difficulty.value })
    const paper = flashCardTestApi.normalizeTestVO(res)
    const testId = paper?.testId
    if (testId != null) {
      saveTestPaper(testId, paper)
      setLatestTestId(nodeId, testId)
    }
    markHasTestPoint(nodeId, true)
    showDifficulty.value = false
    await router.push({ name: 'FlashcardTest', params: { flashcardId: String(nodeId) }, query: { testId: String(testId || '') } })
    nextTick(() => renderGraph())
  } catch (e) {
    console.error(e)
    ElMessage && ElMessage.error(e?.message || e?.response?.data?.message || '生成失败，请稍后重试')
  } finally {
    generatingTest.value = false
  }
}

// 测试点抽屉（历史试卷列表）
const showTestPoint = ref(false)
const testPointNodeId = ref('')
const drawerRefreshTrigger = ref(0)
const openTestPointDrawer = (nodeId) => {
  testPointNodeId.value = String(nodeId)
  showTestPoint.value = true
}

const handleDeletePaper = async (paper) => {
  const tid = paper?.testId
  if (tid == null) return
  const ok = await confirmAction('确定删除该试卷？删除后不可恢复。')
  if (!ok) return
  try {
    await flashCardTestApi.delete(tid)
    drawerRefreshTrigger.value++
    emit('refresh')
    ElMessage && ElMessage.success('已删除')
  } catch (e) {
    ElMessage && ElMessage.error(e?.message || e?.response?.data?.message || '删除失败')
  }
}

const handleRedoPaper = async (paper) => {
  try {
    const tid = paper?.testId
    if (tid == null) return
    const res = await flashCardTestApi.loadPaper(tid)
    const p = flashCardTestApi.normalizeTestVO(res)
    saveTestPaper(tid, p)
    await router.push({
      name: 'FlashcardTest',
      params: { flashcardId: String(testPointNodeId.value) },
      query: { testId: String(tid), mode: 'redo' }
    })
  } catch (e) {
    ElMessage && ElMessage.error(e?.message || e?.response?.data?.message || '加载试卷失败，请稍后重试')
  }
}

const handleOpenAttempts = (paper) => {
  const tid = paper?.testId
  if (tid == null) return
  router.push({ name: 'FlashcardTestAttempts', params: { testId: String(tid) } })
}

</script>

<style scoped>
.flashcard-graph-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 0;
  background: linear-gradient(165deg, #faf8ff 0%, #f5f3ff 45%, #eef2ff 100%);
  position: relative;
  overflow: hidden;
}

.graph-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: linear-gradient(165deg, #faf8ff 0%, #f5f3ff 50%, #eef2ff 100%);
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
  color: #64748b;
  pointer-events: none;
}

.empty-icon {
  font-size: 56px;
  margin-bottom: 20px;
  opacity: 0.5;
  line-height: 1;
}

.empty-text {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 8px;
  color: #475569;
  letter-spacing: 0.02em;
}

.empty-hint {
  font-size: 13px;
  margin: 0;
  color: #94a3b8;
  font-weight: 500;
}

/* 图例：白底卡片 */
.graph-legend {
  position: absolute;
  bottom: 32px;
  right: 32px;
  background: #ffffff;
  padding: 20px 22px;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
  z-index: 20;
  pointer-events: none;
  max-width: 200px;
}

.legend-title {
  font-size: 11px;
  font-weight: 900;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin: 0 0 14px;
  position: relative;
  padding-bottom: 8px;
}

.legend-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 24px;
  height: 2px;
  border-radius: 999px;
  background: #c4b5fd;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  letter-spacing: 0.02em;
}

.legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-right: 10px;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  border: 2px solid #ffffff;
  box-sizing: border-box;
}

.legend-dot.category {
  background: #7c3aed;
}

.legend-dot.flashcard {
  background: #eab308;
}

.legend-dot.testpoint {
  background: #22c55e;
}

.legend-hints {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #e2e8f0;
}

.legend-hints p {
  font-size: 10px;
  color: #64748b;
  line-height: 1.5;
  margin: 3px 0;
  font-weight: 600;
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
  width: 400px;
  max-width: 85vw;
  height: 80%;
  background: linear-gradient(180deg, #ffffff 0%, #faf8ff 100%);
  box-shadow: 8px 0 40px rgba(46, 16, 101, 0.18), 0 0 0 1px rgba(196, 181, 253, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  pointer-events: auto;
  animation: slideInFromLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 0 20px 20px 0;
  border-left: 4px solid rgba(167, 139, 250, 0.8);
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
  padding: 18px 22px;
  border-bottom: 1px solid rgba(196, 181, 253, 0.25);
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.6);
}

.node-card-title {
  font-size: 17px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  letter-spacing: 0.02em;
}

.node-card-close {
  background: rgba(241, 245, 249, 0.8);
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: background 0.2s, color 0.2s, transform 0.2s;
}

.node-card-close:hover {
  background: #eef2ff;
  color: #5b21b6;
  transform: scale(1.05);
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

.node-card-footer {
  display: flex;
  gap: 10px;
  padding: 16px 22px;
  border-top: 1px solid rgba(196, 181, 253, 0.2);
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.7);
}

.node-card-btn {
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #fff;
  color: #475569;
  letter-spacing: 0.02em;
}

.node-card-btn-edit:hover {
  border-color: rgba(129, 140, 248, 0.8);
  color: #4f46e5;
  background: #eef2ff;
  box-shadow: 0 4px 12px rgba(129, 140, 248, 0.2);
}

.node-card-btn-delete:hover {
  border-color: rgba(239, 68, 68, 0.6);
  color: #dc2626;
  background: #fef2f2;
}

.node-card-btn-primary {
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  color: #fff;
  border: none;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
}

.node-card-btn-primary:hover {
  filter: brightness(1.05);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
}

.node-card-btn-generate {
  margin-right: auto;
}

.node-card-btn-secondary {
  background: #fff;
  color: #475569;
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.node-card-btn-secondary:hover {
  background: #f8fafc;
  border-color: rgba(196, 181, 253, 0.4);
}

/* 编辑弹窗：与彩带弹窗统一风格 */
.node-edit-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.node-edit-modal {
  background: linear-gradient(180deg, #ffffff 0%, #faf8ff 100%);
  border-radius: 20px;
  width: 100%;
  max-width: 680px;
  height: 86vh;
  max-height: 94vh;
  overflow-y: auto;
  box-shadow: 0 22px 50px rgba(46, 16, 101, 0.22), 0 0 0 1px rgba(196, 181, 253, 0.15);
  border: 1px solid rgba(199, 210, 254, 0.5);
}

.node-edit-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(196, 181, 253, 0.2);
  background: rgba(255, 255, 255, 0.6);
  border-radius: 20px 20px 0 0;
}

.node-edit-modal-title {
  font-size: 17px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  letter-spacing: 0.02em;
  position: relative;
  padding-bottom: 8px;
}

.node-edit-modal-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 28px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, #818cf8, #a855f7);
}

.node-edit-modal-close {
  background: rgba(241, 245, 249, 0.8);
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: background 0.2s, color 0.2s;
}

.node-edit-modal-close:hover {
  background: #eef2ff;
  color: #5b21b6;
}

.node-edit-form {
  padding: 24px;
}

.node-edit-field {
  margin-bottom: 18px;
}

.node-edit-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 8px;
  letter-spacing: 0.02em;
}

.node-edit-input,
.node-edit-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 10px;
  font-size: 14px;
  background: rgba(248, 250, 252, 0.98);
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.node-edit-input:focus,
.node-edit-textarea:focus {
  outline: none;
  border-color: rgba(129, 140, 248, 0.8);
  background: #fff;
  box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.15);
}

.node-edit-textarea {
  resize: vertical;
  /* 内容区更大一些，跟随弹窗宽度已经是 100%，这里提高默认高度方便编辑长文案 */
  min-height: 340px;
}

.node-edit-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid rgba(196, 181, 253, 0.2);
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

