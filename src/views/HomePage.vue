<template>
  <div class="home-page">
    <MouseFollower />

    <!-- 使用共享导航组件 -->
    <NavBar :transparent="isNavTransparent" :userInfo="userInfo" />

    <!-- 轮播图容器 -->
    <div class="hero-slides">
      <div
        class="slides-wrapper"
        :class="{ 'no-transition': !withTransition }"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        @transitionend="onTransitionEnd"
      >
        <div v-for="(img, i) in displaySlides" :key="i">
          <img :src="img" alt="轮播图" class="slide-img" />
        </div>
      </div>
    </div>

    <!-- Hero内容层（文字、按钮） -->
    <section id="hero" ref="heroRef" class="hero-content-layer">
      <div class="hero-overlay"></div>
      <div class="dino-group">
        <button
          v-for="(s, i) in slides"
          :key="`dino-${i}`"
          class="dino-btn"
          @click="goToSlide(i)"
          :title="`第${i + 1}张`"
        >
          🦖
        </button>
      </div>
    </section>

    <div 
    >
        <!-- Competition Section -->
        <section id="competition" class="section competition">
          <div class="section-inner">
            <div class="section-title-wrap">
              <div class="cube-small"><Competition class="title-icon" /></div>
              <h2 class="section-title">竞赛活动</h2>
            </div>

            <!-- 左右分栏布局 -->
            <div class="competition-layout">
              <!-- 左侧：竞赛咨询 -->
              <div
                class="competition-left animate__animated"
                ref="leftCompetition"
              >
                <!-- <CompetitionBorder> -->
                  <CompetitionConsultation />
                <!-- </CompetitionBorder> -->
              </div>

              <!-- 右侧：视频展示 -->
              <div class="competition-right">
                <!-- 风采一览文字（调整位置） -->
                <p class="style-display">风采一览</p>
                <div
                  class="video-carousel-wrap animate__animated"
                  ref="rightCompetition"
                >
                  <VideoCarousel />
                </div>
              </div>
            </div>
          </div>
        </section>

      <!-- Career Section -->
      <section id="career" class="section career">
        <div class="section-inner">
          <div class="section-title-wrap">
            <Shalou class="title-icon Shalou-near" />
            <h2 class="section-title">职业规划</h2>
          </div>
          
          <CareerPlanning />
        </div>
      </section>
    </div>
    
    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import Footer from '../components/Footer.vue';
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import MouseFollower from "../components/MouseFollower.vue";
import Shalou from "../components/Shalou.vue";
import pic1 from "../assets/pic_lb1.png";
import pic2 from "../assets/pic_lb2.png";
import pic3 from "../assets/pic_lb3.png";
import pic4 from "../assets/pic_lb4.png";
import background from "../assets/background.png";
import Competition from "../components/Competition.vue";
// import CompetitionBorder from "../components/Competition_border.vue";
import CompetitionConsultation from "../components/CompetitionConsultation.vue";
import VideoCarousel from "../components/VideoCarousel.vue";
import NavBar from "../components/NavBar.vue";
import CareerPlanning from "../components/CareerPlanning.vue";

export default {
  name: "HomePage",
  components: {
    MouseFollower,
    Competition,
    Shalou,
    // CompetitionBorder,
    CompetitionConsultation,
    VideoCarousel,
    NavBar,
    Footer,
    CareerPlanning,
  },
  setup() {
    const router = useRouter();
    const isNavTransparent = ref(true);
    const heroRef = ref(null);
    const currentIndex = ref(0);
    const withTransition = ref(true);
    const pendingTargetIndex = ref(null);
    let slideTimer = null;

    // 用户信息
    const userInfo = ref(null);

    // 左右元素的引用
    const leftCompetition = ref(null);
    const rightCompetition = ref(null);

    const slides = [pic4, pic2, pic3, pic1];
    

    const displaySlides = computed(() => {
      return slides.length > 0 ? [...slides, slides[0]] : [];
    });

    const currentSlide = computed(() => {
      if (!slides.length) return 0;
      return currentIndex.value % slides.length;
    });

    const goToSlide = (index) => {
      const cur = currentSlide.value;
      if (index === cur) return;
      withTransition.value = true;
      if (index > cur) {
        currentIndex.value = index;
        return;
      }
      pendingTargetIndex.value = index;
      currentIndex.value = slides.length;
    };

    const nextSlide = () => {
      withTransition.value = true;
      currentIndex.value += 1;
    };

    const prevSlide = () => {
      withTransition.value = true;
      if (currentIndex.value === 0) {
        withTransition.value = false;
        currentIndex.value = slides.length;
        requestAnimationFrame(() => {
          withTransition.value = true;
          currentIndex.value = slides.length - 1;
        });
      } else {
        currentIndex.value -= 1;
      }
    };

    const startAutoSlide = () => {
      stopAutoSlide();
      slideTimer = setInterval(nextSlide, 5000);
    };

    const stopAutoSlide = () => {
      if (slideTimer) {
        clearInterval(slideTimer);
        slideTimer = null;
      }
    };

    // 重置动画类
    const resetAnimations = () => {
      if (leftCompetition.value) {
        leftCompetition.value.classList.remove("animate__fadeInLeft");
      }
      if (rightCompetition.value) {
        rightCompetition.value.classList.remove("animate__fadeInRight");
      }
    };

    // 触发动画
    const triggerAnimations = () => {
      resetAnimations();
      // 强制重绘
      void leftCompetition.value?.offsetWidth;
      void rightCompetition.value?.offsetWidth;

      if (leftCompetition.value) {
        leftCompetition.value.classList.add("animate__fadeInLeft");
      }
      if (rightCompetition.value) {
        rightCompetition.value.classList.add("animate__fadeInRight");
      }
    };

    onMounted(() => {
      // 检查登录状态
      const storedUserInfo = localStorage.getItem('userInfo');
      if (!storedUserInfo) {
        // 未登录，跳转到登录页
        router.push('/login');
        return;
      }
      
      try {
        userInfo.value = JSON.parse(storedUserInfo);
        console.log('用户信息:', userInfo.value);
      } catch (error) {
        console.error('解析用户信息失败:', error);
        localStorage.removeItem('userInfo');
        router.push('/login');
        return;
      }

      // 导航栏透明度监听
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          isNavTransparent.value = entry.isIntersecting;
        },
        { threshold: 0.2 }
      );
      if (heroRef.value) observer.observe(heroRef.value);

      // 启动轮播
      startAutoSlide();

      // 监听竞赛活动区域可见性，每次进入视口都触发动画
      const competitionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting) {
            triggerAnimations();
          } else {
            resetAnimations();
          }
        },
        { threshold: 0.1 } // 可见区域达到10%即触发
      );

      const competitionSection = document.getElementById("competition");
      if (competitionSection) {
        competitionObserver.observe(competitionSection);
      }

      // 清理函数
      onUnmounted(() => {
        stopAutoSlide();
        if (observer && heroRef.value) observer.unobserve(heroRef.value);
        if (competitionObserver && competitionSection) {
          competitionObserver.unobserve(competitionSection);
        }
      });
    });

    const onTransitionEnd = () => {
      if (currentIndex.value === slides.length) {
        withTransition.value = false;
        currentIndex.value = 0;
        
        requestAnimationFrame(() => {
          // withTransition.value = true;
        });
      }
    };

    return {
      isNavTransparent,
      heroRef,
      currentSlide,
      currentIndex,
      nextSlide,
      prevSlide,
      goToSlide,
      withTransition,
      displaySlides,
      onTransitionEnd,
      slides,
      background,
      leftCompetition,
      rightCompetition,
      userInfo,
    };
  },
};
</script>

