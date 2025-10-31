<template>
    <div class="main_logo">
      <div class="main_logo_bg">
        <div class="logo_t"></div>
      </div>
      <div class="main_logom">
        <div class="main_logomm">
          <div class="logo_t"></div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AnimatedLogo',
    // 可根据需要添加props、data或methods
    props: {
      // 示例：可自定义logo颜色
      primaryColor: {
        type: String,
        default: '#980337'
      },
      // 示例：可自定义大小比例
      sizeRatio: {
        type: Number,
        default: 1,
        validator: (value) => value > 0 && value <= 2 // 限制比例范围
      }
    },
    mounted() {
      // 如需动态修改样式，可在这里操作
      // 例如根据props动态调整颜色
      const elements = document.querySelectorAll('.main_logo_bg, .main_logom, .logo_t');
      elements.forEach(el => {
        if (el.classList.contains('logo_t') || el.classList.contains('main_logo_bg')) {
          el.style.borderColor = this.primaryColor;
          if (el.classList.contains('logo_t')) {
            el.style.backgroundColor = this.primaryColor;
          }
        }
      });
    }
  };
  </script>
  
  <style scoped>
  .main_logo {
    position: absolute;
    right: 0%;
    top: 54%;
    transform: translate(50%, -50%);
    opacity: 0.3;
    z-index: -1;
  }
  
  .main_logo::before {
    content: '';
    position: absolute;
    left: -46px;
    top: -46px;
    right: -46px;
    bottom: -46px;
    display: inline-block;
    border-radius: 50%;
    border: 3px solid #a93555;
    transform: rotate3d(1, 1, 1, 210deg);
  }
  
  .main_logo .main_logo_bg {
    display: inline-block;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    z-index: 99;
    border: 1px solid #980337;
    animation: sopplusReverse 20s linear 0s infinite both;
  }
  
  .main_logo_bg .logo_t {
    position: absolute;
    left: 42px;
    top: 42px;
    display: inline-block;
    width: 30px;
    height: 30px;
    background: #980337;
    z-index: 100;
    border-radius: 50%;
  }
  
  .main_logo .main_logom {
    left: -75px;
    top: -105px;
    right: -27px;
    bottom: 30px;
    transform: rotate3d(1, 1, 1, 211deg);
    border-style: dashed;
    transform-style: preserve-3d !important;
    animation: orbitrotate 10s linear 0s normal none infinite;
    position: absolute;
    border: 1px solid #980337;
    border-radius: 50%;
  }
  
  .main_logo .main_logom .main_logomm {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    transform-style: preserve-3d !important;
    transform: rotateX(-90deg) rotateY(0);
  }
  
  .main_logo .main_logom .logo_t {
    position: absolute;
    left: -15px;
    top: 223px;
    display: inline-block;
    width: 30px;
    height: 30px;
    background: #980337;
    z-index: 100;
    border-radius: 50%;
    transform: rotateX(-90deg) rotateY(0);
    animation: planetrotate 10s linear 0s normal none infinite;
  }
  
  @keyframes planetrotate {
    0% {
      transform: rotateX(0) rotateY(0);
    }
  
    100% {
      transform: rotateX(0) rotateY(-360deg);
    }
  }
  
  @keyframes orbitrotate {
    0% {
      transform: rotateX(74deg) rotateY(342deg) rotateZ(0);
    }
  
    100% {
      transform: rotateX(74deg) rotateY(342deg) rotateZ(-360deg);
    }
  }
  
  @keyframes sopplusReverse {
    100% {
      transform: rotate(-360deg);
    }
  }
  </style>