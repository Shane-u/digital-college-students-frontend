<template>
  <div class="lp-graph-container">
    <header class="lp-graph-header">
      <div class="lp-graph-header__inner">
        <button v-if="!embedded" type="button" class="lp-graph-back" @click="$emit('back')">← 返回</button>
        <div class="lp-graph-header__title">{{ title || graphData.topic || '学习路径图谱' }}</div>
      </div>
    </header>
    <div ref="graphContainer" class="lp-graph-area">
      <div v-if="!hasGraphData" class="lp-empty-graph">
        <div class="lp-empty-icon">📊</div>
        <p class="lp-empty-text">图谱暂无内容</p>
        <p class="lp-empty-hint">该路径暂无节点数据</p>
      </div>
      <svg v-else ref="svgRef" class="lp-graph-svg"></svg>
    </div>
    <Transition name="drawer-left">
      <div v-if="showNodeCard" class="lp-node-drawer-wrapper">
        <div class="lp-node-drawer">
          <div class="lp-node-drawer-header">
            <h3 class="lp-node-drawer-title">{{ nodeCardData.name || '节点详情' }}</h3>
            <button class="lp-node-drawer-close" @click="closeNodeCard">×</button>
          </div>
          <div class="lp-node-drawer-body">
            <LearningPathNodeKnowledgePanel
              :topic="nodeCardTopic"
              :user-id="userId"
            />
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
import { updateJson } from '../../api/learningPath'
import LearningPathNodeKnowledgePanel from './LearningPathNodeKnowledgePanel.vue'

const props = defineProps({
  pathId: { type: String, required: true },
  userId: { type: [String, Number], default: null },
  title: { type: String, default: '' },
  embedded: { type: Boolean, default: false },
  theme: {
    type: Object,
    default: () => ({})
  },
  graphData: {
    type: Object,
    default: () => ({ pathId: '', topic: '', nodes: [], relationships: [] })
  }
})

const emit = defineEmits(['back', 'refresh'])

const graphContainer = ref(null)
const svgRef = ref(null)
const dimensions = ref({ width: 0, height: 0 })
const showNodeCard = ref(false)
const nodeCardData = ref({})
const showEditModal = ref(false)
const editForm = ref({ nodeId: '', name: '' })
const savingEdit = ref(false)
const deleteNodeConfirm = ref(null)
let simulation = null
let zoomBehavior = null
let gRoot = null

const hasGraphData = computed(() => {
  const nodes = props.graphData?.nodes || []
  return nodes.length > 0
})

const NODE_STYLE = computed(() => ({
  rootFill: props.theme?.rootFill,
  linkStroke: props.theme?.linkStroke || '#A5ABB6',
  bg: props.theme?.bg || '#faf8ff'
}))

/** 按层级配色：与头部紫系协调，饱和度适中、色相拉开 */
const DEFAULT_LEVEL_FILLS = [
  '#7c3aed',
  '#3b82f6',
  '#0d9488',
  '#ea580c',
  '#db2777',
  '#6366f1',
  '#059669'
]

const levelFills = computed(() => {
  const custom = props.theme?.levelFills
  if (Array.isArray(custom) && custom.length > 0) return custom
  return DEFAULT_LEVEL_FILLS
})

const nodeBg = computed(() => NODE_STYLE.value.bg)

const nodeCardTopic = computed(() => {
  const n = nodeCardData.value || {}
  return n.name || n.label || ''
})

const updateDimensions = () => {
  if (graphContainer.value) {
    dimensions.value = {
      width: graphContainer.value.clientWidth,
      height: graphContainer.value.clientHeight
    }
  }
}

