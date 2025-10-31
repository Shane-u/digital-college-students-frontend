<template>
  <div class="knowledge-graph-page">
    <!-- 顶部：标题栏 -->
    <div class="page-header">
      <div class="header-top">
        <div class="header-left">
          <h1 class="page-title">
            <!-- <span class="title-icon">🌌</span> -->
            <span class="title-text">KnowledgeGraph</span>
            <span class="title-decoration">✦</span>
          </h1>
        </div>
        <div class="header-right">
          <!-- 搜索栏和返回按钮同一行 -->
          <input 
            type="text" 
            class="search-input"
            placeholder="输入关键词检索..."
            v-model="searchKeyword"
            @keyup="handleSearch"
          />
          <button class="back-btn" @click="goBack">
            <span class="btn-icon">←</span>
            <span>返回</span>
          </button>
        </div>
      </div>
      <div class="golden-line"></div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧：小型控制按钮（无边框） -->
      <div class="control-area">
        <div class="control-group">
          <div class="slider-control">
            <span class="slider-label">间距</span>
            <input 
              type="range" 
              min="0.6" 
              max="3" 
              step="0.1" 
              v-model="spacingValue"
              class="spacing-slider"
              @input="handleSpacingChange"
            />
            <span class="slider-value">{{ spacingValue }}x</span>
          </div>
        </div>
      </div>

      <!-- 中间：知识图谱容器（占大部分面积） -->
      <div class="graph-container">
        <iframe 
          ref="graphIframe"
          src="/knowledge-graph/index.html"
          class="graph-iframe"
          frameborder="0"
          title="知识图谱"
          @load="onIframeLoad"
        ></iframe>
      </div>
    </div>

    <!-- 左下角：详细信息（纯文字，无边框） -->
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
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted, onUnmounted, watch } from 'vue'

const router = useRouter()
const route = useRoute()
const graphIframe = ref(null)

// 状态管理
const displayMode = ref('node') // 'node' 或 'text'
const searchKeyword = ref('')
const spacingValue = ref(1.0)
const selectedNode = ref(null)

// 向 iframe 发送消息
const sendMessageToIframe = (message) => {
  if (graphIframe.value && graphIframe.value.contentWindow) {
    graphIframe.value.contentWindow.postMessage(message, window.location.origin)
  }
}

// 返回功能
const goBack = () => {
  router.back()
}

// 处理显示模式切换
const handleModeChange = (mode) => {
  displayMode.value = mode
  sendMessageToIframe({
    type: 'modeChange',
    mode: mode
  })
}

// 处理搜索
const handleSearch = () => {
  console.log('发送搜索消息:', searchKeyword.value)
  sendMessageToIframe({
    type: 'search',
    keyword: searchKeyword.value
  })
}

// 处理间距缩放
const handleSpacingChange = () => {
  sendMessageToIframe({
    type: 'spacingChange',
    value: parseFloat(spacingValue.value)
  })
}

