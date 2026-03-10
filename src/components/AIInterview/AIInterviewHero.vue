<template>
  <header class="ai-hero">
    <div class="ai-hero-left">
      <p class="ai-hero-badge">职业规划 · AI 面试</p>
      <h1 class="ai-hero-title">AI 模拟面试</h1>
      <p class="ai-hero-subtitle">
        简历分析 → 模拟面试 → 评价复盘，一次练到位。
      </p>
      <div class="ai-hero-actions">
        <button type="button" class="btn-primary" @click="$emit('start')">立即开始体验</button>
        <button type="button" class="btn-secondary" @click="$emit('resume')">去完善我的简历</button>
        <button type="button" class="btn-tertiary" @click="$emit('history')">面试记录</button>
      </div>
      <div class="ai-hero-tags">
        <span class="tag">简历诊断</span>
        <span class="tag">岗位匹配</span>
        <span class="tag">视频面试</span>
        <span class="tag">错题本复盘</span>
      </div>
    </div>

    <div class="ai-hero-right">
      <div class="flow-card">
        <div class="flow-header">
          <span class="flow-label">体验流程</span>
        </div>
        <ol class="flow-steps">
          <li
            v-for="(step, index) in steps"
            :key="step.key"
            class="flow-step"
            :class="{
              'is-active': step.key === currentStage,
              'is-done': isStepDone(step.key),
            }"
          >
            <div class="flow-step-index">{{ index + 1 }}</div>
            <div class="flow-step-main">
              <div class="flow-step-title">{{ step.title }}</div>
              <div class="flow-step-desc">{{ step.desc }}</div>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </header>
</template>

<script setup>
const props = defineProps({
  steps: { type: Array, default: () => [] },
  currentStage: { type: String, required: true },
})

defineEmits(['start', 'resume', 'history'])

const isStepDone = (stepKey) => {
  const order = props.steps.map((s) => s.key)
  const currentIndex = order.indexOf(props.currentStage)
  const stepIndex = order.indexOf(stepKey)
  return stepIndex !== -1 && stepIndex < currentIndex
}
</script>

<style scoped>
.ai-hero {
  max-width: 1120px;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1.2fr);
  gap: 36px;
  margin-bottom: 32px;
}

.ai-hero-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ai-hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(129, 140, 248, 0.12);
  color: #4f46e5;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  width: fit-content;
}

.ai-hero-title {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: #111827;
  margin: 0;
}

.ai-hero-subtitle {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.7;
  margin: 0;
}

.ai-hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.btn-primary,
.btn-secondary,
.btn-tertiary {
  border-radius: 999px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition:
    background-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease,
    color 0.18s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: #f9fafb;
  box-shadow: 0 14px 30px rgba(79, 70, 229, 0.32);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 40px rgba(79, 70, 229, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #4b5563;
  border: 1px solid rgba(148, 163, 184, 0.6);
}

.btn-secondary:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}

.btn-tertiary {
  background: rgba(15, 23, 42, 0.04);
  color: #475569;
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.btn-tertiary:hover {
  background: rgba(15, 23, 42, 0.06);
  transform: translateY(-1px);
}

.ai-hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tag {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.04);
  color: #64748b;
  font-weight: 500;
}

.ai-hero-right {
  display: flex;
  justify-content: flex-end;
}

.flow-card {
  width: 100%;
  max-width: 420px;
  background: rgba(15, 23, 42, 0.86);
  border-radius: 24px;
  padding: 18px 18px 20px;
  box-shadow:
    0 18px 45px rgba(15, 23, 42, 0.55),
    0 0 0 1px rgba(148, 163, 184, 0.35);
  color: #e5e7eb;
}

.flow-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.flow-label {
  font-size: 12px;
  font-weight: 700;
  color: #c7d2fe;
}


.flow-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.flow-step {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 14px;
  border: 1px solid rgba(55, 65, 81, 0.8);
  background: radial-gradient(circle at top left, rgba(79, 70, 229, 0.17), transparent 55%);
  opacity: 0.8;
}

.flow-step.is-active {
  border-color: rgba(129, 140, 248, 0.9);
  background:
    radial-gradient(circle at top left, rgba(129, 140, 248, 0.45), transparent 60%),
    radial-gradient(circle at bottom right, rgba(236, 72, 153, 0.32), transparent 70%);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.65);
  opacity: 1;
}

.flow-step.is-done {
  border-style: dashed;
  border-color: rgba(148, 163, 184, 0.9);
  opacity: 0.9;
}

.flow-step-index {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #e5e7eb;
}

.flow-step.is-active .flow-step-index {
  background: #f97316;
  color: #1f2933;
}

.flow-step-main {
  flex: 1;
  min-width: 0;
}

.flow-step-title {
  font-size: 13px;
  font-weight: 700;
  color: #e5e7eb;
  margin-bottom: 2px;
}

.flow-step-desc {
  font-size: 11px;
  color: #9ca3af;
  line-height: 1.5;
}

@media (max-width: 960px) {
  .ai-hero {
    grid-template-columns: minmax(0, 1fr);
  }

  .ai-hero-right {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .ai-hero-actions {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

