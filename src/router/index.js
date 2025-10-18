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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router





