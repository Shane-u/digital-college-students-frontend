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
        <!-- 未登录状态 -->
        <router-link v-if="!userInfo" to="/login" class="nav-auth">登录/注册</router-link>
        
        <!-- 已登录状态 -->
        <div v-else class="user-info-container">
          <div class="user-info">
            <span class="user-account">{{ userInfo.userAccount || '用户' }}</span>
            <div class="user-dropdown">
              <a @click="handleLogout" class="dropdown-item logout-btn">退出登录</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'NavBar',
  props: {
    transparent: {
      type: Boolean,
      default: true
    },
    userInfo: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    const router = useRouter();
    const isNavTransparent = ref(props.transparent);
    
    const handleScroll = () => {
      if (props.transparent) {
        isNavTransparent.value = window.scrollY < 50;
      }
    };
    
    // 退出登录
    const handleLogout = () => {
      if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('userInfo');
        router.push('/login');
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
      isNavTransparent,
      handleLogout
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
  background: #BFA8F0;
  transition: background 0.5s ease, box-shadow 0.4s ease;
}

.navbar-transparent {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3),
    rgba(0, 0, 0, 0.2),
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0)
  );
  /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); */
  border-top: 5px solid rgba(111, 90, 209);
}

.nav-inner {
  padding: 10px 20px;
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
  border-radius: 6px;
  width: 25%;
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
}

.brand-text {
  color: #ffffff;
  font-weight: bold;
  font-size: 40px;
  letter-spacing: 1px;
  font-family:'Courier New', Courier, monospace;
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
  color: #c249fa;
}

.nav-auth {
  border: 1px solid white;
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  font-size: 20px;
  padding: 8px;
  border-radius: 6px;
}
.nav-auth:hover {
  color: #c249fa;
  border-color: #c249fa;
}


/* 用户信息样式 */
.user-info-container {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  padding: 5px 10px;
  width: 60px;
  height: 60px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.user-info:hover {
  /* background-color: rgba(255, 255, 255, 0.1); */
}


.user-account {
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  margin-right: 5px;
}

.user-account:hover {
  color: #c249fa;
  border-color: #c249fa;
}

.user-dropdown {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 120px;
  background-color: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  border-radius: 4px;
  padding: 8px 0;
}

.user-info:hover .user-dropdown {
  display: block;
}

.logout-btn {
  color: #f56565 !important;
  font-weight: 500;
}

.logout-btn:hover {
  background-color: #fff5f5;
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
