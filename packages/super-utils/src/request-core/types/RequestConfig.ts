import { GlobalCacheOptions, RequestCacheOptions } from "./CacheOptions"

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD'
/**
 * 基础请求配置
 */
export interface RequestConfig {
    url: string
    method?: RequestMethod
    headers?: Record<string, string>
    params?: Record<string, any>
    data?: any
    timeout?: number

    // cacheOptions?: RequestCacheOptions
}
