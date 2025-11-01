<template>
  <div class="chengzhang-guiji">
    <!-- 标题 -->
    <div class="section-title-wrap">
      <Star class="title-icon" />
      <h2 class="section-title">成长轨迹</h2>
      <span class="view-more-container">
        <a href="#" class="view-more">查看更多-></a>
      </span>
    </div>

    <!-- 时间轴内容 -->
    <ul 
      class="timeline-wrapper animate__animated" 
      ref="timelineWrapper" 
      @scroll="scrollEvent"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @wheel="handleWheel"
    >
      <li
        class="timeline-item"
        v-for="item in props.timelineList"
        :key="item.id"
      >
        <div class="timeline-box">
          <div class="out-circle">
            <div class="in-circle"></div>
            <!-- 修复：气泡包裹整个时间节点区域，确保点击触发 -->
            <div class="timeline-date">
              <el-popover
                placement="bottom"
                trigger="hover"
                width="200"
              >
                <!-- Element Plus 使用 #reference 作为触发元素 -->
                <template #reference>
                  <span class="timeline-title">
                    {{ item.title }}
                  </span>
                </template>
                <!-- 内容直接放在组件标签内 -->
                <div style="padding: 8px 0; line-height: 1.6; text-align: center;">
                  {{ item.content }}
                </div>
              </el-popover>
            </div>
          </div>
          <!-- 子项线条区域 -->
          <div
            class="long-line"
            v-show="item.isShow"
            :style="`width:${
              item.children ? (item.children.length + 1) * 100 : 1 * 100
            }px`"
          >
            <div
              v-for="(subItem, index) in item.children"
              :key="subItem.id"
              class="sub-item-box"
            >
              <span>{{ subItem.name + ":" + subItem.num }}人</span>
              <!-- 根据奇数偶数判断上下展示 -->
              <div
                :class="`sub-line-box ${
                  index % 2 === 0 ? 'top-line-box' : 'bottom-line-box'
                }`"
                v-show="subItem.content"
              >
                <div
                  :class="`children-line-box ${
                    index % 2 === 0 ? 'top-line' : 'bottom-line'
                  }`"
                ></div>
                <div
                  :class="`children-box ${
                    index % 2 === 0 ? 'top-children-box' : 'bottom-children-box'
                  }`"
                >
                  {{ subItem.content }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
  
  <script setup>
import { ref, defineProps, defineEmits, onMounted, onUnmounted } from "vue";
import Star from "./Star.vue";
import { ElPopover } from 'element-plus';

const timelineWrapper = ref(null);
const isMouseOverTimeline = ref(false);

const props = defineProps({
  timelineList: {
    type: Array,
    default: () => {
      return [
        {
          id: 1,
          date: "2018",
          title: "大一",
          content: "探索方向，在新鲜与迷茫中锚定初心",
          isShow: true,
          children: [
          {
              name: "商务洽谈",
              num: 2,
              content: "对外合作",
            },
            {
              name: "商务洽谈",
              num: 2,
              content: "对外合作",
            },
            {
              name: "商务洽谈",
              num: 2,
              content: "对外合作",
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
              name: "创始团队",
              num: 5,
              content: "股份分红",
            },
            {
              name: "创始团队",
              num: 5,
              content: "股份分红",
            },
            {
              name: "创始团队",
              num: 5,
              content: "股份分红",
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
              name: "内务部",
              num: 10,
              content: "负责接待",
            },
            {
              name: "内务部",
              num: 10,
              content: "负责接待",
            },{
              name: "内务部",
              num: 10,
              content: "负责接待",
            },
            {
              name: "技术部",
              num: 20,
              content: "前端：5人，后端10人，测试5人",
            },
            {
              name: "技术部",
              num: 20,
              content: "前端：5人，后端10人，测试5人",
            },
            {
              name: "技术部",
              num: 20,
              content: "前端：5人，后端10人，测试5人",
            },
            // {
            //   name: "总裁办xxx",
            //   num: 2,
            //   content: "负责事务为XXX",
            // },
          ],
        },
        {
          id: 4,
          date: "2021",
          title: "大四",
          content: "从容奔赴，带着四年积淀开启人生新程",
          isShow: true,
          children: [
            {
              name: "商务洽谈",
              num: 2,
              content: "对外合作",
            },
          ],
        },
        {
          id: 5,
          date: "2022",
          title: "毕业",
          content: "2022年",
          
        },
        // {
        //   id: 6,
        //   date: "2022",
        //   title: "2022",
        //   content: "2022年",
        //   isShow: true,
        //   children: [
        //     {
        //       name: "商务洽谈",
        //       num: 2,
        //       content: "对外合作",
        //     },
        //   ],
        // },
        // {
        //   id: 7,
        //   date: "2022",
        //   title: "2022",
        //   content: "2022年",
        //   isShow: true,
        //   children: [
        //     {
        //       name: "商务洽谈",
        //       num: 2,
        //       content: "对外合作",
        //     },
        //   ],
        // },
      ];
    },
  },
});

const emit = defineEmits(["scrollEvent", "handleBottomClick"]);

const scrollEvent = (e) => {
  emit("scrollEvent", e);
};

const handleBottomClick = () => {
  emit("handleBottomClick");
};

// 鼠标进入时间轴区域
const handleMouseEnter = () => {
  isMouseOverTimeline.value = true;
};

// 鼠标离开时间轴区域
const handleMouseLeave = () => {
  isMouseOverTimeline.value = false;
};

// 检测时间轴是否到达左端
const isAtLeftEnd = () => {
  if (!timelineWrapper.value) return false;
  return timelineWrapper.value.scrollLeft <= 0;
};

// 检测时间轴是否到达右端
const isAtRightEnd = () => {
  if (!timelineWrapper.value) return false;
  const scrollLeft = timelineWrapper.value.scrollLeft;
  const scrollWidth = timelineWrapper.value.scrollWidth;
  const clientWidth = timelineWrapper.value.clientWidth;
  // 允许1px的误差
  return scrollLeft + clientWidth >= scrollWidth - 1;
};

// 处理滚轮事件
const handleWheel = (e) => {
  if (!timelineWrapper.value || !isMouseOverTimeline.value) return;
  
  const deltaY = e.deltaY;
  // 调整滚动速度，增大滚动幅度
  const scrollAmount = Math.abs(deltaY) * 2;
  const isAtLeft = isAtLeftEnd();
  const isAtRight = isAtRightEnd();
  
  // 向下滚动（正deltaY）- 时间轴向右滚动
  if (deltaY > 0) {
    // 如果已经在右端，允许页面滚动（不阻止默认行为）
    if (isAtRight) {
      return; // 允许事件冒泡，页面可以继续向下滚动
    }
    // 阻止默认滚动，滚动时间轴向右
    e.preventDefault();
    e.stopPropagation();
    const maxScroll = timelineWrapper.value.scrollWidth - timelineWrapper.value.clientWidth;
    const newScrollLeft = Math.min(
      timelineWrapper.value.scrollLeft + scrollAmount, 
      maxScroll
    );
    timelineWrapper.value.scrollLeft = newScrollLeft;
  } 
  // 向上滚动（负deltaY）- 时间轴向左滚动
  else if (deltaY < 0) {
    // 如果已经在左端，允许页面滚动（不阻止默认行为）
    if (isAtLeft) {
      return; // 允许事件冒泡，页面可以继续向上滚动
    }
    // 阻止默认滚动，滚动时间轴向左
    e.preventDefault();
    e.stopPropagation();
    const newScrollLeft = Math.max(
      timelineWrapper.value.scrollLeft - scrollAmount, 
      0
    );
    timelineWrapper.value.scrollLeft = newScrollLeft;
  }
};

onMounted(() => {
  // 确保时间轴可以横向滚动，并设置平滑滚动
  if (timelineWrapper.value) {
    timelineWrapper.value.style.overflowX = 'scroll';
    timelineWrapper.value.style.scrollBehavior = 'smooth';
  }
});

// 暴露 ref 给父组件
defineExpose({
  timelineWrapper
});
</script>
  
  <style scoped>
.chengzhang-guiji {
  width: 100%;
  min-height: 600px;
  position: relative;
  padding: 30px 40px 60px 0;
  z-index: 3; /* 确保在紫色蒙层之上 */
}

/* 移除紫色蒙层效果，让内容更清晰 */
.chengzhang-guiji::before,
.chengzhang-guiji::after {
  display: none;
}

/* 标题样式（与厚积薄发板块一致） */
.section-title-wrap {
  position: relative;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 1400px;
  margin-bottom: 40px;
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
  color: #6a4c8a;
  background: rgba(106, 76, 138, 0.15);
}

/* 滚动条样式 */
.timeline-wrapper::-webkit-scrollbar {
  width: 4px;
  height: 12px;
}
.timeline-wrapper::-webkit-scrollbar-thumb {
  border-radius: 10px;
  opacity: 0.2;
  background-color: #dadada;
}
.timeline-wrapper::-webkit-scrollbar-track {
  border-radius: 10px;
}

ul.timeline-wrapper {
  font-family: DS-Digital, sans-serif;
  list-style: none;
  margin: 0;
  padding: 200px 20px;
  white-space: nowrap;
  overflow-x: scroll;
  position: relative;
  z-index: 5; /* 确保时间轴在最上层 */
  background: transparent; /* 透明背景，不受蒙层影响 */
}

/* 时间线主样式 */
.timeline-item {
  position: relative;
  display: inline-block;
}

.timeline-item .timeline-box {
  text-align: center;
  display: flex;
  align-items: center;
}

.timeline-item .timeline-box .out-circle {
  width: 14px;
  height: 14px;
  background: #6a4c8a;
  border: 2px solid #fff; /* 白色边框增强对比 */
  box-shadow: 0px 2px 8px 0px rgba(106, 76, 138, 0.8),
    0 0 0 2px rgba(255, 255, 255, 0.5); /* 增强阴影和光晕 */
  border-radius: 50%;
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  z-index: 7; /* 最高层级 */
}

.timeline-item .timeline-box .out-circle .in-circle {
  width: 6px;
  height: 6px;
  margin: 0 auto;
  background: #fff; /* 白色内圆，增强对比 */
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(106, 76, 138, 0.6);
}

/* 时间节点区域样式 */
.timeline-item .timeline-box .out-circle .timeline-date {
  color: #000;
  margin-top: 55px;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center; /* 确保按钮和日期居中 */
}

/* 时间节点标题样式 - 仅显示文字，无按钮样式 */
.timeline-title {
  color: #000;
  font-weight: 600;
  cursor: pointer;
  font-size: 16px;
  font-family: DS-Digital, sans-serif;
  transition: color 0.2s ease;
}

.timeline-title:hover {
  color: #6a4c8a;
}

/* 长线条样式 */
.long-line {
  height: 3px; /* 增加线条厚度 */
  background: rgba(106, 76, 138, 0.9); /* 提高不透明度 */
  box-shadow: 0px 2px 8px 0px rgba(106, 76, 138, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.3); /* 增强阴影和光晕 */
  display: flex;
  flex-direction: revert;
  justify-content: space-around;
  position: relative;
  z-index: 6; /* 确保线条清晰可见 */
}

.long-line .sub-item-box {
  margin-top: -20px;
  position: relative;
  z-index: 6; /* 确保子元素在蒙层之上 */
}

.long-line .sub-item-box span {
  color: #2c3e50; /* 深色文字 */
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.95); /* 白色半透明背景 */
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.long-line .sub-item-box .sub-line-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.long-line .sub-item-box .sub-line-box .children-line-box {
  width: 0px;
  border-left: 1px solid rgba(106, 76, 138, 0.7);
}

.long-line .sub-item-box .sub-line-box .children-box {
  flex-wrap: wrap;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid rgba(106, 76, 138, 0.9); /* 更深的边框 */
  white-space: break-spaces;
  text-align: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.98); /* 几乎不透明的白色背景 */
  color: #2c3e50; /* 深色文字 */
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); /* 阴影增强立体感 */
}

.long-line .top-line-box {
  margin-top: -100px;
  height: 60px;
}

.long-line .bottom-line-box {
  margin-top: 5px;
  height: 150px;
}

.long-line .top-line {
  height: 65px;
}

.long-line .bottom-line {
  height: 120px;
}

.long-line .top-children-box {
  margin-top: -90px;
  background-color: #e2e2e2;
  border-radius: 5px;
  width: 100px;
}

.long-line .bottom-children-box {
  background-color: #e2e2e2;
  border-radius: 5px;
  width: 150px;
}

/* 冗余样式清除（原代码未使用，避免干扰） */
.timeline-content {
  display: none;
}
</style>