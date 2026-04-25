<template>
  <main class="cp-panel cp-panel--assessment cp-immerse">
    <div class="cp-immerse__scene" aria-hidden="true">
      <div class="cp-immerse__gradient" />
      <div class="cp-immerse__orb cp-immerse__orb--a" />
      <div class="cp-immerse__orb cp-immerse__orb--b" />
      <div class="cp-immerse__orb cp-immerse__orb--c" />
      <div class="cp-immerse__grain" />
    </div>
    <div class="cp-assess__inner">
      <div class="cp-assess__toolbar">
        <button type="button" class="cp-assess__ghost-btn" @click="$emit('go-story')">返回介绍</button>
        <div class="cp-assess__toolbar-mid">
          <div
            v-if="totalQuestions"
            class="cp-assess__track"
            role="progressbar"
            :aria-valuenow="currentQuestionIndex + 1"
            :aria-valuemin="1"
            :aria-valuemax="totalQuestions"
            aria-label="测评进度"
          >
            <div class="cp-assess__track-fill" :style="{ width: assessmentProgressPercent + '%' }" />
          </div>
        </div>
        <div class="cp-assess__toolbar-right">
          <button
            type="button"
            class="cp-assess__pill-btn"
            :disabled="assessmentLoading || !!assessmentError || !totalQuestions"
            @click="$emit('random-all')"
          >
            一键随机
          </button>
          <span v-if="totalQuestions" class="cp-assess__count">
            {{ currentQuestionIndex + 1 }}<span class="cp-assess__count-sep">/</span>{{ totalQuestions }}
          </span>
        </div>
      </div>

      <div class="cp-assess__card">
        <div v-if="assessmentLoading" class="cp-assess__state">正在载入题目，请稍候…</div>
        <div v-else-if="assessmentError" class="cp-assess__state cp-assess__state--err">{{ assessmentError }}</div>
        <div v-else-if="currentQuestion" class="cp-assess__quiz">
          <p class="cp-assess__q-label">第 {{ currentQuestionIndex + 1 }} 题</p>
          <p class="cp-assess__q-text">{{ currentQuestion.title }}</p>
          <div class="cp-assess__options">
            <label
              v-for="option in currentQuestion.options"
              :key="option.id"
              class="cp-option"
              :class="{ 'cp-option--on': currentQuestionAnswer === option.id }"
            >
              <input
                type="radio"
                :name="'q-' + currentQuestion.id"
                :value="option.id"
                :checked="currentQuestionAnswer === option.id"
                @change="$emit('select-answer', option.id)"
              />
              <span class="cp-option__text">{{ option.title }}</span>
            </label>
          </div>
          <div class="cp-assess__nav">
            <button
              type="button"
              class="cp-assess__nav-btn cp-assess__nav-btn--muted"
              :disabled="currentQuestionIndex === 0"
              @click="$emit('prev-question')"
            >
              上一题
            </button>
            <button type="button" class="cp-assess__nav-btn cp-assess__nav-btn--primary" @click="$emit('next-question')">
              {{ isLastQuestion ? '提交并进入分析' : '下一题' }}
            </button>
          </div>
        </div>
        <div v-else class="cp-assess__state">暂无题目，请稍后重试。</div>
      </div>
    </div>
  </main>
</template>

<script setup>
defineProps({
  assessmentLoading: { type: Boolean, required: true },
  assessmentError: { type: String, required: true },
  totalQuestions: { type: Number, required: true },
  currentQuestionIndex: { type: Number, required: true },
  assessmentProgressPercent: { type: Number, required: true },
  currentQuestion: { type: Object, default: null },
  currentQuestionAnswer: { type: [String, Number, null], default: null },
  isLastQuestion: { type: Boolean, required: true }
})

defineEmits(['go-story', 'random-all', 'select-answer', 'prev-question', 'next-question'])
</script>

