<template>
    <div class="consultation-container">
      <div class="consultation-header">
        <h3 class="consultation-title">最新竞赛 <span class="top10-text">TOP10</span></h3>
        <div class="divider"></div>
      </div>
      <div class="consultation-list">
        <div 
          v-for="(item, index) in competitionList" 
          :key="item.id"
          class="consultation-item"
          :class="{ 'loading': loading }"
          @mouseenter="handleMouseEnter(index)"
          @mouseleave="handleMouseLeave(index)"
        >
          <div 
            class="item-bullet" 
            :class="getBulletClass(index)"
          >{{ index + 1 }}</div>
          <div class="item-content">
            <p 
              class="item-title" 
              :class="[
                { 'hovered': hoveredIndex === index },
                hoveredIndex === index ? 'animate__animated animate__pulse' : ''
              ]"
            ><a :href="item.url" target="_blank" class="item-title-link">{{ item.name }}</a></p>
            <span class="item-description">{{ item.popularity }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { getCompetitionList } from '../api/competitionApi.js';
  // 引入 mock 定义，确保在发起 axios 请求前注册拦截
  import '../api/mockData.js';
  
  export default {
    name: 'CompetitionConsultation',
    setup() {
      const competitionList = ref([]);
      const loading = ref(true);
      const hoveredIndex = ref(-1);
  
      const fetchCompetitionList = async () => {
        try {
          loading.value = true;
          // getCompetitionList 直接返回数组数据
          const list = await getCompetitionList();
          competitionList.value = Array.isArray(list) ? list : [];
        } catch (error) {
          console.error('获取竞赛列表失败:', error);
        } finally {
          loading.value = false;
        }
      };
  
      const handleMouseEnter = (index) => {
        hoveredIndex.value = index;
      };
  
      const handleMouseLeave = () => {
        hoveredIndex.value = -1;
      };
  
      const getBulletClass = (index) => {
        const classes = [];
        if (index === 0) classes.push('bullet-red');
        else if (index === 1) classes.push('bullet-red-orange');
        else if (index === 2) classes.push('bullet-orange');
        else if (index === 9) classes.push('bullet-ten-adjust');
        return classes;
      };
  
      onMounted(() => {
        fetchCompetitionList();
      });
  
      return {
        competitionList,
        loading,
        hoveredIndex,
        handleMouseEnter,
        handleMouseLeave,
        getBulletClass
      };
    }
  };
  </script>
  
  <style scoped>
  .consultation-container {
    width: 460px;
    height: 100%;
    padding: 20px;
    background: white;
    border-radius: 17px;
    box-sizing: border-box;
  }
  
  .consultation-header {
    margin-bottom: 10px;
  }
  
  .consultation-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0 0 10px 0;
  }
  
  .top10-text {
    color: #c2a7f4;
    font-weight: bold;
  }
  
  .divider {
    width: 100%;
    height: 1px;
    background: #e0e0e0;
    border: none;
    margin: 0;
  }
  
  .consultation-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .consultation-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 2px 0;
    transition: opacity 0.3s ease;
  }
  
  .consultation-item.loading {
    opacity: 0.6;
  }
  
  .item-bullet {
    width: 18px; /* 加宽数字容器避免10溢出 */
    text-align: right; /* 右对齐确保数字右侧对齐 */
    font-weight: bold;
    flex-shrink: 0;
    color: #666;
  }
  
  .bullet-red {
    color: red;
  }
  
  .bullet-red-orange {
    color: #ff7f50; /* 红橙色 */
  }
  
  .bullet-orange {
    color: orange;
  }
  
  .bullet-ten-adjust {
    /* 通过宽度和对齐确保10与其他数字右侧对齐 */
    width: 18px;
  }
  
  .item-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 380px;
  }
  
  .item-title {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    line-height: 2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.3s ease, text-decoration 0.3s ease;
    width: 360px;
    /* padding-right: 50px; */
  }
  .item-title-link {
    color: #333;
    text-decoration: none;
    transition: color 0.3s ease, text-decoration 0.3s ease;
  }
  .item-title-link:hover {
    color: rgb(34, 158, 246);
    text-decoration: underline;
  }
  
  .item-title.hovered {
    color: rgb(34, 158, 246);
    text-decoration: underline;
  }
  
  .item-description {
    font-size: 12px;
    color: #666;
    line-height: 2;
    width: 60px;
    padding-left: 10px;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .consultation-container {
      padding: 15px;
    }
    
    .consultation-title {
      font-size: 16px;
    }
    
    .item-title {
      font-size: 13px;
    }
    
    .item-description {
      font-size: 11px;
    }
  }
  </style>