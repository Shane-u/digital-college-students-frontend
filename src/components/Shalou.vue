<style scoped>
  .loader {
    --dur: 2s;
    display: block;
    width: 14em;
    height: auto;
  }
  .loader__glare-top,
  .loader__glare-bottom,
  .loader__model,
  .loader__motion-thick,
  .loader__motion-medium,
  .loader__motion-thin,
  .loader__sand-drop,
  .loader__sand-fill,
  .loader__sand-grain-left,
  .loader__sand-grain-right,
  .loader__sand-line-left,
  .loader__sand-line-right,
  .loader__sand-mound-top,
  .loader__sand-mound-bottom {
    animation-duration: var(--dur);
    animation-timing-function: cubic-bezier(0.83, 0, 0.17, 1);
    animation-iteration-count: infinite;
  }
  .loader__glare-top {
    animation-name: glare-top;
  }
  .loader__glare-bottom {
    animation-name: glare-bottom;
  }
  .loader__model {
    animation-name: loader-flip;
    transform-origin: 12.25px 16.75px;
  }
  .loader__motion-thick,
  .loader__motion-medium,
  .loader__motion-thin {
    transform-origin: 26px 26px;
  }
  .loader__motion-thick {
    animation-name: motion-thick;
  }
  .loader__motion-medium {
    animation-name: motion-medium;
  }
  .loader__motion-thin {
    animation-name: motion-thin;
  }
  .loader__sand-drop {
    animation-name: sand-drop;
  }
  .loader__sand-fill {
    animation-name: sand-fill;
  }
  .loader__sand-grain-left {
    animation-name: sand-grain-left;
  }
  .loader__sand-grain-right {
    animation-name: sand-grain-right;
  }
  .loader__sand-line-left {
    animation-name: sand-line-left;
  }
  .loader__sand-line-right {
    animation-name: sand-line-right;
  }
  .loader__sand-mound-top {
    animation-name: sand-mound-top;
  }
  .loader__sand-mound-bottom {
    animation-name: sand-mound-bottom;
    transform-origin: 12.25px 31.5px;
  }

  /* Dark theme */
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: hsl(var(--hue), 90%, 10%);
      --fg: hsl(var(--hue), 90%, 90%);
    }
  }
  /* Animation */
  @keyframes loader-flip {
    from {
      transform: translate(13.75px, 9.25px) rotate(-180deg);
    }
    24%,
    to {
      transform: translate(13.75px, 9.25px) rotate(0);
    }
  }
  @keyframes glare-top {
    from {
      stroke: rgba(255, 255, 255, 0);
    }
    24%,
    to {
      stroke: white;
    }
  }
  @keyframes glare-bottom {
    from {
      stroke: white;
    }
    24%,
    to {
      stroke: rgba(255, 255, 255, 0);
    }
  }
  @keyframes motion-thick {
    from {
      animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
      stroke: rgba(255, 255, 255, 0);
      stroke-dashoffset: 153.94;
      transform: rotate(0.67turn);
    }
    20% {
      animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
      stroke: rgb(32, 32, 32);
      stroke-dashoffset: 141.11;
      transform: rotate(1turn);
    }
    40%,
    to {
      stroke: rgba(255, 255, 255, 0);
      stroke-dashoffset: 153.94;
      transform: rotate(1.33turn);
    }
  }
  @keyframes motion-medium {
    from,
    8% {
      animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
      stroke: rgba(255, 255, 255, 0);
      stroke-dashoffset: 153.94;
      transform: rotate(0.5turn);
    }
    20% {
      animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
      stroke: white;
      stroke-dashoffset: 147.53;
      transform: rotate(0.83turn);
    }
    32%,
    to {
      stroke: rgba(255, 255, 255, 0);
      stroke-dashoffset: 153.94;
      transform: rotate(1.17turn);
    }
  }
  @keyframes motion-thin {
    from,
    4% {
      animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0);
      stroke: rgba(255, 255, 255, 0);
      stroke-dashoffset: 153.94;
      transform: rotate(0.33turn);
    }
    24% {
      animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1);
      stroke: rgb(53, 53, 53);
      stroke-dashoffset: 134.7;
      transform: rotate(0.67turn);
    }
    44%,
    to {
      stroke: rgba(255, 255, 255, 0);
      stroke-dashoffset: 153.94;
      transform: rotate(1turn);
    }
  }
  @keyframes sand-drop {
    from,
    10% {
      animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0);
      stroke-dashoffset: 1;
    }
    70%,
    to {
      stroke-dashoffset: -107;
    }
  }
  @keyframes sand-fill {
    from,
    10% {
      animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0);
      stroke-dashoffset: 55;
    }
    70%,
    to {
      stroke-dashoffset: -54;
    }
  }
  @keyframes sand-grain-left {
    from,
    10% {
      animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0);
      stroke-dashoffset: 29;
    }
    70%,
    to {
      stroke-dashoffset: -22;
    }
  }
  @keyframes sand-grain-right {
    from,
    10% {
      animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0);
      stroke-dashoffset: 27;
    }
    70%,
    to {
      stroke-dashoffset: -24;
    }
  }
  @keyframes sand-line-left {
    from,
    10% {
      animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0);
      stroke-dashoffset: 53;
    }
    70%,
    to {
      stroke-dashoffset: -55;
    }
  }
  @keyframes sand-line-right {
    from,
    10% {
      animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0);
      stroke-dashoffset: 14;
    }
    70%,
    to {
      stroke-dashoffset: -24.5;
    }
  }
  @keyframes sand-mound-top {
    from,
    10% {
      animation-timing-function: linear;
      transform: translate(0, 0);
    }
    15% {
      animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0);
      transform: translate(0, 1.5px);
    }
    51%,
    to {
      transform: translate(0, 13px);
    }
  }
  @keyframes sand-mound-bottom {
    from,
    31% {
      animation-timing-function: cubic-bezier(0.61, 1, 0.88, 1);
      transform: scale(1, 0);
    }
    56%,
    to {
      transform: scale(1, 1);
    }
  }
