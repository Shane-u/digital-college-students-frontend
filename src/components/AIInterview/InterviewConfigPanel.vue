<template>
  <div class="config-card">
    <div class="card-header">
      <h3 class="card-title">面试配置</h3>
      <p class="card-desc">选择岗位与模式，生成更贴合你简历与目标的提问节奏。</p>
    </div>

    <div class="form-grid">
      <div class="field">
        <div class="label">目标岗位</div>
        <div class="select">
          <select v-model="model.jobRole">
            <option v-for="r in jobRoles" :key="r.value" :value="r.value">{{ r.label }}</option>
          </select>
        </div>
      </div>

      <div class="field">
        <div class="label">面试时长</div>
        <div class="seg">
          <button
            v-for="d in durations"
            :key="d.value"
            type="button"
            class="seg-btn"
            :class="{ active: model.durationMin === d.value }"
            @click="model.durationMin = d.value"
          >
            {{ d.label }}
          </button>
        </div>
      </div>

      <div class="field">
        <div class="label">难度</div>
        <div class="seg">
          <button
            v-for="x in difficulties"
            :key="x.value"
            type="button"
            class="seg-btn"
            :class="{ active: model.difficulty === x.value }"
            @click="model.difficulty = x.value"
          >
            {{ x.label }}
          </button>
        </div>
      </div>

      <div class="field">
        <div class="label">面试模式</div>
        <div class="mode">
          <button
            type="button"
            class="mode-card"
            :class="{ active: model.mode === 'VIDEO' }"
            @click="model.mode = 'VIDEO'"
          >
            <div class="mode-title-row">
              <span class="mode-title">视频面试</span>
              <span class="mode-badge">推荐</span>
            </div>
            <p class="mode-desc">左侧视频区域 + 右侧对话框，支持实时计时与回答转写占位。</p>
          </button>

          <button
            type="button"
            class="mode-card"
            :class="{ active: model.mode === 'CHAT' }"
            @click="model.mode = 'CHAT'"
          >
            <div class="mode-title-row">
              <span class="mode-title">纯问答</span>
            </div>
            <p class="mode-desc">更适合碎片化练习，聚焦在题目与表达结构训练。</p>
          </button>
        </div>
      </div>
    </div>

    <div class="summary">
      <div class="summary-left">
        <div class="summary-pill">岗位：{{ jobRoleLabel }}</div>
        <div class="summary-pill subtle">难度：{{ difficultyLabel }}</div>
        <div class="summary-pill subtle">时长：{{ model.durationMin }} 分钟</div>
      </div>
      <button type="button" class="btn-primary" @click="$emit('start')">开始面试</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'start'])

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const jobRoles = [
  { value: 'FRONTEND', label: '前端开发（Vue / React）' },
  { value: 'BACKEND', label: '后端开发（Java / Go）' },
  { value: 'FULLSTACK', label: '全栈开发（Web）' },
  { value: 'DATA', label: '数据分析 / AI 方向' },
  { value: 'PRODUCT', label: '产品 / 项目方向（偏技术）' },
]

const durations = [
  { value: 10, label: '10 分钟' },
  { value: 20, label: '20 分钟' },
  { value: 30, label: '30 分钟' },
]

const difficulties = [
  { value: 'EASY', label: '入门' },
  { value: 'MED', label: '进阶' },
  { value: 'HARD', label: '高强度' },
]

const jobRoleLabel = computed(() => jobRoles.find((x) => x.value === model.value.jobRole)?.label || '未选择')
const difficultyLabel = computed(() => difficulties.find((x) => x.value === model.value.difficulty)?.label || '未选择')
</script>

<style scoped>
.config-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 18px 18px 20px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.card-header {
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.card-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0 0;
}

.form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}

.select select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #f9fafb;
  font-size: 13px;
  color: #111827;
  outline: none;
  transition: box-shadow 0.16s ease, border-color 0.16s ease, background-color 0.16s ease;
}

.select select:focus {
  border-color: rgba(79, 70, 229, 0.55);
  background: #ffffff;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.12);
}

.seg {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.seg-btn {
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #ffffff;
  color: #4b5563;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.12s ease, background-color 0.12s ease, border-color 0.12s ease;
}

.seg-btn:hover {
  border-color: rgba(139, 92, 246, 0.55);
  color: #6d28d9;
  background: #faf5ff;
}

.seg-btn.active {
  border-color: rgba(124, 58, 237, 0.85);
  background: rgba(124, 58, 237, 0.12);
  color: #5b21b6;
}

.mode {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.mode-card {
  text-align: left;
  border-radius: 18px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #f9fafb;
  padding: 12px 12px 12px;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease, background-color 0.16s ease;
}

.mode-card.active {
  background: #ffffff;
  border-color: rgba(129, 140, 248, 0.9);
  box-shadow: 0 12px 32px rgba(129, 140, 248, 0.22);
  transform: translateY(-1px);
}

.mode-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.mode-title {
  font-size: 13px;
  font-weight: 900;
  color: #111827;
}

.mode-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
  font-weight: 700;
}

.mode-desc {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

.summary {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(226, 232, 240, 0.9);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.summary-left {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.summary-pill {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(79, 70, 229, 0.08);
  color: #4f46e5;
  font-weight: 700;
}

.summary-pill.subtle {
  background: rgba(148, 163, 184, 0.08);
  color: #6b7280;
}

.btn-primary {
  border-radius: 999px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 800;
  border: none;
  cursor: pointer;
  color: #f9fafb;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  box-shadow: 0 14px 30px rgba(79, 70, 229, 0.28);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  white-space: nowrap;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 40px rgba(79, 70, 229, 0.36);
}

@media (max-width: 960px) {
  .mode {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>