/** 关系可能是子→父，按离根 BFS 深度统一为父→子（与 LearningPathGraphAll 一致） */
const orientLinksParentToChild = (rootId, linkList, nodeIdSet) => {
  const adj = new Map()
  const touch = (a, b) => {
    if (!nodeIdSet.has(a) || !nodeIdSet.has(b)) return
    if (!adj.has(a)) adj.set(a, [])
    if (!adj.has(b)) adj.set(b, [])
    adj.get(a).push(b)
    adj.get(b).push(a)
  }
  linkList.forEach((l) => touch(l.source, l.target))
  const depth = new Map()
  if (nodeIdSet.has(rootId)) {
    depth.set(rootId, 0)
    const q = [rootId]
    while (q.length) {
      const u = q.shift()
      const du = depth.get(u)
      for (const v of adj.get(u) || []) {
        if (!depth.has(v)) {
          depth.set(v, du + 1)
          q.push(v)
        }
      }
    }
  }
  const inf = 1e9
  return linkList.map((l) => {
    const { source: a, target: b } = l
    const da = depth.get(a) ?? inf
    const db = depth.get(b) ?? inf
    if (da < db) return { ...l, source: a, target: b }
    if (db < da) return { ...l, source: b, target: a }
    return { ...l, source: a, target: b }
  })
}

const buildGraphData = () => {
  const nodes = [...(props.graphData?.nodes || [])]
  const relationships = props.graphData?.relationships || []
  const pathId = props.graphData?.pathId || props.pathId
  const topic = props.graphData?.topic || ''

  const nodeIds = new Set(nodes.map(n => n.nodeId || n.id))
  if (pathId && !nodeIds.has(pathId)) {
    nodes.unshift({
      nodeId: pathId,
      id: pathId,
      name: topic || '根',
      label: topic || '根',
      isStart: true
    })
  }

  const mappedNodes = nodes.map(n => ({
    id: n.nodeId || n.id,
    ...n
  }))
  const idSet = new Set(mappedNodes.map(n => n.id))

  let links = relationships.map(r => ({
    source: r.sourceNodeId,
    target: r.targetNodeId,
    type: r.type || 'PARENT_OF'
  })).filter(l => idSet.has(l.source) && idSet.has(l.target))

  const root = mappedNodes.find(n => n.isStart === true) || mappedNodes[0]
  if (root?.id) links = orientLinksParentToChild(root.id, links, idSet)

  return {
    nodes: mappedNodes,
    links
  }
}

/** 从根节点沿 PARENT_OF（source→target）BFS 得到层级深度 */
const computeDepthById = (nodes, links) => {
  const idSet = new Set(nodes.map(n => n.id))
  const children = new Map()
  for (const l of links) {
    const s = typeof l.source === 'object' ? l.source.id : l.source
    const t = typeof l.target === 'object' ? l.target.id : l.target
    if (!idSet.has(s) || !idSet.has(t)) continue
    if (!children.has(s)) children.set(s, [])
    children.get(s).push(t)
  }
  const root = nodes.find(n => n.isStart === true) || nodes[0]
  const depthById = new Map()
  if (!root?.id) return depthById
  const q = [[root.id, 0]]
  depthById.set(root.id, 0)
  while (q.length) {
    const [id, d] = q.shift()
    for (const c of children.get(id) || []) {
      if (!depthById.has(c)) {
        depthById.set(c, d + 1)
        q.push([c, d + 1])
      }
    }
  }
  for (const n of nodes) {
    if (!depthById.has(n.id)) depthById.set(n.id, 1)
  }
  return depthById
}

const getNodeDisplayName = (d) => d?.name || d?.label || d?.id || ''
const isStartNode = (d) => d?.isStart === true
const getNodeRadius = (d) => isStartNode(d) ? 26 : 18

