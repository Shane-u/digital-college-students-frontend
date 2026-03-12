<template>
  <Teleport to="body">
    <div v-if="modelValue" class="overlay" @click="$emit('update:modelValue', false)">
      <div class="drawer" @click.stop>
        <div class="drawer-header">
          <div class="drawer-title">面试记录</div>
          <div class="drawer-actions">
            <button
              type="button"
              class="btn-ghost"
              @click="clearAll"
              :disabled="records.length === 0 || isRemote"
              :title="isRemote ? '远端记录暂不支持清空' : ''"
            >
              清空
            </button>
            <button type="button" class="btn-close" @click="$emit('update:modelValue', false)" aria-label="关闭">✕</button>
          </div>
        </div>

        <div class="drawer-body">
          <div class="list">
            <div v-if="loading" class="loading">加载中…</div>
            <div v-else-if="remoteError" class="tip">{{ remoteError }}（已回退到本地记录）</div>
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
              @click="selectRecord(r)"
            >
              <div class="row-top">
                <div class="row-title">{{ getRowTitle(r) }}</div>
                <div class="row-score">{{ getRowScore(r) }}</div>
              </div>
              <div class="row-sub">
                <span v-if="getRowPill1(r)" class="pill">{{ getRowPill1(r) }}</span>
                <span v-if="getRowPill2(r)" class="pill subtle">{{ getRowPill2(r) }}</span>
                <span class="pill subtle">{{ formatTime(getRowTime(r)) }}</span>
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
                  <div class="detail-name">{{ getDetailTitle(selected) }}</div>
                  <div class="detail-meta">
                    <span v-if="getRowPill1(selected)" class="pill">{{ getRowPill1(selected) }}</span>
                    <span v-if="getRowPill2(selected)" class="pill subtle">{{ getRowPill2(selected) }}</span>
                    <span class="pill subtle">{{ formatTime(getRowTime(selected)) }}</span>
                  </div>
                </div>
                <div class="detail-top-right">
                  <button
                    type="button"
                    class="btn-ghost danger"
                    :disabled="isRemote"
                    :title="isRemote ? '远端记录暂不支持删除' : ''"
                    @click="removeOne(selected.id)"
                  >
                    删除
                  </button>
                </div>
              </div>

              <div v-if="selected?.source === 'REMOTE' && selected.detailLoading" class="detail-loading">加载报告详情中…</div>
              <div v-else-if="selected?.source === 'REMOTE' && selected.detailError" class="detail-error">{{ selected.detailError }}</div>
              <ReviewStage
                v-else
                :review="selected?.source === 'REMOTE' ? (selected.review || fallbackEmptyReview) : selected"
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
import { aiInterviewApi } from '../../api/aiInterview'
import { mapInterviewReportToReview } from './session/reportMapper'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
defineEmits(['update:modelValue', 'retest', 'resume'])

const STORAGE_KEY = 'ai_interview_history_v1'

const records = ref([])
const selected = ref(null)
const isRemote = ref(false)
const loading = ref(false)
const remoteError = ref('')

const fallbackEmptyReview = {
  overall: { score: 0, summary: '' },
  dimensions: [],
  strengths: [],
  weaknesses: [],
  questionSummaries: [],
  suggestions: [],
}

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
  if (isRemote.value) return
  records.value = []
  selected.value = null
  persist()
}

const removeOne = (id) => {
  if (isRemote.value) return
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

const toTimestamp = (t) => {
  const ms = Date.parse(String(t || ''))
  return Number.isFinite(ms) ? ms : 0
}

const loadRemoteList = async () => {
  loading.value = true
  remoteError.value = ''
  try {
    const list = await aiInterviewApi.listReports({ limit: 50 })
    const arr = Array.isArray(list) ? list : []
    if (arr.length) {
      isRemote.value = true
      records.value = arr.map((x) => ({
        id: String(x.reportId ?? x.sessionId ?? Math.random()),
        source: 'REMOTE',
        reportId: x.reportId ?? null,
        sessionId: x.sessionId ?? null,
        resumeId: x.resumeId ?? null,
        createdAt: toTimestamp(x.createTime),
        updatedAt: toTimestamp(x.updateTime),
        review: null,
        detailLoading: false,
        detailError: '',
      }))
    } else {
      // 远端无数据则回退本地
      isRemote.value = false
      load()
    }
  } catch (e) {
    // 远端失败则回退本地
    isRemote.value = false
    remoteError.value = e?.message || '获取历史报告失败'
    load()
  } finally {
    loading.value = false
  }
}

const ensureRemoteDetail = async (rec) => {
  if (!rec || rec.source !== 'REMOTE') return
  if (rec.review) return
  if (!rec.sessionId) {
    rec.detailError = '缺少 sessionId，无法获取报告详情'
    return
  }
  rec.detailLoading = true
  rec.detailError = ''
  try {
    const report = await aiInterviewApi.getReport(rec.sessionId)
    const reportJson = report?.reportJson ?? report?.report ?? report
    rec.review = mapInterviewReportToReview({
      reportJson,
      sessionId: rec.sessionId,
      config: {},
      meta: null,
      messages: [],
    })
  } catch (e) {
    rec.detailError = e?.message || '获取报告详情失败'
  } finally {
    rec.detailLoading = false
  }
}

const selectRecord = async (r) => {
  selected.value = r
  if (r?.source === 'REMOTE') await ensureRemoteDetail(r)
}

const getRowTime = (r) => r?.createdAt || 0

const getRowTitle = (r) => {
  if (!r) return ''
  if (r.source === 'REMOTE') {
    if (r.review?.overall?.score != null) return `报告 #${r.reportId ?? r.sessionId ?? ''}`
    return `报告 #${r.reportId ?? r.sessionId ?? ''}`
  }
  return r?.meta?.jobRoleLabel || '面试报告'
}

const getRowScore = (r) => {
  if (!r) return '--'
  if (r.source === 'REMOTE') {
    const s = r.review?.overall?.score
    return s == null ? '--' : String(s)
  }
  return String(r?.overall?.score ?? '--')
}

const getRowPill1 = (r) => {
  if (!r) return ''
  if (r.source === 'REMOTE') {
    return r.resumeId != null ? `简历：${r.resumeId}` : ''
  }
  return r?.meta?.difficultyLabel || ''
}

const getRowPill2 = (r) => {
  if (!r) return ''
  if (r.source === 'REMOTE') {
    return r.sessionId != null ? `会话：${r.sessionId}` : ''
  }
  const d = r?.meta?.durationMin
  return d != null ? `${d} 分钟` : ''
}

const getDetailTitle = (r) => {
  if (!r) return ''
  if (r.source === 'REMOTE') return `报告 #${r.reportId ?? r.sessionId ?? ''}`
  return r?.meta?.jobRoleLabel || '面试报告'
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    loadRemoteList()
  }
)

onMounted(loadRemoteList)
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

