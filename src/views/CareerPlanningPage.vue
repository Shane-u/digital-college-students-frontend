<template>
  <div class="career-planning-page" :class="{ 'career-planning-page--immersive': journeyPhase !== 'story' }">
    <NavBar :transparent="false" />

    <div class="cp-body" :class="{ 'cp-body--immersive': journeyPhase !== 'story' }">
      <header
        v-if="journeyPhase !== 'story'"
        class="cp-rail"
        aria-label="职业规划流程"
      >
        <nav class="cp-rail__crumb" aria-label="面包屑">
          <router-link to="/home">首页</router-link>
          <span class="cp-rail__sep">/</span>
          <button type="button" class="cp-rail__link" @click="goToStory">职业规划</button>
        </nav>
        <ol class="cp-steps" role="list">
          <li
            class="cp-steps__item"
            :class="{
              'cp-steps__item--active': journeyPhase === 'assessment',
              'cp-steps__item--done': phaseIndex > 0
            }"
          >
            <span class="cp-steps__n">1</span>
            <span class="cp-steps__label">职业测评</span>
          </li>
          <li class="cp-steps__bar" aria-hidden="true" />
          <li
            class="cp-steps__item"
            :class="{
              'cp-steps__item--active': journeyPhase === 'workflow',
              'cp-steps__item--done': phaseIndex > 1,
              'cp-steps__item--disabled': !hasAssessmentResult
            }"
          >
            <span class="cp-steps__n">2</span>
            <span class="cp-steps__label">生成职业规划报告</span>
          </li>
          <li class="cp-steps__bar" aria-hidden="true" />
          <li
            class="cp-steps__item"
            :class="{
              'cp-steps__item--active': journeyPhase === 'report',
              'cp-steps__item--done': false,
              'cp-steps__item--disabled': !workflowFinished
            }"
          >
            <span class="cp-steps__n">3</span>
            <span class="cp-steps__label">查看职业规划报告</span>
          </li>
        </ol>
      </header>

      <!-- 全屏：背景叙事 -->
      <main v-if="journeyPhase === 'story'" class="cp-panel cp-panel--story">
        <div class="cp-story__grid">
          <div class="cp-story__visual" aria-hidden="true">
            <div class="cp-story__blob">
              <img
                class="cp-story__img"
                :src="heroImageUrl"
                width="640"
                height="800"
                alt=""
              />
            </div>
          </div>
          <div class="cp-story__copy">
            <p class="cp-story__kicker">
              <span class="cp-story__dot" aria-hidden="true" />
              生涯规划
            </p>
            <h1 class="cp-story__title">
              迈向成长第一步，从精准的<span class="cp-story__title-accent">职业规划</span>开始
            </h1>
            <p class="cp-story__lead">
              我们相信：清晰的自我认知与可执行的路径，比盲目投递更重要。数字校园职业规划串联「测评画像 → 智能工作流 →
              结构化报告」，帮助你在学业、竞赛与求职之间找到自己的节奏。
            </p>

            <ul class="cp-story__features" role="list">
              <li class="cp-story__feature">
                <span class="cp-story__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3a12 12 0 0 0 0 18" stroke-linecap="round" />
                  </svg>
                </span>
                <div>
                  <p class="cp-story__feature-title">职业探索</p>
                  <p class="cp-story__feature-desc">结合测评与行业语境，梳理适合你的方向与能力组合。</p>
                </div>
              </li>
              <li class="cp-story__feature">
                <span class="cp-story__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                    <path d="M7 4h10v16H7z" />
                    <path d="M9 8h6M9 12h6M9 16h4" stroke-linecap="round" />
                  </svg>
                </span>
                <div>
                  <p class="cp-story__feature-title">目标与路径</p>
                  <p class="cp-story__feature-desc">把工作流拆成可跟踪的节点，让每一步状态清晰可见。</p>
                </div>
              </li>
              <li class="cp-story__feature">
                <span class="cp-story__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                    <path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
                <div>
                  <p class="cp-story__feature-title">报告沉淀</p>
                  <p class="cp-story__feature-desc">生成可阅读、可分享的职业规划报告，作为长期行动的底稿。</p>
                </div>
              </li>
            </ul>

            <div class="cp-story__cta-row">
              <button class="cp-btn-main" type="button" :disabled="assessmentLoading" @click="enterAssessment">
                <span>{{ assessmentLoading ? '准备题目中…' : '开始职业测评' }}</span>
                <span class="cp-btn-main__arrow" aria-hidden="true">→</span>
              </button>
              <p class="cp-story__cta-hint">全程约 10 分钟 · 完成后将自动进入分析与报告流程</p>
            </div>
          </div>
        </div>
      </main>

      <!-- 全屏：职业测评（沉浸式） -->
      <main v-else-if="journeyPhase === 'assessment'" class="cp-panel cp-panel--assessment cp-immerse">
        <div class="cp-immerse__scene" aria-hidden="true">
          <div class="cp-immerse__gradient" />
          <div class="cp-immerse__orb cp-immerse__orb--a" />
          <div class="cp-immerse__orb cp-immerse__orb--b" />
          <div class="cp-immerse__orb cp-immerse__orb--c" />
          <div class="cp-immerse__grain" />
        </div>
        <div class="cp-assess__inner">
          <div class="cp-assess__toolbar">
            <button type="button" class="cp-assess__ghost-btn" @click="goToStory">返回介绍</button>
            <div class="cp-assess__toolbar-mid">
              <div
                v-if="totalQuestions"
                class="cp-assess__track"
                role="progressbar"
                :aria-valuenow="currentQuestionIndex + 1"
                :aria-valuemin="1"
                :aria-valuemax="totalQuestions"
                aria-label="测评进度"
              >
                <div class="cp-assess__track-fill" :style="{ width: assessmentProgressPercent + '%' }" />
              </div>
            </div>
            <div class="cp-assess__toolbar-right">
              <button
                type="button"
                class="cp-assess__pill-btn"
                :disabled="assessmentLoading || !!assessmentError || !totalQuestions"
                @click="handleRandomAllChoices"
              >
                一键随机
              </button>
              <span v-if="totalQuestions" class="cp-assess__count">
                {{ currentQuestionIndex + 1 }}<span class="cp-assess__count-sep">/</span>{{ totalQuestions }}
              </span>
            </div>
          </div>

          <div class="cp-assess__card">
            <div v-if="assessmentLoading" class="cp-assess__state">正在载入题目，请稍候…</div>
            <div v-else-if="assessmentError" class="cp-assess__state cp-assess__state--err">{{ assessmentError }}</div>
            <div v-else-if="currentQuestion" class="cp-assess__quiz">
              <p class="cp-assess__q-label">第 {{ currentQuestionIndex + 1 }} 题</p>
              <p class="cp-assess__q-text">{{ currentQuestion.title }}</p>
              <div class="cp-assess__options">
                <label
                  v-for="option in currentQuestion.options"
                  :key="option.id"
                  class="cp-option"
                  :class="{ 'cp-option--on': currentQuestionAnswer === option.id }"
                >
                  <input
                    type="radio"
                    :name="'q-' + currentQuestion.id"
                    :value="option.id"
                    :checked="currentQuestionAnswer === option.id"
                    @change="selectAnswer(option.id)"
                  />
                  <span class="cp-option__text">{{ option.title }}</span>
                </label>
              </div>
              <div class="cp-assess__nav">
                <button
                  type="button"
                  class="cp-assess__nav-btn cp-assess__nav-btn--muted"
                  :disabled="currentQuestionIndex === 0"
                  @click="handlePrevQuestion"
                >
                  上一题
                </button>
                <button type="button" class="cp-assess__nav-btn cp-assess__nav-btn--primary" @click="handleNextQuestion">
                  {{ isLastQuestion ? '提交并进入分析' : '下一题' }}
                </button>
              </div>
            </div>
            <div v-else class="cp-assess__state">暂无题目，请稍后重试。</div>
          </div>
        </div>
      </main>

      <!-- 全屏：工作流（极简沉浸 + 等待动效） -->
      <main v-else-if="journeyPhase === 'workflow'" class="cp-panel cp-panel--workflow cp-immerse">
        <div class="cp-immerse__scene" aria-hidden="true">
          <div class="cp-immerse__gradient" />
          <div class="cp-immerse__orb cp-immerse__orb--a" />
          <div class="cp-immerse__orb cp-immerse__orb--b" />
          <div class="cp-immerse__orb cp-immerse__orb--c" />
          <div class="cp-immerse__grain" />
        </div>

        <!-- 待启动：仅保留一句与主按钮 -->
        <div v-if="!workflowLaunched && !startBtnDisabled" class="cp-flow__inner cp-flow__inner--idle">
          <p class="cp-flow__idle-title">准备生成你的职业规划</p>
          <p v-if="!hasAssessmentResult" class="cp-flow__idle-desc">请先完成职业测评。</p>
          <template v-else>
            <p class="cp-flow__idle-desc">将基于测评结果启动智能分析，过程无需额外操作。</p>
            <button type="button" class="cp-btn-main cp-flow__start-btn" :disabled="startBtnDisabled" @click="handleStart">
              开始生成
            </button>
          </template>
        </div>

        <!-- 进行中：小狗等待动画 + 人话进度 -->
        <div
          v-else-if="!workflowFinished"
          ref="workflowAnimRootRef"
          class="cp-flow__inner cp-flow__inner--cinema"
        >
          <div class="cp-wf-back-glow" aria-hidden="true" />

          <div class="cp-wf-dog-wrap" aria-hidden="true">
            <div class="cp-dog-main">
              <div class="cp-dog">
                <div class="cp-dog__paws">
                  <div class="cp-dog-leg cp-dog__bl-leg">
                    <div class="cp-dog-paw cp-dog__bl-paw" />
                    <div class="cp-dog-thigh cp-dog__bl-top" />
                  </div>
                  <div class="cp-dog-leg cp-dog__fl-leg">
                    <div class="cp-dog-paw cp-dog__fl-paw" />
                    <div class="cp-dog-thigh cp-dog__fl-top" />
                  </div>
                  <div class="cp-dog-leg cp-dog__fr-leg">
                    <div class="cp-dog-paw cp-dog__fr-paw" />
                    <div class="cp-dog-thigh cp-dog__fr-top" />
                  </div>
                </div>

                <div class="cp-dog__body">
                  <div class="cp-dog__tail" />
                </div>

                <div class="cp-dog__head">
                  <div class="cp-dog__snout">
                    <div class="cp-dog__eyes">
                      <div class="cp-dog__eye-l" />
                      <div class="cp-dog__eye-r" />
                    </div>
                  </div>
                </div>

                <div class="cp-dog__head-c">
                  <div class="cp-dog__ear-r" />
                  <div class="cp-dog__ear-l" />
                </div>
              </div>
            </div>
          </div>

          <p class="cp-flow__progress-label" role="status">{{ workflowFriendlyProgress }}</p>

          <div
            class="cp-wf-track"
            role="progressbar"
            :aria-valuenow="workflowPhasePercent ?? undefined"
            :aria-valuetext="workflowFriendlyProgress"
            aria-label="整体进度"
          >
            <div
              v-if="workflowPhasePercent != null"
              class="cp-wf-track__fill cp-wf-track__fill--value"
              :style="{ width: workflowPhasePercent + '%' }"
            />
            <div v-else ref="workflowIndeterminateFillRef" class="cp-wf-track__fill cp-wf-track__fill--slide" />
          </div>
        </div>

        <!-- 完成 -->
        <div v-else class="cp-flow__inner cp-flow__inner--done">
          <p class="cp-flow__done-title">报告已就绪</p>
          <p class="cp-flow__done-desc">可以阅读完整职业规划内容。</p>
          <button type="button" class="cp-btn-main" @click="enterReport">查看职业规划报告</button>
        </div>
      </main>

      <!-- 全屏：报告（沉浸式） -->
      <main v-else class="cp-panel cp-panel--report cp-immerse">
        <div class="cp-immerse__scene" aria-hidden="true">
          <div class="cp-immerse__gradient" />
          <div class="cp-immerse__orb cp-immerse__orb--a" />
          <div class="cp-immerse__orb cp-immerse__orb--b" />
          <div class="cp-immerse__orb cp-immerse__orb--c" />
          <div class="cp-immerse__grain" />
        </div>
        <div class="cp-report__inner">
          <div class="cp-report__head">
            <h2 class="cp-report__title">职业规划报告</h2>
            <div class="cp-report__actions">
              <button v-if="workflowFinished" type="button" class="cp-text-btn" @click="goToWorkflowStep">
                ← 返回工作流
              </button>
              <button type="button" class="cp-text-btn" @click="goToStory">返回介绍页</button>
            </div>
          </div>
          <div id="reportBox" class="cp-report__body markdown-body markdown-body-custom" v-html="reportHtml" />
          <div id="linksBox" class="cp-report__links workflow-links" v-html="linksHtml" />
        </div>
      </main>
    </div>

    <Footer v-if="journeyPhase === 'story'" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watchEffect } from 'vue'
