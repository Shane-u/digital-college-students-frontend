<template>
  <nav class="navbar" :class="{ 'navbar-transparent': isNavTransparent }">
    <div class="nav-inner">
      <div class="nav-left">
        <div class="brand">
          <span class="brand-text">数字大学生</span>
        </div>
      </div>
      <div class="nav-center">
        <router-link to="/home" class="nav-link bold">首页</router-link>
        <div class="nav-dropdown">
          <a class="nav-link bold">竞赛活动</a>
          <div class="dropdown-menu">
            <router-link to="/competition/edu" class="dropdown-item">教育部榜单竞赛</router-link>
            <router-link to="/competition/subject" class="dropdown-item">学科专业竞赛</router-link>
          </div>
        </div>
        <a href="/home#career" class="nav-link bold">职业规划</a>
        <a href="/home#knowledge" class="nav-link bold">知识图谱</a>
        <a href="/home#profile" class="nav-link bold">个人主页</a>
      </div>
      <div class="nav-right">
        <router-link to="/login" class="nav-auth">登录/注册</router-link>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  name: 'NavBar',
  props: {
    transparent: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const isNavTransparent = ref(props.transparent);
    
    const handleScroll = () => {
      if (props.transparent) {
        isNavTransparent.value = window.scrollY < 50;
      }
    };
    
    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
      // 初始状态
      handleScroll();
    });
    
    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
    });
    
    return {
      isNavTransparent
    };
  }
};
</script>

<style scoped>
/* 导航栏样式 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: linear-gradient(
    to bottom,
    rgba(30, 132, 248, 0.55),
    rgba(81, 163, 251, 0.28),
    rgba(134, 187, 248, 0)
  );
  box-shadow: none;
  transition: background 0.5s ease, box-shadow 0.4s ease;
}

.navbar-transparent {
  background: linear-gradient(
    to bottom,
    rgba(30, 132, 248, 0.55),
    rgba(81, 163, 251, 0.28),
    rgba(134, 187, 248, 0)
  );
  box-shadow: none;
}

.nav-inner {
  padding: 14px 20px;
  display: flex;
  align-items: center;
}

.nav-left {
  width: 25%;
  display: flex;
  align-items: center;
}

.nav-center {
  width: 50%;
  display: flex;
  justify-content: center;
  gap: 36px;
}

.nav-right {
  width: 25%;
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
}

.brand-text {
  color: #ffffff;
  font-weight: 700;
  font-size: 50px;
  letter-spacing: 1px;
}

.nav-link {
  color: #ffffff;
  text-decoration: none;
  font-weight: 700;
  letter-spacing: 0.3px;
  transition: color 0.2s ease;
  font-size: 20px;
}

.nav-link:hover {
  color: #cfe4ff;
}

.nav-auth {
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  font-size: 20px;
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
  min-width: 150px;
  background-color: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  border-radius: 4px;
  padding: 8px 0;
}

.dropdown-item {
  display: block;
  padding: 10px 20px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  text-align: left;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
  color: #3b82f6;
}

.nav-dropdown:hover .dropdown-menu {
  display: block;
}

.bold {
  font-weight: 600;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .nav-left,
  .nav-right {
    width: 30%;
  }

  .nav-center {
    width: 40%;
    gap: 18px;
  }

  .brand-text {
    font-size: 36px;
  }

  .nav-link {
    font-size: 16px;
  }

  .nav-auth {
    font-size: 16px;
  }
}
</style>
