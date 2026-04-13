<template>
  <div class="lp-header-root">
    <div class="lp-selector-root" :class="{ collapsed: selectorCollapsed }">
      <button
        type="button"
        class="lp-selector-avatar"
        @click="$emit('toggle-selector')"
        aria-label="展开或收起路径面板"
        title="路径面板"
      >
        <span class="lp-selector-ring" aria-hidden="true"></span>
        <span class="lp-selector-letter" aria-hidden="true">
          <img
            v-if="userAvatar"
            :src="userAvatar"
            alt="用户头像"
            class="lp-avatar-img"
          />
          <span v-else class="lp-avatar-initial">{{ userInitial }}</span>
        </span>
      </button>

      <Transition name="lp-selector-slide">
        <div v-if="!selectorCollapsed" class="lp-selector-panel">
          <div class="lp-selector-notch" aria-hidden="true"></div>
          <div class="lp-selector-list">
            <button
              type="button"
              class="lp-selector-item"
              :class="{ active: selectedPathId == null }"
              @click="$emit('select-all')"
            >
              全部学习路径
            </button>
            <div
              v-for="p in sortedPathList"
              :key="p.id"
              class="lp-selector-row"
            >
              <button
                type="button"
                class="lp-selector-item lp-selector-item--row"
                :class="{ active: String(selectedPathId) === String(p.id) }"
                @click="$emit('select-path', p.id)"
              >
                {{ getPathDisplayName(p) }}
              </button>
              <button
                type="button"
                class="lp-item-more"
                title="更多操作"
                @click.stop="$emit('open-path-menu', p, $event)"
              >
                <span class="lp-dots" aria-hidden="true">⋯</span>
              </button>
            </div>
          </div>
          <div class="lp-selector-divider"></div>
          <button
            type="button"
            class="lp-compare-btn"
            @click="$emit('open-compare')"
          >
            对比模式
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  selectorCollapsed: {
    type: Boolean,
    default: false
  },
  sortedPathList: {
    type: Array,
    default: () => []
  },
  selectedPathId: {
    type: [Number, String, Object, null],
    default: null
  },
  getPathDisplayName: {
    type: Function,
    required: true
  },
  userAvatar: {
    type: String,
    default: ''
  },
  userNickname: {
    type: String,
    default: 'U'
  }
})

defineEmits(['toggle-selector', 'select-all', 'select-path', 'open-path-menu', 'open-compare'])

const userInitial = computed(() => {
  const name = (props.userNickname || '').trim()
  if (!name) return 'U'
  return name.charAt(0)
})
</script>

<style scoped>
.lp-header-root {
  position: fixed;
  top: 18px;
  right: 24px;
  z-index: 1250;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  pointer-events: none;
}

.lp-header-root > * {
  pointer-events: auto;
}

.lp-selector-root {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.lp-selector-avatar {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  padding: 0;
  position: relative;
  background: transparent;
  display: grid;
  place-items: center;
  box-shadow: 0 14px 32px rgba(76, 29, 149, 0.22);
  transform: translateY(0) scale(0.92);
  transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.lp-selector-ring {
  position: absolute;
  inset: -2px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(196, 181, 253, 0.96), rgba(167, 139, 250, 0.96));
}

.lp-selector-letter {
  width: 50px;
  height: 50px;
  border-radius: 999px;
  position: relative;
  z-index: 1;
  background: #ffffff;
  border: 2px solid rgba(255, 255, 255, 0.9);
  display: grid;
  place-items: center;
  font-weight: 900;
  font-size: 18px;
  color: #5b21b6;
  overflow: hidden;
}

.lp-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  object-fit: cover;
}

.lp-avatar-initial {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.lp-selector-root:not(.collapsed) .lp-selector-avatar {
  transform: translateY(8px) scale(1);
}

.lp-selector-avatar:hover {
  transform: translateY(6px) scale(1.04);
}

.lp-selector-panel {
  width: 180px;
  padding: 18px 14px 14px;
  position: relative;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(196, 181, 253, 0.96), rgba(129, 140, 248, 0.96));
  box-shadow: 0 18px 46px rgba(46, 16, 101, 0.28);
  --notch: 28px;
  -webkit-mask: radial-gradient(circle at 50% 0, transparent 0 var(--notch), #000 calc(var(--notch) + 1px)) 0 0 / 100% 100% no-repeat;
  mask: radial-gradient(circle at 50% 0, transparent 0 var(--notch), #000 calc(var(--notch) + 1px)) 0 0 / 100% 100% no-repeat;
}

.lp-selector-notch {
  position: absolute;
  top: -1px;
  left: 50%;
  width: calc(var(--notch) * 2);
  height: calc(var(--notch) + 6px);
  transform: translateX(-50%);
  border-bottom-left-radius: 999px;
  border-bottom-right-radius: 999px;
  opacity: 0.55;
  pointer-events: none;
}

.lp-selector-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
  max-height: 312px;
  overflow-y: auto;
  padding-right: 2px;
}

.lp-selector-list::-webkit-scrollbar {
  width: 6px;
}

.lp-selector-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.35);
  border-radius: 999px;
}

.lp-selector-item {
  width: 100%;
  padding: 10px 10px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.95);
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  letter-spacing: 0.02em;
  text-align: center;
  transition: transform 0.15s ease, background 0.15s ease;
}

.lp-selector-row {
  position: relative;
  display: flex;
  align-items: center;
}

.lp-selector-item--row {
  padding-right: 34px;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lp-item-more {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 26px;
  height: 26px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  display: grid;
  place-items: center;
  opacity: 0;
  transition: opacity 0.15s ease, background 0.15s ease, transform 0.15s ease;
}

.lp-selector-row:hover .lp-item-more {
  opacity: 1;
}

.lp-item-more:hover {
  background: rgba(255, 255, 255, 0.16);
  transform: translateY(-50%) scale(1.04);
}

.lp-dots {
  font-size: 18px;
  line-height: 1;
  transform: translateY(-2px);
}

.lp-selector-item:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.14);
}

.lp-selector-item.active {
  background: rgba(255, 255, 255, 0.22);
}

.lp-selector-divider {
  height: 1px;
  width: 100%;
  margin: 10px 0;
  background: rgba(255, 255, 255, 0.3);
}

.lp-compare-btn {
  width: 100%;
  padding: 10px 10px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
  transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
}

.lp-compare-btn:hover {
  background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
}

.lp-selector-slide-enter-active,
.lp-selector-slide-leave-active {
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease;
}

.lp-selector-slide-enter-from,
.lp-selector-slide-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>