import { marked } from 'marked'
import { ElMessage } from 'element-plus'
import gsap from 'gsap'
import request from '../api/request'
import Footer from '../components/Footer.vue'
import NavBar from '../components/NavBar.vue'
import heroImageUrl from '../assets/image.png'

marked.setOptions({
  breaks: true,
  gfm: true,
  tables: true,
  headerIds: false,
  mangle: false
})

/** 介绍页 | 测评 | 工作流 | 报告 — 各步全屏切换 */
const journeyPhase = ref('story')

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
        reportHtml.value = marked.parse(data.report)
      } else {
        reportHtml.value = '<div class="empty-state">无报告内容</div>'
      }
      if (data.links && data.links.length > 0) {
        let linksHtmlContent = '<h4 class="workflow-links-title">相关链接</h4>'
        data.links.forEach((link) => {
          linksHtmlContent += `<a class="workflow-link-item" href="${link}" target="_blank" rel="noopener noreferrer">${link}</a>`
        })
        linksHtml.value = linksHtmlContent
      } else {
        linksHtml.value = ''
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

async function enterAssessment() {
  journeyPhase.value = 'assessment'
  assessmentCompleted.value = false
  currentQuestionIndex.value = 0
  answers.value = {}
  if (assessmentQuestions.value.length === 0 && !assessmentLoading.value) {
    await fetchAssessmentQuestions()
  }
}

function goToStory() {
  journeyPhase.value = 'story'
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
  --cp-bg: #f0f4fa;
  --cp-surface: #ffffff;
  --cp-border: #e2e8f0;
  --cp-text: #1e293b;
  --cp-muted: #64748b;
  --cp-brand: #2563eb;
  --cp-brand-soft: #e8f1ff;
  --cp-brand-hover: #1d4ed8;
  --cp-focus: rgba(37, 99, 235, 0.25);
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
  overflow-x: visible;
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

.cp-rail {
  position: fixed;
  left: 0;
  right: 0;
  top: var(--cp-nav-offset);
  z-index: 999;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 20px;
  padding: 10px max(20px, env(safe-area-inset-right)) 10px max(20px, env(safe-area-inset-left));
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.98);
  border-bottom: 1px solid var(--cp-border);
  backdrop-filter: blur(12px);
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.06);
}

