<template>
  <div>
    <!-- 滚动进度条 -->
    <div class="scroll-progress" ref="scrollProgress"></div>

    <nav class="navbar navbar-transparent" ref="navbar">
      <div class="nav-inner">
        <div class="nav-left">
          <div class="brand">
            <img 
              src="../assets/nav.png" 
              alt="网站Logo" 
              class="logo-img"
            >
          </div>
        </div>
        <div class="nav-center nav-center-transparent" ref="navLinksRef">
          <a href="/home" class="nav-link bold">首页</a>
          <div class="nav-dropdown">
            <a class="nav-link bold">竞赛活动</a>
            <div class="dropdown-menu">
              <a href="/competition/edu" class="dropdown-item">教育部榜单竞赛</a>
              <a href="/competition/subject" class="dropdown-item">学科专业竞赛</a>
            </div>
          </div>
          <a href="/home#career" class="nav-link bold">职业规划</a>
          <a href="/knowledge-graph" class="nav-link bold">知识图谱</a>
          <a href="/home#profile" class="nav-link bold">个人主页</a>
          <div
            class="active-indicator"
            ref="indicatorRef"
            :style="indicatorStyle"
          ></div>
        </div>
        <div class="nav-right">
          <a href="/login" class="nav-auth" ref="loginLink">登录/注册</a>
          
          <div class="user-info-container" ref="userContainer" style="display: none;">
            <div class="user-avatar">
              <span class="user-account" ref="userAccount">U</span>
              <div class="user-dropdown">
                <a class="dropdown-item logout-btn" ref="logoutBtn">退出登录</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 元素引用（替代原JS中的getElementById）
const navbar = ref(null)
const scrollProgress = ref(null)
const loginLink = ref(null)
const userContainer = ref(null)
const userAccount = ref(null)
const logoutBtn = ref(null)
const navLinksRef = ref(null)
const indicatorRef = ref(null)

// 活动指示器样式
const indicatorStyle = ref({
  width: '0px',
  left: '0px'
})

// 导航栏透明状态标识
let isNavTransparent = true

// 滚动处理函数（保留原逻辑）
const handleScroll = () => {
  // 更新滚动进度条
  const scrollTop = window.scrollY
  const docHeight = document.body.offsetHeight - window.innerHeight
  const scrollPercent = (scrollTop / docHeight) * 100
  scrollProgress.value.style.width = `${scrollPercent}%`

  // 导航栏状态切换
  if (scrollTop < 50) {
    if (!isNavTransparent) {
      navbar.value.classList.add('navbar-transparent')
      isNavTransparent = true
    }
  } else {
    if (isNavTransparent) {
      navbar.value.classList.remove('navbar-transparent')
      isNavTransparent = false
    }
  }
}

// 退出登录函数（保留原逻辑）
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('userInfo')
    window.location.href = '/login'
  }
}

// 活动指示器移动函数
const moveIndicator = (linkElement) => {
  if (!linkElement || !navLinksRef.value) return
  
  const linkRect = linkElement.getBoundingClientRect()
  const navRect = navLinksRef.value.getBoundingClientRect()
  
  indicatorStyle.value = {
    width: `${linkRect.width}px`,
    left: `${linkRect.left - navRect.left}px`
  }
}

// 处理导航链接鼠标悬停
const handleNavLinkMouseEnter = (event) => {
  moveIndicator(event.target)
}

// 初始化活动指示器
const initializeIndicator = () => {
  setTimeout(() => {
    if (navLinksRef.value) {
      const firstLink = navLinksRef.value.querySelector('.nav-link')
      if (firstLink) {
        moveIndicator(firstLink)
      }
    }
  }, 100)
}

// 初始化用户状态（保留原逻辑）
const initUserStatus = () => {
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    const user = JSON.parse(userInfo)
    const accountText = user.userAccount || 'U'
    // 显示用户名首字母
    userAccount.value.textContent = accountText.charAt(0).toUpperCase() || 'U'
    loginLink.value.style.display = 'none'
    userContainer.value.style.display = 'block'
  }
}

// 组件挂载时绑定事件和初始化
onMounted(() => {
  // 监听滚动事件
  window.addEventListener('scroll', handleScroll)
  // 初始执行一次滚动处理（确保初始状态正确）
  handleScroll()
  // 初始化用户状态
  initUserStatus()
  // 绑定退出登录点击事件
  if (logoutBtn.value) {
    logoutBtn.value.addEventListener('click', handleLogout)
  }
  // 初始化活动指示器
  initializeIndicator()
  // 为导航链接绑定鼠标悬停事件
  if (navLinksRef.value) {
    const navLinks = navLinksRef.value.querySelectorAll('.nav-link')
    navLinks.forEach(link => {
      link.addEventListener('mouseenter', handleNavLinkMouseEnter)
    })
  }
})

// 组件卸载时移除事件（防止内存泄漏）
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (logoutBtn.value) {
    logoutBtn.value.removeEventListener('click', handleLogout)
  }
  // 移除导航链接事件监听
  if (navLinksRef.value) {
    const navLinks = navLinksRef.value.querySelectorAll('.nav-link')
    navLinks.forEach(link => {
      link.removeEventListener('mouseenter', handleNavLinkMouseEnter)
    })
  }
})
</script>

