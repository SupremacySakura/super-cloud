import { Response } from '../types'

/**
 * 判断是否是Response<any>类型
 * @param obj 任意对象
 * @returns 是否是Response<any>类型
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