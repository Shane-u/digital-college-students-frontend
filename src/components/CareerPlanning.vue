<template>
    <div class="career-showcase">
      <!-- 职业规划标题（滚动监听触发点） -->
      <h2  class="career-title">职业规划</h2>
      
      <!-- 左上方文字介绍框 -->
      <div ref="careerTitleRef" class="career-text-box">
        <h3 class="featured-name">{{ activeCareer.name }}</h3>
        <p class="featured-desc">{{ activeCareer.description }}</p>
      </div>
      
      <!-- 右侧大图和知识图谱标题 -->
      <div ref="knowledgeGraphRef" class="knowledge-graph">
        <router-link :to="activeCareer.link" class="knowledge-circle">
          <img :src="knowledgePic" alt="知识图" class="knowledge-image" />
        </router-link>
        <div class="knowledge-title">
          <span>知</span>
          <span>识</span>
          <span>图</span>
          <span>谱</span>
        </div>
      </div>
      
      <!-- 左侧小图阵列 -->
      <div ref="carouselImagesRef" class="career-path">
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
      
      <!-- 导航按钮 - 放在轮播图下方 -->
      <div class="career-controls">
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
  </template>
  
  <script>
  import { ref, computed, onMounted, onUnmounted } from "vue";
  import knowledgePic from "../assets/knowledge_pic.png";
  import pic1 from "../assets/pic_lb1.png";
  import pic2 from "../assets/pic_lb2.png";
  import pic3 from "../assets/pic_lb3.png";
  import pic4 from "../assets/pic_lb4.png";
  
  export default {
    name: "CareerPlanning",
    setup() {
      // 1. 职业数据初始化
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
  
      // 2. 轮播核心变量
      const activeCareerIndex = ref(0);
      const currentCareerPage = ref(0);
      const careersPerPage = 5;
      const currentCarouselIndex = ref(0);
      let careerTimer = null;
  
      // 3. 滚动动画相关Ref（用于绑定DOM）
      const careerTitleRef = ref(null); // 触发点：职业规划标题
      const carouselImagesRef = ref(null); // 轮播小图容器
      const knowledgeGraphRef = ref(null); // 右侧大图容器
  
      // 4. 计算属性
      const displayedCareers = computed(() => {
        const result = [];
        for (let i = 0; i < careersPerPage; i++) {
          const index = (currentCarouselIndex.value + i) % careers.value.length;
          result.push(careers.value[index]);
        }
        return result;
      });
  
      const totalPages = computed(() => Math.ceil(careers.value.length / careersPerPage));
  
      const activeCareer = computed(() => careers.value[activeCareerIndex.value] || careers.value[0]);
  
      // 5. 轮播控制方法
      const setActiveCareer = (id) => {
        const index = careers.value.findIndex(career => career.id === id);
        if (index !== -1) activeCareerIndex.value = index;
      };
  
      const nextCareerSlide = () => {
        document.querySelectorAll('.career-circle-small').forEach(el => el.style.transition = 'all 0.5s ease');
        currentCarouselIndex.value = (currentCarouselIndex.value + 1) % careers.value.length;
        activeCareerIndex.value = currentCarouselIndex.value;
      };
  
      const prevCareerSlide = () => {
        document.querySelectorAll('.career-circle-small').forEach(el => el.style.transition = 'all 0.5s ease');
        currentCarouselIndex.value = currentCarouselIndex.value === 0 ? careers.value.length - 1 : currentCarouselIndex.value - 1;
        activeCareerIndex.value = currentCarouselIndex.value;
      };
  
      const goToCareerPage = (pageIndex) => {
        currentCareerPage.value = pageIndex;
        activeCareerIndex.value = currentCareerPage.value * careersPerPage;
      };
  
      const getPositionStyle = (index) => {
        const positions = [
          { top: '5%', left: '0%' },
          { top: '30%', left: '15%' },
          { top: '55%', left: '35%' },
          { top: '80%', left: '60%' },
          { top: '90%', left: '90%' }
        ];
        const pos = positions[index] || positions[0];
        return { top: pos.top, left: pos.left };
      };
  
      // 6. 自动轮播控制
      const startCareerAutoSlide = () => {
        stopCareerAutoSlide();
        careerTimer = setInterval(() => nextCareerSlide(), 6000);
      };
  
      const stopCareerAutoSlide = () => {
        if (careerTimer) {
          clearInterval(careerTimer);
          careerTimer = null;
        }
      };
  
      // 7. 滚动触发动画核心逻辑
      const initScrollAnimation = () => {
        // 监听“职业规划”标题是否进入视口
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // 轮播小图：添加backInUp动画
              const carouselEl = carouselImagesRef.value;
              if (carouselEl) {
                carouselEl.classList.add('animate__animated', 'animate__backInUp');
                // 动画结束后移除类，确保下次滚动仍能触发
                setTimeout(() => carouselEl.classList.remove('animate__animated', 'animate__backInUp'), 1000);
              }
  
              // 右侧大图：添加jackInTheBox动画
              const knowledgeEl = knowledgeGraphRef.value;
              if (knowledgeEl) {
                knowledgeEl.classList.add('animate__animated', 'animate__zoomIn');
                setTimeout(() => knowledgeEl.classList.remove('animate__animated', 'animate__zoomIn'), 1000);
              }
            }
          });
        }, { threshold: 0.5 }); // 标题50%进入视口时触发
  
        // 启动监听
        if (careerTitleRef.value) observer.observe(careerTitleRef.value);
  
        // 组件卸载时销毁监听
        onUnmounted(() => {
          if (careerTitleRef.value) observer.unobserve(careerTitleRef.value);
        });
      };
  
      // 8. 生命周期钩子
      onMounted(() => {
        startCareerAutoSlide();
        initScrollAnimation(); // 初始化滚动动画
      });
  
      onUnmounted(() => stopCareerAutoSlide());
  
      // 9. 暴露变量
      return {
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
        knowledgePic,
        careerTitleRef,
        carouselImagesRef,
        knowledgeGraphRef
      };
    }
  };
  </script>
  
  <style scoped>
  /* 职业展示主容器 */
  .career-showcase {
    position: relative;
    width: 100%;
    height: 600px;
    margin-top: 20px;
    margin-bottom: 40px;
  }
  
  /* 职业规划标题样式 */
  .career-title {
    font-size: 32px;
    font-weight: 700;
    color: #0b2a4a;
    margin-bottom: 30px;
    display: none;
  }
  
  /* 左上方文字介绍框 */
  .career-text-box {
    position: absolute;
    left: 250px;
    top: 0;
    width: 25%;
    padding: 20px;
    z-index: 5;
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
    line-height: 1.6;
  }
  
  /* 右侧知识图谱 */
  .knowledge-graph {
    position: absolute;
    right: 3%;
    top: 25%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    z-index: 10;
  }
  
  .knowledge-title {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 15px;
  }
  
  .knowledge-title span {
    font-size: 24px;
    font-weight: 700;
    color: #054d22;
    margin: 5px 0;
    writing-mode: vertical-lr;
    text-orientation: upright;
    letter-spacing: 5px;
  }
  
  .knowledge-circle {
    position: relative;
    width: 450px;
    height: 450px;
    border-radius: 50%;
    overflow: hidden;
    border: 6px solid #054d22;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    text-decoration: none;
  }
  
  .knowledge-circle:before {
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
  
  .knowledge-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  /* 左侧小图阵列 */
  .career-path {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 5;
  }
  
  .career-circle-small {
    position: absolute;
    width: 140px;
    height: 140px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid #054d22;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transition: all 0.5s ease;
    text-decoration: none;
    cursor: pointer;
    pointer-events: auto;
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
    animation: pulse 1.5s infinite alternate;
  }
  
  .career-circle-active:hover {
    transform: scale(1.6);
  }
  
  @keyframes pulse {
    0% { box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25); }
    100% { box-shadow: 0 12px 32px rgba(5, 77, 34, 0.6); }
  }
  
  .career-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  /* 导航按钮 */
  .career-controls {
    position: absolute;
    bottom: 0;
    left: 40%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    z-index: 10;
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
  @media (max-width: 768px) {
    .career-showcase {
      height: 800px;
    }
    
    .career-text-box {
      width: 90%;
      top: 0;
      left: 5%;
      position: relative;
      margin-bottom: 20px;
    }
    
    .knowledge-graph {
      position: relative;
      right: auto;
      top: auto;
      transform: none;
      flex-direction: column;
      align-items: center;
      width: 100%;
      margin: 20px 0;
    }
    
    .knowledge-title {
      flex-direction: row;
      margin-right: 0;
      margin-bottom: 10px;
    }
    
    .knowledge-title span {
      writing-mode: horizontal-tb;
      margin: 0 5px;
    }
    
    .knowledge-circle {
      width: 250px;
      height: 250px;
    }
    
    .career-path {
      width: 100%;
      height: 380px;
      top: 400px;
      left: 0;
    }
    
    .career-circle-small:nth-child(1) { top: 0%; left: 5%; }
    .career-circle-small:nth-child(2) { top: 20%; left: 25%; }
    .career-circle-small:nth-child(3) { top: 40%; left: 45%; }
    .career-circle-small:nth-child(4) { top: 60%; left: 65%; }
    .career-circle-small:nth-child(5) { top: 80%; left: 85%; }
    
    .career-controls {
      bottom: -50px;
    }
    
    .career-circle-small {
      width: 80px;
      height: 80px;
    }
  }
  </style>