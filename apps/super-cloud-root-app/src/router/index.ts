import { createRouter, createWebHistory } from 'vue-router'
// 导入路由
import { routes } from './route'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
  
})
export default router
