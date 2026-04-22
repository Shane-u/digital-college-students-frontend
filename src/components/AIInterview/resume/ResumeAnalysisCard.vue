<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">简历分析结果</h3>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <div class="loading-text">正在分析你的简历结构与内容...</div>
    </div>

    <div v-else-if="result" class="result">
      <div class="meta-row">
        <span class="pill subtle">来源：{{ sourceLabel }}</span>
      </div>

      <div class="tabs">
        <button type="button" class="tab" :class="{ active: tab === 'STRENGTHS' }" @click="tab = 'STRENGTHS'">优势亮点</button>
        <button type="button" class="tab" :class="{ active: tab === 'WEAKNESSES' }" @click="tab = 'WEAKNESSES'">短板与不足</button>
        <button type="button" class="tab" :class="{ active: tab === 'RISKS' }" @click="tab = 'RISKS'">风险点</button>
        <button type="button" class="tab" :class="{ active: tab === 'IMPROVE' }" @click="tab = 'IMPROVE'">改进建议</button>
        <button type="button" class="tab" :class="{ active: tab === 'QUESTIONS' }" @click="tab = 'QUESTIONS'">建议追问</button>
      </div>

      <div class="panel">
        <div v-if="tab === 'STRENGTHS'">
          <div class="panel-head">
            <span class="pill ok">优势亮点</span>
          </div>
          <ul class="strengths">
            <li v-for="(s, idx) in (result.strengths || [])" :key="idx" class="strength-item">
              <span class="strength-dot"></span>
              <span class="strength-text">{{ s }}</span>
            </li>
            <li v-if="(result.strengths || []).length === 0" class="placeholder">暂无优势亮点。</li>
          </ul>
        </div>

        <div v-else-if="tab === 'WEAKNESSES'">
          <div class="panel-head">
            <span class="pill warn">短板与不足</span>
          </div>
          <ul class="bullets warn-list">
            <li v-for="(s, idx) in (result.weaknesses || [])" :key="idx">{{ s }}</li>
            <li v-if="(result.weaknesses || []).length === 0" class="placeholder">暂无短板信息。</li>
          </ul>
        </div>

        <div v-else-if="tab === 'RISKS'">
          <div class="panel-head">
            <span class="pill danger">风险点</span>
          </div>
          <ul class="bullets danger-list">
            <li v-for="(s, idx) in (result.riskPoints || [])" :key="idx">{{ s }}</li>
            <li v-if="(result.riskPoints || []).length === 0" class="placeholder">暂无风险点。</li>
          </ul>
        </div>

        <div v-else-if="tab === 'IMPROVE'">
          <div class="panel-head">
            <span class="pill">改进建议</span>
          </div>
          <ul class="bullets">
            <li v-for="(s, idx) in (result.improvementSuggestions || [])" :key="idx">{{ s }}</li>
            <li v-if="(result.improvementSuggestions || []).length === 0" class="placeholder">暂无改进建议。</li>
          </ul>
        </div>

        <div v-else>
          <div class="panel-head">
            <span class="pill danger">建议追问</span>
          </div>
          <ul class="questions">
            <li v-for="(q, idx) in (result.suggestedQuestions || result.resumeQuestions || [])" :key="idx" class="q-item">
              <span class="q-index">Q{{ idx + 1 }}</span>
              <div class="q-main">
                <div class="q-title">{{ q.question }}</div>
                <div v-if="q.hint" class="q-hint">{{ q.hint }}</div>
              </div>
            </li>
            <li v-if="(result.suggestedQuestions || result.resumeQuestions || []).length === 0" class="placeholder">暂无追问问题。</li>
          </ul>
        </div>
      </div>

      <div class="next">
        <div class="next-main">
          <div class="next-title">下一步：开始面试训练</div>
          <div class="next-desc">分析结果会同步到面试环节中，用于生成更针对性的提问与评价。</div>
        </div>
        <button type="button" class="btn-secondary next-btn" @click="$emit('goto-interview')">去选择面试方式</button>
      </div>
    </div>

    <div v-else class="empty">
      <img class="empty-image" :src="resumePlaceholderImage" alt="简历分析占位图" />
      <p class="empty-tip">请上传并分析简历~</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import resumePlaceholderImage from '../../../assets/AIInterview/AI_Resume.png'

const props = defineProps({
  loading: { type: Boolean, default: false },
  result: { type: Object, default: null },
  resumeSource: { type: String, default: 'PLATFORM' },
})

defineEmits(['goto-interview'])

const sourceLabel = computed(() => (props.resumeSource === 'PLATFORM' ? '平台简历' : '上传简历'))

