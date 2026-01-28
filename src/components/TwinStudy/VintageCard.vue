<template>
  <div 
    class="vintage-card-wrapper"
    :style="{
      transform: `rotate(${data.rotation}deg)`,
      marginTop: '-12px'
    }"
    @click.stop="$emit('click')"
  >
    <Clothespin />
    
    <div 
      class="vintage-card noise-overlay"
      :style="{
        width: `${data.width}px`,
        height: `${data.height}px`,
        backgroundColor: data.color,
        marginTop: '16px'
      }"
    >
      <div 
        v-if="data.height > 250"
        class="ruled-lines"
      ></div>

      <div 
        class="card-content"
        :style="{ 
          fontFamily: data.fontFamily,
          fontSize: data.width < 150 ? '0.95rem' : '1.1rem'
        }"
      >
        <p v-for="(line, i) in contentLines" :key="i" class="content-line">{{ line }}</p>
      </div>

      <div class="card-footer">
        <span class="card-id">№ {{ data.id.toUpperCase() }}</span>
        <div class="card-stamp">
          <span>OK</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Clothespin from './Clothespin.vue'

defineEmits(['click'])

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const contentLines = computed(() => {
  return props.data.content.split('\n')
})
</script>

<style scoped>
.vintage-card-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 1s ease-in-out;
  cursor: pointer;
}

.vintage-card-wrapper:hover .vintage-card {
  transform: translateY(-4px);
  box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.15), 0 15px 15px -5px rgba(0, 0, 0, 0.06);
}

.vintage-card {
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 18px;
  display: flex;
  flex-direction: column;
  overflow: visible;
  border-radius: 2px 3px 2px 4px;
  clip-path: polygon(0% 0%, 100% 0%, 100% 98%, 97% 100%, 3% 99%, 0% 100%);
  transition: all 0.3s ease;
  min-height: fit-content;
  box-sizing: border-box;
}

.ruled-lines {
  position: absolute;
  inset: 0;
  opacity: 0.1;
  pointer-events: none;
  background-image: linear-gradient(#000 1px, transparent 1px);
  background-size: 100% 24px;
}

.card-content {
  flex: 1;
  overflow: visible;
  color: rgba(31, 41, 55, 0.8);
  line-height: 1.75;
  user-select: none;
  min-height: 0;
  display: flex;
  flex-direction: column;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.content-line {
  margin-bottom: 8px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  hyphens: auto;
}

.card-footer {
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-id {
  font-size: 10px;
  opacity: 0.3;
  font-family: monospace;
}

.card-stamp {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.2;
  transform: rotate(12deg);
}

.card-stamp span {
  font-size: 8px;
}

.noise-overlay {
  position: relative;
}

.noise-overlay::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}
</style>
