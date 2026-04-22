<template>
  <div class="voice">
    <div class="voice-topbar">
      <span class="dot green"></span>
      <span class="dot yellow"></span>
      <span class="dot red"></span>
      <span class="voice-title">实时面试</span>
    </div>

    <div class="voice-main">
      <div class="voice-video">
        <InterviewAvatarStage
          :local-stream="localStream"
          :remote-stream="remoteStream"
          :connected="connected"
          :muted="muted"
        />
      </div>
      <!-- 远端音频保持播放，但不展示控件 -->
      <audio ref="remoteAudioRef" class="remote-audio" autoplay />
    </div>

    <div class="voice-controls">
      <button type="button" class="ctrl primary" :disabled="connecting || connected" @click="$emit('connect')">
        <span v-if="connecting" class="ctrl-spinner"></span>
        {{ connected ? '进行中' : (connecting ? '面试准备中' : '开始面试') }}
      </button>
      <button
        type="button"
        class="ctrl"
        :disabled="!connected"
        :class="{ active: muted }"
        @click="$emit('toggle-mute')"
      >
        {{ muted ? '取消麦克风静音' : '麦克风静音' }}
      </button>
      <button
        type="button"
        class="ctrl danger"
        :disabled="!connected || finishing"
        @click="$emit('hangup')"
      >
        结束面试
      </button>
    </div>
    <p class="voice-hint">温馨提示：AI 说话时请保持麦克风静音，到你说话时再打开麦克风。</p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import InterviewAvatarStage from './InterviewAvatarStage.vue'

const props = defineProps({
  localStream: { type: Object, default: null },
  remoteStream: { type: Object, default: null },
  connecting: { type: Boolean, default: false },
  connected: { type: Boolean, default: false },
  muted: { type: Boolean, default: false },
  finishing: { type: Boolean, default: false },
})

const remoteAudioRef = ref(null)

defineExpose({
  remoteAudioRef,
})

defineEmits(['connect', 'toggle-mute', 'hangup'])

watch(
  () => props.remoteStream,
  async (s) => {
    const el = remoteAudioRef.value
    if (!el) return
    try {
      el.srcObject = s || null
      if (s) await el.play()
    } catch (_) {}
  },
  { immediate: true }
)
</script>

<style scoped>
.voice {
  border-radius: 18px;
  background: #020617;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.85);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.voice-topbar {
  height: 28px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #020617;
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
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.voice-video {
  width: 100%;
  height: 100%;
  border-radius: 0;
  overflow: hidden;
  background: #000;
}

.remote-audio {
  display: none;
}

.voice-controls {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(2, 6, 23, 0.7);
}

.voice-hint {
  margin: 0;
  padding: 8px 12px 12px;
  font-size: 12px;
  color: rgba(226, 232, 240, 0.85);
  line-height: 1.5;
}

.ctrl {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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
  background: rgba(15, 23, 42, 0.9);
}

.ctrl:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.ctrl.active {
  border-color: rgba(34, 197, 94, 0.55);
  background: rgba(21, 128, 61, 0.3);
}

.ctrl-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(226, 232, 240, 0.35);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: ctrl-spin 0.7s linear infinite;
}

@keyframes ctrl-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

