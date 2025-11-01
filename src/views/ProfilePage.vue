<template>
  <div class="profile-page">
    <NavBar :transparent="false" />
    
    <div class="profile-container">
      <h1 class="page-title">个人主页</h1>
      <p class="page-subtitle">在这里可以编辑和查看您的成长轨迹</p>
      
      <div class="content-placeholder">
        <p>个人主页内容区域</p>
        <p>可以在这里添加更多功能...</p>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script setup>
import NavBar from '../components/NavBar.vue';
import Footer from '../components/Footer.vue';

</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding-top: 60px;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.page-subtitle {
  font-size: 18px;
  color: #666;
  margin: 0 0 40px 0;
}

.content-placeholder {
  background: white;
  border-radius: 12px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.content-placeholder p {
  font-size: 16px;
  color: #999;
  margin: 10px 0;
}
</style>