.cp-body--immersive .cp-rail {
  background: rgba(255, 255, 255, 0.72);
  border-bottom-color: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px) saturate(1.35);
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.06);
}

.cp-rail__crumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--cp-muted);
}

.cp-rail__crumb a {
  color: var(--cp-brand);
  text-decoration: none;
  font-weight: 500;
}

.cp-rail__crumb a:hover {
  text-decoration: underline;
}

.cp-rail__sep {
  opacity: 0.45;
  user-select: none;
}

.cp-rail__link {
  border: none;
  background: none;
  padding: 0;
  font: inherit;
  color: var(--cp-text);
  font-weight: 600;
  cursor: pointer;
}

.cp-rail__link:hover {
  color: var(--cp-brand);
}

.cp-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.cp-steps__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  color: var(--cp-muted);
  border: 1px solid transparent;
}

.cp-steps__item--active {
  color: var(--cp-brand);
  background: var(--cp-brand-soft);
  border-color: rgba(37, 99, 235, 0.2);
}

.cp-steps__item--done {
  color: var(--cp-text);
}

.cp-steps__item--disabled {
  opacity: 0.45;
}

.cp-steps__n {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  background: #e2e8f0;
  color: var(--cp-text);
}

.cp-steps__item--active .cp-steps__n {
  background: var(--cp-brand);
  color: #fff;
}

