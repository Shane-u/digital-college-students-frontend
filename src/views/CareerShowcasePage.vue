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
          <!-- 城市 -->
          <div class="filter-section">
            <div class="filter-header" @click="toggleSection('location')">
              <div class="filter-title">
                <svg class="location-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M8 1.333a4.667 4.667 0 0 0-4.667 4.667c0 3.5 4.667 8.667 4.667 8.667s4.667-5.167 4.667-8.667A4.667 4.667 0 0 0 8 1.333Zm0 6.334a1.667 1.667 0 1 1 0-3.334 1.667 1.667 0 0 1 0 3.334Z"
                    fill="#13b0a6"
                  />
                </svg>
                <span>成都</span>
              </div>
              <svg
                class="chevron-icon"
                :class="{ 'expanded': expandedSections.location }"
                viewBox="0 0 12 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="filter-options" v-show="expandedSections.location">
              <div class="simple-options">
                <span
                  v-for="option in locationOptions"
                  :key="option"
                  @click="selectFilter('location', option)"
                >
                  {{ option }}
                </span>
              </div>
            </div>
          </div>

          <!-- 求职类型 -->
          <div class="filter-section">
            <div class="filter-header" @click="toggleSection('jobType')">
              <span>求职类型</span>
              <svg class="chevron-icon" :class="{ 'expanded': expandedSections.jobType }" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="filter-options" v-show="expandedSections.jobType">
              <div class="simple-options">
                <span
                  v-for="option in jobTypeOptions"
                  :key="option"
                  @click="selectFilter('jobType', option)"
                >
                  {{ option }}
                </span>
              </div>
            </div>
          </div>

          <!-- 薪资待遇 -->
          <div class="filter-section">
            <div class="filter-header" @click="toggleSection('salary')">
              <span>薪资待遇</span>
              <svg class="chevron-icon" :class="{ 'expanded': expandedSections.salary }" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="filter-options" v-show="expandedSections.salary">
              <div class="simple-options">
                <span
                  v-for="option in salaryOptions"
                  :key="option"
                  @click="selectFilter('salary', option)"
                >
                  {{ option }}
                </span>
              </div>
            </div>
          </div>

          <!-- 工作经验 -->
          <div class="filter-section">
            <div class="filter-header" @click="toggleSection('experience')">
              <span>工作经验</span>
              <svg class="chevron-icon" :class="{ 'expanded': expandedSections.experience }" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="filter-options" v-show="expandedSections.experience">
              <div class="simple-options">
                <span
                  v-for="option in experienceOptions"
                  :key="option"
                  @click="selectFilter('experience', option)"
                >
                  {{ option }}
                </span>
              </div>
            </div>
          </div>

          <!-- 学历要求 -->
          <div class="filter-section">
            <div class="filter-header" @click="toggleSection('education')">
              <span>学历要求</span>
              <svg class="chevron-icon" :class="{ 'expanded': expandedSections.education }" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="filter-options" v-show="expandedSections.education">
              <div class="simple-options">
                <span
                  v-for="option in educationOptions"
                  :key="option"
                  @click="selectFilter('education', option)"
                >
                  {{ option }}
                </span>
              </div>
            </div>
          </div>

          <!-- 公司行业 -->
          <div class="filter-section">
            <div class="filter-header" @click="toggleSection('industry')">
              <span>公司行业</span>
              <svg class="chevron-icon" :class="{ 'expanded': expandedSections.industry }" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="filter-options" v-show="expandedSections.industry">
              <div class="industry-grid">
                <span
                  v-for="option in industryOptions"
                  :key="option"
                  @click="selectFilter('industry', option)"
                >
                  {{ option }}
                </span>
              </div>
            </div>
          </div>

          <!-- 公司规模 -->
          <div class="filter-section">
            <div class="filter-header" @click="toggleSection('size')">
              <span>公司规模</span>
              <svg class="chevron-icon" :class="{ 'expanded': expandedSections.size }" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="filter-options" v-show="expandedSections.size">
              <div class="simple-options">
                <span
                  v-for="option in sizeOptions"
                  :key="option"
                  @click="selectFilter('size', option)"
                >
                  {{ option }}
                </span>
              </div>
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
            class="career-card job-card"
          >
            <div class="job-header">
              <div class="job-title">
                <h3>{{ career.title }}</h3>
              </div>
              <div class="job-salary">{{ career.salary }}</div>
            </div>
            <div class="job-tags">
              <span
                v-for="tag in career.tags"
                :key="tag"
                class="job-tag"
              >
                {{ tag }}
              </span>
            </div>
            <p class="job-description">
              {{ career.description }}
            </p>
            <div class="job-footer">
              <div class="job-company">
                <div class="company-info">
                  <span class="company-name">{{ career.company }}</span>
                </div>
                <span class="job-location">{{ career.location }}</span>
              </div>
              <a
                class="job-link"
                :href="career.url"
                target="_blank"
                rel="noopener noreferrer"
              >
                了解详情 →
              </a>
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
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import Pagination from "../components/Pagination.vue";
import NavBar from "../components/NavBar.vue";
import request from "../api/request";

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
    const router = useRouter();
    const route = useRoute();
    const careers = ref([]);
    const currentPage = ref(1);
    const itemsPerPage = 9;
    const total = ref(0);

    // 过滤器状态
    const searchQuery = ref("");
    const filterCategory = ref("");
    const filterLevel = ref("");
    const filterExperience = ref("");
    const filterSalary = ref("");

    // 侧边栏过滤器状态
    const expandedSections = ref({
      location: false,
      jobType: false,
      salary: false,
      experience: false,
      education: false,
      industry: false,
      size: false
    });

    const locationOptions = ["成都", "北京", "上海", "深圳", "广州"];
    const jobTypeOptions = ["不限", "全职", "兼职", "实习"];
    const salaryOptions = ["不限", "3K以下", "3-5K", "5-10K", "10-20K", "20-50K", "50K以上"];
    const experienceOptions = ["不限", "在校生", "应届生", "经验不限", "1年以内", "1-3年", "3-5年", "5-10年", "10年以上"];
    const educationOptions = ["不限", "初中及以下", "中专/中技", "高中", "大专", "本科", "硕士", "博士"];
    const industryOptions = [
      "互联网/AI",
      "互联网",
      "电子商务",
      "计算机软件",
      "生活服务(O2O)",
      "企业服务",
      "医疗健康",
      "游戏",
      "社交网络与媒体",
      "人工智能",
      "云计算",
      "在线教育",
      "计算机服务",
      "大数据",
      "广告营销",
      "物联网",
      "新零售",
      "信息安全",
      "电子/通信/半导体",
      "半导体芯片",
      "电子/硬件开发",
      "通信网络设备"
    ];
    const sizeOptions = ["不限", "0-20人", "20-99人", "100-499人", "500-999人", "1000-9999人", "10000人以上"];

    const toggleSection = (section) => {
      const current = expandedSections.value[section];
      Object.keys(expandedSections.value).forEach((key) => {
        expandedSections.value[key] = false;
      });
      expandedSections.value[section] = !current;
    };

    const selectFilter = (type, value) => {
      const newQuery = {
        ...route.query,
        [type]: value,
      };
      router.push({
        path: route.path,
        query: newQuery,
      });
      // 选择后收起当前菜单
      if (expandedSections.value[type] !== undefined) {
        expandedSections.value[type] = false;
      }
    };

    const totalPages = computed(() =>
      Math.ceil(total.value / itemsPerPage)
    );

    const displayedCareers = computed(() => {
      const {
        location = "",
        jobType = "",
        salary = "",
        experience = "",
        education = "",
        industry = "",
        size = "",
      } = route.query;

      return careers.value.filter((career) => {
        // 城市：如果职位有城市信息，则按包含关系过滤；否则不过滤该职位
        if (
          location &&
          career.location &&
          !career.location.includes(location)
        ) {
          return false;
        }

        // 求职类型：同理，只对有 jobType 的职位做过滤
        if (
          jobType &&
          jobType !== "不限" &&
          career.jobType &&
          !career.jobType.includes(jobType)
        ) {
          return false;
        }

        // 薪资待遇：只对有 salary 的职位做过滤
        if (
          salary &&
          salary !== "不限" &&
          career.salary &&
          !career.salary.includes(salary)
        ) {
          return false;
        }

        // 工作经验：只对有 experience 的职位做过滤
        if (
          experience &&
          experience !== "不限" &&
          career.experience &&
          !career.experience.includes(experience)
        ) {
          return false;
        }

        // 学历要求：只对有 education 的职位做过滤
        if (
          education &&
          education !== "不限" &&
          career.education &&
          !career.education.includes(education)
        ) {
          return false;
        }

        // 公司行业：只对有 industry 的职位做过滤
        if (industry && career.industry && !career.industry.includes(industry)) {
          return false;
        }

        // 公司规模：只对有 size 的职位做过滤
        if (
          size &&
          size !== "不限" &&
          career.size &&
          !career.size.includes(size)
        ) {
          return false;
        }

        return true;
      });
    });

    const fetchCareers = async (page = 1) => {
      try {
        const data = await request.get("/crawler/job-info/list/page", {
          params: {
            current: page,
            pageSize: itemsPerPage,
          },
        });
        const records = (data && data.records) || [];
        total.value = data?.total || records.length;
        careers.value = records.map((job) => ({
          id: job.id,
          title: job.workName || "职位名称缺失",
          description: job.workContent || "暂无岗位说明",
          tags: [job.workYear, job.graduate].filter(Boolean),
          salary: job.workSalary || "薪资面议",
          company: job.companyName || "未知公司",
          location: job.workAddress || "",
          url: job.url || "#",
          // 额外字段用于筛选
          jobType: job.workType || job.jobType || "",
          experience: job.workYear || "",
          education: job.graduate || "",
          industry: job.companyIndustry || "",
          size: job.companySize || "",
        }));
      } catch (e) {
        console.error("加载职业展示数据失败:", e);
        // 回退到本地 mock 数据，保证页面可用
        total.value = mockCareers.length;
        careers.value = mockCareers.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          tags: item.skills,
          salary: item.salary,
          company: item.title,
          location: "未知",
          url: "#",
          jobType: "",
          experience: "",
          education: "",
          industry: "",
          size: "",
        }));
      }
    };

    const handlePageChange = async (page) => {
      currentPage.value = page;
      await fetchCareers(page);
      window.scrollTo(0, 0);
    };

    onMounted(() => {
      fetchCareers(currentPage.value);
    });

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
      locationOptions,
      jobTypeOptions,
      salaryOptions,
      experienceOptions,
      educationOptions,
      industryOptions,
      sizeOptions,
      toggleSection,
      selectFilter,
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

