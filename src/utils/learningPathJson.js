/**
 * 学习路径 JSON 解析与校验
 * 流式返回可能是半截 JSON，需累积后尝试解析
 */

/**
 * 尝试从累积字符串中提取完整 JSON 对象
 * 支持 { "nodes": [...] } 结构
 * @param {string} accumulated - 累积的字符串
 * @returns {{ parsed: { nodes: Array } | null, rest: string }}
 */
export function tryParseLearningPathJson(accumulated) {
  if (!accumulated || typeof accumulated !== 'string') {
    return { parsed: null, rest: accumulated || '' }
  }

  const trimmed = accumulated.trim()
  if (!trimmed.startsWith('{')) return { parsed: null, rest: accumulated }

  let depth = 0
  let inString = false
  let escape = false
  let quote = ''
  let start = -1

  for (let i = 0; i < trimmed.length; i++) {
    const c = trimmed[i]

    if (escape) {
      escape = false
      continue
    }
    if (c === '\\' && inString) {
      escape = true
      continue
    }
    if (inString) {
      if (c === quote) inString = false
      continue
    }
    if (c === '"' || c === "'") {
      inString = true
      quote = c
      continue
    }
    if (c === '{') {
      if (depth === 0) start = i
      depth++
      continue
    }
    if (c === '}') {
      depth--
      if (depth === 0 && start >= 0) {
        const slice = trimmed.slice(start, i + 1)
        try {
          const parsed = JSON.parse(slice)
          if (parsed && typeof parsed === 'object' && Array.isArray(parsed.nodes)) {
            return {
              parsed: { nodes: parsed.nodes },
              rest: trimmed.slice(i + 1).trim()
            }
          }
        } catch (_) {
          // 可能不完整，继续累积
        }
      }
    }
  }

  return { parsed: null, rest: accumulated }
}

/**
 * 校验节点结构是否符合 LearningPathNode
 * @param {unknown} node
 * @returns {boolean}
 */
export function isValidPathNode(node) {
  if (!node || typeof node !== 'object') return false
  const n = node
  return (
    typeof (n.nodeId ?? n.id) === 'string' &&
    typeof (n.name ?? n.label) === 'string'
  )
}

/**
 * 标准化节点为统一结构
 * @param {unknown} node
 * @returns {{ nodeId: string, label: string, name: string, isStart: boolean, parentNodeId: string, [key: string]: unknown }}
 */
export function normalizePathNode(node) {
  if (!node || typeof node !== 'object') {
    return {
      nodeId: '',
      label: '',
      name: '',
      isStart: false,
      parentNodeId: '',
      ...node
    }
  }
  const n = node
  return {
    nodeId: String(n.nodeId ?? n.id ?? ''),
    label: String(n.label ?? n.name ?? ''),
    name: String(n.name ?? n.label ?? ''),
    isStart: Boolean(n.isStart),
    parentNodeId: String(n.parentNodeId ?? ''),
    testPointsProgress: n.testPointsProgress ?? '',
    isLit: Boolean(n.isLit),
    litTime: n.litTime ?? '',
    childrenProgress: n.childrenProgress ?? '',
    createdAt: n.createdAt ?? '',
    ...n
  }
}

/**
 * 将扁平 nodes 转为树结构（用于思维导图渲染）
 * @param {Array} nodes - 标准化后的节点列表
 * @returns {Array<{ node: object, children: Array }>}
 */
export function buildPathTree(nodes) {
  if (!Array.isArray(nodes) || nodes.length === 0) return []
  const normalized = nodes.map(n => normalizePathNode(n))
  const byId = new Map(normalized.map(n => [n.nodeId, { node: n, children: [] }]))
  const roots = []
  for (const item of byId.values()) {
    const pid = (item.node.parentNodeId || '').trim()
    if (!pid) {
      roots.push(item)
    } else {
      const parent = byId.get(pid)
      if (parent) parent.children.push(item)
      else roots.push(item)
    }
  }
  roots.forEach(r => r.children.sort((a, b) => (a.node.nodeId || '').localeCompare(b.node.nodeId || '')))
  return roots
}
