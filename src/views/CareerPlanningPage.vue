<template>
    <div class="career-planning-page">
      <!-- 使用共享导航组件 -->
      <NavBar :transparent="false" />
  
      <!-- 面包屑导航 -->
      <div class="breadcrumb-container">
        <div class="breadcrumb">
          <router-link to="/home">首页</router-link>
          <span>&gt;&gt;</span>
          <span class="current-page">职业规划</span>
        </div>
        <div class="divider"></div>
      </div>
  
      <!-- 职业测评区域 -->
      <div class="career-assessment-section">
        <div v-if="!assessmentMode" class="assessment-content">
          <h1 class="assessment-title">找到适合你的职业方向</h1>
          <p class="assessment-subtitle">青春不设限,职业要精准!</p>
          <p class="assessment-description">
            来做职业测评,挖透你的隐藏优势,直奔最适配的职业航向!
          </p>
          <button class="assessment-button" type="button" @click="handleAssessmentClick" :disabled="assessmentLoading">
            <svg
              class="button-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <!-- 人像 -->
              <circle cx="12" cy="7" r="3" stroke="currentColor" stroke-width="2" />
              <path
                d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
                stroke="currentColor"
                stroke-width="2"
              />
              <!-- 肩膀上的齿轮 -->
              <circle cx="18" cy="11" r="2.5" fill="currentColor" />
              <circle cx="18" cy="11" r="1.5" fill="white" />
              <path
                d="M18 8.5v1M18 13.5v1M15.5 11h-1M20.5 11h-1M16.5 9.5l0.7 0.7M19.8 12.3l0.7 0.7M19.8 9.7l0.7-0.7M16.5 12.5l0.7-0.7"
                stroke="currentColor"
                stroke-width="1"
                stroke-linecap="round"
              />
            </svg>
            <span>{{ assessmentLoading ? '加载中...' : '开始你的职业测评' }}</span>
          </button>
          <p class="assessment-footer">10分钟,获取个性化职业建议</p>
        </div>
        <div v-else class="assessment-test-wrapper">
          <div class="assessment-test-header">
            <!-- <div>
              <div class="test-breadcrumb">职业咨询首页 &gt; 职业性格测试</div>
              <h2 class="test-title">职业性格测试</h2>
            </div> -->
            <div class="test-meta">
              <button class="test-exit-btn" type="button" @click="handleExitAssessment">返回测评首页</button>
              <span>问题 {{ totalQuestions ? currentQuestionIndex + 1 : 0 }} / {{ totalQuestions || 0 }}</span>
            </div>
          </div>
          <!-- <div class="assessment-progress" v-if="totalGroups">
            <div
              v-for="(title, index) in groupTitles"
              :key="index"
              class="progress-step"
              :class="{ active: index + 1 < currentGroup, current: index + 1 === currentGroup }"
            >
              <div class="step-circle">{{ index + 1 }}</div>
              <span class="step-title">{{ title }}</span>
            </div>
          </div> -->
          <div class="assessment-test-body">
            <div v-if="assessmentLoading" class="test-state">正在载入题目，请稍候...</div>
            <div v-else-if="assessmentError" class="test-state test-state-error">{{ assessmentError }}</div>
            <div v-else-if="assessmentCompleted" class="test-finish">
              <h3>测评完成！</h3>
              <p>我们已记录您的作答结果，后续将为您生成个性化职业分析。</p>
              <button class="finish-btn" type="button" @click="handleExitAssessment">返回测评首页</button>
            </div>
            <div v-else-if="currentQuestion" class="assessment-card">
              <div class="question-header">
                <span class="question-label">第 {{ currentQuestionIndex + 1 }} 题</span>
                <!-- <span class="question-group">当前组：第 {{ currentGroup || 1 }} 组</span> -->
                <div class="question-actions">
                  <button
                    class="jump-end-btn"
                    type="button"
                    @click="handleJumpToEnd"
                  >
                    到最后一题
                  </button>
                  <button
                    class="random-all-btn"
                    type="button"
                    @click="handleRandomAllChoices"
                  >
                    全部随机
                  </button>
                <button
                  class="random-btn"
                  type="button"
                  @click="handleRandomChoice"
                >
                  随机选择
                </button>
                </div>
              </div>
              <div class="question-text">{{ currentQuestion.title }}</div>
              <div class="options">
                <label
                  v-for="option in currentQuestion.options"
                  :key="option.id"
                  class="option-item"
                  :class="{ selected: currentQuestionAnswer === option.id }"
                >
                  <input
                    type="radio"
                    :name="'question-' + currentQuestion.id"
                    :value="option.id"
                    :checked="currentQuestionAnswer === option.id"
                    @change="selectAnswer(option.id)"
                  />
                  <span class="option-content">{{ option.title }}</span>
                </label>
              </div>
              <div class="card-actions">
                <button class="prev-btn" type="button" @click="handlePrevQuestion" :disabled="currentQuestionIndex === 0">上一题</button>
                <button class="next-btn" type="button" @click="handleNextQuestion">
                  {{ isLastQuestion ? '提交结果' : '下一题' }}
                </button>
              </div>
            </div>
            <div v-else class="test-state">暂无题目，请稍后重试。</div>
          </div>
        </div>
      </div>

    <!-- 多Agent工作流演示区域 -->
    <div class="agent-workflow-section">
      <div class="agent-content">
        <!-- <h1 class="agent-title">一键生成职业规划报告</h1> -->

        <div class="card">
          <div class="row">
            <div style="display: none;">
              <label>用户ID</label>
              <input
                v-model="userId"
                type="text"
                placeholder="例如 1986990047206002690"
              />
            </div>
            <div>
              <label>用户昵称</label>
              <input
                type="text"
                placeholder="请输入昵称"
                value="云深"
              />
            </div>
            <div>
              <label>输入</label>
              <input
                v-model="userInput"
                type="text"
                placeholder="我想咨询一下未来的竞赛和职业规划"
              />
            </div>
          </div>
          <div class="workflow-actions">
            <button id="startBtn" :disabled="startBtnDisabled" @click="handleStart">
              启动工作流
            </button>
            <span class="badge">{{ runInfo || '未运行' }}</span>
          </div>
        </div>

        <div class="card assessment-sync-card">
          <div class="sync-header">
            <h3>职业测评结果</h3>
            <span class="status-pill" :class="{ synced: hasAssessmentResult, pending: !hasAssessmentResult }">
              {{ hasAssessmentResult ? '已同步' : '待完成' }}
            </span>
          </div>
          <p class="sync-desc">
            完成上方职业测评后，系统会自动将问题与答案封装为 JSON，并传递给多 Agent 工作流。
          </p>
          <pre v-if="hasAssessmentResult" class="assessment-json">{{ assessmentResultJson }}</pre>
          <div v-else class="assessment-json-empty">测评完成后，这里将展示同步到工作流的 JSON 数据。</div>
        </div>

        <!-- <div class="card">
          <h3>进度</h3>
          <pre id="progressBox">{{ progressText }}</pre>
        </div> -->

        <div class="row">
          <div class="card">
            <h3>报告</h3>
            <div id="reportBox" class="markdown-body markdown-body-custom" v-html="reportHtml"></div>
            <div id="linksBox" style="margin-top: 16px;" v-html="linksHtml"></div>
          </div>
          <div class="card">
            <h3>工作流状态</h3>
            <div v-if="currentStageText" class="workflow-status-banner">
              <span class="status-pulse-dot"></span>
              {{ currentStageText }}
            </div>
            <div id="workflowGraph" class="workflow-container">
              <svg ref="workflowSvg" id="workflowSvg" class="workflow-svg" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <!-- 箭头标记 - 优化样式和尺寸 -->
                  <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
                    <polygon points="0 0, 8 3, 0 6" fill="#9ca3af" stroke-width="0" />
                  </marker>
                  <marker id="arrowheadActive" markerWidth="10" markerHeight="10" refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" stroke-width="0" class="arrowhead-active" />
                  </marker>
                  <!-- 运行中节点的渐变（叠加基础色） -->
                  <linearGradient id="runningGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#60a5fa;stop-opacity:0.9" />
                    <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0.9" />
                  </linearGradient>
                  <!-- 完成节点的渐变（叠加基础色） -->
                  <linearGradient id="completedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#34d399;stop-opacity:0.9" />
                    <stop offset="100%" style="stop-color:#10b981;stop-opacity:0.9" />
                  </linearGradient>
                  <!-- 失败节点的渐变（叠加基础色） -->
                  <linearGradient id="failedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#f87171;stop-opacity:0.9" />
                    <stop offset="100%" style="stop-color:#ef4444;stop-opacity:0.9" />
                  </linearGradient>
                </defs>
                <!-- 确保连线在节点下方：先绘制连线组，再绘制节点组 -->
                <g ref="edgesGroup" id="edgesGroup" style="z-index: 1;"></g>
                <g ref="nodesGroup" id="nodesGroup" style="z-index: 2;"></g>
              </svg>
            </div>
            <details style="margin-top: 16px;">
              <summary style="cursor: pointer; color: #7c3aed; font-weight: 600;">查看 PlantUML 图</summary>
              <pre id="graphBox" style="margin-top: 8px;">{{ graphText }}</pre>
            </details>
          </div>
        </div>
        </div>
      </div>
  
      <!-- Footer -->
      <Footer />
    </div>
  </template>
  