.filter-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.location-icon {
  width: 16px;
  height: 16px;
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

.simple-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #444;
}

.simple-options span {
  cursor: pointer;
}

.simple-options span:hover {
  color: #2563eb;
}

.industry-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 16px;
  font-size: 14px;
  color: #444;
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

.job-card {
  border-radius: 16px;
  border: 1px solid #09a6a7;
  padding: 20px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.job-title {
  flex: 1;
  min-width: 0;
  margin-right: 12px;
}

.job-header h3 {
  margin: 0;
  font-size: 18px;
  color: #069fad;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.job-salary {
  font-size: 18px;
  font-weight: 600;
  color: #ff6c5a;
  white-space: nowrap;
  flex-shrink: 0;
}

.job-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.job-tag {
  background: #f3f7f8;
  padding: 4px 10px;
  border-radius: 8px;
  color: #555;
  font-size: 13px;
}

.job-description {
  font-size: 14px;
  color: #444;
  line-height: 1.6;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.job-company {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #666;
  font-size: 14px;
}

.company-name {
  font-weight: 600;
  color: #222;
}

.job-location {
  color: #999;
  font-size: 13px;
}

.job-link {
  color: #069fad;
  text-decoration: none;
  font-weight: 600;
}

.job-link:hover {
  text-decoration: underline;
}
/* 确保内容区域占据可用高度，Footer显示在底部 */
.content-container {
  flex: 1;
  margin-bottom: 20px;
}
</style>
