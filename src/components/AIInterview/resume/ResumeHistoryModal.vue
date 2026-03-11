<template>
  <Teleport to="body">
    <div v-if="modelValue" class="overlay" @click="$emit('update:modelValue', false)">
      <div class="modal" @click.stop>
        <div class="header">
          <div class="title">历史简历</div>
          <div class="actions">
            <button type="button" class="btn-ghost" @click="refresh" :disabled="loading">刷新</button>
            <button type="button" class="btn-close" @click="$emit('update:modelValue', false)" aria-label="关闭">✕</button>
          </div>
        </div>

        <div class="body">
          <div class="left">
            <div v-if="loading" class="loading">
              <div class="spinner"></div>
              <div class="loading-text">正在加载历史简历...</div>
            </div>

            <div v-else-if="error" class="error">
              <div class="error-title">加载失败</div>
              <div class="error-desc">{{ error }}</div>
              <button type="button" class="btn-ghost" @click="refresh">重试</button>
            </div>

            <div v-else-if="items.length === 0" class="empty">
              <div class="empty-icon">🗂️</div>
              <div class="empty-title">暂无历史简历</div>
              <div class="empty-desc">上传过的简历会自动出现在这里。</div>
            </div>

            <button
              v-else
              v-for="r in items"
              :key="r.resumeId"
              type="button"
              class="row"
              :class="{ active: selected?.resumeId === r.resumeId }"
              @click="select(r)"
            >
              <div class="row-title">{{ r.originalFilename || `简历 #${r.resumeId}` }}</div>
              <div class="row-sub">
                <span class="pill">ID：{{ r.resumeId }}</span>
                <span v-if="r.fileUrl" class="pill subtle">可下载</span>
              </div>
            </button>
          </div>

          <div class="right">
            <div v-if="!selected" class="detail-empty">
              <div class="detail-empty-title">选择一份简历</div>
              <div class="detail-empty-desc">右侧会展示解析摘要，你也可以一键使用。</div>
            </div>

            <div v-else class="detail">
              <div class="detail-top">
                <div class="detail-name">{{ selected.originalFilename || `简历 #${selected.resumeId}` }}</div>
                <div class="detail-meta">
                  <span class="pill">ID：{{ selected.resumeId }}</span>
                  <a v-if="selected.fileUrl" class="pill link" :href="selected.fileUrl" target="_blank" rel="noopener noreferrer">
                    下载
                  </a>
                </div>
              </div>

              <div class="preview">
                <div class="preview-label">解析预览</div>
                <div class="preview-box">
                  <div v-if="selected.previewText" class="preview-text">{{ selected.previewText }}</div>
                  <div v-else class="preview-placeholder">该简历暂无预览内容（可能后端未返回 rawText）。</div>
                </div>
              </div>

              <div class="footer">
                <button type="button" class="btn-secondary" @click="$emit('update:modelValue', false)">取消</button>
                <button type="button" class="btn-primary" @click="useSelected">使用这份简历</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { aiInterviewApi } from '../../../api/aiInterview'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  userId: { type: [String, Number], default: null },
})

const emit = defineEmits(['update:modelValue', 'select'])

const loading = ref(false)
const error = ref('')
const items = ref([])
const selected = ref(null)

const effectiveUserId = computed(() => (props.userId == null || props.userId === '' ? null : props.userId))

const normalize = (r) => {
  const raw = r?.rawText || ''
  const previewText = String(raw).trim().slice(0, 280)
  return {
    ...r,
    previewText: previewText ? `${previewText}${raw.length > previewText.length ? '…' : ''}` : '',
  }
}

const refresh = async () => {
  loading.value = true
  error.value = ''
  try {
    const list = await aiInterviewApi.listResumes({ userId: effectiveUserId.value })
    items.value = (Array.isArray(list) ? list : []).map(normalize)
    selected.value = items.value[0] || null
  } catch (e) {
    error.value = e?.message || '请求失败'
    items.value = []
    selected.value = null
  } finally {
    loading.value = false
  }
}

const select = (r) => {
  selected.value = r
}

const useSelected = () => {
  if (!selected.value) return
  emit('select', selected.value)
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    refresh()
  }
)
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(8px);
  z-index: 3200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
}

