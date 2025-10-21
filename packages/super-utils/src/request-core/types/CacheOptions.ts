import { RequestConfig } from "./RequestConfig"

export interface RequestCacheOptions {
    useCache?: boolean  // 是否开启缓存
    cacheTTL?: number  // 缓存有效时间(毫秒)
    getCacheKey?: (config: RequestConfig) => any  // 自定义缓存键生成函数
}

export interface GlobalCacheOptions extends RequestCacheOptions {
    enableCacheCleanUp?: boolean  // 是否启用定时清理过期缓存
    cleanUpInterval?: number  // 定时清理间隔(毫秒)
    maxCacheSize?: number  // 最大缓存条数
}
