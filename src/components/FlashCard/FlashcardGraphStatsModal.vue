<template>
  <Teleport to="body">
    <div v-if="visible" class="ribbon-popover-overlay" @click="handleClose">
      <div class="ribbon-popover stats" @click.stop>
        <div class="ribbon-popover-title">数据统计</div>
        <div class="stats-list">
          <div class="stats-row">
            <span class="stats-k">当前时间范围</span>
            <span class="stats-v">{{ activeTimeRangeLabel }}</span>
          </div>
          <div class="stats-row">
            <span class="stats-k">闪卡数量</span>
            <span class="stats-v">{{ stats.flashcards }}</span>
          </div>
          <div class="stats-row">
            <span class="stats-k">图谱节点</span>
            <span class="stats-v">{{ stats.masterNodes }}</span>
          </div>
          <div class="stats-row">
            <span class="stats-k">图谱关系</span>
            <span class="stats-v">{{ stats.masterLinks }}</span>
          </div>
          <div class="stats-row">
            <span class="stats-k">当前可见节点</span>
            <span class="stats-v">{{ stats.visibleNodes }}</span>
          </div>
          <div class="stats-row">
            <span class="stats-k">命中高亮闪卡</span>
            <span class="stats-v">{{ stats.highlightHits }}</span>
          </div>
        </div>
        <div class="ribbon-popover-actions">
          <button type="button" class="ribbon-popover-primary" @click="handleClose">知道了</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  activeTimeRangeLabel: { type: String, default: '全部' },
  stats: {
    type: Object,
    default: () => ({
      flashcards: 0,
      masterNodes: 0,
      masterLinks: 0,
      visibleNodes: 0,
      highlightHits: 0
    })
  }
})

const emit = defineEmits(['close'])

const handleClose = () => {
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
}

.ribbon-popover.stats {
  width: 340px;
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

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: rgba(15, 23, 42, 0.03);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 12px;
  padding: 10px 12px;
}

.stats-k {
  font-size: 12px;
  color: #6b7280;
  font-weight: 800;
}

.stats-v {
  font-size: 13px;
  color: #111827;
  font-weight: 900;
}

.ribbon-popover-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}

.ribbon-popover-primary {
  padding: 8px 12px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  color: #ffffff;
  font-weight: 800;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 14px 30px rgba(124, 58, 237, 0.4);
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    filter 0.16s ease;
}

.ribbon-popover-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(79, 70, 229, 0.55);
  filter: brightness(1.03);
}
</style>

