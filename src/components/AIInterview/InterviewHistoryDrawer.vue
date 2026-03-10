<template>
  <Teleport to="body">
    <div v-if="modelValue" class="overlay" @click="$emit('update:modelValue', false)">
      <div class="drawer" @click.stop>
        <div class="drawer-header">
          <div class="drawer-title">面试记录</div>
          <div class="drawer-actions">
            <button type="button" class="btn-ghost" @click="clearAll" :disabled="records.length === 0">清空</button>
            <button type="button" class="btn-close" @click="$emit('update:modelValue', false)" aria-label="关闭">✕</button>
          </div>
        </div>

        <div class="drawer-body">
          <div class="list">
            <div v-if="records.length === 0" class="empty">
              <div class="empty-icon">🗂️</div>
              <div class="empty-title">还没有面试记录</div>
              <div class="empty-desc">完成一次面试后，会自动把报告保存在这里。</div>
            </div>

            <button
              v-for="r in records"
              :key="r.id"
              type="button"
              class="row"
              :class="{ active: selected?.id === r.id }"
              @click="selected = r"
            >
              <div class="row-top">
                <div class="row-title">{{ r.meta.jobRoleLabel }}</div>
                <div class="row-score">{{ r.overall.score }}</div>
              </div>
              <div class="row-sub">
                <span class="pill">{{ r.meta.difficultyLabel }}</span>
                <span class="pill subtle">{{ r.meta.durationMin }} 分钟</span>
                <span class="pill subtle">{{ formatTime(r.createdAt) }}</span>
              </div>
            </button>
          </div>

          <div class="detail">
            <div v-if="!selected" class="detail-empty">
              <div class="detail-empty-title">选择一条记录</div>
              <div class="detail-empty-desc">右侧会展示该次面试的详细报告与建议。</div>
            </div>

            <div v-else class="detail-inner">
              <div class="detail-top">
                <div class="detail-top-left">
                  <div class="detail-name">{{ selected.meta.jobRoleLabel }}</div>
                  <div class="detail-meta">
                    <span class="pill">{{ selected.meta.difficultyLabel }}</span>
                    <span class="pill subtle">{{ selected.meta.durationMin }} 分钟</span>
                    <span class="pill subtle">{{ formatTime(selected.createdAt) }}</span>
                  </div>
                </div>
                <div class="detail-top-right">
                  <button type="button" class="btn-ghost danger" @click="removeOne(selected.id)">删除</button>
                </div>
              </div>

              <ReviewStage
                :review="selected"
                :embedded="true"
                @retest="(p) => $emit('retest', p)"
                @resume="$emit('resume')"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import ReviewStage from './ReviewStage.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
defineEmits(['update:modelValue', 'retest', 'resume'])

const STORAGE_KEY = 'ai_interview_history_v1'

const records = ref([])
const selected = ref(null)

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const arr = raw ? JSON.parse(raw) : []
    records.value = Array.isArray(arr) ? arr : []
  } catch (_) {
    records.value = []
  }
}

const persist = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.value))
  } catch (_) {}
}

const clearAll = () => {
  records.value = []
  selected.value = null
  persist()
}

const removeOne = (id) => {
  records.value = records.value.filter((x) => x?.id !== id)
  if (selected.value?.id === id) selected.value = records.value[0] || null
  persist()
}

const pad2 = (n) => String(n).padStart(2, '0')
const formatTime = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = pad2(d.getMonth() + 1)
  const day = pad2(d.getDate())
  const hh = pad2(d.getHours())
  const mm = pad2(d.getMinutes())
  return `${y}-${m}-${day} ${hh}:${mm}`
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    load()
    selected.value = records.value[0] || null
  }
)

onMounted(load)
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(8px);
  z-index: 3000;
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
}

.drawer {
  width: min(1120px, calc(100vw - 18px));
  height: 100%;
  background: rgba(255, 255, 255, 0.92);
  border-left: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: -24px 0 60px rgba(2, 6, 23, 0.35);
  display: flex;
  flex-direction: column;
}

.drawer-header {
  padding: 16px 16px 14px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drawer-title {
  font-size: 14px;
  font-weight: 900;
  color: #111827;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.drawer-actions {
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

.btn-ghost.danger {
  border-color: rgba(220, 38, 38, 0.25);
  background: rgba(220, 38, 38, 0.06);
  color: #b91c1c;
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

.drawer-body {
  flex: 1;
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 12px;
  padding: 12px;
  overflow: hidden;
}

.list {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(226, 232, 240, 0.9);
  overflow: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.row-title {
  font-size: 13px;
  font-weight: 900;
  color: #111827;
  line-height: 1.4;
}

.row-score {
  width: 34px;
  height: 34px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.86);
  color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 13px;
  border: 1px solid rgba(148, 163, 184, 0.35);
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

.empty {
  padding: 18px 12px 14px;
  border-radius: 18px;
  background: linear-gradient(135deg, #eff6ff, #fefce8);
  border: 1px solid rgba(226, 232, 240, 0.9);
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

.detail {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(226, 232, 240, 0.9);
  overflow: auto;
  padding: 10px;
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
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
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

@media (max-width: 960px) {
  .drawer-body {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>

