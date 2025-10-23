/**
 * 请求核心工具函数模块
 * 
 * 提供请求库中常用的工具函数，包括类型判断、数据处理等辅助功能
 */

import { Response } from "../types"

/**
 * 类型守卫函数：判断对象是否为Response类型
 * 
 * 通过检查对象的结构特征来确定其是否符合Response接口定义，
 * 可以在运行时安全地进行类型断言，为TypeScript提供类型推断支持。
 * 
 * @param obj 待检查的任意对象
 * @returns 类型守卫布尔值，如果obj符合Response接口结构则返回true
 * @remarks 
 * 此函数使用"obj is Response<any>"返回类型，使TypeScript编译器能够在条件分支中正确推断类型
 */
export const isResponse = (obj: any): obj is Response<any> => {
    return obj
        && typeof obj === 'object'
        && 'data' in obj
        && 'status' in obj
        && 'statusText' in obj
        && 'headers' in obj
        && 'config' in obj
        && typeof obj.config === 'object'
}