<template>
  <div class="home-page">
    <MouseFollower />
    <!-- <TriangleBackground class="triangle-background"/> -->
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
        <div v-for="(slide, i) in displaySlides" :key="i" class="slide-item">
          <img :src="slide.img" alt="轮播图" class="slide-img" />
          <div class="slide-text-overlay">
            <h1 class="slide-title">{{ slide.title }}</h1>
            <p class="slide-subtitle">{{ slide.subtitle }}</p>
          </div>
        </div>
      </div>
      <!-- 底部渐变遮罩层 -->
      <div class="hero-bottom-gradient"></div>
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
          <img src="../assets/dino.svg" alt="恐龙" class="dino-icon" />
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
                  <CompetitionConsultation class="competition-consultation"/>
                <!-- </CompetitionBorder> -->
              </div>

              <!-- 中间分隔线 -->
              <div class="competition-divider"></div>

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
            <span class="view-more-container"><a href="" class="view-more">查看更多-></a></span>
          </div>
          
          <CareerPlanning />
          <Guidaotu class="guidaotu-near" />
        </div>
      </section>

      <!-- Knowledge Photo Section -->
      <section id="knowledge" class="section knowledge-section">
        <KnowledgePhoto ref="knowledgePhotoRef" />
        <ChengzhangGuiji ref="chengzhangGuijiRef" />
      </section>

      <!-- Relax Section -->
      <section id="relax" class="section relax-section-wrap">
        <Relax />
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
import pic1 from "../assets/lunbotu/1.png";
import pic2 from "../assets/lunbotu/2.png";
import pic3 from "../assets/lunbotu/3.png";
import pic4 from "../assets/lunbotu/4.png";
import Competition from "../components/Competition.vue";
import CompetitionConsultation from "../components/CompetitionConsultation.vue";
import VideoCarousel from "../components/VideoCarousel.vue";
import Guidaotu from "../components/Guidaotu.vue";
import NavBar from "../components/NavBar.vue";
import CareerPlanning from "../components/CareerPlanning.vue";
import KnowledgePhoto from "../components/KnowledgePhoto.vue";
import ChengzhangGuiji from "../components/ChengzhangGuiji.vue";
import Relax from "../components/Relax.vue";
import Star from "../components/Star.vue";
import TriangleBackground from "../components/TriangleBackground.vue";
export default {
  name: "HomePage",
  components: {
    TriangleBackground,
    MouseFollower,
    Competition,
    Shalou,
    KnowledgePhoto,
    ChengzhangGuiji,
    Relax,
    // CompetitionBorder,
    CompetitionConsultation,
    VideoCarousel,
    NavBar,
    Guidaotu,
    Footer,
    CareerPlanning,
    Star,
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
    
    // 厚积薄发和成长轨迹组件的引用
    const knowledgePhotoRef = ref(null);
    const chengzhangGuijiRef = ref(null);

    const slides = [
      { 
        img: pic3, 
        title: "“砚湖之韵 理迎新声”", 
        subtitle: `璀璨的星光，点亮青春的梦想
                   激昂的旋律，奏响奋进的乐章`
      },
      { 
        img: pic2, 
        title: `我们从同样的起点出发
                   走向不同的未来`, 
        subtitle: `学位帽抛向天空的瞬间
                    把说不出口的舍不得
                       都藏进了风里` 
      },
      { 
        img: pic1, 
        title: "迷彩青春，当“燃”开场!!!", 
        subtitle: `我们目光坚定，我们朝气蓬勃
以山海为志，赴青春之约
此刻整装，迈向崭新篇章` 
      },
      { 
        img: pic4, 
        title: "邂逅古老智慧，构想新颖创意", 
        subtitle: `手中的笔尖
在书中挥舞
描绘出知识的轮廓
图书馆在光影的渲染下更显得庄重和古朴` 
      }
    ];
    

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

      // 记录滚动位置和状态，用于判断滚动方向
      let lastScrollY = window.scrollY;
      let titleWasVisible = false;
      let scrollDirection = 'none'; // 'up', 'down', 'none'
      
      // 持续监听滚动，更新滚动位置和方向
      const handleScroll = () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY) {
          scrollDirection = 'down';
        } else if (currentScrollY < lastScrollY) {
          scrollDirection = 'up';
        }
        lastScrollY = currentScrollY;
      };
      
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      // 监听"成长轨迹"标题可见性，只在从不可见变为可见时触发动画（且是向下滚动）
      const chengzhangTitleObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          const isCurrentlyVisible = entry.isIntersecting;
          
          // 只在从不可见变为可见时触发（第一次看到标题）
          if (isCurrentlyVisible && !titleWasVisible) {
            // 检测滚动方向：只有向下滚动时才触发动画
            if (scrollDirection === 'down' && chengzhangGuijiRef.value?.timelineWrapper) {
              // 重置动画类
              chengzhangGuijiRef.value.timelineWrapper.classList.remove("animate__flipInX");
              // 强制重绘，确保动画能重新触发
              void chengzhangGuijiRef.value.timelineWrapper.offsetWidth;
              // 触发动画
              chengzhangGuijiRef.value.timelineWrapper.classList.add("animate__flipInX");
            }
          }
          
          if (!isCurrentlyVisible) {
            // 离开视口时移除动画类，确保下次进入时能重新触发
            if (chengzhangGuijiRef.value?.timelineWrapper) {
              chengzhangGuijiRef.value.timelineWrapper.classList.remove("animate__flipInX");
            }
          }
          
          // 更新状态
          titleWasVisible = isCurrentlyVisible;
        },
        { threshold: 0.1 }
      );

      // 查找"成长轨迹"标题元素
      setTimeout(() => {
        const chengzhangTitle = document.querySelector('.chengzhang-guiji .section-title');
        if (chengzhangTitle) {
          chengzhangTitleObserver.observe(chengzhangTitle);
        }
      }, 100);

      // 监听"厚积薄发"标题可见性，触发左右部分动画
      const knowledgeTitleObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && knowledgePhotoRef.value) {
            // 重置左侧动画
            if (knowledgePhotoRef.value.knowledgeLeftPart) {
              knowledgePhotoRef.value.knowledgeLeftPart.classList.remove("animate__backInLeft");
              void knowledgePhotoRef.value.knowledgeLeftPart.offsetWidth;
              knowledgePhotoRef.value.knowledgeLeftPart.classList.add("animate__backInLeft");
            }
            // 重置右侧动画
            if (knowledgePhotoRef.value.knowledgeRightPart) {
              knowledgePhotoRef.value.knowledgeRightPart.classList.remove("animate__backInRight");
              void knowledgePhotoRef.value.knowledgeRightPart.offsetWidth;
              knowledgePhotoRef.value.knowledgeRightPart.classList.add("animate__backInRight");
            }
          } else {
            // 离开视口时移除动画类，确保下次进入时能重新触发
            if (knowledgePhotoRef.value?.knowledgeLeftPart) {
              knowledgePhotoRef.value.knowledgeLeftPart.classList.remove("animate__backInLeft");
            }
            if (knowledgePhotoRef.value?.knowledgeRightPart) {
              knowledgePhotoRef.value.knowledgeRightPart.classList.remove("animate__backInRight");
            }
          }
        },
        { threshold: 0.1 }
      );

      // 查找"厚积薄发"标题元素
      setTimeout(() => {
        const knowledgeTitle = document.querySelector('.knowledge-photo .section-title');
        if (knowledgeTitle) {
          knowledgeTitleObserver.observe(knowledgeTitle);
        }
      }, 100);

      // 清理函数
      onUnmounted(() => {
        stopAutoSlide();
        if (observer && heroRef.value) observer.unobserve(heroRef.value);
        if (competitionObserver && competitionSection) {
          competitionObserver.unobserve(competitionSection);
        }
        window.removeEventListener('scroll', handleScroll);
        const chengzhangTitle = document.querySelector('.chengzhang-guiji .section-title');
        if (chengzhangTitle && chengzhangTitleObserver) {
          chengzhangTitleObserver.unobserve(chengzhangTitle);
        }
        const knowledgeTitle = document.querySelector('.knowledge-photo .section-title');
        if (knowledgeTitle) {
          knowledgeTitleObserver.unobserve(knowledgeTitle);
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
      // background,
      leftCompetition,
      rightCompetition,
      userInfo,
      knowledgePhotoRef,
      chengzhangGuijiRef,
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
.triangle-background{
  z-index: 4;
}


/* 轮播图样式（全屏显示） */
.hero-slides {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  z-index: 6;
}

/* 轮播图底部渐变遮罩层 */
.hero-bottom-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.3),
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0)
  );
  z-index: 10;
  pointer-events: none;
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

