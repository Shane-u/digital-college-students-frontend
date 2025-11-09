<template>
  <div class="career-showcase-page">
    <!-- 使用共享导航组件 -->
    <NavBar :transparent="false" />

    <!-- 面包屑导航 -->
    <div class="breadcrumb-container">
      <div class="breadcrumb">
        <router-link to="/home">首页</router-link>
        <span>&gt;&gt;</span>
        <span class="current-page">职业规划</span>
        <span>&gt;&gt;</span>
        <span class="current-page">职业展示</span>
      </div>
      <div class="divider"></div>
    </div>

    <!-- 见解中心区域 -->
    <div class="insight-center-section">
      <div class="insight-content">
        <h1 class="insight-title">职业资源库</h1>
        <p class="insight-description">
          整合热门职业、行业趋势与职业发展路径，为高校学子提供一站式职业信息服务
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
            <select class="filter-select" v-model="filterCategory">
              <option value="">职业分类</option>
              <option value="tech">技术类</option>
              <option value="design">设计类</option>
              <option value="business">商务类</option>
            </select>
            <select class="filter-select" v-model="filterLevel">
              <option value="">职业级别</option>
              <option value="junior">初级</option>
              <option value="senior">高级</option>
            </select>
            <select class="filter-select" v-model="filterExperience">
              <option value="">经验要求</option>
              <option value="fresh">应届生</option>
              <option value="experienced">有经验</option>
            </select>
            <select class="filter-select" v-model="filterSalary">
              <option value="">薪资范围</option>
              <option value="low">5K-10K</option>
              <option value="mid">10K-20K</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="content-container">
      <!-- 左侧侧边栏过滤器 -->
      <aside class="left-sidebar">
        <div class="sidebar-content">
          <!-- 主题 -->
          <div class="filter-section">
            <div class="filter-header" @click="toggleSection('theme')">
              <span>主题</span>
              <svg
                class="chevron-icon"
                :class="{ 'expanded': expandedSections.theme }"
                viewBox="0 0 12 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L6 6L11 1"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>

          <!-- 来源类别 -->
          <div class="filter-section">
            <div class="filter-header" @click="toggleSection('source')">
              <span>来源类别</span>
              <svg
                class="chevron-icon"
                :class="{ 'expanded': expandedSections.source }"
                viewBox="0 0 12 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L6 6L11 1"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>

          <!-- 学科 -->
          <div class="filter-section">
            <div class="filter-header" @click="toggleSection('subject')">
              <span>学科</span>
              <svg
                class="chevron-icon"
                :class="{ 'expanded': expandedSections.subject }"
                viewBox="0 0 12 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L6 6L11 1"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>

          <!-- 年度 -->
          <div class="filter-section">
            <div class="filter-header" @click="toggleSection('year')">
              <span>年度</span>
              <div class="sort-options">
                <a href="#" class="sort-link">时间↓</a>
                <a href="#" class="sort-link">文献量↓</a>
              </div>
              <svg
                class="chevron-icon"
                :class="{ 'expanded': expandedSections.year }"
                viewBox="0 0 12 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L6 6L11 1"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>

          <!-- 研究层次 - 展开状态 -->
          <div class="filter-section expanded">
            <div class="filter-header" @click="toggleSection('research')">
              <svg
                class="chart-icon"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 12V8M6 12V4M10 12V6M14 12V2"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              <span>研究层次</span>
              <svg
                class="chevron-icon expanded"
                viewBox="0 0 12 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L6 6L11 1"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="filter-options" v-show="expandedSections.research">
              <label
                v-for="option in researchLevels"
                :key="option.value"
                class="filter-option"
              >
                <input
                  type="checkbox"
                  :value="option.value"
                  v-model="selectedResearchLevels"
                />
                <span>{{ option.label }} ({{ option.count }})</span>
              </label>
            </div>
          </div>

          <!-- 文献类型 -->
          <div class="filter-section">
            <div class="filter-header" @click="toggleSection('document')">
              <svg
                class="chart-icon"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 12V8M6 12V4M10 12V6M14 12V2"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              <span>文献类型</span>
              <svg
                class="chevron-icon"
                :class="{ 'expanded': expandedSections.document }"
                viewBox="0 0 12 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L6 6L11 1"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </aside>

      <!-- 右侧卡片展示区 -->
      <div class="right-content">
        <div class="career-cards-grid">
          <div
            v-for="career in displayedCareers"
            :key="career.id"
            class="career-card"
          >
            <div class="card-image-wrapper">
              <img :src="career.image" :alt="career.title" class="card-image" />
            </div>
            <div class="card-content">
              <div class="card-header">
                <h3 class="card-title">{{ career.title }}</h3>
                <span v-if="career.isHot" class="hot-badge">热门</span>
              </div>
              <p class="card-description">{{ career.description }}</p>
              <div class="card-skills">
                <span
                  v-for="skill in career.skills"
                  :key="skill"
                  class="skill-tag"
                >
                  {{ skill }}
                </span>
              </div>
              <div class="card-footer">
                <span class="card-salary">起薪:{{ career.salary }}/月</span>
                <a href="#" class="card-link">了解详情 →</a>
              </div>
            </div>
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
import { ref, computed } from "vue";
import Pagination from "../components/Pagination.vue";
import NavBar from "../components/NavBar.vue";