<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { marked } from 'marked'
import { ElMessage } from 'element-plus'
import request from '../api/request'
import Footer from "../components/Footer.vue"
import NavBar from "../components/NavBar.vue"

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true,
  tables: true,
  headerIds: false,
  mangle: false
})

// 响应式数据
const userId = ref('')
const userInput = ref('我想咨询一下未来的我的竞赛和职业规划怎么样规划')
const runInfo = ref('')
const progressText = ref('尚未开始')
const currentStageText = ref('')
const reportHtml = ref('<div class="empty-state">暂无报告</div>')
const linksHtml = ref('')
const graphText = ref('加载中...')
const startBtnDisabled = ref(false)
const assessmentQuestions = ref([])
const assessmentLoading = ref(false)
const assessmentError = ref('')
const assessmentMode = ref(false)
const assessmentCompleted = ref(false)
const currentQuestionIndex = ref(0)
const answers = ref({})
const assessmentResult = ref(null)
const questionsPerGroup = 8

// SVG 引用
const workflowSvg = ref(null)
const edgesGroup = ref(null)
const nodesGroup = ref(null)

// 工作流状态
let es = null
let runId = null
let pollTimer = null

// 定义所有节点及其位置
const nodePositions = {
  start: { x: 370, y: 30, width: 60, height: 30 },
  coordinator: { x: 340, y: 100, width: 120, height: 50 },
  planner: { x: 340, y: 180, width: 120, height: 50 },
  supervisor: { x: 340, y: 260, width: 120, height: 50 },
  researcher: { x: 180, y: 360, width: 140, height: 50 },
  browser: { x: 40, y: 460, width: 140, height: 50 },
  coder: { x: 260, y: 460, width: 140, height: 50 },
  reporter: { x: 480, y: 460, width: 140, height: 50 },
  end: { x: 360, y: 580, width: 60, height: 30 }
}

