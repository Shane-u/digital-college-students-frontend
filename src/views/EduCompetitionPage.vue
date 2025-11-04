<template>
  <div class="competition-page">
    <!-- 使用共享导航组件 -->
    <NavBar :transparent="false" />

    <!-- 面包屑导航 -->
    <div class="breadcrumb-container">
      <div class="breadcrumb">
        <router-link to="/home">首页</router-link>
        <span>&gt;&gt;</span>
        <span class="current-page">竞赛活动</span>
        <span>&gt;&gt;</span>
        <span class="current-page">教育部榜单竞赛</span>
      </div>
      <div class="divider"></div>
    </div>

    <!-- 见解中心区域 -->
    <div class="insight-center-section">
      <div class="insight-content">
        <h1 class="insight-title">竞赛资源库</h1>
        <p class="insight-description">
          整合教育部权威榜单、学科竞赛指南与参赛策略，为高校学子提供一站式竞赛信息服务
        </p>

        <!-- 过滤器搜索栏 -->
        <div class="filter-bar">
          <div class="filter-left">
            <span class="filter-label">过滤器</span>
            <button class="search-button">
              <svg
                class="search-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <input
              type="text"
              class="search-input"
              placeholder="Search"
              v-model="searchQuery"
            />
          </div>
          <div class="filter-right">
            <select class="filter-select" v-model="filterTheme1">
              <option value="">学科分类</option>
              <option value="theme1">工学类</option>
              <option value="theme2">理学类</option>
            </select>
            <select class="filter-select" v-model="filterTheme2">
              <option value="">赛事级别</option>
              <option value="theme3">国家级</option>
              <option value="theme4">省级</option>
            </select>
            <select class="filter-select" v-model="filterPerson">
              <option value="">参赛对象</option>
              <option value="person1">本科生</option>
              <option value="person2">研究生</option>
            </select>
            <select class="filter-select" v-model="filterProject">
              <option value="">赛事阶段</option>
              <option value="project1">报名中</option>
              <option value="project2">已结束</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="content-container">
      <!-- 左侧介绍区 -->
      <aside class="left-intro">
        <div class="intro-content">
          <h1 class="intro-title">教育部榜单竞赛</h1>
          <p class="intro-description">
            展示学科竞赛、创新创业类赛事基础信息，包含 “互联网
            +”“挑战杯”“学科专业赛”
            等赛事名称、主办单位及参赛时间，供学子参考查询。
          </p>

          <div class="intro-buttons">
            <router-link to="/competition/subject" class="intro-btn primary"
              >学科专业竞赛</router-link
            >
            <router-link to="/home" class="intro-btn secondary">
              首页
              <span class="btn-dot"></span>
            </router-link>
          </div>
        </div>
      </aside>

      <!-- 右侧滚动列表区 -->
      <div class="right-content">
        <!-- 滚动列表容器 -->
        <div class="list-container" ref="listContainer" @wheel="handleWheel">
          <div class="sprints_inner-cards-grid" ref="cardGrid">
            <div
              v-for="(competition, index) in displayedCompetitions"
              :key="competition.id"
              class="sprints_process-card"
              :class="{ 'at-top': index < currentScrollPosition }"
            >
              <div class="card-number-icon">
                <!-- <div class="icon-wrapper is-number">
                  <div class="steps-number">{{ (currentPage - 1) * 10 + index + 1 }}</div>
                </div> -->
              </div>
              <div class="card-image-wrapper">
                <img
                  :src="competition.image"
                  :alt="competition.title"
                  class="card-image"
                />
              </div>
              <div class="sprints_bottom-part">
                <h3>{{ competition.title }}</h3>
                <p class="gd-paragraph">{{ competition.description }}</p>
              </div>
            </div>
          </div>

          <div
            class="scroll-indicator"
            :class="{
              hidden: currentScrollPosition >= displayedCompetitions.length - 1,
            }"
          >
            滚动查看更多
            <span>↓</span>
          </div>
        </div>

        <!-- 分页 -->
        <pagination
          :total-pages="totalPages"
          :current-page="currentPage"
          @page-change="handlePageChange"
        />
      </div>
    </div>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import Footer from "../components/Footer.vue";
import { ref, computed, onMounted, onUnmounted } from "vue";
import Pagination from "../components/Pagination.vue";
import NavBar from "../components/NavBar.vue";

// 模拟数据 - 实际项目中应该从API获取
const mockEduCompetitions = Array(100)
  .fill(null)
  .map((_, index) => ({
    id: index + 1,
    title: `教育部榜单竞赛项目 ${index + 1}`,
    description:
      "这是一项重要的教育部认证竞赛活动，旨在提升学生的专业技能和综合素质。通过参与本竞赛，学生可以展示自己的才华，获得宝贵的实践经验，并有机会获得荣誉证书和奖励。",
    image: `https://picsum.photos/id/${(index % 50) + 10}/400/250`,
    link: "#",
  }));

