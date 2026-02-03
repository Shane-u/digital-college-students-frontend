/**
 * Neo4j 图谱代理服务：使用 Node 版 neo4j-driver（Bolt）连接 Neo4j Desktop
 * 数据库名 = 当前用户 ID（userId 作为 database 名）
 * 运行：node server/neo4j-graph.js  默认端口 8122
 * 环境变量：NEO4J_URI、NEO4J_USER、NEO4J_PASSWORD（无 VITE_ 前缀）
 */
const http = require('http')
const url = require('url')

const NEO4J_URI = process.env.NEO4J_URI || process.env.NEO4J_URL || 'bolt://localhost:7687'
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j'
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || '12345678'
const PORT = parseInt(process.env.NEO4J_PROXY_PORT || '8122', 10)

function identityToString(id) {
  if (id == null) return ''
  if (typeof id === 'object' && typeof id.toString === 'function') return id.toString()
  return String(id)
}

/** 从 MATCH (n) RETURN n 解析出所有节点（含孤立节点） */
function parseNodeResult(records) {
  const nodeSet = new Map()
  for (const rec of records) {
    const n = rec.get('n')
    if (!n) continue
    const id = identityToString(n.identity)
    const label = (n.labels && n.labels[0]) || 'Node'
    if (!nodeSet.has(id)) {
      nodeSet.set(id, {
        id,
        label,
        properties: n.properties || {}
      })
    }
  }
  return Array.from(nodeSet.values())
}

/** 从 MATCH (a)-[r]->(b) RETURN a,r,b 解析出所有边 */
function parseRelationshipResult(records) {
  const links = []
  for (const rec of records) {
    const a = rec.get('a')
    const b = rec.get('b')
    const r = rec.get('r')
    if (!a || !b) continue
    const startId = identityToString(a.identity)
    const endId = identityToString(b.identity)
    const type = (r && r.type) || 'RELATES_TO'
    links.push({ source: startId, target: endId, type })
  }
  return links
}

/** 兼容旧格式：从 MATCH p=()-[r]->() RETURN p 解析（仅包含有关系的节点） */
function parsePathResult(records) {
  const nodeSet = new Map()
  const links = []
  for (const rec of records) {
    const p = rec.get('p')
    if (!p || !p.segments) continue
    for (const segment of p.segments) {
      const start = segment.start
      const end = segment.end
      const startId = identityToString(start.identity)
      const endId = identityToString(end.identity)
      const startLabel = (start.labels && start.labels[0]) || 'Node'
      const endLabel = (end.labels && end.labels[0]) || 'Node'
      if (!nodeSet.has(startId)) {
        nodeSet.set(startId, { id: startId, label: startLabel, properties: start.properties || {} })
      }
      if (!nodeSet.has(endId)) {
        nodeSet.set(endId, { id: endId, label: endLabel, properties: end.properties || {} })
      }
      links.push({
        source: startId,
        target: endId,
        type: (segment.relationship && segment.relationship.type) || 'RELATES_TO'
      })
    }
  }
  return { nodes: Array.from(nodeSet.values()), links }
}

function nodesLinksToFlashcards(nodes, links) {
  const categoryByTarget = {}
  links.forEach(l => {
    const src = typeof l.source === 'object' ? l.source.id : l.source
    const tgt = typeof l.target === 'object' ? l.target.id : l.target
    if (l.type === 'BELONGS_TO' || String(l.type).toLowerCase().includes('belongs')) {
      categoryByTarget[tgt] = src
    }
  })
  const nodeById = new Map(nodes.map(n => [n.id, n]))
  const cards = []
  const flashcardLabels = new Set(['Flashcard', 'flashcard', 'FlashCard'])
  nodes.forEach(n => {
    const label = (n.label || '').toString()
    if (!flashcardLabels.has(label)) return
    const props = n.properties || {}
    const categoryId = categoryByTarget[n.id]
    let hierarchyPath = props.hierarchyPath || props.category || ''
    if (categoryId && nodeById.has(categoryId)) {
      const catNode = nodeById.get(categoryId)
      const catName = (catNode.properties && (catNode.properties.name || catNode.properties.label)) || categoryId
      if (!hierarchyPath) hierarchyPath = catName
    }
    cards.push({
      id: props.id ?? n.id,
      title: props.title || props.name || '无标题',
      content: props.content || '',
      htmlContent: props.htmlContent || props.content,
      category: hierarchyPath,
      hierarchyPath: hierarchyPath || undefined,
      createdAt: props.createdAt || props.created_at,
      ...props
    })
  })
  return cards
}

