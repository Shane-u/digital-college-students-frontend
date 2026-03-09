<template>
  <div class="ribbon-root" :class="{ collapsed: isCollapsed }">
    <button
      type="button"
      class="avatar-btn"
      aria-label="展开或收起彩带菜单"
      @click="toggleCollapsed"
    >
      <span class="avatar-ring" aria-hidden="true"></span>
      <img
        v-if="avatarUrl"
        class="avatar-img"
        :src="avatarUrl"
        alt="用户头像"
        @error="handleImgError"
      />
      <span v-else class="avatar-fallback" aria-hidden="true">{{ fallbackLetter }}</span>
    </button>

    <Transition name="ribbon-slide">
      <div v-if="!isCollapsed" class="ribbon-panel" role="navigation" aria-label="闪卡图谱快捷菜单">
        <div class="ribbon-notch" aria-hidden="true"></div>
        <div class="ribbon-actions">
          <button type="button" class="ribbon-item" @click="$emit('search')">节点搜索</button>
          <button type="button" class="ribbon-item" @click="$emit('filter')">节点筛选</button>
          <button type="button" class="ribbon-item" @click="$emit('compare')">对比模式</button>
          <button type="button" class="ribbon-item" @click="$emit('temp')">闪卡暂存</button>
          <button type="button" class="ribbon-item" @click="$emit('stats')">数据统计</button>
          <button
            type="button"
            class="ribbon-item"
            :class="{ active: legendActive }"
            @click="$emit('legend')"
          >
            图谱图例
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  avatarUrl: { type: String, default: '' },
  nickname: { type: String, default: 'U' },
  defaultExpanded: { type: Boolean, default: true },
  legendActive: { type: Boolean, default: true }
})

const emit = defineEmits(['search', 'filter', 'compare', 'temp', 'stats', 'legend', 'collapsedChange'])

const isCollapsed = ref(!props.defaultExpanded)
watch(
  () => props.defaultExpanded,
  (v) => {
    // 进入页面默认展开；外部若显式传入 false 也可收起
    isCollapsed.value = !v
  }
)

const imgOk = ref(true)
const handleImgError = () => {
  imgOk.value = false
}

const avatarUrl = computed(() => (imgOk.value ? (props.avatarUrl || '').trim() : ''))
watch(
  () => props.avatarUrl,
  (v) => {
    if (v && String(v).trim()) imgOk.value = true
  }
)
const fallbackLetter = computed(() => {
  const s = String(props.nickname || 'U').trim()
  return s ? s.slice(0, 1).toUpperCase() : 'U'
})

const toggleCollapsed = () => {
  isCollapsed.value = !isCollapsed.value
  emit('collapsedChange', isCollapsed.value)
}
</script>

<style scoped>
.ribbon-root {
  position: fixed;
  top: 22px;
  right: 22px;
  z-index: 1200;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  pointer-events: none; /* 只让内部按钮可点 */
}

.ribbon-root > * {
  pointer-events: auto;
}

/* 头像（替代圆球） */
.avatar-btn {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  padding: 0;
  position: relative;
  background: transparent;
  display: grid;
  place-items: center;
  box-shadow: 0 14px 32px rgba(76, 29, 149, 0.25);
  transform: translateY(0) scale(0.9);
  transition:
    transform 0.24s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.avatar-ring {
  position: absolute;
  inset: -2px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(196, 181, 253, 0.96), rgba(167, 139, 250, 0.96));
}

.avatar-img,
.avatar-fallback {
  width: 58px;
  height: 58px;
  border-radius: 999px;
  position: relative;
  z-index: 1;
  background: #ffffff;
  border: 2px solid rgba(255, 255, 255, 0.9);
  overflow: hidden;
}

.avatar-img {
  object-fit: cover;
  display: block;
}

.avatar-fallback {
  display: grid;
  place-items: center;
  font-weight: 900;
  font-size: 18px;
  color: #5b21b6;
}

.ribbon-root:not(.collapsed) .avatar-btn {
  transform: translateY(8px) scale(1);
}

.avatar-btn:hover {
  transform: translateY(6px) scale(1.04);
}

/* 彩带主体（图二那种：顶部凹弧、直边、底部直角） */
.ribbon-panel {
  width: 150px;
  padding: 18px 14px 14px;
  position: relative;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(196, 181, 253, 0.96), rgba(129, 140, 248, 0.96));
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 18px 46px rgba(46, 16, 101, 0.32);

  /* 顶部凹弧：用 mask 抠掉半圆 */
  --notch: 32px;
  -webkit-mask: radial-gradient(circle at 50% 0, transparent 0 var(--notch), #000 calc(var(--notch) + 1px)) 0 0 / 100% 100% no-repeat;
  mask: radial-gradient(circle at 50% 0, transparent 0 var(--notch), #000 calc(var(--notch) + 1px)) 0 0 / 100% 100% no-repeat;
}

.ribbon-notch {
  position: absolute;
  top: -1px;
  left: 50%;
  width: calc(var(--notch) * 2);
  height: calc(var(--notch) + 6px);
  transform: translateX(-50%);
  border-bottom-left-radius: 999px;
  border-bottom-right-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-top: none;
  opacity: 0.6;
  pointer-events: none;
}

.ribbon-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
}

.ribbon-item {
  width: 100%;
  padding: 10px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.95);
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  letter-spacing: 0.02em;
  text-align: center;
  transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.ribbon-item:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.34);
}

.ribbon-item.active {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.45);
}

/* 展开/收起动效（更慢、更顺滑） */
.ribbon-slide-enter-active,
.ribbon-slide-leave-active {
  transition:
    transform 0.36s cubic-bezier(0.22, 0.61, 0.36, 1),
    opacity 0.36s ease;
  transform-origin: top center;
}
.ribbon-slide-enter-from,
.ribbon-slide-leave-to {
  opacity: 0;
  transform: translateY(-14px) scale(0.9);
}
.ribbon-slide-enter-to,
.ribbon-slide-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@media (max-width: 768px) {
  .ribbon-panel {
    width: 152px;
  }
  .avatar-btn {
    width: 56px;
    height: 56px;
  }
  .avatar-img,
  .avatar-fallback {
    width: 50px;
    height: 50px;
  }
}
</style>

