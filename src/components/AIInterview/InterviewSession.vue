<template>
  <div class="session">
    <div class="session-header">
      <div class="session-left">
        <span class="pill">进行中</span>
        <span class="pill subtle">{{ jobRoleLabel }}</span>
        <span class="pill subtle">难度：{{ difficultyLabel }}</span>
        <span v-if="retestLabel" class="pill mode">{{ retestLabel }}</span>
      </div>
      <div class="session-right">
        <div class="timer">
          <span class="timer-dot" :class="{ on: isRunning }"></span>
          <span class="timer-text">{{ timeText }}</span>
        </div>
        <button type="button" class="btn-ghost" @click="endNow">结束面试</button>
      </div>
    </div>

    <div class="layout">
      <!-- 左：视频区域（原型） -->
      <div class="video">
        <div class="video-topbar">
          <span class="dot green"></span>
          <span class="dot yellow"></span>
          <span class="dot red"></span>
          <span class="video-title">视频面试 · 预览</span>
        </div>

        <div class="video-main">
          <div class="avatar"></div>
          <div class="wave"></div>
          <div class="video-hint">
            <div class="video-hint-title">摄像头 / 麦克风占位</div>
            <div class="video-hint-desc">接入真实 WebRTC 后，这里将显示你的视频流与设备状态。</div>
          </div>
        </div>

        <div class="video-controls">
          <button type="button" class="ctrl" :class="{ active: cameraOn }" @click="cameraOn = !cameraOn">
            {{ cameraOn ? '摄像头：开' : '摄像头：关' }}
          </button>
          <button type="button" class="ctrl" :class="{ active: micOn }" @click="micOn = !micOn">
            {{ micOn ? '麦克风：开' : '麦克风：关' }}
          </button>
          <button type="button" class="ctrl primary" @click="pushQuickAnswer">
            一键示范回答
          </button>
        </div>
      </div>

      <!-- 右：对话框 -->
      <div class="chat">
        <div class="chat-header">
          <div class="chat-title">AI 面试官</div>
          <div class="chat-subtitle">右侧对话会记录本次问答，用于生成面试评价与错题本。</div>
        </div>

        <div ref="chatBodyRef" class="chat-body">
          <div v-for="m in messages" :key="m.id" class="msg" :class="m.role">
            <div class="msg-tag">{{ m.role === 'ai' ? 'AI 面试官' : '我的回答' }}</div>
            <div class="msg-bubble">{{ m.text }}</div>
          </div>

          <div v-if="aiTyping" class="msg ai">
            <div class="msg-tag">AI 面试官</div>
            <div class="msg-bubble typing">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
          </div>
        </div>

        <div class="chat-actions">
          <button type="button" class="chip" @click="sendChip('我需要一点时间思考。')">需要思考</button>
          <button type="button" class="chip" @click="sendChip('我可以用一个例子说明。')">用例子说明</button>
          <button type="button" class="chip" @click="sendChip('我想先确认一下问题边界。')">确认边界</button>
          <button type="button" class="chip" @click="nextQuestion">下一题</button>
        </div>

        <form class="chat-input" @submit.prevent="sendText">
          <input
            v-model="draft"
            class="input"
            type="text"
            placeholder="输入你的回答（原型：后续可接语音转写）"
          />
          <button type="submit" class="send" :disabled="!draft.trim()">发送</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  config: { type: Object, required: true },
  seedQuestions: { type: Array, default: () => [] },
})

const emit = defineEmits(['end'])

const cameraOn = ref(true)
const micOn = ref(true)
const aiTyping = ref(false)
const draft = ref('')
const chatBodyRef = ref(null)

const isRunning = ref(true)
const seconds = ref(0)
let timer = null

const pad2 = (n) => String(n).padStart(2, '0')
const timeText = computed(() => `${pad2(Math.floor(seconds.value / 60))}:${pad2(seconds.value % 60)}`)

const jobRoleLabel = computed(() => {
  const map = {
    FRONTEND: '前端开发',
    BACKEND: '后端开发',
    FULLSTACK: '全栈开发',
    DATA: '数据 / AI',
    PRODUCT: '产品 / 项目',
  }
  return map[props.config.jobRole] || '目标岗位'
})

