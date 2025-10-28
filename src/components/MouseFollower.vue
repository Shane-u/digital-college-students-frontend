<template>
  <div 
    ref="follower" 
    class="mouse-follower"
    :class="{ 'visible': isVisible }"
  ></div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'MouseFollower',
  setup() {
    const follower = ref(null)
    const isVisible = ref(false)
    
    // 存储鼠标位置
    let mouseX = 0
    let mouseY = 0
    
    // 存储圆形要移动到的目标位置
    let targetX = 0
    let targetY = 0
    
    // 平滑系数，值越小，跟随越平滑
    const smoothFactor = 0.15
    
    // 监听鼠标移动事件
    const handleMouseMove = (e) => {
      // 获取鼠标在视口中的位置
      targetX = e.clientX
      targetY = e.clientY
      
      // 计算圆形的新位置（使其中心对准鼠标）
      if (follower.value) {
        const circleSize = follower.value.offsetWidth
        targetX -= circleSize / 2
        targetY -= circleSize / 2
      }
    }
    
    // 动画循环
    const animate = () => {
      if (!follower.value) return
      
      // 计算当前位置到目标位置的距离
      const dx = targetX - mouseX
      const dy = targetY - mouseY
      
      // 移动一小部分距离（平滑效果）
      mouseX += dx * smoothFactor
      mouseY += dy * smoothFactor
      
      // 设置圆形的位置
      follower.value.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`
      
      // 请求下一帧动画
      requestAnimationFrame(animate)
    }
    
    // 鼠标进入/离开窗口的效果
    const handleMouseEnter = () => {
      isVisible.value = true
    }
    
    const handleMouseLeave = () => {
      isVisible.value = false
    }
    
    // 页面加载完成后显示鼠标跟随
    const handlePageLoad = () => {
      isVisible.value = true
    }
    
    onMounted(() => {
      // 页面加载完成后显示鼠标跟随
      handlePageLoad()
      
      // 开始动画
      animate()
      
      // 添加事件监听器
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseenter', handleMouseEnter)
      document.addEventListener('mouseleave', handleMouseLeave)
    })
    
    onUnmounted(() => {
      // 清理事件监听器
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
    })
    
    return {
      follower,
      isVisible
    }
  }
}
</script>

<style scoped>
.mouse-follower {
  position: fixed;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  pointer-events: none;
  z-index: 9999;
  transition: all 0.1s ease;
  opacity: 0;
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.8),
              0 0 60px rgba(139, 92, 246, 0.6),
              0 0 90px rgba(59, 130, 246, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.mouse-follower.visible {
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mouse-follower {
    width: 20px;
    height: 20px;
  }
}
</style>
