<template>
  <section id="ai-interview-review-section" class="ai-section">
    <div v-if="!embedded" class="section-header">
      <div class="section-header-left">
        <h2 class="section-title">三、面试评价与复盘</h2>
      </div>
      <div class="section-header-right">
        <span class="chip chip-ok">报告已生成</span>
        <button type="button" class="btn-ghost" @click="$emit('back')">返回面试</button>
      </div>
    </div>

    <div class="content">
      <div class="grid">
        <div class="card hero">
          <div v-if="recommendStampInfo.src" class="recommend-stamp">
            <img :src="recommendStampInfo.src" :alt="recommendStampInfo.alt" />
          </div>
          <div class="hero-title-row">
            <div class="hero-title">本次面试总评</div>
            <div class="score-badge">
              <div class="score-number">{{ review.overall.score }}</div>
              <div class="score-label">综合评分</div>
            </div>
          </div>
          <p class="hero-desc" v-html="summaryWithRecommendationHighlight"></p>
        </div>

        <div v-if="review.dimensions && review.dimensions.length" class="card">
          <div class="card-header">
            <h3 class="card-title">能力维度评分</h3>
          </div>
          <div class="dim-list">
            <div v-for="d in review.dimensions" :key="d.key" class="dim">
              <div class="dim-left">
                <div class="dim-name">{{ d.label }}</div>
              </div>
              <div class="dim-right">
                <div class="dim-score">{{ d.score }}</div>
                <div class="bar">
                  <div class="bar-inner" :style="{ width: `${Math.min(100, Math.max(0, d.score))}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">详细建议</h3>
          </div>

          <div class="detail-tabs">
            <button
              type="button"
              class="detail-tab"
              :class="{ active: detailTab === 'STRENGTHS' }"
              @click="detailTab = 'STRENGTHS'"
            >
              亮点
            </button>
            <button
              type="button"
              class="detail-tab"
              :class="{ active: detailTab === 'WEAKNESSES' }"
              @click="detailTab = 'WEAKNESSES'"
            >
              待改进点
            </button>
            <button
              type="button"
              class="detail-tab"
              :class="{ active: detailTab === 'QUESTIONS' }"
              @click="detailTab = 'QUESTIONS'"
            >
              问题小结
            </button>
            <button
              type="button"
              class="detail-tab"
              :class="{ active: detailTab === 'SUGGESTIONS' }"
              @click="detailTab = 'SUGGESTIONS'"
            >
              综合建议
            </button>
          </div>

          <div class="detail-panel">
            <template v-if="detailTab === 'STRENGTHS'">
              <ul v-if="review.strengths && review.strengths.length" class="bullets ok">
                <li v-for="(s, idx) in review.strengths" :key="idx">{{ s }}</li>
              </ul>
              <div v-else class="empty small">
                <div class="empty-title">暂无亮点信息</div>
              </div>
            </template>

            <template v-else-if="detailTab === 'WEAKNESSES'">
              <ul v-if="review.weaknesses && review.weaknesses.length" class="bullets warn">
                <li v-for="(s, idx) in review.weaknesses" :key="idx">{{ s }}</li>
              </ul>
              <div v-else class="empty small">
                <div class="empty-title">暂无待改进点</div>
              </div>
            </template>

            <template v-else-if="detailTab === 'QUESTIONS'">
              <ul v-if="review.questionSummaries && review.questionSummaries.length" class="bullets">
                <li v-for="(q, idx) in review.questionSummaries" :key="idx">{{ q }}</li>
              </ul>
              <div v-else class="empty small">
                <div class="empty-title">暂无问题小结</div>
              </div>
            </template>

            <template v-else>
              <ul v-if="review.suggestions && review.suggestions.length" class="bullets">
                <li v-for="(s, idx) in review.suggestions" :key="idx">{{ s }}</li>
              </ul>
              <div v-else class="empty small">
                <div class="empty-title">暂无综合建议</div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import recommendStamp from '../../assets/AIInterview/recommend.png'
import unrecommendStamp from '../../assets/AIInterview/unrecommend.png'

const props = defineProps({
  review: { type: Object, required: true },
  embedded: { type: Boolean, default: false },
})

defineEmits(['back', 'retest', 'resume'])

