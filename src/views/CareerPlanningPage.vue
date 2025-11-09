<template>
  <div class="career-planning-page">
    <!-- 使用共享导航组件 -->
    <NavBar :transparent="false" />

    <!-- 面包屑导航 -->
    <div class="breadcrumb-container">
      <div class="breadcrumb">
        <router-link to="/home">首页</router-link>
        <span>&gt;&gt;</span>
        <span class="current-page">职业规划</span>
      </div>
      <div class="divider"></div>
    </div>

    <!-- 职业测评区域 -->
    <div class="career-assessment-section">
      <div class="assessment-content">
        <h1 class="assessment-title">找到适合你的职业方向</h1>
        <p class="assessment-subtitle">青春不设限,职业要精准!</p>
        <p class="assessment-description">
          来做职业测评,挖透你的隐藏优势,直奔最适配的职业航向!
        </p>
        <button class="assessment-button">
          <svg
            class="button-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <!-- 人像 -->
            <circle cx="12" cy="7" r="3" stroke="currentColor" stroke-width="2" />
            <path
              d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
              stroke="currentColor"
              stroke-width="2"
            />
            <!-- 肩膀上的齿轮 -->
            <circle cx="18" cy="11" r="2.5" fill="currentColor" />
            <circle cx="18" cy="11" r="1.5" fill="white" />
            <path
              d="M18 8.5v1M18 13.5v1M15.5 11h-1M20.5 11h-1M16.5 9.5l0.7 0.7M19.8 12.3l0.7 0.7M19.8 9.7l0.7-0.7M16.5 12.5l0.7-0.7"
              stroke="currentColor"
              stroke-width="1"
              stroke-linecap="round"
            />
          </svg>
          <span>开始你的职业测评</span>
        </button>
        <p class="assessment-footer">10分钟,获取个性化职业建议</p>
      </div>
    </div>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import Footer from "../components/Footer.vue";
import NavBar from "../components/NavBar.vue";

export default {
  name: "CareerPlanningPage",
  components: {
    NavBar,
    Footer,
  },
};
</script>

<style scoped>
.career-planning-page {
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

/* 职业测评区域 */
.career-assessment-section {
  background: linear-gradient(
    180deg,
    #e6d5f7 0%,
    #d4c4f0 20%,
    #c2b3e9 40%,
    #b0a2e2 60%,
    #a8c5f0 80%,
    #a0d5f8 100%
  );
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  position: relative;
  overflow: hidden;
}

.assessment-content {
  max-width: 800px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.assessment-title {
  font-size: 48px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 24px 0;
  line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.assessment-subtitle {
  font-size: 28px;
  font-weight: 500;
  color: #ffffff;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.assessment-description {
  font-size: 20px;
  font-weight: 400;
  color: #ffffff;
  margin: 0 0 40px 0;
  line-height: 1.6;
}

.assessment-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 18px 48px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  border: none;
  border-radius: 12px;
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
  margin-bottom: 24px;
}

.assessment-button:hover {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
}

.assessment-button:active {
  transform: translateY(0);
}

.button-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.assessment-footer {
  font-size: 14px;
  color: #ffffff;
  margin: 0;
  opacity: 0.9;
}
</style>
