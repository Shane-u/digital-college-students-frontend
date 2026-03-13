<template>
  <el-dialog
    :model-value="visible"
    width="420px"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    class="difficulty-dialog"
    @close="$emit('close')"
  >
    <template #header>
      <div class="head">
        <div class="title">生成测试题</div>
        <button type="button" class="x" @click="$emit('close')" aria-label="关闭">×</button>
      </div>
    </template>

    <div class="body">
      <div class="hint">请选择难度（后续会影响题目深度与综合度）</div>
      <div class="grid">
        <button
          v-for="opt in options"
          :key="opt.value"
          type="button"
          class="card"
          :class="{ active: modelValue === opt.value }"
          @click="$emit('update:modelValue', opt.value)"
        >
          <div class="name">{{ opt.label }}</div>
          <div class="desc">{{ opt.desc }}</div>
        </button>
      </div>
    </div>

    <template #footer>
      <div class="foot">
        <button type="button" class="btn ghost" @click="$emit('close')">取消</button>
        <button type="button" class="btn primary" :disabled="!modelValue || loading" @click="$emit('confirm')">
          <span v-if="!loading">开始生成</span>
          <span v-else class="loading">
            <span class="dot"></span>
            生成中...
          </span>
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  modelValue: { type: String, default: '' },
  loading: { type: Boolean, default: false }
})
defineEmits(['close', 'confirm', 'update:modelValue'])

const options = [
  { value: 'easy', label: '简单', desc: '基础概念与关键点' },
  { value: 'medium', label: '中等', desc: '理解 + 场景化应用' },
  { value: 'hard', label: '困难', desc: '综合推理与实战设计' }
]
</script>

<style scoped>
:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 6px;
}

.title {
  font-size: 15px;
  font-weight: 900;
  color: #111827;
  letter-spacing: 0.02em;
}

.x {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
}
.x:hover {
  background: #e5e7eb;
}

.body {
  padding: 6px 2px 4px;
}

.hint {
  font-size: 12px;
  font-weight: 650;
  color: #6b7280;
  margin-bottom: 12px;
}

.grid {
  display: grid;
  gap: 10px;
}

.card {
  text-align: left;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  border-radius: 12px;
  padding: 12px 12px;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}
.card:hover {
  background: #f9fafb;
}
.card.active {
  border-color: rgba(79, 70, 229, 0.55);
  box-shadow: 0 12px 28px rgba(79, 70, 229, 0.12);
  background: rgba(79, 70, 229, 0.04);
}

.name {
  font-size: 14px;
  font-weight: 900;
  color: #111827;
}
.desc {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 650;
  color: #6b7280;
}

.foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 750;
  cursor: pointer;
  border: none;
}
.btn.ghost {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
}
.btn.ghost:hover {
  background: #f3f4f6;
}
.btn.primary {
  background: #4f46e5;
  color: #fff;
  box-shadow: 0 8px 22px rgba(79, 70, 229, 0.25);
}
.btn.primary:hover {
  background: #4338ca;
}
.btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
  box-shadow: none;
}
.loading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.55);
  border-top-color: #fff;
  animation: spin 0.6s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

