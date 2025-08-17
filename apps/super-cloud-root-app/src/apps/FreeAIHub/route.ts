import type { RouteRecordRaw } from "vue-router";
import type { NavItem } from "../../types/router";
import { getSideBarListFromRoutes } from "../../utils/router";
/**
 * AI路由
 */
export const AIRoutes: RouteRecordRaw[] = [
    {
        path: '/AI',
        redirect: '/AI/home'
    },
    {
        path: '/AI/home',
        name: 'AI-home',
        component: () => import('./pages/Home.vue'),
        meta: {
            title: '主页'
        }
    },
    {
        path: '/AI/chat',
        name: 'AI-chat',
        component: () => import('./pages/ChatWithAI.vue'),
        meta: {
            title: '聊天'
        }
    }
]
/**
 * AI路由导航
 */
const sideBarList: NavItem[] = getSideBarListFromRoutes(AIRoutes)


export { sideBarList }