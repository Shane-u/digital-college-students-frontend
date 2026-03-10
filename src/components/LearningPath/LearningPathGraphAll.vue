<template>
  <div class="lp-all-container">
    <!-- 顶部标题条：学习路径图谱（对比模式下隐藏） -->
    <GraphTopHeader v-if="!isCompareMode" title="学 习 路 径 图 谱" />

    <div ref="graphContainer" class="lp-all-area">
      <div v-if="!hasGraphData" class="lp-all-empty">
        <div class="lp-all-empty-icon">📊</div>
        <p class="lp-all-empty-text">图谱暂无内容</p>
        <p class="lp-all-empty-hint">请先生成并保存学习路径</p>
      </div>
      <svg v-else ref="svgRef" class="lp-all-svg"></svg>
    </div>

    <Transition name="drawer-left">
      <div v-if="showNodeCard" class="lp-node-drawer-wrapper">
        <div class="lp-node-drawer">
          <div class="lp-node-drawer-header">
            <h3 class="lp-node-drawer-title">{{ nodeCardData.name || '节点详情' }}</h3>
            <button class="lp-node-drawer-close" @click="closeNodeCard">×</button>
          </div>
          <div class="lp-node-drawer-body">
            <div class="lp-node-meta">所属路径：{{ titleById[nodeCardData.__pathId] || nodeCardData.__pathId }}</div>
            <div v-if="nodeCardData.testPointsProgress" class="lp-node-meta">进度: {{ nodeCardData.testPointsProgress }}</div>
            <div v-if="nodeCardData.childrenProgress" class="lp-node-meta">子节点: {{ nodeCardData.childrenProgress }}</div>
          </div>
          <div class="lp-node-drawer-actions">
            <button type="button" class="lp-node-btn lp-node-edit" @click="openEdit">编辑</button>
            <button type="button" class="lp-node-btn lp-node-delete" @click="confirmDeleteNode">删除节点</button>
          </div>
        </div>
      </div>
    </Transition>

    <Teleport to="body">
      <div v-if="showEditModal" class="lp-edit-mask" @click.self="showEditModal = false">
        <div class="lp-edit-modal" @click.stop>
          <div class="lp-edit-header">
            <span>编辑节点</span>
            <button type="button" @click="showEditModal = false">×</button>
          </div>
          <div class="lp-edit-body">
            <div class="lp-edit-field">
              <label>节点名称</label>
              <input v-model="editForm.name" type="text" />
            </div>
          </div>
          <div class="lp-edit-footer">
            <button type="button" class="lp-edit-cancel" @click="showEditModal = false">取消</button>
            <button type="button" class="lp-edit-save" :disabled="savingEdit" @click="saveNodeEdit">保存</button>
          </div>
        </div>
      </div>
      <div v-if="deleteNodeConfirm" class="lp-delete-mask" @click.self="deleteNodeConfirm = null">
        <div class="lp-delete-modal" @click.stop>
          <p>确定要删除该节点吗？</p>
          <div class="lp-delete-actions">
            <button type="button" @click="deleteNodeConfirm = null">取消</button>
            <button type="button" class="lp-delete-ok" @click="doDeleteNode">删除</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'
import { ElMessage } from 'element-plus'
import { updateJson, matchFlashcards } from '../../api/learningPath'
import GraphTopHeader from '../common/GraphTopHeader.vue'

const props = defineProps({
  userId: { type: [String, Number], default: null },
  pathIds: { type: Array, default: () => [] },
  graphsById: { type: Object, default: () => ({}) },
  themeById: { type: Object, default: () => ({}) },
  titleById: { type: Object, default: () => ({}) },
  // 对比模式：由父页面在 iframe 中使用时传入，用于隐藏顶部大标题背景
  isCompareMode: { type: Boolean, default: false }
})

const emit = defineEmits(['refreshOne'])

const graphContainer = ref(null)
const svgRef = ref(null)
const dimensions = ref({ width: 0, height: 0 })
const showNodeCard = ref(false)
const nodeCardData = ref({})
const showEditModal = ref(false)
const editForm = ref({ pathId: '', nodeId: '', name: '' })
const savingEdit = ref(false)
const deleteNodeConfirm = ref(null)
let simulation = null
let zoomBehavior = null
let gRoot = null
let baseViewBox = { w: 0, h: 0 }