const tab = ref('STRENGTHS')
watch(
  () => props.result,
  (val) => {
    if (!val) return
    tab.value = 'STRENGTHS'
  }
)
</script>

<style scoped>
.card {
  background: #ffffff;
  border-radius: 20px;
  padding: 18px 18px 20px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(226, 232, 240, 0.9);
  display: flex;
  flex-direction: column;
}

.card-header {
  margin-bottom: 12px;
}

.card-title {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.loading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 12px 14px;
  border-radius: 14px;
  background: #f9fafb;
}

.spinner {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 2px solid rgba(148, 163, 184, 0.4);
  border-top-color: #4f46e5;
  animation: spin 0.7s linear infinite;
}

.loading-text {
  font-size: 13px;
  color: #6b7280;
}

.result {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.tab {
  border-radius: 999px;
  padding: 8px 12px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(255, 255, 255, 0.86);
  color: #4b5563;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.14s ease, background-color 0.14s ease, border-color 0.14s ease;
  white-space: nowrap;
}

.tab:hover {
  transform: translateY(-1px);
  background: #f8fafc;
}

.tab.active {
  border-color: rgba(124, 58, 237, 0.85);
  background: rgba(124, 58, 237, 0.12);
  color: #5b21b6;
}

.panel {
  margin-top: 2px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(226, 232, 240, 0.9);
  padding: 12px;
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}


.pill-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pill {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(79, 70, 229, 0.08);
  color: #4f46e5;
  font-weight: 700;
}

.pill.ok {
  background: rgba(34, 197, 94, 0.1);
  color: #15803d;
}

.pill.subtle {
  background: rgba(148, 163, 184, 0.08);
  color: #6b7280;
}

.pill.danger {
  background: rgba(220, 38, 38, 0.06);
  color: #b91c1c;
}

.pill.warn {
  background: rgba(245, 158, 11, 0.12);
  color: #92400e;
}

.bullets {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: #4b5563;
  line-height: 1.8;
}

.warn-list {
  color: #92400e;
}

.danger-list {
  color: #7f1d1d;
}


.strengths {
  list-style: none;
  margin: 2px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.strength-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 14px;
  background: rgba(34, 197, 94, 0.06);
  border: 1px solid rgba(34, 197, 94, 0.12);
}

.strength-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #22c55e;
  margin-top: 6px;
  flex-shrink: 0;
}

.strength-text {
  font-size: 12px;
  color: #14532d;
  line-height: 1.7;
}

.divider {
  height: 1px;
  margin: 6px 0;
  background: linear-gradient(to right, rgba(226, 232, 240, 0.9), rgba(226, 232, 240, 0));
}

.questions {
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.q-item {
  display: flex;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 14px;
  background: #fef2f2;
  border: 1px solid rgba(220, 38, 38, 0.12);
}

.q-index {
  font-size: 11px;
  font-weight: 800;
  color: #b91c1c;
  margin-top: 2px;
  flex-shrink: 0;
}

.q-main {
  font-size: 16px;
  color: #7f1d1d;
  line-height: 1.7;
}

.q-title {
  font-weight: 800;
}

.q-hint {
  margin-top: 2px;
  color: #9f1239;
}

.next {
  margin-top: auto;
  padding: 10px 10px;
  border-radius: 16px;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.next-main {
  font-size: 16px;
  color: #111827;
}

.next-title {
  font-weight: 800;
}

.next-desc {
  font-size: 14px;
  color: #6b7280;
  margin-top: 2px;
  line-height: 1.7;
}

.btn-secondary {
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 800;
  border: 1px solid rgba(148, 163, 184, 0.6);
  background: rgba(255, 255, 255, 0.9);
  color: #4b5563;
  cursor: pointer;
  transition: transform 0.18s ease, background-color 0.18s ease;
  white-space: nowrap;
}

.btn-secondary:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}

.empty {
  padding: 16px 12px 10px;
  border-radius: 16px;
  text-align: center;
}

.empty-image {
  display: block;
  width: min(100%, 420px);
  margin: 0 auto;
  height: auto;
  object-fit: contain;
}

.empty-tip {
  margin: 10px 0 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: #334e68;
  text-shadow: 0 2px 8px rgba(51, 78, 104, 0.15);
  line-height: 1.6;
}

.placeholder {
  font-size: 16px;
  color: #94a3b8;
  padding: 10px 10px;
  border-radius: 14px;
  background: rgba(148, 163, 184, 0.06);
  border: 1px dashed rgba(148, 163, 184, 0.22);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

 
</style>

