<template>
  <div class="clothespin">
    <div class="clothespin-line"></div>
    <div class="clothespin-ring"></div>
    <div class="clothespin-line"></div>
    <div class="clothespin-grain"></div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.clothespin {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  height: 32px;
  background: #C5A376;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-radius: 2px;
  z-index: 30;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.clothespin-line {
  width: 100%;
  height: 1px;
  background: rgba(0, 0, 0, 0.1);
}

.clothespin-ring {
  width: 12px;
  height: 4px;
  border: 1px solid rgba(107, 114, 128, 0.5);
  border-radius: 9999px;
}

.clothespin-grain {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.05), transparent);
  pointer-events: none;
}
</style>
