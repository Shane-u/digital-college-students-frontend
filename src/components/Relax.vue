<template>
  <div class="relax-section">
    <!-- 标题 -->
    <div class="section-title-wrap">
      <Star class="title-icon" />
      <h2 class="section-title">闲暇时光</h2>
      <span class="view-more-container">
        <a href="#" class="view-more">查看更多-></a>
      </span>
    </div>
    
    <div class="photo-wall-container" 
         @mousedown="startDrag"
         @mousemove="onDrag"
         @mouseup="stopDrag"
         @mouseleave="stopDrag">
      <!-- 照片墙 - 无限循环滚动 -->
      <div class="photo-wall" ref="photoWall">
        <!-- 第一组照片 -->
        <div 
          v-for="(photo, index) in photos" 
          :key="`photo-1-${index}`"
          class="photo-card"
        >
          <div class="photo-frame">
            <img :src="photo.image" :alt="photo.title" />
          </div>
          <p class="photo-title">{{ photo.title }}</p>
        </div>
        
        <!-- 第二组照片（克隆用于无缝循环） -->
        <div 
          v-for="(photo, index) in photos" 
          :key="`photo-2-${index}`"
          class="photo-card"
        >
          <div class="photo-frame">
            <img :src="photo.image" :alt="photo.title" />
          </div>
          <p class="photo-title">{{ photo.title }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Star from './Star.vue';

const photos = ref([
  { image: new URL('../assets/relax/640.png', import.meta.url).href, title: '晨光漫步' },
  { image: new URL('../assets/relax/640 (1).png', import.meta.url).href, title: '悦享时光' },
  { image: new URL('../assets/relax/640 (2).png', import.meta.url).href, title: '静心阅读' },
  { image: new URL('../assets/relax/640 (3).png', import.meta.url).href, title: '音乐相伴' },
  { image: new URL('../assets/relax/640 (4).png', import.meta.url).href, title: '户外踏青' },
  { image: new URL('../assets/relax/640 (5).png', import.meta.url).href, title: '品茗时刻' },
  { image: new URL('../assets/relax/640 (6).png', import.meta.url).href, title: '艺术创作' },
  { image: new URL('../assets/relax/640 (7).png', import.meta.url).href, title: '运动健身' },
  { image: new URL('../assets/relax/640 (8).png', import.meta.url).href, title: '友聚欢笑' }
]);

const photoWall = ref(null);
let animationId = null;
let scrollPosition = 0;
let isDragging = false;
let startX = 0;
let scrollLeft = 0;
let autoScrolling = true;

// 开始拖拽
const startDrag = (e) => {
  isDragging = true;
  autoScrolling = false;
  startX = e.pageX;
  scrollLeft = scrollPosition;
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
};

// 拖拽中
const onDrag = (e) => {
  if (!isDragging) return;
  e.preventDefault();
  const x = e.pageX;
  const walk = (x - startX) * 2; // 乘以2增加拖拽灵敏度
  scrollPosition = scrollLeft - walk;
  
  // 确保滚动位置在有效范围内
  const cardWidth = 320;
  const totalWidth = cardWidth * photos.value.length;
  if (scrollPosition < 0) scrollPosition = totalWidth + scrollPosition;
  if (scrollPosition >= totalWidth) scrollPosition = scrollPosition - totalWidth;
  
  if (photoWall.value) {
    photoWall.value.style.transform = `translateX(-${scrollPosition}px)`;
  }
};

// 停止拖拽
const stopDrag = () => {
  isDragging = false;
  setTimeout(() => {
    autoScrolling = true;
    animate();
  }, 500);
};

// 自动滚动动画
const animate = () => {
  if (!photoWall.value || !autoScrolling) return;
  
  scrollPosition += 0.5; // 控制滚动速度
  
  // 当滚动到一半时重置（因为有两组相同的照片）
  const cardWidth = 320; // 照片卡片宽度 + gap
  const totalWidth = cardWidth * photos.value.length;
  
  if (scrollPosition >= totalWidth) {
    scrollPosition = 0;
  }
  
  photoWall.value.style.transform = `translateX(-${scrollPosition}px)`;
  
  animationId = requestAnimationFrame(animate);
};

onMounted(() => {
  animate();
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});
</script>

<style scoped>
.relax-section {
  width: 100%;
  min-height: 500px;
  position: relative;
  background-image: url('../assets/background/image.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 30px 0 80px;
  overflow: hidden;
}

/* 标题样式 */
.section-title-wrap {
  position: relative;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 1400px;
  margin: 0 auto 40px;
  /* padding: 0 40px; */
}

.title-icon {
  width: 100px;
  height: 100px;
  transform: translateY(2px);
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.8);
}

.view-more-container {
  position: absolute;
  right: 40px;
}

.view-more {
  font-size: 16px;
  color: #b8a0c8;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: 20px;
}

.view-more:hover {
  color: #9575b5;
  background: rgba(184, 160, 200, 0.1);
}

/* 背景透明化和紫色雾蒙 */
.relax-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 1;
}

.relax-section::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(149, 117, 181, 0.06);
  z-index: 2;
}

.photo-wall-container {
  position: relative;
  z-index: 3;
  width: 100%;
  overflow: hidden;
  padding: 20px 0;
  cursor: grab;
  user-select: none;
}

.photo-wall-container:active {
  cursor: grabbing;
}

.photo-wall {
  display: flex;
  gap: 30px;
  will-change: transform;
  padding: 0 15px;
}

.photo-card {
  flex-shrink: 0;
  width: 290px;
  transition: transform 0.3s ease;
}

.photo-card:hover {
  transform: translateY(-10px) scale(1.02);
}

.photo-frame {
  width: 100%;
  height: 380px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(149, 117, 181, 0.25);
  background: white;
  border: 3px solid rgba(255, 255, 255, 0.8);
  position: relative;
}

.photo-frame::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, #9575b5, #d4b8e0, #e5d4f0);
  border-radius: 16px;
  z-index: -1;
}

.photo-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}

.photo-card:hover .photo-frame img {
  transform: scale(1.1);
}

.photo-title {
  margin: 16px 0 0 0;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.8);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .relax-section {
    padding: 60px 0;
  }
  
  .photo-card {
    width: 240px;
  }
  
  .photo-frame {
    height: 320px;
  }
  
  .photo-title {
    font-size: 16px;
  }
}
</style>

