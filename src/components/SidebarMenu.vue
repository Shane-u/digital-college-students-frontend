<template>
  <div 
    class="sidebar-wrapper"
    :style="wrapperStyle"
  >
    <!-- 圆环状侧边栏容器 -->
    <div :class="['sidebar-ring', { 'collapsed': isCollapsed }]">
      <!-- 中心指示器（可点击收起、可拖拽） -->
      <button 
        class="center-indicator" 
        @mousedown="startDrag"
      >
        <div class="indicator-circle">
          <div class="indicator-dot"></div>
        </div>
        <div class="indicator-ring"></div>
      </button>

      <!-- 菜单项（围绕中心圆形排列） -->
      <div v-if="!isCollapsed" class="menu-ring">
        <router-link 
          to="/growth/record" 
          class="menu-item"
          :class="{ 'active': currentRoute === '/growth/record' }"
          :style="getMenuItemStyle(0)"
        >
          <div class="menu-item-glass">
            <div class="menu-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <span class="menu-text">成长记录</span>
          </div>
        </router-link>

        <router-link 
          to="/growth/milestone" 
          class="menu-item"
          :class="{ 'active': currentRoute === '/growth/milestone' }"
          :style="getMenuItemStyle(1)"
        >
          <div class="menu-item-glass">
            <div class="menu-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span class="menu-text">里程碑</span>
          </div>
        </router-link>

        <router-link 
          to="/growth/photo-wall" 
          class="menu-item"
          :class="{ 'active': currentRoute === '/growth/photo-wall' }"
          :style="getMenuItemStyle(2)"
        >
          <div class="menu-item-glass">
            <div class="menu-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <span class="menu-text">照片墙</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isCollapsed = ref(false)

// 位置状态（null 表示使用默认位置）
const position = ref(null)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

const SIDEBAR_EXPANDED_SIZE = 200
const SIDEBAR_COLLAPSED_SIZE = 60

const clampPositionToViewport = (pos, collapsedState = isCollapsed.value) => {
  if (!pos) return null
  const sidebarSize = collapsedState ? SIDEBAR_COLLAPSED_SIZE : SIDEBAR_EXPANDED_SIZE
  const maxX = Math.max(0, window.innerWidth - sidebarSize)
  const maxY = Math.max(0, window.innerHeight - sidebarSize)
  return {
    x: Math.max(0, Math.min(pos.x, maxX)),
    y: Math.max(0, Math.min(pos.y, maxY))
  }
}

// 从 localStorage 加载保存的位置
const loadPosition = () => {
  const saved = localStorage.getItem('sidebarPosition')
  if (saved) {
    try {
      const pos = JSON.parse(saved)
      // 检查是否是有效位置
      if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
        position.value = clampPositionToViewport(pos)
      }
    } catch (e) {
      console.error('Failed to load sidebar position:', e)
    }
  }
}

// 保存位置到 localStorage
const savePosition = () => {
  if (position.value) {
    localStorage.setItem('sidebarPosition', JSON.stringify(position.value))
  }
}

// 计算 wrapper 样式
const wrapperStyle = computed(() => {
  // 如果有保存的位置，使用保存的位置
  if (position.value) {
    return {
      left: `${position.value.x}px`,
      top: `${position.value.y}px`,
      right: 'auto',
      transform: 'none'
    }
  }
  // 否则使用默认位置
  return {
    left: 'auto',
    right: '40px',
    top: '50%',
    transform: 'translateY(-50%)'
  }
})

const currentRoute = computed(() => route.path)

// 拖拽相关状态
let hasDragged = false // 标记是否发生了拖拽
let dragStartPos = { x: 0, y: 0 } // 拖拽开始时的鼠标位置
let dragStartCollapsed = false // 拖拽开始时的折叠状态
const DRAG_THRESHOLD = 5 // 拖拽阈值（像素），超过这个距离才认为是拖拽

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

// 开始拖拽
const startDrag = (e) => {
  hasDragged = false // 重置拖拽标志
  isDragging.value = true
  
  // 记录拖拽开始时的状态
  dragStartCollapsed = isCollapsed.value
  dragStartPos = {
    x: e.clientX,
    y: e.clientY
  }
  
  const wrapper = e.currentTarget.closest('.sidebar-wrapper')
  const rect = wrapper.getBoundingClientRect()
  
  // 计算鼠标相对于 wrapper 的偏移
  dragStart.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
  e.stopPropagation()
}

// 拖拽中
const onDrag = (e) => {
  if (!isDragging.value) return
  
  // 计算鼠标移动距离
  const deltaX = Math.abs(e.clientX - dragStartPos.x)
  const deltaY = Math.abs(e.clientY - dragStartPos.y)
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  
  // 如果移动距离超过阈值，标记为拖拽
  if (distance > DRAG_THRESHOLD) {
    hasDragged = true
  }
  
  // 计算新位置（鼠标位置减去初始偏移）
  let newX = e.clientX - dragStart.value.x
  let newY = e.clientY - dragStart.value.y
  
  // 限制在视口内（使用拖拽开始时的状态，而不是当前状态）
  const sidebarSize = dragStartCollapsed ? 60 : 200
  const maxX = window.innerWidth - sidebarSize
  const maxY = window.innerHeight - sidebarSize
  
  newX = Math.max(0, Math.min(newX, maxX))
  newY = Math.max(0, Math.min(newY, maxY))
  
  position.value = { x: newX, y: newY }
}

