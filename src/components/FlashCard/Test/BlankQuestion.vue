<template>
  <div class="blank">
    <input
      class="input"
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '请输入答案…' }
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.input {
  width: 100%;
  padding: 10px 2px;
  border-radius: 0;
  border: none;
  border-bottom: 1px solid #e5e7eb;
  background: transparent;
  font-size: 16px;
  font-weight: 700;
  transition: border-color 0.18s ease;
}

.input:focus {
  outline: none;
  border-color: rgba(79, 70, 229, 0.7);
}
</style>

