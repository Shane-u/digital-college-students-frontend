import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import HomePage from '../views/HomePage.vue'
import EduCompetitionPage from '../views/EduCompetitionPage.vue'
import SubjectCompetitionPage from '../views/SubjectCompetitionPage.vue'
import KnowledgeGraphPage from '../views/KnowledgeGraphPage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import GrowthRecordPage from '../views/GrowthRecordPage.vue'
import MilestonePage from '../views/MilestonePage.vue'
import PhotoWallPage from '../views/PhotoWallPage.vue'
import RecordPreviewPage from '../views/RecordPreviewPage.vue'
import ResumeBuilderPage from '../views/ResumeBuilderPage.vue'
import AIInterviewPage from '../views/AIInterviewPage.vue'
import AIInterviewSessionPage from '../views/AIInterviewSessionPage.vue'

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
  {
    path: '/knowledge-graph',
    name: 'KnowledgeGraph',
    component: KnowledgeGraphPage
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage
  },
  {
    path: '/growth/record',
    name: 'GrowthRecord',
    component: GrowthRecordPage
  },
  {
    path: '/growth/milestone',
    name: 'Milestone',
    component: MilestonePage
  },
  {
    path: '/growth/photo-wall',
    name: 'PhotoWall',
    component: PhotoWallPage
  },
  {
    path: '/growth/record/preview/:date',
    name: 'RecordPreview',
    component: RecordPreviewPage
  },
  {
    path: '/career/resume',
    name: 'ResumeBuilder',
    component: ResumeBuilderPage
  },
  {
    path: '/career/ai-interview',
    name: 'AIInterview',
    component: AIInterviewPage
  },
  {
    path: '/career/ai-interview/session',
    name: 'AIInterviewSession',
    component: AIInterviewSessionPage
  },
  {
    path: '/career/showcase',
    name: 'CareerShowcase',
    component: () => import('../views/CareerShowcasePage.vue')
  },
  {
    path: '/career/planning',
    name: 'CareerPlanning',
    component: () => import('../views/CareerPlanningPage.vue')
  },
  {
    path: '/career/planning/assessment',
    name: 'CareerPlanningAssessmentFlow',
    component: () => import('../views/CareerPlanningPage.vue')
  },
  {
    path: '/competition/detail/:id',
    name: 'ContestDetail',
    component: () => import('../views/ContestDetailPage.vue')
  },
  {
    path: '/twin-study',
    name: 'TwinStudy',
    component: () => import('../views/TwinStudyPage.vue')
  },
  {
    path: '/flash-card',
    name: 'FlashCard',
    component: () => import('../views/FlashCardPage.vue')
  },
  {
    path: '/flashcard-graph',
    name: 'FlashcardGraph',
    component: () => import('../views/FlashcardGraphPage.vue')
  },
  {
    path: '/flashcard-temp',
    name: 'FlashcardTemp',
    component: () => import('../views/FlashcardGraphPage.vue')
  },
  {
    path: '/learning-path',
    redirect: '/learning-path-graph'
  },
  {
    path: '/learning-path-graph',
    name: 'LearningPathGraph',
    component: () => import('../views/LearningPathGraphPage.vue')
  },
  {
    path: '/learning-path-graph/:pathId',
    name: 'LearningPathGraphDetail',
    component: () => import('../views/LearningPathGraphPage.vue')
  },
  {
    path: '/flashcard-test/:flashcardId',
    name: 'FlashcardTest',
    component: () => import('../views/FlashcardTestPage.vue')
  },
  {
    path: '/flashcard-test/:flashcardId/result',
    name: 'FlashcardTestResult',
    component: () => import('../views/FlashcardTestResultPage.vue')
  },
  {
    path: '/flashcard-test/papers/:testId/attempts',
    name: 'FlashcardTestAttempts',
    component: () => import('../views/FlashcardTestAttemptsPage.vue')
  },
  {
    path: '/flashcard-test/attempts/:attemptId',
    name: 'FlashcardTestAttemptDetail',
    component: () => import('../views/FlashcardTestAttemptDetailPage.vue')
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 记录进入图谱页面的来源（只允许：首页 / 孪孪伴学）
const GRAPH_ENTRY_ORIGIN_KEY = 'graph_entry_origin'
const isAllowedOrigin = (p) => p === '/home' || p === '/twin-study'
const isGraphPage = (p) =>
  p === '/flashcard-graph' ||
  p === '/flashcard-temp' ||
  p === '/learning-path-graph' ||
  p?.startsWith('/learning-path-graph/')

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

router.afterEach((to, from) => {
  try {
    if (!isGraphPage(to?.path)) return
    const fromPath = from?.path
    if (isAllowedOrigin(fromPath)) {
      sessionStorage.setItem(GRAPH_ENTRY_ORIGIN_KEY, from?.fullPath || fromPath)
    }
  } catch (_) {}
})

export default router





