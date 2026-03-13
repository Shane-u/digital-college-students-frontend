<template>
  <div class="choice">
    <div class="options">
      <button
        v-for="opt in options"
        :key="opt.key"
        type="button"
        class="opt"
        :class="{ active: modelValue === opt.key }"
        @click="$emit('update:modelValue', opt.key)"
      >
        <span class="key">{{ opt.key }}</span>
        <span class="text">{{ opt.text }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  options: { type: Array, default: () => [] },
  modelValue: { type: String, default: '' }
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.options {
  display: grid;
  gap: 0;
  border-radius: 12px;
  overflow: hidden;
}

.opt {
  width: 100%;
  text-align: left;
  border-radius: 0;
  border: none;
  border-top: 1px solid #f1f5f9;
  background: transparent;
  padding: 12px 6px;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;
  display: flex;
  gap: 10px;
  align-items: center;
}

.opt:first-child {
  border-top: none;
}

.opt:hover {
  background: #f9fafb;
}

.opt.active {
  background: rgba(79, 70, 229, 0.06);
}

.key {
  width: 26px;
  height: 26px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 950;
  color: #6b7280;
  background: #f3f4f6;
  border: none;
  flex-shrink: 0;
}

.opt.active .key {
  color: #4f46e5;
  background: rgba(79, 70, 229, 0.12);
}

.text {
  font-size: 14px;
  font-weight: 750;
  color: #334155;
  line-height: 1.55;
  word-break: break-word;
}
</style>

