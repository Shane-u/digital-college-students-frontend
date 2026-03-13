<template>
  <div class="attempts-page">
    <div class="shell">
      <div class="topbar">
        <button class="btn ghost" type="button" @click="goBack">返回</button>
        <div class="meta">
          <div class="title">提交记录</div>
        </div>
      </div>

      <div v-if="loading" class="state">正在加载...</div>
      <div v-else-if="items.length === 0" class="state">暂无提交记录</div>

      <div v-else class="list">
        <button
          v-for="it in items"
          :key="it.attemptId"
          type="button"
          class="row"
          @click="openDetail(it)"
        >
          <div class="left">
            <div class="score" :class="{ pass: it.pass, fail: !it.pass }">{{ it.totalScore }}</div>
            <div class="hint">{{ it.pass ? '通过' : '未通过' }}</div>
          </div>
          <div class="right">
            <div class="time">{{ formatTime(it.submitTime) }}</div>
            <div class="more">查看详情</div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { flashCardTestApi } from '../api/flashCardTest'

const route = useRoute()
const router = useRouter()

const testId = computed(() => String(route.params.testId || ''))
const loading = ref(true)
const items = ref([])

const goBack = () => router.back()

const formatTime = (s) => {
  if (!s) return ''
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return String(s)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const openDetail = (it) => {
  router.push({ name: 'FlashcardTestAttemptDetail', params: { attemptId: String(it.attemptId) } })
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await flashCardTestApi.listAttempts(testId.value)
    const data = res?.data ?? res
    items.value = Array.isArray(data) ? data : []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.attempts-page {
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
  gap: 12px;
  align-items: center;
}
.meta {
  min-width: 0;
}
.title {
  font-size: 15px;
  font-weight: 900;
  color: #111827;
}
.sub {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 650;
  color: #9ca3af;
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
.list {
  padding-top: 10px;
  display: grid;
  gap: 0;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 2px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
}
.row:hover {
  background: #f9fafb;
}
.left {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.score {
  font-size: 22px;
  font-weight: 950;
  font-style: italic;
}
.score.pass {
  color: #16a34a;
}
.score.fail {
  color: #ef4444;
}
.hint {
  font-size: 12px;
  font-weight: 750;
  color: #6b7280;
}
.right {
  text-align: right;
}
.time {
  font-size: 12px;
  font-weight: 650;
  color: #6b7280;
}
.more {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 800;
  color: #4f46e5;
}
</style>

