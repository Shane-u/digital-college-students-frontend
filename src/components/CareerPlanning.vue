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


// 模拟10个职业人物数据
const careerData = ref([
  {
    id: 1,
    name: '教授1',
    image: '/pic_lb1.png',
    title: '【寻访身边的榜样】他把"小"车开上"大"舞台——访东南大学首席教授殷国栋',
    description: '在去年年底"东大人的国家记忆"思政大课上，有这样令人印象深刻的一幕：舞台中央坐着一辆方程式赛车模型，有着流线型车身、轮胎与底盘。在他的介绍中，一辆有着激情与速度的赛车，启动时马力强劲，疾驰时敏捷灵动，完美地展现了工科学子追求卓越、永不止步的精神风貌。作为车辆工程领域的领军人物，他始终秉持"实践出真知"的理念，带领团队攻克了一个又一个技术难关，为中国汽车工业的发展贡献着智慧和力量。'
  },
  {
    id: 2,
    name: '教授2',
    image: '/pic_lb2.png',
    title: '优秀教师风采：潜心教学，培育英才',
    description: '二十余年如一日坚守在教学第一线，始终以严谨的治学态度、创新的教学方法和无私的奉献精神感染着每一位学生。她将晦涩难懂的专业知识转化为生动有趣的课堂内容，注重理论与实践相结合，培养学生的创新思维和实践能力。她所带的学生中，有的已成为行业精英，有的继续深造攻读博士，更有的走上创新创业之路。她用自己的行动诠释了"师者，传道授业解惑"的真谛，被学生们亲切地称为"最受欢迎的老师"。'
  },
  {
    id: 3,
    name: '教授3',
    image: '/pic_lb3.png',
    title: '科研先锋：勇攀学术高峰',
    description: '作为国家重点实验室的学术带头人，他长期致力于前沿科学研究，在人工智能与大数据领域取得了一系列突破性成果。近年来主持国家级重大科研项目十余项，在国际顶级学术期刊发表论文百余篇，获得国家科技进步奖、省部级科技奖等多项荣誉。他所带领的科研团队成为了学科建设的中坚力量，培养了大批优秀的博士、硕士研究生。他始终坚信"科技创新是推动社会进步的第一动力"，用实际行动为国家科技事业的发展添砖加瓦。'
  },
  {
    id: 4,
    name: '学生1',
    image: '/pic_lb1.png',
    title: '青年才俊：创新创业典范',
    description: '在校期间就展现出卓越的创新能力和领导才华，积极参与各类科研项目和学科竞赛，多次获得国家级、省级奖项。大学四年里，他主持完成了三项大学生创新创业训练计划项目，申请发明专利五项。毕业后怀揣着创业梦想，与几位志同道合的同学共同创办了一家科技公司，专注于智能硬件研发。凭借敏锐的市场洞察力和扎实的技术功底，公司在短短三年内就成长为行业新星，获得了多轮风险投资，成为了青年创业者的榜样和楷模。'
  },
  {
    id: 5,
    name: '学生2',
    image: '/pic_lb2.png',
    title: '志愿者代表：服务社会奉献青春',
    description: '大学四年累计志愿服务时长超过1000小时，足迹遍及偏远山区、社区养老院、特殊教育学校等各个需要帮助的地方。她组织策划了"温暖冬日"关爱留守儿童、"银发守护"敬老助老、"绿色环保"生态保护等多个公益项目，带动了数百名同学参与志愿服务。她的事迹被多家媒体报道，先后获得"中国大学生年度人物提名奖"、"优秀青年志愿者"等荣誉称号。她用实际行动诠释了当代大学生的社会责任感，用青春和汗水书写着奉献的篇章。'
  },
  {
    id: 6,
    name: '校友1',
    image: '/pic_lb3.png',
    title: '杰出校友：行业领军人物',
    description: '毕业二十余年来，在科技创新领域深耕细作，现任某知名科技集团首席技术官。他所带领的团队在云计算、大数据、人工智能等前沿领域取得了一系列重大突破，多项技术成果达到国际领先水平。虽然事业有成，他始终不忘母校培养之恩，多次回校作报告、设立奖学金、为学弟学妹提供实习机会，积极参与母校的学科建设和人才培养工作。他用自己的成功经历激励着一届又一届的学子，成为了母校最耀眼的名片之一。'
  },
  {
    id: 7,
    name: '校友2',
    image: '/pic_lb1.png',
    title: '创新先锋：技术突破引领者',
    description: '作为新能源汽车领域的技术专家，他主持研发的智能电池管理系统获得了国家科技进步二等奖，相关技术已在多款新能源车型上应用，为我国新能源汽车产业的发展做出了重要贡献。他发表学术论文50余篇，申请发明专利30余项，多次受邀在国际学术会议上作主题报告。作为行业技术标准制定的参与者，他积极推动产学研深度融合，搭建起了高校与企业之间的桥梁，为培养高层次创新型人才、促进科技成果转化发挥了重要作用。'
  },
  {
    id: 8,
    name: '研究员1',
    image: '/pic_lb2.png',
    title: '学术新星：青年科学家',
    description: '年仅32岁就已成为博士生导师，在材料科学领域展现出了非凡的学术潜力。她在Nature、Science等国际顶级学术期刊发表论文20余篇，论文被引用次数超过5000次，成为该领域最具影响力的青年学者之一。她主持的"新型纳米材料的制备与应用研究"项目获得国家自然科学基金重点项目资助，研究成果有望在能源存储、环境治理等领域产生重大应用价值。她的成长经历激励着更多青年学子投身科研事业，勇攀科学高峰。'
  },
  {
    id: 9,
    name: '研究员2',
    image: '/pic_lb3.png',
    title: '教育专家：培养模式创新者',
    description: '长期从事高等教育研究和实践工作，在人才培养模式改革、课程体系优化、教学方法创新等方面进行了深入探索。他主持的"新工科背景下创新型人才培养模式研究与实践"项目获得国家级教学成果一等奖，所提出的"三融合、四协同、五贯通"人才培养理念在全国多所高校推广应用。他编写的教材成为多所高校的首选教材，开设的在线课程吸引了数万名学习者。他始终坚持"以学生为中心"的教育理念，为培养德智体美劳全面发展的社会主义建设者和接班人不懈努力。'
  },
  {
    id: 10,
    name: '名师',
    image: '/pic_lb1.png',
    title: '名师风采：桃李满天下',
    description: '从教三十八载，始终站在三尺讲台上传道授业解惑，用满腔热忱浇灌着一代又一代学子的成长。他的学生遍布海内外，有的成为了院士、长江学者，有的成为了企业家、技术骨干，有的走上了教书育人的道路。他的课堂总是座无虚席，他的教诲总是让学生终身受益。他获得过"全国模范教师"、"国家级教学名师"等诸多荣誉，但他最珍视的还是学生们的认可和爱戴。退休在即，他依然笔耕不辍，整理教学经验、编写专业教材，为教育事业奉献着最后的光和热。'
  }
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

.view-more:hover {
  color: #9575b5;
  background: rgba(184, 160, 200, 0.1);
}

/* 轮播容器 */
.carousel-container {
  position: relative;
  width: 100%;
  height: 700px;
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
  bottom: 350px;
  right: 180px;
  width: 650px;
  background: rgba(255, 255, 255,0);
  padding: 30px;
  border-radius: 16px;
   box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); 
   border-left: 4px solid #d4b8e0;
  z-index: 15;
}

.description-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.description-text {
  font-size: 15px;
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

