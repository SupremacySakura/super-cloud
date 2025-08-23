import type { RouteRecordRaw } from "vue-router";
import type { NavItem } from "../../types/router";
import { getSideBarListFromRoutes } from "../../utils/router";
/**
 * CICD管理路由
 */
export const CICDRoutes: RouteRecordRaw[] = [
    {
        path: '/ci-cd',
        redirect: '/ci-cd/home'
    },
    {
        path: '/ci-cd/home',
        name: 'ci-cd-home',
        component: () => import('./pages/Home/Home.vue'),
        meta: {
            title: '主页'
        }
    },
    {
        path: '/ci-cd/projectManagement',
        name: 'ci-cd-projectManagement',
        component: () => import('./pages/ProjectManagement/ProjectManagement.vue'),
        meta: {
            title: '项目管理'
        }
    },
    {
        path: '/ci-cd/serverManagement',
        name: 'ci-cd-serverManagement',
        component: () => import('./pages/ServerManagement/ServerManagement.vue'),
        meta: {
            title: '服务器管理'
        }
    },
]
/**
 * 资源管理路由导航
 */
const sideBarList: NavItem[] = getSideBarListFromRoutes(CICDRoutes)


export { sideBarList }