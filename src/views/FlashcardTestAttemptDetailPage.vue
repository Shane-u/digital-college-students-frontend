<template>
  <div class="attempt-detail-page">
    <div class="shell">
      <div class="topbar">
        <button class="btn ghost" type="button" @click="goBack">返回</button>
        <div class="meta">
          <div class="title">作答详情</div>
        </div>
      </div>

      <div v-if="loading" class="state">正在加载...</div>
      <div v-else-if="questions.length === 0" class="state">暂无数据</div>

      <div v-else class="q-list">
        <div v-for="(q, idx) in questions" :key="q.id" class="q">
          <div class="q-head">
            <div class="idx">{{ idx + 1 }}</div>
            <div class="content">{{ q.content }}</div>
            <div class="score">
              <span class="u" :class="scoreClass(q)">{{ q.userScore }}</span>
              <span class="sep">/</span>
              <span class="t">{{ q.score }}</span>
            </div>
          </div>

          <div v-if="q.options && q.options.length" class="opts">
            <div v-for="(op, i) in q.options" :key="i" class="op">
              <div class="k">{{ String.fromCharCode(65 + i) }}</div>
              <div class="t">{{ op }}</div>
            </div>
          </div>

          <div class="answer-block">
            <div class="line">
              <div class="label">你的答案</div>
              <div class="val" :class="userAnswerClass(q)">{{ q.userAnswer || '-' }}</div>
            </div>
            <div class="line">
              <div class="label">参考答案</div>
              <div class="val">{{ q.answer || '-' }}</div>
            </div>
          </div>

          <div v-if="q.aiAnswer" class="ai">
            <div class="label">AI 解析</div>
            <div class="val">{{ q.aiAnswer }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { flashCardTestApi } from '../api/flashCardTest'

const route = useRoute()
const router = useRouter()

const attemptId = computed(() => String(route.params.attemptId || ''))
const loading = ref(true)
const questions = ref([])

const goBack = () => router.back()

const fullAndGot = (q) => {
  const full = Number(q.score ?? 0)
  const got = Number(q.userScore ?? 0)
  return { full, got }
}

const scoreClass = (q) => {
  const { full, got } = fullAndGot(q)
  if (!Number.isFinite(full) || full <= 0) return ''
  if (!Number.isFinite(got)) return 'score-wrong'
  return got >= full ? 'score-correct' : 'score-wrong'
}

const userAnswerClass = (q) => {
  const { full, got } = fullAndGot(q)
  if (!Number.isFinite(full) || full <= 0) return ''
  if (!Number.isFinite(got)) return 'wrong'
  return got >= full ? 'correct' : 'wrong'
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await flashCardTestApi.getAttemptDetail(attemptId.value)
    const data = res?.data ?? res
    questions.value = Array.isArray(data) ? data : []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.attempt-detail-page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  justify-content: center;
  padding: 18px 16px 40px;
}
.shell {
  width: 100%;
  max-width: 980px;
}
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  gap: 400px;
  align-items: center;
}
.meta {
  min-width: 0;
}
.title {
  font-size: 22px;
  font-weight: 950;
  color: #111827;
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
  background: #fff;
  color: #374151;
}
.btn.ghost:hover {
  background: #f3f4f6;
}
.state {
  padding: 24px 2px;
  color: #6b7280;
  font-weight: 650;
  font-size: 13px;
}
.q-list {
  padding-top: 12px;
}
.q {
  padding: 14px 2px 18px;
  border-bottom: 1px solid #f1f5f9;
}
.q-head {
  display: grid;
  grid-template-columns: 34px 1fr auto;
  gap: 12px;
  align-items: center;
}
.idx {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #f3f4f6;
  color: #111827;
  font-weight: 900;
}
.content {
  font-size: 16px;
  font-weight: 850;
  color: #111827;
  line-height: 1.6;
}
.score {
  font-size: 12px;
  font-weight: 850;
  color: #6b7280;
  white-space: nowrap;
}
.score .u {
  font-style: italic;
}
.score .u.score-correct {
  color: #16a34a;
}
.score .u.score-wrong {
  color: #ef4444;
}
.opts {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}
.op {
  display: grid;
  grid-template-columns: 26px 1fr;
  gap: 10px;
  align-items: center;
}
.op .k {
  width: 26px;
  height: 26px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 900;
  color: #6b7280;
  background: #f3f4f6;
}
.op .t {
  font-size: 16px;
  font-weight: 700;
  color: #374151;
  line-height: 1.6;
}
.answer-block {
  margin-top: 12px;
  display: grid;
  gap: 8px;
}
.line {
  display: grid;
  grid-template-columns: 78px 1fr;
  gap: 10px;
  align-items: start;
}
.label {
  font-size: 16px;
  font-weight: 850;
  color: #6b7280;
}
.val {
  font-size: 16px;
  font-weight: 650;
  color: #111827;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}
.ai {
  margin-top: 12px;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 12px;
}
.ai .val {
  color: #334155;
}

.val.correct {
  color: #16a34a;
}

.val.wrong {
  color: #ef4444;
}
</style>

