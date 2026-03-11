<template>
  <Teleport to="body">
    <div v-if="visible" class="ribbon-popover-overlay">
      <div class="ribbon-popover" @click.stop>
        <div class="ribbon-popover-title">节点筛选</div>
        <div class="ribbon-popover-subtitle">时间范围</div>
        <div class="ribbon-filter-grid">
          <button
            v-for="range in timeRanges"
            :key="range.value"
            type="button"
            class="ribbon-filter-btn"
            :class="{ active: range.value === timeRange }"
            @click="handleSelect(range.value)"
          >
            {{ range.label }}
          </button>
        </div>
        <div class="ribbon-popover-actions">
          <button type="button" class="ribbon-popover-close" @click="handleOverlayClick">关闭</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  timeRanges: {
    type: Array,
    default: () => []
  },
  timeRange: {
    type: String,
    default: 'ALL'
  }
})

const emit = defineEmits(['change', 'close'])

const handleSelect = (value) => {
  emit('change', value)
}

const handleOverlayClick = () => {
  emit('close')
}
</script>

<style scoped>
.ribbon-popover-overlay {
  position: fixed;
  inset: 0;
  z-index: 1500;
  background: transparent;
  backdrop-filter: none;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 96px 22px 26px;
  /* 允许底层图谱交互，仅面板自身可点击 */
  pointer-events: none;
}

.ribbon-popover {
  width: 320px;
  max-width: min(360px, calc(100vw - 44px));
  background:
    linear-gradient(145deg, rgba(233, 238, 255, 0.98), rgba(244, 244, 255, 0.98))
    padding-box;
  border-radius: 22px;
  padding: 20px 18px 16px;
  border: 1px solid rgba(199, 210, 254, 0.9);
  box-shadow:
    0 22px 50px rgba(15, 23, 42, 0.26),
    0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  position: relative;
  overflow: hidden;
  pointer-events: auto;
}

.ribbon-popover-title {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 12px;
  position: relative;
}

.ribbon-popover-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -6px;
  width: 32px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, #818cf8, #a855f7);
}

.ribbon-popover-subtitle {
  font-size: 12px;
  font-weight: 800;
  color: #6b7280;
  margin-bottom: 10px;
}

.ribbon-filter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 4px;
}

.ribbon-filter-btn {
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 800;
  border-radius: 999px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  color: #4b5563;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease,
    transform 0.16s ease;
}

.ribbon-filter-btn:hover {
  border-color: rgba(129, 140, 248, 0.88);
  color: #4f46e5;
  background: #eef2ff;
  box-shadow: 0 10px 25px rgba(129, 140, 248, 0.25);
  transform: translateY(-1px);
}

.ribbon-filter-btn.active {
  border-color: rgba(79, 70, 229, 0.98);
  background: radial-gradient(circle at 0 0, rgba(129, 140, 248, 0.35), rgba(129, 140, 248, 0.08));
  color: #312e81;
}

.ribbon-popover-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}

.ribbon-popover-close {
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease,
    transform 0.16s ease,
    box-shadow 0.16s ease;
}

.ribbon-popover-close:hover {
  background: #f8fafc;
  border-color: #cbd5f5;
  color: #475569;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(148, 163, 184, 0.28);
}
</style>

