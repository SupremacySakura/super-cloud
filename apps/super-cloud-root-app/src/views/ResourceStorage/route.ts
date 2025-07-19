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
        path: '/resource/imgPreview',
        name: 'resource-imgPreview',
        component: () => import('./components/ImgPreview.vue'),
        meta: {
            title: '图片预览'
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
    {
        path: '/resource/uploadFile',
        name: 'resource-uploadFile',
        component: () => import('./components/UploadFile.vue'),
        meta: {
            title: '文件上传'
        }
    },
]
/**
 * 资源管理路由导航
 */
export const resourceSideBar: NavItem[] = resourceRoutes.map((item) => {
    const newItem: NavItem = {
        path: item.path,
        text: item.meta?.title as string || '',
        name: item.name as string
    }
    return newItem
})

