<template>
  <div class="learning-path-graph-page" :class="{ 'compare-mode': isCompareMode }">
    <button v-if="!isCompareMode" class="lp-back-button" type="button" @click="goBack">返回</button>
    <div v-if="pageLoading" class="lp-page-loading">
      <div class="lp-page-loading-inner">
        <div class="lp-page-spinner"></div>
        <div class="lp-page-loading-text">正在加载学习路径数据...</div>
      </div>
    </div>

    <template v-else>
      <LearningPathSelectorPanel
        :selector-collapsed="selectorCollapsed"
        :sorted-path-list="sortedPathList"
        :selected-path-id="selectedPathId"
        :get-path-display-name="getPathDisplayName"
        :user-avatar="userAvatar"
        :user-nickname="userNickname"
        @toggle-selector="toggleSelector"
        @select-all="selectedPathId = null"
        @select-path="id => (selectedPathId = id)"
        @open-path-menu="openPathMenu"
        @open-compare="goToCompareMode"
      />

      <!-- 图谱展示：一个容器合并渲染所有路径；选择后只过滤参与渲染的 pathIds -->
      <div class="lp-one-wrap">
        <div v-if="listLoading" class="lp-inline-loading">正在加载路径列表...</div>
        <div v-else-if="displayPathIds.length === 0" class="lp-empty-page">暂无学习路径图谱</div>
        <LearningPathGraphAll
          v-else
          :user-id="userId"
          :path-ids="displayPathIds"
          :graphs-by-id="graphsById"
          :theme-by-id="themeById"
          :title-by-id="displayNameById"
          :header-title="graphTopHeaderTitle"
          :is-compare-mode="isCompareMode"
          @refreshOne="reloadOneGraph"
        />
      </div>
    </template>

    <Teleport to="body">
      <!-- 面板三点菜单 -->
      <div
        v-if="showPathMenu && pathMenuPosition"
        class="lp-path-menu"
        :style="{ top: pathMenuPosition.top + 'px', left: pathMenuPosition.left + 'px' }"
        @click.stop
      >
        <button class="lp-path-menu-item" @click="handlePinPath">
          <PinMenuIcon class="lp-path-menu-icon" />
          <span>置顶</span>
        </button>
        <button class="lp-path-menu-item" @click="handleRenamePath">
          <PencilIcon class="lp-path-menu-icon" />
          <span>重命名</span>
        </button>
        <button class="lp-path-menu-item danger" @click="handleDeletePath">
          <TrashIcon class="lp-path-menu-icon" />
          <span>删除</span>
        </button>
      </div>

      <!-- 重命名弹窗 -->
      <div v-if="showRenameDialog" class="lp-rename-mask" @click.self="closeRenameDialog">
        <div class="lp-rename-modal" @click.stop>
          <div class="lp-rename-title">重命名学习路径</div>
          <input v-model="renameValue" class="lp-rename-input" type="text" maxlength="64" />
          <div class="lp-rename-actions">
            <button type="button" class="lp-rename-btn cancel" @click="closeRenameDialog">取消</button>
            <button type="button" class="lp-rename-btn ok" @click="confirmRename">确定</button>
          </div>
        </div>
      </div>

    </Teleport>
  </div>
</template>

<script setup>
import { h, ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { list as listApi, remove, getGraph, renameTopic } from '../api/learningPath'
import LearningPathGraphAll from '../components/LearningPath/LearningPathGraphAll.vue'
import LearningPathSelectorPanel from '../components/LearningPath/LearningPathSelectorPanel.vue'
import { getMyProfile } from '../api/user'
import { ElMessage } from 'element-plus'
import { normalizeProfile } from '../utils/profile'
import { confirmAction } from '../utils/confirm'

// 与孪孪伴学「最近对话」更多操作菜单保持同一套 SVG 图标（形状/线宽/尺寸一致）
const PinMenuIcon = (props = {}) => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, ...props }, [
  h('line', { x1: 12, y1: 17, x2: 12, y2: 22 }),
  h('path', { d: 'M5 17h14l-1-7H6z' }),
  h('path', { d: 'M9 10V4h6v6' })
])
const PencilIcon = (props = {}) => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, ...props }, [
  h('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
  h('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })
])
const TrashIcon = (props = {}) => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, ...props }, [
  h('polyline', { points: '3 6 5 6 21 6' }),
  h('path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' })
])

function getUserId() {
  try {
    const s = localStorage.getItem('userInfo')
    if (s) {
      const u = JSON.parse(s)
      return u.id ?? u.userId ?? null
    }
  } catch (_) {}
  return null
}

