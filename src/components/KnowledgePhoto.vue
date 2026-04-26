<template>
  <div class="knowledge-photo">
    <div class="section-title-wrap">
      <Star class="title-icon" />
      <h2 class="section-title">厚积薄发</h2>
      <span class="view-more-container">
        <router-link to="/knowledge-graph" class="view-more">查看更多-&gt;</router-link>
      </span>
    </div>

    <div class="knowledge-content">
      <p class="knowledge-summary animate__animated" ref="knowledgeLeftPart">
        知识图谱以技能图谱帮助你梳理能力结构、定位知识关联，同时还包含学习路径图谱和闪卡图谱，支撑从规划到巩固的完整学习过程。
      </p>

      <div class="knowledge-graph-wrap animate__animated" ref="knowledgeRightPart">
        <div class="knowledge-graph">
          <iframe
            src="/knowledge-graph/index.html"
            class="graph-iframe"
            frameborder="0"
            scrolling="no"
            title="技能图谱"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Star from "./Star.vue";

const knowledgeLeftPart = ref(null);
const knowledgeRightPart = ref(null);

defineExpose({
  knowledgeLeftPart,
  knowledgeRightPart
});
</script>

<style scoped>
.knowledge-photo {
  width: 100%;
  min-height: 680px;
  position: relative;
  padding: 30px 40px 70px 0;
}

.section-title-wrap {
  position: relative;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 1400px;
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

.knowledge-content {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 40px;
}

.knowledge-summary {
  max-width: 980px;
  margin: 8px auto 32px;
  color: #2c3e50;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.8;
  text-align: center;
  letter-spacing: 0.02em;
  text-shadow: 0 2px 8px rgba(255, 255, 255, 0.7);
}

.knowledge-graph-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.knowledge-graph {
  width: min(100%, 980px);
  height: 550px;
  background-image: url('https://cdn.pixabay.com/photo/2024/09/19/21/07/night-sky-9059825_1280.jpg');
  border-radius: 12px;
  border: 2px solid rgba(149, 117, 181, 0.3);
  overflow: hidden;
  box-shadow: 0 18px 45px rgba(149, 117, 181, 0.18);
}

.graph-iframe {
  width: 125%;
  height: 125%;
  border: none;
  display: block;
  background: transparent;
  transform: scale(0.8);
  transform-origin: 0 0;
}

@media (max-width: 1024px) {
  .knowledge-photo {
    padding-right: 20px;
  }

  .knowledge-content {
    padding: 0 24px;
  }

  .knowledge-summary {
    font-size: 20px;
  }

  .knowledge-graph {
    height: 500px;
  }
}

@media (max-width: 768px) {
  .knowledge-photo {
    min-height: 560px;
    padding: 40px 16px 56px;
  }

  .section-title-wrap {
    justify-content: center;
  }

  .view-more-container {
    right: 8px;
  }

  .view-more {
    font-size: 14px;
    padding: 6px 10px;
  }

  .title-icon {
    width: 72px;
    height: 72px;
  }

  .section-title {
    font-size: 28px;
  }

  .knowledge-content {
    padding: 0;
  }

  .knowledge-summary {
    margin-top: 12px;
    margin-bottom: 24px;
    font-size: 16px;
    line-height: 1.7;
  }

  .knowledge-graph {
    height: 420px;
    border-radius: 10px;
  }
}
</style>
