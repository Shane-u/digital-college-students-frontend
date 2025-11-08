<template>
  <div :class="['sidebar-container', { 'collapsed': isCollapsed }]">
    <!-- 收缩/展开按钮 - 动态位置 -->
    <div class="toggle-btn" :style="toggleBtnStyle" @click="toggleSidebar">
      <span v-if="!isCollapsed">▶</span>
      <span v-else>◀</span>
    </div>

    <!-- 侧边栏内容 -->
    <div v-if="!isCollapsed" class="sidebar-content">
      <!-- 移动指示器 -->
      <div class="active-indicator" :style="indicatorStyle"></div>
      
      <router-link 
        to="/growth/record" 
        class="menu-item"
        :class="{ 'active': currentRoute === '/growth/record' }"
        ref="recordLink"
      >
        成长记录
      </router-link>

      <router-link 
        to="/growth/milestone" 
        class="menu-item"
        :class="{ 'active': currentRoute === '/growth/milestone' }"
        ref="milestoneLink"
      >
        里程碑
      </router-link>

      <router-link 
        to="/growth/photo-wall" 
        class="menu-item"
        :class="{ 'active': currentRoute === '/growth/photo-wall' }"
        ref="photoWallLink"
      >
        照片墙
      </router-link>
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

// 指示器样式（给一个初始可见的值）
const indicatorStyle = ref({
  height: '39px',
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
  // 展开后更新位置
  if (!isCollapsed.value) {
    setTimeout(() => {
      updateIndicator()
    }, 100)
  }
}

// 更新指示器和切换按钮位置
const updateIndicator = () => {
  nextTick(() => {
    let activeLink = null
    let linkIndex = 0
    
    // 根据当前路由找到对应的链接元素和索引
    if (currentRoute.value === '/growth/record' && recordLink.value) {
      activeLink = recordLink.value
      linkIndex = 0
    } else if (currentRoute.value === '/growth/milestone' && milestoneLink.value) {
      activeLink = milestoneLink.value
      linkIndex = 1
    } else if (currentRoute.value === '/growth/photo-wall' && photoWallLink.value) {
      activeLink = photoWallLink.value
      linkIndex = 2
    }
    
    if (activeLink && !isCollapsed.value) {
      // 展开状态：使用实际的元素位置
      const linkTop = activeLink.offsetTop
      const linkHeight = activeLink.offsetHeight
      
      console.log('更新指示器位置:', {
        height: linkHeight,
        top: linkTop,
        route: currentRoute.value,
        index: linkIndex
      })
      
      // 更新指示器位置
      indicatorStyle.value = {
        height: `${linkHeight}px`,
        top: `${linkTop}px`,
        opacity: '1'
      }
      
      // 更新切换按钮位置（居中对齐到链接）
      const btnTop = linkTop + (linkHeight - 40) / 2
      toggleBtnStyle.value = {
        top: `${btnTop}px`
      }
    } else {
      // 收缩状态：根据索引估算位置
      // 假设每个链接高度约为39px (12px padding * 2 + 15px font-size)
      const estimatedLinkHeight = 39
      const estimatedTop = linkIndex * estimatedLinkHeight
      const btnTop = estimatedTop + (estimatedLinkHeight - 40) / 2
      
      toggleBtnStyle.value = {
        top: `${btnTop}px`
      }
      
      console.log('收缩状态，估算按钮位置:', {
        index: linkIndex,
        top: btnTop
      })
    }
  })
}

// 监听路由变化
watch(currentRoute, () => {
  updateIndicator()
})

// 监听 isCollapsed 变化，更新指示器和按钮位置
watch(isCollapsed, (newVal) => {
  if (!newVal) {
    // 展开时，等待DOM渲染后更新
    setTimeout(() => {
      updateIndicator()
    }, 100)
  } else {
    // 收缩时，立即更新按钮位置
    updateIndicator()
  }
})

// 组件挂载时初始化指示器位置
onMounted(() => {
  setTimeout(() => {
    updateIndicator()
  }, 100)
})
</script>

<style scoped>
.sidebar-container {
  position: fixed;
  right: 0;
  top: 200px; /* 导航栏下方一点 */
  background: #b8a0c8;
  box-shadow: -2px 2px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 100;
  border-radius: 8px 0 0 8px;
  display: flex;
  align-items: flex-start;
  padding: 0;
  /* 移除固定高度，让内容自适应 */
}

.sidebar-container.collapsed {
  width: 40px;
  height: 40px; /* 收缩时保持按钮高度 */
}

.toggle-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  color: white;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border-radius: 8px 0 0 8px;
  flex-shrink: 0;
  position: absolute;
  left: 0;
  z-index: 11;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  background: #b8a0c8;
  border-radius: 8px 0 0 8px;
  position: relative;
  padding-left: 40px; /* 为切换按钮留出空间 */
}

/* 移动指示器 */
.active-indicator {
  position: absolute;
  right: 0;
  width: 4px;
  background: white;
  border-radius: 4px 0 0 4px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
}

.menu-item {
  padding: 12px 24px;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  display: block;
  position: relative;
}

/* 移除悬停效果 */
/* .menu-item:hover {
  
} */

.menu-item.active {
  font-weight: 700;
}

.menu-item:last-child {
  border-radius: 0 0 0 8px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .sidebar-container {
    top: 80px;
  }
  
  .toggle-btn {
    width: 35px;
    height: 35px;
    font-size: 14px;
  }
  
  .menu-item {
    padding: 10px 16px;
    font-size: 14px;
  }
}
</style>
