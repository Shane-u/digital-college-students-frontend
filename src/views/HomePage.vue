<template>
  <div class="home-page">
    <MouseFollower />

    <!-- Navbar -->
    <nav class="navbar" :class="{ 'navbar-transparent': isNavTransparent }">
      <div class="nav-inner">
        <div class="nav-left">
          <div class="brand">
            <span class="brand-text">数字大学生</span>
          </div>
        </div>
        <div class="nav-center">
          <a href="#hero" class="nav-link bold">首页</a>
          <a href="#competition" class="nav-link bold">竞赛活动</a>
          <a href="#career" class="nav-link bold">职业规划</a>
          <a href="#knowledge" class="nav-link bold">知识图谱</a>
          <a href="#profile" class="nav-link bold">个人主页</a>
        </div>
        <div class="nav-right">
          <a href="#auth" class="nav-auth">登录/注册</a>
        </div>
      </div>
    </nav>

    <!-- 轮播图容器 -->
    <div class="hero-slides">
      <div 
        class="slides-wrapper"
        :class="{ 'no-transition': !withTransition }"
       :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        @transitionend="onTransitionEnd"
      >
        <div  v-for="(img, i) in displaySlides" :key="i">
          <img :src="img" alt="轮播图" class="slide-img" />
        </div>
        <!-- <div class="slide">
          <img src="../assets/pic_lb1.png" alt="" class="slide-img">
        </div> -->
      </div>
       
    </div>

    <!-- Hero内容层（文字、按钮） -->
    <section id="hero" ref="heroRef" class="hero-content-layer">
      <div class="hero-overlay"></div>
      <!-- <div class="hero-text">
        <h1 class="hero-title">数字时代的大学生活</h1>
        <p class="hero-subtitle">探索知识，参与竞赛，规划未来，享受青春</p>
        <button class="hero-btn">开始探索</button>
      </div> -->
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

    <div id="competition"
      class="section competition"
      :style="{ backgroundImage: `url(${background})` }">
      <!-- Competition Section -->
    <section>
      <div class="section-inner">
        <div class="section-title-wrap">
          <div class="cube-small"><Competition class="title-icon" /></div>
          <h2 class="section-title">竞赛活动</h2>
        </div>
        <div class="cards">
          <div class="card">
            <div class="card-emoji">🏆</div>
            <h3>程序设计大赛</h3>
            <p>年度最大的编程竞赛，展示你的算法与创造力</p>
          </div>
          <div class="card">
            <div class="card-emoji">📊</div>
            <h3>数据科学挑战</h3>
            <p>用数据讲述故事，解决现实世界的问题</p>
          </div>
          <div class="card">
            <div class="card-emoji">🎨</div>
            <h3>数字艺术展</h3>
            <p>展示你的数字艺术作品，赢得专业评审的认可</p>
          </div>
        </div>
      </div>
      <div>

      </div>
    </section>

    <!-- Career Section -->
    <section id="career" class="section career">
      <div class="section-inner">
        <div class="section-title-wrap">
          <Astronaut class="title-icon astronaut-near" />
          <h2 class="section-title">职业规划</h2>
        </div>
        <div class="career-grid">
          <div class="career-card">
            <h3 class="career-card-title">行业导师计划</h3>
            <p class="career-card-text">连接行业专家，获得一对一的职业指导</p>
            <ul class="career-list">
              <li>定制化职业发展路径</li>
              <li>行业趋势与技能分析</li>
              <li>实习与就业机会推荐</li>
            </ul>
          </div>
          <div class="career-card">
            <h3 class="career-card-title">技能工作坊</h3>
            <p class="career-card-text">提升职场竞争力的实用技能培训</p>
            <div class="tag-grid">
              <span class="tag">简历优化</span>
              <span class="tag">面试技巧</span>
              <span class="tag">职场沟通</span>
              <span class="tag">时间管理</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from "vue";
import MouseFollower from "../components/MouseFollower.vue";
import Astronaut from "../components/Astronaut.vue";
import pic1 from "../assets/pic_lb1.png";
import pic2 from "../assets/pic_lb2.png";
import pic3 from "../assets/pic_lb3.png";
import pic4 from "../assets/pic_lb4.png";
import background from "../assets/background.png";
import Competition from "../components/competition.vue";