</style>

<template>
  <svg
    aria-label="loader being flipped clockwise and circled by three white curves fading in and out"
    role="img"
    height="56px"
    width="56px"
    viewBox="0 0 56 56"
    class="loader"
  >
    <clipPath id="sand-mound-top">
      <path
        d="M 14.613 13.087 C 15.814 12.059 19.3 8.039 20.3 6.539 C 21.5 4.789 21.5 2.039 21.5 2.039 L 3 2.039 C 3 2.039 3 4.789 4.2 6.539 C 5.2 8.039 8.686 12.059 9.887 13.087 C 11 14.039 12.25 14.039 12.25 14.039 C 12.25 14.039 13.5 14.039 14.613 13.087 Z"
        class="loader__sand-mound-top"
      ></path>
    </clipPath>
    <clipPath id="sand-mound-bottom">
      <path
        d="M 14.613 20.452 C 15.814 21.48 19.3 25.5 20.3 27 C 21.5 28.75 21.5 31.5 21.5 31.5 L 3 31.5 C 3 31.5 3 28.75 4.2 27 C 5.2 25.5 8.686 21.48 9.887 20.452 C 11 19.5 12.25 19.5 12.25 19.5 C 12.25 19.5 13.5 19.5 14.613 20.452 Z"
        class="loader__sand-mound-bottom"
      ></path>
    </clipPath>
    <g transform="translate(2,2)">
      <g
        transform="rotate(-90,26,26)"
        stroke-linecap="round"
        stroke-dashoffset="153.94"
        stroke-dasharray="153.94 153.94"
        stroke="hsl(0,0%,100%)"
        fill="none"
      >
        <circle
          transform="rotate(0,26,26)"
          r="24.5"
          cy="26"
          cx="26"
          stroke-width="2.5"
          class="loader__motion-thick"
        ></circle>
        <circle
          transform="rotate(90,26,26)"
          r="24.5"
          cy="26"
          cx="26"
          stroke-width="1.75"
          class="loader__motion-medium"
        ></circle>
        <circle
          transform="rotate(180,26,26)"
          r="24.5"
          cy="26"
          cx="26"
          stroke-width="1"
          class="loader__motion-thin"
        ></circle>
      </g>
      <g transform="translate(13.75,9.25)" class="loader__model">
        <path
          d="M 1.5 2 L 23 2 C 23 2 22.5 8.5 19 12 C 16 15.5 13.5 13.5 13.5 16.75 C 13.5 20 16 18 19 21.5 C 22.5 25 23 31.5 23 31.5 L 1.5 31.5 C 1.5 31.5 2 25 5.5 21.5 C 8.5 18 11 20 11 16.75 C 11 13.5 8.5 15.5 5.5 12 C 2 8.5 1.5 2 1.5 2 Z"
          fill="hsl(var(--hue),90%,85%)"
        ></path>

        <g stroke-linecap="round" stroke="hsl(35,90%,90%)">
          <line
            y2="20.75"
            x2="12"
            y1="15.75"
            x1="12"
            stroke-dasharray="0.25 33.75"
            stroke-width="1"
            class="loader__sand-grain-left"
          ></line>
          <line
            y2="21.75"
            x2="12.5"
            y1="16.75"
            x1="12.5"
            stroke-dasharray="0.25 33.75"
            stroke-width="1"
            class="loader__sand-grain-right"
          ></line>
          <line
            y2="31.5"
            x2="12.25"
            y1="18"
            x1="12.25"
            stroke-dasharray="0.5 107.5"
            stroke-width="1"
            class="loader__sand-drop"
          ></line>
          <line
            y2="31.5"
            x2="12.25"
            y1="14.75"
            x1="12.25"
            stroke-dasharray="54 54"
            stroke-width="1.5"
            class="loader__sand-fill"
          ></line>
          <line
            y2="31.5"
            x2="12"
            y1="16"
            x1="12"
            stroke-dasharray="1 107"
            stroke-width="1"
            stroke="hsl(35,90%,83%)"
            class="loader__sand-line-left"
          ></line>
          <line
            y2="31.5"
            x2="12.5"
            y1="16"
            x1="12.5"
            stroke-dasharray="12 96"
            stroke-width="1"
            stroke="hsl(35,90%,83%)"
            class="loader__sand-line-right"
          ></line>

          <g stroke-width="0" fill="hsl(35,90%,90%)">
            <path
              d="M 12.25 15 L 15.392 13.486 C 21.737 11.168 22.5 2 22.5 2 L 2 2.013 C 2 2.013 2.753 11.046 9.009 13.438 L 12.25 15 Z"
              clip-path="url(#sand-mound-top)"
            ></path>
            <path
              d="M 12.25 18.5 L 15.392 20.014 C 21.737 22.332 22.5 31.5 22.5 31.5 L 2 31.487 C 2 31.487 2.753 22.454 9.009 20.062 Z"
              clip-path="url(#sand-mound-bottom)"
            ></path>
          </g>
        </g>

        <g stroke-width="2" stroke-linecap="round" opacity="0.7" fill="none">
          <path
            d="M 19.437 3.421 C 19.437 3.421 19.671 6.454 17.914 8.846 C 16.157 11.238 14.5 11.5 14.5 11.5"
            stroke="hsl(0,0%,100%)"
            class="loader__glare-top"
          ></path>
          <path
            transform="rotate(180,12.25,16.75)"
            d="M 19.437 3.421 C 19.437 3.421 19.671 6.454 17.914 8.846 C 16.157 11.238 14.5 11.5 14.5 11.5"
            stroke="hsla(0,0%,100%,0)"
            class="loader__glare-bottom"
          ></path>
        </g>

        <rect height="2" width="24.5" fill="hsl(var(--hue),90%,50%)"></rect>
        <rect
          height="1"
          width="19.5"
          y="0.5"
          x="2.5"
          ry="0.5"
          rx="0.5"
          fill="hsl(var(--hue),90%,57.5%)"
        ></rect>
        <rect
          height="2"
          width="24.5"
          y="31.5"
          fill="hsl(var(--hue),90%,50%)"
        ></rect>
        <rect
          height="1"
          width="19.5"
          y="32"
          x="2.5"
          ry="0.5"
          rx="0.5"
          fill="hsl(var(--hue),90%,57.5%)"
        ></rect>
      </g>
    </g>
  </svg>
</template>
<script>
export default{
  name: 'shalou',
}
</script>