<style scoped>
/* 全局容器 - 背景图共用 */
.home-page {
  min-height: 100vh;
  background-color: #ffffff;
  position: relative;
  overflow-x: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}



/* 轮播图样式（全屏显示） */
.hero-slides {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  z-index: 1;
}

.slides-wrapper {
  display: flex;
  width: 100%;
  height: 100vh;
  transition: transform 1.5s ease;
  will-change: transform;
}

.no-transition {
  transition: none !important;
}

.slide-img {
  width: 98.9vw;
  height: 100vh;
  object-fit: cover;
  object-position: center;
}

/* Hero内容层 */
.hero-content-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 60px;
  box-sizing: border-box;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.25);
  z-index: 1;
}

.dino-group {
  position: absolute;
  right: 18px;
  bottom: 18px;
  z-index: 3;
  display: flex;
  gap: 10px;
}

.dino-btn {
  background: rgba(255, 255, 255, 0.28);
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  backdrop-filter: blur(6px);
  cursor: pointer;
  font-size: 20px;
  transition: background 0.2s ease;
}

.dino-btn:hover {
  background: rgba(255, 255, 255, 0.4);
}

/* 通用 section 样式 */
.section {
  padding: 60px 0;
  position: relative;
  z-index: 3;
}

.section-inner {
  max-width: 1200px;
  margin: 0 auto;
  /* padding: 0 20px; */
}

.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
}

.title-icon {
  width: 90px;
  height: 90px;
}

.cube-small {
  padding: -5px 22px 20px 0;
}

.section-title {
  font-size: 32px;
  font-weight: 800;
  color: #0b2a4a;
}

/* 竞赛板块样式 */
.competition {
  background: transparent; /* 移除单独背景，使用全局背景 */
  min-height: 600px;
}

/* 竞赛板块左右分栏布局 - 确保顶部对齐 */
.competition-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start; /* 顶部对齐 */
}

.competition-left {
  display: flex;
  flex-direction: column;
  opacity: 0; /* 初始隐藏 */
}

.competition-right {
  display: flex;
  flex-direction: column;
  position: relative; /* 为"风采一览"提供定位基准 */
}

/* 风采一览文字样式（调整到更高位置） */
.style-display {
  font-size: 24px; /* 比"竞赛活动"小（32px） */
  color: #6c5ce7; /* 蓝紫色 */
  font-weight: 600;
  margin: 0 0 20px 0;
  position: absolute;
  top: -50px; /* 更高的位置 */
  left: 0;
}

/* 视频轮播容器 - 确保与左侧文本框顶部对齐 */
.video-carousel-wrap {
  opacity: 0; /* 初始隐藏 */
  width: 100%;
}

/* 职业规划板块样式 - 共用全局背景 */
.career {
  background: transparent;
}

.Shalou-near {
  width: 120px;
  height: 120px;
  transform: translateY(2px);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .competition-layout {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .competition-left,
  .competition-right {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .competition-layout {
    gap: 20px;
  }

  .style-display {
    font-size: 20px;
    top: -40px;
  }

  .nav-left,
  .nav-right {
    width: 30%;
  }

  .nav-center {
    width: 40%;
    gap: 18px;
  }

  .hero-content-layer {
    padding-top: 50px;
  }
}
</style>