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
    <ul class="timeline-wrapper" @scroll="scrollEvent">
        <li class="timeline-item" v-for="item in props.timelineList" :key="item.id">
            <div class="timeline-box">
                <div class="out-circle">
                    <div class="in-circle"></div>
                    <div class="timeline-date">
                        <a-popover placement="bottom" trigger="hover" width="200" title="简介">
                            <template #content>
                                <p>{{item.content}}</p>
                            </template>
 
                           <a-button style="background-color: #6a4c8a;font-family: DS-Digital;font-size: 16px; border-color: #6a4c8a;" type="primary">{{item.date}}</a-button>
                        </a-popover>
                        <!-- <el-popover
                                 placement="bottom"
                                 title="标题"
                                 width="200"
                                 trigger="hover"
                                 :content="item.content"
                         >
                             <el-button type="text" slot="reference" class="father-text">{{
                                 item.date
                                 }}</el-button>
                         </el-popover>-->
        </div>
      </div>
                <div
                        class="long-line"
                        v-show="item.isShow"
                        :style="`width:${item.children ? (item.children.length + 1) * 100 : 1 * 100}px`">
                    <div
                            v-for="(subItem, index) in item.children"
                            :key="subItem.id"
                            class="sub-item-box"
                    >
                        <span>{{ subItem.name + ":" + subItem.num }}人</span>
                        <!-- 根据奇数偶数来判断向上展示还是向下展示 -->
                        <div :class="`sub-line-box ${index % 2 === 0 ? 'top-line-box' : 'bottom-line-box'}`" v-show="subItem.content">
                            <div :class="`children-line-box ${index % 2 === 0 ? 'top-line' : 'bottom-line' }`"></div>
                            <div :class="`children-box ${index % 2 === 0 ? 'top-children-box' : 'bottom-children-box'}`">
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
    import { ref, defineProps, defineEmits } from "vue";
    import Star from "./Star.vue";

    const props = defineProps({
            timelineList: {
                type: Array,
                default: () => {
                    return [
                        {
                            id: 1,
                            date: "2018",
                            title: "2018",
                            content: "2018年初，5周年庆典",
                            isShow: true,
                            children: [],
                        },
                        {
                            id: 2,
                            date: "2019",
                            title: "2019",
                            content: "2019年，6周年庆典",
                            isShow: true,
                            children: [
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
                            title: "2020",
                            content: "2020年，进行团队规模扩招",
                            isShow: true,
                            children: [
                                {
                                    name: "内务部",
                                    num: 10,
                                    content: "负责接待",
                                },
                                {
                                    name: "技术部",
                                    num: 20,
                                    content: "前端：5人，后端10人，测试5人",
                                },
                            ],
                        },
                        {
                            id: 4,
                            date: "2021",
                            title: "2021",
                            content: "2021年，拟定增设岗位",
                            isShow: true,
                            children: [
                                {
                                    name: "xxx总经理",
                                    num: 3,
                                    content: "负责事务为XXX",
                                },
                                {
                                    name: "xxx总经理部",
                                    num: 2,
                                    content: "负责事务为XXX",
                                },
                                {
                                    name: "总裁办xxx",
                                    num: 2,
                                    content: "负责事务为XXX",
                                },
                            ],
                        },
                        {
                            id: 5,
                            date: "2022",
                            title: "2022",
                            content: "2022年",
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
                            id: 6,
                            date: "2022",
                            title: "2022",
                            content: "2022年",
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
                            id: 7,
                            date: "2022",
                            title: "2022",
                            content: "2022年",
                            isShow: true,
                            children: [
                                {
                                    name: "商务洽谈",
                                    num: 2,
                                    content: "对外合作",
                                },
                            ],
                        },
 
                    ];
                },
            },
    });
    
    const emit = defineEmits(["scrollEvent", "handleBottomClick"]);
    
    const scrollEvent = (e) => {
        emit("scrollEvent", e);
    }
    
    const handleBottomClick = () => {
        emit("handleBottomClick");
    }
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

    .timeline-wrapper::-webkit-scrollbar {
        width: 4px;
        height: 12px;
    }
    .timeline-wrapper::-webkit-scrollbar-thumb {
        border-radius: 10px;
        /* -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3); */
        opacity: 0.2;
        background-color: #dadada;
 
    }
    .timeline-wrapper::-webkit-scrollbar-track {
        border-radius: 10px;
        /* -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3); */
 
 
    }
    ul.timeline-wrapper {
        /* DS-Digital该字体样式为自定义 */
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
 
    /* 时间线 */
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
        width: 14px; /* 稍微增大 */
        height: 14px;
        background: #6a4c8a;
        border: 2px solid #fff; /* 白色边框增强对比 */
        box-shadow: 0px 2px 8px 0px rgba(106, 76, 138, 0.8), 0 0 0 2px rgba(255, 255, 255, 0.5); /* 增强阴影和光晕 */
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
 
    .timeline-item .timeline-box .out-circle .timeline-date {
        color: #2c3e50; /* 更深的文字颜色，提高对比度 */
        margin-top: 55px;
        font-weight: 600; /* 加粗文字 */
        text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.9); /* 白色阴影增强可读性 */
    }
 
    .timeline-item .timeline-box .out-circle .timeline-date .father-text {
        font-weight: 900;
        font-size: 16px;
        margin-left: -15px;
        color: #2c3e50; /* 深色文字 */
        text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.9);
    }
 
    .long-line {
        height: 3px; /* 增加线条厚度 */
        background: rgba(106, 76, 138, 0.9); /* 提高不透明度 */
        box-shadow: 0px 2px 8px 0px rgba(106, 76, 138, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.3); /* 增强阴影和光晕 */
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
 
    .timeline-content {
        box-sizing: border-box;
        margin-left: 20px;
        height: 106px;
        padding: 0 0 0 20px;
        text-align: left;
        margin-bottom: 30px;
    }
 
    .timeline-content .timeline-title {
        font-size: 14px;
        word-break: break-all;
        margin-bottom: 16px;
        color: #333;
        font-weight: 500;
        /*display: inline;*/
    }
 
    .timeline-content .timeline-desc {
        font-size: 14px;
        color: #999999;
    }
 
    .timeline-item:last-of-type .timeline-content {
        margin-bottom: 0;
    }
 
</style>