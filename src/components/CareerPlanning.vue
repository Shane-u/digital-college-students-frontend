<template>
  <div class="career-planning">
    <!-- 标题和查看更多 -->

    <!-- 轮播容器 -->
    <div class="carousel-container">
      <!-- 所有5张图片 - 位置动态变化 -->
      <transition-group name="carousel-move" tag="div" class="images-wrapper">
        <div 
          v-for="(item, displayIndex) in displayedImages" 
          :key="item.id"
          class="image-item"
          :class="{ 'is-main': displayIndex === 0 }"
          :style="getImagePosition(displayIndex)"
        >
          <div class="image-border" :class="displayIndex === 0 ? 'main-border' : 'small-border'" :style="displayIndex === 0 ? { '--border-rotation': borderRotation + 'deg' } : {}">
            <img :src="item.image" :alt="item.name" />
          </div>
        </div>
      </transition-group>

      <!-- 切换箭头 - 在第一张大图下方 -->
      <div class="arrow-controls">
        <button @click="prevSlide" class="arrow-btn prev-btn" aria-label="Previous">
          <span>←</span>
        </button>
        <button @click="nextSlide" class="arrow-btn next-btn" aria-label="Next">
          <span>→</span>
        </button>
      </div>

      <!-- 文字描述 - 右下角，不遮挡图片 -->
      <transition name="fade" mode="out-in">
        <div :key="displayedImages[0].id" class="description">
          <h3 class="description-title">{{ displayedImages[0].title }}</h3>
          <p class="description-text">{{ displayedImages[0].description }}</p>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// 导入所有图片资源
import careerImg1 from '../assets/career/1.jpg';
import careerImg2 from '../assets/career/2.jpg';
import careerImg3 from '../assets/career/3.jpg';
import careerImg4 from '../assets/career/4.jpg';
import careerImg5 from '../assets/career/5.jpg';
import careerImg6 from '../assets/career/6.jpg';
import careerImg7 from '../assets/career/7.jpg';
import careerImg8 from '../assets/career/8.jpg';
import careerImg9 from '../assets/career/9.jpg';
import careerImg10 from '../assets/career/10.jpg';

// 模拟10个职业人物数据
const careerData = ref([
  {
    id: 1,
    name: '教授1',
    image: careerImg1,
    title: '网络工程师',
    description: `专业技能：
1.数据库操作能力。
2.C++java、Html5或nodejs等语言的编写与精通。
3.熟练使用Visual studio或Eclipse等常用编译设计软件`
},
  {
    id: 2,
    name: '教授2',
    image: careerImg2,
    title: '通信传输接入工程师',
    description: `专业技能：
全光放大技术，SDH复用技术，基于SDH的多业务传送平台技术，WDM(DWDM/CWDM)光传输系统的技术特点，xDSL，宽带接入技术，有线接入网、无线接入网的规划、改造、测试、维护、故障排除等技能。 

通用技能：`
  },
  {
    id: 3,
    name: '教授3',
    image: careerImg3,
    title: '船舶工程技术人员',
    description: `专业技能：
1、熟练掌握航海基础知识,会使用航海雷达、海图、GPS、船舶无线电设备、码语、旗语。
2、掌握海上求生、消防、医护基本技能。
3、能阅读英文船舶说明书,能通过说明书对航海仪器的使用、船舶设备养护、机械设备的构造、运行原理等做进一步学习。`
},
  {
    id: 4,
    name: '学生1',
    image: careerImg4,
    title: '建筑设计人员',
    description: `专业技能：
对问题(环境、场地、功能)分析和解决的能力,对规范的理解与熟悉程度,对项目的把控力,在团队合作中的牵头作用、和其余专业的配合协调性等。`
},
  {
    id: 5,
    name: '学生2',
    image: careerImg5,
    title: '公务员(中央国家机关)',
    description: `专业技能：
1、科研能力:研究性的岗位需要撰写理论性强的学术论文
2、公文写作能力:向上级部门和领导报送公文需要很强的公文写作能力
3、外语沟通能力:出国交流需要外语水平较高
`},
  {
    id: 6,
    name: '校友1',
    image: careerImg6,
    title: '制造工艺技术人员',
    description: `专业技能：
1、对产品生产的关键技术和设备应用有清晰的认识和了解,具有整个工艺流程的技术分析、编制、优化能力;
2、按照程序和规范编制工艺文件的能力;
3、软件应用技能:熟练应用与工艺设计相关软件,如CAD,EB,PLC控制,ANYSIS,UG等;
4、绘图和识图能力;
5、生产过程中工艺问题的判断、分析和处理能力。`
},
  {
    id: 7,
    name: '校友2',
    image: careerImg7,
    title: '审计人员',
    description: `专业技能：
对财务方面的流程熟稔于胸,知道凭证的整个形成过程,并能根据相关销售数据和业务规模推测出大概的金额范围,从而能够很快识别可疑项目,对流程进行风险识别。
能够用专业精练的语言来完成审计报告。`
},
  {
    id: 8,
    name: '研究员1',
    image: careerImg8,
    title: '导游',
    description: `专业技能：
1、能够熟练使用旅行社通用软件工具,能够熟练应用房调、计调、车调软件,能够熟练使用办公软件等。
2、外语水平需较高水平,特别是口语方面要能够跟外国游客能够熟练交流,外语语种主要包括:英语、日语、韩语、西班牙语等。
3、中外沟通交流礼仪需深知,例如见面礼仪、行车礼仪、餐桌礼仪等。`
},
  {
    id: 9,
    name: '研究员2',
    image: careerImg9,
    title: '口腔科医师',
    description: `专业技能：
1.临床诊疗能力。
2.手术技能。
3.科研能力。
4.扎实的医学和相关领域知识。`
},
  {
    id: 10,
    name: '名师',
    image: careerImg10,
    title: '园艺技术人员',
    description: `专业技能：
1、掌握有关植物育种、病虫害防治的基本知识和一定的农业操作技巧
2、深入了解并熟练操作实验相关仪器、研究基地相关设备`
},
]);

