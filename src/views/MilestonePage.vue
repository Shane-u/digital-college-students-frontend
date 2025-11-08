<template>
  <div class="milestone-page">
    <!-- 导航栏 -->
    <NavBar :transparent="false" />

    <!-- 侧边栏 -->
    <SidebarMenu />

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">发展里程碑</h1>
          <p class="page-subtitle">记录大学生活的重要时刻</p>
          <button class="add-milestone-btn" @click="addMilestone">
            添加里程碑
          </button>
        </div>
        <div class="header-right">
          <SearchBar placeholder="搜索里程碑..." @search="handleSearch" />
        </div>
      </div>

      <!-- 统计卡片区域 -->
      <div class="stats-container">
        <!-- 总里程碑 -->
        <div class="stat-card">
          <div class="stat-icon">
            <img src="../assets/chengzhang_icon/trophy.png" alt="里程碑" class="icon-img" />
          </div>
          <div class="stat-content">
            <div class="stat-label">总里程碑</div>
            <div class="stat-value">{{ totalMilestones }}</div>
          </div>
        </div>

        <!-- 最近记录 -->
        <div class="stat-card">
          <div class="stat-icon">
            <img src="../assets/chengzhang_icon/clock.png" alt="最近记录" class="icon-img" />
          </div>
          <div class="stat-content">
            <div class="stat-label">最近记录</div>
            <div class="stat-value">{{ latestRecordDate }}</div>
          </div>
        </div>

        <!-- 记录时长 -->
        <div class="stat-card">
          <div class="stat-icon">
            <img src="../assets/chengzhang_icon/calendar.png" alt="记录时长" class="icon-img" />
          </div>
          <div class="stat-content">
            <div class="stat-label">记录时长</div>
            <div class="stat-value">{{ totalTags }}</div>
          </div>
        </div>
      </div>

      <!-- 成长轨迹 -->
      <div class="timeline-section">
        <ChengzhangGuiji :timelineList="milestoneTimeline" :hideHeader="true" @dateClick="handleDateClick" @subDateClick="handleSubDateClick" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import NavBar from "../components/NavBar.vue";
import SidebarMenu from "../components/SidebarMenu.vue";
import ChengzhangGuiji from "../components/ChengzhangGuiji.vue";
import SearchBar from "../components/SearchBar.vue";

const router = useRouter();

// 里程碑数据
const milestones = ref([]);
const searchKeyword = ref("");

// 热门标签
const hotTags = computed(() => {
  const tagMap = {};

  milestones.value.forEach((milestone) => {
    if (milestone.tags && milestone.tags.length > 0) {
      milestone.tags.forEach((tag) => {
        if (tagMap[tag]) {
          tagMap[tag]++;
        } else {
          tagMap[tag] = 1;
        }
      });
    }
  });

  // 转换为数组并排序
  const tagArray = Object.entries(tagMap).map(([name, count]) => ({
    name,
    count,
  }));
  tagArray.sort((a, b) => b.count - a.count);

  return tagArray.slice(0, 3);
});

// 总里程碑数
const totalMilestones = computed(() => milestones.value.length);

// 记录时长（天数）
const totalTags = computed(() => {
  if (milestones.value.length === 0) return '0天';
  
  // 找到最早和最晚的里程碑
  const dates = milestones.value.map(m => new Date(m.date));
  const earliest = new Date(Math.min(...dates));
  const latest = new Date(Math.max(...dates));
  
  // 计算天数差
  const diffTime = latest - earliest;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '当天';
  return `${diffDays}天`;
});

// 最近记录日期
const latestRecordDate = computed(() => {
  if (milestones.value.length === 0) return "暂无记录";

  const latestMilestone = milestones.value.reduce((latest, current) => {
    return new Date(current.date) > new Date(latest.date) ? current : latest;
  });

  return latestMilestone.date;
});

// 搜索功能
const handleSearch = (keyword) => {
  searchKeyword.value = keyword;
};

// 处理主时间节点点击（年份）
const handleDateClick = (item) => {
  // 点击年份时，跳转到该年的第一条记录
  if (item.children && item.children.length > 0) {
    const firstDate = item.children[0].name;
    router.push({
      path: '/growth/record',
      query: { date: firstDate }
    });
  }
};

// 处理子日期点击
const handleSubDateClick = (subItem) => {
  // 点击具体日期时，跳转到成长记录页面并定位到该日期
  router.push({
    path: '/growth/record',
    query: { date: subItem.name }
  });
};

