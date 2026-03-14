import request from './request'

export const flashCardTestApi = {
  /**
   * 生成测试题
   * POST /flash-card/test/generate
   * body: { nodeId: string, pathId?: number, difficulty: 'easy'|'medium'|'hard' }
   */
  generate({ nodeId, pathId = 0, difficulty }) {
    return request.post('/flash-card/test/generate', { nodeId, pathId, difficulty })
  },

  /**
   * 提交并批改测试
   * POST /flash-card/test/submit
   * body: { testId: number, answers: [{ questionId:number, questionType:string, userAnswer?:string, userUploadUrl?:string }] }
   */
  submit({ testId, answers }) {
    return request.post('/flash-card/test/submit', { testId, answers })
  },

  /**
   * 列出某个闪卡节点下的所有历史试卷
   * GET /flash-card/test/papers?nodeId=xxx&difficulty=easy|medium|hard
   */
  listPapers({ nodeId, difficulty }) {
    const params = { nodeId }
    if (difficulty) params.difficulty = difficulty
    return request.get('/flash-card/test/papers', { params })
  },

  /**
   * 获取某套试卷的提交历史
   * GET /flash-card/test/{testId}/attempts
   */
  listAttempts(testId) {
    return request.get(`/flash-card/test/${testId}/attempts`)
  },

  /**
   * 获取某次提交的逐题明细快照
   * GET /flash-card/test/attempts/{attemptId}
   */
  getAttemptDetail(attemptId) {
    return request.get(`/flash-card/test/attempts/${attemptId}`)
  },

  /**
   * 加载历史试卷题目（用于重做）
   * GET /flash-card/test/papers/{testId}
   */
  loadPaper(testId) {
    return request.get(`/flash-card/test/papers/${testId}`)
  },

  /**
   * 删除试卷（逻辑删除，同步 Neo4j）
   * DELETE /flash-card/test/{testId}
   */
  delete(testId) {
    return request.delete(`/flash-card/test/${testId}`)
  },

  normalizeTestVO(res) {
    const data = res?.data ?? res
    return data?.data ?? data
  },

  normalizeList(res) {
    const data = res?.data ?? res
    return data?.data ?? data
  }
}