.cp-steps__item--done .cp-steps__n {
  background: #22c55e;
  color: #fff;
}

.cp-steps__bar {
  width: 18px;
  height: 2px;
  background: linear-gradient(90deg, #e2e8f0, #cbd5e1);
  border-radius: 1px;
}

/* 全屏面板 */
.cp-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--cp-nav-offset));
  box-sizing: border-box;
}

.cp-body:has(.cp-rail) .cp-panel {
  min-height: calc(100vh - var(--cp-nav-offset) - 64px);
}

.cp-panel--story {
  position: relative;
  padding: clamp(24px, 4vw, 48px) clamp(20px, 4vw, 40px) 40px;
  background:
    radial-gradient(ellipse 80% 50% at 100% 0%, rgba(37, 99, 235, 0.06) 0%, transparent 55%),
    linear-gradient(180deg, #fbfcfe 0%, var(--cp-bg) 100%);
}

.cp-panel--story::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image: linear-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.12) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

.cp-story__grid {
  position: relative;
  z-index: 1;
  max-width: 1120px;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  gap: clamp(28px, 5vw, 56px);
  align-items: center;
}

@media (max-width: 900px) {
  .cp-story__grid {
    grid-template-columns: 1fr;
  }
}

.cp-story__visual {
  display: flex;
  justify-content: center;
}

.cp-story__blob {
  width: min(100%, 420px);
  aspect-ratio: 4 / 5;
  border-radius: 46% 54% 52% 48% / 42% 48% 52% 58%;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(30, 41, 59, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.8);
  background: var(--cp-surface);
}

.cp-story__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cp-story__kicker {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 700;
  color: var(--cp-brand);
}

.cp-story__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--cp-brand);
  flex-shrink: 0;
}

.cp-story__title {
  margin: 0 0 16px;
  font-size: clamp(1.65rem, 3.2vw, 2.35rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--cp-text);
}

.cp-story__title-accent {
  color: var(--cp-brand);
}

.cp-story__lead {
  margin: 0 0 28px;
  font-size: 15px;
  line-height: 1.75;
  color: var(--cp-muted);
  max-width: 40em;
}

.cp-story__features {
  list-style: none;
  margin: 0 0 32px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.cp-story__feature {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.cp-story__icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--cp-brand-soft);
  color: var(--cp-brand);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cp-story__icon svg {
  width: 24px;
  height: 24px;
}

.cp-story__feature-title {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
  color: var(--cp-text);
}

.cp-story__feature-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--cp-muted);
}

.cp-story__cta-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.cp-story__cta-hint {
  margin: 0;
  font-size: 12px;
  color: var(--cp-muted);
}

.cp-btn-main {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: var(--cp-brand);
  cursor: pointer;
  box-shadow: 0 10px 28px rgba(37, 99, 235, 0.28);
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
}

.cp-btn-main:hover:not(:disabled) {
  background: var(--cp-brand-hover);
  transform: translateY(-1px);
  box-shadow: 0 14px 36px rgba(37, 99, 235, 0.32);
}

.cp-btn-main:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.cp-btn-main--sm {
  padding: 12px 22px;
  font-size: 14px;
  box-shadow: none;
}

.cp-btn-main__arrow {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  font-size: 14px;
}

.cp-btn-secondary {
  padding: 12px 20px;
  border-radius: 10px;
  border: 1px solid var(--cp-border);
  background: var(--cp-surface);
  color: var(--cp-text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.cp-btn-secondary:hover:not(:disabled) {
  border-color: rgba(37, 99, 235, 0.35);
  background: var(--cp-brand-soft);
}

.cp-btn-secondary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.cp-text-btn {
  border: none;
  background: none;
  padding: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--cp-brand);
  cursor: pointer;
}

.cp-text-btn:hover {
  text-decoration: underline;
}

/* —— 沉浸式背景（测评 / 工作流 / 报告共用） —— */
.cp-immerse {
  position: relative;
  isolation: isolate;
  overflow-x: visible;
}

.cp-immerse__scene {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.cp-immerse__gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 120% 80% at 10% -20%, rgba(129, 140, 248, 0.45) 0%, transparent 55%),
    radial-gradient(ellipse 90% 70% at 95% 10%, rgba(56, 189, 248, 0.35) 0%, transparent 50%),
    radial-gradient(ellipse 70% 60% at 50% 100%, rgba(167, 139, 250, 0.28) 0%, transparent 45%),
    linear-gradient(165deg, #f8fafc 0%, #eef2ff 38%, #e0f2fe 72%, #f1f5f9 100%);
}

.cp-immerse__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(48px);
  opacity: 0.55;
  mix-blend-mode: multiply;
}