const renderGraph = () => {
  updateDimensions()
  if (!svgRef.value || dimensions.value.width === 0 || dimensions.value.height === 0) return
  const { width, height } = dimensions.value
  const { nodes, links } = buildGraphData()
  if (nodes.length === 0) return

  const depthById = computeDepthById(nodes, links)
  const fills = levelFills.value
  const getNodeFill = (d) => {
    const depth = depthById.get(d.id) ?? 0
    if (depth === 0 && NODE_STYLE.value.rootFill) return NODE_STYLE.value.rootFill
    const idx = Math.min(depth, Math.max(0, fills.length - 1))
    return fills[idx]
  }

  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()
  svg.attr('width', width).attr('height', height)

  const cx = width / 2
  const cy = height / 2
  nodes.forEach(n => {
    if (n.x == null) n.x = cx + (Math.random() - 0.5) * 100
    if (n.y == null) n.y = cy + (Math.random() - 0.5) * 100
  })

  const linkStroke = NODE_STYLE.value.linkStroke
  const linkLineEnds = (d) => {
    const s = d.source
    const t = d.target
    const sx = s.x
    const sy = s.y
    const tx = t.x
    const ty = t.y
    if (!Number.isFinite(sx) || !Number.isFinite(tx)) return { x1: sx, y1: sy, x2: tx, y2: ty }
    const rS = getNodeRadius(s)
    const rT = getNodeRadius(t)
    const dx = tx - sx
    const dy = ty - sy
    const len = Math.hypot(dx, dy)
    if (len < 1e-6) return { x1: sx, y1: sy, x2: tx, y2: ty }
    const ux = dx / len
    const uy = dy / len
    const arrowGap = 6
    return {
      x1: sx + ux * rS,
      y1: sy + uy * rS,
      x2: tx - ux * (rT + arrowGap),
      y2: ty - uy * (rT + arrowGap)
    }
  }

  const arrowMarkerId = `lp-g-arr-${String(props.pathId || 'p').replace(/\W/g, '_')}`
  svg.append('defs').append('marker')
    .attr('id', arrowMarkerId)
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 9)
    .attr('refY', 5)
    .attr('markerWidth', 7)
    .attr('markerHeight', 7)
    .attr('orient', 'auto')
    .attr('markerUnits', 'userSpaceOnUse')
    .append('path')
    .attr('d', 'M0,0 L10,5 L0,10 Z')
    .attr('fill', linkStroke)

  gRoot = svg.append('g')
  zoomBehavior = d3.zoom().scaleExtent([0.2, 4]).on('zoom', (ev) => gRoot.attr('transform', ev.transform))
  svg.call(zoomBehavior)

  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(120).strength(0.6))
    .force('charge', d3.forceManyBody().strength(-280))
    .force('center', d3.forceCenter(cx, cy))
    .force('collision', d3.forceCollide().radius(d => getNodeRadius(d) + 8))

  const linkLayer = gRoot.append('g').attr('class', 'lp-links')
  const nodeLayer = gRoot.append('g').attr('class', 'lp-nodes')

  linkLayer.selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', linkStroke)
    .attr('stroke-width', 2)
    .attr('stroke-opacity', 0.7)
    .attr('marker-end', `url(#${arrowMarkerId})`)

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
    .attr('stroke-width', 2)

  nodeSel.append('text')
    .text(getNodeDisplayName)
    .attr('font-size', d => (isStartNode(d) ? 12 : 10))
    .attr('text-anchor', 'middle')
    .attr('dy', 4)
    .style('fill', '#1f1f1f')
    .style('pointer-events', 'none')

  nodeSel.on('click', (ev, d) => {
    ev.stopPropagation()
    nodeCardData.value = { ...d }
    showNodeCard.value = true
  })

  simulation.on('tick', () => {
    linkLayer.selectAll('line')
      .attr('x1', d => linkLineEnds(d).x1)
      .attr('y1', d => linkLineEnds(d).y1)
      .attr('x2', d => linkLineEnds(d).x2)
      .attr('y2', d => linkLineEnds(d).y2)
    nodeSel.attr('transform', d => `translate(${d.x},${d.y})`)
  })
}

const closeNodeCard = () => {
  showNodeCard.value = false
}

const openEdit = () => {
  editForm.value = { nodeId: nodeCardData.value.id, name: nodeCardData.value.name || '' }
  showEditModal.value = true
}

