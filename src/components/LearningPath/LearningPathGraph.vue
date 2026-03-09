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
import { updateJson } from '../../api/learningPath'

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
  rootFill: props.theme?.rootFill || '#A78BFA',
  nodeFill: props.theme?.nodeFill || '#7880f0',
  linkStroke: props.theme?.linkStroke || '#A5ABB6',
  bg: props.theme?.bg || '#faf8ff'
}))
const nodeBg = computed(() => NODE_STYLE.value.bg)

const updateDimensions = () => {
  if (graphContainer.value) {
    dimensions.value = {
      width: graphContainer.value.clientWidth,
      height: graphContainer.value.clientHeight
    }
  }
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

  const links = relationships.map(r => ({
    source: r.sourceNodeId,
    target: r.targetNodeId,
    type: r.type || 'PARENT_OF'
  })).filter(l => {
    const hasSource = nodes.some(n => (n.nodeId || n.id) === l.source)
    const hasTarget = nodes.some(n => (n.nodeId || n.id) === l.target)
    return hasSource && hasTarget
  })

  return {
    nodes: nodes.map(n => ({
      id: n.nodeId || n.id,
      ...n
    })),
    links
  }
}

const getNodeDisplayName = (d) => d?.name || d?.label || d?.id || ''
const isStartNode = (d) => d?.isStart === true
const getNodeRadius = (d) => isStartNode(d) ? 26 : 18
const getNodeFill = (d) => isStartNode(d) ? NODE_STYLE.value.rootFill : NODE_STYLE.value.nodeFill

const renderGraph = () => {
  updateDimensions()
  if (!svgRef.value || dimensions.value.width === 0 || dimensions.value.height === 0) return
  const { width, height } = dimensions.value
  const { nodes, links } = buildGraphData()
  if (nodes.length === 0) return

  const svg = d3.select(svgRef.value)
  svg.selectAll('*').remove()
  svg.attr('width', width).attr('height', height)

  const cx = width / 2
  const cy = height / 2
  nodes.forEach(n => {
    if (n.x == null) n.x = cx + (Math.random() - 0.5) * 100
    if (n.y == null) n.y = cy + (Math.random() - 0.5) * 100
  })

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
    .attr('stroke', NODE_STYLE.value.linkStroke)
    .attr('stroke-width', 2)
    .attr('stroke-opacity', 0.7)

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
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
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