.cp-immerse__orb--a {
  width: min(78vw, 560px);
  height: min(78vw, 560px);
  top: -18%;
  left: -12%;
  background: radial-gradient(circle at 40% 40%, rgba(99, 102, 241, 0.55), transparent 65%);
  animation: cpOrbDrift 22s ease-in-out infinite;
}

.cp-immerse__orb--b {
  width: min(65vw, 480px);
  height: min(65vw, 480px);
  bottom: -8%;
  right: -10%;
  background: radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.45), transparent 68%);
  animation: cpOrbDrift 26s ease-in-out infinite reverse;
}

.cp-immerse__orb--c {
  width: min(50vw, 360px);
  height: min(50vw, 360px);
  top: 42%;
  left: 35%;
  background: radial-gradient(circle, rgba(192, 132, 252, 0.35), transparent 70%);
  animation: cpOrbDrift 30s ease-in-out infinite;
  opacity: 0.4;
}

.cp-immerse__grain {
  position: absolute;
  inset: 0;
  opacity: 0.22;
  background-image: radial-gradient(rgba(255, 255, 255, 0.9) 0.8px, transparent 1px);
  background-size: 3px 3px;
  mix-blend-mode: overlay;
}

@keyframes cpOrbDrift {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(2%, -3%) scale(1.04);
  }
  66% {
    transform: translate(-3%, 2%) scale(0.98);
  }
}

/* 测评（沉浸式） */
.cp-panel--assessment {
  padding: 16px clamp(14px, 4vw, 40px) max(28px, env(safe-area-inset-bottom));
  justify-content: center;
  align-items: stretch;
}

.cp-assess__inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: min(720px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-height: 0;
  gap: clamp(16px, 3vh, 28px);
}

.cp-assess__toolbar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px 16px;
  padding: 10px 14px;
  border-radius: 999px;
  background: var(--cp-glass);
  border: 1px solid var(--cp-glass-border);
  backdrop-filter: blur(18px) saturate(1.4);
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06);
}

@media (max-width: 640px) {
  .cp-assess__toolbar {
    grid-template-columns: 1fr;
    border-radius: 20px;
  }
}

.cp-assess__toolbar-mid {
  min-width: 0;
}

.cp-assess__track {
  height: 6px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.cp-assess__track-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #6366f1, #3b82f6, #0ea5e9);
  transition: width 0.35s cubic-bezier(0.33, 1, 0.68, 1);
}

.cp-assess__ghost-btn {
  border: none;
  background: transparent;
  padding: 6px 4px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(30, 41, 59, 0.75);
  cursor: pointer;
  white-space: nowrap;
}

.cp-assess__ghost-btn:hover {
  color: var(--cp-brand);
}

.cp-assess__toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.cp-assess__pill-btn {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(37, 99, 235, 0.22);
  background: rgba(255, 255, 255, 0.75);
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.2s, background 0.2s;
}

.cp-assess__pill-btn:hover:not(:disabled) {
  background: #fff;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.18);
}

.cp-assess__pill-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.cp-assess__count {
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: rgba(30, 41, 59, 0.55);
  white-space: nowrap;
}

.cp-assess__count-sep {
  margin: 0 2px;
  opacity: 0.45;
  font-weight: 500;
}

.cp-assess__card {
  background: var(--cp-glass);
  border: 1px solid var(--cp-glass-border);
  border-radius: clamp(22px, 3vw, 28px);
  padding: clamp(24px, 4vw, 40px) clamp(20px, 4vw, 36px);
  backdrop-filter: blur(22px) saturate(1.35);
  box-shadow:
    0 4px 24px rgba(15, 23, 42, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

.cp-assess__state {
  text-align: center;
  padding: 48px 16px;
  font-size: 16px;
  color: var(--cp-muted);
}

.cp-assess__state--err {
  color: #dc2626;
}

.cp-assess__q-label {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(37, 99, 235, 0.85);
}

.cp-assess__q-text {
  margin: 0 0 clamp(24px, 4vh, 36px);
  font-size: clamp(1.2rem, 2.4vw + 0.6rem, 1.75rem);
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.02em;
  color: #0f172a;
}

.cp-assess__options {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: clamp(24px, 4vh, 36px);
}

.cp-option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.72);
  cursor: pointer;
  font-size: clamp(15px, 1.1vw + 13px, 17px);
  line-height: 1.45;
  color: var(--cp-text);
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    background 0.2s,
    transform 0.2s;
}

.cp-option:hover {
  transform: translateY(-1px);
  border-color: rgba(99, 102, 241, 0.25);
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.08);
}

