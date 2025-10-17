<style scoped>
  .cube-loader {
    position: relative;
    /* u can choose any size */
    width: 40px;
    height: 40px;
    transform-style: preserve-3d;
    transform: rotateX(-30deg);
    animation: animate 4s linear infinite;
  }

  @keyframes animate {
    0% {
      transform: rotateX(-30deg) rotateY(0);
    }

    100% {
      transform: rotateX(-30deg) rotateY(360deg);
    }
  }

  .cube-loader .cube-wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    /* top: 0;
          left: 0; */
    transform-style: preserve-3d;
  }

  .cube-loader .cube-wrapper .cube-span {
    position: absolute;
    width: 100%;
    height: 100%;
    /* top: 0;
          left: 0; */
    /* width 75px / 2 = 20px */
    transform: rotateY(calc(90deg * var(--i))) translateZ(20px);
    background: linear-gradient(
      to bottom,
      hsl(182, 100%, 73%) 0%,
      hsl(177, 100%, 71%) 2%,
      hsl(176.89, 99.07%, 58.04%) 5.5%,
      hsl(177.27, 21.71%, 32.06%) 80%,
      hsl(60, 88%, 75%) 85%,
      hsl(60, 36%, 55%) 100%
    );
  }

  .cube-top {
    position: absolute;
    width: 40px;
    height: 40px;
    background: hsl(182, 100%, 73%);
    /* width 75px / 2 = 20px */
    transform: rotateX(90deg) translateZ(20px);
    transform-style: preserve-3d;
  }
  rect {
    fill: white;
  }

  .cube-top::before {
    content: "";
    position: absolute;
    /* u can choose any size */
    width: 40px;
    height: 40px;
    background: hsl(177, 43%, 39%) 19.6%;
    transform: translateZ(-60px);
    filter: blur(20px);
  }

  .cube-loader-container {
    filter: drop-shadow(0px 0px 0.03rem rgb(0, 0, 0))
      drop-shadow(0px 0px 0.02rem rgb(0, 0, 0));
  }
</style>

<template>
  <div class="cube-loader-container">
    <div class="cube-loader">
      <div class="cube-top">
        <svg
          style="width: inherit;
          height: inherit;"
        >
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            filter="url(#waterCaustic)"
          ></rect>
        </svg>
      </div>
      <div class="cube-wrapper">
        <span style="--i:0" class="cube-span"> </span>
        <span style="--i:1" class="cube-span"></span>
        <span style="--i:2" class="cube-span"></span>
        <span style="--i:3" class="cube-span"></span>
      </div>
    </div>

    <svg style="display: none;">
      <defs>
        <filter id="waterCaustic">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.09"
            numOctaves="1"
            result="turbulence"
          ></feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale="600"
            xChannelSelector="R"
            yChannelSelector="G"
          ></feDisplacementMap>
        </filter>
      </defs>
    </svg>
  </div>
</template>
