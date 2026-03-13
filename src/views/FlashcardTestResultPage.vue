<template>
  <div class="flashcard-test-result-page">
    <div class="result-shell">
      <div class="result-top-row">
        <div class="title-area">
          <div class="title-main">{{ ctxTitle || '闪卡测试' }}</div>
          <div class="title-sub">测试结果</div>
        </div>
        <div class="top-actions">
          <button type="button" class="top-btn ghost" @click="goBack">返回</button>
          <button type="button" class="top-btn primary" @click="viewDetail">查看作答详情</button>
        </div>
      </div>

      <div class="center-block">
        <div class="score-line">
          <span class="score-label">得分</span>
          <span class="score-value" :class="{ pass: isPass, fail: !isPass }">{{ score }}</span>
          <span class="score-unit">分</span>
        </div>

        <div class="image-wrap">
          <img v-if="!isPass" :src="failedImg" alt="failed" class="result-img" />
          <img v-else :src="passImg" alt="pass" class="result-img" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import passImg from '../assets/homework/pass.png'
import failedImg from '../assets/homework/failed.png'
import { loadFlashcardTestContext, loadTestResult, markFlashcardPassed } from '../utils/flashcardTestStorage'

const route = useRoute()
const router = useRouter()

const flashcardId = computed(() => String(route.params.flashcardId || ''))
const ctxTitle = ref('')
const score = ref(0)
const submitId = ref('')

const isPass = computed(() => Number(score.value) > 60)

onMounted(() => {
  const ctx = loadFlashcardTestContext(flashcardId.value)
  ctxTitle.value = ctx?.title || ''

  const res = loadTestResult(flashcardId.value)
  const s = Number(res?.totalScore ?? res?.score ?? route.query?.score ?? 0)
  score.value = Number.isFinite(s) ? Math.max(0, Math.min(100, Math.round(s))) : 0
  submitId.value = String(res?.submitId ?? route.query?.submitId ?? '')

  // 先用本地缓存模拟“及格打勾”
  markFlashcardPassed(flashcardId.value, isPass.value)
})

const goBack = () => {
  router.back()
}

const viewDetail = () => {
  if (submitId.value) {
    router.push({ name: 'FlashcardTestAttemptDetail', params: { attemptId: String(submitId.value) } })
    return
  }
  router.push({ name: 'FlashcardTest', params: { flashcardId: flashcardId.value }, query: { review: '1' } })
}
</script>

<style scoped>
.flashcard-test-result-page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  justify-content: center;
  padding: 28px 20px 40px;
}

.result-shell {
  width: 100%;
  max-width: 980px;
}

.result-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
}

.title-area {
  min-width: 0;
}

.title-main {
  font-size: 18px;
  font-weight: 900;
  color: #111827;
  letter-spacing: 0.03em;
}

.title-sub {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #9ca3af;
}

.top-actions {
  display: flex;
  gap: 10px;
}

.top-btn {
  padding: 8px 16px;
  border-radius: 999px;
  border: none;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  letter-spacing: 0.04em;
  transition: transform 0.18s ease, filter 0.18s ease, box-shadow 0.18s ease;
}

.top-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.03);
}

.top-btn.ghost {
  background: #f3f4f6;
  color: #374151;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.12);
}

.top-btn.primary {
  background: #111827;
  color: #f9fafb;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.22);
}

.center-block {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-line {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.score-label {
  font-size: 14px;
  font-weight: 900;
  color: #6b7280;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.score-value {
  font-size: 88px;
  font-weight: 950;
  line-height: 1;
  letter-spacing: -0.02em;
  font-style: italic;
}

.score-value.pass {
  color: #16a34a;
}

.score-value.fail {
  color: #ef4444;
}

.score-unit {
  font-size: 18px;
  font-weight: 900;
  color: #6b7280;
}

.image-wrap {
  margin-top: 12px;
  width: min(380px, 70%);
}

.result-img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 24px;
}
</style>

