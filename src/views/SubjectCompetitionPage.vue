<template>
  <div class="competition-page">
    <!-- 使用共享导航组件 -->
    <NavBar :transparent="false" />

    <!-- 面包屑导航 -->
    <div class="breadcrumb-container">
      <div class="breadcrumb">
        <router-link to="/home">首页</router-link>
        <span>&gt;&gt;</span>
        <a>竞赛活动</a>
        <span>&gt;&gt;</span>
        <span class="current-page">学科专业竞赛</span>
      </div>
      <div class="divider"></div>
    </div>

    <div class="content-container">
      <!-- 左侧边栏 -->
      <aside class="sidebar">
        <router-link 
          to="/competition/edu" 
          class="sidebar-item" 
          :class="{ 'active': $route.path === '/competition/edu' }">
          教育部榜单竞赛
        </router-link>
        <div class="sidebar-dropdown">
          <router-link 
            to="/competition/subject" 
            class="sidebar-item" 
            :class="{ 'active': $route.path === '/competition/subject' }">
            学科专业竞赛
          </router-link>
          <div class="sidebar-submenu" :class="{ 'open': $route.path === '/competition/subject' }">
            <div class="subject-list" @click.stop>
              <a 
                v-for="(subject, index) in subjects" 
                :key="index"
                href="#"
                class="subject-item"
                :class="{ 'active': selectedSubject === subject }"
                @click.prevent="selectSubject(subject)"
              >
                {{ subject }}
              </a>
            </div>
          </div>
        </div>
      </aside>

      <!-- 右侧内容区 -->
      <div class="main-content">
        <h2 class="content-title">{{ selectedSubject || '学科专业竞赛' }}</h2>

        <!-- 竞赛列表 -->
        <competition-list :competitions="displayedCompetitions" />

        <!-- 分页 -->
        <pagination 
          :total-pages="totalPages" 
          :current-page="currentPage"
          @page-change="handlePageChange" 
          v-if="displayedCompetitions.length > 0"
        />
      </div>
    </div>
    
    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import Footer from '../components/Footer.vue';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import CompetitionList from '../components/CompetitionList.vue';
import Pagination from '../components/Pagination.vue';
import NavBar from '../components/NavBar.vue';

// 模拟各学科数据
const createSubjectCompetitions = (subject, count = 3) => {
  return Array(count).fill(null).map((_, index) => ({
    id: `${subject}-${index + 1}`,
    title: `${subject}竞赛项目 ${index + 1}`,
    image: `https://picsum.photos/id/${(Math.floor(Math.random() * 50) + 10)}/200/120`,
    link: '#',
  }));
};

export default {
  name: 'SubjectCompetitionPage',
  components: {
    CompetitionList,
    Pagination,
    NavBar,
    Footer
  },
  setup() {
    const isNavTransparent = ref(false);
    
    // 监听页面滚动，控制导航栏透明度
    const handleScroll = () => {
      isNavTransparent.value = window.scrollY < 50;
    };
    
    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
      // 初始状态
      handleScroll();
    });
    
    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
    });
    
    // 学科列表
    const subjects = [
      '数学类',
      '计算机类',
      '电子信息类',
      '机械类',
      '土木建筑类',
      '化工类',
      '生物医学类',
      '经济管理类',
      '外语类',
      '人文社科类'
    ];
    
    const selectedSubject = ref('');
    const currentPage = ref(1);
    const itemsPerPage = 10;
    
    // 创建所有学科的竞赛数据
    const allSubjectCompetitions = {};
    subjects.forEach(subject => {
      allSubjectCompetitions[subject] = createSubjectCompetitions(subject);
    });
    
    // 当前显示的竞赛
    const competitions = ref([]);
    
    // 当选择学科变化时重置页码
    watch(selectedSubject, () => {
      currentPage.value = 1;
      if (selectedSubject.value) {
        competitions.value = allSubjectCompetitions[selectedSubject.value] || [];
      } else {
        // 默认显示所有学科的前几个
        competitions.value = subjects.flatMap(subject => 
          allSubjectCompetitions[subject].slice(0, 1)
        );
      }
    });
    
    // 初始化默认显示所有学科的前几个
    competitions.value = subjects.flatMap(subject => 
      allSubjectCompetitions[subject].slice(0, 1)
    );
    
    const totalPages = computed(() => Math.max(1, Math.ceil(competitions.value.length / itemsPerPage)));
    
    const displayedCompetitions = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return competitions.value.slice(start, end);
    });
    
    const selectSubject = (subject) => {
      if (selectedSubject.value === subject) {
        selectedSubject.value = '';  // 如果再次点击已选中的，则取消选择
      } else {
        selectedSubject.value = subject;
      }
    };
    
    const handlePageChange = (page) => {
      currentPage.value = page;
      window.scrollTo(0, 0);
    };
    
    return {
      isNavTransparent,
      subjects,
      selectedSubject,
      currentPage,
      totalPages,
      competitions,
      displayedCompetitions,
      selectSubject,
      handlePageChange
    };
  }
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
.navbar {
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
}

.nav-inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  align-items: center;
}

.nav-left, .nav-center, .nav-right {
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
  margin: 20px auto 0;
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  gap: 30px;
}

/* 侧边栏 */
.sidebar {
  width: 200px;
  flex-shrink: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.sidebar-item {
  display: block;
  padding: 15px 20px;
  color: #333;
  text-decoration: none;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.sidebar-item:hover {
  background-color: #f8f8f8;
}

.sidebar-item.active {
  background-color: #6366F1;
  color: white;
}

/* 侧边栏下拉菜单 */
.sidebar-dropdown {
  position: relative;
}

.sidebar-submenu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.sidebar-submenu.open {
  max-height: 500px; /* 根据实际内容调整高度 */
}

.subject-list {
  max-height: 300px;
  overflow-y: auto;
  border-top: 1px solid #f0f0f0;
  background-color: #f9f9f9;
}

.subject-item {
  display: block;
  padding: 12px 20px 12px 30px;
  color: #555;
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.2s;
  border-bottom: 1px solid #eaeaea;
}

.subject-item:hover {
  background-color: #f0f0f0;
}

.subject-item.active {
  color: #6366F1;
  background-color: #eff3ff;
  font-weight: 500;
}

/* 主内容区 */
.main-content {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.content-title {
  font-size: 24px;
  margin: 0 0 20px;
  color: #333;
}

/* 确保内容区域占据可用高度，Footer显示在底部 */
.content-container {
  flex: 1;
  margin-bottom: 20px;
}
</style>
