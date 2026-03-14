<template>
  <Transition name="drawer-left">
    <div v-if="visible" class="drawer-wrap">
      <div class="drawer">
        <div class="head">
          <div class="title">测试点</div>
          <button class="x" type="button" @click="$emit('close')" aria-label="关闭">×</button>
        </div>

        <div class="tabs">
          <button type="button" class="tab" :class="{ active: difficulty === '' }" @click="setDifficulty('')">全部</button>
          <button type="button" class="tab" :class="{ active: difficulty === 'easy' }" @click="setDifficulty('easy')">简单</button>
          <button type="button" class="tab" :class="{ active: difficulty === 'medium' }" @click="setDifficulty('medium')">中等</button>
          <button type="button" class="tab" :class="{ active: difficulty === 'hard' }" @click="setDifficulty('hard')">困难</button>
        </div>

        <div class="body">
          <div v-if="loading" class="state">正在加载历史试卷...</div>
          <div v-else-if="papers.length === 0" class="state">暂无历史试卷</div>

          <div v-else class="list">
            <div
              v-for="p in papers"
              :key="p.testId"
              class="row"
              @mouseenter="hoverId = String(p.testId)"
              @mouseleave="hoverId = ''"
            >
              <div class="main" @click="$emit('openAttempts', p)">
                <div class="line1">
                  <div class="paper-title">试卷</div>
                  <div class="badge">{{ difficultyLabel(p.difficulty) }}</div>
                </div>
                <div class="line2">
                  <div class="meta">
                    <span>提交 {{ p.attemptCount || 0 }} 次</span>
                    <span class="dot">·</span>
                    <span>最高 {{ p.bestTotalScore ?? '-' }}</span>
                    <span class="dot">·</span>
                    <span>最近 {{ p.lastTotalScore ?? '-' }}</span>
                  </div>
                  <div class="time">{{ p.lastSubmitTime ? formatTime(p.lastSubmitTime) : '' }}</div>
                </div>
              </div>

              <div v-if="hoverId === String(p.testId)" class="ops">
                <button type="button" class="op" @click.stop="$emit('redo', p)">重做</button>
                <button type="button" class="op" @click.stop="$emit('delete', p)">删除</button>
                <button type="button" class="op primary" @click="$emit('openAttempts', p)">查看提交记录</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { flashCardTestApi } from '../../../api/flashCardTest'

const props = defineProps({
  visible: { type: Boolean, default: false },
  nodeId: { type: String, default: '' },
  refreshTrigger: { type: Number, default: 0 }
})
defineEmits(['close', 'redo', 'delete', 'openAttempts'])

const loading = ref(false)
const papers = ref([])
const difficulty = ref('')
const hoverId = ref('')

const difficultyLabel = (v) => (v === 'easy' ? '简单' : v === 'medium' ? '中等' : v === 'hard' ? '困难' : '—')

const formatTime = (s) => {
  if (!s) return ''
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return String(s)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const load = async () => {
  if (!props.nodeId) return
  loading.value = true
  try {
    const res = await flashCardTestApi.listPapers({ nodeId: props.nodeId, difficulty: difficulty.value || undefined })
    const list = flashCardTestApi.normalizeList(res)
    papers.value = Array.isArray(list) ? list : []
  } finally {
    loading.value = false
  }
}

const setDifficulty = (v) => {
  difficulty.value = v
}

watch(
  () => [props.visible, props.nodeId],
  () => { if (props.visible) load() }
)
watch(difficulty, () => { if (props.visible) load() })
watch(() => props.refreshTrigger, () => { if (props.visible) load() })

onMounted(() => {
  if (props.visible) load()
})
</script>

<style scoped>
.drawer-wrap {
  position: fixed;
  top: 150px;
  left: 0;
  bottom: 0;
  z-index: 1100;
  pointer-events: none;
}

.drawer {
  width: 420px;
  max-width: 90vw;
  height: 80%;
  background: #ffffff;
  box-shadow: 8px 0 40px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  pointer-events: auto;
  border-radius: 0 18px 18px 0;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  border-bottom: 1px solid #e5e7eb;
}

.title {
  font-size: 15px;
  font-weight: 900;
  color: #111827;
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
}
.x:hover {
  background: #e5e7eb;
}

.tabs {
  display: flex;
  gap: 8px;
  padding: 12px 12px 8px;
}

.tab {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
}
.tab:hover {
  background: #f3f4f6;
}
.tab.active {
  border-color: rgba(79, 70, 229, 0.55);
  background: rgba(79, 70, 229, 0.06);
  color: #4f46e5;
}

.body {
  padding: 10px 12px 18px;
  overflow-y: auto;
}

.state {
  padding: 16px 4px;
  color: #6b7280;
  font-weight: 650;
  font-size: 13px;
}

.list {
  display: grid;
  gap: 0;
}

.row {
  padding: 12px 4px;
  border-bottom: 1px solid #f1f5f9;
  display: grid;
  gap: 10px;
}

.main {
  cursor: pointer;
}
.row:hover {
  background: #fafafa;
}

.line1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.paper-title {
  font-size: 13px;
  font-weight: 900;
  color: #111827;
}
.badge {
  font-size: 11px;
  font-weight: 850;
  color: #6b7280;
  background: #f3f4f6;
  padding: 4px 10px;
  border-radius: 999px;
}
.line2 {
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.meta {
  font-size: 12px;
  font-weight: 650;
  color: #6b7280;
}
.meta .dot {
  margin: 0 6px;
  opacity: 0.6;
}
.time {
  font-size: 12px;
  font-weight: 650;
  color: #9ca3af;
  white-space: nowrap;
}

.ops {
  display: flex;
  gap: 8px;
}
.op {
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
}
.op:hover {
  background: #f3f4f6;
}
.op.primary {
  border: none;
  background: #111827;
  color: #fff;
}
.op.primary:hover {
  background: #0b1220;
}
</style>

