<template>
  <div class="session">
    <div class="session-header">
      <div class="session-left">
        <span class="pill">通话中</span>
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
        <button type="button" class="btn-ghost danger" :disabled="finishing" @click="hangup">
          {{ finishing ? '生成报告中...' : '挂断并结束' }}
        </button>
      </div>
    </div>

    <div class="layout">
      <div class="voice">
        <div class="voice-topbar">
          <span class="dot green"></span>
          <span class="dot yellow"></span>
          <span class="dot red"></span>
          <span class="voice-title">实时语音面试 · WebRTC</span>
        </div>

        <div class="voice-main">
          <div class="voice-avatar"></div>
          <div class="voice-wave"></div>
          <div class="voice-hint">
            <div class="voice-hint-title">实时通话面试</div>
            <div class="voice-hint-desc">
              建立连接后，你将听到 AI 面试官的声音；你的麦克风会作为上行音频发送。
            </div>
          </div>

          <div class="voice-audio">
            <audio ref="remoteAudioRef" controls autoplay />
          </div>
        </div>

        <div class="voice-controls">
          <button type="button" class="ctrl primary" :disabled="connecting || connected" @click="connect">
            {{ connected ? '已连接' : (connecting ? '连接中...' : '建立语音连接') }}
          </button>
          <button type="button" class="ctrl" :disabled="!connected" :class="{ active: muted }" @click="toggleMute">
            {{ muted ? '取消静音' : '静音' }}
          </button>
          <button type="button" class="ctrl danger" :disabled="!connected || finishing" @click="hangup">
            挂断
          </button>
        </div>
      </div>

      <div class="panel">
        <div class="panel-card">
          <div class="panel-title">状态</div>
          <div class="kv">
            <div class="k">WebSocket</div>
            <div class="v" :class="{ ok: wsStatus === 'OPEN', warn: wsStatus !== 'OPEN' }">{{ wsStatus }}</div>
          </div>
          <div class="kv">
            <div class="k">WebRTC</div>
            <div class="v" :class="{ ok: rtcStatus === 'CONNECTED', warn: rtcStatus !== 'CONNECTED' }">{{ rtcStatus }}</div>
          </div>
          <div class="kv">
            <div class="k">麦克风</div>
            <div class="v">{{ muted ? '静音' : '开启' }}</div>
          </div>
        </div>

        <div class="panel-card">
          <div class="panel-title">题目绑定（和 demo 一致）</div>
          <div class="q-actions">
            <label class="q-tts">
              <input type="checkbox" v-model="needTtsAudio" />
              <span>需要 TTS</span>
            </label>
            <button type="button" class="btn-q" :disabled="loadingQuestion || wsStatus !== 'OPEN'" @click="fetchNextQuestion">
              {{ loadingQuestion ? '获取中...' : '获取下一题' }}
            </button>
          </div>
          <div v-if="currentQuestion" class="q-box">
            <div class="q-meta">
              <span class="pill">Q{{ currentQuestion.orderNo ?? '-' }}</span>
              <span class="pill subtle">questionId：{{ currentQuestion.questionId }}</span>
              <span v-if="currentQuestion.questionType" class="pill subtle">{{ currentQuestion.questionType }}</span>
            </div>
            <div class="q-text">{{ currentQuestion.questionText }}</div>
            <div v-if="currentQuestion.audioUrl" class="q-audio">
              <div class="q-audio-label">TTS</div>
              <audio :src="currentQuestion.audioUrl" controls />
            </div>
          </div>
          <div v-else class="q-empty">连接成功后点击“获取下一题”，会自动通过 WS 发送 bindQuestion。</div>
        </div>

        <div class="panel-card">
          <div class="panel-title">通话日志</div>
          <div ref="logRef" class="log">
            <div v-for="(l, idx) in logs" :key="idx" class="log-line">{{ l }}</div>
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

const props = defineProps({
  sessionId: { type: [String, Number], required: true },
  config: { type: Object, required: true },
  /** 默认 ws host；可后续接 env */
  wsBaseUrl: { type: String, default: 'ws://localhost:8081' },
  /** 未登录场景可传 userId（也会尝试从 localStorage 读取） */
  userId: { type: [String, Number], default: null },
})
const emit = defineEmits(['end'])

const remoteAudioRef = ref(null)
const logRef = ref(null)
const logs = ref([])
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

