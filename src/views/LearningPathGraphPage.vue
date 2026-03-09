<template>
  <div class="learning-path-graph-page">
    <button class="lp-back-button" type="button" @click="goBack">返回</button>

    <div v-if="pageLoading" class="lp-page-loading">
      <div class="lp-page-loading-inner">
        <div class="lp-page-spinner"></div>
        <div class="lp-page-loading-text">正在加载学习路径数据...</div>
      </div>
    </div>

    <template v-else>
      <!-- 列表视图：无 pathId 时展示路径卡片 -->
      <div v-if="!currentPathId" class="lp-list-view">
        <header class="lp-list-header">
          <h1 class="lp-list-title">学习路径图谱</h1>
          <p class="lp-list-desc">查看、编辑或删除已保存的学习路径</p>
        </header>
        <LearningPathList
          :list="pathList"
          :loading="listLoading"
          @view="goToGraph"
          @delete="confirmDelete"
        />
      </div>

      <!-- 图谱视图：有 pathId 时展示 D3 图谱 -->
      <LearningPathGraph
        v-else
        :path-id="currentPathId"
        :user-id="userId"
        :graph-data="graphData"
        @back="goBackToList"
        @refresh="loadGraph"
      />
    </template>

    <Teleport to="body">
      <div v-if="deleteConfirm" class="lp-delete-mask" @click.self="deleteConfirm = null">
        <div class="lp-delete-modal">
          <p>确定要删除「{{ deleteConfirm.topic || '该路径' }}」吗？</p>
          <div class="lp-delete-actions">
            <button type="button" class="lp-delete-btn lp-delete-cancel" @click="deleteConfirm = null">取消</button>
            <button type="button" class="lp-delete-btn lp-delete-ok" @click="doDelete">删除</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { list as listApi, remove, getGraph } from '../api/learningPath'
import LearningPathList from '../components/LearningPath/LearningPathList.vue'
import LearningPathGraph from '../components/LearningPath/LearningPathGraph.vue'
import { ElMessage } from 'element-plus'

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

const route = useRoute()
const router = useRouter()
const userId = computed(() => getUserId())
const pageLoading = ref(true)
const listLoading = ref(false)
const pathList = ref([])
const graphData = ref({ pathId: '', topic: '', nodes: [], relationships: [] })
const deleteConfirm = ref(null)

const currentPathId = computed(() => route.params.pathId || null)

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

const loadGraph = async () => {
  const pid = currentPathId.value
  const uid = userId.value
  if (!pid) return
  try {
    const data = await getGraph(pid, uid)
    graphData.value = {
      pathId: data?.pathId ?? pid,
      topic: data?.topic ?? '',
      nodes: Array.isArray(data?.nodes) ? data.nodes : [],
      relationships: Array.isArray(data?.relationships) ? data.relationships : []
    }
  } catch (e) {
    ElMessage.error(e?.message || '加载图谱失败')
    graphData.value = { pathId: pid, topic: '', nodes: [], relationships: [] }
  }
}

const goBack = () => {
  if (currentPathId.value) {
    goBackToList()
  } else {
    router.push('/home')
  }
}

const goBackToList = () => {
  router.push('/learning-path-graph')
}

const goToGraph = (item) => {
  if (item?.id) router.push(`/learning-path-graph/${item.id}`)
}

const confirmDelete = (item) => {
  deleteConfirm.value = item
}

const doDelete = async () => {
  const item = deleteConfirm.value
  if (!item?.id) {
    deleteConfirm.value = null
    return
  }
  try {
    await remove(item.id, userId.value)
    ElMessage.success('已删除')
    deleteConfirm.value = null
    await fetchList()
  } catch (e) {
    ElMessage.error(e?.message || '删除失败')
  }
}

onMounted(async () => {
  pageLoading.value = true
  try {
    await fetchList()
    if (currentPathId.value) {
      await loadGraph()
    }
  } catch (e) {
    console.error(e)
  } finally {
    pageLoading.value = false
  }
})

watch(currentPathId, async (pid) => {
  if (pid) {
    pageLoading.value = true
    try {
      await loadGraph()
    } finally {
      pageLoading.value = false
    }
  } else {
    graphData.value = { pathId: '', topic: '', nodes: [], relationships: [] }
  }
})
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

.lp-list-view {
  flex: 1;
  padding-top: 60px;
  padding-bottom: 48px;
}

.lp-list-header {
  padding: 24px 24px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.lp-list-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.lp-list-desc {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.lp-delete-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
}

.lp-delete-modal {
  background: #fff;
  border-radius: 14px;
  padding: 24px;
  max-width: 360px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.lp-delete-modal p {
  margin: 0 0 20px 0;
  font-size: 15px;
  color: #374151;
}

.lp-delete-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.lp-delete-btn {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.lp-delete-cancel {
  background: #f3f4f6;
  color: #374151;
}

.lp-delete-ok {
  background: #dc2626;
  color: #fff;
}

.lp-delete-ok:hover {
  background: #b91c1c;
}
</style>
