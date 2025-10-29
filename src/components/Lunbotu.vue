<template>
    <div class="carousel">
      <div class="carousel-list">
        <img class="carousel-item" src="../assets/pic_lb1.png" alt="" />
        <img class="carousel-item" src="../assets/pic_lb2.png" alt="" />
        <img class="carousel-item" src="../assets/pic_lb3.png" alt="" />
        <img class="carousel-item" src="../assets/pic_lb4.png" alt="" />
        <img class="carousel-item" src="../assets/pic_lb5.png" alt="" />
        <img class="carousel-item" src="../assets/pic_lb6.png" alt="" />
      </div>
      <div class="prev arrow">
        <i class="iconfont icon-zuojiantou"></i>
      </div>
      <div class="next arrow">
        <i class="iconfont icon-youjiantou"></i>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        index: 3 // 当前显示的第几张轮播图
      };
    },
    mounted() {
      this.layout();
      this.initEvents();
    },
    methods: {
      layout() {
        const items = document.querySelectorAll('.carousel-item');
        // 图片之间的间隔
        const xOffsetStep = 100;
        // 两张轮播图之间的递减缩放倍率
        const scaleStep = 0.6;
        // 两张轮播图之间的透明度递减倍率
        const opacityStep = 0.5;
        
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          // 计算每张图片i距离当前图片index之间间隔几张
          const dis = Math.abs(i - this.index);
          // 返回1，-1，0，-0，当做一个正负号
          const sign = Math.sign(i - this.index);
  
          let xOffset = (i - this.index) * xOffsetStep;
          // 每张图片的初始偏移量，解决初始偏移距离太小的问题
          if (i !== this.index) {
            // sign为正数，右边的每张图片加上100的偏移量；
            // sign为负数，左边的每张图片减去100的偏移量。
            xOffset = xOffset + 100 * sign;
          }
          // 每张图片缩放倍数
          const scale = scaleStep ** dis;
          // 如果是当前的不旋转，否则左边旋转45度，右边旋转-45度
          const rotateY = i === this.index ? 0 : 45 * -sign;
          item.style.transform = `translateX(${xOffset}px) scale(${scale}) rotateY(${rotateY}deg)`;
          // scale同理，每张图片的透明度，越远透明度越小
          const opacity = opacityStep ** dis;
          item.style.opacity = opacity;
          // 设置每张图片的层级，距离当前index越远的，层级越低
          const zIndex = items.length - dis;
          item.style.zIndex = zIndex;
        }
      },
      initEvents() {
        const prev = document.querySelector('.prev');
        const next = document.querySelector('.next');
        const items = document.querySelectorAll('.carousel-item');
  
        prev.addEventListener('click', () => {
          this.index--;
          if (this.index < 0) {
            this.index = 0;
          }
          this.layout();
        });
  
        next.addEventListener('click', () => {
          this.index++;
          if (this.index > items.length - 1) {
            this.index = items.length - 1;
          }
          this.layout();
        });
  
        items.forEach((item, i) => {
          item.addEventListener('click', () => {
            this.index = i;
            this.layout();
          });
        });
      }
    }
  };
  </script>
  
  <style scoped>
  @import "//at.alicdn.com/t/c/font_5037675_uhdbbjdf5n.css";
  .carousel {
    width: 100%;
    position: relative;
    height: 400px;
    overflow: hidden;
    margin-top: 2em;
  }
  
  .carousel-list {
    width: 100%;
    height: 100%;
    position: relative;
    perspective: 1000px;
  }
  
  .carousel-item {
    width: 600px;
    height: 100%;
    position: absolute;
    user-select: none;
    transition: 0.4s;
    left: 50%;
    top: 0;
    margin-left: -300px;
  }
  
  .arrow {
    position: absolute;
    top: 50%;
    margin-top: -50px;
  }
  
  .arrow img {
    width: 100px;
  }
  
  .prev {
    left: 30px;
  }
  
  .next {
    right: 30px;
  }
  .iconfont{
    font-size: 45px;
    color: rgba(111, 90, 209);
  }
  </style>