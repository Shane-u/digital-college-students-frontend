<template>
  <Teleport to="body">
    <div v-if="visible" class="ribbon-popover-overlay" @click="handleClose">
      <div class="ribbon-popover search" @click.stop>
        <div class="ribbon-popover-title">节点搜索</div>
        <input
          ref="inputRef"
          v-model="innerKeyword"
          type="text"
          class="ribbon-search-input"
          placeholder="输入标题或内容关键字，回车搜索"
          @keyup.enter="handleConfirm"
        />
        <div class="ribbon-popover-actions">
          <button type="button" class="ribbon-popover-close" @click="handleClose">取消</button>
          <button type="button" class="ribbon-popover-primary" @click="handleConfirm">搜索</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  keyword: { type: String, default: '' }
})

const emit = defineEmits(['update:keyword', 'confirm', 'close'])

const inputRef = ref(null)
const innerKeyword = ref(props.keyword || '')

watch(
  () => props.keyword,
  (val) => {
    if (val !== innerKeyword.value) innerKeyword.value = val || ''
  }
)

watch(
  () => props.visible,
  (val) => {
    if (val) {
      // 打开时同步一次外部关键词并自动聚焦
      innerKeyword.value = props.keyword || ''
      nextTick(() => {
        if (inputRef.value && typeof inputRef.value.focus === 'function') {
          inputRef.value.focus()
        }
      })
    }
  }
)

const trimmedKeyword = computed(() => (innerKeyword.value || '').trim())

const handleConfirm = () => {
  emit('update:keyword', innerKeyword.value)
  emit('confirm', trimmedKeyword.value)
}

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

.ribbon-search-input {
  width: 100%;
  margin-top: 6px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  outline: none;
  background: rgba(248, 250, 252, 0.98);
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease;
}

.ribbon-search-input:focus {
  border-color: rgba(79, 70, 229, 0.9);
  background: #ffffff;
  box-shadow: 0 0 0 1px rgba(79, 70, 229, 0.18);
}
</style>