const currentIndex = ref(0);
const isTransitioning = ref(false);
const borderRotation = ref(-45); // 边框旋转角度

// 计算当前显示的5张图片（第一张是大图，后4张是小图）
const displayedImages = computed(() => {
  const result = [];
  for (let i = 0; i < 5; i++) {
    const index = (currentIndex.value + i) % careerData.value.length;
    result.push(careerData.value[index]);
  }
  return result;
});

// 获取图片位置（从左上到右下的对角线）
const getImagePosition = (displayIndex) => {
  // 5个位置：从左上角到右下角
  const positions = [
    { top: '0px', left: '0px', scale: 1 },      // 大图位置
    { top: '180px', left: '270px', scale: 0.47 },  // 小图1
    { top: '250px', left: '460px', scale: 0.47 },  // 小图2
    { top: '300px', left: '680px', scale: 0.47 },  // 小图3
    { top: '320px', left: '900px', scale: 0.47 }   // 小图4
  ];
  
  const pos = positions[displayIndex] || positions[4];
  
  return {
    top: pos.top,
    left: pos.left,
    transform: `scale(${pos.scale})`,
    zIndex: 5 - displayIndex // 越前面的图片层级越高
  };
};

// 上一张
const prevSlide = () => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  currentIndex.value = (currentIndex.value - 1 + careerData.value.length) % careerData.value.length;
  // 每次切换改变边框旋转角度（逆时针90度）
  borderRotation.value = (borderRotation.value - 90) % 360;
  setTimeout(() => {
    isTransitioning.value = false;
  }, 1200); // 增加到1200ms以配合边框旋转动画
};

// 下一张
const nextSlide = () => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  currentIndex.value = (currentIndex.value + 1) % careerData.value.length;
  // 每次切换改变边框旋转角度（顺时针90度）
  borderRotation.value = (borderRotation.value + 90) % 360;
  setTimeout(() => {
    isTransitioning.value = false;
  }, 1200); // 增加到1200ms以配合边框旋转动画
};

// 自动轮播
let autoPlayTimer = null;
const startAutoPlay = () => {
  autoPlayTimer = setInterval(() => {
    nextSlide();
  }, 5000);
};

const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }
};

onMounted(() => {
  startAutoPlay();
});

onUnmounted(() => {
  stopAutoPlay();
});
</script>

