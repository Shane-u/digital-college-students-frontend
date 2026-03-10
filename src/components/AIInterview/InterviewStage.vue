<template>
  <section class="ai-section">
    <div class="section-header">
      <div class="section-header-left">
        <h2 class="section-title">二、选择面试并开始练习</h2>
        <p class="section-subtitle">
          选岗位与模式，左视频右对话直接开练。
        </p>
      </div>
      <div class="section-header-right">
        <span v-if="hasAnalysis" class="chip chip-ok">已吸收简历分析</span>
        <span v-else class="chip chip-soft">建议先完成简历分析</span>
      </div>
    </div>

    <div class="grid">
      <InterviewConfigPanel v-if="view === 'CONFIG'" v-model="config" @start="start" />

      <div v-else-if="view === 'SESSION'" class="session-wrap">
        <InterviewSession :config="config" :seed-questions="effectiveSeedQuestions" @end="endSession" />
      </div>

      <ReviewStage
        v-else
        :review="review"
        @back="backToConfig"
        @resume="$emit('resume')"
        @retest="handleRetest"
      />
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import InterviewConfigPanel from './InterviewConfigPanel.vue'
import InterviewSession from './InterviewSession.vue'
import ReviewStage from './ReviewStage.vue'

const props = defineProps({
  analysisResult: { type: Object, default: null },
})

const emit = defineEmits(['started', 'ended', 'resume'])

const view = ref('CONFIG') // CONFIG | SESSION | REVIEW
const config = ref({
  jobRole: 'FRONTEND',
  difficulty: 'MED',
  durationMin: 20,
  mode: 'VIDEO', // VIDEO | CHAT
  retestMode: null, // null | WRONG_ONLY | FULL
})
const review = ref(null)
const retestSeedQuestions = ref(null)

const hasAnalysis = computed(() => Boolean(props.analysisResult))
const seedQuestions = computed(() => props.analysisResult?.resumeQuestions || [])
const effectiveSeedQuestions = computed(() => retestSeedQuestions.value || seedQuestions.value)

watch(
  () => props.analysisResult,
  (val) => {
    // 有分析结果时可在这里调优默认配置；目前仅保留占位
    if (!val) return
  }
)

const start = () => {
  view.value = 'SESSION'
  retestSeedQuestions.value = null
  emit('started', { ...config.value })
}

const safeSnippet = (messages) => {
  const userTexts = (messages || [])
    .filter((m) => m.role === 'user')
    .map((m) => String(m.text || '').trim())
    .filter(Boolean)
  if (userTexts.length === 0) return '（本次未输入文字回答）'
  const t = userTexts[userTexts.length - 1]
  return t.length <= 66 ? t : `${t.slice(0, 66)}...`
}

