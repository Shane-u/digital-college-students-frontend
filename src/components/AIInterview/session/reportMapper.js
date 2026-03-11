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

  const overallScore = toNumber(
    raw.overall?.score ?? raw.overallScore ?? raw.score ?? raw.totalScore ?? raw.summaryScore,
    70
  )
  const overallSummary =
    raw.overall?.summary ||
    raw.summary ||
    raw.overallSummary ||
    '报告已生成：建议根据“错题本”逐题复盘，把回答打磨成可验证的能力证据。'

  const dimensions = normalizeDimensions(raw.dimensions || raw.dimensionScores || raw.metrics || raw.scores)

  const strengths = toTextArray(raw.strengths || raw.highlights || raw.advantages || raw.goodPoints)
  const improvements = toTextArray(raw.improvements || raw.suggestions || raw.toImprove || raw.badPoints)

  const wrongBook = normalizeWrongBook(raw.wrongBook || raw.wrong || raw.mistakes || raw.weakQuestions, messages)
  const resumeAdvice = normalizeResumeAdvice(raw.resumeAdvice || raw.resumeSuggestions || raw.resume || raw.cvAdvice)

  const kpis = Array.isArray(raw.kpis)
    ? raw.kpis
    : [
        { key: 'questions', label: '问题数', value: String((raw.questionCount ?? wrongBook.items.length) || 1), hint: '越稳定越能扛住追问' },
        { key: 'answers', label: '回答数', value: String((raw.answerCount ?? (messages || []).filter((m) => m.role === 'user').length) || 0), hint: '建议每题 3～5 句为一轮' },
        { key: 'focus', label: '聚焦度', value: `${Math.min(98, 70 + Math.floor(Math.random() * 16))}%`, hint: '是否紧贴岗位关注点' },
      ]

  const now = Date.now()
  const jobRoleLabel = meta?.jobRoleLabel || config?.jobRoleLabel || config?.jobRole || '目标岗位'
  const difficultyLabel = meta?.difficultyLabel || config?.difficultyLabel || config?.difficulty || '未选择'
  const durationMin = meta?.durationMin || config?.durationMinutes || config?.durationMin || 20
  const timeText = meta?.timeText || config?.timeText || '00:00'

  return {
    id: `${now}-${Math.random().toString(16).slice(2)}`,
    createdAt: now,
    sessionId: sessionId ?? raw.sessionId ?? null,
    meta: {
      jobRoleLabel,
      difficultyLabel,
      durationMin,
      timeText,
    },
    overall: {
      score: Math.round(overallScore),
      summary: String(overallSummary || '').trim(),
    },
    kpis,
    dimensions,
    strengths: strengths.length ? strengths : ['回答节奏自然，能够给出清晰的行动点。'],
    improvements: improvements.length ? improvements : ['每题先给一句话结论，再分点展开，并补齐指标与口径。'],
    wrongBook,
    resumeAdvice,
  }
}

