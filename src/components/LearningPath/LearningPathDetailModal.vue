<template>
  <Teleport to="body">
    <div v-if="visible" class="path-detail-mask" @click.self="handleClose">
      <div class="path-detail-modal">
        <div class="path-detail-header">
          <span class="path-detail-title">{{ pathDetail?.topic || '学习路径详情' }}</span>
          <button type="button" class="path-detail-close" aria-label="关闭" @click="handleClose">×</button>
        </div>
        <div class="path-detail-body">
          <div v-if="loading" class="path-detail-loading">加载中...</div>
          <template v-else-if="pathDetail && pathJson">
            <p v-if="pathDetail.description" class="path-detail-desc">{{ pathDetail.description }}</p>
            <div class="path-detail-mindmap-wrap">
              <LearningPathMindmap :pathJson="pathJson" />
            </div>
            <div class="path-detail-actions">
              <button type="button" class="path-detail-btn path-detail-edit" @click="showEdit = true">编辑 JSON</button>
            </div>
          </template>
          <div v-else-if="error" class="path-detail-error">{{ error }}</div>
        </div>
      </div>
      <!-- 编辑 JSON 弹层 -->
      <div v-if="showEdit && pathJson" class="path-edit-layer">
        <div class="path-edit-header">
          <span>编辑路径 JSON</span>
          <button type="button" class="path-edit-close" @click="showEdit = false">×</button>
        </div>
        <textarea v-model="editJsonStr" class="path-edit-textarea" spellcheck="false"></textarea>
        <div class="path-edit-footer">
          <button type="button" class="path-edit-btn path-edit-cancel" @click="showEdit = false">取消</button>
          <button type="button" class="path-edit-btn path-edit-save" :disabled="saving" @click="handleUpdateJson">保存</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { getById, getJson, updateJson } from '../../api/learningPath'
import LearningPathMindmap from './LearningPathMindmap.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  pathId: { type: String, default: null },
  userId: { type: [Number, String], default: null }
})

const emit = defineEmits(['update:visible', 'updated'])

const pathDetail = ref(null)
const pathJson = ref(null)
const loading = ref(false)
const error = ref(null)
const showEdit = ref(false)
const editJsonStr = ref('')
const saving = ref(false)

watch([() => props.visible, () => props.pathId], async ([v, id]) => {
  if (!v || !id) {
    pathDetail.value = null
    pathJson.value = null
    error.value = null
    showEdit.value = false
    return
  }
  loading.value = true
  error.value = null
  try {
    const [detail, jsonData] = await Promise.all([
      getById(id, props.userId),
      getJson(id, props.userId)
    ])
    pathDetail.value = detail || null
    pathJson.value = jsonData && Array.isArray(jsonData.nodes) ? jsonData : null
    if (!pathJson.value) error.value = '无法加载路径数据'
    else editJsonStr.value = JSON.stringify(pathJson.value, null, 2)
  } catch (e) {
    error.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}, { immediate: true })

const handleClose = () => {
  emit('update:visible', false)
}

const handleUpdateJson = async () => {
  let parsed
  try {
    parsed = JSON.parse(editJsonStr.value)
  } catch (e) {
    error.value = 'JSON 格式无效'
    return
  }
  if (!parsed || !Array.isArray(parsed.nodes)) {
    error.value = '需包含 nodes 数组'
    return
  }
  saving.value = true
  error.value = null
  try {
    const res = await updateJson(props.pathId, { nodes: parsed.nodes }, props.userId)
    if (res && (res.code === 0 || res.code === undefined)) {
      pathJson.value = { nodes: parsed.nodes }
      showEdit.value = false
      emit('updated')
    } else {
      error.value = res?.message || '更新失败'
    }
  } catch (e) {
    error.value = e?.message || '更新失败'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.path-detail-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.path-detail-modal {
  width: 90%;
  max-width: 640px;
  max-height: 85vh;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.path-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.path-detail-title {
  font-size: 17px;
  font-weight: 600;
  color: #1f1f1f;
}

.path-detail-close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  font-size: 22px;
  color: #6b7280;
  cursor: pointer;
  border-radius: 6px;
}

.path-detail-close:hover {
  background: #f3f4f6;
  color: #1f1f1f;
}

.path-detail-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.path-detail-loading,
.path-detail-error {
  text-align: center;
  padding: 24px;
  color: #6b7280;
}

.path-detail-error {
  color: #dc2626;
}

.path-detail-desc {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.path-detail-mindmap-wrap {
  margin-bottom: 16px;
  padding: 12px;
  background: #faf8ff;
  border-radius: 12px;
  border: 1px solid rgba(147, 51, 234, 0.1);
}

.path-detail-actions {
  display: flex;
  gap: 10px;
}

.path-detail-btn {
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
  color: #fff;
}

.path-detail-btn:hover {
  background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
}

.path-edit-layer {
  position: absolute;
  inset: 0;
  background: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.path-edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
}

.path-edit-close {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
}

.path-edit-textarea {
  flex: 1;
  min-height: 200px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-family: monospace;
  font-size: 13px;
  resize: none;
}

.path-edit-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}

.path-edit-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: none;
}

.path-edit-cancel {
  background: #f3f4f6;
  color: #374151;
}

.path-edit-save {
  background: #9333ea;
  color: #fff;
}

.path-edit-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