const nodeLabels = {
  start: '开始',
  coordinator: '调度器',
  planner: '规划器',
  supervisor: '监督器',
  researcher: '研究员',
  browser: '浏览器',
  coder: '分析器',
  reporter: '报告生成',
  end: '结束'
}

// 定义连线
const edges = [
  { from: 'start', to: 'coordinator', type: 'solid', id: 'edge-start-coordinator' },
  { from: 'coordinator', to: 'planner', type: 'solid', id: 'edge-coordinator-planner' },
  { from: 'planner', to: 'supervisor', type: 'solid', id: 'edge-planner-supervisor' },
  { from: 'supervisor', to: 'researcher', type: 'dashed', id: 'edge-supervisor-researcher' },
  { from: 'supervisor', to: 'browser', type: 'dashed', id: 'edge-supervisor-browser' },
  { from: 'supervisor', to: 'coder', type: 'dashed', id: 'edge-supervisor-coder' },
  { from: 'supervisor', to: 'reporter', type: 'dashed', id: 'edge-supervisor-reporter' },
  { from: 'researcher', to: 'supervisor', type: 'solid', id: 'edge-researcher-supervisor' },
  { from: 'browser', to: 'supervisor', type: 'solid', id: 'edge-browser-supervisor' },
  { from: 'coder', to: 'supervisor', type: 'solid', id: 'edge-coder-supervisor' },
  { from: 'reporter', to: 'end', type: 'solid', id: 'edge-reporter-end' }
]

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
    const match = STATUS_PATTERNS.find(item => item.pattern.test(value))
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
  return keys.every(key => {
    const val = target[key]
    return typeof val === 'string' || (val && typeof val === 'object' && (val.status || val.label))
  })
}

const workflowDefaultBase = import.meta.env.DEV ? '/api' : ''
const workflowApiBase = (import.meta.env.VITE_WORKFLOW_API_BASE || workflowDefaultBase || '').replace(/\/$/, '')
const buildWorkflowUrl = (path = '') => `${workflowApiBase}${path}`

function applyWorkflowStatusPayload(payload) {
  if (!payload) return
  if (Array.isArray(payload)) {
    payload.forEach(item => applyWorkflowStatusPayload(item))
    return
  }

  const normalizedPayload = payload.nodeStatus || payload.node_status || payload.statusMap || payload.status_map
  const candidate = normalizedPayload && typeof normalizedPayload === 'object' ? normalizedPayload : null
  const current = payload.currentNode || payload.current_node || null

  if (candidate) {
    updateWorkflowGraph(candidate, current)
    return
  }

  if (isStatusDictionary(payload)) {
    updateWorkflowGraph(payload, current)
  }
}

