import request from './request'

// 默认分类树结构（当后端接口不存在时使用）
function getDefaultCategoryTree() {
  return [
    {
      id: 'course-web',
      label: 'Web课程',
      name: 'Web课程',
      children: [
        {
          id: 'fe',
          label: '前端开发',
          name: '前端开发',
          children: [
            { id: 'html', label: 'HTML/CSS', name: 'HTML/CSS' },
            { id: 'js', label: 'JavaScript', name: 'JavaScript' },
            { id: 'react', label: 'React', name: 'React' },
            { id: 'vue', label: 'Vue', name: 'Vue' },
            { id: 'node', label: 'Node.js', name: 'Node.js' }
          ]
        },
        {
          id: 'be',
          label: '后端开发',
          name: '后端开发',
          children: [
            { id: 'java', label: 'Java', name: 'Java' },
            { id: 'python', label: 'Python', name: 'Python' },
            { id: 'go', label: 'Go', name: 'Go' },
            { id: 'database', label: '数据库', name: '数据库' }
          ]
        }
      ]
    },
    {
      id: 'course-cs',
      label: '计算机基础',
      name: '计算机基础',
      children: [
        {
          id: 'ds',
          label: '数据结构',
          name: '数据结构',
          children: [
            { id: 'array', label: '数组', name: '数组' },
            { id: 'list', label: '链表', name: '链表' },
            { id: 'tree', label: '树', name: '树' },
            { id: 'graph', label: '图', name: '图' }
          ]
        },
        {
          id: 'algorithm',
          label: '算法',
          name: '算法',
          children: [
            { id: 'sort', label: '排序', name: '排序' },
            { id: 'search', label: '搜索', name: '搜索' },
            { id: 'dp', label: '动态规划', name: '动态规划' }
          ]
        }
      ]
    }
  ]
}

