// types/api.ts

import type { User } from "./user"

// 通用响应数据格式
export interface CommonResponseData {
    message: string
    code: number
}
// 登录接口响应数据格式
export interface LoginResponseData extends CommonResponseData {
    userInfo?: User
}
export interface ApiResponse<T> {
    code: number
    message: string
    data: T
}
