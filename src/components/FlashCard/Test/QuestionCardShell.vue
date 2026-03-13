<template>
  <div class="q-card">
    <div class="q-head">
      <div class="q-index">{{ index + 1 }}.</div>
      <div class="q-meta">
        <div class="q-title">{{ title }}</div>
      </div>
    </div>
    <div class="q-body">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  index: { type: Number, required: true },
  type: { type: String, required: true },
  title: { type: String, default: '' }
})
</script>

<style scoped>
.q-card {
  background: #ffffff;
  border-radius: 0;
  border: none;
}

.q-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 2px 10px;
  border-bottom: none;
  background: transparent;
}

.q-index {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 14px;
  font-weight: 900;
  color: #111827;
  background: #ffffff;
  border: none;
  flex-shrink: 0;
}

.q-meta {
  flex: 1;
  min-width: 0;
}
.q-title {
  font-size: 15px;
  font-weight: 900;
  color: #1e293b;
  line-height: 1.55;
  letter-spacing: 0.01em;
  word-break: break-word;
}

.q-body {
  padding: 6px 2px 18px;
  border-bottom: 1px solid #f1f5f9;
}
</style>