const router = useRouter()
const route = useRoute()
const userId = computed(() => getUserId())
const userAvatar = ref('')
const userNickname = ref('U')
const pageLoading = ref(true)
const listLoading = ref(false)
const pathList = ref([])
const graphsById = ref({})
const selectedPathId = ref(null)
const selectorCollapsed = ref(false)

// 面板菜单与本地偏好
const showPathMenu = ref(false)
const pathMenuPosition = ref(null)
const currentMenuPathId = ref(null)
const showRenameDialog = ref(false)
const renameValue = ref('')
const renamePathId = ref(null)
const pinnedIds = ref([])
const renamedById = ref({})

const PREF_KEY = computed(() => `learning_path_graph_prefs_${userId.value ?? 'guest'}`)
const loadPrefs = () => {
  try {
    const raw = localStorage.getItem(PREF_KEY.value)
    if (!raw) return
    const obj = JSON.parse(raw)
    pinnedIds.value = Array.isArray(obj?.pinnedIds) ? obj.pinnedIds : []
    renamedById.value = obj?.renamedById && typeof obj.renamedById === 'object' ? obj.renamedById : {}
  } catch (_) {}
}
const savePrefs = () => {
  try {
    localStorage.setItem(PREF_KEY.value, JSON.stringify({ pinnedIds: pinnedIds.value, renamedById: renamedById.value }))
  } catch (_) {}
}

const displayNameById = computed(() => renamedById.value || {})

const getPathDisplayName = (p) => {
  const id = p?.id
  if (id && renamedById.value && renamedById.value[id]) return renamedById.value[id]
  return p?.topic || '未命名路径'
}

const sortedPathList = computed(() => {
  const list = [...(pathList.value || [])]
  const pinSet = new Set((pinnedIds.value || []).map(String))
  return list.sort((a, b) => {
    const ap = pinSet.has(String(a.id))
    const bp = pinSet.has(String(b.id))
    if (ap && !bp) return -1
    if (!ap && bp) return 1
    return String(getPathDisplayName(a)).localeCompare(String(getPathDisplayName(b)))
  })
})

const fetchList = async () => {
  const uid = userId.value
  if (uid == null) {
    pathList.value = []
    return
  }
  listLoading.value = true
  try {
    const data = await listApi(uid)
    pathList.value = Array.isArray(data) ? data : []
  } catch (e) {
    pathList.value = []
    ElMessage.error(e?.message || '加载列表失败')
  } finally {
    listLoading.value = false
  }
}

const reloadOneGraph = async (pid) => {
  const uid = userId.value
  if (!pid) return
  try {
    const data = await getGraph(pid, uid)
    graphsById.value = {
      ...graphsById.value,
      [pid]: {
        pathId: data?.pathId ?? pid,
        topic: data?.topic ?? '',
        nodes: Array.isArray(data?.nodes) ? data.nodes : [],
        relationships: Array.isArray(data?.relationships) ? data.relationships : []
      }
    }
  } catch (e) {
    ElMessage.error(e?.message || '加载图谱失败')
    graphsById.value = { ...graphsById.value, [pid]: { pathId: pid, topic: '', nodes: [], relationships: [] } }
  }
}

const loadAllGraphs = async () => {
  const ids = (pathList.value || []).map(p => p.id).filter(Boolean)
  if (ids.length === 0) {
    graphsById.value = {}
    return
  }
  await Promise.allSettled(ids.map(id => reloadOneGraph(id)))
}

const goBack = () => {
  // 图谱页返回：只允许回到「首页」或「孪孪伴学」，具体取决于从哪里进入
  let origin = null
  try {
    origin = sessionStorage.getItem('graph_entry_origin')
  } catch (_) {}

  if (origin && typeof origin === 'string') {
    if (origin.startsWith('/twin-study')) {
      router.push('/twin-study')
      return
    }
    if (origin.startsWith('/home')) {
      router.push('/home')
      return
    }
  }
  router.push('/home')
}

const toggleSelector = () => {
  selectorCollapsed.value = !selectorCollapsed.value
}

const closePathMenu = () => {
  showPathMenu.value = false
  pathMenuPosition.value = null
  currentMenuPathId.value = null
}

const handleClickOutside = (event) => {
  if (!showPathMenu.value) return
  // 点击菜单或三点按钮本身不关闭
  if (event.target.closest('.lp-path-menu')) return
  if (event.target.closest('.lp-item-more')) return
  closePathMenu()
}

