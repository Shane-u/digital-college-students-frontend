<template>
  <div class="session">
    <InterviewSessionHeader
      status-label="通话中"
      :type-label="typeLabel"
      :persona-label="personaLabel"
      :difficulty-label="difficultyLabel"
      :time-text="timeText"
      :is-running="isRunning"
      :finishing="finishing"
      end-button-text="挂断并结束"
      end-button-loading-text="处理中..."
      @end="hangup"
    />

    <div class="layout">
      <RealtimeVoicePanel
        ref="voicePanelRef"
        :local-stream="localStreamRef"
        :remote-stream="remoteStreamRef"
        :connecting="connecting"
        :connected="connected"
        :muted="muted"
        :finishing="finishing"
        @connect="connect"
        @toggle-mute="toggleMute"
        @hangup="hangup"
      />

      <div class="panel">
        <div class="panel-card">
          <div class="panel-title">聊天内容</div>
          <div ref="logRef" class="log chatlog">
            <div v-for="(m, idx) in transcripts" :key="idx" class="t-line" :class="m.role">
              <div class="t-bubble">{{ m.text }}</div>
            </div>
          </div>
        </div>

        <div v-if="error" class="inline-error">
          <div class="inline-error-text">{{ error }}</div>
          <button type="button" class="inline-error-btn" @click="error = ''">知道了</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { aiInterviewApi } from '../../../api/aiInterview'
import { ElMessageBox } from 'element-plus'
import InterviewSessionHeader from './InterviewSessionHeader.vue'
import RealtimeVoicePanel from './RealtimeVoicePanel.vue'

const props = defineProps({
  sessionId: { type: [String, Number], required: true },
  config: { type: Object, required: true },
  /** 默认 ws host；可后续接 env */
  wsBaseUrl: { type: String, default: 'ws://localhost:8081' },
  /** 未登录场景可传 userId（也会尝试从 localStorage 读取） */
  userId: { type: [String, Number], default: null },
})
const emit = defineEmits(['end'])

const voicePanelRef = ref(null)
const logRef = ref(null)
const logs = ref([])
const transcripts = ref([])
const error = ref('')

const wsStatus = ref('CLOSED') // CLOSED | CONNECTING | OPEN
const rtcStatus = ref('IDLE') // IDLE | CONNECTING | CONNECTED | CLOSED
const connecting = ref(false)
const connected = ref(false)
const muted = ref(false)
const finishing = ref(false)

let ws = null
let pc = null
let localStream = null
const localStreamRef = ref(null)
const remoteStreamRef = ref(null)

const loadingQuestion = ref(false)
const currentQuestion = ref(null)

const typeLabel = computed(() => {
  const map = {
    MIXED: '混合面试',
    TECHNICAL: '技术面试',
    BEHAVIORAL: '行为面试',
  }
  return map[props.config.interviewType] || '未选择'
})

const personaLabel = computed(() => {
  const map = {
    mentor: '导师型面试官',
    strict: '严格型面试官',
    hr: 'HR 面试官',
  }
  return map[props.config.persona] || '未选择'
})

const difficultyLabel = computed(() => {
  const map = {
    JUNIOR: '初级阶段',
    MID: '中级阶段',
    SENIOR: '高级阶段',
  }
  return map[props.config.difficulty] || '未选择'
})

const effectiveUserId = computed(() => {
  if (props.userId != null && props.userId !== '') return String(props.userId)
  try {
    const u = JSON.parse(localStorage.getItem('userInfo') || '{}')
    const candidate = u?.userId ?? u?.id ?? u?.user_id ?? u?.userID ?? null
    if (candidate != null && candidate !== '') return String(candidate)
  } catch (_) {}
  return null
})

const log = async (msg, obj) => {
  const line = obj ? `${msg} ${JSON.stringify(obj)}` : msg
  logs.value.push(line)
  await nextTick()
  const el = logRef.value
  if (el) el.scrollTop = el.scrollHeight
}

const pushTranscript = async (role, text) => {
  const t = String(text || '').trim()
  if (!t) return
  transcripts.value.push({ role, text: t })
  await nextTick()
  const el = logRef.value
  if (el) el.scrollTop = el.scrollHeight
}

