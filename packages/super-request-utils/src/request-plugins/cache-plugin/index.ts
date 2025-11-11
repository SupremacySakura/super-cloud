/**
 * 缓存插件模块
 * 
 * 提供HTTP请求结果缓存功能，支持全局配置和请求级配置，
 * 可自定义缓存键生成逻辑、缓存过期时间、最大缓存条数等
 */

import { RequestPlugin } from "../../request-core/interfaces"
import { RequestConfig, Response } from "../../request-core/types"
import { CacheOptions, RequestCacheOptions } from "./cache.types"

type ERequestConfig = RequestConfig & { cacheOptions: RequestCacheOptions }

/**
 * 创建缓存插件
 * 
 * 生成一个具有缓存功能的请求插件，可以拦截请求并返回缓存的响应，
 * 或者缓存新的响应结果以提高后续请求的性能
 * 
 * @template T - 插件扩展方法的类型参数
 * @param options - 全局缓存配置选项
 * @returns 配置好的缓存插件实例，包含清理缓存的额外方法
 */
export const useCachePlugin = (options: CacheOptions = {}): RequestPlugin<ERequestConfig, { clearCache: () => void }> => {
    // 解析配置参数，设置默认值
    const {
        cacheTTL = 60 * 1000,               // 默认缓存有效期1分钟
        getCacheKey,                        // 自定义缓存键生成函数
        useCache: globalUseCache = true,    // 全局是否启用缓存
        enableCacheCleanUp = false,         // 是否启用定时清理
        cleanUpInterval = 5 * 60 * 1000,    // 默认清理间隔5分钟
        maxCacheSize,                       // 最大缓存条目数
    } = options

    /**
     * 缓存数据存储
     * 
     * 使用Map存储缓存的响应数据，键为缓存键，值包含响应数据、时间戳和TTL
     */
    const cacheMap = new Map<string, { data: Response<any>, timestamp: number, cacheTTL: number }>()

    /**
     * 默认缓存键生成函数
     * 
     * 根据请求的URL、查询参数和请求体生成唯一的缓存键
     * @param config - 请求配置对象
     * @returns 生成的缓存键字符串
     */
    const defaultGetCacheKey = (config: RequestConfig): string => {
        const url = config.url || ''
        const params = config.params ? JSON.stringify(config.params) : ''
        const data = config.data ? JSON.stringify(config.data) : ''
        return `${url}?${params}&${data}`
    }

    /**
     * 清理过期缓存函数
     * 
     * 遍历所有缓存条目，移除已过期的缓存
     */
    const cleanupExpiredCache = () => {
        const now = Date.now()
        cacheMap.forEach(({ timestamp, cacheTTL }, key) => {
            if (now - timestamp > cacheTTL) {
                cacheMap.delete(key)
            }
        })
    }

    /**
     * 定时清理计时器ID
     */
    let cleanupTimer: ReturnType<typeof setInterval> | null = null

    // 启用定时清理（如果配置启用）
    if (enableCacheCleanUp) {
        cleanupTimer = setInterval(cleanupExpiredCache, cleanUpInterval)
    }

    /**
     * 清除所有缓存并重置定时清理
     * 
     * 清空缓存Map并重新设置定时清理计时器
     */
    const clearCache = () => {
        cacheMap.clear()
        if (cleanupTimer) {
            clearInterval(cleanupTimer)
            cleanupTimer = null
        }
        if (enableCacheCleanUp && !cleanupTimer) {
            cleanupTimer = setInterval(cleanupExpiredCache, cleanUpInterval)
        }
    }

    // 返回缓存插件对象
    return {
        name: Symbol('cache-plugin'),

        /**
         * 请求前钩子函数
         * 
         * 在请求发送前检查是否有有效的缓存，如果有则直接返回缓存的响应
         * @template T - 响应数据的类型参数
         * @param config - 请求配置对象
         * @returns 缓存的响应数据或原始请求配置
         */
        beforeRequest<T>(config: ERequestConfig) {
            // 确定是否使用缓存（优先使用请求级配置，否则使用全局配置）
            const useCache = typeof config.cacheOptions?.useCache !== 'undefined' ? config.cacheOptions?.useCache : globalUseCache

            // 确定缓存键生成函数的优先级顺序
            const resultGetCacheKey = config.cacheOptions?.getCacheKey ?? getCacheKey ?? defaultGetCacheKey

            if (useCache) {
                const key = resultGetCacheKey(config)
                const cached = cacheMap.get(key);
                // 检查缓存是否存在且未过期
                if (cached && Date.now() - cached.timestamp < cached.cacheTTL) {
                    return cached.data as Response<T, ERequestConfig>
                }
            }
            // 没有有效缓存，返回原始配置继续请求
            return config
        },

        /**
         * 响应后钩子函数
         * 
         * 在收到响应后根据配置将响应结果缓存起来
         * @param response - 服务器响应对象
         * @returns 原始响应对象（不做修改）
         */
        afterResponse(response: Response<any, ERequestConfig>) {
            // 确定是否使用缓存（优先使用请求级配置，否则使用全局配置）
            const useCache = typeof response.config.cacheOptions?.useCache !== 'undefined' ? response.config.cacheOptions?.useCache : globalUseCache

            // 确定缓存键生成函数的优先级顺序
            const resultGetCacheKey = response.config.cacheOptions?.getCacheKey ?? getCacheKey ?? defaultGetCacheKey

            // 确定缓存TTL（优先使用请求级配置，否则使用全局配置）
            const resultCacheTTL = response.config.cacheOptions?.cacheTTL ?? cacheTTL

            if (useCache) {
                const key = resultGetCacheKey(response.config)
                // 存储缓存数据，包含响应、时间戳和TTL
                cacheMap.set(key, { data: response, timestamp: Date.now(), cacheTTL: resultCacheTTL })

                // 检查是否需要限制缓存大小
                if (maxCacheSize && cacheMap.size > maxCacheSize) {
                    const oldestKey = cacheMap.keys().next().value
                    if (typeof oldestKey === 'string') {
                        cacheMap.delete(oldestKey)
                    }
                }
            }
            // 返回原始响应
            return response
        },

        /**
         * 插件扩展方法
         * 
         * 提供额外的功能方法供外部调用
         */
        result: {
            /**
             * 清除所有缓存的方法
             */
            clearCache
        }
    }
}