// 初始化工作流图
function initWorkflowGraph() {
  if (!edgesGroup.value || !nodesGroup.value) return

  edgesGroup.value.innerHTML = ''
  nodesGroup.value.innerHTML = ''

  // 绘制连线
  edges.forEach(edge => {
    const fromNode = nodePositions[edge.from]
    const toNode = nodePositions[edge.to]
    if (!fromNode || !toNode) return

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const fromIsCircle = edge.from === 'start' || edge.from === 'end'
    const toIsCircle = edge.to === 'start' || edge.to === 'end'

    const fromCenterX = fromNode.x + fromNode.width / 2
    const fromCenterY = fromNode.y + fromNode.height / 2
    const toCenterX = toNode.x + toNode.width / 2
    const toCenterY = toNode.y + toNode.height / 2

    let startX, startY, endX, endY

    if (fromIsCircle) {
      const angle = Math.atan2(toCenterY - fromCenterY, toCenterX - fromCenterX)
      startX = fromCenterX + (fromNode.width / 2) * Math.cos(angle)
      startY = fromCenterY + (fromNode.height / 2) * Math.sin(angle)
    } else if (edge.from === 'supervisor' && ['researcher', 'browser', 'coder', 'reporter'].includes(edge.to)) {
      startX = fromCenterX
      startY = fromNode.y + fromNode.height
    } else if (['researcher', 'browser', 'coder'].includes(edge.from) && edge.to === 'supervisor') {
      startX = fromCenterX
      startY = fromNode.y
    } else if (edge.from === 'reporter' && edge.to === 'end') {
      startX = fromCenterX
      startY = fromNode.y + fromNode.height
    } else {
      startX = fromCenterX
      startY = fromNode.y + fromNode.height
    }

    if (toIsCircle) {
      const angle = Math.atan2(fromCenterY - toCenterY, fromCenterX - toCenterX)
      endX = toCenterX + (toNode.width / 2) * Math.cos(angle)
      endY = toCenterY + (toNode.height / 2) * Math.sin(angle)
    } else if (edge.to === 'supervisor' && ['researcher', 'browser', 'coder'].includes(edge.from)) {
      endX = toCenterX
      endY = toNode.y + toNode.height
    } else {
      endX = toCenterX
      endY = toNode.y
    }

    let d = ''
    const dx = Math.abs(toCenterX - fromCenterX)
    const dy = Math.abs(toCenterY - fromCenterY)

    if (edge.from === 'supervisor' && ['researcher', 'browser', 'coder', 'reporter'].includes(edge.to)) {
      const controlOffsetX = dx > 100 ? dx / 2 : 50
      const controlY = fromCenterY + (toCenterY - fromCenterY) / 3

      if (toCenterX < fromCenterX) {
        d = `M ${startX} ${startY} C ${fromCenterX - controlOffsetX} ${controlY}, ${toCenterX + controlOffsetX} ${controlY}, ${endX} ${endY}`
      } else {
        d = `M ${startX} ${startY} C ${fromCenterX + controlOffsetX} ${controlY}, ${toCenterX - controlOffsetX} ${controlY}, ${endX} ${endY}`
      }
    } else if (['researcher', 'browser', 'coder'].includes(edge.from) && edge.to === 'supervisor') {
      const controlOffsetX = dx > 100 ? dx / 2 : 50
      const controlY = toCenterY + (fromCenterY - toCenterY) / 3

      if (fromCenterX < toCenterX) {
        d = `M ${startX} ${startY} C ${fromCenterX + controlOffsetX} ${controlY}, ${toCenterX - controlOffsetX} ${controlY}, ${endX} ${endY}`
      } else {
        d = `M ${startX} ${startY} C ${fromCenterX - controlOffsetX} ${controlY}, ${toCenterX + controlOffsetX} ${controlY}, ${endX} ${endY}`
      }
    } else if (dx > 20) {
      const controlOffset = dx / 3
      d = `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`
    } else {
      d = `M ${startX} ${startY} L ${endX} ${endY}`
    }

    path.setAttribute('d', d)
    path.setAttribute('id', edge.id)
    path.setAttribute('class', `workflow-edge ${edge.type === 'dashed' ? 'dashed' : ''}`)

    if (edge.type === 'dashed') {
      path.setAttribute('stroke-dasharray', '6,3')
      path.setAttribute('stroke-linecap', 'round')
    }

    path.setAttribute('marker-end', 'url(#arrowhead)')
    edgesGroup.value.appendChild(path)
  })

  // 绘制节点
  Object.keys(nodePositions).forEach(nodeName => {
    const pos = nodePositions[nodeName]
    const isCircle = nodeName === 'start' || nodeName === 'end'

    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    nodeGroup.setAttribute('data-node', nodeName)
    nodeGroup.setAttribute('class', 'node-group')
    nodeGroup.style.zIndex = 2

    let shape
    if (isCircle) {
      shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      shape.setAttribute('cx', pos.x + pos.width / 2)
      shape.setAttribute('cy', pos.y + pos.height / 2)
      shape.setAttribute('r', pos.width / 2)
    } else {
      shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      shape.setAttribute('x', pos.x)
      shape.setAttribute('y', pos.y)
      shape.setAttribute('width', pos.width)
      shape.setAttribute('height', pos.height)
      shape.setAttribute('rx', 8)
    }

    shape.setAttribute('class', `workflow-node pending ${nodeName}`)
    nodeGroup.appendChild(shape)

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('x', pos.x + pos.width / 2)
    text.setAttribute('y', pos.y + pos.height / 2 + (isCircle ? 0 : 5))
    text.setAttribute('class', 'workflow-node-text')
    text.setAttribute('dominant-baseline', 'middle')
    text.textContent = nodeLabels[nodeName] || nodeName
    nodeGroup.appendChild(text)

    nodesGroup.value.appendChild(nodeGroup)
  })
}

// 获取拓扑图
async function fetchGraph() {
  try {
    const res = await fetch(buildWorkflowUrl('/agent/career/graph'), {
      credentials: 'include'
    })
    const text = await res.text()
    graphText.value = text
  } catch (e) {
    graphText.value = '获取拓扑失败：' + e.message
  }
}

// 订阅SSE
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
        progressText.value = JSON.stringify(arr, null, 2)
        applyWorkflowStatusPayload(arr)
      } catch (_) {
        progressText.value = evt.data
      }
    }
  }
  es.onerror = () => {
    // SSE 不可靠时忽略
  }
}

