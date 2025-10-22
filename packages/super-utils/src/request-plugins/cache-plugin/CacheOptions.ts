import { RequestConfig } from "../../request-core/types/RequestConfig"

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

// 临时解决方案 用于 plugin 代码提示打包,由于rollup打包工具的一些问题,暂时这样使用
declare module '../' {
    interface RequestConfig {
        cacheOptions?: RequestCacheOptions
    }
}

// 临时解决方案 用于 plugin 代码提示便邪恶
declare module '../../request-core/types' {
    interface RequestConfig {
        cacheOptions: RequestCacheOptions
    }
}