const openPathMenu = (p, event) => {
  const pid = p?.id
  if (!pid) return
  currentMenuPathId.value = pid
  const rect = event.target.closest('.lp-selector-row')?.getBoundingClientRect()
  if (!rect) return
  pathMenuPosition.value = { top: rect.bottom + 6, left: rect.right - 120 }
  showPathMenu.value = true
}

const handlePinPath = () => {
  const pid = currentMenuPathId.value
  if (!pid) return
  const s = new Set((pinnedIds.value || []).map(String))
  if (s.has(String(pid))) s.delete(String(pid))
  else s.add(String(pid))
  pinnedIds.value = Array.from(s)
  savePrefs()
  closePathMenu()
}

const closeRenameDialog = () => {
  showRenameDialog.value = false
  renameValue.value = ''
  renamePathId.value = null
}

const handleRenamePath = () => {
  const pid = currentMenuPathId.value
  if (!pid) return
  const p = (pathList.value || []).find(x => String(x.id) === String(pid))
  renameValue.value = getPathDisplayName(p)
   renamePathId.value = pid
  showRenameDialog.value = true
  closePathMenu()
}

const confirmRename = async () => {
  const pid = renamePathId.value
  const v = (renameValue.value || '').trim()
  if (!pid || !v) return
  try {
    // 后端重命名 topic
    await renameTopic(pid, v, userId.value)

    // 同步更新本地列表与图谱缓存
    const list = pathList.value || []
    pathList.value = list.map(p => (String(p.id) === String(pid) ? { ...p, topic: v } : p))

    const currentGraph = graphsById.value?.[pid]
    if (currentGraph) {
      graphsById.value = {
        ...graphsById.value,
        [pid]: { ...currentGraph, topic: v }
      }
    }

    // 后端已存储新的 topic，本地重命名缓存可清理
    if (renamedById.value && renamedById.value[pid]) {
      const { [pid]: _, ...rest } = renamedById.value
      renamedById.value = rest
    }
    savePrefs()
    closeRenameDialog()
    ElMessage.success('重命名成功')
  } catch (e) {
    ElMessage.error(e?.message || '重命名失败')
  }
}

const handleDeletePath = () => {
  const pid = currentMenuPathId.value
  if (!pid) return
  const p = (pathList.value || []).find(x => String(x.id) === String(pid))
  doDelete(p || { id: pid, topic: getPathDisplayName(p) })
  closePathMenu()
}

const confirmDelete = (item) => {
  doDelete(item)
}

const doDelete = async (item) => {
  if (!item?.id) return
  const ok = await confirmAction(`确定要删除「${item.topic || '该路径'}」吗？`, {
    title: '删除确认',
    confirmButtonText: '删除'
  })
  if (!ok) return
  try {
    await remove(item.id, userId.value)
    ElMessage.success('已删除')
    // 同步清理本地偏好与图谱缓存
    pinnedIds.value = (pinnedIds.value || []).filter(x => String(x) !== String(item.id))
    if (renamedById.value && renamedById.value[item.id]) {
      const { [item.id]: _, ...rest } = renamedById.value
      renamedById.value = rest
    }
    savePrefs()
    const next = { ...(graphsById.value || {}) }
    delete next[item.id]
    graphsById.value = next
    if (selectedPathId.value === item.id) selectedPathId.value = null
    await fetchList()
    await loadAllGraphs()
  } catch (e) {
    ElMessage.error(e?.message || '删除失败')
  }
}

