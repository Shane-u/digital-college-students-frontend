<template>
  <main class="cp-panel cp-panel--story">
    <div class="cp-story__grid">
      <div class="cp-story__visual" aria-hidden="true">
        <div class="cp-story__circle">
          <img class="cp-story__img" :src="heroImageUrl" width="640" height="800" alt="" />
        </div>
      </div>
      <div class="cp-story__copy">
        <p class="cp-story__kicker">
          <span class="cp-story__dot" aria-hidden="true" />
          生涯规划
        </p>
        <h1 class="cp-story__title">
          迈向成长第一步，从精准的<span class="cp-story__title-accent">职业规划</span>开始
        </h1>
        <p class="cp-story__lead">
          我们相信：清晰的自我认知与可执行的路径，比盲目投递更重要。数字校园职业规划串联「测评画像 → 智能工作流 →
          结构化报告」，帮助你在学业、竞赛与求职之间找到自己的节奏。
        </p>

        <ul class="cp-story__features" role="list">
          <li class="cp-story__feature">
            <span class="cp-story__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3a12 12 0 0 0 0 18" stroke-linecap="round" />
              </svg>
            </span>
            <div>
              <p class="cp-story__feature-title">职业探索</p>
              <p class="cp-story__feature-desc">结合测评与行业语境，梳理适合你的方向与能力组合。</p>
            </div>
          </li>
          <li class="cp-story__feature">
            <span class="cp-story__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M7 4h10v16H7z" />
                <path d="M9 8h6M9 12h6M9 16h4" stroke-linecap="round" />
              </svg>
            </span>
            <div>
              <p class="cp-story__feature-title">目标与路径</p>
              <p class="cp-story__feature-desc">把工作流拆成可跟踪的节点，让每一步状态清晰可见。</p>
            </div>
          </li>
          <li class="cp-story__feature">
            <span class="cp-story__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <div>
              <p class="cp-story__feature-title">报告沉淀</p>
              <p class="cp-story__feature-desc">生成可阅读、可分享的职业规划报告，作为长期行动的底稿。</p>
            </div>
          </li>
        </ul>

        <div class="cp-story__cta-row">
          <div class="cp-story__cta-actions">
            <button class="cp-btn-main" type="button" :disabled="assessmentLoading" @click="$emit('start-assessment')">
              <span>{{ assessmentLoading ? '准备题目中…' : '开始职业测评' }}</span>
              <span class="cp-btn-main__arrow" aria-hidden="true">→</span>
            </button>
            <button class="cp-btn-secondary cp-btn-secondary--history" type="button" @click="$emit('open-history')">
              历史报告
            </button>
          </div>
          <p class="cp-story__cta-hint">全程约 10 分钟 · 完成后将自动进入分析与报告流程</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
defineProps({
  heroImageUrl: {
    type: String,
    required: true
  },
  assessmentLoading: {
    type: Boolean,
    required: true
  }
})

defineEmits(['start-assessment', 'open-history'])
</script>

<style scoped>
.cp-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--cp-nav-offset));
  box-sizing: border-box;
}

.cp-panel--story {
  position: relative;
  padding: clamp(24px, 4vw, 48px) clamp(20px, 4vw, 40px) 40px;
  background:
    radial-gradient(ellipse 80% 50% at 100% 0%, rgba(37, 99, 235, 0.06) 0%, transparent 55%),
    linear-gradient(180deg, #fbfcfe 0%, var(--cp-bg) 100%);
}

.cp-panel--story::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image: linear-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.12) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

.cp-story__grid {
  position: relative;
  z-index: 1;
  max-width: 1120px;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  gap: clamp(28px, 5vw, 56px);
  align-items: center;
}

@media (max-width: 900px) {
  .cp-story__grid {
    grid-template-columns: 1fr;
  }
}

.cp-story__visual { display: flex; justify-content: center; }
.cp-story__circle { width: min(100%, 520px); aspect-ratio: 1 / 1; border-radius: 50%; overflow: hidden; background: #ffffff; }
.cp-story__img { width: 100%; height: 100%; object-fit: contain; display: block; }
.cp-story__kicker { display: flex; align-items: center; gap: 10px; margin: 0 0 12px; font-size: 15px; font-weight: 700; color: var(--cp-brand); }
.cp-story__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--cp-brand); flex-shrink: 0; }
.cp-story__title { margin: 0 0 16px; font-size: clamp(1.65rem, 3.2vw, 2.35rem); font-weight: 700; line-height: 1.2; letter-spacing: -0.02em; color: var(--cp-text); }
.cp-story__title-accent { color: var(--cp-brand); }
.cp-story__lead { margin: 0 0 28px; font-size: 15px; line-height: 1.75; color: var(--cp-muted); max-width: 40em; }
.cp-story__features { list-style: none; margin: 0 0 32px; padding: 0; display: flex; flex-direction: column; gap: 18px; }
.cp-story__feature { display: flex; gap: 16px; align-items: flex-start; }
.cp-story__icon { flex-shrink: 0; width: 48px; height: 48px; border-radius: 14px; background: var(--cp-brand-soft); color: var(--cp-brand); display: flex; align-items: center; justify-content: center; }
.cp-story__icon svg { width: 24px; height: 24px; }
.cp-story__feature-title { margin: 0 0 4px; font-size: 15px; font-weight: 700; color: var(--cp-text); }
.cp-story__feature-desc { margin: 0; font-size: 13px; line-height: 1.55; color: var(--cp-muted); }
.cp-story__cta-row { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
.cp-story__cta-actions { display: flex; flex-wrap: wrap; align-items: stretch; gap: 12px; }
.cp-story__cta-hint { margin: 0; font-size: 12px; color: var(--cp-muted); }
.cp-btn-main {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 48px;
  padding: 10px 24px;
  border: 1px solid rgba(124, 58, 237, 0.35);
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 52%, #6d28d9 100%);
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(124, 58, 237, 0.26);
  transition: transform 0.18s ease, box-shadow 0.22s ease, filter 0.22s ease;
}
.cp-btn-main:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: saturate(1.05) brightness(1.02);
  box-shadow: 0 14px 28px rgba(124, 58, 237, 0.3);
}
.cp-btn-main:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
.cp-btn-main__arrow {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  font-size: 14px;
}
.cp-btn-secondary {
  min-height: 48px;
  padding: 10px 20px;
  border-radius: 16px;
  border: 1px solid var(--cp-border);
  background: var(--cp-surface);
  color: var(--cp-text);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.18s ease;
}
.cp-btn-secondary--history {
  border-color: rgba(124, 58, 237, 0.3);
  background: rgba(255, 255, 255, 0.72);
  color: #5b21b6;
}
.cp-btn-secondary:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(124, 58, 237, 0.4);
  background: rgba(243, 232, 255, 0.82);
}
.cp-btn-secondary:disabled { opacity: 0.45; cursor: not-allowed; }
</style>
