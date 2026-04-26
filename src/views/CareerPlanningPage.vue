<template>
  <div class="career-planning-page" :class="{ 'career-planning-page--immersive': journeyPhase !== 'story' }">
    <NavBar :transparent="false" />

    <div class="cp-body" :class="{ 'cp-body--immersive': journeyPhase !== 'story' }">
      <CareerPlanningRail
        v-if="journeyPhase !== 'story'"
        :journey-phase="journeyPhase"
        :phase-index="phaseIndex"
        :has-assessment-result="hasAssessmentResult"
        :workflow-finished="workflowFinished"
        :is-immersive="journeyPhase !== 'story'"
      />

      <!-- 全屏：背景叙事 -->
      <CareerPlanningStoryPanel
        v-if="journeyPhase === 'story'"
        :hero-image-url="heroImageUrl"
        :assessment-loading="assessmentLoading"
        @start-assessment="enterAssessment"
        @open-history="openHistoryReport"
      />

      <!-- 全屏：职业测评（沉浸式） -->
      <CareerPlanningAssessmentPanel
        v-else-if="journeyPhase === 'assessment'"
        :assessment-loading="assessmentLoading"
        :assessment-error="assessmentError"
        :total-questions="totalQuestions"
        :current-question-index="currentQuestionIndex"
        :assessment-progress-percent="assessmentProgressPercent"
        :current-question="currentQuestion"
        :current-question-answer="currentQuestionAnswer"
        :is-last-question="isLastQuestion"
        @go-story="goToStory"
        @random-all="handleRandomAllChoices"
        @select-answer="selectAnswer"
        @prev-question="handlePrevQuestion"
        @next-question="handleNextQuestion"
      />

      <!-- 全屏：工作流（极简沉浸 + 等待动效） -->
      <CareerPlanningWorkflowPanel
        v-else-if="journeyPhase === 'workflow'"
        :workflow-launched="workflowLaunched"
        :workflow-finished="workflowFinished"
        :start-btn-disabled="startBtnDisabled"
        :has-assessment-result="hasAssessmentResult"
        :workflow-friendly-progress="workflowFriendlyProgress"
        :workflow-phase-percent="workflowPhasePercent"
        :workflow-anim-root-ref="workflowAnimRootRef"
        :workflow-indeterminate-fill-ref="workflowIndeterminateFillRef"
        @start="handleStart"
        @enter-report="enterReport"
      />

      <!-- 全屏：报告（沉浸式） -->
      <CareerPlanningReportPanel
        v-else
        :report-html="reportHtml"
        :links-html="linksHtml"
        @back="goToWorkflowStep"
      />
    </div>

    <Footer v-if="journeyPhase === 'story'" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch, watchEffect } from 'vue'
import { marked } from 'marked'
import { ElMessage } from 'element-plus'
import gsap from 'gsap'
import { useRoute, useRouter } from 'vue-router'
import request from '../api/request'
import Footer from '../components/Footer.vue'
import NavBar from '../components/NavBar.vue'
import heroImageUrl from '../assets/zhiyeguihua.gif'
import CareerPlanningRail from '../components/career-planning/CareerPlanningRail.vue'
import CareerPlanningStoryPanel from '../components/career-planning/CareerPlanningStoryPanel.vue'
import CareerPlanningAssessmentPanel from '../components/career-planning/CareerPlanningAssessmentPanel.vue'
import CareerPlanningWorkflowPanel from '../components/career-planning/CareerPlanningWorkflowPanel.vue'
import CareerPlanningReportPanel from '../components/career-planning/CareerPlanningReportPanel.vue'

marked.setOptions({
  breaks: true,
  gfm: true,
  tables: true,
  headerIds: false,
  mangle: false
})

/** 介绍页 | 测评 | 工作流 | 报告 — 各步全屏切换 */
const journeyPhase = ref('story')
const router = useRouter()
const route = useRoute()
const CAREER_PLANNING_BASE_PATH = '/career/planning'
const CAREER_PLANNING_FLOW_PATH = '/career/planning/assessment'

const userId = ref('')
const DEFAULT_WORKFLOW_INPUT = '我想咨询一下未来的我的竞赛和职业规划怎么样规划'

