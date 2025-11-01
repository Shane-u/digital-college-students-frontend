<template>
  <div class="knowledge-photo">
    <!-- 标题 -->
    <div class="section-title-wrap">
      <Star class="title-icon" />
      <h2 class="section-title">厚积薄发</h2>
      <span class="view-more-container">
        <a href="#" class="view-more">查看更多-></a>
      </span>
    </div>

    <div class="knowledge-content">
      <!-- 左侧：技能展示 -->
      <div class="knowledge-right animate__animated" ref="knowledgeLeftPart">
        <!-- 顶部横线和标题 -->
        <div class="right-header">
          <div class="header-line">
            <span class="header-text"
              >更多技能干货在这！点击右侧开启图谱之旅▶</span
            >
          </div>
        </div>
        <!-- 技能网格 -->
        <div class="skills-grid">
          <div class="skill-item" v-for="(skill, index) in skills" :key="index">
            <div class="skill-icon">
              <svg v-html="skill.icon" width="40" height="40"></svg>
            </div>
            <h3 class="skill-name" @click="navigateToKnowledgeGraph(skill.name)">
              {{ skill.name }}
            </h3>
          </div>
        </div>
      </div>

      <!-- 右侧：知识图谱 -->
      <div class="knowledge-left animate__animated" ref="knowledgeRightPart">
        <div class="knowledge-graph">
          <!-- 交互式知识图谱 -->
          <iframe
            src="/knowledge-graph/index.html"
            class="graph-iframe"
            frameborder="0"
            scrolling="no"
            title="知识图谱"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import Star from "./Star.vue";

const knowledgeLeftPart = ref(null);
const knowledgeRightPart = ref(null);

// 暴露 ref 给父组件
defineExpose({
  knowledgeLeftPart,
  knowledgeRightPart
});

const router = useRouter();

// 跳转到知识图谱页面并传递搜索关键词
const navigateToKnowledgeGraph = (keyword) => {
  router.push({
    path: '/knowledge-graph',
    query: {
      search: keyword
    }
  });
};

const skills = ref([
  {
    name: "电路设计",
    icon: '<svg viewBox="0 0 48 48" fill="none"><path d="M14 16L8 24L14 32" stroke="#9575b5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 16L40 24L34 32" stroke="#9575b5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 12L20 36" stroke="#9575b5" stroke-width="3" stroke-linecap="round"/></svg>',
  },
  {
    name: "机器人控制",
    icon: '<svg viewBox="0 0 48 48" fill="none"><path d="M8 40C8 40 12 32 24 32C36 32 40 40 40 40" stroke="#9575b5" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="18" r="10" stroke="#9575b5" stroke-width="3"/><path d="M24 8V12M16 10L18 13M32 10L30 13" stroke="#9575b5" stroke-width="3" stroke-linecap="round"/></svg>',
  },
  {
    name: "文献检索与分析",
    icon: '<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="10" r="4" fill="#9575b5"/><path d="M24 14C24 14 20 18 16 22C12 26 10 32 10 32" stroke="#9575b5" stroke-width="3" stroke-linecap="round"/><path d="M24 14C24 14 28 18 32 22C36 26 38 32 38 32" stroke="#9575b5" stroke-width="3" stroke-linecap="round"/><path d="M24 14V28M20 28L28 28" stroke="#9575b5" stroke-width="3" stroke-linecap="round"/></svg>',
  },
  {
    name: "团队协作",
    icon: '<svg viewBox="0 0 48 48" fill="none"><rect x="8" y="14" width="32" height="24" rx="2" stroke="#9575b5" stroke-width="3"/><circle cx="24" cy="26" r="6" stroke="#9575b5" stroke-width="3"/><path d="M18 14L20 10H28L30 14" stroke="#9575b5" stroke-width="3" stroke-linecap="round"/><circle cx="34" cy="18" r="1.5" fill="#9575b5"/></svg>',
  },
]);
</script>

<style scoped>
.knowledge-photo {
  width: 100%;
  min-height: 600px;
  position: relative;
  /* 背景已移至父容器knowledge-section */
  padding: 30px 40px 60px 0;
}

/* 标题样式 */
.section-title-wrap {
  position: relative;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 1400px;
  /* margin: 0 auto 40px; */
}

.title-icon {
  width: 100px;
  height: 100px;
  transform: translateY(2px);
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.8);
}

.view-more-container {
  position: absolute;
  right: 0;
}

.view-more {
  font-size: 16px;
  color: #b8a0c8;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: 20px;
}

.view-more:hover {
  color: #9575b5;
  background: rgba(184, 160, 200, 0.1);
}

/* 背景透明化和紫色雾蒙已移至父容器knowledge-section */

.knowledge-content {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: 480px 1fr;
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 40px;
  align-items: center;
  justify-items: stretch;
}

/* 右侧知识图谱 */
.knowledge-left {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 20px;
}

.knowledge-graph {
  width: 100%;
  min-width: 700px;
  height: 550px;
  background: rgba(0,0,0, 0.95);
  border-radius: 20px;
  padding: 0;
  border: 2px solid rgba(149, 117, 181, 0.3);
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(149, 117, 181, 0.15);
}

.graph-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  background: transparent;
}

/* 左侧技能展示 */
.knowledge-right {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  padding-top: 20px;
}

/* 顶部横线和标题 */
.right-header {
  margin-bottom: 40px;
  position: relative;
}

.header-line {
  width: 100%;
  height: 2px;
  background: #c4b5ce;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-text {
  position: absolute;
  left: 0px;
  top: -30px;
  font-size: 20px;
  color: #2c3e50;
  font-weight: 500;
  background: transparent;
  padding-right: 10px;
}

/* 技能网格 */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px 40px;
  width: 100%;
  margin-top: 40px;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.skill-item:hover {
  transform: translateX(5px);
}

.skill-item:hover .skill-icon {
  transform: scale(1.1);
}

.skill-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.skill-name {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.skill-name:hover {
  color: #9575b5;
  transform: translateY(-2px);
  text-shadow: 0 2px 4px rgba(149, 117, 181, 0.3);
}

.skill-name:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .knowledge-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .knowledge-graph {
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .knowledge-photo {
    padding: 40px 20px;
  }

  .skills-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .header-text {
    font-size: 14px;
  }

  .skill-name {
    font-size: 18px;
  }
}
</style>

