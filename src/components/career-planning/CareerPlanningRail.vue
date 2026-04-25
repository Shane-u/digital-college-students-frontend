<template>
  <header class="cp-rail" :class="{ 'cp-rail--immersive': isImmersive }" aria-label="职业规划流程">
    <ol class="cp-steps" role="list">
      <li
        class="cp-steps__item"
        :class="{
          'cp-steps__item--active': journeyPhase === 'assessment',
          'cp-steps__item--done': phaseIndex > 0
        }"
      >
        <span class="cp-steps__n">1</span>
        <span class="cp-steps__label">职业测评</span>
      </li>
      <li class="cp-steps__bar" aria-hidden="true" />
      <li
        class="cp-steps__item"
        :class="{
          'cp-steps__item--active': journeyPhase === 'workflow',
          'cp-steps__item--done': phaseIndex > 1,
          'cp-steps__item--disabled': !hasAssessmentResult
        }"
      >
        <span class="cp-steps__n">2</span>
        <span class="cp-steps__label">生成职业规划报告</span>
      </li>
      <li class="cp-steps__bar" aria-hidden="true" />
      <li
        class="cp-steps__item"
        :class="{
          'cp-steps__item--active': journeyPhase === 'report',
          'cp-steps__item--done': false,
          'cp-steps__item--disabled': !workflowFinished
        }"
      >
        <span class="cp-steps__n">3</span>
        <span class="cp-steps__label">查看职业规划报告</span>
      </li>
    </ol>
  </header>
</template>

<script setup>
defineProps({
  journeyPhase: {
    type: String,
    required: true
  },
  phaseIndex: {
    type: Number,
    required: true
  },
  hasAssessmentResult: {
    type: Boolean,
    required: true
  },
  workflowFinished: {
    type: Boolean,
    required: true
  },
  isImmersive: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.cp-rail {
  position: fixed;
  left: 0;
  right: 0;
  top: var(--cp-nav-offset);
  z-index: 999;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 20px;
  padding: 10px max(20px, env(safe-area-inset-right)) 10px max(20px, env(safe-area-inset-left));
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.98);
  border-bottom: 1px solid var(--cp-border);
  backdrop-filter: blur(12px);
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.06);
}

.cp-rail--immersive {
  background: rgba(255, 255, 255, 0.72);
  border-bottom-color: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px) saturate(1.35);
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.06);
}

.cp-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.cp-steps__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  color: var(--cp-muted);
  border: 1px solid transparent;
}

.cp-steps__item--active {
  color: var(--cp-brand);
  background: var(--cp-brand-soft);
  border-color: rgba(37, 99, 235, 0.2);
}

.cp-steps__item--done {
  color: var(--cp-text);
}

.cp-steps__item--disabled {
  opacity: 0.45;
}

.cp-steps__n {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  background: #e2e8f0;
  color: var(--cp-text);
}

.cp-steps__item--active .cp-steps__n {
  background: var(--cp-brand);
  color: #fff;
}

.cp-steps__item--done .cp-steps__n {
  background: #22c55e;
  color: #fff;
}

.cp-steps__bar {
  width: 18px;
  height: 2px;
  background: linear-gradient(90deg, #e2e8f0, #cbd5e1);
  border-radius: 1px;
}
</style>
