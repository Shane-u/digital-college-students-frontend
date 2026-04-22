<template>
  <div class="chengzhang-guiji">
    <!-- 标题（保持原有不动） -->
    <div class="section-title-wrap" v-if="!hideHeader">
      <Star class="title-icon" />
      <h2 class="section-title">成长轨迹</h2>
      <span class="view-more-container">
        <a href="#" class="view-more">查看更多-></a>
      </span>
    </div>

    <!-- 时间轴（仅改样式与动画） -->
    <div class="timeline-shell" ref="timelineShell" :style="{ '--axis-start': `${axisStart}px` }">
      <!-- Central axis base -->
      <div class="timeline-axis-base" />
      <div class="timeline-axis-glow" />
      <div class="timeline-axis-energy" />

      <!-- Progress axis -->
      <div class="timeline-axis-progress" :style="progressStyle">
        <div class="timeline-axis-progress-tip" />
      </div>

      <ul
        class="timeline-wrapper timeline-scrollbar"
        ref="timelineWrapper"
        @scroll="handleScroll"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @wheel="handleWheel"
      >
        <li v-for="el in timelineElements" :key="el.key" class="timeline-el">
          <div v-if="el.type === 'year'" class="year-marker" :ref="setFirstYearRef" @click="handleDateClick(el.parent)">
            <div class="year-pill">
              <span class="year-text">{{ el.year }}</span>
            </div>
          </div>

          <div
            v-else
            class="milestone-wrap"
            :class="el.isEven ? 'is-even' : 'is-odd'"
          >
            <div
              class="milestone-connector"
              :class="el.isEven ? 'connector-down' : 'connector-up'"
              ref="connectorEls"
            />

            <div
              class="milestone-card perspective"
              :data-even="el.isEven ? '1' : '0'"
              ref="cardEls"
              @click="handleSubDateClick(el.subItem)"
            >
              <div class="card-media">
                <img
                  v-if="getPhotoForSubItem(el.subItem)"
                  :src="getPhotoForSubItem(el.subItem)"
                  class="media-blur"
                  referrerpolicy="no-referrer"
                  alt=""
                />
                <img
                  v-if="getPhotoForSubItem(el.subItem)"
                  :src="getPhotoForSubItem(el.subItem)"
                  class="media-main"
                  referrerpolicy="no-referrer"
                  :alt="el.subItem.content || ''"
                />
                <div v-else class="media-fallback">
                  <div class="fallback-badge">暂无图片</div>
                </div>

                <div class="card-badge">
                  <span class="badge-year">{{ formatYear(el.subItem.name) }}</span>
                </div>
              </div>

              <div class="card-title">
                {{ el.subItem.content }}
              </div>

              <div class="card-footer">
                <div class="footer-left">
                  <span class="footer-dot" />
                  {{ formatDateLabel(el.subItem.name) }}
                </div>
                <div class="footer-tag">
                  里程碑
                </div>
              </div>
            </div>
          </div>
        </li>

        <li class="timeline-end-spacer" />
      </ul>
    </div>
  </div>
</template>
  
<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, defineProps, defineEmits, watch } from "vue";
import Star from "./Star.vue";
import { getPhotoWallList } from "../api/growthRecord";
import gsap from "gsap";

const timelineWrapper = ref(null);
const isMouseOverTimeline = ref(false);
const photosByDate = ref({});
const scrollProgress = ref(0);
const rafId = ref(0);
const observer = ref(null);
const wheelTargetScroll = ref(0);
let smoothScrollTo = null;
const timelineShell = ref(null);
const firstYearEl = ref(null);
const axisStart = ref(0);

const cardEls = ref([]);
const connectorEls = ref([]);

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

const emit = defineEmits([
  "scrollEvent",
  "handleBottomClick",
  "dateClick",
  "subDateClick",
]);

const progressStyle = computed(() => ({
  transform: `translateY(-50%) scaleX(${Math.max(0, Math.min(1, scrollProgress.value))})`
}));

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

