<template>
  <div class="ai-interview-session-page">
    <NavBar :transparent="false" />

    <main class="ai-interview-session-main">
      <div v-if="!sessionId && !loadError" class="session-loading">
        <div class="session-loading-spinner"></div>
        <p>正在进入面试...</p>
      </div>
      <div v-else-if="loadError" class="session-error">
        <p>{{ loadError }}</p>
        <button type="button" class="btn-back" @click="goBack">返回面试配置</button>
      </div>
      <div v-else class="session-wrap">
        <PollingInterviewSession
          v-if="config.method === 'POLLING'"
          :session-id="sessionId"
          :config="config"
          @end="onEnd"
        />
        <RealtimeInterviewSession
          v-else-if="config.method === 'REALTIME'"
          :session-id="sessionId"
          :config="config"
          :user-id="userIdForWs"
          @end="onEnd"
        />
        <InterviewSession
          v-else
          :config="config"
          :seed-questions="effectiveSeedQuestions"
          @end="onEnd"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import PollingInterviewSession from '../components/AIInterview/session/PollingInterviewSession.vue'
import RealtimeInterviewSession from '../components/AIInterview/session/RealtimeInterviewSession.vue'
import InterviewSession from '../components/AIInterview/InterviewSession.vue'
import { mapInterviewReportToReview } from '../components/AIInterview/session/reportMapper'

const SESSION_STORAGE_KEY = 'ai-interview-session-state'

const route = useRoute()
const router = useRouter()

const sessionId = ref(null)
const config = ref({
  resumeId: null,
  interviewType: 'MIXED',
  language: 'zh-CN',
  difficulty: 'MID',
  persona: 'mentor',
  durationMinutes: 20,
  method: 'POLLING',
  retestMode: null,
})
const seedQuestions = ref([])
const userIdForWs = ref(null)
const loadError = ref('')

const effectiveSeedQuestions = computed(() => seedQuestions.value || [])

function loadSessionState() {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return
    const data = JSON.parse(raw)
    if (data && typeof data === 'object') {
      if (data.sessionId != null) sessionId.value = data.sessionId
      if (data.config && typeof data.config === 'object') config.value = { ...config.value, ...data.config }
      if (Array.isArray(data.seedQuestions)) seedQuestions.value = data.seedQuestions
    }
  } catch (_) {
    // ignore
  }
}

onMounted(() => {
  const q = route.query?.sessionId || route.params?.sessionId
  if (q) sessionId.value = q
  try {
    const u = JSON.parse(localStorage.getItem('userInfo') || '{}')
    userIdForWs.value = u?.userId ?? u?.id ?? u?.user_id ?? u?.userID ?? null
  } catch (_) {
    userIdForWs.value = null
  }
  loadSessionState()
  if (!sessionId.value) {
    loadError.value = '缺少面试会话信息，请从面试配置页重新开始。'
  }
})

function goBack() {
  sessionStorage.removeItem(SESSION_STORAGE_KEY)
  router.replace('/career/ai-interview')
}

const PENDING_REVIEW_KEY = 'ai-interview-pending-review'

function onEnd(payload) {
  if (payload?.generateReport === false) {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    router.replace('/career/ai-interview')
    return
  }
  const reportJson = payload?.report?.reportJson || payload?.reportJson || null
  let review = null
  if (reportJson) {
    review = mapInterviewReportToReview({
      reportJson,
      sessionId: payload?.sessionId,
      config: payload?.config || config.value,
      meta: payload?.meta,
      messages: payload?.messages || [],
    })
  }
  if (review) {
    try {
      sessionStorage.setItem(PENDING_REVIEW_KEY, JSON.stringify(review))
      const HISTORY_KEY = 'ai_interview_history_v1'
      const raw = localStorage.getItem(HISTORY_KEY)
      const arr = raw ? JSON.parse(raw) : []
      const list = Array.isArray(arr) ? arr : []
      list.unshift(review)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 50)))
    } catch (_) {}
  }
  sessionStorage.removeItem(SESSION_STORAGE_KEY)
  router.replace('/career/ai-interview')
}
</script>

<style scoped>
.ai-interview-session-page {
  min-height: 100vh;
  padding: 72px 32px 24px;
  background:
    radial-gradient(circle at top, #eef2ff 0, #f9fafb 38%, #ffffff 100%),
    linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(236, 72, 153, 0.04));
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ai-interview-session-main {
  max-width: 1120px;
  width: 100%;
  height: calc(100vh - 96px);
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.session-loading,
.session-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px 24px;
  color: #64748b;
}

.session-loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(148, 163, 184, 0.3);
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: session-spin 0.8s linear infinite;
}

@keyframes session-spin {
  to { transform: rotate(360deg); }
}

.btn-back {
  padding: 10px 20px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.6);
  background: #fff;
  color: #4f46e5;
  font-weight: 700;
  cursor: pointer;
}

.btn-back:hover {
  background: #eef2ff;
}

.session-wrap {
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.session-wrap > * {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

@media (max-width: 960px) {
  .ai-interview-session-page {
    padding-inline: 16px;
  }
}
</style>