// 更新工作流图
function updateWorkflowGraph(nodeStatus, currentNode) {
  if (!workflowSvg.value) return

  let derivedCurrentNode = currentNode
  if (!derivedCurrentNode && nodeStatus) {
    derivedCurrentNode = Object.keys(nodeStatus).find((key) => {
      const value = nodeStatus[key]
      if (typeof value !== 'string') return false
      return /(正在|处理中|运行中|检索|生成)/.test(value)
    }) || null
  }

  Object.keys(nodePositions).forEach(nodeName => {
    const nodeGroup = workflowSvg.value.querySelector(`[data-node="${nodeName}"]`)
    if (!nodeGroup) return

    const nodeEl = nodeGroup.querySelector('.workflow-node')
    if (!nodeEl) return

    const rawStatus = nodeStatus?.[nodeName]
    const normalizedStatus = normalizeStatusValue(rawStatus)
    let visualStatus = 'pending'

    if (nodeName === 'start') {
      const hasProgress = nodeStatus && Object.keys(nodeStatus).some((key) => {
        const normalized = normalizeStatusValue(nodeStatus[key])
        return normalized && normalized !== 'pending'
      })
      visualStatus = hasProgress ? 'completed' : 'pending'
    } else if (nodeName === 'end') {
      visualStatus = normalizedStatus || (nodeStatus?.reporter ? normalizeStatusValue(nodeStatus.reporter) : null) || 'pending'
    } else {
      visualStatus = normalizedStatus || 'pending'
    }

    if (derivedCurrentNode === nodeName && visualStatus === 'pending') {
      visualStatus = 'running'
    }

    nodeEl.setAttribute('class', `workflow-node ${visualStatus} ${nodeName}`)

    if (visualStatus === 'running') {
      nodeGroup.classList.add('running')
      nodeEl.style.filter = 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.6))'
    } else {
      nodeGroup.classList.remove('running')
      if (visualStatus === 'completed') {
        nodeEl.style.filter = 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))'
      } else if (visualStatus === 'failed') {
        nodeEl.style.filter = 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.4))'
      } else {
        nodeEl.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
      }
    }
  })

  const activeNode = derivedCurrentNode

  edges.forEach(edge => {
    const path = document.getElementById(edge.id)
    if (!path) return

    const fromStatus = normalizeStatusValue(nodeStatus?.[edge.from])
    const toStatus = normalizeStatusValue(nodeStatus?.[edge.to])
    const isActive = activeNode === edge.from || activeNode === edge.to ||
      (fromStatus === 'running' && (!toStatus || toStatus === 'pending')) ||
      (fromStatus === 'completed' && toStatus === 'running')

    if (isActive) {
      path.classList.add('active')
      path.setAttribute('marker-end', 'url(#arrowheadActive)')
      if (edge.type === 'dashed') {
        path.setAttribute('stroke-dasharray', '6,3')
      }
    } else {
      path.classList.remove('active')
      path.setAttribute('marker-end', 'url(#arrowhead)')
    }
  })

  if (nodeStatus && Object.keys(nodeStatus).length) {
    let displayNode = activeNode
    if (!displayNode) {
      displayNode = Object.keys(nodeStatus).find((key) => normalizeStatusValue(nodeStatus[key]) === 'running') ||
        Object.keys(nodeStatus).find((key) => normalizeStatusValue(nodeStatus[key]) === 'completed')
    }

    if (displayNode) {
      const label = getStatusLabel(nodeStatus[displayNode], normalizeStatusValue(nodeStatus[displayNode]))
      currentStageText.value = `当前进度：${nodeLabels[displayNode] || displayNode}${label ? ' - ' + label : ''}`
    } else {
      currentStageText.value = ''
    }
  } else {
    currentStageText.value = ''
  }
}

// 轮询结果
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
      if (data.report) {
        reportHtml.value = marked.parse(data.report)
      } else {
        reportHtml.value = '<div class="empty-state">无报告内容</div>'
      }
      if (data.links && data.links.length > 0) {
        let linksHtmlContent = '<h4 style="margin-bottom: 8px; font-size: 14px;">相关链接</h4>'
        data.links.forEach(link => {
          linksHtmlContent += `<a href="${link}" target="_blank" style="display: block; margin-bottom: 4px; color: #7c3aed; text-decoration: underline;">${link}</a>`
        })
        linksHtml.value = linksHtmlContent
      } else {
        linksHtml.value = ''
      }
      clearInterval(pollTimer)
      startBtnDisabled.value = false
    } else {
      if (data.status === 'running') {
        reportHtml.value = '<div class="empty-state">报告生成中...</div>'
        linksHtml.value = ''
      }
    }
  } catch (e) {
    reportHtml.value = `<div class="empty-state" style="color: #ef4444;">报告加载失败：${e.message}</div>`
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

async function handleAssessmentClick() {
  assessmentMode.value = true
  assessmentCompleted.value = false
  currentQuestionIndex.value = 0
  answers.value = {}
  if (assessmentQuestions.value.length === 0 && !assessmentLoading.value) {
    await fetchAssessmentQuestions()
  }
}

const totalQuestions = computed(() => assessmentQuestions.value.length)
const totalGroups = computed(() => (totalQuestions.value ? Math.ceil(totalQuestions.value / questionsPerGroup) : 0))
const currentGroup = computed(() => (totalQuestions.value ? Math.floor(currentQuestionIndex.value / questionsPerGroup) + 1 : 0))
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
const assessmentResultJson = computed(() =>
  hasAssessmentResult.value ? JSON.stringify(assessmentResult.value, null, 2) : ''
)
const groupTitles = computed(() => {
  if (!totalGroups.value) return []
  return Array.from({ length: totalGroups.value }, (_, index) => `第${index + 1}组`)
})
const isLastQuestion = computed(() => totalQuestions.value > 0 && currentQuestionIndex.value === totalQuestions.value - 1)

function selectAnswer(optionId) {
  if (!currentQuestion.value) return
  answers.value = {
    ...answers.value,
    [currentQuestion.value.id]: optionId
  }
}

function handleRandomChoice() {
  if (!currentQuestion.value || !currentQuestion.value.options?.length) return
  const randomIndex = Math.floor(Math.random() * currentQuestion.value.options.length)
  const option = currentQuestion.value.options[randomIndex]
  selectAnswer(option.id)
}

function handleRandomAllChoices() {
  if (!assessmentQuestions.value.length) return
  const newAnswers = {}
  assessmentQuestions.value.forEach(question => {
    if (!question.options || !question.options.length) {
      return
    }
    const randomIndex = Math.floor(Math.random() * question.options.length)
    const option = question.options[randomIndex]
    newAnswers[question.id] = option.id
  })
  answers.value = newAnswers
  if (totalQuestions.value) {
    currentQuestionIndex.value = totalQuestions.value - 1
  }
  assessmentCompleted.value = true
  syncAssessmentResult()
}

function handleJumpToEnd() {
  if (!totalQuestions.value) return
  currentQuestionIndex.value = totalQuestions.value - 1
}

function buildAssessmentResult() {
  if (!assessmentQuestions.value.length) return null
  const mapped = assessmentQuestions.value.map((question) => {
    const selectedId = answers.value[question.id]
    if (!selectedId) return null
    const matchedOption =
      question.options && question.options.find((item) => item.id === selectedId)
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
    ElMessage.success('职业测评结果已同步至工作流')
  } else {
    assessmentResult.value = null
    ElMessage.error('同步职业测评结果失败，请重试')
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
  }
}

function handlePrevQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value -= 1
  }
}