// 监听路由查询参数，如果有search参数则自动设置搜索关键词
watch(() => route.query.search, (newSearch) => {
  if (newSearch && typeof newSearch === 'string') {
    searchKeyword.value = newSearch
    // 如果iframe已加载，立即执行搜索
    if (graphIframe.value && graphIframe.value.contentWindow) {
      setTimeout(() => {
        sendMessageToIframe({
          type: 'search',
          keyword: newSearch
        })
      }, 300)
    }
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
</script>

<style scoped>
.knowledge-graph-page {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

/* 顶部标题栏 */
.page-header {
  padding: 20px 40px 15px;
  background: linear-gradient(180deg, rgba(26, 26, 26, 0.95) 0%, rgba(10, 10, 10, 0.9) 100%);
  /* border-bottom: 2px solid rgba(212, 175, 55, 0.3); */
  /* box-shadow: 0 4px 20px rgba(212, 175, 55, 0.1); */
  overflow: visible; /* 确保头部内容不被裁剪 */
  position: relative;
  z-index: 1001; /* 确保在内容之上 */
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  overflow: visible; /* 确保子元素不被裁剪 */
  min-width: 0; /* 允许flex容器缩小 */
}

.header-left {
  flex: 1;
  min-width: 0; /* 允许flex子元素缩小 */
  overflow: visible; /* 确保内容不被裁剪 */
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* 搜索栏（与返回按钮同一行） */
.search-input {
  width: 300px;
  padding: 10px 15px;
  background: rgba(50, 50, 50, 0.8);
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 8px;
  color: #fff;
  font-size: 15px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-input:focus {
  border-color: rgba(212, 175, 55, 0.7);
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.3);
  background: rgba(50, 50, 50, 0.9);
  width: 400px;
}

.page-title {
  display: flex;
  align-items: center;
  color: rgba(212,175,55,0.8);
  gap: 15px;
  margin: 0;
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, #d4af37 0%, #f4e99b 50%, #d4af37 100%);
  -webkit-background-clip: text;
  background-clip: text;
  text-shadow: 0 0 30px rgba(212, 175, 55, 0.5);
  letter-spacing: 2px;
  z-index: 1000;
  white-space: nowrap; /* 防止文字换行 */
  overflow: visible; /* 确保内容可见 */
}

.title-icon {
  font-size: 42px;
  filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.8));
  flex-shrink: 0; /* 图标不缩小 */
}

.title-text {
  position: relative;
  white-space: nowrap; /* 防止文字换行 */
  overflow: visible; /* 确保文字完整显示 */
  flex-shrink: 0; /* 文字不缩小 */
}

.title-decoration {
  font-size: 28px;
  color: #d4af37;
  animation: twinkle 2s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.golden-line {
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    #d4af37 20%, 
    #f4e99b 50%, 
    #d4af37 80%, 
    transparent 100%
  );
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.6);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.header-actions {
  display: flex;
  gap: 15px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 8px;
  color: #d4af37;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.back-btn:hover {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%);
  border-color: rgba(212, 175, 55, 0.5);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 18px;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 15px;
  padding: 15px 30px;
  overflow: hidden;
  position: relative;
}

/* 左侧控制区域（小型，无边框） */
.control-area {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding-top: 5px;
  align-items: center;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 控制按钮（无边框） */
.control-btn {
  padding: 8px 12px;
  background: rgba(255, 77, 77, 0.1);
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  text-align: center;
  width: 80px;
}

.control-btn.active {
  background: rgba(255, 77, 77, 0.3);
  color: #ff4d4d;
  font-weight: 600;
}

.control-btn:hover:not(.active) {
  background: rgba(255, 77, 77, 0.2);
}

/* 滑块控制（无边框） */
.slider-control {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  width: 80px;
}

.slider-label {
  color: #fff;
  font-size: 11px;
  font-weight: 500;
  opacity: 0.8;
}

.spacing-slider {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: rgba(212, 175, 55, 0.3);
  border-radius: 2px;
  outline: none;
  transition: background 0.3s ease;
}

.spacing-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  background: #d4af37;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 6px rgba(212, 175, 55, 0.5);
  transition: all 0.3s ease;
}

.spacing-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.8);
}

.spacing-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: #d4af37;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 6px rgba(212, 175, 55, 0.5);
  transition: all 0.3s ease;
}

.spacing-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.8);
}

.slider-value {
  color: #fff;
  font-size: 12px;
  text-align: center;
  opacity: 0.8;
}

/* 知识图谱容器（撑满页面） */
.graph-container {
  background: transparent;
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 100%;
}

.graph-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  background: transparent;
}

/* 左下角详细信息（纯文字，无边框） */
.info-area {
  position: fixed;
  bottom: 40px;
  left: 140px;
  max-width: 450px;
  background: transparent;
  padding: 20px 25px;
  z-index: 100;
  pointer-events: none;
}

.info-node-name {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 18px 0;
  /* text-shadow: 0 0 10px currentColor; */
  line-height: 1.4;
}

.info-properties {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-property {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-key {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  color: #fff;
  font-size: 15px;
  line-height: 1.6;
  word-break: break-word;
}


/* 响应式设计 */
@media (max-width: 1400px) {
  .main-content {
    grid-template-columns: 100px 1fr;
    gap: 15px;
    padding: 20px 30px;
  }
  
  .info-area {
    max-width: 350px;
    bottom: 30px;
    left: 130px;
  }
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    gap: 15px;
    padding: 15px 20px;
  }
  
  .control-area {
    flex-direction: row;
    gap: 15px;
    padding-top: 0;
  }
  
  .control-group {
    flex: 1;
  }
  
  .info-area {
    max-width: 300px;
    bottom: 20px;
    right: 20px;
    padding: 15px 20px;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 15px 20px 10px;
  }
  
  .page-title {
    font-size: 20px;
    gap: 6px;
  }
  
  .title-icon {
    font-size: 24px;
  }
  
  .title-text {
    font-size: 16px;
  }
  
  .search-input {
    font-size: 14px;
    padding: 10px 15px;
  }
  
  .main-content {
    padding: 15px 15px;
    gap: 10px;
  }
  
  .control-btn {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .info-area {
    max-width: 250px;
    bottom: 15px;
    right: 15px;
    padding: 12px 15px;
  }
  
  .info-node-name {
    font-size: 16px;
    margin-bottom: 10px;
  }
  
  .info-key {
    font-size: 11px;
  }
  
  .info-value {
    font-size: 12px;
  }
  
  .back-btn {
    padding: 8px 16px;
    font-size: 14px;
  }
}

/* 背景装饰效果 */
.knowledge-graph-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(212, 175, 55, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(212, 175, 55, 0.03) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.graph-container {
  position: relative;
  z-index: 1;
}
</style>

