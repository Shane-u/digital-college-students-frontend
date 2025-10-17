<template>
    <div class="astronaut-container">
      <div data-js="astro" class="astronaut">
        <div class="head"></div>
        <div class="arm arm-left"></div>
        <div class="arm arm-right"></div>
        <div class="body">
          <div class="panel"></div>
        </div>
        <div class="leg leg-left"></div>
        <div class="leg leg-right"></div>
        <div class="schoolbag"></div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AstronautComponent'
  }
  </script>
  
  <style scoped>
  .astronaut-container {
    width: 100%;
    height: 100%;
    position: relative;
    /* 可根据需要添加背景色，不添加则继承父元素背景 */
    /* background-color: #000; */
  }
  
  @keyframes astronaut {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  
  .astronaut {
    width: 150px; /* 缩小宇航员尺寸，避免占满屏幕 */
    height: 180px;
    position: absolute;
    z-index: 11;
    top: 0; /* 固定在顶部 */
    left: 0; /* 固定在左侧 */
    margin: 10px; /* 与边缘保持一点距离 */
    animation: astronaut 10s linear infinite; /* 减慢旋转速度 */
  }
  
  .schoolbag {
    width: 60px;
    height: 90px;
    position: absolute;
    z-index: 1;
    top: calc(50% - 45px);
    left: calc(50% - 30px);
    background-color: #94b7ca;
    border-radius: 50px 50px 0 0 / 30px 30px 0 0;
  }
  
  .head {
    width: 58px;
    height: 48px;
    position: absolute;
    z-index: 3;
    background: linear-gradient(to right, #e3e8eb 0%, #e3e8eb 50%, #fbfdfa 50%, #fbfdfa 100%);
    border-radius: 50%;
    top: 20px;
    left: calc(50% - 29px);
  }
  
  .head:after {
    content: "";
    width: 36px;
    height: 30px;
    position: absolute;
    top: calc(50% - 15px);
    left: calc(50% - 18px);
    background: linear-gradient(to top, #15aece 0%, #15aece 50%, #0391bf 50%, #0391bf 100%);
    border-radius: 15px;
  }
  
  .head:before {
    content: "";
    width: 7px;
    height: 15px;
    position: absolute;
    top: calc(50% - 7.5px);
    left: -2px;
    background-color: #618095;
    border-radius: 5px;
    box-shadow: 55px 0px 0px #618095;
  }
  
  .body {
    width: 51px;
    height: 60px;
    position: absolute;
    z-index: 2;
    background: linear-gradient(to right, #e3e8eb 0%, #e3e8eb 50%, #fbfdfa 50%, #fbfdfa 100%);
    border-radius: 40px / 20px;
    top: 63px;
    left: calc(50% - 25.5px);
  }
  
  .panel {
    width: 36px;
    height: 24px;
    position: absolute;
    top: 12px;
    left: calc(50% - 18px);
    background-color: #b7cceb;
  }
  
  .panel:before {
    content: "";
    width: 18px;
    height: 3px;
    position: absolute;
    top: 5px;
    left: 4px;
    background-color: #fbfdfa;
    box-shadow: 0px 5px 0px #fbfdfa, 0px 11px 0px #fbfdfa;
  }
  
  .panel:after {
    content: "";
    width: 5px;
    height: 5px;
    position: absolute;
    top: 5px;
    right: 4px;
    background-color: #fbfdfa;
    border-radius: 50%;
    box-shadow: 0px 8px 0px 1px #fbfdfa;
  }
  
  .arm {
    width: 48px;
    height: 18px;
    position: absolute;
    top: 73px;
    z-index: 2;
  }
  
  .arm-left {
    left: 18px;
    background-color: #e3e8eb;
    border-radius: 0 0 0 39px;
  }
  
  .arm-right {
    right: 18px;
    background-color: #fbfdfa;
    border-radius: 0 0 39px 0;
  }
  
  .arm-left:before,
  .arm-right:before {
    content: "";
    width: 18px;
    height: 42px;
    position: absolute;
    top: -24px;
  }
  
  .arm-left:before {
    border-radius: 50px 50px 0px 120px / 50px 50px 0 110px;
    left: 0;
    background-color: #e3e8eb;
  }
  
  .arm-right:before {
    border-radius: 50px 50px 120px 0 / 50px 50px 110px 0;
    right: 0;
    background-color: #fbfdfa;
  }
  
  .arm-left:after,
  .arm-right:after {
    content: "";
    width: 18px;
    height: 6px;
    position: absolute;
    top: -14px;
  }
  
  .arm-left:after {
    background-color: #6e91a4;
    left: 0;
  }
  
  .arm-right:after {
    right: 0;
    background-color: #b6d2e0;
  }
  
  .leg {
    width: 18px;
    height: 24px;
    position: absolute;
    z-index: 2;
    bottom: 42px;
  }
  
  .leg-left {
    left: 46px;
    background-color: #e3e8eb;
    transform: rotate(20deg);
  }
  
  .leg-right {
    right: 44px;
    background-color: #fbfdfa;
    transform: rotate(-20deg);
  }
  
  .leg-left:before,
  .leg-right:before {
    content: "";
    width: 30px;
    height: 15px;
    position: absolute;
    bottom: -16px;
  }
  
  .leg-left:before {
    left: -12px;
    background-color: #e3e8eb;
    border-radius: 30px 0 0 0;
    border-bottom: 6px solid #6d96ac;
  }
  
  .leg-right:before {
    right: -12px;
    background-color: #fbfdfa;
    border-radius: 0 30px 0 0;
    border-bottom: 6px solid #b0cfe4;
  }
  
  /* 响应式调整 - 在小屏幕上进一步缩小 */
  @media (max-width: 768px) {
    .astronaut {
      width: 100px;
      height: 120px;
    }
  }
  </style>