const embedded = computed(() => props.embedded)
const detailTab = ref('STRENGTHS') // STRENGTHS | WEAKNESSES | QUESTIONS | SUGGESTIONS

function escapeHtml(s) {
  if (s == null) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 将总评中“不推荐/不建议录用/推荐录用”等关键短语加粗放大 */
const summaryWithRecommendationHighlight = computed(() => {
  const raw = props.review?.overall?.summary || '后端暂未给出招聘建议或综合评价。'
  const escaped = escapeHtml(raw)
  // 先整体转义，再对关键词做局部替换，避免破坏其它内容
  return escaped
    .replace(/不推荐录用/g, '<span class="hero-desc-recommendation">不推荐录用</span>')
    .replace(/不建议录用/g, '<span class="hero-desc-recommendation">不建议录用</span>')
    .replace(/不推荐/g, '<span class="hero-desc-recommendation">不推荐</span>')
    .replace(/推荐录用/g, '<span class="hero-desc-recommendation">推荐录用</span>')
})

const recommendStampInfo = computed(() => {
  const summary = String(props.review?.overall?.summary || '')
  const isNegative = /不推荐|不建议录用|不建议/.test(summary)
  const isPositive = !isNegative && /推荐录用|建议录用|推荐/.test(summary)
  if (isNegative) {
    return { src: unrecommendStamp, alt: '不推荐录用' }
  }
  if (isPositive) {
    return { src: recommendStamp, alt: '推荐录用' }
  }
  return { src: null, alt: '' }
})
</script>

<style scoped>
.ai-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  margin: 0;
}


.section-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chip {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.6);
  color: #64748b;
  background: rgba(248, 250, 252, 0.9);
  white-space: nowrap;
}

.chip-ok {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.08);
  color: #15803d;
  font-weight: 800;
}

.btn-ghost {
  border-radius: 999px;
  padding: 6px 12px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #ffffff;
  color: #4b5563;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: background-color 0.16s ease, transform 0.16s ease;
}

.btn-ghost:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
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

