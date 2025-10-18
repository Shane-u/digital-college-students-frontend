<template>
  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-left">
        <h1>大学生数字李生系统</h1>
      </div>
      <div class="footer-right">
        <p>数字时代的校园伙伴，陪你找竞<br />
           赛资源、规划职业路径、分享日<br />
           常，同步打造你的大学成长档案</p>
      </div>
    </div>
    <div class="footer-copyright">
      Copyright  成都理工大学
    </div>
  </footer>
</template>

<script>
export default {
  name: 'SiteFooter'
}
</script>

<style scoped>
.site-footer {
  width: 100%;
  background-image: url('../assets/buttom.png');
  background-size: cover;
  background-position: center;
  color: white;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0 10px;
}

.footer-content {
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  margin-bottom: 20px;
  position: relative;
}

.footer-content::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateY(-50%);
  height: 80%;
  width: 1px;
  background-color: rgba(255, 255, 255, 0.5);
}

.footer-left {
  text-align: left;
  padding-right: 20px;
}

.footer-left h1 {
  font-size: 32px;
  font-weight: 600;
  margin: 0;
  line-height: 1.5;
}

.footer-right {
  text-align: left;
  padding-left: 20px;
}

.footer-right p {
  font-size: 16px;
  line-height: 1.8;
  margin: 0;
}

.footer-copyright {
  width: 100%;
  text-align: center;
  padding: 10px 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  
  .footer-content::after {
    display: none;
  }
  
  .footer-left, .footer-right {
    text-align: center;
    padding: 0;
  }
}
</style>

