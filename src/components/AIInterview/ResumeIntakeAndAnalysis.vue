<template>
  <section class="ai-section">
    <div class="section-header">
      <div class="section-header-left">
        <h2 class="section-title">一、准备你的简历</h2>
        <p class="section-subtitle">
          上传或一键调用平台简历，马上生成建议与问题清单。
        </p>
      </div>
    </div>

    <div class="grid">
      <ResumeSourceCard
        v-model:resumeSource="modelSource"
        :selected-file-name="selectedFileName"
        :has-platform-resume="hasPlatformResume"
        :selected-resume-id="selectedResumeId"
        :uploading="uploading"
        :user-id="effectiveUserId"
        @resume="$emit('resume')"
        @pickFile="openFilePicker"
        @history="historyOpen = true"
        @analyze="analyze"
      />

      <ResumeAnalysisCard
        :loading="loading"
        :result="result"
        :resume-source="modelSource"
        :target-role="targetRole"
        :target-level="targetLevel"
        @update:targetRole="targetRole = $event"
        @update:targetLevel="targetLevel = $event"
        @goto-interview="$emit('gotoInterview')"
      />
    </div>

    <ResumeHistoryModal v-model="historyOpen" :user-id="effectiveUserId" @select="handleSelectHistory" />

    <input
      ref="fileInputRef"
      type="file"
      class="hidden"
      accept=".pdf,.doc,.docx,.md,.txt"
      @change="handleFileChange"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import ResumeSourceCard from './resume/ResumeSourceCard.vue'
import ResumeAnalysisCard from './resume/ResumeAnalysisCard.vue'
import ResumeHistoryModal from './resume/ResumeHistoryModal.vue'
import { aiInterviewApi } from '../../api/aiInterview'

const props = defineProps({
  resumeSource: { type: String, default: 'PLATFORM' },
  analysisResult: { type: Object, default: null },
})

const emit = defineEmits(['update:resumeSource', 'analysis', 'resume', 'gotoInterview'])

const fileInputRef = ref(null)
const selectedFileName = ref('')
const loading = ref(false)
const uploading = ref(false)
const result = ref(props.analysisResult)
const platformResume = ref(null)
const selectedResumeId = ref(null) // 后端 resumeId（用于分析接口）
const historyOpen = ref(false)
const targetRole = ref('')
const targetLevel = ref('')

const modelSource = computed({
  get: () => props.resumeSource,
  set: (val) => emit('update:resumeSource', val),
})

const hasPlatformResume = computed(() => !!platformResume.value)
const effectiveUserId = computed(() => {
  const user = JSON.parse(localStorage.getItem('userInfo') || '{}')
  // 后端文档：未登录需要 userId；已登录可不传。这里优先不传，除非本地明确有数值/字符串 id。
  return user?.userId ?? null
})

watch(
  () => props.analysisResult,
  (val) => {
    result.value = val
  }
)

const canAnalyze = computed(() => {
  if (loading.value || uploading.value) return false
  if (modelSource.value === 'PLATFORM') return Boolean(selectedResumeId.value)
  return Boolean(selectedResumeId.value) || Boolean(selectedFileName.value)
})

const openFilePicker = () => fileInputRef.value?.click?.()

const handleFileChange = (event) => {
  const files = event?.target?.files
  if (!files || !files.length) {
    selectedFileName.value = ''
    return
  }
  selectedFileName.value = files[0].name
  uploadResume(files[0])
}

const loadPlatformResume = () => {
  try {
    const raw = localStorage.getItem('resumeData')
    if (!raw) {
      platformResume.value = null
      return
    }
    const data = JSON.parse(raw)
    platformResume.value = data && typeof data === 'object' ? data : null
  } catch {
    platformResume.value = null
  }
}

const safeJsonParse = (raw) => {
  if (!raw) return null
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch {
    return null
  }
}

// 将后端 analysisJson 归一化为当前 UI 需要的数据结构
const normalizeAnalysis = (analysisJson) => {
  const obj = safeJsonParse(analysisJson) || {}
  const strengths = obj.strengths || obj.advantages || obj.highlights || []
  const questions = obj.questions || obj.interviewQuestions || obj.possibleQuestions || []
  const suggestions = obj.suggestions || obj.matchingSuggestions || obj.roleSuggestions || []

  const toTextArr = (x) => (Array.isArray(x) ? x : []).map((t) => String(t || '').trim()).filter(Boolean)
  const normalizeSuggestion = (s) => {
    if (!s) return null
    if (typeof s === 'string') {
      return { tag: '建议', title: s, desc: '' }
    }
    return {
      tag: s.tag || s.category || '建议',
      title: s.title || s.summary || s.name || '建议',
      desc: s.desc || s.detail || s.content || ''
    }
  }
  const normalizeQuestion = (q) => {
    if (!q) return null
    if (typeof q === 'string') return { question: q, hint: '' }
    return { question: q.question || q.text || q.title || '', hint: q.hint || q.tip || q.reason || '' }
  }

  const normalized = {
    strengths: toTextArr(strengths),
    matchingSuggestions: (Array.isArray(suggestions) ? suggestions : []).map(normalizeSuggestion).filter(Boolean),
    resumeQuestions: (Array.isArray(questions) ? questions : []).map(normalizeQuestion).filter(Boolean)
  }
  return normalized
}