function handleExitAssessment() {
  assessmentMode.value = false
}

// 启动工作流
async function handleStart() {
  if (!hasAssessmentResult.value) {
    runInfo.value = '请先完成职业测评并同步结果'
    ElMessage.warning('请先完成职业测评，并确保结果已同步')
    return
  }
  const userIdValue = userId.value || ''
  if (!userIdValue) {
    ElMessage.warning('未获取到用户ID，请尝试重新登录')
    return
  }

  const inputValue = userInput.value || ''
  startBtnDisabled.value = true
  runInfo.value = '启动中...'
  progressText.value = '等待事件...'
  reportHtml.value = '<div class="empty-state">报告生成中...</div>'
  linksHtml.value = ''
  currentStageText.value = '当前进度：系统 - 正在初始化工作流...'
  updateWorkflowGraph({}, null)
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
      reportHtml.value = `<div class="empty-state" style="color: #ef4444;">${data.message || data.error}</div>`
      startBtnDisabled.value = false
      return
    }
    runId = data.runId
    runInfo.value = '运行ID：' + runId
    subscribe(runId)
    clearInterval(pollTimer)
    pollTimer = setInterval(pollResult, 1200)
  } catch (e) {
    runInfo.value = '启动失败：' + e.message
    reportHtml.value = `<div class="empty-state" style="color: #ef4444;">启动失败：${e.message}</div>`
    startBtnDisabled.value = false
  }
}

onMounted(() => {
  try {
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr)
      // 优先使用 id，其次 userId
      const id = userInfo.id || userInfo.userId
      if (id) {
        userId.value = String(id)
      }
    }
  } catch (e) {
    console.error('解析用户信息失败', e)
  }

  nextTick(() => {
    initWorkflowGraph()
    fetchGraph()
  })
})

onUnmounted(() => {
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
  padding-top: 60px;
    min-height: 100vh;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
  }
  
  /* 面包屑导航 */
  .breadcrumb-container {
    max-width: 1200px;
    margin: 64px auto 0 20px;
    padding: 0 20px;
  }
  
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #666;
    margin-bottom: 10px;
  }
  
  .breadcrumb a {
    color: #3b82f6;
    text-decoration: none;
  }
  
  .breadcrumb a:hover {
    text-decoration: underline;
  }
  
  .current-page {
    color: #333;
    font-weight: 500;
  }
  
  .divider {
    height: 1px;
    width: 100%;
    background-color: #e0e0e0;
    margin: 8px 0 20px;
  }
  
  /* 职业测评区域 */
  .career-assessment-section {
  background: linear-gradient(135deg, #2d1b4e 0%, #1a0f2e 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  /* padding: 100px 20px; */
  min-height: 400px;
    position: relative;
    overflow: hidden;
  }
  
  .assessment-content {
    max-width: 800px;
    text-align: center;
    position: relative;
    z-index: 1;
  }
  
  .assessment-title {
    font-size: 48px;
    font-weight: 700;
  color: #ff6b9d;
    margin: 0 0 24px 0;
    line-height: 1.2;
    /* text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); */
  }
  
  .assessment-subtitle {
    font-size: 28px;
    font-weight: 500;
  color: #f1d8ff;
    margin: 0 0 16px 0;
    line-height: 1.4;
  }
  
  .assessment-description {
    font-size: 20px;
    font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
    margin: 0 0 40px 0;
    line-height: 1.6;
  }
  
  .assessment-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 18px 48px;
  background: linear-gradient(135deg, #ff6b9d 0%, #e74c8c 100%);
    border: none;
    border-radius: 12px;
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  /* box-shadow: 0 6px 20px rgba(231, 76, 140, 0.35); */
    margin-bottom: 24px;
  }
  
  .assessment-button:hover {
  background: linear-gradient(135deg, #ff7fb2 0%, #f24f95 100%);
    transform: translateY(-2px);
  /* box-shadow: 0 8px 24px rgba(231, 76, 140, 0.45); */
  }
  
  .assessment-button:active {
    transform: translateY(0);
  }
  
.assessment-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  }
  
  .button-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }
  
  .assessment-footer {
    font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
    margin: 0;
    opacity: 0.9;
  }

