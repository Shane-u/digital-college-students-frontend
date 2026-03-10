<template>
  <section class="ai-section">
    <div v-if="!embedded" class="section-header">
      <div class="section-header-left">
        <h2 class="section-title">三、面试评价与复盘</h2>
        <p class="section-subtitle">
          报告、错题与简历建议，一屏看清。
        </p>
      </div>
      <div class="section-header-right">
        <span class="chip chip-ok">报告已生成</span>
        <button type="button" class="btn-ghost" @click="$emit('back')">返回面试</button>
      </div>
    </div>

    <div class="tabs">
      <button type="button" class="tab" :class="{ active: tab === 'REPORT' }" @click="tab = 'REPORT'">详细报告</button>
      <button type="button" class="tab" :class="{ active: tab === 'WRONG' }" @click="tab = 'WRONG'">错题本</button>
      <button type="button" class="tab" :class="{ active: tab === 'RESUME' }" @click="tab = 'RESUME'">简历优化建议</button>
    </div>

    <div class="content">
      <!-- REPORT -->
      <div v-if="tab === 'REPORT'" class="grid">
        <div class="card hero">
          <div class="hero-title-row">
            <div class="hero-title">本次面试总评</div>
            <div class="score-badge">
              <div class="score-number">{{ review.overall.score }}</div>
              <div class="score-label">综合评分</div>
            </div>
          </div>
          <p class="hero-desc">{{ review.overall.summary }}</p>

          <div class="pill-row">
            <span class="pill">岗位：{{ review.meta.jobRoleLabel }}</span>
            <span class="pill subtle">难度：{{ review.meta.difficultyLabel }}</span>
            <span class="pill subtle">时长：{{ review.meta.durationMin }} 分钟（{{ review.meta.timeText }}）</span>
          </div>

          <div class="kpis">
            <div v-for="k in review.kpis" :key="k.key" class="kpi">
              <div class="kpi-k">{{ k.label }}</div>
              <div class="kpi-v">{{ k.value }}</div>
              <div class="kpi-h">{{ k.hint }}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">能力维度评分</h3>
            <p class="card-desc">更细的维度会直接对应到错题本与复盘重测。</p>
          </div>
          <div class="dim-list">
            <div v-for="d in review.dimensions" :key="d.key" class="dim">
              <div class="dim-left">
                <div class="dim-name">{{ d.label }}</div>
                <div class="dim-desc">{{ d.desc }}</div>
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
            <h3 class="card-title">亮点</h3>
            <p class="card-desc">建议你在下次面试继续保持并强化的部分。</p>
          </div>
          <ul class="bullets ok">
            <li v-for="(s, idx) in review.strengths" :key="idx">{{ s }}</li>
          </ul>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">需要改进</h3>
          </div>
          <ul class="bullets warn">
            <li v-for="(s, idx) in review.improvements" :key="idx">{{ s }}</li>
          </ul>
        </div>

        <div class="card full">
          <div class="card-header">
            <h3 class="card-title">复盘重测</h3>
            <p class="card-desc">你可以只重答错题，或进行一次完整重测。</p>
          </div>
          <div class="retest">
            <button type="button" class="btn-primary" @click="$emit('retest', { mode: 'WRONG_ONLY' })">
              仅重答错题（{{ review.wrongBook.items.length }}）
            </button>
            <button type="button" class="btn-secondary" @click="$emit('retest', { mode: 'FULL' })">
              完整重测
            </button>
            <div class="retest-hint">
              提示：重测不会覆盖你历史记录（后续接后端后可支持“对比两次表现”）。
            </div>
          </div>
        </div>
      </div>

      <!-- WRONG -->
      <div v-else-if="tab === 'WRONG'" class="grid single">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">错题本</h3>
            <p class="card-desc">把“答得不稳”的问题沉淀下来，下一次只练最关键的短板。</p>
          </div>

          <div v-if="review.wrongBook.items.length === 0" class="empty">
            <div class="empty-icon">✅</div>
            <div class="empty-title">本次没有明显错题</div>
            <div class="empty-desc">你可以选择“完整重测”强化稳定性。</div>
          </div>

          <div v-else class="wrong-list">
            <div v-for="(it, idx) in review.wrongBook.items" :key="idx" class="wrong-item">
              <div class="wrong-head">
                <div class="wrong-q">
                  <span class="q-index">Q{{ idx + 1 }}</span>
                  <span class="q-text">{{ it.question }}</span>
                </div>
                <span class="tag" :class="it.level">{{ it.levelLabel }}</span>
              </div>
              <div class="wrong-body">
                <div class="box">
                  <div class="box-title">你当时的回答（节选）</div>
                  <div class="box-text">{{ it.userAnswerSnippet }}</div>
                </div>
                <div class="box">
                  <div class="box-title">问题点</div>
                  <ul class="mini">
                    <li v-for="(p, i2) in it.issues" :key="i2">{{ p }}</li>
                  </ul>
                </div>
                <div class="box">
                  <div class="box-title">更好的回答结构（参考）</div>
                  <div class="box-text">{{ it.betterAnswer }}</div>
                </div>
                <div class="box">
                  <div class="box-title">建议追问</div>
                  <div class="chips">
                    <span v-for="(x, i3) in it.followUps" :key="i3" class="chip2">{{ x }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="retest-foot">
              <button type="button" class="btn-primary" @click="$emit('retest', { mode: 'WRONG_ONLY' })">
                仅重答错题
              </button>
              <button type="button" class="btn-secondary" @click="$emit('retest', { mode: 'FULL' })">
                完整重测
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- RESUME -->
      <div v-else class="grid single">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">简历优化建议</h3>
            <p class="card-desc">结合本次面试追问点，把简历从“陈述经历”升级为“可被验证的能力证据”。</p>
          </div>

          <div class="resume-panels">
            <div class="panel">
              <div class="panel-title">优先级最高（建议本周内改完）</div>
              <ul class="bullets warn">
                <li v-for="(x, idx) in review.resumeAdvice.high" :key="idx">{{ x }}</li>
              </ul>
            </div>

            <div class="panel">
              <div class="panel-title">建议优化（提升通过率）</div>
              <ul class="bullets ok">
                <li v-for="(x, idx) in review.resumeAdvice.mid" :key="idx">{{ x }}</li>
              </ul>
            </div>

            <div class="panel">
              <div class="panel-title">加分项（有时间再做）</div>
              <ul class="bullets">
                <li v-for="(x, idx) in review.resumeAdvice.low" :key="idx">{{ x }}</li>
              </ul>
            </div>
          </div>

          <div class="resume-actions">
            <button type="button" class="btn-secondary" @click="$emit('resume')">去简历制作页完善</button>
            <button type="button" class="btn-primary" @click="$emit('retest', { mode: 'FULL' })">改完后完整重测</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  review: { type: Object, required: true },
  embedded: { type: Boolean, default: false },
})

defineEmits(['back', 'retest', 'resume'])

const embedded = computed(() => props.embedded)
const tab = ref('REPORT') // REPORT | WRONG | RESUME
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

.section-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0 0;
  line-height: 1.7;
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
  background:
    radial-gradient(circle at top left, rgba(129, 140, 248, 0.22), transparent 55%),
    linear-gradient(135deg, rgba(79, 70, 229, 0.06), rgba(236, 72, 153, 0.03));
}

.card-header {
  margin-bottom: 10px;
}

.card-title {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
  margin: 0;
}


.hero-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.hero-title {
  font-size: 16px;
  font-weight: 900;
  color: #111827;
}

.hero-desc {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.8;
  margin: 8px 0 0;
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
  font-size: 11px;
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

.empty-desc {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  line-height: 1.7;
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

