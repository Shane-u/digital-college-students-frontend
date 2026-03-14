<template>
  <div class="chat-footer">
    <div class="controls">
      <div class="controls-left">
        <button
          type="button"
          class="chip"
          :disabled="loadingQuestion || recording || uploading"
          @click="$emit('next', false)"
        >
          {{ loadingQuestion ? '获取中...' : '下一题' }}
        </button>
        <button
          type="button"
          class="chip ghost"
          :disabled="loadingQuestion || recording || uploading"
          @click="$emit('next', true)"
        >
          下一题 + 语音朗读
        </button>
      </div>
      <div class="controls-right">
        <span v-if="recordStatus" class="hint">{{ recordStatus }}</span>
      </div>
    </div>

    <div class="record">
      <button
        type="button"
        class="btn-rec"
        :disabled="recording || uploading"
        @click="$emit('start-record')"
      >
        开始回答
      </button>
      <button
        type="button"
        class="btn-rec danger"
        :disabled="!recording || uploading"
        @click="$emit('stop-record')"
      >
        结束回答并上传
      </button>
      <button
        type="button"
        class="btn-rec ghost"
        :disabled="uploading"
        @click="$emit('cancel-record')"
      >
        取消回答
      </button>
    </div>

    <div v-if="error" class="inline-error">
      <div class="inline-error-text">{{ error }}</div>
      <button type="button" class="inline-error-btn" @click="$emit('clear-error')">
        知道了
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  loadingQuestion: { type: Boolean, default: false },
  recording: { type: Boolean, default: false },
  uploading: { type: Boolean, default: false },
  recordStatus: { type: String, default: '' },
  error: { type: String, default: '' },
})

defineEmits(['next', 'start-record', 'stop-record', 'cancel-record', 'clear-error'])
</script>

<style scoped>
.chat-footer {
  position: sticky;
  bottom: 0;
  z-index: 2;
  backdrop-filter: blur(10px);
  margin-top: auto;
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
  font-size: 13px;
  color: #64748b;
  font-weight: 800;
}

.chip {
  border-radius: 999px;
  padding: 6px 10px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #ffffff;
  color: #4b5563;
  font-size: 13px;
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
  font-size: 13px;
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
</style>

