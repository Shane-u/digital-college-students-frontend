<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">简历分析结果</h3>
      <p class="card-desc">会结合目标岗位与候选人层级，输出优势点与高频追问方向。</p>
    </div>

    <div class="targets">
      <div class="field">
        <div class="label">目标岗位（可选）</div>
        <input class="input" :value="targetRole" placeholder="例如：前端开发 / Java 后端" @input="$emit('update:targetRole', $event.target.value)" />
      </div>
      <div class="field">
        <div class="label">目标层级（可选）</div>
        <input class="input" :value="targetLevel" placeholder="例如：校招 / 初级 / 中级" @input="$emit('update:targetLevel', $event.target.value)" />
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <div class="loading-text">正在分析你的简历结构与内容...</div>
    </div>

    <div v-else-if="result" class="result">
      <div class="pill-row">
        <span class="pill ok">优势亮点</span>
        <span class="pill subtle">来源：{{ sourceLabel }}</span>
      </div>
      <ul class="strengths">
        <li v-for="(s, idx) in (result.strengths || [])" :key="idx" class="strength-item">
          <span class="strength-dot"></span>
          <span class="strength-text">{{ s }}</span>
        </li>
        <li v-if="(result.strengths || []).length === 0" class="placeholder">暂无优势亮点（请检查接口返回字段）。</li>
      </ul>

      <div class="divider"></div>

      <div class="pill-row">
        <span class="pill">匹配建议</span>
      </div>
      <ul class="list">
        <li v-for="(item, idx) in (result.matchingSuggestions || [])" :key="idx" class="item">
          <div class="item-tag">{{ item.tag }}</div>
          <div class="item-main">
            <div class="item-title">{{ item.title }}</div>
            <div v-if="item.desc" class="item-body">{{ item.desc }}</div>
          </div>
        </li>
        <li v-if="(result.matchingSuggestions || []).length === 0" class="placeholder">暂无匹配建议。</li>
      </ul>

      <div class="divider"></div>

      <div class="pill-row">
        <span class="pill danger">可能追问</span>
        <span class="subhint">建议把这些问题提前准备成 STAR 或 3 段式回答。</span>
      </div>
      <ul class="questions">
        <li v-for="(q, idx) in (result.resumeQuestions || [])" :key="idx" class="q-item">
          <span class="q-index">Q{{ idx + 1 }}</span>
          <div class="q-main">
            <div class="q-title">{{ q.question }}</div>
            <div v-if="q.hint" class="q-hint">{{ q.hint }}</div>
          </div>
        </li>
        <li v-if="(result.resumeQuestions || []).length === 0" class="placeholder">暂无追问问题。</li>
      </ul>

      <div class="next">
        <div class="next-main">
          <div class="next-title">下一步：开始面试训练</div>
          <div class="next-desc">分析结果会同步到面试环节中，用于生成更针对性的提问与评价。</div>
        </div>
        <button type="button" class="btn-secondary next-btn" @click="$emit('goto-interview')">去选择面试方式</button>
      </div>
    </div>

    <div v-else class="empty">
      <div class="empty-icon">✨</div>
      <p class="empty-title">还没有简历分析结果</p>
      <p class="empty-desc">先在左侧上传/选择简历并点击「开始分析简历」，这里会展示优势与追问清单。</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  result: { type: Object, default: null },
  resumeSource: { type: String, default: 'PLATFORM' },
  targetRole: { type: String, default: '' },
  targetLevel: { type: String, default: '' },
})

defineEmits(['update:targetRole', 'update:targetLevel', 'goto-interview'])

const sourceLabel = computed(() => (props.resumeSource === 'PLATFORM' ? '平台简历' : '上传简历'))
</script>

<style scoped>
.card {
  background: #ffffff;
  border-radius: 20px;
  padding: 18px 18px 20px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.card-header {
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.card-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0 0;
  line-height: 1.7;
}

.targets {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}

.input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #f9fafb;
  font-size: 13px;
  color: #111827;
  outline: none;
  transition: box-shadow 0.16s ease, border-color 0.16s ease, background-color 0.16s ease;
}

.input:focus {
  border-color: rgba(79, 70, 229, 0.55);
  background: #ffffff;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.12);
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

.subhint {
  font-size: 11px;
  color: #9ca3af;
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

.list {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item {
  display: flex;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 14px;
  background: #f9fafb;
}

.item-tag {
  padding: 4px 8px;
  border-radius: 999px;
  background: #111827;
  color: #e5e7eb;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.item-main {
  font-size: 12px;
  color: #111827;
}

.item-title {
  font-weight: 800;
  margin-bottom: 2px;
}

.item-body {
  color: #4b5563;
  line-height: 1.7;
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
  font-size: 12px;
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
  margin-top: 6px;
  padding: 10px 10px;
  border-radius: 16px;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.next-main {
  font-size: 12px;
  color: #111827;
}

.next-title {
  font-weight: 800;
}

.next-desc {
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
  padding: 22px 12px 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, #eff6ff, #fefce8);
  text-align: left;
}

.empty-icon {
  font-size: 24px;
  margin-bottom: 6px;
}

.empty-title {
  font-size: 14px;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

.empty-desc {
  font-size: 12px;
  color: #6b7280;
  margin: 4px 0 0;
  line-height: 1.7;
}

.placeholder {
  font-size: 12px;
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

@media (max-width: 960px) {
  .targets {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>

