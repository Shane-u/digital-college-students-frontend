function safeJsonParse(raw) {
  if (!raw) return null
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch {
    return null
  }
}

function toTextArray(val) {
  if (!val) return []
  if (Array.isArray(val)) return val.map((x) => String(x || '').trim()).filter(Boolean)
  if (typeof val === 'string') {
    const t = val.trim()
    return t ? [t] : []
  }
  return []
}

function toNumber(val, fallback = 0) {
  const n = Number(val)
  return Number.isFinite(n) ? n : fallback
}

function normalizeDimensions(raw) {
  const arr = Array.isArray(raw) ? raw : []
  const mapped = arr
    .map((d, idx) => {
      if (!d) return null
      if (typeof d === 'string') {
        return { key: `dim_${idx}`, label: d, desc: '', score: 0 }
      }
      return {
        key: d.key || d.id || `dim_${idx}`,
        label: d.label || d.name || d.dimension || `维度 ${idx + 1}`,
        desc: d.desc || d.description || '',
        score: toNumber(d.score ?? d.value ?? d.points, 0),
      }
    })
    .filter(Boolean)
  if (mapped.length) return mapped
  // 默认维度兜底
  return [
    { key: 'structure', label: '表达结构', desc: '是否结论先行、分点展开并能收束到结果', score: 70 },
    { key: 'depth', label: '技术深度', desc: '是否能解释原理/权衡，而不只是“我做过”', score: 68 },
    { key: 'evidence', label: '项目证据', desc: '是否有可量化指标与可复现细节', score: 66 },
    { key: 'communication', label: '沟通协作', desc: '是否能澄清边界、对齐目标并推进落地', score: 72 },
    { key: 'fit', label: '岗位匹配', desc: '回答是否贴近目标岗位关注点', score: 70 },
  ]
}

function normalizeWrongBook(rawWrong, messages = []) {
  const items = Array.isArray(rawWrong?.items) ? rawWrong.items : (Array.isArray(rawWrong) ? rawWrong : [])
  const safeSnippet = () => {
    const userTexts = (messages || [])
      .filter((m) => m.role === 'user')
      .map((m) => String(m.text || '').trim())
      .filter(Boolean)
    if (!userTexts.length) return '（本次未输入文字回答）'
    const t = userTexts[userTexts.length - 1]
    return t.length <= 66 ? t : `${t.slice(0, 66)}...`
  }
  const mapped = items
    .map((it, idx) => {
      if (!it) return null
      if (typeof it === 'string') {
        return {
          question: it,
          level: idx === 0 ? 'high' : 'mid',
          levelLabel: idx === 0 ? '高优先级' : '建议复盘',
          userAnswerSnippet: safeSnippet(),
          issues: [],
          betterAnswer: '',
          followUps: [],
        }
      }
      const level = it.level || it.priority || (idx === 0 ? 'high' : 'mid')
      return {
        question: it.question || it.q || it.title || '',
        level: level === 'HIGH' ? 'high' : (level === 'MID' ? 'mid' : (level === 'LOW' ? 'mid' : String(level))),
        levelLabel: it.levelLabel || it.priorityLabel || (idx === 0 ? '高优先级' : '建议复盘'),
        userAnswerSnippet: it.userAnswerSnippet || it.answerSnippet || safeSnippet(),
        issues: Array.isArray(it.issues) ? it.issues : toTextArray(it.issues),
        betterAnswer: it.betterAnswer || it.referenceAnswer || '',
        followUps: Array.isArray(it.followUps) ? it.followUps : toTextArray(it.followUps),
      }
    })
    .filter((x) => x && x.question)
  return { items: mapped }
}

function normalizeResumeAdvice(raw) {
  const obj = raw && typeof raw === 'object' ? raw : {}
  const high = toTextArray(obj.high || obj.top || obj.p0 || obj.must)
  const mid = toTextArray(obj.mid || obj.medium || obj.p1 || obj.should)
  const low = toTextArray(obj.low || obj.optional || obj.p2 || obj.could)
  return {
    high: high.length ? high : ['把项目描述改成“解决了什么问题 + 结果如何验证（指标/口径）”。'],
    mid: mid.length ? mid : ['将技术栈分层：熟练/了解，并在项目中对应到真实使用点。'],
    low: low.length ? low : ['为目标岗位定制一版简历：删掉无关信息，让关键词更集中。'],
  }
}

export function mapInterviewReportToReview({ reportJson, sessionId, config, meta, messages } = {}) {
  const raw = safeJsonParse(reportJson) || {}

  // 总评分数与总结：直接使用后端的 overallScore / hiringRecommendation
  const overallScore = toNumber(raw.overallScore, 0)
  const overallSummary = String(raw.hiringRecommendation || '').trim()

  // 维度得分：后端返回的 dimensionScores 为一个对象
  const dimMap = raw.dimensionScores && typeof raw.dimensionScores === 'object' ? raw.dimensionScores : {}
  const labelDict = {
    technical: '技术能力',
    communication: '沟通表达',
    logic: '逻辑思维',
    confidence: '自信与稳定性',
  }
  const dimensions = Object.entries(dimMap).map(([key, val], idx) => ({
    key: key || `dim_${idx}`,
    label: labelDict[key] || key || `维度 ${idx + 1}`,
    desc: '',
    score: toNumber(val, 0),
  }))

  // 各类文本列表：完全按后端字段展示
  const strengths = toTextArray(raw.highlights)
  const weaknesses = toTextArray(raw.weaknesses)
  const questionSummaries = toTextArray(raw.questionSummaries)
  const suggestions = toTextArray(raw.suggestions)

  const now = Date.now()

  return {
    id: `${now}-${Math.random().toString(16).slice(2)}`,
    createdAt: now,
    sessionId: sessionId ?? raw.sessionId ?? null,
    // 当前版本报告只展示后端真实字段，不再生成本地“错题本 / 简历建议 / KPI”等信息
    overall: {
      score: Math.round(overallScore),
      summary: String(overallSummary || '').trim(),
    },
    dimensions,
    strengths,
    weaknesses,
    questionSummaries,
    suggestions,
  }
}