// 模拟数据 - 实际项目中应该从API获取
const mockCareers = [
  {
    id: 1,
    title: "前端开发工程师",
    description:
      "负责构建和维护网站、应用程序的用户界面，实现交互效果和视觉呈现。",
    skills: ["HTML/CSS", "JavaScript", "React/Vue", "响应式设计"],
    salary: "¥8K-15K",
    image: "https://picsum.photos/id/1005/400/250",
    isHot: true,
  },
  {
    id: 2,
    title: "后端开发工程师",
    description:
      "负责构建和维护应用程序的服务器端逻辑、数据库和API，确保系统性能和安全性。",
    skills: ["Java/Python", "Node.js/Go", "数据库", "API设计"],
    salary: "¥9K-16K",
    image: "https://picsum.photos/id/1006/400/250",
    isHot: true,
  },
  {
    id: 3,
    title: "前端开发工程师",
    description:
      "负责构建和维护网站、应用程序的用户界面，实现交互效果和视觉呈现。",
    skills: ["HTML/CSS", "JavaScript", "React/Vue", "响应式设计"],
    salary: "¥8K-15K",
    image: "https://picsum.photos/id/1005/400/250",
    isHot: true,
  },
  {
    id: 4,
    title: "后端开发工程师",
    description:
      "负责构建和维护应用程序的服务器端逻辑、数据库和API，确保系统性能和安全性。",
    skills: ["Java/Python", "Node.js/Go", "数据库", "API设计"],
    salary: "¥9K-16K",
    image: "https://picsum.photos/id/1006/400/250",
    isHot: true,
  },
];

export default {
  name: "CareerShowcasePage",
  components: {
    Pagination,
    NavBar,
    Footer,
  },
  setup() {
    const careers = ref(mockCareers);
    const currentPage = ref(1);
    const itemsPerPage = 8;

    // 过滤器状态
    const searchQuery = ref("");
    const filterCategory = ref("");
    const filterLevel = ref("");
    const filterExperience = ref("");
    const filterSalary = ref("");

    // 侧边栏过滤器状态
    const expandedSections = ref({
      theme: false,
      source: false,
      subject: false,
      year: false,
      research: true, // 默认展开
      document: false,
    });

    const selectedResearchLevels = ref([]);

    const researchLevels = [
      { label: "应用研究", value: "applied", count: 197 },
      { label: "开发研究", value: "development", count: 163 },
      { label: "学科教育教学", value: "education", count: 25 },
      { label: "高级科普", value: "popular", count: 19 },
      { label: "开发研究-管理研究", value: "management", count: 15 },
      { label: "开发研究-政策研究", value: "policy", count: 8 },
      { label: "技术研究", value: "technical", count: 8 },
      { label: "学科教育教学", value: "education2", count: 4 },
      { label: "开发研究-行业研究", value: "industry", count: 1 },
      { label: "技术开发", value: "techdev", count: 1 },
    ];

    const toggleSection = (section) => {
      expandedSections.value[section] = !expandedSections.value[section];
    };

    const totalPages = computed(() =>
      Math.ceil(careers.value.length / itemsPerPage)
    );

    const displayedCareers = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return careers.value.slice(start, end);
    });

    const handlePageChange = (page) => {
      currentPage.value = page;
      window.scrollTo(0, 0);
    };

    return {
      careers,
      currentPage,
      totalPages,
      displayedCareers,
      handlePageChange,
      searchQuery,
      filterCategory,
      filterLevel,
      filterExperience,
      filterSalary,
      expandedSections,
      selectedResearchLevels,
      researchLevels,
      toggleSection,
    };
  },
};
</script>

<style scoped>
.career-showcase-page {
  padding-top: 60px; /* 给导航栏留出空间 */
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
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

/* 内容区域布局 */
.content-container {
  padding: 40px 20px 20px 20px;
  display: flex;
  gap: 40px;
  align-items: flex-start;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* 左侧侧边栏 */
.left-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.sidebar-content {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 16px;
  position: sticky;
  top: 100px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.filter-section {
  margin-bottom: 12px;
  border-radius: 8px;
  background: #f5f5f5;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  font-weight: 500;
  transition: background 0.2s;
  background: #fafafa;
}

.filter-header:hover {
  background: #f0f0f0;
}

.filter-section.expanded .filter-header {
  background: #ffffff;
}

.filter-header span {
  flex: 1;
}

.sort-options {
  display: flex;
  gap: 12px;
  margin-right: 8px;
}

.sort-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 12px;
}

.sort-link:hover {
  text-decoration: underline;
}

.chevron-icon {
  width: 12px;
  height: 12px;
  color: #666;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.chevron-icon.expanded {
  transform: rotate(180deg);
}

.chart-icon {
  width: 16px;
  height: 16px;
  color: #666;
  margin-right: 8px;
  flex-shrink: 0;
}

.filter-options {
  padding: 8px 16px 16px;
  max-height: 300px;
  overflow-y: auto;
  background: #ffffff;
}

.filter-options::-webkit-scrollbar {
  width: 6px;
}

.filter-options::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.filter-options::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 3px;
}

.filter-options::-webkit-scrollbar-thumb:hover {
  background: #b0b0b0;
}

.filter-option {
  display: flex;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
  font-size: 13px;
  color: #555;
}

.filter-option input[type="checkbox"] {
  margin-right: 8px;
  cursor: pointer;
}

.filter-option:hover {
  color: #333;
}

/* 右侧内容区 */
.right-content {
  flex: 1;
  min-width: 0;
}

.career-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.career-card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.career-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.card-image-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f0f0f0;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.career-card:hover .card-image {
  transform: scale(1.05);
}

.card-content {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.hot-badge {
  background: #87ceeb;
  color: #ffffff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.card-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
}

.card-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.skill-tag {
  background: #f0f0f0;
  color: #555;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.card-salary {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.card-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.card-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* 确保内容区域占据可用高度，Footer显示在底部 */
.content-container {
  flex: 1;
  margin-bottom: 20px;
}
</style>