const updateScrollProgress = () => {
  const el = timelineWrapper.value;
  if (!el) return;
  const max = el.scrollWidth - el.clientWidth;
  scrollProgress.value = max <= 0 ? 0 : el.scrollLeft / max;
  updateAxisStart();
};

const setFirstYearRef = (el) => {
  if (!firstYearEl.value && el) {
    firstYearEl.value = el;
  }
};

const updateAxisStart = () => {
  const shellEl = timelineShell.value;
  const yearEl = firstYearEl.value;
  if (!shellEl || !yearEl) return;
  const shellRect = shellEl.getBoundingClientRect();
  const yearRect = yearEl.getBoundingClientRect();
  // 轴线起点跟随第一个年份节点，避免滚动后视觉断层
  axisStart.value = Math.max(0, yearRect.left - shellRect.left + yearRect.width / 2);
};

const handleScroll = (e) => {
  emit("scrollEvent", e);
  if (rafId.value) cancelAnimationFrame(rafId.value);
  rafId.value = requestAnimationFrame(() => {
    updateScrollProgress();
  });
};

// 处理滚轮事件
const handleWheel = (e) => {
  if (!timelineWrapper.value || !isMouseOverTimeline.value) return;

  const deltaY = e.deltaY;
  const deltaX = e.deltaX;
  const dominantDelta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
  const el = timelineWrapper.value;
  const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
  const current = Number.isFinite(wheelTargetScroll.value) ? wheelTargetScroll.value : el.scrollLeft;

  if (dominantDelta === 0) return;
  if (dominantDelta < 0 && current <= 0) return;
  if (dominantDelta > 0 && current >= maxScroll) return;

  e.preventDefault();

  const next = Math.min(maxScroll, Math.max(0, current + dominantDelta * 2.4));
  wheelTargetScroll.value = next;

  if (!smoothScrollTo) {
    el.scrollLeft = next;
    return;
  }
  smoothScrollTo(next);
};

// 从照片墙加载图片，按日期分组
const loadTimelinePhotos = async () => {
  try {
    const list = await getPhotoWallList();
    const map = {};
    (list || []).forEach((img) => {
      if (!img.uploadTime || !img.imageUrl) return;
      const dateStr = img.uploadTime.split("T")[0]; // YYYY-MM-DD
      if (!map[dateStr]) {
        map[dateStr] = [];
      }
      map[dateStr].push(img.imageUrl);
    });
    photosByDate.value = map;
  } catch (error) {
    console.error("加载成长轨迹照片失败:", error);
  }
};