// 将图谱接口返回的数据统一为闪卡列表，供前端图谱展示
function normalizeGraphResponse(res) {
  if (!res) return []
  if (Array.isArray(res)) return res
  const list = res.flashcards || res.data
  if (Array.isArray(list)) return list
  const nodes = res.nodes || res.data?.nodes
  const links = res.links || res.data?.links || res.edges || res.data?.edges
  if (Array.isArray(nodes) && Array.isArray(links)) {
    const categoryByTarget = {}
    links.forEach(l => {
      const src = typeof l.source === 'object' ? l.source?.id : l.source
      const tgt = typeof l.target === 'object' ? l.target?.id : l.target
      if (src != null && tgt != null) categoryByTarget[tgt] = src
    })
    const cards = []
    nodes.forEach(n => {
      const id = typeof n === 'object' ? n.id : n
      const type = n.type || (n.labels && n.labels[0])
      if (type === 'flashcard' || type === 'Flashcard' || (!type && id)) {
        cards.push({
          id: n.id,
          title: n.title || n.label || n.name || '无标题',
          content: n.content,
          htmlContent: n.htmlContent,
          category: n.category || categoryByTarget[n.id],
          createdAt: n.createdAt,
          ...n
        })
      }
    })
    return cards
  }
  return []
}

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
    // 进度查询接口，与 bailian-chat.html / flash-card.html 中保持一致
    return request.get('/flash-card/progress', { params: { flashCardId } })
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
  
  // 新增：暂存区相关接口（与 flash-card.html 保持一致）
  /**
   * 获取暂存区闪卡列表（待确认的闪卡）
   */
  getTempZoneList() {
    return request.get('/flash-card/temp-list')
  },
  
  /**
   * 确认保存暂存区闪卡（与 flash-card.html 接口一致）
   * POST /confirm 请求体：{ id, hierarchyPath }
   * 路径格式：根/Web课程/HTML（斜杠无空格，与参考示例一致）
   */
  confirmSave(payload) {
    const id = payload.id
    const rawPath = String(
      payload.hierarchyPath ?? payload.archivePath ?? payload['层级标签路径'] ?? ''
    ).trim()
    const categoryPath = payload.categoryPath || []

    // 统一为 flash-card.html 示例格式：根/Web课程/HTML（斜杠无空格）
    const hierarchyPath = rawPath.replace(/\s*\/\s*/g, '/').replace(/\/+/g, '/') || ''

    const body = { id, hierarchyPath }

    return request.post('/flash-card/confirm', body).then(() => {
      if (hierarchyPath && categoryPath.length > 0) {
        const pathForUpdate = hierarchyPath
        return request.post('/flash-card/update-with-tags', {
          id,
          hierarchyPath: pathForUpdate,
          categoryPath,
          category: pathForUpdate
        }).catch(() => ({ id }))
      }
      return { id }
    })
  },
  
  /**
   * 删除暂存区闪卡
   * @param {string} id - 闪卡ID
   */
  deleteTempCard(id) {
    return request.post('/flash-card/temp/delete', { id })
  },
  
  /**
   * 获取暂存区闪卡详情（包含完整的 htmlContent）
   * @param {string} id - 闪卡ID
   */
  getTempCardDetail(id) {
    return request.get(`/flash-card/temp/${id}`)
  },
  
  // 新增：图谱相关接口（通过 Node 代理接 Neo4j Desktop，数据库名=当前用户 ID）
  /**
   * 获取闪卡图谱数据
   * - 传入 userId 时：请求本地 Neo4j 代理 /api/neo4j-graph（代理用 Node Bolt 连接 Neo4j Desktop，database=userId），失败则回退到 /flash-card/list
   * - 未传 userId 时：只请求 /flash-card/list
   * @param {Object} params - { userId?: string|number, timeRange?: string, search?: string }
   * @returns {Promise<Array>} 闪卡列表
   */
  async getGraphData(params = {}) {
    const hasUserId = params.userId != null && params.userId !== ''
    if (hasUserId) {
      try {
        const res = await request.get('/neo4j-graph', { params: { userId: params.userId } })
        // 代理返回 { cards, nodes, links } 时原样返回，供图谱用 nodes/links 渲染
        if (res && Array.isArray(res.nodes) && Array.isArray(res.links)) return res
        return Array.isArray(res) ? res : (res?.cards ?? res?.data ?? [])
      } catch (_) {
        const listRes = await request.get('/flash-card/list', { params })
        return normalizeGraphResponse(listRes)
      }
    }
    const res = await request.get('/flash-card/list', { params })
    return normalizeGraphResponse(res)
  },
  
  /**
   * 获取分类层级标签树（用于保存时选择分类）
   * 后端未实现 /flash-card/category/tree 时直接返回默认分类树，不请求接口，避免 404
   * 若后端已实现该接口，可设置 VITE_FLASHCARD_CATEGORY_TREE_API=true 再请求
   */
  async getCategoryTree() {
    const useApi = import.meta?.env?.VITE_FLASHCARD_CATEGORY_TREE_API === 'true'
    if (!useApi) {
      return getDefaultCategoryTree()
    }
    try {
      const tree = await request.get('/flash-card/category/tree')
      const list = Array.isArray(tree) ? tree : (tree?.data || tree?.tree || [])
      return list.length ? list : getDefaultCategoryTree()
    } catch (_) {
      return getDefaultCategoryTree()
    }
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
  },

  /**
   * Neo4j 图谱节点更新（与 Neo4j 代理同步，数据库名=userId）
   * @param {Object} payload - { userId, id (节点 id), title?, content?, htmlContent?, hierarchyPath? }
   */
  updateInNeo4j(payload) {
    return request.post('/neo4j-graph/update', payload)
  },

  /**
   * Neo4j 图谱节点删除（与 Neo4j 代理同步）
   * @param {Object} payload - { userId, id (节点 id) }
   */
  deleteInNeo4j(payload) {
    return request.post('/neo4j-graph/delete', payload)
  }
}