const difficultyLabel = computed(() => {
  const map = { EASY: '入门', MED: '进阶', HARD: '高强度' }
  return map[props.config.difficulty] || '未选择'
})

const retestLabel = computed(() => {
  if (props.config.retestMode === 'WRONG_ONLY') return '错题重测'
  if (props.config.retestMode === 'FULL') return '完整重测'
  return ''
})

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`
const messages = ref([
  {
    id: makeId(),
    role: 'ai',
    text: '我们开始吧。请用 30 秒介绍一下你自己，并说明你对目标岗位的理解。',
  },
])

const questionPool = computed(() => {
  const qs = Array.isArray(props.seedQuestions) ? props.seedQuestions : []
  if (qs.length > 0) return qs.map((q) => (typeof q === 'string' ? q : q.question)).filter(Boolean)
  return [
    '你在最近一个项目中承担的核心职责是什么？请给出可量化的结果。',
    '描述一次你遇到的棘手问题：你如何拆解、权衡方案并最终落地？',
    '你如何确保代码质量与可维护性？举一个你做过的具体实践。',
  ]
})

const qIndex = ref(0)
const askedQuestions = ref([
  '请用 30 秒介绍一下你自己，并说明你对目标岗位的理解。'
])

const scrollToBottom = async () => {
  await nextTick()
  const el = chatBodyRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

const pushAI = async (text) => {
  aiTyping.value = true
  await scrollToBottom()
  setTimeout(async () => {
    messages.value.push({ id: makeId(), role: 'ai', text })
    aiTyping.value = false
    await scrollToBottom()
  }, 520)
}

const sendText = async () => {
  const t = draft.value.trim()
  if (!t) return
  messages.value.push({ id: makeId(), role: 'user', text: t })
  draft.value = ''
  await scrollToBottom()
  await pushAI('收到。你可以再补充一下：你做了哪些取舍？为什么？')
}

const sendChip = async (text) => {
  messages.value.push({ id: makeId(), role: 'user', text })
  await scrollToBottom()
  await pushAI('好的。那我们继续。')
}

const nextQuestion = async () => {
  qIndex.value = (qIndex.value + 1) % questionPool.value.length
  const q = questionPool.value[qIndex.value]
  askedQuestions.value.push(q)
  await pushAI(`下一题：${q}`)
}

const pushQuickAnswer = async () => {
  const t = '我负责将需求拆解为可交付任务，设计组件与接口，解决性能瓶颈，并通过埋点与回归测试保证稳定上线。最终将页面首屏时间降低约 30%。'
  messages.value.push({ id: makeId(), role: 'user', text: t })
  await scrollToBottom()
  await pushAI('不错。请把“降低 30%”的测量方法说清楚：指标是什么？对比基线如何确定？')
}

const endNow = () => {
  isRunning.value = false
  emit('end', {
    endedAt: Date.now(),
    seconds: seconds.value,
    timeText: timeText.value,
    config: { ...props.config },
    askedQuestions: [...askedQuestions.value],
    messages: messages.value.map((m) => ({ role: m.role, text: m.text })),
  })
}

onMounted(() => {
  timer = setInterval(() => {
    if (!isRunning.value) return
    seconds.value += 1
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

watch(
  () => props.config,
  () => {
    // 配置变更后不清空对话，保持体验连续
  }
)
</script>

<style scoped>
.session {
  background: #ffffff;
  border-radius: 22px;
  padding: 16px 16px 18px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(226, 232, 240, 0.9);
  height: calc(100vh - 180px);
  min-height: 540px;
}

.session-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  margin-bottom: 12px;
}

.session-left {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill {
  font-size: 12px;
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

.pill.mode {
  background: rgba(234, 179, 8, 0.12);
  color: #92400e;
}

.session-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.timer {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #f9fafb;
}

.timer-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.8);
}

.timer-dot.on {
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.18);
}

.timer-text {
  font-size: 13px;
  font-weight: 900;
  color: #111827;
  letter-spacing: 0.06em;
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

.btn-ghost:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1.35fr);
  gap: 12px;
  height: 100%;
  min-height: 0;
}

.video {
  border-radius: 18px;
  background: #020617;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.85);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.video-topbar {
  height: 28px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
}

.dot.green {
  background: #22c55e;
}

.dot.yellow {
  background: #eab308;
}

.dot.red {
  background: #ef4444;
}

.video-title {
  margin-left: 6px;
  font-size: 11px;
  color: rgba(226, 232, 240, 0.85);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.video-main {
  flex: 1;
  padding: 16px 12px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.avatar {
  width: 88px;
  height: 88px;
  border-radius: 999px;
  background: radial-gradient(circle at top, #4f46e5, #1e293b);
  box-shadow:
    0 0 0 4px rgba(15, 23, 42, 0.9),
    0 0 0 1px rgba(148, 163, 184, 0.8);
}

.wave {
  width: 82%;
  height: 14px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(56, 189, 248, 0.22),
    rgba(59, 130, 246, 0.78),
    rgba(56, 189, 248, 0.22)
  );
}

.video-hint {
  width: 100%;
  max-width: 320px;
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: #e5e7eb;
  text-align: center;
}

.video-hint-title {
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 2px;
}

.video-hint-desc {
  font-size: 11px;
  color: rgba(226, 232, 240, 0.75);
  line-height: 1.6;
}

.video-controls {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(2, 6, 23, 0.7);
}

.ctrl {
  flex: 1;
  border-radius: 14px;
  padding: 8px 10px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(15, 23, 42, 0.45);
  color: rgba(226, 232, 240, 0.92);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.14s ease, background-color 0.14s ease, border-color 0.14s ease;
}

.ctrl:hover {
  transform: translateY(-1px);
  border-color: rgba(129, 140, 248, 0.55);
}

.ctrl.active {
  border-color: rgba(34, 197, 94, 0.6);
  background: rgba(34, 197, 94, 0.12);
}

.ctrl.primary {
  border: none;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  box-shadow: 0 12px 28px rgba(124, 58, 237, 0.22);
}

.chat {
  border-radius: 18px;
  background: #f9fafb;
  border: 1px solid rgba(226, 232, 240, 0.9);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 12px 12px 10px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(255, 255, 255, 0.86);
}

.chat-title {
  font-size: 14px;
  font-weight: 900;
  color: #111827;
}

.chat-subtitle {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  line-height: 1.6;
}

.chat-body {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.msg {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 92%;
}

.msg.ai {
  align-self: flex-start;
}

.msg.user {
  align-self: flex-end;
}

.msg-tag {
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
}

.msg.user .msg-tag {
  text-align: right;
}

.msg-bubble {
  padding: 10px 12px;
  border-radius: 16px;
  font-size: 13px;
  line-height: 1.7;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #ffffff;
  color: #111827;
}

.msg.ai .msg-bubble {
  background: #eef2ff;
  border-color: rgba(199, 210, 254, 0.9);
  color: #3730a3;
}

.msg.user .msg-bubble {
  background: #ecfdf5;
  border-color: rgba(187, 247, 208, 0.9);
  color: #166534;
}

.typing {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(55, 48, 163, 0.6);
  animation: bounce 0.8s infinite ease-in-out;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.12s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.24s;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

.chat-actions {
  padding: 10px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border-top: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(255, 255, 255, 0.8);
}

.chip {
  border-radius: 999px;
  padding: 6px 10px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #ffffff;
  color: #4b5563;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: background-color 0.12s ease, transform 0.12s ease;
}

.chip:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}

.chat-input {
  padding: 10px 12px 12px;
  display: flex;
  gap: 8px;
  border-top: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(255, 255, 255, 0.92);
}

.input {
  flex: 1;
  border-radius: 999px;
  padding: 10px 12px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #f9fafb;
  font-size: 13px;
  outline: none;
  transition: border-color 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease;
}

.input:focus {
  border-color: rgba(79, 70, 229, 0.55);
  background: #ffffff;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.12);
}

.send {
  border-radius: 999px;
  padding: 10px 14px;
  border: none;
  background: #111827;
  color: #f9fafb;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.12s ease, background-color 0.12s ease;
  white-space: nowrap;
}

.send:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.send:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #0f172a;
}

@media (max-width: 960px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
    min-height: auto;
  }
}
</style>