<style scoped>
.cp-panel { flex: 1; display: flex; flex-direction: column; min-height: calc(100vh - var(--cp-nav-offset)); box-sizing: border-box; }
.cp-immerse { position: relative; isolation: isolate; overflow-x: hidden; }
.cp-immerse__scene { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
.cp-immerse__gradient { position: absolute; inset: 0; background: var(--cp-bg); }
.cp-immerse__orb,.cp-immerse__grain { display: none; }
.cp-panel--assessment { padding: 16px clamp(14px, 4vw, 40px) max(28px, env(safe-area-inset-bottom)); justify-content: center; align-items: stretch; }
.cp-assess__inner { position: relative; z-index: 1; width: 100%; max-width: min(720px, 100%); margin: 0 auto; display: flex; flex-direction: column; justify-content: center; flex: 1; min-height: 0; gap: clamp(16px, 3vh, 28px); }
.cp-assess__toolbar { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 12px 16px; padding: 10px 14px; border-radius: 999px; background: var(--cp-glass); border: 1px solid var(--cp-glass-border); backdrop-filter: blur(18px) saturate(1.4); box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06); }
@media (max-width: 640px) {.cp-assess__toolbar { grid-template-columns: 1fr; border-radius: 20px; }}
.cp-assess__toolbar-mid { min-width: 0; }
.cp-assess__track { height: 6px; border-radius: 999px; background: rgba(15, 23, 42, 0.08); overflow: hidden; }
.cp-assess__track-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #6366f1, #3b82f6, #0ea5e9); transition: width 0.35s cubic-bezier(0.33, 1, 0.68, 1); }
.cp-assess__ghost-btn { border: none; background: transparent; padding: 6px 4px; font-size: 13px; font-weight: 600; color: rgba(30, 41, 59, 0.75); cursor: pointer; white-space: nowrap; }
.cp-assess__ghost-btn:hover { color: var(--cp-brand); }
.cp-assess__toolbar-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
.cp-assess__pill-btn { padding: 8px 14px; border-radius: 999px; border: 1px solid rgba(37, 99, 235, 0.22); background: rgba(255, 255, 255, 0.75); color: #1d4ed8; font-size: 12px; font-weight: 700; letter-spacing: 0.02em; cursor: pointer; transition: transform 0.15s, box-shadow 0.2s, background 0.2s; }
.cp-assess__pill-btn:hover:not(:disabled) { background: #fff; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.18); }
.cp-assess__pill-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.cp-assess__count { font-size: 13px; font-weight: 700; font-variant-numeric: tabular-nums; color: rgba(30, 41, 59, 0.55); white-space: nowrap; }
.cp-assess__count-sep { margin: 0 2px; opacity: 0.45; font-weight: 500; }
.cp-assess__card { background: var(--cp-glass); border: 1px solid var(--cp-glass-border); border-radius: clamp(22px, 3vw, 28px); padding: clamp(24px, 4vw, 40px) clamp(20px, 4vw, 36px); backdrop-filter: blur(22px) saturate(1.35); box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.85); }
.cp-assess__state { text-align: center; padding: 48px 16px; font-size: 16px; color: var(--cp-muted); }
.cp-assess__state--err { color: #dc2626; }
.cp-assess__q-label { margin: 0 0 12px; font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(37, 99, 235, 0.85); }
.cp-assess__q-text { margin: 0 0 clamp(24px, 4vh, 36px); font-size: clamp(1.2rem, 2.4vw + 0.6rem, 1.75rem); font-weight: 700; line-height: 1.35; letter-spacing: -0.02em; color: #0f172a; }
.cp-assess__options { display: flex; flex-direction: column; gap: 14px; margin-bottom: clamp(24px, 4vh, 36px); }
.cp-option { display: flex; align-items: center; gap: 14px; padding: 18px 20px; border-radius: 16px; border: 1px solid rgba(15, 23, 42, 0.08); background: rgba(255, 255, 255, 0.72); cursor: pointer; font-size: clamp(15px, 1.1vw + 13px, 17px); line-height: 1.45; color: var(--cp-text); transition: border-color 0.2s, box-shadow 0.2s, background 0.2s, transform 0.2s; }
.cp-option:hover { transform: translateY(-1px); border-color: rgba(99, 102, 241, 0.25); box-shadow: 0 8px 28px rgba(15, 23, 42, 0.08); }
.cp-option input { width: 18px; height: 18px; flex-shrink: 0; accent-color: var(--cp-brand); }
.cp-option__text { flex: 1; }
.cp-option--on { border-color: rgba(37, 99, 235, 0.5); background: linear-gradient(135deg, rgba(224, 231, 255, 0.95), rgba(224, 242, 254, 0.9)); box-shadow: 0 8px 28px rgba(37, 99, 235, 0.12); }
.cp-assess__nav { display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap; }
.cp-assess__nav-btn { padding: 14px 24px; border-radius: 14px; font-size: 15px; font-weight: 600; cursor: pointer; border: none; transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s; }
.cp-assess__nav-btn--muted { background: rgba(255, 255, 255, 0.65); color: #475569; border: 1px solid rgba(15, 23, 42, 0.1); }
.cp-assess__nav-btn--muted:hover:not(:disabled) { background: #fff; }
.cp-assess__nav-btn--primary { background: linear-gradient(135deg, #7c3aed, #8b5cf6); color: #fff; box-shadow: 0 10px 28px rgba(124, 58, 237, 0.35); }
.cp-assess__nav-btn--primary:hover { transform: translateY(-1px); box-shadow: 0 14px 34px rgba(124, 58, 237, 0.4); }
.cp-assess__nav-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }
.cp-option:focus-within { outline: 2px solid var(--cp-focus); outline-offset: 2px; }
</style>
