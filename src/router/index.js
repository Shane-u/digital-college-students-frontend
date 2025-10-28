import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import HomePage from '../views/HomePage.vue'
import EduCompetitionPage from '../views/EduCompetitionPage.vue'
import SubjectCompetitionPage from '../views/SubjectCompetitionPage.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/competition/edu',
    name: 'EduCompetition',
    component: EduCompetitionPage
  },
  {
    path: '/competition/subject',
    name: 'SubjectCompetition',
    component: SubjectCompetitionPage
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
  // 不需要登录的页面
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  
  // 从localStorage获取用户信息
  const userInfoStr = localStorage.getItem('userInfo');
  
  // 如果需要登录但没有用户信息，则重定向到登录页面
  if (authRequired && !userInfoStr) {
    next('/login');
  } 
  // 如果已登录且访问登录页，则重定向到首页
  else if (to.path === '/login' && userInfoStr) {
    next('/home');
  }
  // 其他情况正常访问
  else {
    next();
  }
});

export default router