.content {
  width: 100%;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.grid.single {
  grid-template-columns: minmax(0, 1fr);
}

.card {
  background: #ffffff;
  border-radius: 20px;
  padding: 16px 16px 18px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.card.full {
  grid-column: 1 / -1;
}

.card.hero {
  grid-column: 1 / -1;
  position: relative;
  background:
    radial-gradient(circle at top left, rgba(129, 140, 248, 0.22), transparent 55%),
    linear-gradient(135deg, rgba(79, 70, 229, 0.06), rgba(236, 72, 153, 0.03));
}

.card-header {
  margin-bottom: 10px;
}

.card-title {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

.detail-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.detail-tab {
  border-radius: 999px;
  padding: 6px 12px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(255, 255, 255, 0.86);
  color: #4b5563;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.14s ease, background-color 0.14s ease, border-color 0.14s ease;
}

.detail-tab:hover {
  transform: translateY(-1px);
  background: #f8fafc;
}

.detail-tab.active {
  border-color: rgba(124, 58, 237, 0.85);
  background: rgba(124, 58, 237, 0.12);
  color: #5b21b6;
}

.detail-panel {
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(249, 250, 251, 0.96);
  padding: 10px 12px;
}


.hero-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.hero-title {
  font-size: 18px;
  font-weight: 900;
  color: #111827;
}

.hero-desc {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.8;
  margin: 8px 0 0;
}

.hero-desc :deep(.hero-desc-recommendation) {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
}

.recommend-stamp {
  position: absolute;
  top: 15px;
  left: 9px;
  transform: rotate(-10deg);
}

.recommend-stamp img {
  width: 100px;
  height: auto;
  opacity: 0.85;
}

.score-badge {
  min-width: 92px;
  border-radius: 18px;
  padding: 10px 10px;
  background: rgba(15, 23, 42, 0.86);
  color: #e5e7eb;
  border: 1px solid rgba(148, 163, 184, 0.35);
  text-align: center;
}

.score-number {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0.02em;
}

.score-label {
  margin-top: 2px;
  font-size: 10px;
  color: rgba(226, 232, 240, 0.75);
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.pill {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
  font-weight: 800;
}

.pill.subtle {
  background: rgba(148, 163, 184, 0.08);
  color: #6b7280;
}

.kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.kpi {
  border-radius: 18px;
  padding: 10px 10px 10px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.kpi-k {
  font-size: 11px;
  font-weight: 900;
  color: #6b7280;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.kpi-v {
  margin-top: 6px;
  font-size: 16px;
  font-weight: 900;
  color: #111827;
}

.kpi-h {
  margin-top: 4px;
  font-size: 11px;
  color: #6b7280;
  line-height: 1.6;
}

.dim-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dim {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 10px;
  border-radius: 16px;
  background: #f9fafb;
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.dim-left {
  min-width: 0;
}

.dim-name {
  font-size: 13px;
  font-weight: 900;
  color: #111827;
}

.dim-desc {
  margin-top: 4px;
  font-size: 11px;
  color: #6b7280;
  line-height: 1.6;
}

.dim-right {
  width: 140px;
  flex-shrink: 0;
  text-align: right;
}

.dim-score {
  font-size: 14px;
  font-weight: 900;
  color: #111827;
}

.bar {
  margin-top: 8px;
  height: 10px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
  overflow: hidden;
}

.bar-inner {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #7c3aed, #4f46e5);
}

.bullets {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: #4b5563;
  line-height: 1.8;
}

.bullets.ok {
  color: #166534;
}

.bullets.warn {
  color: #7f1d1d;
}

.retest {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.retest-hint {
  font-size: 11px;
  color: #9ca3af;
}

.btn-primary,
.btn-secondary {
  border-radius: 999px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
  white-space: nowrap;
}

.btn-primary {
  border: none;
  color: #f9fafb;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  box-shadow: 0 14px 30px rgba(79, 70, 229, 0.28);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 40px rgba(79, 70, 229, 0.36);
}

.btn-secondary {
  border: 1px solid rgba(148, 163, 184, 0.6);
  background: rgba(255, 255, 255, 0.92);
  color: #4b5563;
}

.btn-secondary:hover {
  transform: translateY(-1px);
  background: #f1f5f9;
}

.wrong-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.wrong-item {
  border-radius: 18px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #ffffff;
  overflow: hidden;
}

.wrong-head {
  padding: 10px 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  background: #f9fafb;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
}

.wrong-q {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.q-index {
  font-size: 11px;
  font-weight: 900;
  color: #b91c1c;
  white-space: nowrap;
}

.q-text {
  font-size: 12px;
  font-weight: 900;
  color: #111827;
  line-height: 1.6;
}

.tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(148, 163, 184, 0.08);
  color: #6b7280;
  font-weight: 900;
  white-space: nowrap;
}

.tag.high {
  border-color: rgba(220, 38, 38, 0.35);
  background: rgba(220, 38, 38, 0.08);
  color: #b91c1c;
}

.tag.mid {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
}

.wrong-body {
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.box {
  border-radius: 16px;
  padding: 10px 10px;
  background: #f9fafb;
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.box-title {
  font-size: 11px;
  font-weight: 900;
  color: #475569;
  margin-bottom: 6px;
}

.box-text {
  font-size: 12px;
  color: #111827;
  line-height: 1.7;
  white-space: pre-wrap;
}

.mini {
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
  color: #4b5563;
  line-height: 1.7;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip2 {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background: #ffffff;
  color: #4b5563;
  font-weight: 800;
}

.retest-foot {
  display: flex;
  gap: 10px;
  padding-top: 10px;
}

.empty {
  padding: 18px 12px 14px;
  border-radius: 18px;
  background: linear-gradient(135deg, #eff6ff, #f0fdf4);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.empty-icon {
  font-size: 22px;
  margin-bottom: 6px;
}

.empty-title {
  font-size: 13px;
  font-weight: 900;
  color: #111827;
}


.resume-panels {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.panel {
  border-radius: 18px;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.panel-title {
  font-size: 12px;
  font-weight: 900;
  color: #111827;
  margin-bottom: 8px;
}

.resume-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

@media (max-width: 960px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .kpis {
    grid-template-columns: minmax(0, 1fr);
  }

  .wrong-body {
    grid-template-columns: minmax(0, 1fr);
  }

  .resume-panels {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>