const workflowLaunched = ref(false)
const workflowFinished = ref(false)
const runInfo = ref('')
const currentStageText = ref('')
const reportHtml = ref('<div class="empty-state">暂无报告</div>')
const linksHtml = ref('')
const startBtnDisabled = ref(false)

const assessmentQuestions = ref([])
const assessmentLoading = ref(false)
const assessmentError = ref('')
const assessmentCompleted = ref(false)
const currentQuestionIndex = ref(0)
const answers = ref({})
const assessmentResult = ref(null)

const workflowNodes = ref({})

let es = null
let runId = null
let pollTimer = null

const CAREER_REPORT_MD_KEY = 'career_planning_report_markdown'
const CAREER_REPORT_LINKS_KEY = 'career_planning_report_links_html'

function stripReportIdLine(markdown) {
  if (!markdown) return ''
  return String(markdown)
    .split(/\r?\n/)
    .filter((line) => !/^\s*报告ID\s*[:：]\s*\S+\s*$/.test(line))
    .join('\n')
}

const STATUS_PATTERNS = [
  { pattern: /(失败|错误|异常)/, status: 'failed' },
  { pattern: /(正在|处理中|运行中|检索|生成)/, status: 'running' },
  { pattern: /(已完成|完成|成功)/, status: 'completed' },
  { pattern: /(待处理|未开始|等待|排队)/, status: 'pending' }
]

const STATUS_FALLBACK_LABEL = {
  running: '运行中',
  completed: '已完成',
  failed: '执行失败',
  pending: '待处理'
}

function normalizeStatusValue(value) {
  if (!value && value !== 0) return null
  if (typeof value === 'string') {
    const match = STATUS_PATTERNS.find((item) => item.pattern.test(value))
    return match ? match.status : null
  }
  if (typeof value === 'object' && value.status) {
    return value.status
  }
  return null
}

function getStatusLabel(value, normalizedStatus) {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    return value.label || value.status || ''
  }
  return STATUS_FALLBACK_LABEL[normalizedStatus] || ''
}

function isStatusDictionary(target) {
  if (!target || typeof target !== 'object' || Array.isArray(target)) return false
  const keys = Object.keys(target)
  if (!keys.length) return false
  return keys.every((key) => {
    const val = target[key]
    return typeof val === 'string' || (val && typeof val === 'object' && (val.status || val.label))
  })
}

const workflowDefaultBase = import.meta.env.DEV ? '/api' : ''
const workflowApiBase = (import.meta.env.VITE_WORKFLOW_API_BASE || workflowDefaultBase || '').replace(/\/$/, '')
const buildWorkflowUrl = (path = '') => `${workflowApiBase}${path}`

const phaseIndex = computed(() => {
  if (journeyPhase.value === 'assessment') return 0
  if (journeyPhase.value === 'workflow') return 1
  if (journeyPhase.value === 'report') return 2
  return -1
})

const workflowNodeKeys = computed(() => Object.keys(workflowNodes.value || {}))

/** 工作流节点名展示为人话（不暴露内部 id） */
function humanizeWorkflowNodeName(name) {
  if (!name) return ''
  const s = String(name).trim()
  if (/dify/i.test(s)) return '智能分析'
  if (/^system$/i.test(s)) return '系统'
  if (/sql/i.test(s)) return 'SQL查询'
  return s.replace(/_/g, ' ')
}

/** 当前进度一行文案（来自 SSE / 轮询，已脱敏） */
const workflowFriendlyProgress = computed(() => {
  const t = currentStageText.value
  if (!t) {
    if (startBtnDisabled.value && !workflowLaunched.value) return '正在启动智能引擎…'
    if (workflowLaunched.value) return '正在生成你的专属职业规划…'
    return '准备中…'
  }
  const prefix = '当前进度：'
  if (!t.startsWith(prefix)) return t
  const rest = t.slice(prefix.length)
  const parts = rest.split(/\s*—\s*/)
  const node = humanizeWorkflowNodeName(parts[0]?.trim() || '')
  const status = parts[1]?.trim() || ''
  if (node && status) return `${node} · ${status}`
  if (node) return node
  return rest
})

