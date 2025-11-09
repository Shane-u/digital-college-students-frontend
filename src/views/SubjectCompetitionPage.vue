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
        <span class="current-page">学科专业竞赛</span>
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
            <!-- 学科分类下拉框 -->
            <div class="category-dropdown" ref="categoryDropdown">
              <div
                class="filter-select category-select"
                @click="toggleCategoryDropdown"
              >
                <span>{{
                  selectedCategoryLabel || "学科分类"
                }}</span>
      
              </div>
              <div
                class="category-dropdown-menu"
                v-show="isCategoryDropdownOpen"
              >
                <div
                  v-for="category in categoryData"
                  :key="category.name"
                  class="category-group"
                >
                  <div
                    class="category-group-header"
                    @click.stop="toggleCategoryGroup(category.name)"
                  >
                    <span>{{ category.name }}</span>
                    <svg
                      class="group-chevron"
                      :class="{ expanded: expandedGroups[category.name] }"
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
                  <div
                    class="category-group-items"
                    v-show="expandedGroups[category.name]"
                  >
                    <div
                      v-for="son in category.sons"
                      :key="son.value"
                      class="category-item"
                      :class="{ active: selectedCategoryValue === son.value }"
                      @click.stop="selectCategory(son)"
                    >
                      {{ son.label }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <select class="filter-select" v-model="filterLevel">
              <option value="">赛事级别</option>
              <option value="1">校级</option>
              <option value="2">市级</option>
              <option value="3">省级</option>
              <option value="4">全国性</option>
              <option value="5">全球性</option>
              <option value="6">自由</option>
              <option value="7">其他</option>
            </select>
            <select class="filter-select" v-model="filterTimeStatus">
              <option value="">赛事阶段</option>
              <option value="13">报名结束</option>
              <option value="22">比赛进行中</option>
              <option value="23">比赛结束</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="content-container">
      <!-- 左侧介绍区 -->
      <aside class="left-intro">
        <div class="intro-content">
          <h1 class="intro-title">学科专业竞赛</h1>
          <p class="intro-description">
            聚焦各学科领域权威竞赛，整合赛事详情、参赛要求与备赛资源，为大学生呈现清晰的竞赛参与路径，助力在专业赛道中展现实力、斩获佳绩。
          </p>

          <div class="intro-buttons">
            <router-link to="/competition/edu" class="intro-btn primary"
              >教育部榜单竞赛</router-link
            >
            <router-link to="/home" class="intro-btn secondary">
              首页
              <span class="btn-dot"></span>
            </router-link>
          </div>

          <!-- 学科分类标签 -->
          <div class="subject-categories">
            <button
              v-for="(subject, index) in subjects"
              :key="index"
              class="category-tag"
              :class="{ active: selectedSubject === subject.label }"
              @click="selectSubject(subject.label)"
            >
              {{ subject.label }}
            </button>
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
              <div class="card-content-wrapper">
                <div class="card-image-wrapper">
                  <img
                    :src="competition.thumbPic || competition.image || 'https://via.placeholder.com/400x250'"
                    :alt="competition.contestName || competition.title"
                    class="card-image"
                    @error="handleImageError"
                  />
                </div>
                <div class="sprints_bottom-part">
                  <h3>
                    <router-link
                      :to="`/competition/detail/${competition.contestId || competition.id}`"
                      class="card-title-link"
                    >
                      {{ competition.contestName || competition.title }}
                    </router-link>
                  </h3>
                  <p class="gd-paragraph">
                    {{ getCompetitionDescription(competition) }}
                  </p>
                </div>
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
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import Pagination from "../components/Pagination.vue";
import NavBar from "../components/NavBar.vue";
import { getContestList } from "../api/competitionApi.js";
import { ElMessage } from "element-plus";

export default {
  name: "SubjectCompetitionPage",
  components: {
    Pagination,
    NavBar,
    Footer,
  },
  setup() {
    const isNavTransparent = ref(false);
    const isSubmenuOpen = ref(false);

    // 过滤器状态
    const searchQuery = ref("");
    const filterLevel = ref(""); // 赛事级别
    const filterPerson = ref(""); // 参赛对象（暂时保留，接口暂不支持）
    const filterTimeStatus = ref(""); // 赛事阶段

    // 学科分类数据
    const categoryData = ref([
      {
        name: "文体",
        sons: [
          { label: "外语", value: 19 },
          { label: "UI设计", value: 20 },
          { label: "工业&创意设计", value: 21 },
          { label: "服装设计", value: 22 },
          { label: "模特", value: 23 },
          { label: "演讲主持&辩论", value: 24 },
          { label: "歌舞书画&摄影", value: 25 },
          { label: "电子竞技", value: 31 },
          { label: "体育", value: 32 },
          { label: "科技文化艺术节", value: 33 },
          { label: "艺术素养", value: 36 },
        ],
      },
      {
        name: "商科",
        sons: [
          { label: "创业", value: 3 },
          { label: "创青春", value: 8 },
          { label: "商业", value: 26 },
        ],
      },
      {
        name: "综合",
        sons: [
          { label: "挑战杯", value: 7 },
          { label: "环保公益", value: 27 },
          { label: "职业技能", value: 28 },
          { label: "社会综合", value: 29 },
        ],
      },
      {
        name: "理科",
        sons: [
          { label: "数学", value: 16 },
          { label: "物理", value: 17 },
          { label: "化学化工", value: 18 },
          { label: "健康生命&医学", value: 30 },
          { label: "力学", value: 35 },
        ],
      },
      {
        name: "工科",
        sons: [
          { label: "数学建模", value: 1 },
          { label: "程序设计", value: 2 },
          { label: "机器人", value: 4 },
          { label: "电子&自动化", value: 5 },
          { label: "计算机&信息技术", value: 6 },
          { label: "工程机械", value: 9 },
          { label: "土木建筑", value: 10 },
          { label: "交通车辆", value: 11 },
          { label: "航空航天", value: 12 },
          { label: "船舶海洋", value: 13 },
          { label: "材料高分子", value: 14 },
          { label: "环境能源", value: 15 },
          { label: "大数据", value: 34 },
        ],
      },
    ]);

    // 学科分类下拉框状态
    const isCategoryDropdownOpen = ref(false);
    const expandedGroups = ref({});
    const selectedCategoryValue = ref(null);
    const selectedCategoryLabel = ref("");
    const categoryDropdown = ref(null);

    // 切换分类下拉框
    const toggleCategoryDropdown = () => {
      isCategoryDropdownOpen.value = !isCategoryDropdownOpen.value;
    };

    // 切换分类组展开/折叠
    const toggleCategoryGroup = (groupName) => {
      expandedGroups.value[groupName] = !expandedGroups.value[groupName];
    };

    // 选择分类
    const selectCategory = (son) => {
      selectedCategoryValue.value = son.value;
      selectedCategoryLabel.value = son.label;
      isCategoryDropdownOpen.value = false;
      // 选择分类后重新加载数据
      currentPage.value = 1;
      selectedSubject.value = ""; // 清空学科选择
      fetchCompetitions();
    };

    // 点击外部关闭下拉框
    const handleClickOutside = (event) => {
      if (
        categoryDropdown.value &&
        !categoryDropdown.value.contains(event.target)
      ) {
        isCategoryDropdownOpen.value = false;
      }
    };

    // 滚动相关
    const listContainer = ref(null);
    const cardGrid = ref(null);
    const currentScrollPosition = ref(0);

    // 监听页面滚动，控制导航栏透明度
    const handleScroll = () => {
      isNavTransparent.value = window.scrollY < 50;
    };

    // 切换子菜单的展开/收起状态
    const toggleSubmenu = () => {
      isSubmenuOpen.value = !isSubmenuOpen.value;
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
      if (!cardGrid.value.style) return; // 确保元素已挂载

      const containerHeight = listContainer.value.offsetHeight;
      const cards = cardGrid.value.children;
      if (cards.length === 0) return;

      const cardHeight = cards[0].offsetHeight + 30; // 卡片高度 + margin
      // 计算偏移量，确保当前项在容器中居中显示
      const offset =
        -currentScrollPosition.value * cardHeight +
        (containerHeight - cardHeight) / 2;

      if (cardGrid.value && cardGrid.value.style) {
        cardGrid.value.style.transform = `translateY(${offset}px)`;
      }
    };

    onMounted(() => {
      window.addEventListener("scroll", handleScroll);
      handleScroll();
      document.addEventListener("click", handleClickOutside);

      // 如果当前路径是学科竞赛页面，初始展开子菜单
      if (window.location.pathname === "/competition/subject") {
        isSubmenuOpen.value = true;
      }

      // 初始化加载数据
      fetchCompetitions();
    });

    onUnmounted(() => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClickOutside);
    });

    // 学科列表（映射到分类ID）
    const subjects = [
      { label: "数学类", classId: 16 },
      { label: "计算机类", classId: 6 },
      { label: "电子信息类", classId: 5 },
      { label: "机械类", classId: 9 },
      { label: "土木建筑类", classId: 10 },
      { label: "化工类", classId: 18 },
      { label: "生物医学类", classId: 30 },
      { label: "经济管理类", classId: 26 },
      { label: "外语类", classId: 19 },
      { label: "人文社科类", classId: 29 },
    ];

    const selectedSubject = ref("");
    const competitions = ref([]);
    const total = ref(0);
    const currentPage = ref(1);
    const itemsPerPage = 10;
    const loading = ref(false);
    const fetchCompetitions = async () => {
      loading.value = true;
      try {
        const params = {
          current: currentPage.value,
          pageSize: itemsPerPage,
        };

        // 添加分类ID（优先使用下拉框选择的分类，否则使用学科标签）
        if (selectedCategoryValue.value) {
          params.classId = selectedCategoryValue.value.toString();
        } else if (selectedSubject.value) {
          const subjectObj = subjects.find((s) => s.label === selectedSubject.value);
          if (subjectObj) {
            params.classId = subjectObj.classId.toString();
          }
        }

        // 添加级别筛选
        if (filterLevel.value) {
          params.level = parseInt(filterLevel.value);
        }

        // 添加时间状态筛选
        if (filterTimeStatus.value) {
          params.timeStatus = parseInt(filterTimeStatus.value);
        }

        // 添加搜索关键词
        if (searchQuery.value) {
          params.contestName = searchQuery.value;
        }

        const response = await getContestList(params);
        
        if (response && response.records) {
          competitions.value = response.records;
          total.value = response.total || 0;
        } else {
          competitions.value = [];
          total.value = 0;
        }
      } catch (error) {
        console.error("获取竞赛列表失败:", error);
        ElMessage.error("获取竞赛列表失败，请稍后重试");
        competitions.value = [];
        total.value = 0;
      } finally {
        loading.value = false;
        // 更新列表位置
        setTimeout(() => {
          updateListPosition();
        }, 100);
      }
    };

    // 获取竞赛描述
    const getCompetitionDescription = (competition) => {
      const parts = [];
      if (competition.levelName) {
        parts.push(competition.levelName);
      }
      if (competition.organiserName) {
        parts.push(`主办方：${competition.organiserName}`);
      }
      if (competition.contestClassFirst || competition.contestClassSecond) {
        const category = [competition.contestClassFirst, competition.contestClassSecond]
          .filter(Boolean)
          .join("·");
        parts.push(`分类：${category}`);
      }
      if (competition.timeName) {
        parts.push(`状态：${competition.timeName}`);
      }
      return parts.length > 0
        ? parts.join(" | ")
        : "这是一项重要的竞赛活动，旨在提升学生的专业技能和综合素质。";
    };

    // 处理图片加载错误
    const handleImageError = (event) => {
      event.target.src = "https://via.placeholder.com/400x250";
    };

    const totalPages = computed(() => {
      return Math.max(1, Math.ceil(total.value / itemsPerPage));
    });

    const displayedCompetitions = computed(() => {
      return competitions.value;
    });

    const selectSubject = (subject) => {
      if (selectedSubject.value === subject) {
        selectedSubject.value = ""; // 如果再次点击已选中的，则取消选择
        selectedCategoryValue.value = null; // 清空分类选择
        selectedCategoryLabel.value = "";
      } else {
        selectedSubject.value = subject;
        selectedCategoryValue.value = null; // 清空分类选择
        selectedCategoryLabel.value = "";
      }
      currentPage.value = 1;
      fetchCompetitions();
    };

    const handlePageChange = (page) => {
      currentPage.value = page;
      currentScrollPosition.value = 0; // 重置滚动位置
      fetchCompetitions();
      window.scrollTo(0, 0);
    };

    // 监听过滤器变化
    watch([filterLevel, filterTimeStatus], () => {
      currentPage.value = 1;
      fetchCompetitions();
    });

    // 监听学科选择变化
    watch(selectedSubject, () => {
      currentPage.value = 1;
      currentScrollPosition.value = 0;
      fetchCompetitions();
    });

    // 防抖搜索
    let searchTimer = null;
    watch(searchQuery, () => {
      if (searchTimer) {
        clearTimeout(searchTimer);
      }
      searchTimer = setTimeout(() => {
        currentPage.value = 1;
        fetchCompetitions();
      }, 500);
    });

    return {
      isNavTransparent,
      isSubmenuOpen,
      subjects,
      selectedSubject,
      currentPage,
      totalPages,
      competitions,
      displayedCompetitions,
      selectSubject,
      handlePageChange,
      toggleSubmenu,
      searchQuery,
      filterLevel,
      filterTimeStatus,
      listContainer,
      cardGrid,
      currentScrollPosition,
      handleWheel,
      categoryData,
      isCategoryDropdownOpen,
      expandedGroups,
      selectedCategoryValue,
      selectedCategoryLabel,
      categoryDropdown,
      toggleCategoryDropdown,
      toggleCategoryGroup,
      selectCategory,
      loading,
      getCompetitionDescription,
      handleImageError,
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

/* 学科分类标签 */
.subject-categories {
  margin-top: 32px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-tag {
  padding: 8px 20px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.category-tag:hover {
  background-color: #f8f8f8;
  border-color: #bbb;
}

.category-tag.active {
  background-color: #6366f1;
  border-color: #6366f1;
  color: white;
  font-weight: 500;
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

.card-content-wrapper {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.card-image-wrapper {
  flex-shrink: 0;
  width: 300px;
  height: 200px;
  border-radius: 0.75rem;
  overflow: hidden;
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

.sprints_bottom-part {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.sprints_bottom-part h3 {
  margin-bottom: 1rem;
  font-size: 1.6rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
}

.card-title-link {
  color: #1a1a1a;
  text-decoration: none;
  transition: color 0.3s ease;
}

.card-title-link:hover {
  color: #3b82f6;
  text-decoration: underline;
}

.gd-paragraph {
  line-height: 1.7;
  color: #555;
  font-size: 1rem;
  margin: 0;
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

/* 学科分类下拉框样式 */
.category-dropdown {
  position: relative;
  min-width: 120px;
}

.category-select {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
}

.dropdown-chevron {
  width: 12px;
  height: 12px;
  color: #ffffff;
  transition: transform 0.3s ease;
  flex-shrink: 0;
  margin-left: 8px;
}

.dropdown-chevron.expanded {
  transform: rotate(180deg);
}

.category-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: rgba(45, 27, 78, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  min-width: 200px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.category-group {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.category-group:last-child {
  border-bottom: none;
}

.category-group-header {
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
  user-select: none;
}

.category-group-header:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.group-chevron {
  width: 10px;
  height: 10px;
  color: #ffffff;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.group-chevron.expanded {
  transform: rotate(180deg);
}

.category-group-items {
  background-color: rgba(26, 15, 46, 0.8);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.category-item {
  padding: 10px 16px 10px 32px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  transition: all 0.2s;
  user-select: none;
}

.category-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.category-item.active {
  background-color: rgba(231, 76, 140, 0.3);
  color: #ff6b9d;
  font-weight: 500;
}

/* 确保内容区域占据可用高度，Footer显示在底部 */
.content-container {
  flex: 1;
  margin-bottom: 20px;
}
</style>