.modal {
  width: min(1120px, 100%);
  height: min(640px, calc(100vh - 36px));
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 22px;
  box-shadow: 0 22px 60px rgba(2, 6, 23, 0.35);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 14px 16px 12px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.title {
  font-size: 14px;
  font-weight: 900;
  color: #111827;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-ghost {
  border-radius: 999px;
  padding: 6px 12px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #ffffff;
  color: #4b5563;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: background-color 0.16s ease, transform 0.16s ease;
}

.btn-ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-ghost:hover:not(:disabled) {
  background: #f1f5f9;
  transform: translateY(-1px);
}

.btn-close {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  transition: background-color 0.16s ease, transform 0.16s ease;
}

.btn-close:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}

.body {
  flex: 1;
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 12px;
  padding: 12px;
  overflow: hidden;
}

.left {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(226, 232, 240, 0.9);
  overflow: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.right {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(226, 232, 240, 0.9);
  overflow: auto;
  padding: 10px;
}

.row {
  text-align: left;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #f9fafb;
  padding: 10px 10px;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
}

.row:hover {
  transform: translateY(-1px);
  border-color: rgba(129, 140, 248, 0.7);
}

.row.active {
  background: #ffffff;
  border-color: rgba(129, 140, 248, 0.9);
  box-shadow: 0 12px 32px rgba(129, 140, 248, 0.18);
}

.row-title {
  font-size: 13px;
  font-weight: 900;
  color: #111827;
  line-height: 1.4;
}

.row-sub {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pill {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
  font-weight: 800;
}

.pill.subtle {
  background: rgba(148, 163, 184, 0.08);
  color: #6b7280;
}

.pill.link {
  text-decoration: none;
  border: 1px solid rgba(59, 130, 246, 0.25);
  background: rgba(239, 246, 255, 0.9);
  color: #2563eb;
}

.pill.link:hover {
  background: #dbeafe;
}

.loading,
.error,
.empty {
  padding: 18px 12px 14px;
  border-radius: 18px;
  background: linear-gradient(135deg, #eff6ff, #fefce8);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.error {
  background: linear-gradient(135deg, #fef2f2, #fff7ed);
}

.error-title {
  font-size: 13px;
  font-weight: 900;
  color: #111827;
}

.error-desc {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.7;
}

.empty-icon {
  font-size: 22px;
  margin-bottom: 6px;
}

.empty-title {
  font-size: 13px;
  font-weight: 900;
  color: #111827;
}

.empty-desc {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  line-height: 1.7;
}

.spinner {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 2px solid rgba(148, 163, 184, 0.4);
  border-top-color: #4f46e5;
  animation: spin 0.7s linear infinite;
  display: inline-block;
  vertical-align: middle;
  margin-right: 10px;
}

.loading-text {
  display: inline-block;
  font-size: 13px;
  color: #6b7280;
  vertical-align: middle;
}

.detail-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  text-align: center;
  padding: 18px;
}

.detail-empty-title {
  font-size: 14px;
  font-weight: 900;
  color: #111827;
}

.detail-empty-desc {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.7;
}

.detail-top {
  padding: 6px 6px 10px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  margin-bottom: 10px;
}

.detail-name {
  font-size: 14px;
  font-weight: 900;
  color: #111827;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.preview {
  padding: 10px 6px;
}

.preview-label {
  font-size: 12px;
  font-weight: 800;
  color: #475569;
}

.preview-box {
  margin-top: 8px;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #ffffff;
  padding: 10px 12px;
}

.preview-text {
  font-size: 12px;
  color: #111827;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

.preview-placeholder {
  font-size: 12px;
  color: #94a3b8;
}

.footer {
  padding: 10px 6px 6px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-primary,
.btn-secondary {
  border-radius: 999px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 800;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
  white-space: nowrap;
}

.btn-primary {
  color: #f9fafb;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  box-shadow: 0 14px 30px rgba(79, 70, 229, 0.28);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 40px rgba(79, 70, 229, 0.36);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #4b5563;
  border: 1px solid rgba(148, 163, 184, 0.6);
}

.btn-secondary:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 960px) {
  .body {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>

