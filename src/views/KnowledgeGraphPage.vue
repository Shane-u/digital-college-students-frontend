<template>
  <div class="knowledge-graph-page">
    <button class="back-button" type="button" @click="goBackHome">
      返回主页
    </button>
    <div class="graph-fullscreen">
      <iframe 
        ref="graphIframe"
        src="/knowledge-graph/index.html"
        class="graph-iframe"
        frameborder="0"
        title="知识图谱"
        @load="onIframeLoad"
      ></iframe>
    </div>
    <div class="info-area" v-if="selectedNode">
      <h3 class="info-node-name" :style="{ color: selectedNode.color || '#ff4d4d' }">
        {{ selectedNode.name }}
      </h3>
      <div class="info-properties">
        <div 
          class="info-property" 
          v-for="(value, key) in selectedNode.properties" 
          :key="key"
        >
          <span class="info-key">{{ key }}:</span>
          <span class="info-value">{{ value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted, watch } from 'vue'

const route = useRoute()
const router = useRouter()
const graphIframe = ref(null)

// 状态管理
const searchKeyword = ref('')
const selectedNode = ref(null)

// 向 iframe 发送消息
const sendMessageToIframe = (message) => {
  if (graphIframe.value && graphIframe.value.contentWindow) {
    graphIframe.value.contentWindow.postMessage(message, window.location.origin)
  }
}

// 监听路由查询参数，如果有search参数则自动设置搜索关键词
watch(() => route.query.search, (newSearch) => {
  if (newSearch && typeof newSearch === 'string') {
    searchKeyword.value = newSearch
    // 如果iframe已加载，立即执行搜索
    setTimeout(() => {
      sendMessageToIframe({
        type: 'search',
        keyword: newSearch
      })
    }, 300)
  }
}, { immediate: true })

// 处理来自 iframe 的消息
const handleMessage = (event) => {
  // 确保消息来自同源
  if (event.origin !== window.location.origin) return
  
  if (event.data && event.data.type === 'nodeSelected') {
    selectedNode.value = {
      name: event.data.name || '未知',
      color: event.data.color || '#ff4d4d',
      properties: event.data.properties || {}
    }
  } else if (event.data && event.data.type === 'nodeDeselected') {
    selectedNode.value = null
  }
}

// iframe 加载完成
const onIframeLoad = () => {
  // iframe 加载完成后可以发送初始配置
  console.log('知识图谱iframe加载完成')
  // 确保iframe加载完成后再发送消息
  setTimeout(() => {
    // 优先使用路由参数中的搜索关键词
    const routeSearch = route.query.search
    const keyword = routeSearch && typeof routeSearch === 'string' ? routeSearch : searchKeyword.value
    if (keyword) {
      searchKeyword.value = keyword
      sendMessageToIframe({
        type: 'search',
        keyword: keyword
      })
    }
  }, 500)
}

// 生命周期
onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})

const goBackHome = () => {
  router.push({ path: '/' })
}
</script>

<style scoped>
.knowledge-graph-page {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
  overflow: hidden;
  z-index: 1000;
}

.graph-fullscreen {
  position: absolute;
  inset: 0;
}

.graph-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  background: transparent;
}

.back-button {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 1100;
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.back-button:hover {
  background: rgba(0, 0, 0, 0.75);
  border-color: rgba(255, 255, 255, 0.7);
}

.info-area {
  position: absolute;
  bottom: 40px;
  left: 60px;
  max-width: 420px;
  color: #111;
  z-index: 1001;
  pointer-events: none;
}

.info-node-name {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 18px 0;
  line-height: 1.4;
  text-shadow: 0 0 8px currentColor;
}

.info-properties {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-property {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-key {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: rgba(0, 0, 0, 0.65);
}

.info-value {
  font-size: 15px;
  line-height: 1.6;
  word-break: break-word;
}

@media (max-width: 768px) {
  .info-area {
    left: 20px;
    right: 20px;
    bottom: 20px;
    max-width: unset;
  }

  .info-node-name {
    font-size: 18px;
  }

  .info-value {
    font-size: 13px;
  }
}
</style>

