<template>
  <div class="session">
    <div class="session-header">
      <div class="session-left">
        <span class="pill">进行中</span>
        <span class="pill subtle">会话：{{ sessionId }}</span>
        <span class="pill subtle">类型：{{ config.interviewType }}</span>
        <span class="pill subtle">面试官：{{ config.persona }}</span>
        <span class="pill subtle">经验：{{ config.difficulty }}</span>
      </div>
      <div class="session-right">
        <div class="timer">
          <span class="timer-dot" :class="{ on: isRunning }"></span>
          <span class="timer-text">{{ timeText }}</span>
        </div>
        <button type="button" class="btn-ghost danger" :disabled="finishing" @click="finish">
          {{ finishing ? '生成报告中...' : '结束面试' }}
        </button>
      </div>
    </div>

    <div class="layout">
      <div class="chat">
        <div class="chat-header">
          <div class="chat-title">AI 面试官（轮询）</div>
          <div class="chat-subtitle">AI 问一题，你录音作答并上传，系统会生成报告。</div>
        </div>

        <div ref="chatBodyRef" class="chat-body">
          <div v-for="m in messages" :key="m.id" class="msg" :class="m.role">
            <div class="msg-tag">{{ m.role === 'ai' ? 'AI 面试官' : '我的回答' }}</div>
            <div class="msg-bubble">
              <div class="msg-text">{{ m.text }}</div>
              <div v-if="m.audioUrl" class="msg-audio">
                <audio :src="m.audioUrl" controls />
              </div>
            </div>
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

        <div class="controls">
          <div class="controls-left">
            <button type="button" class="chip" :disabled="loadingQuestion || recording || uploading" @click="nextQuestion(false)">
              {{ loadingQuestion ? '获取中...' : '下一题' }}
            </button>
            <button type="button" class="chip ghost" :disabled="loadingQuestion || recording || uploading" @click="nextQuestion(true)">
              下一题 + TTS
            </button>
          </div>
          <div class="controls-right">
            <span v-if="recordStatus" class="hint">{{ recordStatus }}</span>
          </div>
        </div>

        <div class="record">
          <button type="button" class="btn-rec" :disabled="recording || uploading" @click="startRecord">
            开始录音
          </button>
          <button type="button" class="btn-rec danger" :disabled="!recording || uploading" @click="stopRecord">
            结束并上传
          </button>
          <button type="button" class="btn-rec ghost" :disabled="uploading" @click="cancelRecord">
            取消
          </button>
        </div>

        <div v-if="error" class="inline-error">
          <div class="inline-error-text">{{ error }}</div>
          <button type="button" class="inline-error-btn" @click="error = ''">知道了</button>
        </div>
      </div>

      <div class="side">
        <div class="side-card">
          <div class="side-title">当前题目</div>
          <div v-if="currentQuestion" class="qbox">
            <div class="qmeta">
              <span class="pill">Q{{ currentQuestion.orderNo ?? '-' }}</span>
              <span class="pill subtle">ID：{{ currentQuestion.questionId }}</span>
              <span v-if="currentQuestion.questionType" class="pill subtle">{{ currentQuestion.questionType }}</span>
            </div>
            <div class="qtext">{{ currentQuestion.questionText }}</div>
            <div v-if="currentQuestion.audioUrl" class="qaudio">
              <div class="qaudio-label">TTS</div>
              <audio :src="currentQuestion.audioUrl" controls />
            </div>
          </div>
          <div v-else class="qempty">点击“下一题”开始。</div>
        </div>

        <div class="side-card">
          <div class="side-title">回答要求</div>
          <ul class="tips">
            <li>建议每题 45～90 秒</li>
            <li>先一句话结论，再 2～3 点展开</li>
            <li>尽量给指标与口径（对比基线）</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { aiInterviewApi } from '../../../api/aiInterview'

