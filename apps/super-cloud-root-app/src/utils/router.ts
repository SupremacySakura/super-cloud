import type { RouteRecordRaw } from "vue-router"
import type { NavItem } from "../types/router"

export const getSideBarListFromRoutes = (routes: RouteRecordRaw[]) => {

    const sideBarList: NavItem[] = []
    routes.forEach((item) => {
        if (!item.meta || !item.meta.title) {
            return
        }
        const newItem: NavItem = {
            path: item.path,
            text: item.meta?.title as string || '',
            name: item.name as string
        }
        sideBarList.push(newItem)
    })
    return sideBarList
}