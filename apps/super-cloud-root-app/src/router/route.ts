import type { RouteRecordRaw } from "vue-router";
import { resourceRoutes } from "../apps/ResourceStorage/route";
import { AIRoutes } from "../apps/FreeAIHub/route";
import type { NavItem } from "../types/router";
import MainView from '../layouts/Main.vue'
const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/home',
        component: MainView,
        children: [

            {
                path: '/home',
                name: 'home',
                component: () => import('../apps/Home/Home.vue'),
                meta: {
                    id: 1,
                    title: '首页'
                }
            },
            {
                path: '/resource',
                name: 'resource',
                component: () => import('../apps/ResourceStorage/ResourceStorage.vue'),
                children: resourceRoutes,
                meta: {
                    id: 2,
                    title: '资源管理助手'
                }
            },
            {
                path: '/AI',
                name: 'AI',
                component: () => import('../apps/FreeAIHub/FreeAIHub.vue'),
                children: AIRoutes,
                meta: {
                    id: 3,
                    title: 'AI助手'
                }
            }
        ]
    },
    {
        path: '/fullscreen',
        name: 'fullscreen',
        component: () => import('../layouts/FullScreen.vue'),
        children: [
            {
                path: '/login',
                name: 'login',
                component: () => import('../apps/Login/Login.vue'),
                meta: {
                    text: '登录'
                }
            },
            {
                path: '/register',
                name: 'register',
                component: () => import('../apps/Register/Register.vue'),
                meta: {
                    text: '注册'
                }
            }
        ]
    },

]
const rootNavBar: NavItem[] = routes[0].children?.map((item => {
    const newItem: NavItem = {
        path: item.path,
        text: item.meta?.title as string || '',
        name: item.name as string
    }
    return newItem
})) || []
export {
    routes,
    rootNavBar
}