const props = defineProps({
  sessionId: { type: [String, Number], required: true },
  config: { type: Object, required: true },
})
const emit = defineEmits(['end'])

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`
const messages = ref([])
const aiTyping = ref(false)
const chatBodyRef = ref(null)

const currentQuestion = ref(null)
const loadingQuestion = ref(false)
const finishing = ref(false)
const error = ref('')

const isRunning = ref(true)
const seconds = ref(0)
let timer = null

const pad2 = (n) => String(n).padStart(2, '0')
const timeText = computed(() => `${pad2(Math.floor(seconds.value / 60))}:${pad2(seconds.value % 60)}`)

const scrollToBottom = async () => {
  await nextTick()
  const el = chatBodyRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

const pushAI = async (text, extra = {}) => {
  aiTyping.value = true
  await scrollToBottom()
  setTimeout(async () => {
    messages.value.push({ id: makeId(), role: 'ai', text, ...extra })
    aiTyping.value = false
    await scrollToBottom()
  }, 240)
}

const pushUser = async (text, extra = {}) => {
  messages.value.push({ id: makeId(), role: 'user', text, ...extra })
  await scrollToBottom()
}

const nextQuestion = async (needTtsAudio) => {
  if (loadingQuestion.value) return
  loadingQuestion.value = true
  error.value = ''
  try {
    const q = await aiInterviewApi.nextQuestion(props.sessionId, { needTtsAudio })
    currentQuestion.value = q
    await pushAI(q.questionText || '（空题目）', q.audioUrl ? { audioUrl: q.audioUrl } : {})
  } catch (e) {
    error.value = e?.message || '获取下一题失败'
  } finally {
    loadingQuestion.value = false
  }
}

// ===== 录音 & 上传 =====
const recording = ref(false)
const uploading = ref(false)
const recordStatus = ref('')

let recordStream = null
let recorder = null
let chunks = []
let recordStartedAt = 0

const startRecord = async () => {
  if (recording.value || uploading.value) return
  if (!currentQuestion.value?.questionId) {
    error.value = '请先获取题目后再录音'
    return
  }
  try {
    recordStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    chunks = []
    recordStartedAt = Date.now()
    const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm'
    recorder = new MediaRecorder(recordStream, { mimeType: mime })
    recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data) }
    recorder.start(200)
    recording.value = true
    recordStatus.value = '正在录音…'
  } catch (e) {
    error.value = `无法获取麦克风权限：${e?.message || 'unknown'}`
  }
}

const stopTracks = () => {
  if (recordStream) {
    recordStream.getTracks().forEach(t => t.stop())
    recordStream = null
  }
}

const cancelRecord = () => {
  if (recorder && recording.value) {
    try { recorder.stop() } catch (_) {}
  }
  recorder = null
  chunks = []
  recording.value = false
  recordStatus.value = ''
  stopTracks()
}

const stopRecord = async () => {
  if (!recorder || !recording.value || uploading.value) return
  uploading.value = true
  recordStatus.value = '上传中…'
  const qid = currentQuestion.value?.questionId
  const durationSeconds = Math.max(1, Math.round((Date.now() - recordStartedAt) / 1000))

  recorder.stop()
  recorder.onstop = async () => {
    try {
      const blob = new Blob(chunks, { type: 'audio/webm' })
      const file = new File([blob], 'answer.webm', { type: 'audio/webm' })
      const res = await aiInterviewApi.uploadAnswerAudio(props.sessionId, {
        audioFile: file,
        questionId: qid,
        durationSeconds,
      })
      await pushUser(res?.textAnswer || '（已上传语音回答）')
      recordStatus.value = '已上传'
      setTimeout(() => { recordStatus.value = '' }, 1200)
    } catch (e) {
      error.value = e?.message || '上传回答失败'
      recordStatus.value = ''
    } finally {
      uploading.value = false
      recording.value = false
      recorder = null
      chunks = []
      stopTracks()
    }
  }
}

const finish = async () => {
  if (finishing.value) return
  finishing.value = true
  error.value = ''
  try {
    const r = await aiInterviewApi.finishSession(props.sessionId)
    const report = await aiInterviewApi.getReport(props.sessionId).catch(() => null)
    isRunning.value = false
    emit('end', {
      endedAt: Date.now(),
      seconds: seconds.value,
      timeText: timeText.value,
      sessionId: props.sessionId,
      report: report || r,
      config: { ...props.config },
      messages: messages.value.map(m => ({ role: m.role, text: m.text })),
    })
  } catch (e) {
    error.value = e?.message || '结束面试失败'
  } finally {
    finishing.value = false
  }
}

onMounted(() => {
  timer = setInterval(() => {
    if (!isRunning.value) return
    seconds.value += 1
  }, 1000)
  pushAI('我们开始吧。点击“下一题”获取第一个问题。')
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  cancelRecord()
})
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
  font-weight: 900;
  cursor: pointer;
  transition: background-color 0.16s ease, transform 0.16s ease;
}

.btn-ghost:hover:not(:disabled) {
  background: #f1f5f9;
  transform: translateY(-1px);
}

.btn-ghost:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-ghost.danger {
  border-color: rgba(220, 38, 38, 0.25);
  background: rgba(220, 38, 38, 0.06);
  color: #b91c1c;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
  gap: 12px;
  height: 100%;
  min-height: 0;
}

.chat {
  border-radius: 18px;
  background: #f9fafb;
  border: 1px solid rgba(226, 232, 240, 0.9);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
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
  min-height: 0;
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

.msg-audio {
  margin-top: 8px;
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

.controls {
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-top: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(255, 255, 255, 0.8);
}

.controls-left {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.hint {
  font-size: 12px;
  color: #64748b;
  font-weight: 800;
}

.chip {
  border-radius: 999px;
  padding: 6px 10px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #ffffff;
  color: #4b5563;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  transition: background-color 0.12s ease, transform 0.12s ease;
}

.chip:hover:not(:disabled) {
  background: #f1f5f9;
  transform: translateY(-1px);
}

.chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chip.ghost {
  background: rgba(255, 255, 255, 0.9);
  color: #4b5563;
  border: 1px dashed rgba(148, 163, 184, 0.7);
}

.record {
  padding: 10px 12px 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  border-top: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(255, 255, 255, 0.92);
}

.btn-rec {
  border-radius: 999px;
  padding: 8px 14px;
  border: none;
  background: #111827;
  color: #f9fafb;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.12s ease, background-color 0.12s ease;
}

.btn-rec:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #0f172a;
}

.btn-rec:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-rec.danger {
  background: linear-gradient(135deg, #ef4444, #f97316);
}

.btn-rec.ghost {
  background: rgba(255, 255, 255, 0.9);
  color: #4b5563;
  border: 1px solid rgba(148, 163, 184, 0.6);
}

.btn-rec.ghost:hover:not(:disabled) {
  background: #f1f5f9;
}

.inline-error {
  margin: 10px 12px 12px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(220, 38, 38, 0.06);
  border: 1px solid rgba(220, 38, 38, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.inline-error-text {
  font-size: 12px;
  color: #b91c1c;
  font-weight: 800;
}

.inline-error-btn {
  border-radius: 999px;
  padding: 6px 10px;
  border: 1px solid rgba(220, 38, 38, 0.35);
  background: rgba(255, 255, 255, 0.9);
  color: #b91c1c;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.side {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.side-card {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(226, 232, 240, 0.9);
  padding: 12px;
}

.side-title {
  font-size: 12px;
  font-weight: 900;
  color: #111827;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.qbox {
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.9);
  padding: 10px 10px;
}

.qmeta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.qtext {
  font-size: 13px;
  font-weight: 800;
  color: #111827;
  line-height: 1.7;
}

.qaudio {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(226, 232, 240, 0.9);
}

.qaudio-label {
  font-size: 11px;
  font-weight: 900;
  color: #6b7280;
  margin-bottom: 6px;
}

.qempty {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.7;
  padding: 10px 2px;
}

.tips {
  margin: 0;
  padding-left: 18px;
  color: #475569;
  font-size: 12px;
  line-height: 1.8;
  font-weight: 700;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); opacity: 0.6; }
  50% { transform: translateY(-4px); opacity: 1; }
}

@media (max-width: 960px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>

