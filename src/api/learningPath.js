/**
 * 学习路径 API
 * @see 接口/学习路径.md
 */
import request from './request'

const API_BASE = '/api/learning-path'
const REQUEST_BASE = '/learning-path' // axios request 的 baseURL 已是 /api

/**
 * 流式规划学习路径（SSE）
 * POST /learning-path/plan/stream/flux
 * @param {Object} params
 * @param {string} params.userPrompt - 用户提示词，如："当前想要学习 Java，请给出学习 Java 的学习路径。"
 * @param {string|null} params.currentPathJson - 当前路径 JSON（润色时传入，首次可为 null）
 * @param {number} [params.userId] - 用户 ID
 * @param {AbortSignal} [params.signal] - 取消请求
 * @yields {string} 增量 JSON 片段
 */
export async function* planStreamFlux({ userPrompt, currentPathJson = null, userId, signal }) {
  const res = await fetch(`${API_BASE}/plan/stream/flux`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({
      userPrompt: userPrompt || '',
      currentPathJson: currentPathJson != null
        ? (typeof currentPathJson === 'string' ? currentPathJson : JSON.stringify(currentPathJson))
        : null,
      userId: userId ?? null
    }),
    signal
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  if (!res.body) throw new Error('ReadableStream not supported')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      if (signal?.aborted) {
        reader.cancel()
        break
      }
      const { value, done } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const t = line.trim()
        if (!t || t.startsWith('event:')) continue
        if (t === 'event:done') continue
        if (t.startsWith('data:')) {
          const data = t.slice(5).trim()
          if (data === '[DONE]') continue
          if (data) yield data
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

/**
 * 保存学习路径
 * POST /learning-path/save
 */
export function save(data) {
  return request.post(`${REQUEST_BASE}/save`, data)
}

/**
 * 获取用户学习路径列表
 * GET /learning-path/list?userId=xxx
 */
export function list(userId) {
  return request.get(`${REQUEST_BASE}/list`, { params: userId != null ? { userId } : {} })
}

/**
 * 根据 ID 获取学习路径
 * GET /learning-path/{pathId}
 */
export function getById(pathId, userId) {
  return request.get(`${REQUEST_BASE}/${pathId}`, {
    params: userId != null ? { userId } : {}
  })
}

/**
 * 删除学习路径
 * DELETE /learning-path/{pathId}
 */
export function remove(pathId, userId) {
  return request.delete(`${REQUEST_BASE}/${pathId}`, {
    params: userId != null ? { userId } : {}
  })
}

/**
 * 获取学习路径图谱（节点 + 关系），供前端展示 Neo4j 图
 * GET /learning-path/{pathId}/graph
 * @returns {{ pathId, topic, nodes, relationships }}
 */
export function getGraph(pathId, userId) {
  return request.get(`${REQUEST_BASE}/${pathId}/graph`, {
    params: userId != null ? { userId } : {}
  })
}

/**
 * 获取学习路径 JSON（供渲染、润色复用）
 * GET /learning-path/{pathId}/json
 */
export function getJson(pathId, userId) {
  return request.get(`${REQUEST_BASE}/${pathId}/json`, {
    params: userId != null ? { userId } : {}
  })
}

/**
 * 更新学习路径 JSON
 * PUT /learning-path/{pathId}/json
 */
export function updateJson(pathId, body, userId) {
  return request.put(`${REQUEST_BASE}/${pathId}/json`, body, {
    params: userId != null ? { userId } : {}
  })
}

export const learningPathApi = {
  planStreamFlux,
  save,
  list,
  getById,
  getGraph,
  remove,
  getJson,
  updateJson
}