/** 有节点字典时估算整体完成度；否则为 null 显示不确定进度条 */
const workflowPhasePercent = computed(() => {
  const keys = workflowNodeKeys.value
  if (!keys.length) return null
  let completed = 0
  let running = 0
  for (const k of keys) {
    const n = normalizeStatusValue(workflowNodes.value[k])
    if (n === 'completed') completed++
    else if (n === 'running') running++
  }
  const total = keys.length
  const ratio = completed / total
  const bump = running ? 0.08 : 0
  return Math.min(98, Math.round(10 + ratio * 82 + bump * 100))
})

const workflowWaitActive = computed(() => {
  if (journeyPhase.value !== 'workflow' || workflowFinished.value) return false
  return startBtnDisabled.value || workflowLaunched.value
})

const workflowAnimRootRef = ref(null)
const workflowIndeterminateFillRef = ref(null)

let workflowGsapCtx = null

watchEffect(
  (onCleanup) => {
    if (!workflowWaitActive.value) {
      workflowGsapCtx?.revert()
      workflowGsapCtx = null
      return
    }
    nextTick(() => {
      workflowGsapCtx?.revert()
      workflowGsapCtx = null
      const root = workflowAnimRootRef.value
      if (!root) return
      workflowGsapCtx = gsap.context(() => {
        const dogWrap = root.querySelector('.cp-wf-dog-wrap')
        if (dogWrap) {
          gsap.fromTo(dogWrap, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
        }
        const glow = root.querySelector('.cp-wf-back-glow')
        if (glow) {
          gsap.fromTo(
            glow,
            { scale: 0.85, opacity: 0.35 },
            { scale: 1.12, opacity: 0.62, duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut' }
          )
        }
        const slide = workflowIndeterminateFillRef.value
        if (slide && workflowPhasePercent.value == null) {
          gsap.fromTo(slide, { xPercent: -100 }, { xPercent: 220, duration: 2.2, repeat: -1, ease: 'none' })
        }
      }, root)
    })
    onCleanup(() => {
      workflowGsapCtx?.revert()
      workflowGsapCtx = null
    })
  },
  { flush: 'post' }
)


function applyWorkflowStatusPayload(payload) {
  if (!payload) return
  if (Array.isArray(payload)) {
    payload.forEach((item) => applyWorkflowStatusPayload(item))
    return
  }

  const normalizedPayload = payload.nodeStatus || payload.node_status || payload.statusMap || payload.status_map
  const candidate = normalizedPayload && typeof normalizedPayload === 'object' ? normalizedPayload : null
  const current = payload.currentNode || payload.current_node || null

  if (candidate) {
    workflowNodes.value = { ...candidate }
    updateWorkflowStageText(candidate, current)
    return
  }

  if (isStatusDictionary(payload)) {
    workflowNodes.value = { ...payload }
    updateWorkflowStageText(payload, current)
  }
}

function updateWorkflowStageText(nodeStatus, currentNode) {
  if (!nodeStatus || !Object.keys(nodeStatus).length) {
    currentStageText.value = ''
    return
  }

  let derivedCurrent = currentNode
  if (!derivedCurrent) {
    derivedCurrent =
      Object.keys(nodeStatus).find((key) => {
        const value = nodeStatus[key]
        if (typeof value !== 'string') return false
        return /(正在|处理中|运行中|检索|生成)/.test(value)
      }) || null
  }

  let displayKey = derivedCurrent
  if (!displayKey) {
    displayKey =
      Object.keys(nodeStatus).find((key) => normalizeStatusValue(nodeStatus[key]) === 'running') ||
      Object.keys(nodeStatus).find((key) => normalizeStatusValue(nodeStatus[key]) === 'completed')
  }

  if (displayKey) {
    const label = getStatusLabel(nodeStatus[displayKey], normalizeStatusValue(nodeStatus[displayKey]))
    currentStageText.value = `当前进度：${displayKey}${label ? ' — ' + label : ''}`
  } else {
    currentStageText.value = ''
  }
}

function subscribe(runIdParam) {
  if (es) {
    es.close()
    es = null
  }
  es = new EventSource(buildWorkflowUrl('/agent/career/stream') + '?runId=' + encodeURIComponent(runIdParam), {
    withCredentials: true
  })
  es.onmessage = (evt) => {
    if (evt.data) {
      try {
        const arr = JSON.parse(evt.data)
        applyWorkflowStatusPayload(arr)
      } catch (_) {
        /* ignore */
      }
    }
  }
  es.onerror = () => {}
}

async function pollResult() {
  if (!runId) return
  try {
    const res = await fetch(buildWorkflowUrl('/agent/career/result') + '?runId=' + encodeURIComponent(runId), {
      credentials: 'include'
    })
    const ct = res.headers.get('Content-Type') || ''
    const data = ct.includes('application/json') ? await res.json() : { error: await res.text() }
    if (data.status) {
      runInfo.value = '状态：' + data.status
    }
    applyWorkflowStatusPayload(data)

    if (data.status === 'success' || data.status === 'failed') {
      workflowFinished.value = true
      if (data.report) {
        const sanitized = stripReportIdLine(data.report)
        reportHtml.value = marked.parse(sanitized)
        try {
          localStorage.setItem(CAREER_REPORT_MD_KEY, sanitized)
        } catch (_) {}
      } else {
        reportHtml.value = '<div class="empty-state">无报告内容</div>'
      }
      if (data.links && data.links.length > 0) {
        let linksHtmlContent = '<h4 class="workflow-links-title">相关链接</h4>'
        data.links.forEach((link) => {
          linksHtmlContent += `<a class="workflow-link-item" href="${link}" target="_blank" rel="noopener noreferrer">${link}</a>`
        })
        linksHtml.value = linksHtmlContent
        try {
          localStorage.setItem(CAREER_REPORT_LINKS_KEY, linksHtmlContent)
        } catch (_) {}
      } else {
        linksHtml.value = ''
        try {
          localStorage.removeItem(CAREER_REPORT_LINKS_KEY)
        } catch (_) {}
      }
      clearInterval(pollTimer)
      startBtnDisabled.value = false
    } else if (data.status === 'running') {
      reportHtml.value = '<div class="empty-state">报告生成中…</div>'
      linksHtml.value = ''
    }
  } catch (e) {
    workflowFinished.value = true
    reportHtml.value = `<div class="empty-state" style="color: #dc2626;">报告加载失败：${e.message}</div>`
  }
}

async function fetchAssessmentQuestions() {
  assessmentLoading.value = true
  assessmentError.value = ''
  try {
    const data = await request.get('/question/mbti')
    if (Array.isArray(data)) {
      assessmentQuestions.value = data
    } else {
      assessmentQuestions.value = []
      assessmentError.value = '暂无题目数据'
    }
  } catch (error) {
    console.error('获取职业测评题目失败:', error)
    assessmentError.value = error?.message || '获取题目失败，请稍后重试'
    assessmentQuestions.value = []
  } finally {
    assessmentLoading.value = false
  }
}

async function enterAssessment(options = {}) {
  const { syncRoute = true } = options
  journeyPhase.value = 'assessment'
  if (syncRoute && route.path !== CAREER_PLANNING_FLOW_PATH) {
    router.push(CAREER_PLANNING_FLOW_PATH)
  }
  assessmentCompleted.value = false
  currentQuestionIndex.value = 0
  answers.value = {}
  if (assessmentQuestions.value.length === 0 && !assessmentLoading.value) {
    await fetchAssessmentQuestions()
  }
}

function goToStory() {
  journeyPhase.value = 'story'
  if (route.path !== CAREER_PLANNING_BASE_PATH) {
    router.push(CAREER_PLANNING_BASE_PATH)
  }
}

const totalQuestions = computed(() => assessmentQuestions.value.length)
const currentQuestion = computed(() => assessmentQuestions.value[currentQuestionIndex.value] || null)
const currentQuestionAnswer = computed(() => {
  const question = currentQuestion.value
  if (!question) return null
  return answers.value[question.id]
})
const hasAssessmentResult = computed(() => {
  return (
    assessmentResult.value &&
    Array.isArray(assessmentResult.value.questions) &&
    assessmentResult.value.questions.length > 0
  )
})
const isLastQuestion = computed(() => totalQuestions.value > 0 && currentQuestionIndex.value === totalQuestions.value - 1)

const assessmentProgressPercent = computed(() => {
  if (!totalQuestions.value) return 0
  return Math.min(100, Math.round(((currentQuestionIndex.value + 1) / totalQuestions.value) * 100))
})

function selectAnswer(optionId) {
  if (!currentQuestion.value) return
  answers.value = {
    ...answers.value,
    [currentQuestion.value.id]: optionId
  }
}

/** 为全部题目随机作答并进入分析与工作流（与最后一题提交路径一致） */
function handleRandomAllChoices() {
  if (!assessmentQuestions.value.length) return
  const newAnswers = {}
  for (const question of assessmentQuestions.value) {
    if (!question.options?.length) continue
    const randomIndex = Math.floor(Math.random() * question.options.length)
    const option = question.options[randomIndex]
    newAnswers[question.id] = option.id
  }
  answers.value = newAnswers
  if (totalQuestions.value) {
    currentQuestionIndex.value = totalQuestions.value - 1
  }
  assessmentCompleted.value = true
  syncAssessmentResult()
  if (!hasAssessmentResult.value) return
  journeyPhase.value = 'workflow'
  nextTick(() => handleStart())
}

function buildAssessmentResult() {
  if (!assessmentQuestions.value.length) return null
  const mapped = assessmentQuestions.value.map((question) => {
    const selectedId = answers.value[question.id]
    if (!selectedId) return null
    const matchedOption = question.options && question.options.find((item) => item.id === selectedId)
    if (!matchedOption) return null
    return {
      id: question.id,
      title: question.title,
      selected_option_id: matchedOption.id,
      selected_option: matchedOption.title
    }
  })
  if (mapped.some((record) => !record)) {
    return null
  }
  return {
    questions: mapped
  }
}

function syncAssessmentResult() {
  const result = buildAssessmentResult()
  if (result) {
    assessmentResult.value = result
    ElMessage.success('测评结果已保存，即将进入分析')
  } else {
    assessmentResult.value = null
    ElMessage.error('请完成全部题目后再提交')
  }
}

function handleNextQuestion() {
  if (!currentQuestion.value) return
  const selected = answers.value[currentQuestion.value.id]
  if (!selected) {
    ElMessage.warning('请选择一个选项')
    return
  }
  if (currentQuestionIndex.value < totalQuestions.value - 1) {
    currentQuestionIndex.value += 1
  } else {
    assessmentCompleted.value = true
    syncAssessmentResult()
    if (!hasAssessmentResult.value) return
    journeyPhase.value = 'workflow'
    nextTick(() => handleStart())
  }
}

function handlePrevQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value -= 1
  }
}

