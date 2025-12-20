<template>
  <div class="video-carousel">
    <div class="carousel-container">
      <div
        v-for="(item, index) in carouselItems"
        :key="item.id"
        class="carousel-item"
        :class="{ 'is-active': activeIndex === index }"
        @mouseenter="handleMouseEnter(index)"
      >
        <!-- 浅紫色雾蒙层，只在非激活状态显示 -->
        <div class="overlay" :class="{ 'overlay-hidden': activeIndex === index }"></div>
        
        <!-- 图片 -->
        <img :src="item.image" :alt="item.title" class="carousel-image" />
        
        <!-- 文字内容 -->
        <div class="carousel-text" :class="{ 'text-bottom': activeIndex === index }">
          <span class="item-number">{{ item.number }}</span>
          <a :href="item.link" class="item-title" @click.prevent="handleLinkClick(item.link)">
            {{ item.title }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import com1 from '../assets/competition/com1.jpg';
import com2 from '../assets/competition/com2.jpg';
import com3 from '../assets/competition/com3.jpg';

// 默认激活第一张（索引0）
const activeIndex = ref(0);

// 轮播数据
const carouselItems = ref([
  {
    id: 1,
    number: '01.',
    title: '睿抗机器人开发者大赛',
    image: com1,
    link: '#/cooperation/campus'
  },
  {
    id: 2,
    number: '02.',
    title: '计算机系统能力大赛',
    image: com2,
    link: '#/cooperation/enterprise'
  },
  {
    id: 3,
    number: '03.',
    title: '中国大学生计算机设计大赛',
    image: com3,
    link: '#/cooperation/international'
  }
]);

// 鼠标进入时切换激活项
const handleMouseEnter = (index) => {
  activeIndex.value = index;
};

// 链接点击处理
const handleLinkClick = (link) => {
  console.log('点击链接:', link);
  // 这里可以添加路由跳转或其他逻辑
};
</script>

<style scoped>
.video-carousel {
  width: 100%;
  height: 100%;
  padding: 20px;
  z-index: 8;
}

.carousel-container {
  display: flex;
  gap: 12px;
  height: 100%;
  align-items: stretch;
}

.carousel-item {
  position: relative;
  /* border-radius: 12px; */
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  width: 200px;
  height: 450px;
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 激活状态：第一张或鼠标悬停的图片 */
.carousel-item.is-active {
  width: 450px;
  box-shadow: 0 8px 24px rgba(149, 117, 181, 0.3);
}

/* 图片 */
.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel-item:hover .carousel-image {
  transform: scale(1.05);
}

/* 浅紫色雾蒙层 */
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(149, 117, 181, 0.45);
  backdrop-filter: blur(2px);
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  pointer-events: none;
}

.overlay-hidden {
  opacity: 0;
}

/* 文字内容 */
.carousel-text {
  position: absolute;
  left: 30px;
  top: 30px;
  z-index: 2;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transform: translateY(0);
  transition: transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* 激活状态时文字在左下角 - 通过transform实现滑动 */
.carousel-text.text-bottom {
  transform: translateY(340px);
}

/* 激活状态时，文字可以完整显示，移除宽度限制 */
.carousel-text.text-bottom .item-title {
  max-width: none; /* 激活状态下不限制宽度，允许完整显示 */
  white-space: normal; /* 允许换行显示完整内容 */
  overflow: visible;
  text-overflow: clip;
}

.item-number {
  font-size: 32px;
  font-weight: 300;
  line-height: 1;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.item-title {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.2;
  color: white;
  text-decoration: none;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  display: inline-block;
  position: relative;
  white-space: nowrap; /* 防止换行 */
  overflow: hidden; /* 隐藏溢出内容 */
  text-overflow: ellipsis; /* 显示省略号 */
  max-width: 140px; /* 非激活状态下的最大宽度 */
}

.item-title::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: white;
  transition: width 0.3s ease;
}

.item-title:hover {
  color: #f5d9a8;
  transform: translateX(5px);
}

.item-title:hover::after {
  width: 100%;
}

/* 响应式调整 */
@media (max-width: 1400px) {
  .carousel-item {
    width: 180px;
    height: 400px;
  }
  
  .carousel-item.is-active {
    width: 480px;
  }
  
  .carousel-text.text-bottom {
    transform: translateY(310px);
  }
  
  .item-number {
    font-size: 28px;
  }
  
  .item-title {
    font-size: 24px;
    max-width: 120px; /* 响应式下的非激活状态宽度 */
  }
  
  .carousel-text.text-bottom .item-title {
    max-width: none; /* 激活状态下不限制宽度 */
  }
}

@media (max-width: 1200px) {
  .carousel-item {
    width: 150px;
    height: 350px;
  }
  
  .carousel-item.is-active {
    width: 400px;
  }
  
  .carousel-text {
    left: 20px;
    top: 20px;
  }
  
  .carousel-text.text-bottom {
    transform: translateY(270px);
  }
  
  .item-number {
    font-size: 24px;
  }
  
  .item-title {
    font-size: 20px;
    max-width: 100px; /* 响应式下的非激活状态宽度 */
  }
  
  .carousel-text.text-bottom .item-title {
    max-width: none; /* 激活状态下不限制宽度 */
  }
}

@media (max-width: 992px) {
  .carousel-container {
    flex-direction: column;
    gap: 10px;
  }
  
  .carousel-item {
    width: 100%;
    height: 200px;
  }
  
  .carousel-item.is-active {
    width: 100%;
    height: 300px;
  }
  
  .carousel-text.text-bottom {
    transform: translateY(130px);
  }
}
</style>

