<template>
  <div class="learning-path-manage-page">
    <header class="page-header">
      <router-link to="/twin-study" class="page-back">← 返回伴学</router-link>
      <h1 class="page-title">学习路径管理</h1>
      <p class="page-desc">查看、编辑或删除已保存的学习路径</p>
    </header>
    <LearningPathList
      :list="list"
      :loading="loading"
      @view="openDetail"
      @delete="confirmDelete"
    />
    <LearningPathDetailModal
      :visible="detailVisible"
      :path-id="selectedPathId"
      :userId="userId"
      @update:visible="detailVisible = $event"
      @updated="fetchList"
    />
    <Teleport to="body">
      <div v-if="deleteConfirm" class="path-delete-mask" @click.self="deleteConfirm = null">
        <div class="path-delete-modal">
          <p>确定要删除「{{ deleteConfirm.topic || '该路径' }}」吗？</p>
          <div class="path-delete-actions">
            <button type="button" class="path-delete-btn path-delete-cancel" @click="deleteConfirm = null">取消</button>
            <button type="button" class="path-delete-btn path-delete-ok" @click="doDelete">删除</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { list as listApi, remove } from '../api/learningPath'
import LearningPathList from '../components/LearningPath/LearningPathList.vue'
import LearningPathDetailModal from '../components/LearningPath/LearningPathDetailModal.vue'
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

const userId = computed(() => getUserId())
const list = ref([])
const loading = ref(false)
const detailVisible = ref(false)
const selectedPathId = ref(null)
const deleteConfirm = ref(null)

const fetchList = async () => {
  const uid = userId.value
  if (uid == null) {
    list.value = []
    return
  }
  loading.value = true
  try {
    const data = await listApi(uid)
    list.value = Array.isArray(data) ? data : []
  } catch (e) {
    list.value = []
    ElMessage.error(e?.message || '加载列表失败')
  } finally {
    loading.value = false
  }
}

const openDetail = (item) => {
  selectedPathId.value = item?.id ?? null
  detailVisible.value = true
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
    if (selectedPathId.value === item.id) {
      detailVisible.value = false
      selectedPathId.value = null
    }
  } catch (e) {
    ElMessage.error(e?.message || '删除失败')
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.learning-path-manage-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #faf8ff 0%, #fff 120px);
  padding-bottom: 48px;
}

.page-header {
  padding: 24px 24px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-back {
  display: inline-block;
  margin-bottom: 12px;
  font-size: 14px;
  color: #7c3aed;
  text-decoration: none;
}

.page-back:hover {
  color: #9333ea;
  text-decoration: underline;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f1f1f;
}

.page-desc {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.path-delete-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
}

.path-delete-modal {
  background: #fff;
  border-radius: 14px;
  padding: 24px;
  max-width: 360px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.path-delete-modal p {
  margin: 0 0 20px 0;
  font-size: 15px;
  color: #374151;
}

.path-delete-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.path-delete-btn {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.path-delete-cancel {
  background: #f3f4f6;
  color: #374151;
}

.path-delete-ok {
  background: #dc2626;
  color: #fff;
}

.path-delete-ok:hover {
  background: #b91c1c;
}
</style>