.slide-item {
  position: relative;
  width: 98.9vw;
  height: 100vh;
  flex-shrink: 0;
}

.slide-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.slide-text-overlay {
  position: absolute;
  left: 60px;
  top: 80%;
  transform: translateY(-50%);
  z-index: 10;
  pointer-events: none;
}

.slide-title {
  font-size: 40px;
  font-weight: 700;
  color: #FFD700;
  margin: 0 0 12px 0;
  line-height: 1.2;
  letter-spacing: 2px;
  white-space: pre-line;
}

.slide-subtitle {
  font-size: 28px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
  line-height: 1.4;
  letter-spacing: 1px;
  white-space: pre-line;
  /* text-align: center; */
}

/* Hero内容层 */
.hero-content-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 7;
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
  background: rgba(255, 255, 255,0.5);
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  backdrop-filter: blur(6px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.dino-btn:hover {
  background: rgba(255, 255, 255, 0.9);
}

.dino-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
  pointer-events: none;
}

/* 通用 section 样式 */
.section {
  /* padding: 30px 0; */
  position: relative;
  z-index: 3;
}

.section-inner {
  /* max-width: 1200px; */
  margin: 0 auto;
  /* padding: 0 20px; */
  position: relative;
  z-index: 3; /* 确保内容在蒙层之上 */
}

