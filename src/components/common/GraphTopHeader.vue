<template>
  <header class="graph-top-header">
    <div class="graph-top-header__inner">
      <div class="graph-top-header__title">
        {{ title }}
      </div>
    </div>
  </header>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.graph-top-header {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 120px;
  background: url('https://lms.cdut.edu.cn/static/assets/images/knowledge-node/234a36768ff31bf18d9f.png')
    center/cover no-repeat;
  z-index: 1200;
  pointer-events: none;
}

.graph-top-header__inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  pointer-events: none;
  padding: 0 60px;
  box-sizing: border-box;
  position: relative;
}

.graph-top-header__title {
  font-size: 34px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #fff;
  text-shadow: 0 8px 25px rgba(0, 0, 0, 0.55);
  text-align: center;
  flex: none;
}
</style>