function enterReport() {
  journeyPhase.value = 'report'
}

function goToWorkflowStep() {
  journeyPhase.value = 'workflow'
}

function openHistoryReport() {
  try {
    const md = localStorage.getItem(CAREER_REPORT_MD_KEY)
    const links = localStorage.getItem(CAREER_REPORT_LINKS_KEY) || ''
    if (!md) {
      ElMessage.info('暂无历史报告，请先生成一次报告')
      return
    }
    reportHtml.value = marked.parse(stripReportIdLine(md))
    linksHtml.value = links
    workflowFinished.value = true
    journeyPhase.value = 'report'
    if (route.path !== CAREER_PLANNING_FLOW_PATH) {
      router.push(CAREER_PLANNING_FLOW_PATH)
    }
  } catch (e) {
    console.error('读取历史报告失败:', e)
    ElMessage.error('读取历史报告失败，请稍后重试')
  }
}

watch(
  () => route.path,
  async (path) => {
    if (path === CAREER_PLANNING_FLOW_PATH && journeyPhase.value === 'story') {
      await enterAssessment({ syncRoute: false })
      return
    }
    if (path === CAREER_PLANNING_BASE_PATH && journeyPhase.value !== 'story') {
      goToStory()
    }
  },
  { immediate: true }
)

async function handleStart() {
  if (!hasAssessmentResult.value) {
    runInfo.value = '请先完成职业测评'
    ElMessage.warning('请先完成职业测评')
    return
  }
  const userIdValue = userId.value || ''
  if (!userIdValue) {
    ElMessage.warning('未获取到用户 ID，请重新登录后再试')
    return
  }

  const inputValue = DEFAULT_WORKFLOW_INPUT
  workflowLaunched.value = false
  workflowFinished.value = false
  startBtnDisabled.value = true
  runInfo.value = '启动中…'
  reportHtml.value = '<div class="empty-state">报告生成中…</div>'
  linksHtml.value = ''
  workflowNodes.value = {}
  currentStageText.value = '当前进度：系统 — 正在初始化工作流…'
  try {
    const res = await fetch(buildWorkflowUrl('/agent/career/start'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        userId: String(userIdValue),
        input: inputValue,
        assessmentResult: assessmentResult.value
      })
    })
    const ct = res.headers.get('Content-Type') || ''
    const data = ct.includes('application/json') ? await res.json() : { error: await res.text() }
    if (data.error) {
      runInfo.value = '错误：' + (data.message || data.error)
      reportHtml.value = `<div class="empty-state" style="color: #dc2626;">${data.message || data.error}</div>`
      startBtnDisabled.value = false
      return
    }
    runId = data.runId
    runInfo.value = '运行 ID：' + runId
    workflowLaunched.value = true
    subscribe(runId)
    clearInterval(pollTimer)
    pollTimer = setInterval(pollResult, 1200)
  } catch (e) {
    runInfo.value = '启动失败：' + e.message
    reportHtml.value = `<div class="empty-state" style="color: #dc2626;">启动失败：${e.message}</div>`
    startBtnDisabled.value = false
  }
}