// 停止拖拽
const stopDrag = (e) => {
  if (isDragging.value) {
    // 如果确实发生了拖拽，确保状态恢复到拖拽开始时的状态
    if (hasDragged) {
      // 确保状态与拖拽开始时一致
      if (isCollapsed.value !== dragStartCollapsed) {
        isCollapsed.value = dragStartCollapsed
      }
    } else {
      // 没有发生拖拽，这是点击操作，切换状态
      toggleSidebar()
    }
    
    // 重置状态
    isDragging.value = false
    hasDragged = false
    savePosition()
  }
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 计算菜单项位置（围绕中心圆形排列）
const getMenuItemStyle = (index) => {
  if (isCollapsed.value) {
    return { opacity: 0, transform: 'translate(-50%, -50%) scale(0)' }
  }
  
  const totalItems = 3
  const angle = (index * (360 / totalItems) - 90) * (Math.PI / 180) // 从顶部开始
  const radius = 65 // 距离中心的距离（px）- 调整以匹配更小的模块
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius
  
  return {
    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
    transitionDelay: `${index * 0.1}s`
  }
}

const handleResize = () => {
  if (!position.value) return
  position.value = clampPositionToViewport(position.value)
  savePosition()
}

// 初始化
onMounted(() => {
  loadPosition()
  window.addEventListener('resize', handleResize)
})

// 清理
onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('resize', handleResize)
})

watch(isCollapsed, () => {
  if (!position.value) return
  position.value = clampPositionToViewport(position.value)
  savePosition()
})
</script>

<style scoped>
.sidebar-wrapper {
  position: fixed;
  z-index: 100;
  user-select: none;
  transition: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-wrapper.dragging {
  transition: none;
}

/* 圆环状侧边栏容器 */
.sidebar-ring {
  position: relative;
  /* width: 200px;
  height: 200px; */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1), height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 0;
  transform-origin: center center;
}

.sidebar-ring.collapsed {
  width: 60px;
  height: 60px;
}

/* 中心指示器 */
.center-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.15));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 2px solid rgba(139, 92, 246, 0.3);
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              background 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 8px 32px rgba(139, 92, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.center-indicator:hover {
  transform: translate(-50%, -50%) scale(1.1);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.25));
  box-shadow: 
    0 12px 40px rgba(139, 92, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  cursor: grab;
}

.center-indicator:active {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(1.05);
}

.indicator-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
}

.indicator-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(139, 92, 246, 0.2);
  animation: pulseRing 2s ease-in-out infinite;
}

@keyframes pulseRing {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.5;
  }
}

/* 菜单环 */
.menu-ring {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 菜单项 */
.menu-item {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-decoration: none;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 5;
  opacity: 0;
}

.sidebar-ring:not(.collapsed) .menu-item {
  opacity: 1;
}

.menu-item-glass {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  box-shadow: 
    0 6px 24px rgba(139, 92, 246, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  min-width: 80px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-item:hover .menu-item-glass {
  transform: translateY(-4px) scale(1.05);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 
    0 12px 40px rgba(139, 92, 246, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border-color: rgba(139, 92, 246, 0.4);
}

.menu-item.active .menu-item-glass {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(168, 85, 247, 0.2));
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 
    0 12px 40px rgba(139, 92, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.menu-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b5cf6;
  transition: all 0.3s ease;
}

.menu-item:hover .menu-icon {
  transform: scale(1.15);
  color: #a855f7;
}

.menu-item.active .menu-icon {
  color: #7c3aed;
  transform: scale(1.1);
}

.menu-icon svg {
  width: 100%;
  height: 100%;
  stroke: currentColor;
}

.menu-text {
  font-size: 11px;
  font-weight: 600;
  color: #8b5cf6;
  letter-spacing: 0.02em;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.menu-item:hover .menu-text {
  color: #a855f7;
}

.menu-item.active .menu-text {
  color: #7c3aed;
  font-weight: 700;
}

/* 背景装饰 */
.sidebar-ring::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(243, 232, 255, 0.6), rgba(250, 245, 255, 0.4));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: -1;
  transition: all 0.4s ease;
}

.sidebar-ring.collapsed::before {
  width: 0;
  height: 0;
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar-wrapper {
    right: 20px;
    top: auto;
    bottom: 20px;
    transform: none;
  }

  .sidebar-ring {
    width: 160px;
    height: 160px;
  }

  .sidebar-ring.collapsed {
    width: 50px;
    height: 50px;
  }

  .center-indicator {
    width: 50px;
    height: 50px;
  }

  .menu-item-glass {
    padding: 12px 16px;
    min-width: 80px;
  }

  .menu-text {
    font-size: 12px;
  }

  .menu-icon {
    width: 24px;
    height: 24px;
  }
}
</style>