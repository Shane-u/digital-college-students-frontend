<template>
  <div class="home-page">
    <MouseFollower />

    <!-- 使用共享导航组件 -->
    <NavBar :transparent="isNavTransparent" />

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
      :style="{ 
        backgroundImage: `url(${background})`,
        backgroundRepeat: 'no-repeat',  // 不重复
        backgroundSize: 'cover',         // 撑满容器
        backgroundPosition: 'center'     // 居中显示
      }"
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
                <CompetitionBorder>
                  <CompetitionConsultation />
                </CompetitionBorder>
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
          
          <div class="career-showcase">
            <!-- 右侧大图和介绍 -->
            <div class="career-featured">
              <div class="career-featured-content">
                <h3 class="featured-name">{{ activeCareer.name }}</h3>
                <p class="featured-desc">{{ activeCareer.description }}</p>
              </div>
              <router-link :to="activeCareer.link" class="career-featured-circle">
                <img :src="knowledgePic" alt="知识图" class="career-featured-image" />
              </router-link>
            </div>
            
            <!-- 左下角小图阵列 -->
            <div class="career-path">
              <router-link 
                v-for="(career, index) in displayedCareers" 
                :key="`${career.id}-${currentCarouselIndex}`"
                :to="career.link" 
                :style="getPositionStyle(index)" 
                :class="['career-circle-small', {'career-circle-active': index === 0}]"
                @click.prevent="setActiveCareer(career.id)"
              >
                <img :src="career.image" :alt="career.title" class="career-image" />
              </router-link>
            </div>
          </div>
          
          <!-- 导航按钮 -->
          <div class="career-nav">
            <button class="career-nav-btn prev" @click="prevCareerSlide" aria-label="Previous">&lt;</button>
            <div class="career-dots">
              <button 
                v-for="page in totalPages" 
                :key="page"
                @click="goToCareerPage(page - 1)"
                :class="{ 'active': currentCareerPage === page - 1 }"
                class="career-dot-btn"
                :aria-label="`Go to page ${page}`"
              ></button>
            </div>
            <button class="career-nav-btn next" @click="nextCareerSlide" aria-label="Next">&gt;</button>
          </div>
        </div>
      </section>
    </div>
    
    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import Footer from '../components/Footer.vue';
import { ref, onMounted, onUnmounted, computed, onBeforeMount } from "vue";
import MouseFollower from "../components/MouseFollower.vue";
import Shalou from "../components/Shalou.vue";
import pic1 from "../assets/pic_lb1.png";
import pic2 from "../assets/pic_lb2.png";
import pic3 from "../assets/pic_lb3.png";
import pic4 from "../assets/pic_lb4.png";
import background from "../assets/background.png";
import knowledgePic from "../assets/knowledge_pic.png";
import Competition from "../components/Competition.vue";
import CompetitionBorder from "../components/Competition_border.vue";
import CompetitionConsultation from "../components/CompetitionConsultation.vue";
import VideoCarousel from "../components/VideoCarousel.vue";
import NavBar from "../components/NavBar.vue";