async function fetchGraphFromNeo4j(userId) {
  const raw = userId != null ? String(userId).trim() : ''
  if (raw === '') {
    throw new Error('userId is required and must be non-empty for database name')
  }
  // 明确以用户 ID 作为数据库名连接（Neo4j 多库时每个用户一个库）
  const databaseName = raw
  const neo4j = require('neo4j-driver')
  const driver = neo4j.driver(
    NEO4J_URI,
    neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
  )
  try {
    // 显式指定 database，不用默认库
    const sessionConfig = {
      database: databaseName,
      defaultAccessMode: neo4j.session.READ
    }
    console.log('[neo4j-graph] Connecting to database:', databaseName)
    const session = driver.session(sessionConfig)
    // 1. 查所有节点（含孤立节点），避免只查路径漏掉无关系的节点
    const nodesResult = await session.run('MATCH (n) RETURN n')
    const nodes = parseNodeResult(nodesResult.records || [])
    // 2. 查所有关系
    const relResult = await session.run('MATCH (a)-[r]->(b) RETURN a, r, b')
    const links = parseRelationshipResult(relResult.records || [])
    await session.close()
    await driver.close()
    console.log('[neo4j-graph] Nodes:', nodes.length, 'Links:', links.length)
    const cards = nodesLinksToFlashcards(nodes, links)
    // 同时返回原始 nodes/links，前端用它们渲染完整图谱（否则只返回 Flashcard 节点会得到 data:[]）
    return { cards, nodes, links }
  } finally {
    await driver.close().catch(() => {})
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }
  const parsed = url.parse(req.url, true)
  const pathname = parsed.pathname || ''
  const isGetGraph = pathname === '/api/neo4j-graph' && req.method === 'GET'
  const isUpdate = pathname === '/api/neo4j-graph/update' && req.method === 'POST'
  const isDelete = pathname === '/api/neo4j-graph/delete' && req.method === 'POST'

  if (!isGetGraph && !isUpdate && !isDelete) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not Found' }))
    return
  }

  const readBody = () =>
    new Promise((resolve, reject) => {
      if (req.method !== 'POST') {
        resolve('')
        return
      }
      let body = ''
      req.on('data', (chunk) => { body += chunk })
      req.on('end', () => resolve(body))
      req.on('error', reject)
    })

  let body = await readBody()

  if (isGetGraph) {
    const rawUserId = parsed.query && parsed.query.userId
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId
    if (userId == null || String(userId).trim() === '') {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Missing userId' }))
      return
    }
    try {
      const result = await fetchGraphFromNeo4j(userId)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ code: 0, data: result }))
    } catch (err) {
      console.error('[neo4j-graph]', err.message)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: err.message || 'Neo4j connection failed' }))
    }
    return
  }

  let payload = null
  try {
    payload = body ? JSON.parse(body) : {}
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Invalid JSON body' }))
    return
  }

  const userId = payload.userId != null ? String(payload.userId).trim() : ''
  if (!userId) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Missing userId in body' }))
    return
  }

  const neo4j = require('neo4j-driver')
  const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD))
  const sessionConfig = { database: userId, defaultAccessMode: neo4j.session.WRITE }

  if (isUpdate) {
    const nodeId = payload.id != null ? parseInt(payload.id, 10) : NaN
    if (Number.isNaN(nodeId)) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Missing or invalid id (node id) in body' }))
      await driver.close().catch(() => {})
      return
    }
    try {
      const session = driver.session(sessionConfig)
      await session.run(
        `MATCH (n) WHERE id(n) = $nodeId
         SET n.title = $title, n.content = $content, n.htmlContent = $htmlContent, n.hierarchyPath = $hierarchyPath, n.name = $title
         RETURN n`,
        {
          nodeId,
          title: payload.title ?? '',
          content: payload.content ?? '',
          htmlContent: payload.htmlContent ?? payload.content ?? '',
          hierarchyPath: payload.hierarchyPath ?? ''
        }
      )
      await session.close()
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ code: 0 }))
    } catch (err) {
      console.error('[neo4j-graph] update', err.message)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: err.message || 'Update failed' }))
    } finally {
      await driver.close().catch(() => {})
    }
    return
  }

  if (isDelete) {
    const nodeId = payload.id != null ? parseInt(payload.id, 10) : NaN
    if (Number.isNaN(nodeId)) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Missing or invalid id (node id) in body' }))
      await driver.close().catch(() => {})
      return
    }
    try {
      const session = driver.session(sessionConfig)
      await session.run('MATCH (n) WHERE id(n) = $nodeId DETACH DELETE n', { nodeId })
      await session.close()
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ code: 0 }))
    } catch (err) {
      console.error('[neo4j-graph] delete', err.message)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: err.message || 'Delete failed' }))
    } finally {
      await driver.close().catch(() => {})
    }
    return
  }
})

server.listen(PORT, () => {
  console.log(`[neo4j-graph] Neo4j Desktop 图谱代理已启动 http://localhost:${PORT} (Bolt: ${NEO4J_URI}, 数据库名=userId)`)
})
