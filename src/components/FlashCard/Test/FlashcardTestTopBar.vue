<template>
  <div class="topbar">
    <button type="button" class="back-btn" @click="$emit('back')">返回</button>

    <div
      class="card-toggle"
      @mouseenter="showCard = true"
      @mouseleave="showCard = false"
    >
      <div class="card-icon">答</div>
      <div v-if="showCard" class="card-panel">
        <button
          v-for="q in questionOrder"
          :key="q.id || q.index"
          type="button"
          class="card-num"
          :class="{ answered: q.answered }"
          @click="$emit('selectQuestion', q.index)"
        >
          {{ q.index + 1 }}
        </button>
      </div>
    </div>

    <div class="meta">
      <div class="title">{{ title || '闪卡测试' }}</div>
    </div>

    <div class="actions">
      <div class="stats" v-if="totalQuestions > 0">
        <span>题目数 <span class="num">{{ totalQuestions }}</span></span>
        <span class="dot">·</span>
        <span>已作答 <span class="num">{{ answeredQuestions }}</span></span>
      </div>
      <button type="button" class="btn btn-ghost" @click="$emit('save')" :disabled="saving">
        <span v-if="!saving">保存</span>
        <span v-else class="loading">
          <span class="dot-loading"></span>
          保存中...
        </span>
      </button>
      <button type="button" class="btn btn-primary" @click="$emit('submit')" :disabled="submitting">
        <span v-if="!submitting">提交</span>
        <span v-else class="loading">
          <span class="dot-loading"></span>
          提交中...
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  title: { type: String, default: '' },
  saving: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
  totalQuestions: { type: Number, default: 0 },
  answeredQuestions: { type: Number, default: 0 },
  // [{ index:number, id:string, answered:boolean }]
  questionOrder: {
    type: Array,
    default: () => []
  }
})
defineEmits(['back', 'save', 'submit'])

const showCard = ref(false)
</script>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 4px 12px 0;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.back-btn {
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}
.back-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.meta {
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 18px;
  font-weight: 950;
  color: #1e293b;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.stats {
  font-size: 13px;
  font-weight: 700;
  color: #6b7280;
  white-space: nowrap;
}

.stats .dot {
  margin: 0 6px;
  opacity: 0.6;
}

.stats .num {
  color: #4f46e5;
  font-weight: 800;
}

.card-toggle {
  position: fixed;
  top: 18px;
  left: 24px;
  z-index: 50;
}

.card-icon {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 850;
  color: #4f46e5;
  background: #ffffff;
  cursor: pointer;
}

.card-panel {
  position: absolute;
  top: 32px;
  left: 0;
  z-index: 40;
  padding: 10px 10px 8px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
  min-width: 150px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(32px, auto);
  column-gap: 4px;
  row-gap: 4px;
}

.card-num {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  font-size: 13px;
  font-weight: 800;
  color: #6b7280;
  cursor: pointer;
}

.card-num.answered {
  border-color: rgba(79, 70, 229, 0.7);
  background: rgba(79, 70, 229, 0.08);
  color: #4f46e5;
}

.btn {
  border-radius: 999px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 750;
  transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
}

.btn:hover {
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.1);
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.88;
  transform: none;
  box-shadow: none;
}

.btn-ghost {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
}
.btn-ghost:hover {
  background: #f3f4f6;
}

.btn-primary {
  border: none;
  background: #4f46e5;
  color: #fff;
  box-shadow: 0 8px 22px rgba(79, 70, 229, 0.25);
}
.btn-primary:hover {
  background: #4338ca;
}

.loading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.dot-loading {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.65);
  border-top-color: #fff;
  animation: spin 0.6s linear infinite;
}

.btn-ghost .dot-loading {
  border-color: rgba(100, 116, 139, 0.35);
  border-top-color: rgba(51, 65, 85, 0.9);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

