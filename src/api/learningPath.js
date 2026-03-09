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
 * @param {string|null} [params.sessionId] - 学习路径聊天 sessionId（从 SSE meta 事件中拿到后回传）
 * @param {AbortSignal} [params.signal] - 取消请求
 * @yields {string | { type: 'meta', meta: any }} 文本片段或 meta 事件（包含 sessionId）
 */
export async function* planStreamFlux({ userPrompt, currentPathJson = null, userId, sessionId = null, signal }) {
  const res = await fetch(`${API_BASE}/plan/stream/flux`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({
      userPrompt: userPrompt || '',
      currentPathJson: currentPathJson != null
        ? (typeof currentPathJson === 'string' ? currentPathJson : JSON.stringify(currentPathJson))
        : null,
      userId: userId ?? null,
      sessionId: sessionId || null
    }),
    signal
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  if (!res.body) throw new Error('ReadableStream not supported')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let currentEvent = '' // 记录当前 SSE event 名称（meta / message 等）

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
        if (!t) continue

        if (t === 'event:done') continue

        if (t.startsWith('event:')) {
          currentEvent = t.slice(6).trim()
          continue
        }

        if (t.startsWith('data:')) {
          const data = t.slice(5).trim()
          if (data === '[DONE]') continue
          if (!data) continue

          // meta 事件：一般包含 sessionId 等一次性信息，不参与路径 JSON 解析
          if (currentEvent === 'meta') {
            try {
              const meta = JSON.parse(data)
              yield { type: 'meta', meta }
            } catch {
              // 解析失败时也原样抛给上层
              yield { type: 'meta', meta: data }
            }
            continue
          }

          // 默认：仍按原来的字符串片段返回，供前端累积解析 JSON
          yield data
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

/**
 * 点击学习路径节点 → 匹配闪卡图谱
 * POST /learning-path/{pathId}/flashcard/match
 * @param {string|number} pathId
 * @param {Object} body - LearningPathFlashcardMatchRequest
 * @param {string|number} [userId]
 */
export function matchFlashcards(pathId, body, userId) {
  return request.post(`${REQUEST_BASE}/${pathId}/flashcard/match`, body, {
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
  updateJson,
  matchFlashcards
}