export default {
  name: "HomePage",
  components: {
    MouseFollower,
    Competition,
    Astronaut,
  },
  setup() {
  const isNavTransparent = ref(true);
  const heroRef = ref(null);
   const currentIndex = ref(0); // 视图索引（包含克隆帧时使用）
  const withTransition = ref(true);
  const pendingTargetIndex = ref(null); // 手动点击时用于同向丝滑切换的目标索引
  let slideTimer = null;

  // 轮播图数据：优先用本地图，本地图加载失败则自动切换在线图
  const slides = [
    pic4,
    pic2,
    pic3,
    pic1,
  ];

   // 展示用数组：在末尾克隆第一张，便于从末帧正常动画到克隆帧
  const displaySlides = computed(() => {
    return slides.length > 0 ? [...slides, slides[0]] : [];
  });

   // 根据视图索引推导当前逻辑张（用于激活小恐龙等）
   const currentSlide = computed(() => {
     if (!slides.length) return 0;
     return currentIndex.value % slides.length;
   });

  // 直接跳到指定索引
  const goToSlide = (index) => {
    // 希望始终保持同方向（向前）切换的视觉效果
    const cur = currentSlide.value;
    if (index === cur) return;
    withTransition.value = true;
    // 若目标在当前之后，则直接前进到目标
    if (index > cur) {
      currentIndex.value = index;
      return;
    }
    // 若目标在当前之前，则先前进到克隆帧（末尾+1），等待过渡结束后归位并前进到目标
    pendingTargetIndex.value = index;
    currentIndex.value = slides.length; // 先前进到克隆帧
  };

  // 下一张轮播图（修复：从最后一张切到克隆帧，过渡后归位第一张）
  const nextSlide = () => {
    withTransition.value = true;
    // 始终前进一帧；当到克隆帧（=slides.length）时，transitionend 会归位
    currentIndex.value += 1;
  };
   
  // 上一张轮播图（新增：从第一张直接切到最后一张，无需过渡其他图片）
   const prevSlide = () => {
     withTransition.value = true;
    if (currentIndex.value === 0) {
       // 从第一张往回，需要瞬时跳到克隆帧对应位置（末张）再过渡到倒数第二张
       // 简化：直接跳到最后一张真实图
       withTransition.value = false;
       currentIndex.value = slides.length; // 克隆帧位置
       requestAnimationFrame(() => {
         withTransition.value = true;
         currentIndex.value = slides.length - 1;
       });
     } else {
       currentIndex.value -= 1;
     }
   };

  // 自动轮播
  const startAutoSlide = () => {
    stopAutoSlide();
    slideTimer = setInterval(nextSlide, 5000);
  };

  // 停止自动轮播
  const stopAutoSlide = () => {
    if (slideTimer) {
      clearInterval(slideTimer);
      slideTimer = null;
    }
  };

  onMounted(() => {
    // 监听导航栏透明度（滚动时切换）
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isNavTransparent.value = entry.isIntersecting;
      },
      { threshold: 0.2 }
    );
    if (heroRef.value) observer.observe(heroRef.value);

    // 启动自动轮播
    startAutoSlide();

    // 组件卸载时清理
    onUnmounted(() => {
      stopAutoSlide();
      if (observer && heroRef.value) observer.unobserve(heroRef.value);
    });
  });

  // 过渡结束时的收尾处理：若在克隆帧，瞬时无动画归位到第一张
   const onTransitionEnd = () => {
    // 如果刚好是最后一张
    if (currentIndex.value === slides.length) {
      withTransition.value = false;
      // var con = document.querySelector(".slides-wrapper");
      // con.style.removeProperty('transition');
      // con.style.transitionDuration = '0s';
      // con.style.removeProperty("transform");
       currentIndex.value = 0;
       // 恢复过渡供后续切换
       requestAnimationFrame(() => {
        //  con.style.transition = 'transform 1.5s ease';
        //  con.style.transform = "translateX(-${currentIndex * 100}%"
        //  con.style.transitionDuration = '1.5s';
        //  withTransition.value = true;
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
  };
}
}
</script>

<style scoped>
/* 全局容器 */
.home-page {
  min-height: 100vh;
  background: #ffffff;
  position: relative;
  overflow-x: hidden;
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
  /* box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); */
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
  
  padding: 14px 20px ;
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
  padding-right: 20px
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

.slide {
  width: 100%;  /* 使用视口宽度 */
  height: 100vh; /* 使用视口高度 */
}

.slide-img {
  width: 98.9vw;
  height: 100vh;
  object-fit: cover;
  object-position: center;
}

/* Hero内容层（文字、按钮，叠在轮播图上） */
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

.hero-text {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #ffffff;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 12px;
}

.hero-subtitle {
  opacity: 0.9;
  font-size: 18px;
  margin-bottom: 24px;
}

.hero-btn {
  background: #ffd400;
  color: #1f2937;
  border: none;
  padding: 12px 26px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
}

.hero-btn:hover {
  background: #ffe033;
}

/* 轮播图控制按钮 */
.hero-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  gap: 14px;
}

.control-btn {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  backdrop-filter: blur(6px);
  cursor: pointer;
  transition: background 0.2s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.4);
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
  padding: 40px 0;
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
  margin-bottom: 28px;
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
  background-size: cover;
  background-position: center;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  padding: 28px 22px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.25s ease;
}

.card:hover {
  transform: translateY(-4px);
}

.card-emoji {
  font-size: 28px;
  margin-bottom: 10px;
}

.card h3 {
  margin: 8px 0 6px;
  color: #0b2a4a;
  font-size: 18px;
}

.card p {
  color: #475569;
  line-height: 1.6;
}

/* 职业规划板块样式 */
.career-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.astronaut-near {
  width: 36px;
  height: 36px;
  transform: translateY(2px);
}

.career-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  padding: 28px 22px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.06);
}

.career-card-title {
  color: #0b2a4a;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.career-card-text {
  color: #475569;
  margin-bottom: 14px;
  line-height: 1.6;
}

.career-list {
  color: #334155;
  padding-left: 16px;
  display: grid;
  gap: 6px;
}

.career-list li {
  list-style: disc;
  line-height: 1.5;
}

.tag-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.tag {
  background: #e0edff;
  color: #0a54e6;
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 13px;
  text-align: center;
}

/* 响应式适配（小屏幕） */
@media (max-width: 768px) {
  .nav-left,
  .nav-right {
    width: 30%;
  }

  .nav-center {
    width: 40%;
    gap: 18px;
  }

  .hero-title {
    font-size: 34px;
  }

  .hero-content-layer {
    padding-top: 50px;
  }

  .hero-slides {
    height: 100vh;
  }
}
</style>