export default {
  name: "EduCompetitionPage",
  components: {
    Pagination,
    NavBar,
    Footer,
  },
  setup() {
    const isNavTransparent = ref(false);
    const competitions = ref(mockEduCompetitions);
    const currentPage = ref(1);
    const itemsPerPage = 10;

    // 过滤器状态
    const searchQuery = ref("");
    const filterTheme1 = ref("");
    const filterTheme2 = ref("");
    const filterPerson = ref("");
    const filterProject = ref("");

    // 滚动相关
    const listContainer = ref(null);
    const cardGrid = ref(null);
    const currentScrollPosition = ref(0);

    // 监听页面滚动，控制导航栏透明度
    const handleScroll = () => {
      isNavTransparent.value = window.scrollY < 50;
    };

    // 处理滚动列表的滚轮事件
    const handleWheel = (e) => {
      const maxPosition = displayedCompetitions.value.length - 1;

      // 检查是否可以继续在列表内滚动
      const canScrollDown =
        e.deltaY > 0 && currentScrollPosition.value < maxPosition;
      const canScrollUp = e.deltaY < 0 && currentScrollPosition.value > 0;

      // 如果可以在列表内滚动，则阻止默认行为并更新列表位置
      if (canScrollDown || canScrollUp) {
        e.preventDefault();

        // 滚动到content-container顶部（导航栏下方）
        const contentContainer = document.querySelector(".content-container");
        if (contentContainer) {
          const navBarHeight = 60; // 导航栏高度
          const containerTop = contentContainer.offsetTop;
          window.scrollTo({
            top: containerTop - navBarHeight,
            behavior: "smooth",
          });
        }

        if (canScrollDown) {
          // 向下滚动
          currentScrollPosition.value++;
          updateListPosition();
        } else if (canScrollUp) {
          // 向上滚动
          currentScrollPosition.value--;
          updateListPosition();
        }
      }
      // 如果已经到达边界，不阻止默认行为，让页面继续滚动
    };

    // 更新列表位置
    const updateListPosition = () => {
      if (!cardGrid.value || !listContainer.value) return;

      const containerHeight = listContainer.value.offsetHeight;
      const cards = cardGrid.value.children;
      if (cards.length === 0) return;

      const cardHeight = cards[0].offsetHeight + 10; // 卡片高度 + margin
      // 计算偏移量，确保当前项在容器中居中显示
      const offset =
        -currentScrollPosition.value * cardHeight +
        (containerHeight - cardHeight) / 2;

      cardGrid.value.style.transform = `translateY(${offset}px)`;
    };

    onMounted(() => {
      window.addEventListener("scroll", handleScroll);
      handleScroll();

      // 初始化列表位置
      setTimeout(() => {
        updateListPosition();
      }, 100);
    });

    onUnmounted(() => {
      window.removeEventListener("scroll", handleScroll);
    });

    const totalPages = computed(() =>
      Math.ceil(competitions.value.length / itemsPerPage)
    );

    const displayedCompetitions = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return competitions.value.slice(start, end);
    });

    const handlePageChange = (page) => {
      currentPage.value = page;
      currentScrollPosition.value = 0; // 重置滚动位置
      setTimeout(() => {
        updateListPosition();
      }, 50);
      window.scrollTo(0, 0);
    };

    return {
      isNavTransparent,
      competitions,
      currentPage,
      totalPages,
      displayedCompetitions,
      handlePageChange,
      searchQuery,
      filterTheme1,
      filterTheme2,
      filterPerson,
      filterProject,
      listContainer,
      cardGrid,
      currentScrollPosition,
      handleWheel,
    };
  },
};
</script>

<style scoped>
.competition-page {
  padding-top: 60px; /* 给导航栏留出空间 */
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 导航栏样式与HomePage相同 */
/* .navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #3b82f6;
  color: white;
  z-index: 1000;
  transition: background-color 0.3s, box-shadow 0.3s;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.navbar-transparent {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%);
  box-shadow: none;
} */

.nav-inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  align-items: center;
}

.nav-left,
.nav-center,
.nav-right {
  display: flex;
  align-items: center;
}

.nav-center {
  justify-content: center;
  gap: 30px;
}

.nav-right {
  justify-content: flex-end;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-size: 16px;
  transition: opacity 0.3s;
}

.nav-link:hover {
  opacity: 0.8;
}