<style scoped>
.career-planning {
  width: 100%;
  height: 700px;
  /* padding: 60px 80px; */
  position: relative;
  overflow: hidden;
  background-image: url('../assets/career_back.png');
  background-size:cover;
  background-position: center;
  background-repeat: no-repeat;
}
/* 紫色蒙层 */
.career-planning::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(149, 117, 181, 0.08);
  z-index: 2;
}
.view-more:hover {
  color: #9575b5;
  background: rgba(184, 160, 200, 0.1);
}

/* 轮播容器 */
.carousel-container {
  position: relative;
  width: 100%;
  height: 700px;
  z-index: 3; /* 确保在蒙层之上 */
}

/* 图片容器 */
.images-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.image-item {
  position: absolute;
  width: 380px;
  height: 380px;
  transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: top, left, transform;
}

.image-border {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 大图边框 - 浅紫色包围3/4 */
.main-border {
  background: linear-gradient(
    135deg,
    rgba(184, 160, 200, 0.6) 0%,
    rgba(184, 160, 200, 0.6) 75%,
    transparent 75%,
    transparent 100%
  );
  padding: 8px;
  box-shadow: 0 8px 24px rgba(184, 160, 200, 0.3);
  /* 整个边框容器旋转 */
  transform: rotate(var(--border-rotation, -45deg));
  transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-border::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border-radius: 50%;
  border: 12px solid transparent;
  border-top-color: #d4b8e0;
  border-left-color: #d4b8e0;
  border-right-color: #d4b8e0;
  border-bottom-color: transparent;
  /* 外层边框不需要单独旋转了，因为整个容器在旋转 */
  z-index: -1;
}

.main-border img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 6px solid #f5d9a8;
  /* 图片反向旋转，保持正常显示 */
  transform: rotate(calc(-1 * var(--border-rotation, -45deg)));
  transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 小图边框 - 更浅的紫色 */
.small-border {
  background: rgba(220, 200, 230, 0.3);
  padding: 4px;
  box-shadow: 0 4px 12px rgba(184, 160, 200, 0.2);
  border: 4px solid rgba(184, 160, 200, 0.25);
}

.small-border img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(149, 117, 181, 0.3);
}

/* 箭头控制按钮 - 在大图正下方 */
.arrow-controls {
  position: absolute;
  top: 360px;
  left: 100px;
  display: flex;
  gap: 20px;
  z-index: 20;
}

.arrow-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: white;
  border: 2px solid #d4b8e0;
  color: #9575b5;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(184, 160, 200, 0.2);
}

.arrow-btn:hover {
  background: #d4b8e0;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(184, 160, 200, 0.4);
}

.arrow-btn:active {
  transform: scale(0.95);
}

/* 文字描述 - 右下角，不遮挡图片 */
.description {
  position: absolute;
  bottom: 380px;
  right: 240px;
  width: 650px;
  /* background: rgba(255, 255, 255,0); */
  padding: 30px;
  border-radius: 16px;
   /* box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); 
   border-left: 4px solid #d4b8e0; */
  z-index: 15;
}

.description-title {
  font-size: 30px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.description-text {
  font-size: 18px;
  color: #666;
  line-height: 1.8;
  margin: 0;
}

/* 过渡动画 - 文字淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: all 1.0s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 轮播动画 - 图片位置移动 */
.carousel-move-move {
  transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel-move-enter-active,
.carousel-move-leave-active {
  transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel-move-enter-from {
  opacity: 0;
}

.carousel-move-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .career-planning {
    padding: 40px 60px;
  }
  
  .carousel-container {
    height: 600px;
  }
  
  .image-item {
    width: 320px;
    height: 320px;
  }
  
  
  /* .description {
    width: 400px;
    right: 40px;
  } */
}

@media (max-width: 1200px) {
  .career-planning {
    padding: 30px 40px;
  }
  
  .carousel-container {
    height: 500px;
  }
  
  .image-item {
    width: 280px;
    height: 280px;
  }
  
  /* .description {
    width: 350px;
    right: 30px;
    padding: 20px;
  } */
  
  .description-title {
    font-size: 18px;
  }
  
  .description-text {
    font-size: 14px;
  }
}
</style>

