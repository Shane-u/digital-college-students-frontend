<template>
  <svg 
    class="twine-string"
    viewBox="0 0 1000 100" 
    preserveAspectRatio="none"
  >
    <defs>
      <filter id="fuzz">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
      </filter>
    </defs>
    
    <g filter="url(#fuzz)" opacity="0.6">
      <path 
        d="M-10 20 Q 250 65, 500 60 T 1010 30" 
        fill="none" 
        stroke="#8B6A47" 
        stroke-width="1.2" 
        stroke-linecap="round"
      />
      <path 
        d="M-10 22 Q 300 55, 550 65 T 1010 25" 
        fill="none" 
        stroke="#A68966" 
        stroke-width="0.8" 
        stroke-dasharray="150 2"
      />
      <path 
        d="M-10 18 Q 200 70, 480 58 T 1010 35" 
        fill="none" 
        stroke="#C5A376" 
        stroke-width="0.5"
      />
      <path d="M 120 45 L 125 38" stroke="#8B6A47" stroke-width="0.5" opacity="0.4" />
      <path d="M 450 62 L 455 70" stroke="#8B6A47" stroke-width="0.5" opacity="0.4" />
      <path d="M 780 40 L 775 48" stroke="#8B6A47" stroke-width="0.5" opacity="0.4" />
      <path 
        d="M-10 25 Q 400 75, 520 62 T 1010 28" 
        fill="none" 
        stroke="#D2B48C" 
        stroke-width="0.4" 
        opacity="0.8"
      />
    </g>
  </svg>
</template>

<script setup>
</script>

<style scoped>
.twine-string {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100px;
  z-index: 0;
  pointer-events: none;
  overflow: visible;
}
</style>
