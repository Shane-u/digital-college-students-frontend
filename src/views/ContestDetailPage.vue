<template>
  <div class="contest-detail-page">
    <!-- 使用共享导航组件 -->
    <NavBar :transparent="false" />

    <!-- 面包屑导航 -->
    <div class="breadcrumb-container">
      <div class="breadcrumb">
        <router-link to="/home">首页</router-link>
        <span>&gt;&gt;</span>
        <router-link to="/competition/edu">竞赛活动</router-link>
        <span>&gt;&gt;</span>
        <span class="current-page">竞赛详情</span>
      </div>
      <div class="divider"></div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 详情内容 -->
    <div v-else-if="contestDetail" class="detail-content">
      <div class="detail-container">
        <!-- 标题区域 -->
        <div class="detail-header">
          <h1 class="detail-title">{{ contestDetail.contest_name }}</h1>
      </div>

        <!-- 内容区域 -->
        <div class="detail-right">
          <!-- 详情内容 -->
          <div class="detail-content-section" v-if="contestDetail.content">
            <div class="content-text" v-html="contestDetail.content"></div>
          </div>
          <div v-else class="no-content">
            <p>暂无详细内容</p>
          </div>

          <!-- 操作按钮 -->
          <div class="detail-actions">
            <a
              v-if="contestDetail.contestUrl"
              :href="contestDetail.contestUrl"
              target="_blank"
              class="action-btn primary"
            >
              访问竞赛官网
            </a>
            <button class="action-btn secondary" @click="goBack">
              返回列表
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <p>竞赛信息加载失败，请稍后重试</p>
      <button class="action-btn primary" @click="fetchContestDetail">重新加载</button>
    </div>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import Footer from "../components/Footer.vue";
import NavBar from "../components/NavBar.vue";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getContestDetail } from "../api/competitionApi.js";
import { ElMessage } from "element-plus";

export default {
  name: "ContestDetailPage",
  components: {
    NavBar,
    Footer,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const contestDetail = ref(null);
    const loading = ref(true);

    // 获取竞赛详情
    const fetchContestDetail = async () => {
      const contestId = route.params.id;
      if (!contestId) {
        ElMessage.error("竞赛ID不存在");
        router.push("/competition/edu");
        return;
      }

      loading.value = true;
      try {
        const response = await getContestDetail(parseInt(contestId));
        console.log("API返回数据:", response); // 调试用
        // 处理不同的响应结构
        if (response) {
          // 如果response有data属性，使用data，否则直接使用response
          contestDetail.value = response.data || response;
          console.log("处理后的数据:", contestDetail.value); // 调试用
        } else {
          ElMessage.error("获取竞赛详情失败");
          contestDetail.value = null;
        }
      } catch (error) {
        console.error("获取竞赛详情失败:", error);
        ElMessage.error("获取竞赛详情失败，请稍后重试");
        contestDetail.value = null;
      } finally {
        loading.value = false;
      }
    };

    // 格式化时间戳
    const formatTime = (timestamp) => {
      if (!timestamp) return "未设置";
      const date = new Date(timestamp);
      return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // 获取分类文本
    const getCategoryText = () => {
      const parts = [];
      if (contestDetail.value?.contestClassFirst) {
        parts.push(contestDetail.value.contestClassFirst);
      }
      if (contestDetail.value?.contestClassSecond) {
        parts.push(contestDetail.value.contestClassSecond);
      }
      return parts.length > 0 ? parts.join(" · ") : "未设置";
    };

    // 获取状态样式类
    const getStatusClass = () => {
      const status = contestDetail.value?.timeStatus;
      if (status === 22) return "status-active";
      if (status === 23) return "status-ended";
      if (status === 13) return "status-registration-ended";
      return "";
    };

    // 处理图片加载错误
    const handleImageError = (event) => {
      event.target.src = "https://via.placeholder.com/600x400";
    };

    // 返回列表
    const goBack = () => {
      router.back();
    };

    onMounted(() => {
      fetchContestDetail();
    });

    return {
      contestDetail,
      loading,
      fetchContestDetail,
      formatTime,
      getCategoryText,
      getStatusClass,
      handleImageError,
      goBack,
    };
  },
};
</script>

<style scoped>
.contest-detail-page {
  padding-top: 60px;
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}
/* .contest-detail-page::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
} */

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

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 详情内容 */
.detail-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
  background: #ffffff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.detail-header {
  width: 100%;
  text-align: center;
  padding-bottom: 30px;
  border-bottom: 2px solid #e0e0e0;
}

.detail-title {
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.3;
}

/* 时间信息区域 */


.detail-right {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.detail-content-section {
  padding: 24px 0;
  border-radius: 8px;
}

.no-content {
  padding: 40px;
  text-align: center;
  color: #999;
  font-size: 16px;
}

.content-text {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  word-wrap: break-word;
}

.content-text :deep(p) {
  margin: 0 0 16px 0;
}

.content-text :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 16px 0;
}

.content-text :deep(h1),
.content-text :deep(h2),
.content-text :deep(h3) {
  margin: 24px 0 16px 0;
  color: #1a1a1a;
}

.content-text :deep(ul),
.content-text :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.content-text :deep(li) {
  margin: 8px 0;
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.time-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-label {
  font-size: 14px;
  color: #666;
}

.time-value {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

/* 操作按钮 */
.detail-actions {
  display: flex;
  gap: 16px;
  margin-top: auto;
}

.action-btn {
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.action-btn.primary {
  background-color: #3b82f6;
  color: #ffffff;
}

.action-btn.primary:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.action-btn.secondary {
  background-color: #e8e8e8;
  color: #1a1a1a;
}

.action-btn.secondary:hover {
  background-color: #d8d8d8;
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
  padding: 40px 20px;
}

.error-container p {
  font-size: 18px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 968px) {
  .detail-container {
    flex-direction: column;
  }

  .detail-left {
    width: 100%;
  }

  .detail-image-wrapper {
    height: 300px;
  }

  .time-grid {
    grid-template-columns: 1fr;
  }
}
</style>