export default {
  name: "HomePage",
  components: {
    MouseFollower,
    Competition,
    Shalou,
    CompetitionBorder,
    CompetitionConsultation,
    VideoCarousel,
    NavBar,
    Footer,
  },
  setup() {
    const isNavTransparent = ref(true);
    const heroRef = ref(null);
    const currentIndex = ref(0);
    const withTransition = ref(true);
    const pendingTargetIndex = ref(null);
    let slideTimer = null;

    // 左右元素的引用
    const leftCompetition = ref(null);
    const rightCompetition = ref(null);

    const slides = [pic4, pic2, pic3, pic1];
    
    // 职业规划轮播图数据 - 增加到10个
    const careers = ref([
      { id: 1, title: "职业名称1", name: "SimoneBaldi", description: "科研，让生活更美好", image: pic1, link: "/career/1" },
      { id: 2, title: "职业名称2", name: "数据科学家", description: "通过数据分析解决实际问题", image: pic2, link: "/career/2" },
      { id: 3, title: "职业名称3", name: "人工智能专家", description: "探索AI技术的前沿与应用", image: pic3, link: "/career/3" },
      { id: 4, title: "职业名称4", name: "软件工程师", description: "构建未来的数字世界", image: pic4, link: "/career/4" },
      { id: 5, title: "职业名称5", name: "网络安全专家", description: "保护数字世界的安全防线", image: pic1, link: "/career/5" },
      { id: 6, title: "职业名称6", name: "云计算架构师", description: "设计高效可扩展的云服务", image: pic2, link: "/career/6" },
      { id: 7, title: "职业名称7", name: "区块链开发者", description: "构建去中心化的未来", image: pic3, link: "/career/7" },
      { id: 8, title: "职业名称8", name: "量子计算研究员", description: "探索计算的下一个前沿", image: pic4, link: "/career/8" },
      { id: 9, title: "职业名称9", name: "生物信息学家", description: "连接生物学与信息技术", image: pic1, link: "/career/9" },
      { id: 10, title: "职业名称10", name: "机器学习工程师", description: "让机器更智能，更懂人类", image: pic2, link: "/career/10" }
    ]);
    
    // 职业轮播相关变量
    const activeCareerIndex = ref(0); // 当前激活的职业索引
    const currentCareerPage = ref(0); // 当前页面
    const careersPerPage = 5; // 每页显示5个职业
    const currentCarouselIndex = ref(0); // 当前轮播位置索引
    let careerTimer = null;
    
    // 计算当前显示的职业（轮播模式）
    const displayedCareers = computed(() => {
      const result = [];
      for (let i = 0; i < careersPerPage; i++) {
        const index = (currentCarouselIndex.value + i) % careers.value.length;
        result.push(careers.value[index]);
      }
      return result;
    });
    
    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(careers.value.length / careersPerPage);
    });
    
    // 计算当前活跃的职业
    const activeCareer = computed(() => {
      return careers.value[activeCareerIndex.value] || careers.value[0];
    });
    
    // 设置当前活跃的职业
    const setActiveCareer = (id) => {
      const index = careers.value.findIndex(career => career.id === id);
      if (index !== -1) {
        activeCareerIndex.value = index;
      }
    };
    
    // 职业轮播导航方法
    const nextCareerSlide = () => {
      currentCarouselIndex.value = (currentCarouselIndex.value + 1) % careers.value.length;
      // 设置第一个显示的职业为激活状态
      activeCareerIndex.value = currentCarouselIndex.value;
    };
    
    const prevCareerSlide = () => {
      currentCarouselIndex.value = currentCarouselIndex.value === 0 
        ? careers.value.length - 1 
        : currentCarouselIndex.value - 1;
      // 设置第一个显示的职业为激活状态
      activeCareerIndex.value = currentCarouselIndex.value;
    };
    
    const goToCareerPage = (pageIndex) => {
      currentCareerPage.value = pageIndex;
      // 设置当前页的第一个职业为激活状态
      activeCareerIndex.value = currentCareerPage.value * careersPerPage;
    };
    
    // 获取每个小圆圈的位置样式
    const getPositionStyle = (index) => {
      // 创建一条从左上到右下的曲线路径，并增大间距
      const positions = [
        { top: '5%', left: '0%' },
        { top: '30%', left: '15%' },
        { top: '50%', left: '30%' },
        { top: '75%', left: '50%' },
        { top: '95%', left: '70%' }
      ];
      
      const pos = positions[index] || positions[0];
      
      return {
        top: pos.top,
        left: pos.left
      };
    };
    
    // 判断某个职业是否为激活状态（在轮播中第一个位置）
    const isActiveCareer = (career) => {
      return career.id === activeCareer.id;
    };
    
    // 启动职业轮播自动播放
    const startCareerAutoSlide = () => {
      stopCareerAutoSlide();
      careerTimer = setInterval(() => {
        nextCareerSlide();
      }, 6000);
    };
    
    const stopCareerAutoSlide = () => {
      if (careerTimer) {
        clearInterval(careerTimer);
        careerTimer = null;
      }
    };

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
      // 启动职业轮播
      startCareerAutoSlide();

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
        stopCareerAutoSlide();
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
      // 职业轮播相关
      careers,
      activeCareer,
      displayedCareers,
      totalPages,
      currentCareerPage,
      currentCarouselIndex,
      nextCareerSlide,
      prevCareerSlide,
      goToCareerPage,
      getPositionStyle,
      setActiveCareer,
      isActiveCareer,
      knowledgePic
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

/* 导航栏下拉菜单样式 */
.nav-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 150px;
  background-color: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  border-radius: 4px;
  padding: 8px 0;
}

