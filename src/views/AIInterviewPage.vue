<template>
  <div class="ai-interview-page">
    <NavBar :transparent="false" />

    <AIInterviewHero
      v-if="currentStage !== STAGES.INTERVIEW"
      :steps="orderedSteps"
      :current-stage="currentStage"
      @start="scrollToWorkflow"
      @resume="goToResumeEditor"
      @history="historyOpen = true"
    />

    <main ref="workflowRef" class="ai-interview-main">
      <ResumeIntakeAndAnalysis
        v-if="currentStage !== STAGES.INTERVIEW"
        v-model:resumeSource="resumeSource"
        v-model:selectedResumeId="selectedResumeId"
        v-model:selectedFileName="selectedFileName"
        :analysis-result="analysisResult"
        @resume="goToResumeEditor"
        @analysis="handleAnalysisDone"
        @resume-changed="handleResumeChanged"
        @goto-interview="goToInterviewStage"
      />

      <InterviewStage
        :analysis-result="analysisResult"
        @started="handleInterviewStarted"
        @ended="handleInterviewEnded"
        @resume="goToResumeEditor"
      />
    </main>

    <InterviewHistoryDrawer v-model="historyOpen" @resume="goToResumeEditor" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import NavBar from '../components/NavBar.vue'
import AIInterviewHero from '../components/AIInterview/AIInterviewHero.vue'
import ResumeIntakeAndAnalysis from '../components/AIInterview/ResumeIntakeAndAnalysis.vue'
import InterviewStage from '../components/AIInterview/InterviewStage.vue'
import InterviewHistoryDrawer from '../components/AIInterview/InterviewHistoryDrawer.vue'

const STORAGE_KEY = 'ai-interview-resume-state'

const router = useRouter()

const STAGES = {
  RESUME: 'RESUME',
  ANALYSIS: 'ANALYSIS',
  INTERVIEW: 'INTERVIEW',
  REVIEW: 'REVIEW',
}

const orderedSteps = [
  {
    key: STAGES.RESUME,
    title: '上传 / 调用简历',
    desc: '上传或一键调用平台简历。',
  },
  {
    key: STAGES.ANALYSIS,
    title: '简历分析与岗位匹配',
    desc: '生成岗位建议 + 问题清单。',
  },
  {
    key: STAGES.INTERVIEW,
    title: '模拟面试（视频 + 问答）',
    desc: '左视频右对话，记录问答。',
  },
  {
    key: STAGES.REVIEW,
    title: '详细评价 + 错题本复盘',
    desc: '报告 + 错题本 + 简历建议。',
  },
]

const workflowRef = ref(null)
const currentStage = ref(STAGES.RESUME)
const historyOpen = ref(false)

const resumeSource = ref('PLATFORM')
const analysisResult = ref(null)
const selectedResumeId = ref(null)
const selectedFileName = ref('')

function loadPersistedState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const data = JSON.parse(raw)
    if (data && typeof data === 'object') {
      if (data.analysisResult != null) analysisResult.value = data.analysisResult
      if (data.resumeSource != null) resumeSource.value = data.resumeSource
      if (data.selectedResumeId != null) selectedResumeId.value = data.selectedResumeId
      if (data.selectedFileName != null) selectedFileName.value = data.selectedFileName
    }
  } catch (_) {
    // ignore
  }
}

function savePersistedState() {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        analysisResult: analysisResult.value,
        resumeSource: resumeSource.value,
        selectedResumeId: selectedResumeId.value,
        selectedFileName: selectedFileName.value,
      })
    )
  } catch (_) {
    // ignore
  }
}

onMounted(() => {
  loadPersistedState()
})

const scrollToWorkflow = () => {
  workflowRef.value?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
}

const goToResumeEditor = () => {
  router.push('/career/resume')
}

const handleAnalysisDone = (payload) => {
  analysisResult.value = payload
  if (payload?.resumeId != null) selectedResumeId.value = payload.resumeId
  if (payload?.originalFileName != null) selectedFileName.value = payload.originalFileName
  currentStage.value = STAGES.ANALYSIS
  savePersistedState()
}

const handleResumeChanged = ({ resumeId, fileName }) => {
  selectedResumeId.value = resumeId ?? null
  selectedFileName.value = fileName ?? ''
  analysisResult.value = null
  savePersistedState()
}

const goToInterviewStage = () => {
  currentStage.value = STAGES.INTERVIEW
  setTimeout(() => {
    const els = document.querySelectorAll('.ai-section')
    if (els && els[1]) els[1].scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 0)
}

const handleInterviewStarted = () => {
  currentStage.value = STAGES.INTERVIEW
}

const handleInterviewEnded = () => {
  currentStage.value = STAGES.REVIEW
}
</script>

<style scoped>
.ai-interview-page {
  min-height: 100vh;
  padding: 96px 32px 40px;
  background:
    radial-gradient(circle at top, #eef2ff 0, #f9fafb 38%, #ffffff 100%),
    linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(236, 72, 153, 0.04));
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ai-interview-main {
  max-width: 1120px;
  width: 100%;
}

@media (max-width: 960px) {
  .ai-interview-page {
    padding-inline: 16px;
  }
}
</style>
