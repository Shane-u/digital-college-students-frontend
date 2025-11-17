<template>
  <div class="sidebar-wrapper">
    <!-- 独立的活动指示器（位于侧边栏左侧） -->
    <div v-if="!isCollapsed" class="active-indicator" :style="indicatorStyle"></div>
    
    <!-- 侧边栏容器 -->
    <div :class="['sidebar-container', { 'collapsed': isCollapsed }]">
      <!-- 收缩/展开按钮 -->
      <div class="toggle-btn" :style="toggleBtnStyle" @click="toggleSidebar">
        <div class="arrow-icon" :class="{ 'rotate': isCollapsed }">
          <i class="icon" :class="isCollapsed ? 'icon-expand' : 'icon-collapse'"></i>
        </div>
        <div class="toggle-pulse"></div>
      </div>

      <!-- 侧边栏内容 -->
      <div v-if="!isCollapsed" class="sidebar-content">
        <div class="menu-items">
          <router-link 
            to="/growth/record" 
            class="menu-item"
            :class="{ 'active': currentRoute === '/growth/record' }"
            ref="recordLink"
          >
            <div class="menu-item-bg"></div>
            <div class="menu-content">
              <div class="icon-wrapper">
                <i class="menu-icon">📝</i>
              </div>
              <span class="menu-text">成长记录</span>
            </div>
            <div class="active-dot"></div>
          </router-link>

          <router-link 
            to="/growth/milestone" 
            class="menu-item"
            :class="{ 'active': currentRoute === '/growth/milestone' }"
            ref="milestoneLink"
          >
            <div class="menu-item-bg"></div>
            <div class="menu-content">
              <div class="icon-wrapper">
                <i class="menu-icon">🏆</i>
              </div>
              <span class="menu-text">里程碑</span>
            </div>
            <div class="active-dot"></div>
          </router-link>

          <router-link 
            to="/growth/photo-wall" 
            class="menu-item"
            :class="{ 'active': currentRoute === '/growth/photo-wall' }"
            ref="photoWallLink"
          >
            <div class="menu-item-bg"></div>
            <div class="menu-content">
              <div class="icon-wrapper">
                <i class="menu-icon">🖼️</i>
              </div>
              <span class="menu-text">照片墙</span>
            </div>
            <div class="active-dot"></div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isCollapsed = ref(false)

// 链接引用
const recordLink = ref(null)
const milestoneLink = ref(null)
const photoWallLink = ref(null)

// 指示器样式
const indicatorStyle = ref({
  height: '52px',
  top: '0px',
  opacity: '1'
})

// 切换按钮样式
const toggleBtnStyle = ref({
  top: '0px'
})

const currentRoute = computed(() => route.path)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  // 确保展开时更新指示器位置
  if (!isCollapsed.value) {
    nextTick(() => {
      updateIndicator()
    })
  }
}

// 更新指示器和切换按钮位置
const updateIndicator = () => {
  nextTick(() => {
    let activeLink = null
    
    if (currentRoute.value === '/growth/record' && recordLink.value) {
      activeLink = recordLink.value
    } else if (currentRoute.value === '/growth/milestone' && milestoneLink.value) {
      activeLink = milestoneLink.value
    } else if (currentRoute.value === '/growth/photo-wall' && photoWallLink.value) {
      activeLink = photoWallLink.value
    }
    
    if (activeLink && !isCollapsed.value) {
      const linkRect = activeLink.getBoundingClientRect()
      const sidebarRect = document.querySelector('.sidebar-container').getBoundingClientRect()
      
      // 计算相对于侧边栏容器的位置
      const relativeTop = linkRect.top - sidebarRect.top
      const linkHeight = linkRect.height
      
      indicatorStyle.value = {
        height: `${linkHeight}px`,
        top: `${relativeTop}px`,
        opacity: '1'
      }
      
      const btnTop = relativeTop + (linkHeight - 48) / 2
      toggleBtnStyle.value = {
        top: `${btnTop}px`
      }
    } else {
      // 折叠状态下，按钮在容器内居中
      toggleBtnStyle.value = {
        top: '0px'
      }
    }
  })
}

// 监听路由变化
watch(currentRoute, () => {
  updateIndicator()
})

// 监听折叠状态变化
watch(isCollapsed, (newVal) => {
  if (!newVal) {
    nextTick(() => {
      updateIndicator()
    })
  } else {
    updateIndicator()
  }
})

// 初始化位置
onMounted(() => {
  setTimeout(() => {
    updateIndicator()
  }, 100)
  
  // 监听窗口大小变化，重新计算位置
  window.addEventListener('resize', updateIndicator)
})
</script>

<style scoped>
.sidebar-wrapper {
  position: fixed;
  right: 0;
  top: 200px;
  z-index: 100;
  display: flex;
  align-items: flex-start;
}

/* 左侧指示器样式优化 */
.active-indicator {
  width: 4px;
  background: linear-gradient(180deg, #8A2BE2, #6A0DAD);
  border-radius: 6px 0 0 6px;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
  box-shadow: 0 0 12px rgba(138, 43, 226, 0.5);
  z-index: 101;
  position: relative;
  margin-right: -4px; /* 与侧边栏容器重叠 */
}

.active-indicator::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(180deg, transparent, rgba(255,255,255,0.3), transparent);
  border-radius: 6px;
}

