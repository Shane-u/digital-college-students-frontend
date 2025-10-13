<template>
  <div class="home-page">
    <header class="header">
      <div class="container">
        <div class="logo">
          <div class="logo-icon">🎓</div>
          <h1>数字化大学生系统</h1>
        </div>
        <nav class="nav">
          <a href="#" class="nav-link">首页</a>
          <a href="#" class="nav-link">课程</a>
          <a href="#" class="nav-link">成绩</a>
          <a href="#" class="nav-link">个人中心</a>
        </nav>
      </div>
    </header>

    <main class="main">
      <div class="container">
        <div class="welcome-section">
          <h2>欢迎回来！</h2>
          <p>这里是你的数字化学习平台</p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📚</div>
            <h3>在线课程</h3>
            <p>丰富的在线课程资源</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>成绩查询</h3>
            <p>实时查看学习进度</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">👥</div>
            <h3>社交互动</h3>
            <p>与同学交流学习心得</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>移动学习</h3>
            <p>随时随地学习</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'HomePage'
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #ffffff;
  position: relative;
}

.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-icon {
  font-size: 32px;
}

.logo h1 {
  font-size: 24px;
  color: var(--text-primary);
  margin: 0;
}

.nav {
  display: flex;
  gap: 30px;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: var(--primary-yellow);
}

.main {
  padding: 60px 0;
}

.welcome-section {
  text-align: center;
  margin-bottom: 60px;
}

.welcome-section h2 {
  font-size: 36px;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.welcome-section p {
  font-size: 18px;
  color: var(--text-secondary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 40px 30px;
  border-radius: var(--border-radius);
  text-align: center;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-hover);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 20px;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.feature-card p {
  color: var(--text-secondary);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
    gap: 20px;
  }
  
  .nav {
    gap: 20px;
  }
  
  .welcome-section h2 {
    font-size: 28px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>