.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
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
  position: relative;
  min-height: 600px;
  padding: 30px 0;

}

/* 背景透明化和紫色雾蒙 */
.competition::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 1;
}

.competition::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(149, 117, 181, 0.08);
  z-index: 2;
}

/* 竞赛板块左右分栏布局 - 确保顶部对齐 */
.competition-layout {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 24px;
  align-items: start; /* 顶部对齐 */
  position: relative;
}

/* 中间分隔线 */
.competition-divider {
  width: 1px;
  height: 400px;
  border-left: 2px dashed #fff; /* 浅紫色虚线 */
  align-self: center; /* 垂直居中 */
}

.competition-left {
  display: flex;
  flex-direction: column;
  opacity: 0; /* 初始隐藏 */
}
.competition-consultation{
  z-index: 6;
}

.competition-right {
  display: flex;
  flex-direction: column;
  position: relative; /* 为"风采一览"提供定位基准 */
}

/* 风采一览文字样式（调整到更高位置） */
.style-display {
  font-size: 24px; /* 比"竞赛活动"小（32px） */
  color: #b8a0c8; /* 蓝紫色 */
  font-weight: 600;
  margin: 0 0 20px 0;
  position: absolute;
  top: -30px; /* 更高的位置 */
  right: 40px;
  box-shadow:  7px 7px white,12px 12px 3px #cfc2d8;
}

/* 视频轮播容器 - 确保与左侧文本框顶部对齐 */
.video-carousel-wrap {
  opacity: 0; /* 初始隐藏 */
  width: 100%;
  height: 500px;
  display: flex;
  align-items: center;
}

/* 职业规划板块样式 - 共用全局背景 */
.career {
  background: transparent;
  position: relative;
  /* padding: 30px 0; */
}

/* 背景透明化和紫色雾蒙 - 与厚积薄发板块保持一致 */
.career::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 1;
  pointer-events: none; /* 确保不阻挡交互 */
}

.career::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(149, 117, 181, 0.08);
  z-index: 2;
  pointer-events: none; /* 确保不阻挡交互 */
}

/* 厚积薄发板块样式（与成长轨迹共用背景） */
.knowledge-section {
  /* background-image: url("../assets/background/knowledgePhoto.png"); */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  padding: 0;
  margin: 0;
}

/* 背景透明化和紫色雾蒙 */
.knowledge-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 1;
}

.knowledge-section::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(149, 117, 181, 0.08);
  z-index: 2;
}

/* 闲暇时光板块样式 */
.relax-section-wrap {
  background: transparent;
  padding: 0;
  margin: 0;
}

.Shalou-near {
  width: 100px;
  height: 100px;
  transform: translateY(2px);
}
.view-more-container {
  position: absolute;
  right: 0;
}
.view-more {
  font-size: 16px;
  color: #b8a0c8;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: 20px;
}
.guidaotu-near{
  z-index: 10;
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

  .slide-text-overlay {
    left: 50px;
  }

  .slide-title {
    font-size: 48px;
  }

  .slide-subtitle {
    font-size: 22px;
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

  .slide-text-overlay {
    left: 30px;
  }

  .slide-title {
    font-size: 36px;
  }

  .slide-subtitle {
    font-size: 18px;
  }
}
</style>
