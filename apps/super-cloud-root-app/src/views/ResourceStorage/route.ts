import type { RouteRecordRaw } from "vue-router";
import type { NavItem } from "../../types/router";
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
        component: () => import('./components/Home.vue'),
        meta: {
            title: '主页'
        }
    },
    {
        path: '/resource/imageMarket',
        name: 'resource-imageMarket',
        component: () => import('./components/ImageMarket.vue'),
        meta: {
            title: '图片市场'
        }
    },
    {
        path: '/resource/fileManagement',
        name: 'resource-fileManagement',
        component: () => import('./components/FileManagement.vue'),
        meta: {
            title: '文件管理'
        }
    },
]
/**
 * 资源管理路由导航
 */
const resourceSideBar: NavItem[] = []
resourceRoutes.forEach((item) => {
    if(!item.meta || !item.meta.title){
        return
    }
    const newItem: NavItem = {
        path: item.path,
        text: item.meta?.title as string || '',
        name: item.name as string
    }
    resourceSideBar.push(newItem)
})

export {resourceSideBar}