<template>
  <div class="coding">
    <div class="lang-row">
      <div class="pill">{{ languageLabel }}</div>
    </div>
    <textarea
      class="editor"
      :value="modelValue"
      spellcheck="false"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  language: { type: String, default: 'javascript' },
  placeholder: { type: String, default: '在这里编写你的代码…' }
})
defineEmits(['update:modelValue'])

const languageLabel = computed(() => {
  const map = { javascript: 'JavaScript', typescript: 'TypeScript', java: 'Java', python: 'Python', c: 'C', cpp: 'C++' }
  return map[props.language] || String(props.language || 'Code')
})
</script>

<style scoped>
.lang-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.pill {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  color: #4f46e5;
  background: rgba(238, 242, 255, 0.9);
  border: 1px solid rgba(129, 140, 248, 0.35);
}

.editor {
  width: 100%;
  min-height: 220px;
  resize: vertical;
  padding: 14px 14px;
  border-radius: 16px;
  border: none;
  background: #0b1220;
  color: #e2e8f0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 13px;
  line-height: 1.6;
  letter-spacing: 0.01em;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.16);
  transition: box-shadow 0.18s ease, transform 0.18s ease;
}

.editor:focus {
  outline: none;
  box-shadow: 0 18px 38px rgba(79, 70, 229, 0.18), 0 0 0 2px rgba(129, 140, 248, 0.2);
}
</style>