<style scoped>
/* 基础样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  text-decoration: none;
  list-style: none;
}

body {
  padding-top: 80px; /* 避免内容被导航栏遮挡 */
  min-height: 5000px; /* 保留页面高度以便滚动测试导航栏效果 */
}

/* 滚动进度指示器 */
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #4f46e5, #a855f7);
  width: 0%;
  z-index: 1001;
  transition: width 0.1s ease;
}

/* 导航栏样式 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: background-color 0.5s ease, box-shadow 0.4s ease, padding 0.3s ease, height 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 透明状态样式 */
.navbar-transparent {
  background: linear-gradient(rgb(66,66,66,0.8),rgba(122,122,122,.49), rgba(209,209,209, 0.04));
  backdrop-filter: blur(0px);
  box-shadow: none;
}

.nav-center-transparent {
  color: #fff;
}

.nav-inner {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  max-width: 1200px; /* 调整宽度 */
  height: 80px;
  margin: 0 auto;
}

.nav-left {
  width: 20%; /* 调整比例 */
  display: flex;
  align-items: center;
}

  .nav-center {
    width: 60%; /* 调整比例 */
    display: flex;
    justify-content: center;
    gap: 2rem;
    position: relative;
    font-family: 'Noto Sans SC', 'SourceHanSansCN-Regular', Poppins, Arial, 'Microsoft YaHei', "\u5b8b\u4f53", Tahoma, Geneva, sans-serif;
  }

.nav-right {
  width: 20%; /* 调整比例 */
  display: flex;
  justify-content: flex-end;
  padding-right: 15px;
}

/* Logo图片样式 - 增大尺寸 */
.logo-img {
  height: 130px; /* 增大Logo */
  width: auto;
  object-fit: contain;
  border-radius: 8px;
  transition: transform 0.3s ease, height 0.3s ease;
}

.logo-img:hover {
  transform: scale(1.03);
}

/* 滚动时缩小Logo */
.navbar:not(.navbar-transparent) .logo-img {
  height: 100px;
}

.brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4f46e5;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link {
  position: relative;
  padding: 0.5rem 0;
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  font-size: 19px;
  display: inline-block;
}

.nav-link:hover {
  color: #4f46e5;
}

.nav-link.active {
  color: #4f46e5;
}

/* 透明状态时导航链接为白色 */
.navbar-transparent .nav-link {
  color: #ffffff;
}

.navbar-transparent .nav-link:hover {
  color: #e0d7ff;
}

/* 活动指示器 */
.active-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #4f46e5, #a855f7);
  border-radius: 3px;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* 透明状态时活动指示器为白色 */
.navbar-transparent .active-indicator {
  background: linear-gradient(90deg, #ffffff, #e0d7ff);
}

.nav-auth {
  border: 1px solid #4f46e5;
  color: #4f46e5;
  font-weight: 600;
  font-size: 18px;
  padding: 7px 14px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.nav-auth:hover {
  color: #ffffff;
  background-color: #4f46e5;
  border-color: #4f46e5;
  transform: translateY(-2px);
}

/* 透明状态时登录按钮为白色 */
.navbar-transparent .nav-auth {
  border-color: #ffffff;
  color: #ffffff;
}

.navbar-transparent .nav-auth:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: #ffffff;
  color: #ffffff;
}

/* 用户信息样式 */
.user-info-container {
  position: relative;
  font-family: 'Courier New', Courier, monospace;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #4f46e5, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  cursor: pointer;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  transition: transform 0.3s ease;
  position: relative;
}

.user-avatar:hover {
  transform: scale(1.1);
}

.user-account {
  color: white;
  font-weight: bold;
  font-family:  Arial, sans-serif;
  font-size: 18px;
}

.user-dropdown {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 120px;
  background-color: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  border-radius: 6px;
  padding: 8px 0;
  margin-top: 5px;
}

.user-avatar:hover .user-dropdown {
  display: block;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.logout-btn {
  color: #d946ef !important;
  font-weight: 500;
  display: block;
  padding: 10px 20px;
}

.logout-btn:hover {
  background-color: #f3e8ff;
}

/* 导航栏下拉菜单样式 */
.nav-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 217px;
  background-color: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  border-radius: 6px;
  padding: 8px 0;
  margin-top: -2px;
}

.dropdown-item {
  display: block;
  padding: 10px 20px;
  color: #4a2599;
  text-decoration: none;
  font-size: 15px;
  text-align: left;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background-color: #f3e8ff;
  color: #6a3dc4;
  padding-left: 22px;
}

.nav-dropdown:hover .dropdown-menu {
  display: block;
  animation: fadeIn 0.2s ease;
}

.bold {
  font-weight: 600;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .nav-left,
  .nav-right {
    width: 25%;
  }

  .nav-center {
    width: 50%;
    gap: 12px;
  }

  .logo-img {
    height: 100px;
  }

  .navbar:not(.navbar-transparent) .logo-img {
    height: 80px;
  }

  .nav-link {
    font-size: 14px;
  }

  .nav-auth {
    font-size: 14px;
    padding: 5px 10px;
  }
}
</style>