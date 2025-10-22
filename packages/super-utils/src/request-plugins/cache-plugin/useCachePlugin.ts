import { RequestPlugin } from "../../request-core/interfaces"
import { RequestConfig, Response } from "../../request-core/types"
import { GlobalCacheOptions } from "./CacheOptions"

/**
 * 创建缓存插件
 * @param options 缓存配置
 * @returns 缓存插件
 */
export const useCachePlugin = (options: GlobalCacheOptions): RequestPlugin<() => void> => {
    const {
        cacheTTL = 60 * 1000,
        getCacheKey,
        useCache: globalUseCache = true,
        enableCacheCleanUp = false,
        cleanUpInterval = 5 * 60 * 1000,
        maxCacheSize,
    } = options

    const cacheMap = new Map<string, { data: Response<any>, timestamp: number, cacheTTL: number }>()
    // 默认缓存键生成逻辑（保持不变）
    const defaultGetCacheKey = (config: RequestConfig): string => {
        const url = config.url || ''
        const params = config.params ? JSON.stringify(config.params) : ''
        const data = config.data ? JSON.stringify(config.data) : ''
        return `${url}?${params}&${data}`
    }
    // 清理过期缓存函数（保持不变）
    const cleanupExpiredCache = () => {
        const now = Date.now()
        cacheMap.forEach(({ timestamp, cacheTTL }, key) => {
            if (now - timestamp > cacheTTL) {
                cacheMap.delete(key)
            }
        })
    }

    // 启用定时清理（保持不变）
    let cleanupTimer: number | null = null
    if (enableCacheCleanUp) {
        cleanupTimer = setInterval(cleanupExpiredCache, cleanUpInterval)
    }

    // 一键清除缓存函数（保持不变）
    const clearCache = () => {
        cacheMap.clear()
        if (cleanupTimer !== null) {
            clearInterval(cleanupTimer)
            cleanupTimer = null
        }
        if (enableCacheCleanUp) {
            cleanupTimer = setInterval(cleanupExpiredCache, cleanUpInterval)
        }
    }
    return {
        name: 'cache-plugin',
        beforeRequest<T>(config: RequestConfig) {
            const useCache = typeof config.cacheOptions?.useCache !== 'undefined' ? config.cacheOptions?.useCache : globalUseCache
            const resultGetCacheKey = config.cacheOptions?.getCacheKey ?? getCacheKey ?? defaultGetCacheKey
            if (useCache) {
                const key = resultGetCacheKey(config)
                const cached = cacheMap.get(key);
                if (cached && Date.now() - cached.timestamp < cached.cacheTTL) {
                    return cached.data as Response<T>
                }
            }
            return config
        },
        afterResponse(response: Response) {
            const useCache = typeof response.config.cacheOptions?.useCache !== 'undefined' ? response.config.cacheOptions?.useCache : globalUseCache
            const resultGetCacheKey = response.config.cacheOptions?.getCacheKey ?? getCacheKey ?? defaultGetCacheKey
            const resultCacheTTL = response.config.cacheOptions?.cacheTTL ?? cacheTTL
            if (useCache) {
                const key = resultGetCacheKey(response.config)
                cacheMap.set(key, { data: response, timestamp: Date.now(), cacheTTL: resultCacheTTL })
                if (maxCacheSize && cacheMap.size > maxCacheSize) {
                    const oldestKey = cacheMap.keys().next().value
                    if (typeof oldestKey === 'string') {
                        cacheMap.delete(oldestKey)
                    }
                }
            }
            return response
        },
        result: clearCache
    }
}