onMounted(async () => {
  pageLoading.value = true
  try {
    await loadUserProfile()
    loadPrefs()
    await fetchList()
    await loadAllGraphs()
    window.addEventListener('click', handleClickOutside)
  } catch (e) {
    console.error(e)
  } finally {
    pageLoading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})

watch(
  () => userId.value,
  async () => {
    // 用户切换时刷新列表与图谱
    loadPrefs()
    await fetchList()
    await loadAllGraphs()
  }
)

const displayPathIds = computed(() => {
  const ids = (pathList.value || []).map(p => p.id).filter(Boolean)
  const sel = selectedPathId.value
  if (sel != null && sel !== '') return ids.filter(id => String(id) === String(sel))
  return ids
})

/** 顶栏大字标题：与 GraphTopHeader 一致，字间加空格 */
const graphTopHeaderTitle = computed(() => {
  const toSpaced = (s) => [...String(s || '')].join(' ')
  const ids = displayPathIds.value
  const sel = selectedPathId.value

  /** 当前画布实际只展示一条路径时，用该路径名（含「全部」下仅一条、或单选） */
  const singleShownId = ids.length === 1 ? ids[0] : null
  const titlePathId = (sel != null && sel !== '') ? sel : singleShownId

  if (!titlePathId) return toSpaced('学习路径图谱')

  const p = pathList.value.find(x => String(x.id) === String(titlePathId))
  const gMap = graphsById.value || {}
  const fromGraph = gMap[titlePathId]?.topic ?? gMap[String(titlePathId)]?.topic
  const name = p ? getPathDisplayName(p) : (fromGraph || '学习路径')
  return toSpaced(`${name}图谱`)
})

// 多路径配色：按 pathId 稳定取色，避免审美疲劳
const THEMES = [
  { rootFill: '#A78BFA', nodeFill: '#6366F1', linkStroke: '#A5ABB6', bg: '#faf8ff' }, // 紫/靛
  { rootFill: '#F59E0B', nodeFill: '#F97316', linkStroke: '#94A3B8', bg: '#fff7ed' }, // 橙
  { rootFill: '#10B981', nodeFill: '#22C55E', linkStroke: '#94A3B8', bg: '#ecfdf5' }, // 绿
  { rootFill: '#06B6D4', nodeFill: '#0EA5E9', linkStroke: '#94A3B8', bg: '#ecfeff' }, // 青/蓝
  { rootFill: '#EC4899', nodeFill: '#F43F5E', linkStroke: '#94A3B8', bg: '#fff1f2' }, // 粉/红
  { rootFill: '#8B5CF6', nodeFill: '#A855F7', linkStroke: '#94A3B8', bg: '#f5f3ff' }  // 紫
]

const hashString = (s) => {
  const str = String(s || '')
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0
  }
  return h
}

const themeById = computed(() => {
  const map = {}
  const ids = (pathList.value || []).map(p => p.id).filter(Boolean)
  ids.forEach((id) => {
    map[id] = THEMES[hashString(id) % THEMES.length]
  })
  return map
})

const loadUserProfile = async () => {
  try {
    const res = await getMyProfile()
    if (res) {
      const p = normalizeProfile(res || {})
      userAvatar.value = p.avatar || ''
      userNickname.value = p.nickname || 'U'
    }
  } catch (_) {
    userAvatar.value = ''
    userNickname.value = 'U'
  }
}

// 对比模式：通过查询参数 from=compare 判断（供闪卡图谱对比模式 iframe 使用）
const isCompareMode = computed(() => route.query.from === 'compare')

/** 进入对比模式：跳转到闪卡图谱页的对比视图，与闪卡侧「对比模式」按钮效果一致 */
const goToCompareMode = () => {
  // 记录来源：关闭对比模式时应回到学习路径图谱
  try {
    sessionStorage.setItem('compare_origin_route', route.fullPath || '/learning-path-graph')
  } catch (_) {}
  router.push({ path: '/flashcard-graph', query: { view: 'compare' } })
}
</script>

<style scoped>
.learning-path-graph-page {
  width: 100%;
  min-height: 100vh;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* 对比模式下：整体作为嵌入视图使用，隐藏页面滚动条边距等（保留默认即可，如需可在此追加样式） */
.learning-path-graph-page.compare-mode {
  overflow: hidden;
}

/* 对比模式下：左上路径切换面板略窄一些，避免遮挡对比视图 */
.learning-path-graph-page.compare-mode :deep(.lp-selector-panel) {
  width: 150px;
  padding: 14px 10px 10px;
}

.lp-back-button {
  position: fixed;
  top: 18px;
  left: 24px;
  z-index: 1100;
  padding: 8px 24px;
  border-radius: 999px;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: #f9fafb;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.35);
  transition: background 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease;
}

.lp-back-button:hover {
  background: #374151;
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.4);
}

.lp-page-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lp-page-loading-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #64748b;
  font-size: 14px;
}

.lp-page-spinner {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid rgba(148, 163, 184, 0.35);
  border-top-color: #4f46e5;
  animation: lp-spin 0.7s linear infinite;
}

@keyframes lp-spin {
  to { transform: rotate(360deg); }
}

.lp-one-wrap {
  flex: 1;
  padding-top: 0;
  padding-bottom: 0;
  min-height: 0;
}

.lp-inline-loading {
  margin: 18px 24px 0;
  color: #64748b;
  font-size: 14px;
}

.lp-empty-page {
  margin: 80px auto 0;
  color: #94a3b8;
  font-size: 14px;
}

/* 单容器模式：不再使用分卡片容器 */

/* 左上控制面板：参考闪卡图谱彩带风格（无边框） */
.lp-selector-root {
  position: fixed;
  top: 18px;
  left: 24px;
  z-index: 1250;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  pointer-events: none;
}

.lp-selector-root > * {
  pointer-events: auto;
}

