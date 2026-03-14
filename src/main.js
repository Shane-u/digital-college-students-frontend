import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import 'animate.css'

// Monaco Editor 语法高亮与代码提示所需的 Web Worker（需在首次使用 Monaco 前执行）
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') return new jsonWorker()
    if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker()
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker()
    if (label === 'typescript' || label === 'javascript') return new tsWorker()
    return new editorWorker()
  }
}

// 导入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { initAgent } from './realtime/agentClient'

const app = createApp(App)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router)
app.use(ElementPlus)
app.mount('#app')

// Expose router for agent executor (方案二：前端执行指令)
// eslint-disable-next-line no-underscore-dangle
window.__APP_ROUTER__ = router

// Enable agent when `?agent=1` or localStorage flag is set.
try {
  const url = new URL(window.location.href)
  const enabledByQuery = url.searchParams.get('agent') === '1'
  const enabledByStorage = localStorage.getItem('agentEnabled') === '1'
  if (enabledByQuery || enabledByStorage) {
    initAgent()
  }
} catch (e) {
  // no-op
}