// 成长轨迹时间线数据
const milestoneTimeline = computed(() => {
  // 从localStorage获取成长记录
  const savedRecords = localStorage.getItem("growthRecords");
  if (!savedRecords) {
    return getDefaultTimeline();
  }

  const records = JSON.parse(savedRecords);

  // 过滤重要程度>=4的记录
  let importantRecords = records.filter((r) => r.importance >= 4);

  // 根据搜索关键词过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    importantRecords = importantRecords.filter((record) => {
      const description = (record.description || "").toLowerCase();
      const reflection = (record.reflection || "").toLowerCase();
      return description.includes(keyword) || reflection.includes(keyword);
    });
  }

  if (importantRecords.length === 0) {
    return getDefaultTimeline();
  }

  // 按年份分组
  const yearGroups = {};
  importantRecords.forEach((record) => {
    const year = new Date(record.date).getFullYear();
    if (!yearGroups[year]) {
      yearGroups[year] = [];
    }
    yearGroups[year].push(record);
  });

  // 转换为时间线格式
  const timeline = [];
  let id = 1;

  Object.keys(yearGroups)
    .sort()
    .forEach((year) => {
      const yearRecords = yearGroups[year];
      yearRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

      timeline.push({
        id: id++,
        date: year,
        title: `${year}年`,
        content: `共${yearRecords.length}个重要里程碑`,
        isShow: true,
        children: yearRecords.map((record) => ({
          name: record.date,
          content: record.description || record.reflection || "重要事件",
        })),
      });
    });

  return timeline;
});

// 默认时间线（如果没有记录）
const getDefaultTimeline = () => {
  return [
    {
      id: 1,
      date: "2018",
      title: "大一",
      content: "探索方向，在新鲜与迷茫中锚定初心",
      isShow: true,
      children: [
        {
          name: "2018.9.15",
          content: "加入校学生会文艺部，参与迎新晚会策划",
        },
        {
          name: "2018.11.3",
          content: "首次参加校级数学建模竞赛，获优秀奖",
        },
        {
          name: "2018.12.20",
          content: "加入英语角社团，坚持每周口语练习",
        },
      ],
    },
    {
      id: 2,
      date: "2019",
      title: "大二",
      content: "沉淀积累，用知识和实践搭建成长框架",
      isShow: true,
      children: [
        {
          name: "2019.3.10",
          content: "组队参加'互联网+'创新创业大赛，进入校赛决赛",
        },
        {
          name: "2019.5.25",
          content: "通过大学英语六级考试，分数520分",
        },
        {
          name: "2019.9.8",
          content: "担任班级学习委员，组织专业课答疑小组",
        },
      ],
    },
    {
      id: 3,
      date: "2020",
      title: "大三",
      content: "突破边界，在挑战里找到专属竞争力",
      isShow: true,
      children: [
        {
          name: "2020.1.15",
          content: "获得国家励志奖学金，专业排名前5%",
        },
        {
          name: "2020.4.20",
          content: "参与教师主持的科研项目，负责数据收集分析",
        },
        {
          name: "2020.6.30",
          content: "暑期在某科技公司实习，完成3个项目模块开发",
        },
      ],
    },
  ];
};

// 添加里程碑
const addMilestone = () => {
  // 这里可以添加跳转到成长记录页面的逻辑
  window.location.href = "/growth/record";
};

// 加载里程碑数据
const loadMilestones = () => {
  const savedRecords = localStorage.getItem("growthRecords");
  if (savedRecords) {
    const records = JSON.parse(savedRecords);
    // 过滤重要程度>=4的记录作为里程碑
    milestones.value = records.filter((r) => r.importance >= 4);
  }
};

onMounted(() => {
  loadMilestones();
});
</script>

<style scoped>
.milestone-page {
  min-height: 100vh;
  background-color: #ffffff;
  padding-top: 80px;
  position: relative;
}

.milestone-page::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(149, 117, 181, 0.05);
  pointer-events: none;
}

.main-content {
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
  gap: 24px;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  padding-top: 8px;
}

.page-title {
  font-size: 36px;
  font-weight: 800;
  color: #0b2a4a;
  margin-bottom: 12px;
}

.page-subtitle {
  font-size: 16px;
  color: #7f8c8d;
  margin-bottom: 20px;
}

.add-milestone-btn {
  background: #7d5196;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 7px 7px white, 12px 12px 3px #cfc2d8;
}

.add-milestone-btn:hover {
  background: #9575b5;
  transform: translateY(-2px);
  box-shadow: 5px 5px white, 10px 10px 3px #cfc2d8;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(184, 160, 200, 0.3);
}

.stat-icon {
  font-size: 48px;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(184, 160, 200, 0.1);
  border-radius: 12px;
}

.icon-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: rgb(48, 20, 97);
}

.timeline-section {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 覆盖 ChengzhangGuiji 组件样式 - 仅在里程碑页面生效 */
:deep(.long-line .sub-item-box .sub-line-box) {
  justify-content: space-evenly;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .main-content {
    padding: 20px;
  }
  
  .stats-container {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 28px;
  }
}
</style>