.lp-selector-avatar {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  padding: 0;
  position: relative;
  background: transparent;
  display: grid;
  place-items: center;
  box-shadow: 0 14px 32px rgba(76, 29, 149, 0.22);
  transform: translateY(0) scale(0.92);
  transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.lp-selector-ring {
  position: absolute;
  inset: -2px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(196, 181, 253, 0.96), rgba(167, 139, 250, 0.96));
}

.lp-selector-letter {
  width: 50px;
  height: 50px;
  border-radius: 999px;
  position: relative;
  z-index: 1;
  background: #ffffff;
  border: 2px solid rgba(255, 255, 255, 0.9);
  display: grid;
  place-items: center;
  font-weight: 900;
  font-size: 18px;
  color: #5b21b6;
}

.lp-selector-root:not(.collapsed) .lp-selector-avatar {
  transform: translateY(8px) scale(1);
}

.lp-selector-avatar:hover {
  transform: translateY(6px) scale(1.04);
}

.lp-selector-panel {
  width: 180px;
  padding: 18px 14px 14px;
  position: relative;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(196, 181, 253, 0.96), rgba(129, 140, 248, 0.96));
  box-shadow: 0 18px 46px rgba(46, 16, 101, 0.28);
  --notch: 28px;
  -webkit-mask: radial-gradient(circle at 50% 0, transparent 0 var(--notch), #000 calc(var(--notch) + 1px)) 0 0 / 100% 100% no-repeat;
  mask: radial-gradient(circle at 50% 0, transparent 0 var(--notch), #000 calc(var(--notch) + 1px)) 0 0 / 100% 100% no-repeat;
}

.lp-selector-notch {
  position: absolute;
  top: -1px;
  left: 50%;
  width: calc(var(--notch) * 2);
  height: calc(var(--notch) + 6px);
  transform: translateX(-50%);
  border-bottom-left-radius: 999px;
  border-bottom-right-radius: 999px;
  opacity: 0.55;
  pointer-events: none;
}

.lp-selector-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
  max-height: 312px; /* 大约 6 条 */
  overflow-y: auto;
  padding-right: 2px;
}

.lp-selector-list::-webkit-scrollbar {
  width: 6px;
}
.lp-selector-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.35);
  border-radius: 999px;
}

.lp-selector-item {
  width: 100%;
  padding: 10px 10px;
  border-radius: 10px;
  border: none; /* 不要边框 */
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.95);
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  letter-spacing: 0.02em;
  text-align: center;
  transition: transform 0.15s ease, background 0.15s ease;
}

.lp-selector-row {
  position: relative;
  display: flex;
  align-items: center;
}

.lp-selector-item--row {
  padding-right: 34px;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lp-item-more {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 26px;
  height: 26px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  display: grid;
  place-items: center;
  opacity: 0;
  transition: opacity 0.15s ease, background 0.15s ease, transform 0.15s ease;
}

.lp-selector-row:hover .lp-item-more {
  opacity: 1;
}

.lp-item-more:hover {
  background: rgba(255, 255, 255, 0.16);
  transform: translateY(-50%) scale(1.04);
}

.lp-dots {
  font-size: 18px;
  line-height: 1;
  transform: translateY(-2px);
}

.lp-path-menu {
  position: fixed;
  width: 120px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 18px 46px rgba(15, 23, 42, 0.18);
  z-index: 3000;
  overflow: hidden;
}

.lp-path-menu-item {
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: #1f2937;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
}

.lp-path-menu-icon {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
}

.lp-path-menu-item:hover {
  background: #f3f4f6;
}

.lp-path-menu-item.danger {
  color: #dc2626;
}

.lp-path-menu-item.danger:hover {
  background: #fef2f2;
}

.lp-rename-mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
  z-index: 3100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.lp-rename-modal {
  width: 92%;
  max-width: 380px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.25);
  padding: 20px;
}

.lp-rename-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 12px;
}

.lp-rename-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.lp-rename-input:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.14);
}

.lp-rename-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}

.lp-rename-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.lp-rename-btn.cancel {
  background: #f3f4f6;
  color: #374151;
}

.lp-rename-btn.ok {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: #fff;
}

.lp-rename-btn.ok:hover {
  background: linear-gradient(135deg, #a78bfa, #818cf8);
}

.lp-selector-item:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.14);
}

.lp-selector-item.active {
  background: rgba(255, 255, 255, 0.22);
}

.lp-selector-slide-enter-active,
.lp-selector-slide-leave-active {
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease;
}
.lp-selector-slide-enter-from,
.lp-selector-slide-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

</style>
