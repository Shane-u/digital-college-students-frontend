<template>
  <div class="video-carousel-container">
    <div class="carousel-header">
      <h3 class="carousel-title">视频展示</h3>
      <span class="carousel-subtitle">(轮播, 可参考以下)</span>
    </div>
    <div class="divider"></div>
    
    <div class="video-carousel" ref="carouselRef">
      <div 
        class="video-slides"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div 
          v-for="video in videoList" 
          :key="video.id"
          class="video-slide"
        >
          <div class="video-thumbnail">
            <img :src="video.thumbnail" :alt="video.title" />
            <div class="video-overlay">
              <div class="play-button">▶</div>
              <div class="video-duration">{{ video.duration }}</div>
            </div>
          </div>
          <div class="video-info">
            <h4 class="video-title">{{ video.title }}</h4>
            <p class="video-subtitle">{{ video.subtitle }}</p>
          </div>
        </div>
      </div>
      
      <!-- 轮播控制点 -->
      <div class="carousel-dots">
        <button 
          v-for="(video, index) in videoList" 
          :key="`dot-${index}`"
          class="dot"
          :class="{ active: currentIndex === index }"
          @click="goToSlide(index)"
        ></button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { competitionApi } from '../api/competitionApi.js';

export default {
  name: 'VideoCarousel',
  setup() {
    const videoList = ref([]);
    const currentIndex = ref(0);
    const carouselRef = ref(null);
    let autoPlayTimer = null;

    const fetchVideoList = async () => {
      try {
        const response = await competitionApi.getVideoList();
        if (response.code === 200) {
          videoList.value = response.data;
        }
      } catch (error) {
        console.error('获取视频列表失败:', error);
      }
    };

    const goToSlide = (index) => {
      currentIndex.value = index;
    };

    const nextSlide = () => {
      currentIndex.value = (currentIndex.value + 1) % videoList.value.length;
    };

    const startAutoPlay = () => {
      stopAutoPlay();
      autoPlayTimer = setInterval(nextSlide, 4000); // 每4秒切换
    };

    const stopAutoPlay = () => {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    };

    onMounted(() => {
      fetchVideoList().then(() => {
        if (videoList.value.length > 0) {
          startAutoPlay();
        }
      });
    });

    onUnmounted(() => {
      stopAutoPlay();
    });

    return {
      videoList,
      currentIndex,
      carouselRef,
      goToSlide
    };
  }
};
</script>

<style scoped>
.video-carousel-container {
  width: 100%;
  height: 100%;
  padding: 20px;
  background: transparent;
  box-sizing: border-box;
}

.carousel-header {
  margin-bottom: 15px;
}

.carousel-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 5px 0;
}

.carousel-subtitle {
  font-size: 12px;
  color: #666;
  font-style: italic;
}

.divider {
  width: 100%;
  height: 1px;
  background: #e0e0e0;
  border: none;
  margin: 0 0 20px 0;
}

.video-carousel {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
}

.video-slides {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease-in-out;
}

.video-slide {
  min-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f5f5;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-thumbnail:hover .video-overlay {
  opacity: 1;
}

.play-button {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.play-button:hover {
  transform: scale(1.1);
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}

.video-info {
  flex: 1;
  padding: 0 5px;
}

.video-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.video-subtitle {
  font-size: 12px;
  color: #666;
  margin: 0;
  line-height: 1.3;
}

.carousel-dots {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: background 0.3s ease;
}

.dot.active {
  background: #AF40FF;
}

.dot:hover {
  background: rgba(255, 255, 255, 0.8);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .video-carousel-container {
    padding: 15px;
  }
  
  .video-carousel {
    height: 180px;
  }
  
  .video-thumbnail {
    height: 100px;
  }
  
  .carousel-title {
    font-size: 16px;
  }
  
  .video-title {
    font-size: 13px;
  }
  
  .video-subtitle {
    font-size: 11px;
  }
}
</style>
