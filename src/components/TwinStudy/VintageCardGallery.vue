<template>
  <div class="vintage-gallery">
    <div class="gallery-content">
      <div class="gallery-container">
        <TwineString />
        
        <div 
          class="cards-wrapper"
          :class="{ 'refreshing': isRefreshing }"
        >
          <VintageCard 
            v-for="(card, idx) in cards"
            :key="card.id"
            :data="card"
            :style="getCardStyle(idx)"
            @click="handleCardClick(card.content)"
          />
        </div>
      </div>

      <div class="refresh-button-wrapper">
        <button
          @click="refreshBatch"
          :disabled="isRefreshing"
          class="refresh-button"
        >
          <svg 
            :class="['refresh-icon', { 'spinning': isRefreshing }]"
            fill="none" 
            viewBox="0 0 24 24"
          >
            <defs>
              <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#9333EA;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#7C3AED;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#6D28D9;stop-opacity:1" />
              </linearGradient>
            </defs>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" :stroke="`url(#${gradientId})`" />
          </svg>
          <span>换一批</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import VintageCard from './VintageCard.vue'
import TwineString from './TwineString.vue'

const VINTAGE_COLORS = [
  '#E2D1C3', // Muted beige
  '#D4E2D5', // Faded sage
  '#E2D4D4', // Dusty rose
  '#D4DCE2', // Faded denim
  '#E2DDD4', // Pale ochre
  '#D9D4E2', // Muted lavender
]

const FONTS = [
  '"Gochi Hand", cursive',
  '"Zeyada", cursive',
  '"Special Elite", serif'
]

const WEB_DEV_SNIPPETS = [
  "如何用HTML和CSS\n创建一个响应式\n的导航栏？",
  "Vue.js中如何实现\n组件之间的数据\n传递？",
  "React的useState和\nuseEffect有什么区别\n和使用场景？",
  "如何使用CSS Grid\n实现复杂的页面\n布局？",
  "Promise和async/await\n有什么区别？\n什么时候用哪个？",
  "TypeScript中的接口\n和类型有什么区别？",
  "Webpack的打包原理\n是什么？如何优化\n打包速度？",
  "HTTP和HTTPS有什么\n区别？为什么需要\nHTTPS？",
  "如何优化DOM操作\n的性能？有哪些\n最佳实践？",
  "ES6的箭头函数和\n普通函数有什么\n区别？",
  "如何实现移动端\n的响应式设计？\n有哪些方案？",
  "前端性能优化的\n常见方法有哪些？\n如何测量性能？",
  "如何理解JavaScript\n的闭包？有什么\n实际应用？",
  "Vue的响应式原理\n是什么？如何实现\n数据绑定？",
  "React的虚拟DOM\n是什么？为什么\n需要它？",
  "CSS的flexbox和grid\n有什么区别？\n什么时候用哪个？",
  "如何理解JavaScript\n的事件循环机制？",
  "前端路由的实现\n原理是什么？\n如何实现？",
]

const cards = ref([])
const isRefreshing = ref(false)
const gradientId = ref(`purpleGradient-${Math.random().toString(36).substring(7)}`)

const generateBatch = () => {
  const count = 5
  const usedIndices = new Set()
  
  return Array.from({ length: count }).map((_, i) => {
    // 确保每个卡片内容不重复
    let snippetIndex
    do {
      snippetIndex = Math.floor(Math.random() * WEB_DEV_SNIPPETS.length)
    } while (usedIndices.has(snippetIndex) && usedIndices.size < WEB_DEV_SNIPPETS.length)
    usedIndices.add(snippetIndex)
    
    const content = WEB_DEV_SNIPPETS[snippetIndex]
    const lines = content.split('\n')
    const lineCount = lines.length
    
    // 根据内容行数动态计算卡片尺寸，确保文字完整显示
    const isLong = lineCount > 3
    const baseWidth = isLong ? 120 : 160
    const baseHeight = isLong ? 180 + (lineCount - 3) * 28 : 140 + (lineCount - 2) * 24
    
    const width = baseWidth + Math.random() * 20
    // 增加高度以确保文字完整显示，并留出更多空间
    const height = baseHeight + Math.random() * 40 + 20
    
    // 大幅增加旋转角度范围，让卡片看起来更"东倒西歪"
    // 每个卡片有不同的旋转角度，范围在 -25 到 +25 度之间
    const rotation = (Math.random() - 0.5) * 50
    // 增加随机水平偏移范围，让卡片位置更随意
    const offsetX = (Math.random() - 0.5) * 15
    // 添加随机垂直偏移，让卡片上下位置更随意
    const offsetY = (Math.random() - 0.5) * 12
    const id = Math.random().toString(36).substring(7)
    
    return {
      id,
      content,
      rotation,
      offsetX,
      offsetY,
      width,
      height,
      color: VINTAGE_COLORS[Math.floor(Math.random() * VINTAGE_COLORS.length)],
      fontFamily: FONTS[Math.floor(Math.random() * FONTS.length)]
    }
  })
}

const refreshBatch = () => {
  isRefreshing.value = true
  setTimeout(() => {
    cards.value = generateBatch()
    isRefreshing.value = false
  }, 600)
}

const getCardStyle = (idx) => {
  const mid = (cards.value.length - 1) / 2
  const distFromMid = Math.abs(idx - mid)
  const sagOffset = (mid * mid - distFromMid * distFromMid) * 10
  const card = cards.value[idx]
  
  // 结合绳子下垂效果和随机偏移
  const finalY = sagOffset + (card?.offsetY || 0)
  const finalX = card?.offsetX || 0
  
  return {
    transform: `translateY(${finalY}px) translateX(${finalX}px)`,
    zIndex: 10
  }
}

const emit = defineEmits(['cardClick'])

const handleCardClick = (content) => {
  emit('cardClick', content)
}

onMounted(() => {
  cards.value = generateBatch()
})
</script>

<style scoped>
.vintage-gallery {
  width: 100%;
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.gallery-content {
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.gallery-container {
  position: relative;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1;
  min-height: 0;
}

.gallery-container::-webkit-scrollbar {
  display: none;
}

.gallery-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.cards-wrapper {
  position: relative;
  min-width: 1000px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: flex-start;
  padding-top: 40px;
  padding-bottom: 60px;
  transition: all 0.7s;
  gap: 32px;
  height: fit-content;
  overflow: visible;
}

.cards-wrapper.refreshing {
  opacity: 0;
  transform: translateY(-24px) scale(0.95);
}

.cards-wrapper:not(.refreshing) {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.refresh-button-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 20;
  flex-shrink: 0;
  padding-bottom: 0px;
}

.refresh-button {
  position: relative;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
}

.refresh-button span {
  background: linear-gradient(135deg, #9333EA 0%, #7C3AED 50%, #6D28D9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.refresh-button:hover:not(:disabled) span {
  background: linear-gradient(135deg, #A855F7 0%, #9333EA 50%, #7C3AED 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.refresh-button:active:not(:disabled) {
  transform: scale(0.98);
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-icon {
  width: 18px;
  height: 18px;
  transition: transform 1s;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