const buildReview = (sessionPayload) => {
  const jobMap = {
    FRONTEND: '前端开发（Vue / React）',
    BACKEND: '后端开发（Java / Go）',
    FULLSTACK: '全栈开发（Web）',
    DATA: '数据分析 / AI 方向',
    PRODUCT: '产品 / 项目方向（偏技术）',
  }
  const diffMap = { EASY: '入门', MED: '进阶', HARD: '高强度' }
  const dim = [
    { key: 'structure', label: '表达结构', desc: '是否能快速给出结论、分点说明并收束到结果', score: 78 },
    { key: 'depth', label: '技术深度', desc: '是否能解释原理/权衡，而不只是“我做过”', score: 72 },
    { key: 'evidence', label: '项目证据', desc: '是否有可量化指标与可复现细节', score: 68 },
    { key: 'communication', label: '沟通协作', desc: '是否能澄清边界、对齐目标并推进落地', score: 74 },
    { key: 'fit', label: '岗位匹配', desc: '回答是否始终贴近目标岗位的关注点', score: 76 },
  ]

  const overallScore = Math.round(dim.reduce((s, d) => s + d.score, 0) / dim.length)
  const asked = Array.isArray(sessionPayload?.askedQuestions) ? sessionPayload.askedQuestions : []
  const wrongItems = asked
    .filter((q, idx) => idx !== 0)
    .slice(0, 3)
    .map((q, idx) => ({
      question: q,
      level: idx === 0 ? 'high' : 'mid',
      levelLabel: idx === 0 ? '高优先级' : '建议复盘',
      userAnswerSnippet: safeSnippet(sessionPayload?.messages),
      issues: [
        '缺少“结论先行”的一句话总结',
        '指标与基线不够清晰，难以验证价值',
        '方案权衡点（Why not）描述偏少',
      ],
      betterAnswer:
        '建议用 STAR：先给结论（我做了什么 + 带来什么结果），再讲背景与任务，重点展开行动与权衡，最后用指标收尾（含口径与对比基线）。',
      followUps: ['你怎么定义“成功”？', '如果重来一次你会怎么做？', '有没有替代方案？为什么没选？'],
    }))

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: Date.now(),
    meta: {
      jobRole: sessionPayload?.config?.jobRole || config.value.jobRole,
      jobRoleLabel: jobMap[sessionPayload?.config?.jobRole] || jobMap[config.value.jobRole] || '目标岗位',
      difficulty: sessionPayload?.config?.difficulty || config.value.difficulty,
      difficultyLabel: diffMap[sessionPayload?.config?.difficulty] || diffMap[config.value.difficulty] || '未选择',
      durationMin: sessionPayload?.config?.durationMin || config.value.durationMin,
      timeText: sessionPayload?.timeText || '00:00',
    },
    overall: {
      score: overallScore,
      summary:
        '整体表现稳中偏上：你能较快进入问题并给出核心思路，但在“量化结果、清晰权衡、复述边界”上还有提升空间。建议用错题本进行针对性重答训练，把回答打磨成可验证的能力证据。',
    },
    kpis: [
      { key: 'questions', label: '问题数', value: String(asked.length || 1), hint: '越稳定越能扛住追问' },
      {
        key: 'answers',
        label: '回答数',
        value: String((sessionPayload?.messages || []).filter((m) => m.role === 'user').length),
        hint: '建议每题 3～5 句为一轮',
      },
      { key: 'focus', label: '聚焦度', value: `${Math.min(98, 70 + Math.floor(Math.random() * 16))}%`, hint: '是否紧贴岗位关注点' },
    ],
    dimensions: dim,
    strengths: [
      '能够主动提出“我想确认一下边界”，面试沟通姿态很成熟。',
      '回答中能给出具体行动点，说明你有真实落地经验。',
      '对目标岗位的方向感清晰，整体表达节奏自然。',
    ],
    improvements: [
      '每题先给一句话结论，再分点展开（避免铺垫过长）。',
      '补齐量化指标与口径：指标是什么、基线是什么、对比对象是谁。',
      '把“方案权衡”说出来：为什么选 A 不选 B（成本 / 风险 / 维护）。',
      '准备 2 个可复用的项目故事模板：性能优化、协作推进、问题排查。',
    ],
    wrongBook: { items: wrongItems },
    resumeAdvice: {
      high: [
        '把项目描述从“做了什么”改为“解决了什么问题 + 结果如何验证（指标/口径）”。',
        '将技术栈分层：熟练/了解，并在项目中对应到真实使用点，避免被追问到边界。',
        '补充 1 条“你最有把握讲深”的项目：能讲清楚架构、权衡、失败与复盘。',
      ],
      mid: [
        '在每段经历里加入“规模/复杂度”信息（QPS、数据量、用户量、页面 PV 等）。',
        '把亮点前置：最强的一段经历放在最上面，并在 2 行内抓住人。',
        '加入“协作”证据：你如何对齐需求、推动上线、做回归与监控。',
      ],
      low: [
        '为目标岗位定制一版简历：删掉无关信息，让关键词更集中。',
        '补充作品链接/截图（若允许），提升可信度与记忆点。',
      ],
    },
  }
}

const endSession = (payload) => {
  review.value = buildReview(payload || {})
  view.value = 'REVIEW'
  saveToHistory(review.value)
  emit('ended', review.value)
}

const backToConfig = () => {
  view.value = 'CONFIG'
  review.value = null
  retestSeedQuestions.value = null
}

const handleRetest = ({ mode }) => {
  config.value = { ...config.value, retestMode: mode }
  if (mode === 'WRONG_ONLY' && review.value?.wrongBook?.items?.length) {
    retestSeedQuestions.value = review.value.wrongBook.items.map((x) => x.question).filter(Boolean)
  } else {
    retestSeedQuestions.value = null
  }
  view.value = 'SESSION'
  emit('started', { ...config.value, retestMode: mode })
}

const STORAGE_KEY = 'ai_interview_history_v1'
const saveToHistory = (rec) => {
  if (!rec) return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const arr = raw ? JSON.parse(raw) : []
    const list = Array.isArray(arr) ? arr : []
    list.unshift(rec)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)))
  } catch (_) {}
}
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
  margin-bottom: 16px;
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

.chip {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.6);
  color: #64748b;
  background: rgba(248, 250, 252, 0.9);
  white-space: nowrap;
}

.chip-soft {
  border-style: dashed;
}

.chip-ok {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.08);
  color: #15803d;
  font-weight: 700;
}

.grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}

.session-wrap {
  width: 100%;
}
</style>