.cp-option input {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  accent-color: var(--cp-brand);
}

.cp-option__text {
  flex: 1;
}

.cp-option--on {
  border-color: rgba(37, 99, 235, 0.5);
  background: linear-gradient(135deg, rgba(224, 231, 255, 0.95), rgba(224, 242, 254, 0.9));
  box-shadow: 0 8px 28px rgba(37, 99, 235, 0.12);
}

.cp-assess__nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.cp-assess__nav-btn {
  padding: 14px 24px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
}

.cp-assess__nav-btn--muted {
  background: rgba(255, 255, 255, 0.65);
  color: #475569;
  border: 1px solid rgba(15, 23, 42, 0.1);
}

.cp-assess__nav-btn--muted:hover:not(:disabled) {
  background: #fff;
}

.cp-assess__nav-btn--primary {
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  color: #fff;
  box-shadow: 0 10px 28px rgba(37, 99, 235, 0.35);
}

.cp-assess__nav-btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 34px rgba(37, 99, 235, 0.4);
}

.cp-assess__nav-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 工作流：极简沉浸 + Loading 条带 + 进度条 */
.cp-panel--workflow {
  position: relative;
  padding: 16px clamp(14px, 4vw, 36px) max(28px, env(safe-area-inset-bottom));
}

.cp-flow__inner {
  position: relative;
  z-index: 1;
  max-width: 560px;
  margin: 0 auto;
  width: 100%;
}

