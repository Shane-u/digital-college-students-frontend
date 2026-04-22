<template>
  <div class="stage">
    <video
      ref="thinkVideoRef"
      class="bg-video"
      :class="{ active: effectiveMode === 'ai_thinking' }"
      :src="aiThinkSrc"
      autoplay
      muted
      loop
      playsinline
      preload="auto"
    />
    <video
      ref="aiVideoRef"
      class="bg-video"
      :class="{ active: effectiveMode === 'ai_speaking' }"
      :src="aiSpeakSrc"
      autoplay
      muted
      loop
      playsinline
      preload="auto"
    />
    <video
      ref="userVideoRef"
      class="bg-video"
      :class="{ active: effectiveMode === 'user_speaking' }"
      :src="userSpeakSrc"
      autoplay
      muted
      loop
      playsinline
      preload="auto"
    />

    <div class="pip" :class="{ hidden: !localStream }">
      <video ref="pipVideoRef" class="pip-video" autoplay muted playsinline />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import aiSpeakSrc from '../../../assets/AIInterview/AI_Speak.mp4'
import aiThinkSrc from '../../../assets/AIInterview/AI_think.mp4'
import userSpeakSrc from '../../../assets/AIInterview/user_speak.mp4'

const props = defineProps({
  localStream: { type: Object, default: null },
  remoteStream: { type: Object, default: null },
  connected: { type: Boolean, default: false },
  muted: { type: Boolean, default: false },
  /** 可选：外部强制状态（不传则自动推断） */
  mode: { type: String, default: '' }, // 'user_speaking' | 'ai_speaking' | 'ai_thinking'
})

const thinkVideoRef = ref(null)
const aiVideoRef = ref(null)
const userVideoRef = ref(null)
const pipVideoRef = ref(null)

const localLevel = ref(0)
const remoteLevel = ref(0)
const lastUserActiveAt = ref(0)
const lastAiActiveAt = ref(0)

let audioCtx = null
let localAnalyser = null
let remoteAnalyser = null
let localSource = null
let remoteSource = null
let rafId = 0

const USER_THRESHOLD = 0.035
const AI_THRESHOLD = 0.028
const HOLD_MS = 420

function stopAnalyserLoop() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
}

function cleanupAudio() {
  stopAnalyserLoop()
  localAnalyser = null
  remoteAnalyser = null
  try { localSource?.disconnect?.() } catch (_) {}
  try { remoteSource?.disconnect?.() } catch (_) {}
  localSource = null
  remoteSource = null
  try { audioCtx?.close?.() } catch (_) {}
  audioCtx = null
}

function ensureAudioCtx() {
  if (audioCtx) return audioCtx
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null
  audioCtx = new Ctx()
  return audioCtx
}

function createAnalyser(stream) {
  if (!stream) return { source: null, analyser: null }
  const ctx = ensureAudioCtx()
  if (!ctx) return { source: null, analyser: null }
  const audioTracks = typeof stream.getAudioTracks === 'function' ? stream.getAudioTracks() : []
  if (!audioTracks || audioTracks.length === 0) return { source: null, analyser: null }
  const audioOnlyStream = new MediaStream([audioTracks[0]])
  const source = ctx.createMediaStreamSource(audioOnlyStream)
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 1024
  analyser.smoothingTimeConstant = 0.65
  source.connect(analyser)
  return { source, analyser }
}

function calcRms(analyser) {
  const buf = new Uint8Array(analyser.frequencyBinCount)
  analyser.getByteTimeDomainData(buf)
  let sum = 0
  for (let i = 0; i < buf.length; i++) {
    const v = (buf[i] - 128) / 128
    sum += v * v
  }
  return Math.sqrt(sum / buf.length)
}

function startAnalyserLoop() {
  stopAnalyserLoop()
  const tick = () => {
    const now = Date.now()
    if (localAnalyser) {
      const v = calcRms(localAnalyser)
      localLevel.value = v
      if (!props.muted && v >= USER_THRESHOLD) lastUserActiveAt.value = now
    } else {
      localLevel.value = 0
    }

    if (remoteAnalyser) {
      const v = calcRms(remoteAnalyser)
      remoteLevel.value = v
      if (v >= AI_THRESHOLD) lastAiActiveAt.value = now
    } else {
      remoteLevel.value = 0
    }

    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)
}

function bindPipVideo(stream) {
  const el = pipVideoRef.value
  if (!el) return
  try {
    el.srcObject = stream || null
  } catch (_) {}
}

watch(
  () => props.localStream,
  (s) => {
    bindPipVideo(s)
  },
  { immediate: true }
)

function reinitAudioNodes() {
  cleanupAudio()

  if (!props.connected) return
  const ctx = ensureAudioCtx()
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }

  const local = createAnalyser(props.localStream)
  localSource = local.source
  localAnalyser = local.analyser

  const remote = createAnalyser(props.remoteStream)
  remoteSource = remote.source
  remoteAnalyser = remote.analyser

  startAnalyserLoop()
}

watch(
  () => [props.connected, props.localStream, props.remoteStream],
  () => {
    reinitAudioNodes()
  },
  { immediate: true }
)

const inferredMode = computed(() => {
  const now = Date.now()
  const sessionActive = props.connected || !!props.localStream || !!props.remoteStream
  if (!sessionActive) return 'ai_thinking'
  const userActive = !props.muted && now - lastUserActiveAt.value <= HOLD_MS
  const aiActive = now - lastAiActiveAt.value <= HOLD_MS
  if (userActive) return 'user_speaking'
  if (aiActive) return 'ai_speaking'
  return 'ai_thinking'
})

const effectiveMode = computed(() => {
  const m = String(props.mode || '').trim()
  if (m === 'user_speaking' || m === 'ai_speaking' || m === 'ai_thinking') return m
  return inferredMode.value
})

async function ensureBgPlaying() {
  const els = [thinkVideoRef.value, aiVideoRef.value, userVideoRef.value].filter(Boolean)
  await Promise.allSettled(
    els.map(async (el) => {
      try {
        await el.play()
      } catch (_) {}
    })
  )
}

onMounted(() => {
  bindPipVideo(props.localStream)
  ensureBgPlaying()
})

onBeforeUnmount(() => {
  cleanupAudio()
})
</script>

<style scoped>
.stage {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
}

.bg-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  opacity: 0;
  transition: opacity 180ms ease;
  will-change: opacity;
}

.bg-video.active {
  opacity: 1;
}

.pip {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 122px;
  height: 178px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.35);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
  background: rgba(2, 6, 23, 0.55);
}

.pip.hidden {
  opacity: 0;
  pointer-events: none;
}

.pip-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

@media (max-width: 540px) {
  .pip {
    right: 10px;
    bottom: 10px;
    width: 110px;
    height: 164px;
  }
}
</style>

