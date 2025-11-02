<template>
  <div class="triangle-background">
    <canvas ref="canvas" class="triangle-canvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'TriangleBackground',
  setup() {
    const canvas = ref(null)
    let animationId = null
    let triangles = []
    let lastScrollY = 0
    let scrollVelocity = 0
    let targetScale = 1
    let currentScale = 1
    let bounceOffset = 0
    let targetBounceOffset = 0

    // 预定义的三角形配置 - 位置、颜色、大小固定
    const triangleConfigs = [
      { x: 0.15, y: 0.2, size: 80, red: 220, green: 210, blue: 245 },
      { x: 0.85, y: 0.1, size: 60, red: 210, green: 215, blue: 240 },
      { x: 0.5, y: 0.35, size: 70, red: 225, green: 205, blue: 235 },
      { x: 0.2, y: 0.6, size: 50, red: 215, green: 220, blue: 245 },
      { x: 0.75, y: 0.65, size: 65, red: 220, green: 210, blue: 240 },
      { x: 0.45, y: 0.8, size: 75, red: 210, green: 220, blue: 250 },
      { x: 0.1, y: 0.4, size: 55, red: 225, green: 215, blue: 235 },
      { x: 0.6, y: 0.15, size: 68, red: 215, green: 210, blue: 240 },
      { x: 0.88, y: 0.45, size: 62, red: 220, green: 215, blue: 245 },
      { x: 0.35, y: 0.5, size: 72, red: 210, green: 205, blue: 235 },
      { x: 0.65, y: 0.55, size: 58, red: 225, green: 220, blue: 240 },
      { x: 0.25, y: 0.85, size: 70, red: 215, green: 215, blue: 245 },
      { x: 0.78, y: 0.25, size: 64, red: 220, green: 205, blue: 235 },
      { x: 0.12, y: 0.75, size: 66, red: 210, green: 220, blue: 240 },
      { x: 0.55, y: 0.7, size: 61, red: 225, green: 210, blue: 245 }
    ]

    // 三角形类
    class Triangle {
      constructor(canvasWidth, canvasHeight, config) {
        this.canvasWidth = canvasWidth
        this.canvasHeight = canvasHeight
        // 使用配置中的相对位置转换为绝对位置
        this.x = config.x * canvasWidth
        this.y = config.y * canvasHeight
        this.baseSize = config.size  // 保存基础大小
        this.size = config.size      // 实际大小（会改变）
        // 旋转角度 - 基于位置和尺寸生成，保证固定
        const seed = (config.x * 1000 + config.y * 2000) % (Math.PI * 2)
        this.rotation = seed
        // 旋转速度
        this.rotationSpeed = (seed % 1 - 0.5) * 0.002
        // 颜色固定
        this.red = config.red
        this.green = config.green
        this.blue = config.blue
        this.opacity = 0.2
      }

      update(globalScale, bounceY) {
        // 缓慢旋转
        this.rotation += this.rotationSpeed
        // 改变三角形的实际大小
        this.size = this.baseSize * globalScale
      }

      draw(ctx, bounceY) {
        ctx.save()
        
        // 移动到三角形中心
        ctx.translate(this.x, this.y + bounceY)
        // 旋转
        ctx.rotate(this.rotation)
        
        // 绘制三角形 - 使用改变后的 size
        ctx.beginPath()
        const height = this.size * Math.sqrt(3) / 2
        ctx.moveTo(0, -height * 2/3)  // 顶点
        ctx.lineTo(-this.size / 2, height * 1/3)  // 左下
        ctx.lineTo(this.size / 2, height * 1/3)   // 右下
        ctx.closePath()
        
        ctx.fillStyle = `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.opacity})`
        ctx.fill()
        
        // 添加边框使三角形更明显
        ctx.strokeStyle = `rgba(${this.red - 20}, ${this.green - 20}, ${this.blue - 20}, ${this.opacity * 0.5})`
        ctx.lineWidth = 1
        ctx.stroke()
        
        ctx.restore()
      }
    }

    // 初始化画布
    const initCanvas = () => {
      const ctx = canvas.value.getContext('2d')
      const resizeCanvas = () => {
        canvas.value.width = window.innerWidth
        canvas.value.height = window.innerHeight
        createTriangles()
      }
      
      resizeCanvas()
      window.addEventListener('resize', resizeCanvas)

      return { ctx, resizeCanvas }
    }

    // 创建三角形 - 使用预定义配置
    const createTriangles = () => {
      if (!canvas.value) return
      const canvasWidth = canvas.value.width
      const canvasHeight = canvas.value.height
      triangles = []
      triangleConfigs.forEach(config => {
        triangles.push(new Triangle(canvasWidth, canvasHeight, config))
      })
    }

    // 处理滚动事件
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      scrollVelocity = currentScrollY - lastScrollY
      lastScrollY = currentScrollY

      // 根据滚动速度调整目标缩放 - 增大幅度
      if (scrollVelocity > 0) {
        // 向下滚动 - 变大（幅度更大）
        targetScale = Math.min(2.2, currentScale + Math.abs(scrollVelocity) * 0.004)
        targetBounceOffset = Math.min(60, Math.abs(scrollVelocity) * 1)
      } else if (scrollVelocity < 0) {
        // 向上滚动 - 变小（幅度更大）
        targetScale = Math.max(0.4, currentScale - Math.abs(scrollVelocity) * 0.004)
        targetBounceOffset = Math.max(-60, -Math.abs(scrollVelocity) * 1)
      }
    }

    // 动画循环
    const animate = () => {
      if (!canvas.value) return
      const ctx = canvas.value.getContext('2d')
      ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

      // 缓动效果 - 让缩放平滑过渡
      currentScale += (targetScale - currentScale) * 0.1
      bounceOffset += (targetBounceOffset - bounceOffset) * 0.15
      
      // 让目标缩放慢慢回归到1
      targetScale += (1 - targetScale) * 0.2
      targetBounceOffset *= 0.92 // 弹跳衰减

      triangles.forEach(triangle => {
        triangle.update(currentScale, bounceOffset)
        triangle.draw(ctx, bounceOffset)
      })

      animationId = requestAnimationFrame(animate)
    }

    onMounted(() => {
      initCanvas()
      createTriangles()
      animate()
      window.addEventListener('scroll', handleScroll, { passive: true })
      lastScrollY = window.scrollY
    })

    onUnmounted(() => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      window.removeEventListener('scroll', handleScroll)
    })

    return {
      canvas
    }
  }
}
</script>

<style scoped>
.triangle-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.triangle-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>