.cp-flow__inner--idle {
  text-align: center;
  /* padding: clamp(32px, 10vh, 80px) 12px; */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.cp-flow__idle-title {
  margin: 0;
  font-size: clamp(1.35rem, 3vw, 1.85rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;
}

.cp-flow__idle-desc {
  margin: 0;
  max-width: 28em;
  font-size: 15px;
  line-height: 1.65;
  color: var(--cp-muted);
}

.cp-flow__start-btn {
  margin-top: 8px;
}

.cp-flow__inner--cinema {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  /* 不用 88vh：顶栏 + 固定流程条已占高度，再写接近整屏的 vh 会撑出 body 纵向滚动条 */
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  gap: clamp(28px, 5vh, 48px);
  overflow-x: hidden;
}

.cp-wf-back-glow {
  position: absolute;
  width: min(96vw, 780px);
  height: min(96vw, 780px);
  border-radius: 50%;
  left: 50%;
  top: 44%;
  transform: translate(-50%, -50%);
  /* background: radial-gradient(circle, rgba(99, 102, 241, 0.32) 0%, rgba(14, 165, 233, 0.14) 48%, transparent 72%); */
  filter: blur(42px);
  pointer-events: none;
  z-index: 0;
}

.cp-wf-dog-wrap {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: clamp(8px, 2vh, 24px) 0;
  transform: scale(1.12);
  transform-origin: center center;
}

@media (max-width: 600px) {
  .cp-wf-dog-wrap {
    transform: scale(0.95);
  }
}

.cp-dog-main {
  position: relative;
  width: 23.5vmax;
  height: 23.5vmax;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cp-dog-leg {
  position: absolute;
  bottom: 0;
  width: 2vmax;
  height: 2.125vmax;
}

.cp-dog-paw {
  position: absolute;
  bottom: 2px;
  left: 0;
  width: 1.95vmax;
  height: 1.8vmax;
  overflow: hidden;
}

.cp-dog-paw::before {
  content: '';
  position: absolute;
  width: 5vmax;
  height: 3vmax;
  border-radius: 50%;
}

.cp-dog-thigh {
  position: absolute;
  bottom: 0;
  left: 0.75vmax;
  height: 4.5vmax;
  width: 2.625vmax;
  border-top-left-radius: 1.425vmax;
  border-top-right-radius: 1.425vmax;
  transform-origin: bottom right;
  transform: rotateZ(90deg) translateX(-0.1vmax) translateY(1.5vmax);
  z-index: -1;
  background-image: linear-gradient(70deg, transparent 20%, #deac80 20%);
}

.cp-dog {
  position: relative;
  width: 20vmax;
  height: 8vmax;
}

.cp-dog::before {
  content: '';
  position: absolute;
  bottom: -0.75vmax;
  right: -0.15vmax;
  width: 100%;
  height: 1.5vmax;
  background-color: #b5c18e;
  border-radius: 50%;
  z-index: -1000;
  animation: cp-dog-kf-shadow 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
}

.cp-dog__head {
  position: absolute;
  left: 4.5vmax;
  bottom: 0;
  width: 8vmax;
  height: 5vmax;
  border-top-left-radius: 4.05vmax;
  border-top-right-radius: 4.05vmax;
  border-bottom-right-radius: 3.3vmax;
  border-bottom-left-radius: 3.3vmax;
  background-color: #deac80;
  animation: cp-dog-kf-head 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
}

.cp-dog__head-c {
  position: absolute;
  left: 1.5vmax;
  bottom: 0;
  width: 9.75vmax;
  height: 8.25vmax;
  animation: cp-dog-kf-head 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
  z-index: -1;
}

.cp-dog__snout {
  position: absolute;
  left: -1.5vmax;
  bottom: 0;
  width: 7.5vmax;
  height: 3.75vmax;
  border-top-right-radius: 3vmax;
  border-bottom-right-radius: 3vmax;
  border-bottom-left-radius: 4.5vmax;
  background-color: #f7dcb9;
  animation: cp-dog-kf-snout 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
}

.cp-dog__snout::before {
  content: '';
  position: absolute;
  left: -0.1125vmax;
  top: -0.15vmax;
  width: 1.875vmax;
  height: 1.125vmax;
  border-top-right-radius: 3vmax;
  border-bottom-right-radius: 3vmax;
  border-bottom-left-radius: 4.5vmax;
  background-color: #6c4e31;
  animation: cp-dog-kf-snout-b 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
}

.cp-dog__nose {
  position: absolute;
  top: -1.95vmax;
  left: 40%;
  width: 0.75vmax;
  height: 2.4vmax;
  border-radius: 0.525vmax;
  transform-origin: bottom;
  transform: rotateZ(10deg);
  background-color: #d7dbd2;
}

.cp-dog__eye-l,
.cp-dog__eye-r {
  position: absolute;
  top: -0.9vmax;
  width: 0.675vmax;
  height: 0.375vmax;
  border-radius: 50%;
  background-color: #1c3130;
  animation: cp-dog-kf-eye 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
}

.cp-dog__eye-l {
  left: 27%;
}

.cp-dog__eye-r {
  left: 65%;
}

.cp-dog__ear-l,
.cp-dog__ear-r {
  position: absolute;
  width: 5vmax;
  height: 3.3vmax;
  border-top-left-radius: 3.3vmax;
  border-top-right-radius: 3vmax;
  border-bottom-right-radius: 5vmax;
  border-bottom-left-radius: 5vmax;
  background-color: #deac80;
}

.cp-dog__ear-l {
  top: 1.5vmax;
  left: 10vmax;
  transform-origin: bottom left;
  transform: rotateZ(-50deg);
  z-index: -1;
  animation: cp-dog-kf-ear-l 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
}

.cp-dog__ear-r {
  top: 1.5vmax;
  right: 3vmax;
  transform-origin: bottom right;
  transform: rotateZ(25deg);
  z-index: -2;
  animation: cp-dog-kf-ear-r 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
}

.cp-dog__body {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  position: absolute;
  bottom: 0.3vmax;
  left: 6vmax;
  width: 18vmax;
  height: 4vmax;
  border-top-left-radius: 3vmax;
  border-top-right-radius: 6vmax;
  border-bottom-right-radius: 1.5vmax;
  border-bottom-left-radius: 6vmax;
  background-color: #914f1e;
  z-index: -2;
  animation: cp-dog-kf-body 10s cubic-bezier(0.3, 0.41, 0.18, 1.01) infinite;
}

.cp-dog__tail {
  position: absolute;
  top: 20px;
  right: -1.5vmax;
  height: 3vmax;
  width: 4vmax;
  background-color: #914f1e;
  border-radius: 1.5vmax;
}

.cp-dog__paws {
  position: absolute;
  bottom: 0;
  left: 7.5vmax;
  width: 10vmax;
  height: 3vmax;
}

.cp-dog__bl-leg {
  left: -3vmax;
  z-index: -10;
}

.cp-dog__bl-paw::before {
  background-color: #fffbe6;
}

.cp-dog__bl-top {
  background-image: linear-gradient(80deg, transparent 20%, #deac80 20%);
}

.cp-dog__fl-leg {
  z-index: 10;
  left: 0;
}

.cp-dog__fl-paw::before {
  background-color: #fffbe6;
}

.cp-dog__fr-leg {
  right: 0;
}

.cp-dog__fr-paw::before {
  background-color: #fffbe6;
}

@keyframes cp-dog-kf-head {
  0%,
  10%,
  20%,
  26%,
  28%,
  90%,
  100% {
    height: 8.25vmax;
    bottom: 0;
    transform-origin: bottom right;
    transform: rotateZ(0);
  }
  5%,
  15%,
  22%,
  24%,
  30% {
    height: 8.1vmax;
  }
  32%,
  50% {
    height: 8.25vmax;
  }
  55%,
  60% {
    bottom: 0.75vmax;
    transform-origin: bottom right;
    transform: rotateZ(0);
  }
  70%,
  80% {
    bottom: 0.75vmax;
    transform-origin: bottom right;
    transform: rotateZ(10deg);
  }
}

@keyframes cp-dog-kf-body {
  0%,
  10%,
  20%,
  26%,
  28%,
  32%,
  100% {
    height: 7.2vmax;
  }
  5%,
  15%,
  22%,
  24%,
  30% {
    height: 7.05vmax;
  }
}

@keyframes cp-dog-kf-ear-l {
  0%,
  10%,
  20%,
  26%,
  28%,
  82%,
  100% {
    transform: rotateZ(-50deg);
  }
  5%,
  15%,
  22%,
  24% {
    transform: rotateZ(-48deg);
  }
  30%,
  31% {
    transform: rotateZ(-30deg);
  }
  32%,
  80% {
    transform: rotateZ(-60deg);
  }
}

@keyframes cp-dog-kf-ear-r {
  0%,
  10%,
  20%,
  26%,
  28% {
    transform: rotateZ(20deg);
  }
  5%,
  15%,
  22%,
  24% {
    transform: rotateZ(18deg);
  }
  30%,
  31% {
    transform: rotateZ(10deg);
  }
  32% {
    transform: rotateZ(25deg);
  }
}

@keyframes cp-dog-kf-snout {
  0%,
  10%,
  20%,
  26%,
  28%,
  82%,
  100% {
    height: 3.75vmax;
  }
  5%,
  15%,
  22%,
  24% {
    height: 3.45vmax;
  }
}

@keyframes cp-dog-kf-snout-b {
  0%,
  10%,
  20%,
  26%,
  28%,
  98%,
  100% {
    width: 1.875vmax;
  }
  5%,
  15%,
  22%,
  24% {
    width: 1.8vmax;
  }
  34%,
  98% {
    width: 1.275vmax;
  }
}

@keyframes cp-dog-kf-shadow {
  0%,
  10%,
  20%,
  26%,
  28%,
  30%,
  84%,
  100% {
    width: 99%;
  }
  5%,
  15%,
  22%,
  24% {
    width: 101%;
  }
  34%,
  81% {
    width: 96%;
  }
}

@keyframes cp-dog-kf-eye {
  0%,
  30% {
    width: 0.675vmax;
    height: 0.3vmax;
  }
  32%,
  59%,
  90%,
  100% {
    width: 0.525vmax;
    height: 0.525vmax;
    transform: translateY(0);
  }
  60%,
  75% {
    transform: translateY(-0.3vmax);
  }
  80%,
  85% {
    transform: translateY(0.15vmax);
  }
}

.cp-flow__progress-label {
  position: relative;
  z-index: 1;
  margin: 0;
  max-width: min(36em, 92vw);
  font-size: clamp(17px, 2.2vw + 12px, 24px);
  font-weight: 600;
  line-height: 1.55;
  color: rgba(15, 23, 42, 0.78);
  bottom: 20px;
}

.cp-wf-track {
  position: relative;
  z-index: 1;
  width: min(88vw, 560px);
  height: clamp(10px, 1.2vw + 8px, 14px);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
  overflow: hidden;
  /* 整体上移，避免贴底、更靠近状态文案 */
  transform: translateY(calc(-1 * clamp(28px, 6vh, 72px)));
}

.cp-wf-track__fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #6366f1, #2563eb, #0ea5e9);
  box-shadow: 0 0 16px rgba(37, 99, 235, 0.35);
}

.cp-wf-track__fill--value {
  transition: width 0.55s cubic-bezier(0.33, 1, 0.68, 1);
}

.cp-wf-track__fill--slide {
  width: 44%;
  will-change: transform;
}

.cp-flow__inner--done {
  text-align: center;
  padding: clamp(40px, 12vh, 100px) 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.cp-flow__done-title {
  margin: 0;
  font-size: clamp(1.4rem, 3vw, 1.9rem);
  font-weight: 800;
  color: #0f172a;
}

.cp-flow__done-desc {
  margin: 0;
  font-size: 15px;
  color: var(--cp-muted);
}

/* 报告 */
.cp-panel--report {
  position: relative;
  padding: 20px clamp(14px, 4vw, 36px) max(40px, env(safe-area-inset-bottom));
}

.cp-report__inner {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.cp-report__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  padding: 18px 20px;
  border-radius: 20px;
  background: var(--cp-glass);
  border: 1px solid var(--cp-glass-border);
  backdrop-filter: blur(16px);
}

.cp-report__title {
  margin: 0;
  font-size: clamp(1.4rem, 2.5vw, 1.85rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;
}

.cp-report__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.cp-report__body {
  min-height: 200px;
}

.cp-report__links {
  margin-top: 20px;
}

.workflow-links-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--cp-text);
}

.workflow-link-item {
  display: block;
  margin-bottom: 6px;
  color: var(--cp-brand);
  text-decoration: underline;
  text-underline-offset: 2px;
  word-break: break-all;
  font-size: 14px;
}

.markdown-body-custom {
  padding: 22px clamp(18px, 3vw, 28px);
  border-radius: 20px;
  max-height: min(70vh, 720px);
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.65;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid var(--cp-glass-border);
  color: var(--cp-text);
  backdrop-filter: blur(14px);
  box-shadow: 0 8px 40px rgba(15, 23, 42, 0.06);
}

.empty-state {
  color: var(--cp-muted);
  text-align: center;
  padding: 40px 0;
  font-size: 14px;
}

.cp-option:focus-within {
  outline: 2px solid var(--cp-focus);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .cp-immerse__orb--a,
  .cp-immerse__orb--b,
  .cp-immerse__orb--c {
    animation: none !important;
  }

  .cp-dog__head,
  .cp-dog__head-c,
  .cp-dog__snout,
  .cp-dog__snout::before,
  .cp-dog__eye-l,
  .cp-dog__eye-r,
  .cp-dog__ear-l,
  .cp-dog__ear-r,
  .cp-dog__body,
  .cp-dog::before {
    animation: none !important;
  }
}
</style>

<style>
@import url('https://cdn.jsdelivr.net/npm/github-markdown-css@5.5.1/github-markdown.min.css');
</style>