const isRunning = ref(true)
const seconds = ref(0)
let timer = null
const pad2 = (n) => String(n).padStart(2, '0')
const timeText = computed(() => `${pad2(Math.floor(seconds.value / 60))}:${pad2(seconds.value % 60)}`)

const cleanup = () => {
  try {
    if (ws) {
      ws.onopen = null
      ws.onmessage = null
      ws.onclose = null
      ws.onerror = null
      if (ws.readyState === WebSocket.OPEN) ws.close()
    }
  } catch (_) {}
  ws = null
  wsStatus.value = 'CLOSED'

  try {
    if (pc) pc.close()
  } catch (_) {}
  pc = null
  rtcStatus.value = 'CLOSED'
  connected.value = false
  connecting.value = false

  try {
    if (localStream) localStream.getTracks().forEach((t) => t.stop())
  } catch (_) {}
  localStream = null
  localStreamRef.value = null
  remoteStreamRef.value = null
}

const connect = async () => {
  if (connecting.value || connected.value) return
  connecting.value = true
  error.value = ''
  wsStatus.value = 'CONNECTING'
  rtcStatus.value = 'CONNECTING'

  try {
    const params = new URLSearchParams()
    params.set('sessionId', String(props.sessionId))
    if (effectiveUserId.value) params.set('userId', effectiveUserId.value)
    const wsUrl = `${String(props.wsBaseUrl || '').replace(/\/+$/, '')}/ws/ai-interview?${params.toString()}`
    await log('connecting ws', { wsUrl })
    ws = new WebSocket(wsUrl)

    ws.onopen = async () => {
      wsStatus.value = 'OPEN'
      await log('ws open')
      // await fetchNextQuestion()
      await startWebRTC()
    }

    ws.onmessage = async (event) => {
      let msg = null
      try {
        msg = JSON.parse(event.data)
      } catch {
        await log('ws recv text', { data: event.data })
        return
      }
      await log('ws recv', msg)

      if (msg.event === 'answer' && msg.sdp) {
        await handleAnswer(msg.sdp)
      } else if (msg.event === 'asrFinal') {
        await pushTranscript('user', msg.text)
      } else if (msg.event === 'llmFinal') {
        await pushTranscript('ai', msg.text)
      } else if (msg.event === 'hangup') {
        await log('server hangup')
        cleanup()
      }
    }

    ws.onerror = async (e) => {
      await log('ws error', { e: String(e?.message || e) })
    }

    ws.onclose = async (evt) => {
      wsStatus.value = 'CLOSED'
      await log('ws closed', { code: evt?.code, reason: evt?.reason, wasClean: evt?.wasClean })
      cleanup()
    }
  } catch (e) {
    error.value = e?.message || '建立连接失败'
    cleanup()
  } finally {
    connecting.value = false
  }
}

const startWebRTC = async () => {
  try {
    pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })

    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    localStreamRef.value = localStream
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream))
    await log('local media added')

    pc.ontrack = async (event) => {
      const el = voicePanelRef.value?.remoteAudioRef
      if (!el) return
      const s = event.streams[0]
      remoteStreamRef.value = s || null
      el.srcObject = s
      try {
        await el.play()
      } catch (e) {
        await log('audio.play failed', { e: e?.message || String(e) })
      }
      connected.value = true
      rtcStatus.value = 'CONNECTED'
      await log('remote track received', { tracks: event.streams[0]?.getTracks?.().length })
    }

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    await log('created offer')

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event: 'offer', sdp: offer.sdp }))
      await log('sent offer')
    }
  } catch (e) {
    error.value = `WebRTC 启动失败：${e?.message || String(e)}`
    cleanup()
  }
}

const handleAnswer = async (sdp) => {
  if (!pc) return
  try {
    await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp }))
    rtcStatus.value = 'CONNECTED'
    await log('set remote description (answer)')
  } catch (e) {
    await log('handle answer failed', { e: e?.message || String(e) })
  }
}

const toggleMute = async () => {
  muted.value = !muted.value

  try {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => { t.enabled = !muted.value })
    }
    if (pc) {
      pc.getSenders()
        .filter((s) => s.track && s.track.kind === 'audio')
        .forEach((s) => { s.track.enabled = !muted.value })
    }
  } catch (_) {}

  await log(muted.value ? 'muted' : 'unmuted')
}

