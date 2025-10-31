<style scoped>
  .preloader {
    position: relative;
    /* width: 400px;
    height: 400px; */
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 0 2px #fff);
  }

  .crack {
    position: absolute;
    width: 60px;
    aspect-ratio: 1;
    background-color: #f39677;
    clip-path: polygon(
      50% 0%,
      61% 35%,
      98% 35%,
      68% 57%,
      79% 91%,
      50% 70%,
      21% 91%,
      32% 57%,
      2% 35%,
      39% 35%
    );
    animation: rotate 6s infinite;
  }

  .crack2 {
    width: 70px;
    animation-delay: 1s;
  }
  .crack3 {
    width: 80px;
    animation-delay: 1.5s;
  }
  .crack4 {
    width: 90px;
    animation-delay: 2s;
  }
  .crack5 {
    width: 100px;
    animation-delay: 2.5s;
  }

  @keyframes rotate {
    to {
      rotate: 360deg;
    }
  }
</style>

<template>
  <div class="preloader">
    <div class="crack crack1"></div>
    <div class="crack crack2"></div>
    <div class="crack crack3"></div>
    <div class="crack crack4"></div>
    <div class="crack crack5"></div>
  </div>
</template>