onMounted(() => {
  try {
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr)
      const id = userInfo.id || userInfo.userId
      if (id) {
        userId.value = String(id)
      }
    }
  } catch (e) {
    console.error('解析用户信息失败', e)
  }
})

onUnmounted(() => {
  workflowGsapCtx?.revert()
  workflowGsapCtx = null
  if (es) {
    es.close()
    es = null
  }
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
})
</script>

<style scoped>
.career-planning-page {
  --cp-bg: #f7f3ff;
  --cp-surface: #ffffff;
  --cp-border: #eadffb;
  --cp-text: #1e293b;
  --cp-muted: #64748b;
  --cp-brand: #7c3aed;
  --cp-brand-soft: #f3e8ff;
  --cp-brand-hover: #6d28d9;
  --cp-focus: rgba(124, 58, 237, 0.25);
  --cp-glass: rgba(255, 255, 255, 0.58);
  --cp-glass-border: rgba(255, 255, 255, 0.85);
  /*
   * 与 NavBar 对齐：.nav-inner 高 80px + 顶栏滚动条，Logo 可达 100px 会略超出，
   * 原先写死 60px 会导致固定流程条顶到菜单下方被盖住。此处为顶栏底边 + 与流程条的小间距。
   */
  --cp-nav-offset: calc(80px);

  padding-top: var(--cp-nav-offset);
  min-height: 100vh;
  background: var(--cp-bg);
  display: flex;
  flex-direction: column;
  color: var(--cp-text);
  overflow-x: hidden;
  padding-inline: max(0px, env(safe-area-inset-left)) max(12px, env(safe-area-inset-right));
}

.career-planning-page--immersive {
  padding-right: max(20px, env(safe-area-inset-right));
}

.cp-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* 为 fixed 流程条预留高度，避免正文从条下开始 */
.cp-body:has(.cp-rail) {
  /* 流程条换行时略增高，多留一点避免正文压到条下 */
  padding-top: var(--cp-rail-h, 64px);
}

@media (prefers-reduced-motion: reduce) {
  :deep(.cp-immerse__orb--a),
  :deep(.cp-immerse__orb--b),
  :deep(.cp-immerse__orb--c) {
    animation: none !important;
  }

  :deep(.cp-dog__head),
  :deep(.cp-dog__head-c),
  :deep(.cp-dog__snout),
  :deep(.cp-dog__snout::before),
  :deep(.cp-dog__eye-l),
  :deep(.cp-dog__eye-r),
  :deep(.cp-dog__ear-l),
  :deep(.cp-dog__ear-r),
  :deep(.cp-dog__body),
  :deep(.cp-dog::before) {
    animation: none !important;
  }
}
</style>

<style>
@import url('https://cdn.jsdelivr.net/npm/github-markdown-css@5.5.1/github-markdown.min.css');
</style>
