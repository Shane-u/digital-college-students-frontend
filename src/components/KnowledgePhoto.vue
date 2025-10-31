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
      <!-- 左侧：知识图谱 -->
      <div class="knowledge-left">
        <div class="knowledge-graph">
          <!-- 模拟知识图谱 -->
          <svg viewBox="0 0 400 400" class="graph-svg">
            <!-- 中心节点 -->
            <circle cx="200" cy="200" r="40" fill="#9575b5" opacity="0.8"/>
            <text x="200" y="210" text-anchor="middle" fill="white" font-size="16" font-weight="bold">知识</text>
            
            <!-- 周围节点 -->
            <circle cx="100" cy="100" r="30" fill="#b8a0c8" opacity="0.7"/>
            <text x="100" y="107" text-anchor="middle" fill="white" font-size="14">编程</text>
            <line x1="200" y1="200" x2="100" y2="100" stroke="#d4b8e0" stroke-width="2"/>
            
            <circle cx="300" cy="100" r="30" fill="#b8a0c8" opacity="0.7"/>
            <text x="300" y="107" text-anchor="middle" fill="white" font-size="14">绘画</text>
            <line x1="200" y1="200" x2="300" y2="100" stroke="#d4b8e0" stroke-width="2"/>
            
            <circle cx="100" cy="300" r="30" fill="#b8a0c8" opacity="0.7"/>
            <text x="100" y="307" text-anchor="middle" fill="white" font-size="14">跳舞</text>
            <line x1="200" y1="200" x2="100" y2="300" stroke="#d4b8e0" stroke-width="2"/>
            
            <circle cx="300" cy="300" r="30" fill="#b8a0c8" opacity="0.7"/>
            <text x="300" y="307" text-anchor="middle" fill="white" font-size="14">摄影</text>
            <line x1="200" y1="200" x2="300" y2="300" stroke="#d4b8e0" stroke-width="2"/>
            
            <!-- 外围节点 -->
            <circle cx="50" cy="200" r="25" fill="#e5d4f0" opacity="0.6"/>
            <text x="50" y="207" text-anchor="middle" fill="#666" font-size="12">算法</text>
            <line x1="100" y1="100" x2="50" y2="200" stroke="#e5d4f0" stroke-width="1.5"/>
            
            <circle cx="350" cy="200" r="25" fill="#e5d4f0" opacity="0.6"/>
            <text x="350" y="207" text-anchor="middle" fill="#666" font-size="12">色彩</text>
            <line x1="300" y1="100" x2="350" y2="200" stroke="#e5d4f0" stroke-width="1.5"/>
            
            <circle cx="200" cy="50" r="25" fill="#e5d4f0" opacity="0.6"/>
            <text x="200" y="57" text-anchor="middle" fill="#666" font-size="12">创作</text>
            <line x1="200" y1="200" x2="200" y2="50" stroke="#e5d4f0" stroke-width="1.5"/>
            
            <circle cx="200" cy="350" r="25" fill="#e5d4f0" opacity="0.6"/>
            <text x="200" y="357" text-anchor="middle" fill="#666" font-size="12">技能</text>
            <line x1="200" y1="200" x2="200" y2="350" stroke="#e5d4f0" stroke-width="1.5"/>
          </svg>
        </div>
      </div>

      <!-- 右侧：技能展示 -->
      <div class="knowledge-right">
        <div class="skills-grid">
          <div class="skill-item" v-for="(skill, index) in skills" :key="index">
            <div class="skill-icon">
              <svg v-html="skill.icon" width="48" height="48"></svg>
            </div>
            <h3 class="skill-name">{{ skill.name }}</h3>
            <p class="skill-desc">{{ skill.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Star from './Star.vue';

const skills = ref([
  {
    name: '编程',
    description: '掌握多种编程语言，培养逻辑思维与创新能力',
    icon: '<svg viewBox="0 0 48 48" fill="none"><path d="M14 16L8 24L14 32" stroke="#9575b5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 16L40 24L34 32" stroke="#9575b5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 12L20 36" stroke="#9575b5" stroke-width="3" stroke-linecap="round"/></svg>'
  },
  {
    name: '绘画',
    description: '提升审美素养，用色彩与线条表达内心世界',
    icon: '<svg viewBox="0 0 48 48" fill="none"><path d="M8 40C8 40 12 32 24 32C36 32 40 40 40 40" stroke="#9575b5" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="18" r="10" stroke="#9575b5" stroke-width="3"/><path d="M24 8V12M16 10L18 13M32 10L30 13" stroke="#9575b5" stroke-width="3" stroke-linecap="round"/></svg>'
  },
  {
    name: '跳舞',
    description: '释放身心活力，在韵律中展现自我风采',
    icon: '<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="10" r="4" fill="#9575b5"/><path d="M24 14C24 14 20 18 16 22C12 26 10 32 10 32" stroke="#9575b5" stroke-width="3" stroke-linecap="round"/><path d="M24 14C24 14 28 18 32 22C36 26 38 32 38 32" stroke="#9575b5" stroke-width="3" stroke-linecap="round"/><path d="M24 14V28M20 28L28 28" stroke="#9575b5" stroke-width="3" stroke-linecap="round"/></svg>'
  },
  {
    name: '摄影',
    description: '捕捉美好瞬间，用镜头记录精彩人生',
    icon: '<svg viewBox="0 0 48 48" fill="none"><rect x="8" y="14" width="32" height="24" rx="2" stroke="#9575b5" stroke-width="3"/><circle cx="24" cy="26" r="6" stroke="#9575b5" stroke-width="3"/><path d="M18 14L20 10H28L30 14" stroke="#9575b5" stroke-width="3" stroke-linecap="round"/><circle cx="34" cy="18" r="1.5" fill="#9575b5"/></svg>'
  }
]);
</script>

<style scoped>
.knowledge-photo {
  width: 100%;
  min-height: 600px;
  position: relative;
  background: transparent;
  padding: 30px 40px 60px;
}

/* 标题样式 */
.section-title-wrap {
  position: relative;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 1400px;
  margin: 0 auto 40px;
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  max-width: 1400px;
  margin: 0 auto;
  align-items: center;
}

/* 左侧知识图谱 */
.knowledge-left {
  display: flex;
  justify-content: center;
  align-items: center;
}

.knowledge-graph {
  width: 100%;
  max-width: 500px;
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(149, 117, 181, 0.2);
  border: 2px solid rgba(149, 117, 181, 0.3);
}

.graph-svg {
  width: 100%;
  height: 100%;
}

/* 右侧技能展示 */
.knowledge-right {
  display: flex;
  align-items: center;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  width: 100%;
}

.skill-item {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px 24px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(149, 117, 181, 0.15);
  border: 1px solid rgba(149, 117, 181, 0.2);
}

.skill-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(149, 117, 181, 0.25);
  border-color: rgba(149, 117, 181, 0.4);
}

.skill-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(213, 184, 224, 0.2);
  border-radius: 50%;
}

.skill-name {
  font-size: 22px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.skill-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
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
  
  .skill-item {
    padding: 24px 20px;
  }
}
</style>