const uploadResume = async (file) => {
  if (!file || uploading.value) return
  uploading.value = true
  try {
    const res = await aiInterviewApi.uploadResume({
      file,
      position: '',
      experienceYears: '',
      userId: effectiveUserId.value
    })
    selectedResumeId.value = res?.resumeId ?? null
  } finally {
    uploading.value = false
  }
}

const ensurePlatformResumeUploaded = async () => {
  // 平台简历这里先走“上传接口”：将平台简历 JSON 转成 txt，保证后端有 resumeId 可分析
  if (selectedResumeId.value) return selectedResumeId.value
  const data = platformResume.value
  const blob = new Blob([JSON.stringify(data || {}, null, 2)], { type: 'text/plain' })
  const file = new File([blob], 'platform-resume.txt', { type: 'text/plain' })
  await uploadResume(file)
  return selectedResumeId.value
}

const analyze = async () => {
  if (!canAnalyze.value) return
  loading.value = true
  result.value = null
  try {
    if (modelSource.value === 'PLATFORM') {
      await ensurePlatformResumeUploaded()
    }
    if (!selectedResumeId.value) return
    const res = await aiInterviewApi.analyzeResume(selectedResumeId.value, {
      targetRole: targetRole.value,
      targetLevel: targetLevel.value,
      userId: effectiveUserId.value
    })
    const normalized = normalizeAnalysis(res?.analysisJson)
    const wrapped = {
      ...normalized,
      source: modelSource.value,
      resumeId: selectedResumeId.value
    }
    result.value = wrapped
    emit('analysis', wrapped)
  } catch (e) {
    result.value = {
      source: modelSource.value,
      resumeId: selectedResumeId.value,
      strengths: [],
      matchingSuggestions: [],
      resumeQuestions: [
        { question: '简历分析接口调用失败，请稍后重试', hint: e?.message || '' }
      ]
    }
    emit('analysis', result.value)
  } finally {
    loading.value = false
  }
}

const handleSelectHistory = (resume) => {
  if (!resume) return
  modelSource.value = 'UPLOAD'
  selectedResumeId.value = resume.resumeId
  selectedFileName.value = resume.originalFilename || `简历 #${resume.resumeId}`
}

onMounted(() => {
  loadPlatformResume()
  window.addEventListener('storage', loadPlatformResume)
})
</script>

<style scoped>
.ai-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

.section-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0 0;
}


.grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(0, 1.35fr);
  gap: 20px;
}

.card {
  background: #ffffff;
  border-radius: 20px;
  padding: 18px 18px 20px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.card-header {
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}


.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option {
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  padding: 10px 10px 12px;
  background: #f9fafb;
  display: flex;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease,
    transform 0.18s ease;
}

.option.active {
  background: #ffffff;
  border-color: rgba(129, 140, 248, 0.9);
  box-shadow: 0 12px 32px rgba(129, 140, 248, 0.28);
  transform: translateY(-1px);
}

.radio {
  margin-right: 8px;
  margin-top: 6px;
}

.option-body {
  flex: 1;
  min-width: 0;
}

.option-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.option-main {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
  font-weight: 600;
}


.resume-source-status {
  margin-top: 4px;
  font-size: 11px;
  color: #16a34a;
}

.resume-source-status.warn {
  color: #ea580c;
}

.link {
  margin-top: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(191, 219, 254, 0.9);
  background: rgba(239, 246, 255, 0.85);
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease;
}

.link:hover {
  background: #dbeafe;
  border-color: #60a5fa;
}

.hidden {
  display: none;
}

.summary {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 12px;
  padding: 10px 10px;
  border-radius: 14px;
  background: #f9fafb;
}

.summary-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}

.summary-main {
  font-size: 12px;
  color: #111827;
}

.summary-placeholder {
  color: #9ca3af;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}


.btn-primary,
.btn-secondary {
  border-radius: 999px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: #f9fafb;
  box-shadow: 0 14px 30px rgba(79, 70, 229, 0.32);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 40px rgba(79, 70, 229, 0.4);
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

.empty {
  padding: 22px 12px 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, #eff6ff, #fefce8);
  text-align: left;
}

.empty-icon {
  font-size: 24px;
  margin-bottom: 6px;
}

.empty-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

 .empty-desc {
   font-size: 12px;
   color: #6b7280;
   margin: 4px 0 0;
 }

@media (max-width: 960px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .actions {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

