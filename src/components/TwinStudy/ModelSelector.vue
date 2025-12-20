<template>
  <div class="model-selector" ref="containerRef">
    <button 
      @click="isOpen = !isOpen"
      class="model-selector-btn"
    >
      <span>{{ getModeLabel(modelMode) }}</span>
      <ChevronDownIcon :class="{ 'rotate-180': isOpen }" />
    </button>

    <div v-if="isOpen" class="model-dropdown">
      <div class="dropdown-header">Gemini 3</div>
      
      <button 
        @click="selectMode('fast')"
        :class="['model-option', { 'active': modelMode === 'fast' }]"
      >
        <div class="model-option-content">
          <div class="model-icon blue">
            <ZapIcon />
          </div>
          <div class="model-info">
            <div class="model-name">Fast</div>
            <div class="model-desc">Answers quickly</div>
          </div>
        </div>
        <CheckCircleIcon v-if="modelMode === 'fast'" />
      </button>

      <button 
        @click="selectMode('thinking')"
        :class="['model-option', { 'active': modelMode === 'thinking' }]"
      >
        <div class="model-option-content">
          <div class="model-icon purple">
            <BrainCircuitIcon />
          </div>
          <div class="model-info">
            <div class="model-name-row">
              <span class="model-name">Thinking</span>
              <span class="new-badge">New</span>
            </div>
            <div class="model-desc">Solves complex problems</div>
          </div>
        </div>
        <CheckCircleIcon v-if="modelMode === 'thinking'" />
      </button>

      <button 
        @click="selectMode('pro')"
        :class="['model-option', { 'active': modelMode === 'pro' }]"
      >
        <div class="model-option-content">
          <div class="model-icon amber">
            <StarIcon />
          </div>
          <div class="model-info">
            <div class="model-name">Pro</div>
            <div class="model-desc">Thinks longer for math & code</div>
          </div>
        </div>
        <CheckCircleIcon v-if="modelMode === 'pro'" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { h } from 'vue'

const ChevronDownIcon = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, class: 'transition-transform duration-200' }, [
  h('polyline', { points: '6 9 12 15 18 9' })
])

const ZapIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'currentColor' }, [
  h('polygon', { points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' })
])

const BrainCircuitIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
  h('path', { d: 'M12 5a3 3 0 1 0-5.997.142 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588 4 4 0 0 0 7.636 2.106 3 3 0 0 0 .164-1.769 4 4 0 0 0-2.526-5.77A4 4 0 0 0 12 5z' }),
  h('path', { d: 'M12 5a3 3 0 1 1 5.997.142 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588 4 4 0 0 1-7.636 2.106 3 3 0 0 1-.164-1.769 4 4 0 0 1 2.526-5.77A4 4 0 0 1 12 5z' })
])

const StarIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'currentColor' }, [
  h('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' })
])

const CheckCircleIcon = () => h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, class: 'text-blue-600' }, [
  h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
  h('polyline', { points: '22 4 12 14.01 9 11.01' })
])

const props = defineProps({
  mode: {
    type: String,
    required: true
  },
  setMode: {
    type: Function,
    required: true
  }
})

const isOpen = ref(false)
const containerRef = ref(null)

const getModeLabel = (mode) => {
  switch (mode) {
    case 'fast': return 'Fast'
    case 'thinking': return 'Thinking'
    case 'pro': return 'Pro'
    default: return 'Fast'
  }
}

const selectMode = (mode) => {
  props.setMode(mode)
  isOpen.value = false
}

const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<style scoped>
.model-selector {
  position: relative;
}

.model-selector-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #e1e5ea;
  border: none;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 500;
  color: #444746;
  cursor: pointer;
  transition: background-color 0.2s;
}

.model-selector-btn:hover {
  background: #d3d9e0;
}

.rotate-180 {
  transform: rotate(180deg);
}

.model-dropdown {
  position: absolute;
  bottom: 100%;
  margin-bottom: 16px;
  right: 0;
  width: 320px;
  background: #f0f4f9;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px);
  z-index: 50;
  overflow: hidden;
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #444746;
}

.model-option {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 12px;
  transition: background-color 0.2s;
  border: none;
  background: transparent;
  cursor: pointer;
}

.model-option:hover {
  background: rgba(0, 0, 0, 0.05);
}

.model-option.active {
  background: #d3e3fd;
}

.model-option-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.model-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.model-icon.blue {
  background: #dbeafe;
  color: #2563eb;
}

.model-icon.purple {
  background: #e9d5ff;
  color: #9333ea;
}

.model-icon.amber {
  background: #fef3c7;
  color: #d97706;
}

.model-info {
  text-align: left;
}

.model-name {
  font-size: 14px;
  font-weight: 500;
}

.model-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.new-badge {
  background: #2563eb;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 700;
}

.model-desc {
  font-size: 12px;
  color: #5e5e5e;
}

.text-blue-600 {
  color: #2563eb;
}
</style>