// 规范化子节点日期字符串，统一为 YYYY-MM-DD
const normalizeDate = (raw) => {
  if (!raw) return "";
  if (raw.includes("T")) {
    return raw.split("T")[0];
  }
  if (raw.includes("-")) {
    return raw;
  }
  if (raw.includes(".")) {
    const parts = raw.split(".");
    if (parts.length >= 3) {
      const [y, m, d] = parts;
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(
        2,
        "0"
      )}`;
    }
  }
  return "";
};

// 为子节点找到一张对应日期的照片（若有）
const getPhotoForSubItem = (subItem) => {
  const dateKey = normalizeDate(subItem?.name);
  if (!dateKey) return "";
  const list = photosByDate.value[dateKey];
  return list && list.length ? list[0] : "";
};

const formatYear = (raw) => {
  const dateKey = normalizeDate(raw);
  if (!dateKey) return "";
  return dateKey.slice(0, 4);
};

const formatDateLabel = (raw) => {
  const dateKey = normalizeDate(raw);
  if (!dateKey) return raw || "";
  const [y, m, d] = dateKey.split("-");
  return `${y}.${m}.${d}`;
};

const timelineElements = computed(() => {
  const list = Array.isArray(props.timelineList) ? props.timelineList : [];
  const elements = [];
  let globalIndex = 0;

  list.forEach((yearItem) => {
    const year = String(yearItem?.date ?? yearItem?.title ?? "");
    elements.push({
      type: "year",
      key: `year-${yearItem?.id ?? year}`,
      year,
      parent: yearItem,
    });

    const children = Array.isArray(yearItem?.children) ? yearItem.children : [];
    children.forEach((subItem) => {
      elements.push({
        type: "card",
        key: `card-${yearItem?.id ?? year}-${subItem?.id ?? subItem?.name ?? globalIndex}`,
        subItem,
        isEven: globalIndex % 2 === 0,
      });
      globalIndex += 1;
    });
  });

  return elements;
});

const resetAndAnimate = (el, isEven, immediate = false) => {
  const from = {
    opacity: 0,
    y: isEven ? -200 : 200,
    scale: 0.6,
    rotateY: isEven ? 30 : -30,
    rotateX: 15,
    z: -300,
  };
  const to = {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateY: 0,
    rotateX: 0,
    z: 0,
    duration: immediate ? 0 : 0.42,
    ease: immediate ? "none" : "power3.out",
    overwrite: true,
  };

  gsap.set(el, { transformPerspective: 2000, transformOrigin: "50% 50%" });
  if (immediate) {
    gsap.set(el, to);
  } else {
    gsap.fromTo(el, from, to);
  }
};

const resetHidden = (el, isEven) => {
  gsap.set(el, {
    opacity: 0,
    y: isEven ? -200 : 200,
    scale: 0.6,
    rotateY: isEven ? 30 : -30,
    rotateX: 15,
    z: -300,
    transformPerspective: 2000,
    transformOrigin: "50% 50%",
  });
};

const animateConnector = (el, immediate = false) => {
  gsap.set(el, { transformOrigin: "50% 0%" });
  if (immediate) {
    gsap.set(el, { scaleY: 1, opacity: 1 });
    return;
  }
  gsap.fromTo(el, { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.28, ease: "power3.out", overwrite: true });
};

const setupInView = async () => {
  await nextTick();
  const root = timelineWrapper.value;
  if (!root) return;

  observer.value?.disconnect?.();
  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const target = entry.target;
        const isEven = target?.dataset?.even === "1";

        if (entry.isIntersecting) {
          resetAndAnimate(target, isEven, false);
          const connector = target?.__connectorEl;
          if (connector) animateConnector(connector, false);
          const node = target?.__nodeEl;
          if (node) gsap.fromTo(node, { scale: 0 }, { scale: 1, duration: 0.24, ease: "power3.out", overwrite: true });
        } else {
          resetHidden(target, isEven);
          const connector = target?.__connectorEl;
          if (connector) gsap.set(connector, { scaleY: 0, opacity: 0 });
          const node = target?.__nodeEl;
          if (node) gsap.set(node, { scale: 0 });
        }
      });
    },
    { root, threshold: 0.18, rootMargin: "-6% 0px -6% 0px" }
  );

  // bind connectors/nodes to cards and initialize hidden state
  const cards = Array.isArray(cardEls.value) ? cardEls.value : [];
  const connectors = Array.isArray(connectorEls.value) ? connectorEls.value : [];
  cards.forEach((cardEl, idx) => {
    if (!cardEl) return;
    const isEven = cardEl?.dataset?.even === "1";

    // associate nearest connector and node (same milestone-wrap)
    const wrap = cardEl.closest(".milestone-wrap");
    const node = wrap ? wrap.querySelector(".milestone-node") : null;
    const connector = wrap ? wrap.querySelector(".milestone-connector") : connectors[idx] || null;

    cardEl.__connectorEl = connector;
    cardEl.__nodeEl = node;

    resetHidden(cardEl, isEven);
    if (connector) gsap.set(connector, { scaleY: 0, opacity: 0, transformOrigin: "50% 0%" });
    if (node) gsap.set(node, { scale: 0, transformOrigin: "50% 50%" });

    observer.value.observe(cardEl);
  });

  // initial progress
  updateScrollProgress();
};

onMounted(async () => {
  // 确保时间轴可以横向滚动，并设置平滑滚动
  if (timelineWrapper.value) {
    timelineWrapper.value.style.overflowX = "scroll";
    // 避免与 GSAP 滚动缓动冲突，使用即时滚动底座
    timelineWrapper.value.style.scrollBehavior = "auto";
    smoothScrollTo = gsap.quickTo(timelineWrapper.value, "scrollLeft", {
      duration: 0.22,
      ease: "power2.out",
    });
    wheelTargetScroll.value = timelineWrapper.value.scrollLeft;
  }

  // 加载成长轨迹相关照片
  await loadTimelinePhotos();

  await setupInView();
  await nextTick();
  requestAnimationFrame(updateAxisStart);
  window.addEventListener("resize", updateAxisStart);
});

watch(
  () => props.timelineList,
  async () => {
    cardEls.value = [];
    connectorEls.value = [];
    firstYearEl.value = null;
    await setupInView();
    await nextTick();
    requestAnimationFrame(updateAxisStart);
  },
  { deep: true }
);

onUnmounted(() => {
  observer.value?.disconnect?.();
  if (rafId.value) cancelAnimationFrame(rafId.value);
  smoothScrollTo = null;
  window.removeEventListener("resize", updateAxisStart);
});

// 暴露 ref 给父组件
defineExpose({
  timelineWrapper,
});
</script>
  
  <style scoped>
.chengzhang-guiji {
  width: 100%;
  min-height: 700px;
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
.timeline-scrollbar::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}
.timeline-scrollbar::-webkit-scrollbar-thumb {
  border-radius: 10px;
  opacity: 0.2;
  background-color: #dadada;
}
.timeline-scrollbar::-webkit-scrollbar-track {
  border-radius: 10px;
}

.timeline-shell {
  position: relative;
  width: 100%;
  min-height: 520px;
  overflow: hidden;
}

.timeline-axis-base {
  position: absolute;
  top: 50%;
  left: var(--axis-start, 0px);
  width: calc(100% - var(--axis-start, 0px));
  height: 2px;
  transform: translateY(-50%);
  background: rgba(168, 85, 247, 0.12);
  z-index: 1;
}

.timeline-axis-glow {
  position: absolute;
  top: 50%;
  left: var(--axis-start, 0px);
  width: calc(100% - var(--axis-start, 0px));
  height: 96px;
  transform: translateY(-50%);
  background: linear-gradient(to bottom, rgba(168, 85, 247, 0.06), transparent, rgba(168, 85, 247, 0.06));
  pointer-events: none;
  z-index: 1;
}

.timeline-axis-energy {
  position: absolute;
  top: 50%;
  left: var(--axis-start, 0px);
  width: calc(100% - var(--axis-start, 0px));
  height: 2px;
  transform: translateY(-50%);
  opacity: 0.3;
  background: linear-gradient(90deg, transparent, #a855f7, #6366f1, #a855f7, transparent);
  background-size: 200% 100%;
  animation: axisFlow 15s linear infinite;
  z-index: 2;
}

@keyframes axisFlow {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}

.timeline-axis-progress {
  position: absolute;
  top: 50%;
  left: var(--axis-start, 0px);
  width: calc(100% - var(--axis-start, 0px));
  height: 3px;
  transform: translateY(-50%) scaleX(0);
  transform-origin: left center;
  background: linear-gradient(to right, #7c3aed, #6366f1, #a855f7);
  box-shadow: 0 0 25px rgba(139, 92, 246, 0.6), 0 0 10px rgba(139, 92, 246, 0.4);
  z-index: 3;
  pointer-events: none;
}

.timeline-axis-progress-tip {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: #fff;
  filter: blur(1px);
  box-shadow: 0 0 20px #fff, 0 0 40px #a855f7;
}

ul.timeline-wrapper {
  font-family: DS-Digital, sans-serif;
  list-style: none;
  margin: 0;
  padding: 90px 10vw 90px 24px;
  white-space: nowrap;
  overflow-x: scroll;
  scrollbar-width: none; /* Firefox: hide scrollbar but keep scrollable */
  -ms-overflow-style: none; /* Legacy Edge/IE */
  position: relative;
  z-index: 10; /* 覆盖轴线层 */
  background: transparent; /* 透明背景，不受蒙层影响 */
  display: flex;
  align-items: center;
  gap: 0;
  height: 520px;
}

.timeline-el {
  position: relative;
  display: flex;
  align-items: center;
}

.timeline-end-spacer {
  min-width: 50vw;
  height: 1px;
  flex: 0 0 auto;
}

.year-marker {
  position: relative;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 20;
  cursor: pointer;
  user-select: none;
}

.year-pill {
  padding: 12px 32px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  border: 2px solid #7c3aed;
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.3);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.year-text {
  font-size: 26px;
  font-weight: 900;
  color: #7c3aed;
  letter-spacing: -0.04em;
  font-style: italic;
}

.milestone-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 460px;
  padding: 0 64px;
  z-index: 20;
}

.milestone-wrap.is-even {
  padding-bottom: 112px;
}

.milestone-wrap.is-odd {
  padding-top: 112px;
}

.milestone-connector {
  position: absolute;
  width: 6px;
  height: 160px;
  border-radius: 999px;
  background: linear-gradient(to bottom, rgba(139, 92, 246, 0.55), transparent);
  z-index: 6;
  opacity: 0;
  transform: scaleY(0);
}

.milestone-connector.connector-down {
  bottom: 0;
  transform-origin: top center;
  transform: translateY(100%) scaleY(0);
}

.milestone-connector.connector-up {
  top: 0;
  transform-origin: top center;
  transform: translateY(-100%) scaleY(0) rotate(180deg);
}

.milestone-card {
  position: relative;
  width: 100%;
  padding: 20px;
  border-radius: 56px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 30px 80px rgba(139, 92, 246, 0.14);
  backdrop-filter: blur(28px);
  cursor: pointer;
  transition: box-shadow 0.5s ease, transform 0.5s ease;
  will-change: transform, opacity;
}

.milestone-card:hover {
  box-shadow: 0 50px 100px rgba(139, 92, 246, 0.3);
}

.perspective {
  transform-style: preserve-3d;
}

.card-media {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 45px;
  margin-bottom: 20px;
  background: rgba(88, 28, 135, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-blur {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(20px);
  opacity: 0.2;
  transform: scale(1.1);
}

.media-main {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
  padding: 0;
  z-index: 2;
  transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.milestone-card:hover .media-main {
  transform: scale(1.05);
}

.media-fallback {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.24), transparent 55%),
    radial-gradient(circle at 70% 70%, rgba(99, 102, 241, 0.18), transparent 55%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.08));
  display: flex;
  align-items: center;
  justify-content: center;
}

.fallback-badge {
  padding: 10px 16px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 800;
  color: rgba(124, 58, 237, 0.9);
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(124, 58, 237, 0.18);
  backdrop-filter: blur(8px);
}

.card-badge {
  position: absolute;
  top: 0px;
  left: 0px;
  padding: 10px 10px;
  border-radius: 999px;
  background: #7c3aed;
  color: #fff;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  z-index: 5;
  box-shadow: 0 12px 22px rgba(0, 0, 0, 0.18);
}

.badge-year {
  display: inline-block;
}

.card-title {
  font-size: 26px;
  font-weight: 900;
  margin-bottom: 10px;
  color: #1a0b33;
  line-height: 1.15;
  transition: color 0.25s ease;
  white-space: normal;
}

.milestone-card:hover .card-title {
  color: #7c3aed;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid rgba(167, 139, 250, 0.25);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #7c3aed;
  font-weight: 900;
}

.footer-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #a855f7;
  box-shadow: 0 0 15px rgba(139, 92, 246, 1);
}

.footer-tag {
  padding: 6px 12px;
  border-radius: 10px;
  background: rgba(124, 58, 237, 0.06);
  color: rgba(124, 58, 237, 0.6);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
</style>