const needTtsAudio = ref(false)
const loadingQuestion = ref(false)
const currentQuestion = ref(null)

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
      } else if (msg.event === 'asrDelta') {
        await log('ASR delta', { text: msg.text })
      } else if (msg.event === 'asrFinal') {
        await log('ASR final', { text: msg.text })
      } else if (msg.event === 'llmStream') {
        await log('LLM stream', { text: msg.text })
      } else if (msg.event === 'llmFinal') {
        await log('LLM final', { text: msg.text })
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

    localStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream))
    await log('local audio added')

    pc.ontrack = async (event) => {
      const el = remoteAudioRef.value
      if (!el) return
      el.srcObject = event.streams[0]
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
  const audioEl = remoteAudioRef.value
  if (audioEl) audioEl.muted = muted.value

  try {
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

  // 自动结束面试并拉报告（与 demo 行为一致）
  try {
    const finishRes = await aiInterviewApi.finishSession(props.sessionId)
    const reportRes = await aiInterviewApi.getReport(props.sessionId).catch(() => null)
    isRunning.value = false
    emit('end', {
      endedAt: Date.now(),
      seconds: seconds.value,
      timeText: timeText.value,
      sessionId: props.sessionId,
      report: reportRes || finishRes,
      config: { ...props.config },
      messages: [],
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
    const q = await aiInterviewApi.nextQuestion(props.sessionId, { needTtsAudio: needTtsAudio.value })
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
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 12px;
  height: 100%;
  min-height: 0;
}

.voice {
  border-radius: 18px;
  background: #020617;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.85);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.voice-topbar {
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

.dot.green { background: #22c55e; }
.dot.yellow { background: #eab308; }
.dot.red { background: #ef4444; }

.voice-title {
  margin-left: 6px;
  font-size: 11px;
  color: rgba(226, 232, 240, 0.85);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.voice-main {
  flex: 1;
  padding: 16px 12px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.voice-avatar {
  width: 88px;
  height: 88px;
  border-radius: 999px;
  background: radial-gradient(circle at top, #4f46e5, #1e293b);
  box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.9), 0 0 0 1px rgba(148, 163, 184, 0.8);
}

.voice-wave {
  width: 82%;
  height: 14px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.22), rgba(59, 130, 246, 0.78), rgba(56, 189, 248, 0.22));
}

.voice-hint {
  width: 100%;
  max-width: 360px;
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: #e5e7eb;
  text-align: center;
}

.voice-hint-title {
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 2px;
}

.voice-hint-desc {
  font-size: 11px;
  color: rgba(226, 232, 240, 0.75);
  line-height: 1.6;
}

.voice-audio {
  width: 100%;
  max-width: 520px;
  padding-top: 8px;
}

.voice-audio :deep(audio) {
  width: 100%;
}

.voice-controls {
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
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.14s ease, background-color 0.14s ease, border-color 0.14s ease;
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
}

.panel-card {
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(226, 232, 240, 0.9);
  padding: 12px;
}

.panel-title {
  font-size: 12px;
  font-weight: 900;
  color: #111827;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.q-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.q-tts {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 14px;
  background: #f9fafb;
  border: 1px solid rgba(226, 232, 240, 0.9);
  font-size: 12px;
  font-weight: 900;
  color: #475569;
  user-select: none;
}

.q-tts input {
  width: 14px;
  height: 14px;
}

.btn-q {
  border-radius: 999px;
  padding: 8px 14px;
  border: none;
  background: #111827;
  color: #f9fafb;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.12s ease, background-color 0.12s ease;
  white-space: nowrap;
}

.btn-q:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #0f172a;
}

.btn-q:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.q-box {
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.9);
  padding: 10px 10px;
}

.q-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.q-text {
  font-size: 13px;
  font-weight: 900;
  color: #111827;
  line-height: 1.7;
}

.q-audio {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(226, 232, 240, 0.9);
}

.q-audio-label {
  font-size: 11px;
  font-weight: 900;
  color: #6b7280;
  margin-bottom: 6px;
}

.q-empty {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.7;
  padding: 2px 2px;
}

.kv {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 14px;
  background: #f9fafb;
  border: 1px solid rgba(226, 232, 240, 0.9);
  margin-bottom: 8px;
}

.k {
  font-size: 12px;
  font-weight: 900;
  color: #475569;
}

.v {
  font-size: 12px;
  font-weight: 900;
  color: #6b7280;
}

.v.ok { color: #15803d; }
.v.warn { color: #b91c1c; }

.log {
  height: 240px;
  overflow: auto;
  border-radius: 14px;
  background: #0b1220;
  border: 1px solid rgba(148, 163, 184, 0.22);
  padding: 10px;
  color: rgba(226, 232, 240, 0.88);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 11px;
  line-height: 1.7;
}

.log-line { white-space: pre-wrap; word-break: break-word; }

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

