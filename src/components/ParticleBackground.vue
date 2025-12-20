<template>
    <div class="particle-background">
      <canvas ref="canvas" class="particle-canvas"></canvas>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, onUnmounted } from 'vue'
  
  export default {
    name: 'ParticleBackground',
    setup() {
      const canvas = ref(null)
      let animationId = null
      let particles = []
      let mouse = { x: 0, y: 0 }
  
      // 粒子类
      class Particle {
        constructor(canvasWidth, canvasHeight) {
          this.canvasWidth = canvasWidth
          this.canvasHeight = canvasHeight
          this.x = Math.random() * canvasWidth
          this.y = Math.random() * canvasHeight
          this.vx = (Math.random() - 0.5) * 0.5 
          this.vy = (Math.random() - 0.5) * 0.5
          this.radius = Math.random() * 7 + 0.5 
          this.opacity = Math.random() * 0.9 + 0.1 
          this.originalOpacity = this.opacity
          // 使用浅蓝色：R和G为较高随机值，B接近255
          // 使用浅紫色：R适中，G低，B高
          this.red = Math.floor(Math.random() * 15 + 225)    // R: 225~239 更浅
          this.green = Math.floor(Math.random() * 10 + 225)  // G: 205~214 更高更浅
          this.blue = Math.floor(Math.random() * 10 + 240)   // B: 240~249 非常高，非常浅
        }
  
        update() {
          this.x += this.vx
          this.y += this.vy
  
          if (this.x < 0 || this.x > this.canvasWidth) {
            this.vx *= -1
            this.x = Math.max(0, Math.min(this.canvasWidth, this.x))
          }
          if (this.y < 0 || this.y > this.canvasHeight) {
            this.vy *= -1
            this.y = Math.max(0, Math.min(this.canvasHeight, this.y))
          }
  
          const dx = mouse.x - this.x
          const dy = mouse.y - this.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 100) {
            const force = (100 - distance) / 100
            this.opacity = this.originalOpacity + force * 0.2
          } else {
            this.opacity = this.originalOpacity
          }
        }
  
        draw(ctx) {
          ctx.beginPath()
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${Math.floor(this.red)}, ${Math.floor(this.green)}, ${Math.floor(this.blue)}, ${this.opacity})`
          ctx.fill()
        }
      }
  
      // 初始化画布
      const initCanvas = () => {
        const ctx = canvas.value.getContext('2d')
        const resizeCanvas = () => {
          canvas.value.width = window.innerWidth
          canvas.value.height = window.innerHeight
          // 窗口大小改变时，重新创建粒子
          createParticles()
        }
        
        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)
  
        return { ctx, resizeCanvas }
      }
  
      // 创建粒子
      const createParticles = () => {
        if (!canvas.value) return
        const canvasWidth = canvas.value.width
        const canvasHeight = canvas.value.height
        const particleCount = 100
        particles = []
        for (let i = 0; i < particleCount; i++) {
          particles.push(new Particle(canvasWidth, canvasHeight))
        }
      }
  
      // 动画循环
      const animate = () => {
        if (!canvas.value) return
        const ctx = canvas.value.getContext('2d')
        ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  
        particles.forEach(particle => {
          particle.update()
          particle.draw(ctx)
        })
  
        animationId = requestAnimationFrame(animate)
      }
  
      // 鼠标移动事件
      const handleMouseMove = (e) => {
        mouse.x = e.clientX
        mouse.y = e.clientY
        console.log("鼠标移动");
      }
  
      // 鼠标离开事件
      const handleMouseLeave = () => {
        mouse.x = -1000
        mouse.y = -1000
      }
  
      onMounted(() => {
        const { ctx, resizeCanvas } = initCanvas()
        createParticles()
        animate()
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseleave', handleMouseLeave)
      })

      onUnmounted(() => {
        if (animationId) {
          cancelAnimationFrame(animationId)
        }
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseleave', handleMouseLeave)
        window.removeEventListener('resize', initCanvas().resizeCanvas)
      })
  
      return {
        canvas
      }
    }
  }
  </script>
  
  <style scoped>
  .particle-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    pointer-events: none;
    overflow: hidden;
  }
  
  .particle-canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
  </style>