.sidebar-container {
  background: linear-gradient(135deg, #ffffff 0%, #f8f4ff 100%);
  box-shadow: 
    -4px 0 20px rgba(0, 0, 0, 0.08),
    inset 1px 0 0 rgba(255, 255, 255, 0.8);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 16px 0 0 16px;
  display: flex;
  align-items: flex-start;
  padding: 0;
  width: auto;
  overflow: hidden;
  position: relative;
}

.sidebar-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 244, 255, 0.9) 100%);
  backdrop-filter: blur(10px);
  z-index: -1;
}

.sidebar-container.collapsed {
  width: 48px;
  height: 48px;
  border-radius: 16px 0 0 16px;
  box-shadow: 
    0 4px 20px rgba(138, 43, 226, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.8);
}

.toggle-btn {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #ffffff, #f8f4ff);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
  position: relative;
  z-index: 11;
  border-radius: 16px 0 0 16px;
  box-shadow: 
    -2px 0 8px rgba(0, 0, 0, 0.05),
    inset 1px 0 0 rgba(255, 255, 255, 0.8);
}

.toggle-pulse {
  position: absolute;
  top: 60%;
  left: 55%;
  /* transform: translate(-50%, -50%); */
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(138, 43, 226, 0.1);
  opacity: 0;
  transition: all 0.3s ease;
}

.toggle-btn:hover .toggle-pulse {
  opacity: 1;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.3;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
}

.sidebar-container:not(.collapsed) .toggle-btn {
  border-radius: 16px 0 0 0;
}

.arrow-icon {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: absolute;
  top: 50%;
    /* bottom: 50%; */
  left: 50%;
  /* transform: translate(-50%, -50%); */
}

.arrow-icon.rotate {
  transform: rotate(270deg);
  transform-origin: top left;
}

.icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
  /* position: absolute;
    top: 60%; */
    /* bottom: 50%; */
    /* left: 50%; */
}

/* 使用CSS三角形 */
.icon-collapse::before,
.icon-expand::before {
  content: "";
  display: block;
  width: 0;
  height: 0;
  border-style: solid;
  filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));
}

/* 向右三角形 */
.icon-collapse::before {
  border-width: 5px 0 5px 8px;
  border-color: transparent transparent transparent #8A2BE2;
}

/* 向左三角形 */
.icon-expand::before {
  border-width: 5px 8px 5px 0;
  border-color: transparent #8A2BE2 transparent transparent;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  background: transparent;
  border-radius: 16px 0 0 16px;
  position: relative;
  min-width: 120px;
  animation: sidebarSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

@keyframes sidebarSlideIn {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.menu-items {
  padding: 8px 0;
  position: relative;
}

.menu-item {
  padding: 0 12px;
  color: #666;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  display: flex;
  align-items: center;
  position: relative;
  height: 52px;
  opacity: 0;
  transform: translateX(-20px);
  animation: menuItemSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.menu-item-bg {
  position: absolute;
  top: 4px;
  left: 8px;
  right: 8px;
  bottom: 4px;
  background: transparent;
  border-radius: 12px;
  transition: all 0.3s ease;
  z-index: 1;
}

.menu-content {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 2;
  width: 100;
}

.icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.menu-icon {
  font-size: 14px;
  transition: transform 0.3s ease;
}

.menu-text {
  flex: 1;
  font-weight: 500;
  color: #555;
  transition: color 0.3s ease;
}

.active-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #8A2BE2;
  opacity: 0;
  transition: all 0.3s ease;
  margin-left: auto;
}

.menu-item:nth-child(1) {
  animation-delay: 0.1s;
}

.menu-item:nth-child(2) {
  animation-delay: 0.2s;
}

.menu-item:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes menuItemSlideIn {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.menu-item:hover {
  transform: translateX(4px);
}

.menu-item:hover .menu-item-bg {
  background: linear-gradient(135deg, rgba(138, 43, 226, 0.1), rgba(106, 13, 173, 0.05));
  box-shadow: 0 4px 12px rgba(138, 43, 226, 0.15);
}

.menu-item:hover .icon-wrapper {
  transform: scale(1.1);
  background: rgba(138, 43, 226, 0.1);
}

.menu-item:hover .menu-icon {
  transform: scale(1.2);
}

.menu-item:hover .menu-text {
  color: #8A2BE2;
}

.menu-item.active {
  font-weight: 600;
}

.menu-item.active .menu-item-bg {
  background: linear-gradient(135deg, rgba(138, 43, 226, 0.15), rgba(106, 13, 173, 0.1));
  box-shadow: 0 4px 12px rgba(138, 43, 226, 0.2);
}

.menu-item.active .icon-wrapper {
  background: linear-gradient(135deg, #8A2BE2, #6A0DAD);
  box-shadow: 0 4px 12px rgba(138, 43, 226, 0.3);
}

.menu-item.active .menu-icon {
  filter: brightness(0) invert(1);
  transform: scale(1.1);
}

.menu-item.active .menu-text {
  color: #8A2BE2;
  font-weight: 600;
}

.menu-item.active .active-dot {
  opacity: 1;
  transform: scale(1.2);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .sidebar-wrapper {
    top: 100px;
  }
  
  .toggle-btn {
    width: 32px;
    height: 32px;
  }
  
  .sidebar-container.collapsed {
    width: 44px;
    height: 44px;
    border-radius: 12px 0 0 12px;
  }
  
  .sidebar-content {
    min-width: 140px;
  }
  
  .menu-item {
    padding: 0 10px;
    height: 48px;
    font-size: 12px;
  }
}
</style>