const hangup = async () => {
  if (finishing.value) return
  let ok = false
  try {
    await ElMessageBox.confirm(
      '是否生成面试报告？\n选择“取消”将直接结束面试，不生成报告。',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    ok = true
  } catch (_) {
    ok = false
  }
  finishing.value = true
  error.value = ''
  try {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ command: 'hangup', reason: 'user_requested', initiator: 'caller' }))
      await log('sent hangup')
    }
  } catch (_) {}

  // 本端清理
  cleanup()

  if (!ok) {
    isRunning.value = false
    emit('end', {
      endedAt: Date.now(),
      seconds: seconds.value,
      timeText: timeText.value,
      sessionId: props.sessionId,
      generateReport: false,
      report: null,
      config: { ...props.config },
      messages: transcripts.value.map((m) => ({ role: m.role, text: m.text })),
    })
    finishing.value = false
    return
  }

  // 用户确认生成报告才调用后端 finish/getReport
  try {
    const finishRes = await aiInterviewApi.finishSession(props.sessionId)
    const reportRes = await aiInterviewApi.getReport(props.sessionId).catch(() => null)
    isRunning.value = false
    emit('end', {
      endedAt: Date.now(),
      seconds: seconds.value,
      timeText: timeText.value,
      sessionId: props.sessionId,
      generateReport: true,
      report: reportRes || finishRes,
      config: { ...props.config },
      messages: transcripts.value.map((m) => ({ role: m.role, text: m.text })),
    })
  } catch (e) {
    error.value = e?.message || '结束面试失败'
  } finally {
    finishing.value = false
  }
}

const sendBindQuestion = async (questionId) => {
  if (!questionId) return
  try {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event: 'bindQuestion', questionId: String(questionId) }))
      await log('sent bindQuestion', { questionId: String(questionId) })
    }
  } catch (e) {
    await log('send bindQuestion failed', { e: e?.message || String(e) })
  }
}

const fetchNextQuestion = async () => {
  if (loadingQuestion.value) return
  loadingQuestion.value = true
  error.value = ''
  try {
    const q = await aiInterviewApi.nextQuestion(props.sessionId, { needTtsAudio: false })
    currentQuestion.value = q
    await sendBindQuestion(q?.questionId)
  } catch (e) {
    error.value = e?.message || '获取下一题失败'
  } finally {
    loadingQuestion.value = false
  }
}

onMounted(() => {
  timer = setInterval(() => {
    if (!isRunning.value) return
    seconds.value += 1
  }, 1000)
  log('准备就绪：点击“建立语音连接”开始。')
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  cleanup()
})
</script>

<style scoped>
.session {
  background: #ffffff;
  border-radius: 22px;
  padding: 16px 16px 18px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(226, 232, 240, 0.9);
  height: calc(100vh - 120px);
  min-height: 420px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.18fr);
  gap: 12px;
  flex: 1;
  min-height: 0;
  height: 100%;
}

.ctrl:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(129, 140, 248, 0.55);
}

.ctrl:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.ctrl.danger {
  border: 1px solid rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.12);
  color: rgba(254, 226, 226, 0.96);
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  height: 100%;
}

.panel-card {
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.9);
  padding: 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
}

.panel-title {
  font-size: 14px;
  font-weight: 900;
  color: #111827;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.log {
  flex: 1;
  height: auto;
  overflow: auto;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.9);
  padding: 10px;
  color: #111827;
}

.log.chatlog {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 14px;
  line-height: 1.7;
}

.t-line {
  display: flex;
  max-width: 96%;
}

.t-line.ai {
  justify-content: flex-start;
}

.t-line.user {
  justify-content: flex-end;
  align-self: flex-end;
}

.t-bubble {
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #f8fafc;
  color: #0f172a;
  white-space: pre-wrap;
  word-break: break-word;
}

.t-line.ai .t-bubble {
  background: rgba(79, 70, 229, 0.08);
  border-color: rgba(129, 140, 248, 0.45);
}

.t-line.user .t-bubble {
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.35);
}

.inline-error {
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
  font-weight: 900;
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

@media (max-width: 960px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>

