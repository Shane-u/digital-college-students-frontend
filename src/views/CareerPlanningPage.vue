<template>
  <div class="career-planning-page">
    <NavBar :transparent="false" />
    <div class="page-content">
      <h1>职业规划</h1>
      <p>职业规划页面正在开发中...</p>
    </div>
  </div>
</template>

<script setup>
import NavBar from '../components/NavBar.vue'
</script>

<style scoped>
.career-planning-page {
  min-height: 100vh;
  padding-top: 80px;
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  text-align: center;
}
</style>
