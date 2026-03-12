<template>
  <div class="config-card">
    <div class="card-header">
      <h3 class="card-title">面试配置</h3>
    </div>

    <div class="form-grid">
      <div class="field field-primary">
        <div class="label label-primary">面试方式</div>
        <div class="mode">
          <button
            type="button"
            class="mode-card"
            :class="{ active: model.method === 'POLLING' }"
            @click="model.method = 'POLLING'"
          >
            <div class="mode-title-row">
              <span class="mode-title">轮询面试</span>
              <span class="mode-badge subtle">问一题 · 答一题</span>
            </div>
            <p class="mode-desc">AI 提问 → 你作答（录音上传）→ AI 继续提问，更适合结构化练习。</p>
          </button>

          <button
            type="button"
            class="mode-card"
            :class="{ active: model.method === 'REALTIME' }"
            @click="model.method = 'REALTIME'"
          >
            <div class="mode-title-row">
              <span class="mode-title">实时面试</span>
              <span class="mode-badge">通话</span>
            </div>
            <p class="mode-desc">直接通话面试（WebRTC），更贴近真实场景；需要麦克风 + 摄像头权限。</p>
          </button>
        </div>
      </div>

      <div class="field">
        <div class="label">面试类型</div>
        <div class="seg">
          <button
            v-for="x in interviewTypes"
            :key="x.value"
            type="button"
            class="seg-btn"
            :class="{ active: model.interviewType === x.value }"
            @click="model.interviewType = x.value"
          >
            {{ x.label }}
          </button>
        </div>
      </div>

      <div class="field">
        <div class="label">面试官类型</div>
        <div class="seg">
          <button
            v-for="x in personas"
            :key="x.value"
            type="button"
            class="seg-btn"
            :class="{ active: model.persona === x.value }"
            @click="model.persona = x.value"
          >
            {{ x.label }}
          </button>
        </div>
      </div>

      <div class="field">
        <div class="label">候选人经验</div>
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

    </div>

    <div class="summary">
      <div class="summary-left">
        <div class="summary-pill">类型：{{ interviewTypeLabel }}</div>
        <div class="summary-pill subtle">面试官：{{ personaLabel }}</div>
        <div class="summary-pill subtle">经验：{{ difficultyLabel }}</div>
        <div class="summary-pill subtle">方式：{{ methodLabel }}</div>
      </div>
      <button type="button" class="btn-primary" :disabled="disabled" @click="$emit('start')">
        {{ disabled ? '准备中...' : '开始面试' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'start'])

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const interviewTypes = [
  { value: 'MIXED', label: '混合面试' },
  { value: 'TECHNICAL', label: '技术面试' },
  { value: 'BEHAVIORAL', label: '行为面试' },
  { value: 'CODING', label: '编程面试' }
]

const personas = [
  { value: 'mentor', label: '导师型面试官' },
  { value: 'strict', label: '严格型面试官' },
  { value: 'hr', label: 'HR 面试官' }
]

const difficulties = [
  { value: 'JUNIOR', label: '初级阶段' },
  { value: 'MID', label: '中级阶段' },
  { value: 'SENIOR', label: '高级阶段' }
]

const interviewTypeLabel = computed(() => interviewTypes.find(x => x.value === model.value.interviewType)?.label || '未选择')
const personaLabel = computed(() => personas.find(x => x.value === model.value.persona)?.label || '未选择')
const difficultyLabel = computed(() => difficulties.find(x => x.value === model.value.difficulty)?.label || '未选择')
const methodLabel = computed(() => (model.value.method === 'REALTIME' ? '实时' : '轮询'))
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

.field-primary {
  padding: 12px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(236, 72, 153, 0.05));
  border: 1px solid rgba(129, 140, 248, 0.28);
}

.label {
  font-size: 13px;
  font-weight: 800;
  color: #475569;
}

.label-primary {
  font-size: 14px;
  font-weight: 900;
  color: #111827;
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
  font-size: 13px;
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
  font-size: 14px;
  font-weight: 900;
  color: #111827;
}

.mode-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
  font-weight: 800;
}

.mode-badge.subtle {
  background: rgba(148, 163, 184, 0.1);
  color: #64748b;
}

.mode-desc {
  font-size: 13px;
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
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(79, 70, 229, 0.08);
  color: #4f46e5;
  font-weight: 800;
}

.summary-pill.subtle {
  background: rgba(148, 163, 184, 0.08);
  color: #6b7280;
}

.btn-primary {
  border-radius: 999px;
  padding: 9px 20px;
  font-size: 14px;
  font-weight: 900;
  border: none;
  cursor: pointer;
  color: #f9fafb;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  box-shadow: 0 14px 30px rgba(79, 70, 229, 0.28);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  white-space: nowrap;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 40px rgba(79, 70, 229, 0.36);
}

@media (max-width: 960px) {
  .mode {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>

