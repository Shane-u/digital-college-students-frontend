<template>
  <div class="progress-circle-container" @click="handleClick">
    <svg :width="size" :height="size" class="progress-svg" :style="{ transform: 'rotate(-90deg)' }">
      <!-- 背景圆环 -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke="bgColor"
        :stroke-width="strokeWidth"
        fill="transparent"
      />
      <!-- 进度圆环 -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke="progressColor"
        :stroke-width="strokeWidth"
        fill="transparent"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        stroke-linecap="round"
        class="progress-circle"
      />
    </svg>
    <!-- 中心图标 -->
    <div class="progress-icon-wrapper">
      <svg 
        v-if="isGenerating" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2"
        class="progress-icon generating"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
      <svg 
        v-else 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2"
        class="progress-icon"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    </div>
    <!-- 生成中指示点 -->
    <div v-if="isGenerating" class="generating-dot"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isGenerating: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 100
  },
  size: {
    type: Number,
    default: 44
  },
  strokeWidth: {
    type: Number,
    default: 3
  },
  bgColor: {
    type: String,
    default: '#f3e8ff'
  },
  progressColor: {
    type: String,
    default: '#9333ea'
  }
})

const emit = defineEmits(['click'])

const center = computed(() => props.size / 2)
const radius = computed(() => center.value - props.strokeWidth)
const circumference = computed(() => 2 * Math.PI * radius.value)
const offset = computed(() => circumference.value - (props.progress / 100) * circumference.value)

const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
.progress-circle-container {
  position: relative;
  cursor: pointer;
  display: inline-block;
}

.progress-svg {
  display: block;
}

.progress-circle {
  transition: stroke-dashoffset 0.3s ease-in-out;
}

.progress-icon-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.progress-icon {
  color: #9333ea;
  transition: transform 0.2s;
}

.progress-icon.generating {
  color: #a78bfa;
  animation: pulse 1.5s ease-in-out infinite;
}

.generating-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #9333ea;
  border-radius: 50%;
  border: 2px solid white;
}

.progress-circle-container:hover .progress-icon:not(.generating) {
  transform: scale(1.1);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