const saveNodeEdit = async () => {
  const name = (editForm.value.name || '').trim()
  if (!name) {
    ElMessage.warning('请输入节点名称')
    return
  }
  const nodes = [...(props.graphData?.nodes || [])]
  const idx = nodes.findIndex(n => (n.nodeId || n.id) === editForm.value.nodeId)
  if (idx === -1) {
    ElMessage.warning('未找到节点')
    return
  }
  savingEdit.value = true
  try {
    nodes[idx] = { ...nodes[idx], name, label: name }
    await updateJson(props.pathId, { nodes }, props.userId)
    ElMessage.success('已保存')
    showEditModal.value = false
    closeNodeCard()
    emit('refresh')
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    savingEdit.value = false
  }
}

const confirmDeleteNode = () => {
  deleteNodeConfirm.value = nodeCardData.value
}

const doDeleteNode = async () => {
  const node = deleteNodeConfirm.value
  deleteNodeConfirm.value = null
  if (!node?.id) return
  const nodes = (props.graphData?.nodes || []).filter(n => (n.nodeId || n.id) !== node.id)
  try {
    await updateJson(props.pathId, { nodes }, props.userId)
    ElMessage.success('已删除节点')
    closeNodeCard()
    emit('refresh')
  } catch (e) {
    ElMessage.error(e?.message || '删除失败')
  }
}

watch(() => [props.graphData?.nodes?.length, props.graphData?.relationships?.length], () => {
  renderGraph()
}, { deep: true })

onMounted(() => {
  renderGraph()
  window.addEventListener('resize', updateDimensions)
})

onUnmounted(() => {
  if (simulation) simulation.stop()
  window.removeEventListener('resize', updateDimensions)
})
</script>

<style scoped>
.lp-graph-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding-top: 8px;
}

.lp-graph-header {
  flex-shrink: 0;
  padding: 12px 24px;
  border-bottom: 1px solid rgba(147, 51, 234, 0.12);
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.06) 0%, rgba(124, 58, 237, 0.04) 100%);
}

.lp-graph-header__inner {
  display: flex;
  align-items: center;
  gap: 16px;
}

.lp-graph-back {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid rgba(147, 51, 234, 0.3);
  background: transparent;
  color: #7c3aed;
  font-size: 14px;
  cursor: pointer;
}

.lp-graph-back:hover {
  background: rgba(147, 51, 234, 0.1);
}

.lp-graph-header__title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.lp-graph-area {
  flex: 1;
  min-height: 0;
  background: v-bind(nodeBg);
}

.lp-empty-graph {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
}

.lp-empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.lp-empty-text {
  font-size: 16px;
  margin: 0 0 8px 0;
}

.lp-empty-hint {
  font-size: 13px;
  margin: 0;
}

.lp-graph-svg {
  width: 100%;
  height: 100%;
}

.drawer-left-enter-active,
.drawer-left-leave-active {
  transition: transform 0.25s ease;
}

.drawer-left-enter-from,
.drawer-left-leave-to {
  transform: translateX(100%);
}

.lp-node-drawer-wrapper {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 320px;
  z-index: 1500;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
}

.lp-node-drawer {
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.lp-node-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.lp-node-drawer-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f1f1f;
}

.lp-node-drawer-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
}

.lp-node-drawer-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.lp-node-meta {
  margin-bottom: 8px;
  font-size: 14px;
  color: #6b7280;
}

.lp-node-drawer-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.lp-node-btn {
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.lp-node-edit {
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
  color: #fff;
}

.lp-node-delete {
  background: #fef2f2;
  color: #dc2626;
}

.lp-edit-mask,
.lp-delete-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
}

.lp-edit-modal,
.lp-delete-modal {
  background: #fff;
  border-radius: 14px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
}

.lp-edit-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.lp-edit-body {
  margin-bottom: 20px;
}

.lp-edit-field {
  margin-bottom: 12px;
}

.lp-edit-field label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #374151;
}

.lp-edit-field input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.lp-edit-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.lp-edit-cancel {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: #f3f4f6;
  color: #374151;
  cursor: pointer;
}

.lp-edit-save {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: #9333ea;
  color: #fff;
  cursor: pointer;
}

.lp-edit-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.lp-delete-ok {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: #dc2626;
  color: #fff;
  cursor: pointer;
}
</style>
