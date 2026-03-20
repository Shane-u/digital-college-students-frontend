import request from './request'

function withUserId(params = {}, userId) {
  if (userId == null || userId === '') return params
  return { ...params, userId }
}

export const aiInterviewApi = {
  /** 1) 上传简历 */
  uploadResume({ file, position, experienceYears, userId }) {
    const form = new FormData()
    form.append('file', file)
    return request.post('/ai-interview/resumes/upload', form, {
      params: withUserId({ position, experienceYears }, userId),
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  /** 2) 获取简历详情 */
  getResume(resumeId, { userId } = {}) {
    return request.get(`/ai-interview/resumes/${encodeURIComponent(resumeId)}`, {
      params: withUserId({}, userId)
    })
  },

  /** 3) 获取当前用户历史简历列表 */
  listResumes({ userId } = {}) {
    return request.get('/ai-interview/resumes/list', {
      params: withUserId({}, userId)
    })
  },

  /** 4) 简历分析 */
  analyzeResume(resumeId, { targetRole, targetLevel, userId } = {}) {
    return request.post(
      `/ai-interview/resumes/${encodeURIComponent(resumeId)}/analysis`,
      { targetRole: targetRole || '', targetLevel: targetLevel || '' },
      { params: withUserId({}, userId) }
    )
  },

  /** 5) 创建面试会话 */
  createSession(payload, { userId } = {}) {
    return request.post('/ai-interview/sessions', payload, {
      params: withUserId({}, userId)
    })
  },

  /** 6) 获取下一题 */
  nextQuestion(sessionId, { needTtsAudio = false, userId } = {}) {
    return request.post(
      `/ai-interview/sessions/${encodeURIComponent(sessionId)}/next-question`,
      { needTtsAudio: Boolean(needTtsAudio) },
      { params: withUserId({}, userId) }
    )
  },

  /** 7) 上传回答音频（ASR + 评价） */
  uploadAnswerAudio(sessionId, { audioFile, questionId, durationSeconds, userId }) {
    const form = new FormData()
    form.append('audioFile', audioFile)
    return request.post(
      `/ai-interview/sessions/${encodeURIComponent(sessionId)}/answers/audio`,
      form,
      {
        params: withUserId({ questionId, durationSeconds }, userId),
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    )
  },

  /** 8) 结束面试并生成报告 */
  finishSession(sessionId, { userId } = {}) {
    return request.post(`/ai-interview/sessions/${encodeURIComponent(sessionId)}/finish`, null, {
      params: withUserId({}, userId)
    })
  },

  /** 9) 获取面试报告 */
  getReport(sessionId, { userId } = {}) {
    return request.get(`/ai-interview/sessions/${encodeURIComponent(sessionId)}/report`, {
      params: withUserId({}, userId)
    })
  },

  /** 10) 历史报告列表（用于前端列表页） */
  listReports({ limit, beforeId, userId } = {}) {
    return request.get('/ai-interview/sessions/reports', {
      params: withUserId({ limit, beforeId }, userId)
    })
  },

  /** 11) 删除当前用户的一条面试报告（逻辑删除）
   * DELETE /ai-interview/sessions/reports/{reportId}
   */
  deleteReport(reportId, { userId } = {}) {
    return request.delete(`/ai-interview/sessions/reports/${encodeURIComponent(reportId)}`, {
      params: withUserId({}, userId)
    })
  },

  /** 12) 清空当前用户的全部面试报告（逻辑删除）
   * DELETE /ai-interview/sessions/reports
   */
  clearReports({ userId } = {}) {
    return request.delete('/ai-interview/sessions/reports', {
      params: withUserId({}, userId)
    })
  }
}

