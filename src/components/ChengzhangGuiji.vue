<template>
  <div class="chengzhang-guiji">
    <!-- 标题 -->
    <div class="section-title-wrap" v-if="!hideHeader">
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
              <el-popover placement="bottom" trigger="hover" width="200">
                <!-- Element Plus 使用 #reference 作为触发元素 -->
                <template #reference>
                  <span class="timeline-title" @click="handleDateClick(item)">
                    {{ item.title }}
                  </span>
                </template>
                <!-- 内容直接放在组件标签内 -->
                <div
                  style="padding: 8px 0; line-height: 1.6; text-align: center"
                >
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
              <span class="sub-item-date" @click="handleSubDateClick(subItem)">{{ subItem.name}}</span>
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
import { ElPopover } from "element-plus";

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
              name: "2018.9.15",
              num: 2,
              content: "加入校学生会文艺部，参与迎新晚会策划",
            },
            {
              name: "2018.11.3",
              num: 2,
              content: "首次参加校级数学建模竞赛，获优秀奖",
            },
            {
              name: "2018.12.20",
              num: 2,
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
              num: 5,
              content: "组队参加'互联网+'创新创业大赛，进入校赛决赛",
            },
            {
              name: "2019.5.25",
              num: 5,
              content: "通过大学英语六级考试，分数520分",
            },
            {
              name: "2019.9.8",
              num: 5,
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
              num: 10,
              content: "获得国家励志奖学金，专业排名前5%",
            },
            {
              name: "2020.4.20",
              num: 10,
              content: "参与教师主持的科研项目，负责数据收集分析",
            },
            {
              name: "2020.6.30",
              num: 10,
              content: "暑期在某科技公司实习，完成3个项目模块开发",
            },
            {
              name: "2020.10.12",
              num: 20,
              content: "带领团队获省级大学生程序设计竞赛二等奖",
            },
            {
              name: "2020.11.28",
              num: 20,
              content: "发表1篇省级学术期刊论文（第二作者）",
            },
            {
              name: "2020.12.5",
              num: 20,
              content: "确定考研方向，开始系统复习专业课",
            },
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
              name: "2021.3.20",
              num: 2,
              content: "完成本科毕业论文，获优秀毕业设计称号",
            },
            {
              name: "2021.4.15",
              num: 2,
              content: "通过研究生复试，被目标院校录取",
            },
            {
              name: "2021.6.10",
              num: 2,
              content: "作为毕业生代表在学院毕业典礼上发言",
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
  hideHeader: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["scrollEvent", "handleBottomClick", "dateClick", "subDateClick"]);

const scrollEvent = (e) => {
  emit("scrollEvent", e);
};

const handleBottomClick = () => {
  emit("handleBottomClick");
};

// 处理日期点击（主时间节点）
const handleDateClick = (item) => {
  emit("dateClick", item);
};

// 处理子日期点击
const handleSubDateClick = (subItem) => {
  emit("subDateClick", subItem);
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
    const maxScroll =
      timelineWrapper.value.scrollWidth - timelineWrapper.value.clientWidth;
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
    timelineWrapper.value.style.overflowX = "scroll";
    timelineWrapper.value.style.scrollBehavior = "smooth";
  }
});

// 暴露 ref 给父组件
defineExpose({
  timelineWrapper,
});
</script>
  
  <style scoped>
.chengzhang-guiji {
  width: 100%;
  min-height: 600px;
  position: relative;
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
  padding: 250px 20px 200px 20px;
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
  z-index: 8; /* 确保子元素在蒙层之上，比时间轴层级更高 */
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

.sub-item-date {
  cursor: pointer;
  transition: all 0.3s ease;
}

.sub-item-date:hover {
  color: #7d5196;
  background: rgba(184, 160, 200, 0.3) !important;
  transform: scale(1.05);
}

.long-line .sub-item-box .sub-line-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

.long-line .sub-item-box .sub-line-box .children-line-box {
  width: 0px;
  /* border-left 已移至 .top-line 和 .bottom-line 中 */
  position: relative;
  z-index: 8; /* 确保线条显示在最上层 */
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
  margin-top: -200px; /* 向上移动到合适位置，连接到时间轴圆点 */
  height: 180px; /* 增加高度以正确连接到时间轴 */
  position: relative;
  z-index: 8;
}

.long-line .bottom-line-box {
  margin-top: 5px;
  height: 150px;
}

.long-line .top-line {
  height: 80px; /* 连接方框到时间轴的高度 */
  /* position: relative;
  z-index: 8; */
  position: absolute;
  bottom: 0px;
  border-left: 1px solid rgba(106, 76, 138, 0.7); /* 确保线条显示 */
  /* margin-left: 50%; 居中显示 */
  transform: translateX(-50%); /* 居中显示 */
}

.long-line .bottom-line {
  height: 120px;
  border-left: 1px solid rgba(106, 76, 138, 0.7); /* 确保线条显示 */
  /* margin-left: 50%; 居中显示 */
  transform: translateX(-50%); /* 居中显示 */
}

.long-line .top-children-box {
  margin-top: -200px; /* 调整位置，确保线条从方框底部延伸到时间轴 */
  background-color: #e2e2e2;
  border-radius: 5px;
  width: 100px;
  position: relative;
  z-index: 8; /* 确保方框显示在最上层 */
  margin-left: auto;
  margin-right: auto;
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