// 学习路径节点匹配闪卡的默认参数
const MATCH_DEFAULTS = {
  maxDescendants: 200,
  maxTokens: 200,
  topK: 100,
  ratio: 0.35
}

const hasGraphData = computed(() => {
  const ids = props.pathIds || []
  return ids.some(id => (props.graphsById?.[id]?.nodes || []).length > 0)
})

const updateDimensions = () => {
  if (graphContainer.value) {
    dimensions.value = {
      width: graphContainer.value.clientWidth,
      height: graphContainer.value.clientHeight
    }
  }
}

const buildCombined = () => {
  const nodes = []
  const links = []
  const ids = props.pathIds || []

  const makeRootId = (pid) => `${pid}::root`
  const makeNodeId = (pid, nid) => `${pid}::${nid}`

  ids.forEach((pid) => {
    const g = props.graphsById?.[pid]
    const rawNodes = Array.isArray(g?.nodes) ? g.nodes : []
    const rels = Array.isArray(g?.relationships) ? g.relationships : []
    const topic = g?.topic || props.titleById?.[pid] || '学习路径'

    // root
    nodes.push({
      id: makeRootId(pid),
      __pathId: pid,
      __nodeId: null,
      isRoot: true,
      isStart: true,
      name: topic,
      label: topic
    })

    rawNodes.forEach((n) => {
      const nid = n.nodeId || n.id
      if (!nid) return
      nodes.push({
        ...n,
        id: makeNodeId(pid, nid),
        __pathId: pid,
        __nodeId: String(nid),
        isRoot: false
      })
    })

    // relationships -> links
    rels.forEach((r) => {
      const s = r.sourceNodeId
      const t = r.targetNodeId
      if (!t) return
      const sourceId = (s === pid || s === (g?.pathId || pid)) ? makeRootId(pid) : makeNodeId(pid, s)
      const targetId = makeNodeId(pid, t)
      links.push({ source: sourceId, target: targetId, type: r.type || 'PARENT_OF', __pathId: pid })
    })

    // fallback: parentNodeId if relationships missing
    if (rels.length === 0) {
      rawNodes.forEach((n) => {
        const nid = n.nodeId || n.id
        if (!nid) return
        const parent = (n.parentNodeId || '').trim()
        links.push({
          source: parent ? makeNodeId(pid, parent) : makeRootId(pid),
          target: makeNodeId(pid, nid),
          type: parent ? 'PARENT_OF' : 'HAS_NODE',
          __pathId: pid
        })
      })
    }
  })

  // 去重 links
  const seen = new Set()
  const uniqueLinks = links.filter(l => {
    const key = `${l.source}\0${l.target}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return { nodes, links: uniqueLinks }
}

const getTheme = (pid) => props.themeById?.[pid] || {}
const getNodeRadius = (d) => (d.isRoot ? 28 : 18)
const getNodeFill = (d) => {
  const th = getTheme(d.__pathId)
  return d.isRoot ? (th.rootFill || '#A78BFA') : (th.nodeFill || '#7880f0')
}
const getLinkStroke = (pid) => (props.themeById?.[pid]?.linkStroke || '#A5ABB6')

// 将匹配结果发送给父页面（闪卡图谱对比容器）
const notifyParentFlashcardMatch = (payload) => {
  try {
    if (window && window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          source: 'learning-path-graph',
          type: 'lp-flashcard-match',
          ...payload
        },
        '*'
      )
    }
  } catch (e) {
    // 忽略 postMessage 过程中可能的安全错误
    console.warn('notifyParentFlashcardMatch error:', e)
  }
}

// 调用后端接口：根据学习路径节点匹配闪卡图谱
const triggerFlashcardMatch = async (pathId, clickedNodeId) => {
  try {
    const body = {
      clickedNodeId,
      maxDescendants: MATCH_DEFAULTS.maxDescendants,
      maxTokens: MATCH_DEFAULTS.maxTokens,
      topK: MATCH_DEFAULTS.topK,
      ratio: MATCH_DEFAULTS.ratio
    }
    // request 封装已对 code != 0 的情况抛错，这里拿到的就是 data（LearningPathFlashcardMatchVO）
    const data = await matchFlashcards(pathId, body, props.userId)

    const matchedFlashcardIds = Array.isArray(data?.matchedFlashcardIds)
      ? data.matchedFlashcardIds
      : []
    const keywords = Array.isArray(data?.keywords) ? data.keywords : []

    if (!matchedFlashcardIds.length) {
      notifyParentFlashcardMatch({
        success: true,
        empty: true,
        pathId,
        clickedNodeId,
        keywords
      })
      return
    }

    notifyParentFlashcardMatch({
      success: true,
      empty: false,
      pathId,
      clickedNodeId,
      keywords,
      matchedFlashcardIds
    })
  } catch (e) {
    console.error('triggerFlashcardMatch error:', e)
    notifyParentFlashcardMatch({
      success: false,
      error: e?.message || '学习路径节点匹配闪卡失败'
    })
  }
}

const renderGraph = () => {
  updateDimensions()
  if (!svgRef.value || dimensions.value.width === 0 || dimensions.value.height === 0) return
  const { width, height } = dimensions.value
  const { nodes, links } = buildCombined()
  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()
  // 固定内部坐标系（viewBox），拖拽分栏时只变更外部尺寸，让图谱产生“被压缩/拉伸”的效果
  baseViewBox = { w: width, h: height }
  svg
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${baseViewBox.w} ${baseViewBox.h}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
  if (nodes.length === 0) return

  const cx = width / 2
  const cy = height / 2
  nodes.forEach(n => {
    if (n.x == null) n.x = cx + (Math.random() - 0.5) * 160
    if (n.y == null) n.y = cy + (Math.random() - 0.5) * 160
  })

  gRoot = svg.append('g')
  zoomBehavior = d3.zoom().scaleExtent([0.15, 6]).on('zoom', (ev) => gRoot.attr('transform', ev.transform))
  svg.call(zoomBehavior)

  // 自动缩放到视口（尽量让所有图谱在一屏内可见）
  const smoothZoomFit = (nodesToFit, duration = 520) => {
    if (!nodesToFit || nodesToFit.length === 0) return
    const pad = 120
    const xs = nodesToFit.map(n => n.x).filter(Number.isFinite)
    const ys = nodesToFit.map(n => n.y).filter(Number.isFinite)
    if (xs.length === 0 || ys.length === 0) return
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const bw = Math.max(maxX - minX, 1)
    const bh = Math.max(maxY - minY, 1)
    const scale = Math.min(width / (bw + pad), height / (bh + pad), 1.8)
    const midX = (minX + maxX) / 2
    const midY = (minY + maxY) / 2
    const target = d3.zoomIdentity.translate(width / 2, height / 2).scale(scale).translate(-midX, -midY)
    svg.transition().duration(duration).ease(d3.easeQuadOut).call(zoomBehavior.transform, target)
  }

  // 为每个 pathId 添加轻微径向聚类，避免各图谱被弹得过远
  const pidSet = Array.from(new Set(nodes.map(n => n.__pathId).filter(Boolean)))
  const pidIndex = new Map(pidSet.map((pid, i) => [pid, i]))
  const radialDistance = (d) => {
    const idx = pidIndex.get(d.__pathId) ?? 0
    const base = 120
    const step = 40
    return base + idx * step
  }

  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(95).strength(0.7))
    .force('charge', d3.forceManyBody().strength(-220))
    .force('center', d3.forceCenter(cx, cy))
    .force('radial', d3.forceRadial(d => radialDistance(d), cx, cy).strength(0.08))
    .force('collision', d3.forceCollide().radius(d => getNodeRadius(d) + 5))

  const linkLayer = gRoot.append('g').attr('class', 'lp-links')
  const nodeLayer = gRoot.append('g').attr('class', 'lp-nodes')
  const textLayer = gRoot.append('g').attr('class', 'lp-texts')

  const linkSel = linkLayer.selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', d => getLinkStroke(d.__pathId))
    .attr('stroke-width', 2)
    .attr('stroke-opacity', 0.65)

  const nodeSel = nodeLayer.selectAll('g.lp-node')
    .data(nodes, d => d.id)
    .join('g')
    .attr('class', 'lp-node')
    .style('cursor', 'pointer')
    .call(d3.drag()
      .on('start', (ev) => { if (!ev.active) simulation.alphaTarget(0.3).restart(); ev.subject.fx = ev.subject.x; ev.subject.fy = ev.subject.y })
      .on('drag', (ev) => { ev.subject.fx = ev.x; ev.subject.fy = ev.y })
      .on('end', (ev) => { if (!ev.active) simulation.alphaTarget(0); ev.subject.fx = null; ev.subject.fy = null })
    )

  nodeSel.append('circle')
    .attr('r', getNodeRadius)
    .attr('fill', getNodeFill)
    .attr('stroke', '#fff')
    .attr('stroke-width', d => (d.isRoot ? 3 : 2))

  const getLabel = (d) => d.name || d.label || ''
  textLayer.selectAll('text')
    .data(nodes, d => d.id)
    .join('text')
    .text(getLabel)
    .attr('font-size', d => (d.isRoot ? 12 : 10))
    .attr('font-weight', d => (d.isRoot ? 900 : 700))
    .attr('text-anchor', 'middle')
    .attr('dy', 4)
    .style('fill', d => (d.isRoot ? '#ffffff' : '#0f172a'))
    .style('paint-order', 'stroke')
    .style('stroke', d => (d.isRoot ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.8)'))
    .style('stroke-width', d => (d.isRoot ? 2 : 3))
    .style('pointer-events', 'none')

  // 单击与双击防抖：双击时不触发单击，使用延迟区分
  const clickPending = { timer: null }
  const DBLCLICK_DELAY_MS = 250
  nodeSel.on('click', (ev, d) => {
    ev.stopPropagation()
    if (d.isRoot) return
    if (clickPending.timer) {
      clearTimeout(clickPending.timer)
      clickPending.timer = null
      return // 说明即将是双击，本次 click 忽略
    }
    clickPending.timer = setTimeout(() => {
      clickPending.timer = null
      nodeCardData.value = { ...d }
      showNodeCard.value = true
    }, DBLCLICK_DELAY_MS)
  })
  nodeSel.on('dblclick', (ev, d) => {
    ev.preventDefault()
    ev.stopPropagation()
    if (clickPending.timer) {
      clearTimeout(clickPending.timer)
      clickPending.timer = null
    }
    if (!props.isCompareMode) return
    if (!d.__pathId || !d.__nodeId) return
    triggerFlashcardMatch(String(d.__pathId), String(d.__nodeId))
  })

  let fitted = false
  simulation.on('tick', () => {
    linkSel
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
    nodeSel.attr('transform', d => `translate(${d.x},${d.y})`)
    textLayer.selectAll('text').attr('x', d => d.x).attr('y', d => d.y)

    // 在布局初步稳定后做一次 fit（只做一次）
    if (!fitted && simulation.alpha() < 0.28) {
      fitted = true
      smoothZoomFit(nodes, 520)
    }
  })

  // 兜底：若 alpha 一直不低（小图），延迟一次 fit
  setTimeout(() => {
    if (!fitted) smoothZoomFit(nodes, 520)
  }, 800)
}

const closeNodeCard = () => { showNodeCard.value = false }
const openEdit = () => {
  editForm.value = { pathId: nodeCardData.value.__pathId, nodeId: nodeCardData.value.__nodeId, name: nodeCardData.value.name || '' }
  showEditModal.value = true
}

const saveNodeEdit = async () => {
  const name = (editForm.value.name || '').trim()
  if (!name) return ElMessage.warning('请输入节点名称')
  const pid = editForm.value.pathId
  const nodeId = editForm.value.nodeId
  const nodes = [...(props.graphsById?.[pid]?.nodes || [])]
  const idx = nodes.findIndex(n => String(n.nodeId || n.id) === String(nodeId))
  if (idx === -1) return ElMessage.warning('未找到节点')
  savingEdit.value = true
  try {
    nodes[idx] = { ...nodes[idx], name, label: name }
    await updateJson(pid, { nodes }, props.userId)
    ElMessage.success('已保存')
    showEditModal.value = false
    closeNodeCard()
    emit('refreshOne', pid)
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    savingEdit.value = false
  }
}

const confirmDeleteNode = () => { deleteNodeConfirm.value = nodeCardData.value }
const doDeleteNode = async () => {
  const node = deleteNodeConfirm.value
  deleteNodeConfirm.value = null
  if (!node?.__pathId || !node?.__nodeId) return
  const pid = node.__pathId
  const nodes = (props.graphsById?.[pid]?.nodes || []).filter(n => String(n.nodeId || n.id) !== String(node.__nodeId))
  try {
    await updateJson(pid, { nodes }, props.userId)
    ElMessage.success('已删除节点')
    closeNodeCard()
    emit('refreshOne', pid)
  } catch (e) {
    ElMessage.error(e?.message || '删除失败')
  }
}

watch(
  () => [props.pathIds, props.graphsById],
  () => { renderGraph() },
  { deep: true }
)

let resizeObserver = null
onMounted(() => {
  renderGraph()
  window.addEventListener('resize', updateDimensions)
  if (graphContainer.value) {
    let resizeRaf = null
    const onResize = () => {
      updateDimensions()
      // 拖拽分隔线时频繁触发 resize：只更新画布尺寸，避免清空重绘造成闪烁/抖动
      if (resizeRaf) cancelAnimationFrame(resizeRaf)
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null
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
    resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(graphContainer.value)
  }
})

onUnmounted(() => {
  if (simulation) simulation.stop()
  window.removeEventListener('resize', updateDimensions)
  if (resizeObserver && graphContainer.value) {
    resizeObserver.disconnect()
  }
})
</script>

<style scoped>
.lp-all-container {
  width: 100%;
  height: 100%;
  min-height: 0;
  /* 顶部预留空间：避免节点被标题背景遮住 */
  /* padding-top: 140px; */
  background: #f8fafc;
  position: relative;
  overflow: hidden;
}

.lp-all-area {
  width: 100%;
  height: 100%;
  background: #ffffff;
}

.lp-all-svg {
  width: 100%;
  height: 100%;
}

.lp-all-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
}

.lp-all-empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.lp-all-empty-text {
  margin: 0 0 6px 0;
  font-size: 16px;
}
.lp-all-empty-hint {
  margin: 0;
  font-size: 13px;
}

/* 复用抽屉与弹窗样式：保持与单图谱一致 */
.drawer-left-enter-active,
.drawer-left-leave-active { transition: transform 0.25s ease; }
.drawer-left-enter-from,
.drawer-left-leave-to { transform: translateX(100%); }
.lp-node-drawer-wrapper { position: fixed; top: 0; right: 0; bottom: 0; width: 320px; z-index: 1500; box-shadow: -4px 0 20px rgba(0,0,0,0.1); }
.lp-node-drawer { height: 100%; background: #fff; display: flex; flex-direction: column; }
.lp-node-drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 20px; border-bottom: 1px solid #eee; }
.lp-node-drawer-title { margin: 0; font-size: 16px; font-weight: 600; color: #1f1f1f; }
.lp-node-drawer-close { width: 32px; height: 32px; border: none; background: transparent; font-size: 20px; color: #6b7280; cursor: pointer; }
.lp-node-drawer-body { flex: 1; padding: 20px; overflow-y: auto; }
.lp-node-meta { margin-bottom: 8px; font-size: 14px; color: #6b7280; }
.lp-node-drawer-actions { display: flex; flex-direction: column; gap: 10px; padding: 20px; border-top: 1px solid #eee; }
.lp-node-btn { padding: 10px 18px; border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; }
.lp-node-edit { background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%); color: #fff; }
.lp-node-delete { background: #fef2f2; color: #dc2626; }
.lp-edit-mask,
.lp-delete-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 2100; }
.lp-edit-modal,
.lp-delete-modal { background: #fff; border-radius: 14px; padding: 24px; max-width: 400px; width: 90%; }
.lp-edit-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
.lp-edit-body { margin-bottom: 20px; }
.lp-edit-field { margin-bottom: 12px; }
.lp-edit-field label { display: block; margin-bottom: 6px; font-size: 14px; color: #374151; }
.lp-edit-field input { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
.lp-edit-footer { display: flex; justify-content: flex-end; gap: 12px; }
.lp-edit-cancel { padding: 8px 16px; border-radius: 8px; border: none; background: #f3f4f6; color: #374151; cursor: pointer; }
.lp-edit-save { padding: 8px 16px; border-radius: 8px; border: none; background: #9333ea; color: #fff; cursor: pointer; }
.lp-edit-save:disabled { opacity: 0.6; cursor: not-allowed; }
.lp-delete-ok { padding: 8px 16px; border-radius: 8px; border: none; background: #dc2626; color: #fff; cursor: pointer; }
</style>

