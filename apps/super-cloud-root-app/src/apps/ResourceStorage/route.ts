import type { RouteRecordRaw } from "vue-router";
import type { NavItem } from "../../types/router";
import { getSideBarListFromRoutes } from "../../utils/router";
/**
 * 资源管理路由
 */
export const resourceRoutes: RouteRecordRaw[] = [
    {
        path: '/resource',
        redirect: '/resource/home'
    },
    {
        path: '/resource/home',
        name: 'resource-home',
        component: () => import('./pages/Home/Home.vue'),
        meta: {
            title: '主页'
        }
    },
    {
        path: '/resource/imageMarket',
        name: 'resource-imageMarket',
        component: () => import('./pages/ImageMarket/ImageMarket.vue'),
        meta: {
            title: '图片市场'
        }
    },
    {
        path: '/resource/fileManagement',
        name: 'resource-fileManagement',
        component: () => import('./pages/FileManagement/FileManagement.vue'),
        meta: {
            title: '文件管理'
        }
    },
]
/**
 * 资源管理路由导航
 */
const sideBarList: NavItem[] = getSideBarListFromRoutes(resourceRoutes)


export { sideBarList }