.dropdown-item {
  display: block;
  padding: 10px 20px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  text-align: left;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
  color: #3b82f6;
}

.nav-dropdown:hover .dropdown-menu {
  display: block;
}

/* 导航栏样式 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: linear-gradient(
    to bottom,
    rgba(30, 132, 248, 0.55),
    rgba(81, 163, 251, 0.28),
    rgba(134, 187, 248, 0)
  );
  box-shadow: none;
  transition: background 0.5s ease, box-shadow 0.4s ease;
}

.navbar-transparent {
  background: linear-gradient(
    to bottom,
    rgba(30, 132, 248, 0.55),
    rgba(81, 163, 251, 0.28),
    rgba(134, 187, 248, 0)
  );
  box-shadow: none;
}

.nav-inner {
  padding: 14px 20px;
  display: flex;
  align-items: center;
}

.nav-left {
  width: 25%;
  display: flex;
  align-items: center;
}

.nav-center {
  width: 50%;
  display: flex;
  justify-content: center;
  gap: 36px;
}

.nav-right {
  width: 25%;
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
}

.brand-text {
  color: #ffffff;
  font-weight: 700;
  font-size: 50px;
  letter-spacing: 1px;
}

.nav-link {
  color: #ffffff;
  text-decoration: none;
  font-weight: 700;
  letter-spacing: 0.3px;
  transition: color 0.2s ease;
  font-size: 20px;
}

.nav-link:hover {
  color: #cfe4ff;
}

.nav-auth {
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  font-size: 20px;
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
  padding: 0 20px;
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

/* 职业展示样式 */
.career-showcase {
  position: relative;
  width: 100%;
  height: 500px;
  margin-top: 20px;
  margin-bottom: 40px;
}

/* 右侧特色职业 */
.career-featured {
  position: absolute;
  right: 0;
  top: -40px; /* 往上移动40px */
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 20px;
}

.career-featured-content {
  padding: 20px;
}

.featured-name {
  font-size: 28px;
  font-weight: 700;
  color: #0b2a4a;
  margin-bottom: 15px;
}

.featured-desc {
  font-size: 18px;
  color: #475569;
  max-width: 80%;
}

.career-featured-circle {
  position: relative;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto;
  border: 6px solid #054d22;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  text-decoration: none;
  margin-top: 20px;
}

.career-featured-circle:before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 6px solid #f0c53e;
  box-sizing: border-box;
  transform: scale(1.08);
}

.career-featured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 左上到右下的职业路径 */
.career-path {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* 保证点击事件可以穿透到圆圈 */
}

.career-circle-small {
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #054d22;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  text-decoration: none;
  cursor: pointer;
  pointer-events: auto; /* 确保圆圈可以点击 */
}

.career-circle-small:before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid #f0c53e;
  box-sizing: border-box;
  transform: scale(1.08);
}

.career-circle-small:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.career-circle-active {
  transform: scale(1.5);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  z-index: 10;
}

.career-circle-active:hover {
  transform: scale(1.6);
}

.career-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 导航按钮样式 */
.career-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  gap: 20px;
}

.career-nav-btn {
  background: rgba(255, 255, 255, 0.7);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #0b2a4a;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.career-nav-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.1);
}

.career-dots {
  display: flex;
  gap: 10px;
}

.career-dot-btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.career-dot-btn.active {
  background-color: #3b82f6;
  transform: scale(1.2);
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
  .career-showcase {
    height: 700px;
  }
  
  .career-featured {
    width: 100%;
    height: 320px; /* 减少高度 */
    position: relative;
    right: auto;
    top: -20px; /* 调整移动距离 */
  }
  
  .career-featured-circle {
    width: 200px;
    height: 200px;
  }
  
  .career-path {
    width: 100%;
    height: 380px; /* 增加高度 */
    top: 320px;
    left: 0;
  }
  
  /* 移动端重新定位圆圈 */
  .career-circle-small:nth-child(1) { top: 0%; left: 5%; }
  .career-circle-small:nth-child(2) { top: 20%; left: 25%; }
  .career-circle-small:nth-child(3) { top: 40%; left: 45%; }
  .career-circle-small:nth-child(4) { top: 60%; left: 65%; }
  .career-circle-small:nth-child(5) { top: 80%; left: 85%; }
  
  .career-circle-small {
    width: 80px;
    height: 80px;
  }
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