.assessment-test-wrapper {
  width: 100%;
  max-width: 1100px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  padding: 36px;
  backdrop-filter: blur(6px);
  color: #fff;
}

.assessment-test-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.test-breadcrumb {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.test-title {
  font-size: 32px;
  margin: 0;
}

.test-meta {
  display: flex;
  align-items: center;
  gap: 800px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
}

.test-exit-btn {
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: transparent;
  color: #fff;
  border-radius: 999px;
  padding: 6px 16px;
  cursor: pointer;
  font-size: 13px;
}

.assessment-progress {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.6);
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
}

.progress-step.active .step-circle,
.progress-step.current .step-circle {
  border-color: #ffd3ec;
  background: #ff80c3;
  color: #311b4f;
}

.progress-step.current {
  color: #fff;
}

.step-title {
  font-size: 13px;
}

.assessment-test-body {
  background: #fdf7ff;
  border-radius: 20px;
  padding: 32px;
  color: #2c1c44;
  min-height: 360px;
}

.test-state {
  text-align: center;
  font-size: 18px;
  color: #6b4ca6;
}

.test-state-error {
  color: #d9534f;
}

.assessment-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #6b4ca6;
  align-items: center;
}

.question-actions {
  display: flex;
  gap: 8px;
}

.jump-end-btn {
  border: 1px solid #c4d6ff;
  background: rgba(255, 255, 255, 0.25);
  color: #4a6ff0;
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.jump-end-btn:hover {
  border-color: #5c7cfa;
  color: #5c7cfa;
  background: rgba(92, 124, 250, 0.12);
}

.random-btn {
  border: 1px solid #dcd4f5;
  background: rgba(255, 255, 255, 0.2);
  color: #6b4ca6;
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.random-btn:hover {
  border-color: #8b5cf6;
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
}

.random-all-btn {
  border: 1px solid #f7c7e1;
  background: rgba(255, 255, 255, 0.25);
  color: #e94a8a;
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.random-all-btn:hover {
  border-color: #ff80c3;
  color: #ff80c3;
  background: rgba(255, 128, 195, 0.12);
}

.question-text {
  font-size: 22px;
  font-weight: 600;
  color: #2c1c44;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #dcd4f5;
  border-radius: 16px;
  padding: 16px 20px;
  cursor: pointer;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.option-item input {
  width: 18px;
  height: 18px;
}

.option-item.selected {
  border-color: #8b5cf6;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.2);
}

.option-content {
  font-size: 16px;
  color: #2c1c44;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.prev-btn,
.next-btn {
  border: none;
  border-radius: 6px;
  /* padding: 12px 32px; */
  font-size: 16px;
  cursor: pointer;
}

.prev-btn {
  background: #ede7fb;
  color: #6b4ca6;
}

.prev-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.next-btn {
  background: rgb(92,72,232);
  color: #fff;
  /* box-shadow: 0 6px 20px rgba(139, 92, 246, 0.3); */
}

.test-finish {
  text-align: center;
  color: #2c1c44;
}

.finish-btn {
  margin-top: 16px;
  background: linear-gradient(135deg, #ff80c3 0%, #8b5cf6 100%);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 12px 28px;
  cursor: pointer;
  font-size: 15px;
}

/* 多Agent工作流区域 */
.agent-workflow-section {
  /* background-image: url('../assets/background/career.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat; */
  padding: 20px 0;
  position: relative;
  overflow: hidden;
}

.agent-content {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.agent-title {
  font-size: 32px;
  font-weight: 700;
  color: #de94ef;
  margin: 0 0 40px 0;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card {
  background: #fff;
  border: 1px solid #e9e9ef;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
}

.workflow-actions {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.assessment-sync-card {
  border: 1px solid #d9d9e3;
}

.sync-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.status-pill {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

.status-pill.synced {
  background: #10b981;
}

.status-pill.pending {
  background: #f59e0b;
}

.sync-desc {
  margin: 0 0 12px;
  color: #666;
  font-size: 14px;
}

.assessment-json {
  max-height: 240px;
  overflow: auto;
  background: #0f172a;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 8px;
  font-size: 13px;
}

.assessment-json-empty {
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  padding: 16px;
  font-size: 13px;
  color: #6b7280;
}

.card h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

label {
  display: block;
  font-weight: 600;
  margin: 8px 0 4px;
  color: #333;
}

input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid #d9d9e3;
  border-radius: 8px;
  outline: none;
  font-size: 14px;
}

input:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
}

button {
  background: #7c3aed;
  color: #fff;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

button:hover:not(:disabled) {
  background: #6d28d9;
}

button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

pre {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 13px;
  line-height: 1.5;
  color: #333;
    margin: 0;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  background: #eef2ff;
  color: #3730a3;
  font-size: 12px;
  margin-right: 6px;
}

#workflowGraph {
  min-height: 500px;
  position: relative;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  padding: 20px;
  overflow: auto;
}

.agent-workflow-section :deep(.workflow-svg) {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

.agent-workflow-section :deep(.workflow-node) {
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  z-index: 2;
  position: relative;
}

.agent-workflow-section :deep(.workflow-node.pending) {
  stroke-width: 2;
  opacity: 0.8;
}

.agent-workflow-section :deep(.workflow-node.pending.coordinator) {
  fill: #ffe0e9;
  stroke: #ff8fab;
}

.agent-workflow-section :deep(.workflow-node.pending.planner) {
  fill: #e0f7fa;
  stroke: #80deea;
}

.agent-workflow-section :deep(.workflow-node.pending.supervisor) {
  fill: #f3e5f5;
  stroke: #ce93d8;
}

.agent-workflow-section :deep(.workflow-node.pending.researcher) {
  fill: #e8f5e9;
  stroke: #a5d6a7;
}

.agent-workflow-section :deep(.workflow-node.pending.browser) {
  fill: #fff3e0;
  stroke: #ffcc80;
}

.agent-workflow-section :deep(.workflow-node.pending.coder) {
  fill: #fce4ec;
  stroke: #f48fb1;
}

.agent-workflow-section :deep(.workflow-node.pending.reporter) {
  fill: #e0f2f1;
  stroke: #80cbc4;
}

.agent-workflow-section :deep(.workflow-node.pending.start),
.agent-workflow-section :deep(.workflow-node.pending.end) {
  fill: #e5e7eb;
  stroke: #9ca3af;
}

.agent-workflow-section :deep(.workflow-node.running) {
  fill: url(#runningGradient);
  stroke: #3b82f6;
  stroke-width: 3;
  filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.6));
  animation: pulseGlow 2s ease-in-out infinite;
}

.agent-workflow-section :deep(.node-group.running) {
  transform-origin: center;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.agent-workflow-section :deep(.node-group.running .workflow-node) {
  animation: bounce 1.5s ease-in-out infinite;
}

.agent-workflow-section :deep(.workflow-node.completed) {
  fill: url(#completedGradient);
  stroke: #10b981;
  stroke-width: 2.5;
  filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.4));
  animation: completedGlow 2s ease-in-out infinite;
}

.agent-workflow-section :deep(.workflow-node.failed) {
  fill: url(#failedGradient);
  stroke: #ef4444;
  stroke-width: 2.5;
  filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.4));
  animation: shake 0.5s ease-in-out;
}

.agent-workflow-section :deep(.workflow-node-text) {
  font-size: 13px;
  font-weight: 600;
  text-anchor: middle;
  pointer-events: none;
  transition: all 0.3s;
  z-index: 3;
  position: relative;
}

.agent-workflow-section :deep(.workflow-node.pending .workflow-node-text) {
  fill: #4b5563;
}

.agent-workflow-section :deep(.workflow-node.running .workflow-node-text) {
  fill: #ffffff;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  animation: textPulse 1.5s ease-in-out infinite;
}

.agent-workflow-section :deep(.workflow-node.completed .workflow-node-text) {
  fill: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.agent-workflow-section :deep(.workflow-node.failed .workflow-node-text) {
  fill: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.agent-workflow-section :deep(.workflow-edge) {
  stroke: #9ca3af;
  stroke-width: 2;
  fill: none;
  marker-end: url(#arrowhead);
  transition: all 0.3s;
  opacity: 0.7;
  z-index: 1;
  position: relative;
}

.agent-workflow-section :deep(.workflow-edge.dashed) {
  stroke-dasharray: 5, 5;
}

.agent-workflow-section :deep(.workflow-edge.active) {
  stroke: #3b82f6;
  stroke-width: 3;
  opacity: 1;
  filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.6));
  animation: edgeFlow 2s linear infinite;
}

@keyframes pulseGlow {
  0%, 100% {
    filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.9));
  }
}

@keyframes completedGlow {
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.4));
  }
  50% {
    filter: drop-shadow(0 0 12px rgba(16, 185, 129, 0.6));
  }
}

@keyframes textPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.9;
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-3px);
  }
  75% {
    transform: translateX(3px);
  }
}

@keyframes edgeFlow {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: -20;
  }
}

.workflow-container {
  position: relative;
}

.workflow-status-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(124, 58, 237, 0.08);
  color: #4c1d95;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.status-pulse-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #7c3aed;
  position: relative;
}

.status-pulse-dot::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(124, 58, 237, 0.4);
  transform: translate(-50%, -50%);
  animation: statusPulse 1.6s ease-out infinite;
}

@keyframes statusPulse {
  0% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(0.4);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.6);
  }
}

.agent-workflow-section :deep(.arrowhead-active) {
  fill: #3b82f6;
}

.markdown-body-custom {
  padding: 16px;
  border-radius: 8px;
  max-height: 600px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.6;
}

.empty-state {
  color: #6b7280;
  text-align: center;
  padding: 40px 0;
  font-size: 14px;
  }
  </style>
  
<style>
/* 引入 GitHub Markdown 样式 */
@import url('https://cdn.jsdelivr.net/npm/github-markdown-css@5.5.1/github-markdown.min.css');
</style>
