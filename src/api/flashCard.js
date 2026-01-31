import request from './request'

// FlashCard API (baseURL is /api in request.js)
export const flashCardApi = {
  // 原有接口
  list() {
    return request.get('/flash-card/list')
  },
  reviewList() {
    return request.get('/flash-card/review-list')
  },
  review(id, difficultyLevel) {
    return request.post('/flash-card/review', { id, difficultyLevel })
  },
  generate(originalContent) {
    return request.post('/flash-card/generate', { originalContent })
  },
  status(flashCardId) {
    return request.get('/flash-card/status', { params: { flashCardId } })
  },
  update(payload) {
    // { id, title, content, htmlContent }
    return request.post('/flash-card/update', payload)
  },
  aiAssist(id, prompt) {
    return request.post('/flash-card/ai-assist', { id, prompt })
  },
  delete(id) {
    return request.post('/flash-card/delete', { id })
  },
  
  // 新增：暂存区相关接口
  /**
   * 获取暂存区闪卡列表（待确认的闪卡）
   */
  getTempZoneList() {
    return request.get('/flash-card/temp-zone/list')
  },
  
  /**
   * 确认保存暂存区闪卡（需要选择分类层级标签）
   * @param {Object} payload - { id, categoryPath: string[] }
   */
  confirmSave(payload) {
    return request.post('/flash-card/temp-zone/confirm-save', payload)
  },
  
  /**
   * 删除暂存区闪卡
   * @param {string} id - 闪卡ID
   */
  deleteTempCard(id) {
    return request.post('/flash-card/temp-zone/delete', { id })
  },
  
  // 新增：图谱相关接口
  /**
   * 获取闪卡图谱数据（包含节点和边）
   * @param {Object} params - { timeRange?: string, search?: string }
   */
  getGraphData(params = {}) {
    return request.get('/flash-card/graph', { params })
  },
  
  /**
   * 获取分类层级标签树（用于保存时选择分类）
   */
  getCategoryTree() {
    return request.get('/flash-card/category/tree')
  },
  
  /**
   * 搜索闪卡（支持标签和内容模糊匹配）
   * @param {Object} params - { keyword: string, tags?: string[] }
   */
  search(params) {
    return request.get('/flash-card/search', { params })
  },
  
  /**
   * 获取闪卡详情（用于编辑）
   * @param {string} id - 闪卡ID
   */
  getDetail(id) {
    return request.get('/flash-card/detail', { params: { id } })
  },
  
  /**
   * 更新闪卡（包括标签）
   * @param {Object} payload - { id, title, content, htmlContent, tags?: string[], categoryPath?: string[] }
   */
  updateWithTags(payload) {
    return request.post('/flash-card/update-with-tags', payload)
  },
  
  /**
   * 获取对比数据（闪卡图谱 vs 技能图谱）
   */
  getCompareData() {
    return request.get('/flash-card/compare')
  }
}

