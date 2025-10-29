<template>
    <div class="carousel-container" @mouseenter="stopCarousel" @mouseleave="startCarousel">
      <div class="carousel-wrapper" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
        <div
          class="carousel-item"
          v-for="(item, index) in carouselItems"
          :key="index"
        >
          <div class="media-container">
            <video
              v-if="item.type === 'video'"
              :src="item.mediaUrl"
              class="media"
              ref="videos"
              autoplay
              loop
              muted
              playsinline
            ></video>
            <img
              v-else
              :src="item.mediaUrl"
              class="media"
              alt="carousel content"
              ref="images"
            />
          </div>
          <div class="indicators-container">
            <div class="indicators">
              <span
                v-for="(item, idx) in carouselItems"
                :key="idx"
                :class="{ 'active': currentIndex === idx }"
                @click="goToIndex(idx)"
              ></span>
            </div>
          </div>
          <a :href="item.textLink" target="_blank" class="text-link">
            {{ item.text }}
          </a>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        carouselItems: [
          {
            type: 'video',
            mediaUrl: 'https://cdn2.pilc.com.cn/video/promo_video.mp4',
            text: '中国国际大学生创新大赛为青年大学生提供了一个锻炼和展示自己的平台，促进了目标导向与问题导向的科研发展，加速了科学发现与技术创新的融合，激发了青年才俊无限的创新活力。',
            textLink: 'https://www.pilcchina.org/home',
          },
          {
            type: 'video',
            mediaUrl: 'https://os.educg.net/media/homeMp4.53c9282e.mp4',
            text: '自计算机系统能力大赛开始以来大批参赛学生通过竞赛的训练，专业能力持续提升，具备了设计CPU、操作系统、编译系统、数据库管理系统等的初步能力，并在毕业后投身相关领域的学术研究和产业建设。',
            textLink: 'https://os.educg.net/#/',
          },
          {
            type: 'image',
            mediaUrl: 'https://obs-2022-04-08.obs.cn-north-1.myhuaweicloud.com/public/picture/2021/12473360.jpg',
            text: '全国大学生信息安全竞赛是一项公益性大学生科技活动，目的在于宣传信息安全知识；培养大学生的创新精神、团队合作意识；扩大大学生的科学视野，提高大学生的创新设计能力、综合设计能力和信息安全意识。',
            textLink: 'http://www.ciscn.cn/',
          },
        ],
        currentIndex: 0,
        carouselTimer: null,
        videoHeight: 0
      };
    },
    mounted() {
      this.startCarousel();
      this.$nextTick(() => {
        this.setMediaHeight();
      });
    },
    beforeDestroy() {
      this.stopCarousel();
    },
    methods: {
      startCarousel() {
        this.carouselTimer = setInterval(() => {
          this.currentIndex = (this.currentIndex + 1) % this.carouselItems.length;
        }, 3000);
      },
      stopCarousel() {
        clearInterval(this.carouselTimer);
      },
      goToIndex(index) {
        this.currentIndex = index;
      },
      setMediaHeight() {
        const firstVideo = this.$refs.videos?.[0];
        if (firstVideo) {
          firstVideo.addEventListener('loadedmetadata', () => {
            this.videoHeight = firstVideo.offsetHeight;
            this.$refs.images?.forEach(img => {
              img.style.height = `${this.videoHeight}px`;
            });
          });
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .carousel-container {
    position: relative;
    width: 600px;
    max-width: 1400px;
    margin: 0 auto;
    overflow: hidden;
  }
  
  .carousel-wrapper {
    display: flex;
    transition: transform 0.6s ease-in-out;
  }
  
  .carousel-item {
    width: 100%;
    flex-shrink: 0;
    padding: 0 10px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }
  
  .media-container {
    width: 100%;
    overflow: hidden;
    border-radius: 6px;
  }
  
  .media {
    width: 100%;
    display: block;
    object-fit: cover;
    transition: transform 0.4s ease;
  }
  
  .media-container:hover .media {
    transform: scale(1.03);
  }
  
  .indicators-container {
    display: flex;
    justify-content: center;
    margin: 10px 0;
  }
  
  .indicators {
    display: flex;
    gap: 8px;
  }
  
  .indicators span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid #ccc;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .indicators span.active {
    background-color: #007bff;
    border-color: #007bff;
  }
  
  .text-link {
    display: block;
    color: #333;
    text-decoration: none;
    font-size: 15px;
    line-height: 1.6;
    padding: 0 10px;
    transition: color 0.3s;
  }
  
  .text-link:hover {
    color: #2c7ad6;
    text-decoration: underline;
  }
  
  video::-webkit-media-controls {
    display: none !important;
  }
  video {
    -webkit-appearance: none;
    appearance: none;
  }
  </style>