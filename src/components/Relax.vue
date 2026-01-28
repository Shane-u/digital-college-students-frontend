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
          @mouseenter="handleCardEnter"
          @mouseleave="handleCardLeave"
        >
          <div class="photo-inner">
            <div class="photo-face photo-front">
              <div class="photo-frame">
                <img :src="photo.image" :alt="photo.title" />
              </div>
            </div>
            <div class="photo-face photo-back">
              <div class="back-content">
                <p class="back-title">{{ photo.title }}</p>
                <p class="back-desc">{{ photo.description }}</p>
              </div>
            </div>
          </div>
          <p class="photo-title">{{ photo.title }}</p>
        </div>
        
        <!-- 第二组照片（克隆用于无缝循环） -->
        <div 
          v-for="(photo, index) in photos" 
          :key="`photo-2-${index}`"
          class="photo-card"
          @mouseenter="handleCardEnter"
          @mouseleave="handleCardLeave"
        >
          <div class="photo-inner">
            <div class="photo-face photo-front">
              <div class="photo-frame">
                <img :src="photo.image" :alt="photo.title" />
              </div>
            </div>
            <div class="photo-face photo-back">
              <div class="back-content">
                <p class="back-title">{{ photo.title }}</p>
                <p class="back-desc">{{ photo.description }}</p>
              </div>
            </div>
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
  { image: new URL('../assets/relax/640.png', import.meta.url).href, title: '二仙桥公园', description: '“到二仙桥，走成华大道！”校园附近还有座二仙桥公园，这是一座由铁路遗址改造而来的现代公园，保留了铁轨、绿皮火车等工业符号，在这里随手一拍就是复古工业风大片！。' },
  { image: new URL('../assets/relax/640 (1).png', import.meta.url).href, title: '春熙路', description: '春熙路的IFS、伊藤洋华堂、王府井百货、亨得利是成都最为繁华的商圈，春熙路可是剁手党的“购物天堂”呀！' },
  { image: new URL('../assets/relax/640 (2).png', import.meta.url).href, title: '成都自然博物馆', description: '成都自然博物馆（成都理工大学博物馆）蔚然矗立，这是西南地区建筑体量最大的自然博物馆，藏品6万多件，数量种类均居中国各大学博物馆前列。' },
  { image: new URL('../assets/relax/640 (3).png', import.meta.url).href, title: '东郊记忆', description: '东郊记忆，这处由工业遗址改造而成的潮流街区，如今成为了年轻人们的游乐天堂。一间间时尚品牌店铺，吸引着源源不断的人们到此触摸成都的潮流脉搏。' },
  { image: new URL('../assets/relax/640 (4).png', import.meta.url).href, title: '成都东区音乐公园', description: '这里的建筑风格既保留了工业时代的传统，又增添了不一young的音乐时尚，不仅可以感受到音乐带给心灵的美好，也深深地被文化时代变迁所深深地震撼，这里的房屋结合了计划经济时代工业美学与现代商业建筑功能，兼容并蓄了20世纪50年代苏联援建的办公楼、21世纪初的办公楼、多层厂房和工业感十足的烟囱管道，营造了东郊记忆兼具怀旧和时尚气息的艺术氛围。' },
  { image: new URL('../assets/relax/640 (5).png', import.meta.url).href, title: '音乐小酒馆（咖啡屋）', description: '有一个地方，一年四季都是一个温度，有一扇门，风吹日晒都为你敞开，东郊记忆的音乐小酒馆（咖啡屋），愿意成为你的避风塘~小青梅去过几家，每一家都是不一样的风格哦！有温馨甜蜜的漫画风，有神秘韵味的复古风，有潮牌流行的欧美风……在这里你一定可以找到属于自己的风格！' },
  { image: new URL('../assets/relax/640 (6).png', import.meta.url).href, title: '建设路', description: '琳琅满目的小吃，巷子虽窄，香气却浓，都说真正好吃的地方都朴素，相比于宽窄巷子里的天价菜品，小吃一条街不仅价廉，味也更香，本地人谁去宽窄巷子吃饭啊，俗话说得好：“美食都在深巷里”' },
  { image: new URL('../assets/relax/640 (7).png', import.meta.url).href, title: '理工东苑', description: '理工东苑永远飘着一股惹人嘴馋的味道，东苑离新教不远。从新教学楼一路走过来，你会看到茶百道，书亦烧仙草等奶茶店。每到饭点一定会满座的五谷渔粉，滋滋作响的纸包鱼，咕噜咕噜翻滚着的火锅串串鸡公煲，滋滋发出声响的烤肉,一滴热油顺着饱满的肉的纹路慢慢滑下,令人心醉，香气四溢的冒菜伴着满街的吆喝声，不停上菜的服务员的步伐，意外的和谐。东苑除了这些硬菜，还有良品铺子，前不久新开的面包店，里面的欧包真的可以和网红店媲美，东苑的超市总是人头攒动。' },
  { image: new URL('../assets/relax/640 (8).png', import.meta.url).href, title: '铁建广场', description: '铁建广场是离成理最近的购物休闲一体化的服务型广场。入眼可见的网红书店当当书店，还有星巴克，屈臣氏，万达影院等休闲娱乐的地方。' }
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
  pauseAutoScrolling();
  startX = e.pageX;
  scrollLeft = scrollPosition;
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
    resumeAutoScrolling();
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

const pauseAutoScrolling = () => {
  if (!autoScrolling) return;
  autoScrolling = false;
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
};

const resumeAutoScrolling = () => {
  if (isDragging) return;
  if (autoScrolling) return;
  autoScrolling = true;
  animate();
};

const handleCardEnter = () => {
  pauseAutoScrolling();
};

const handleCardLeave = () => {
  resumeAutoScrolling();
};
</script>

<style scoped>
.relax-section {
  width: 100%;
  min-height: 500px;
  position: relative;
  /* background-image: url('../assets/background/image.png'); */
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
  perspective: 1200px;
  cursor: pointer;
}

.photo-card:hover {
  transform: translateY(-10px) scale(1.02);
}

.photo-inner {
  position: relative;
  width: 100%;
  height: 380px;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.photo-card:hover .photo-inner {
  transform: rotateY(180deg);
}

.photo-face {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  overflow: hidden;
  backface-visibility: hidden;
  box-shadow: 0 8px 30px rgba(149, 117, 181, 0.25);
  border: 3px solid rgba(255, 255, 255, 0.8);
}

.photo-front {
  background: #fff;
}

.photo-frame {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
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
  transform: scale(1.05);
}

.photo-back {
  background: #fff;
  transform: rotateY(180deg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.back-content {
  text-align: center;
  color: #2c3e50;
  line-height: 1.6;
}

.back-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
}

.back-desc {
  font-size: 14px;
  color: #5c6b7a;
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

