// 方案二：前端执行器（DOM级别）——接收指令后“像人一样”点 UI

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function setNativeValue(el, value) {
  const { set: valueSetter } =
    Object.getOwnPropertyDescriptor(el, 'value') ||
    Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value') ||
    {}
  if (valueSetter) valueSetter.call(el, value)
  else el.value = value
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
}

function findDialogRoot() {
  // Element Plus dialog mount 到 body；class="custom-dialog" 会挂在 .el-dialog 上
  return (
    document.querySelector('.el-dialog.custom-dialog') ||
    document.querySelector('.custom-dialog .el-dialog') ||
    document.querySelector('.el-dialog')
  )
}

function clickByText(root, selector, text) {
  const nodes = Array.from(root.querySelectorAll(selector))
  const target = nodes.find((n) => (n.textContent || '').trim() === text)
  if (target) target.click()
  return !!target
}

async function ensureRoute(path) {
  const router = window.__APP_ROUTER__
  if (router && router.currentRoute?.value?.path !== path) {
    await router.push(path)
    // 等页面渲染
    await sleep(200)
  } else if (!router) {
    // fallback
    if (window.location.pathname !== path) {
      window.location.href = path
    }
  }
}

async function navToGrowthRecord() {
  await ensureRoute('/growth/record')
}

async function growthOpenAddToday() {
  await navToGrowthRecord()
  const btn = document.querySelector('.add-today-btn')
  if (!btn) throw new Error('找不到“添加今日记录”按钮(.add-today-btn)')
  btn.click()
  await sleep(200)
}

async function growthFill({ description, reflection, importance }) {
  const dialog = findDialogRoot()
  if (!dialog) throw new Error('找不到弹窗(.el-dialog/.custom-dialog)')

  if (typeof description === 'string') {
    const input =
      dialog.querySelector('input[placeholder*="事件名称"]') ||
      dialog.querySelector('.el-input__inner')
    if (!input) throw new Error('找不到“事件名称”输入框')
    setNativeValue(input, description)
  }

  if (typeof reflection === 'string') {
    const textarea = dialog.querySelector('textarea')
    if (!textarea) throw new Error('找不到“个人感悟”输入框(textarea)')
    setNativeValue(textarea, reflection)
  }

  if (typeof importance === 'number') {
    // Element Plus rate：点击第 N 颗星（整数）
    const rateItems = dialog.querySelectorAll('.el-rate__item')
    if (!rateItems || rateItems.length === 0) {
      throw new Error('找不到“重要程度”评分组件(.el-rate__item)')
    }
    const n = Math.max(0, Math.min(5, importance))
    if (n > 0) {
      const idx = Math.ceil(n) - 1
      const item = rateItems[idx]
      if (item) item.click()
    }
  }
}

async function growthSave() {
  const dialog = findDialogRoot()
  if (!dialog) throw new Error('找不到弹窗(.el-dialog/.custom-dialog)')
  const ok = clickByText(dialog, 'button', '保存')
  if (!ok) throw new Error('找不到“保存”按钮')
}

async function growthCancel() {
  const dialog = findDialogRoot()
  if (!dialog) throw new Error('找不到弹窗(.el-dialog/.custom-dialog)')
  const ok = clickByText(dialog, 'button', '取消')
  if (!ok) throw new Error('找不到“取消”按钮')
}

async function navGo(path) {
  if (!path) throw new Error('nav.go: path 不能为空')
  await ensureRoute(path)
}

/**
 * 指令协议（示例）
 * - { type:"NAV_GO", path:"/growth/record" }
 * - { type:"GROWTH_ADD_TODAY" }
 * - { type:"GROWTH_FILL", description, reflection, importance }
 * - { type:"GROWTH_SAVE" }
 * - { type:"GROWTH_CANCEL" }
 */
export async function executeAgentCommand(cmd) {
  if (!cmd || !cmd.type) throw new Error('非法指令：缺少 type')
  switch (cmd.type) {
    case 'NAV_GO':
      return navGo(cmd.path)
    case 'NAV_GROWTH_RECORD':
      return navToGrowthRecord()
    case 'GROWTH_ADD_TODAY':
      return growthOpenAddToday()
    case 'GROWTH_FILL':
      return growthFill(cmd)
    case 'GROWTH_SAVE':
      return growthSave()
    case 'GROWTH_CANCEL':
      return growthCancel()
    default:
      throw new Error(`未知指令 type: ${cmd.type}`)
  }
}

// 暴露给控制台/外部脚本（可选）
window.DCSAgent = window.DCSAgent || {}
window.DCSAgent.exec = executeAgentCommand
window.DCSAgent.nav = { go: navGo, growthRecord: navToGrowthRecord }
window.DCSAgent.growth = {
  addToday: growthOpenAddToday,
  fill: growthFill,
  save: growthSave,
  cancel: growthCancel,
}

