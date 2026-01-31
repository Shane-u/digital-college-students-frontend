/**
 * 与后端 switchNavTab 工具对接：tab 枚举与路由映射（解耦，供 NavCommandListener 与任意 WebSocket 桥使用）
 * 后端 definition 枚举：home, competition, career, knowledge-graph, twin-study, growth
 */
export const TAB_TO_PATH = {
  home: '/home',
  competition: '/competition/edu',
  career: '/career/showcase',
  'knowledge-graph': '/knowledge-graph',
  'twin-study': '/twin-study',
  growth: '/growth/record'
}

export const TAB_LABELS = {
  home: '首页',
  competition: '竞赛活动',
  career: '职业发展',
  'knowledge-graph': '技能图谱',
  'twin-study': '季季伴学',
  growth: '成长轨迹'
}

/**
 * 根据后端下发的 tab 执行路由跳转
 * @param {import('vue-router').Router} router
 * @param {string} tab - 后端下发的 tab：home | competition | career | knowledge-graph | twin-study | growth
 * @returns {boolean} 是否执行了跳转
 */
export function switchNavTab(router, tab) {
  console.log("正在切换到", tab, "页面")
  if (!router || !tab) return false
  const path = TAB_TO_PATH[tab]
  if (!path) return false
  console.log("路径为", path)
  if (router. currentRoute.value.path === path) return true
  router.push(path).catch(() => {})
  return true
}
