<template>
  <div class="session-header">
    <div class="session-left">
      <span class="pill">{{ statusLabel }}</span>
      <span class="pill subtle">类型：{{ typeLabel }}</span>
      <span class="pill subtle">面试官：{{ personaLabel }}</span>
      <span class="pill subtle">经验：{{ difficultyLabel }}</span>
    </div>
    <div class="session-right">
      <div class="timer">
        <span class="timer-dot" :class="{ on: isRunning }"></span>
        <span class="timer-text">{{ timeText }}</span>
      </div>
      <button type="button" class="btn-ghost danger" :disabled="finishing" @click="$emit('end')">
        {{ finishing ? endButtonLoadingText : endButtonText }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  /** 左侧状态文案，如「进行中」「通话中」 */
  statusLabel: { type: String, default: '进行中' },
  typeLabel: { type: String, default: '' },
  personaLabel: { type: String, default: '' },
  difficultyLabel: { type: String, default: '' },
  timeText: { type: String, default: '00:00' },
  isRunning: { type: Boolean, default: false },
  finishing: { type: Boolean, default: false },
  /** 结束按钮常态文案 */
  endButtonText: { type: String, default: '结束面试' },
  /** 结束按钮 loading 时文案 */
  endButtonLoadingText: { type: String, default: '生成报告中...' },
})

defineEmits(['end'])
</script>

<style scoped>
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
</style>