.brand-text {
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.nav-auth {
  color: white;
  text-decoration: none;
  font-size: 14px;
  padding: 8px 16px;
  border: 1px solid white;
  border-radius: 20px;
  transition: background-color 0.3s;
}

.nav-auth:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.bold {
  font-weight: 600;
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

/* 面包屑导航 */
.breadcrumb-container {
  max-width: 1200px;
  margin: 64px auto 0 20px;
  padding: 0 20px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.breadcrumb a {
  color: #3b82f6;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.current-page {
  color: #333;
  font-weight: 500;
}

.divider {
  height: 1px;
  width: 100%;
  background-color: #e0e0e0;
  margin: 8px 0 20px;
}

/* 内容区域布局 */
.content-container {
  padding: 40px 20px 20px 20px;
  display: flex;
  gap: 60px;
  align-items: flex-start;
}

/* 左侧介绍区 */
.left-intro {
  width: 400px;
  flex-shrink: 0;
}

.intro-content {
  position: sticky;
  top: 100px;
}

.intro-title {
  font-size: 42px;
  font-weight: 400;
  color: #1a1a1a;
  margin: 0 0 24px 0;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.intro-description {
  font-size: 16px;
  color: #666;
  margin: 0 0 40px 0;
  line-height: 1.6;
}

.intro-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.intro-btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 400;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.intro-btn.primary {
  background-color: #e8e8e8;
  color: #1a1a1a;
}

.intro-btn.primary:hover {
  background-color: #d8d8d8;
}

.intro-btn.secondary {
  background-color: transparent;
  color: #1a1a1a;
  border: 2px solid #d4582f;
  padding-right: 40px;
}

.intro-btn.secondary:hover {
  background-color: #d4582f;
  color: white;
}

.intro-btn.secondary:hover .btn-dot {
  background-color: white;
}

.btn-dot {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background-color: #d4582f;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

/* 右侧内容区 */
.right-content {
  flex: 1;
  min-width: 0;
  max-width: 100%;
}

/* 滚动列表容器样式 */
.list-container {
  width: 100%;
  height: 800px;
  overflow: hidden;
  position: relative;
  /* border: 1px solid #e0e0e0;
  border-radius: 1rem;
  background-color: #fafafa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); */
  margin-bottom: 10px;
}

.sprints_inner-cards-grid {
  position: absolute;
  width: 100%;
  padding: 40px 30px;
  transition: transform 0.8s cubic-bezier(0.3, 0.8, 0.2, 1);
}

.sprints_process-card {
  border: 1px solid #e0e0e0;
  background-color: #fff;
  border-radius: 0.875rem;
  padding: 2rem;
  margin-bottom: 10px;
  transition: all 0.8s cubic-bezier(0.3, 0.8, 0.2, 1);
  opacity: 1;
  filter: blur(0);
  transform: scale(1);
}

/* 只有到达顶部的项才会模糊缩小 */
.sprints_process-card.at-top {
  opacity: 0.2;
  filter: blur(6px);
  transform: scale(0.85);
}

.card-number-icon {
  margin-bottom: 1.5rem;
}

.card-image-wrapper {
  width: 100%;
  height: 240px;
  border-radius: 0.75rem;
  overflow: hidden;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card-image:hover {
  transform: scale(1.05);
}

.sprints_bottom-part h3 {
  margin-bottom: 1rem;
  font-size: 1.6rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
}

.gd-paragraph {
  line-height: 1.7;
  color: #555;
  font-size: 1rem;
}

.scroll-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  color: #666;
  font-size: 1rem;
  text-align: center;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

.scroll-indicator.hidden {
  opacity: 0;
}

.scroll-indicator span {
  display: block;
  margin-top: 8px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* 见解中心区域 */
.insight-center-section {
  background: linear-gradient(135deg, #2d1b4e 0%, #1a0f2e 100%);
  padding: 60px 0 80px;
  margin-bottom: 30px;
}

.insight-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.insight-title {
  font-size: 48px;
  font-weight: 700;
  color: #ff6b9d;
  margin: 0 0 20px 0;
  letter-spacing: 1px;
}

.insight-description {
  font-size: 16px;
  color: #ffffff;
  margin: 0 0 50px 0;
  line-height: 1.6;
}

/* 过滤器搜索栏 */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 15px;
  padding: 0;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
}

.filter-label {
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
}

.search-button {
  background: #e74c8c;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.search-button:hover {
  background: #d43d7a;
}

.search-icon {
  width: 20px;
  height: 20px;
  color: #ffffff;
  flex-shrink: 0;
}

.search-input {
  padding: 8px 15px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  min-width: 200px;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-input:focus {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 0 0 auto;
}

.filter-select {
  padding: 8px 32px 8px 15px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 14px;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 12px;
  transition: all 0.3s ease;
  min-width: 120px;
}

.filter-select:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.filter-select option {
  background-color: #2d1b4e;
  color: #ffffff;
}

/* 确保内容区域占据可用高度，Footer显示在底部 */
.content-container {
  flex: 1;
  margin-bottom: 20px;
}
</style>
