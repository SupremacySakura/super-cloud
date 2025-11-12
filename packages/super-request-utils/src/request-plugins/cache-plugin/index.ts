/**
 * @module cache-plugin
 * 
 * 本模块提供HTTP请求结果缓存功能，旨在通过缓存请求响应数据提升应用性能和用户体验。
 * 支持全局配置和请求级配置，可自定义缓存键生成逻辑、缓存过期时间、最大缓存条数等参数。
 * 该插件通过拦截请求和响应，实现智能缓存策略，减少不必要的网络请求，特别适用于
 * 频繁访问但不常变化的数据场景。
 * 
 * @example
 * ```typescript
 * // 创建缓存插件实例
 * const cachePlugin = useCachePlugin({
 *   cacheTTL: 5 * 60 * 1000,      // 缓存有效期5分钟
 *   enableCacheCleanUp: true,     // 启用定时清理
 *   maxCacheSize: 100             // 最大缓存100条
 * });
 * 
 * // 在请求中使用缓存
 * const response = await request({
 *   url: '/api/data',
 *   cacheOptions: {
 *     useCache: true,
 *     cacheTTL: 300000           // 此请求单独设置缓存5分钟
 *   }
 * });
 * ```
 */

import { RequestPlugin } from "../../request-core/interfaces"
import { RequestConfig, Response } from "../../request-core/types"
import { CacheOptions, RequestCacheOptions } from "./cache.types"

type ERequestConfig = RequestConfig & { cacheOptions: RequestCacheOptions }

/**
 * 创建缓存插件
 * 
 * 生成一个具有缓存功能的请求插件，可以拦截请求并返回缓存的响应，
 * 或者缓存新的响应结果以提高后续请求的性能。该插件通过实现请求前后的钩子函数，
 * 在请求发送前检查缓存，在响应返回后存储缓存，形成完整的缓存生命周期管理。
 * 
 * @template T - 插件扩展方法的类型参数，用于定义额外提供的功能方法
 * @param options - 全局缓存配置选项，控制缓存的行为和策略
 * @returns 配置好的缓存插件实例，包含清理缓存的额外方法
 * @example
 * ```typescript
 * // 基本用法
 * const basicPlugin = useCachePlugin();
 * 
 * // 自定义缓存键生成
 * const customKeyPlugin = useCachePlugin({
 *   getCacheKey: (config) => {
 *     // 自定义缓存键生成逻辑，例如包含请求头信息
 *     return `${config.url}_${config.headers?.Authorization || ''}`;
 *   }
 * });
 * 
 * // 配置缓存清理和大小限制
 * const managedCachePlugin = useCachePlugin({
 *   cacheTTL: 10 * 60 * 1000,       // 10分钟缓存
 *   enableCacheCleanUp: true,       // 启用自动清理
 *   cleanUpInterval: 5 * 60 * 1000, // 5分钟清理一次
 *   maxCacheSize: 50               // 最多缓存50条
 * });
 * 
 * // 手动清理缓存
 * managedCachePlugin.result.clearCache();
 * ```
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
     * 使用Map数据结构存储缓存的响应数据，提供高效的键值对查询和管理。
     * 每个缓存条目包含响应数据、创建时间戳和过期时间，便于实现缓存过期机制。
     * Map的有序特性还支持实现LRU（最近最少使用）策略的基础。
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
     * 遍历所有缓存条目，检查每个条目的创建时间是否超过TTL（生存时间），
     * 移除所有已过期的缓存条目，释放内存资源。此函数可手动调用或通过定时器自动调用。
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
     * 
     * 存储setInterval返回的计时器ID，用于后续清除定时器，避免内存泄漏。
     * 当启用自动清理功能时，此ID将指向正在运行的清理定时器。
     */
    let cleanupTimer: ReturnType<typeof setInterval> | null = null

    // 启用定时清理（如果配置启用）
    if (enableCacheCleanUp) {
        cleanupTimer = setInterval(cleanupExpiredCache, cleanUpInterval)
    }

    /**
     * 清除所有缓存并重置定时清理
     * 
     * 清空缓存Map并重新设置定时清理计时器，提供完整的缓存重置功能。
     * 此方法在需要强制刷新所有缓存数据时非常有用，例如用户登出或数据权限变更后。
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
         * 在请求发送前检查是否有有效的缓存，如果有则直接返回缓存的响应，
         * 避免重复的网络请求。钩子函数遵循优先级规则：先检查请求级配置，再使用全局配置。
         * 
         * @template T - 响应数据的类型参数，确保返回的缓存数据类型正确
         * @param config - 请求配置对象，包含URL、参数和缓存选项等
         * @returns 缓存的响应数据（如果存在且有效）或原始请求配置（继续正常请求流程）
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
         * 在收到响应后根据配置将响应结果缓存起来，供后续相同请求使用。
         * 此钩子遵循优先级规则：先使用请求级配置，再使用全局配置。
         * 同时支持缓存大小限制，当缓存条目超过最大限制时，移除最老的缓存条目。
         * 
         * @template T - 响应数据的类型参数
         * @param response - 服务器响应对象，包含数据和配置信息
         * @returns 原始响应对象（不做修改，保持响应流程的一致性）
         */
        afterResponse<T>(response: Response<T, ERequestConfig>) {
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
         * 提供额外的功能方法供外部调用，扩展了基础插件接口的能力。
         * 这些方法允许应用在需要时手动管理缓存状态。
         */
        result: {
            /**
             * 清除所有缓存的方法
             * 
             * 提供给外部调用的方法，用于手动清空所有缓存数据。
             * 适用于需要强制刷新所有数据的场景，如用户登出、权限变更等。
             * 
             * @description 调用此方法会：
             * 1. 清空所有缓存数据
             * 2. 重置定时清理计时器
             * 3. 如果启用了自动清理，重新启动清理定时器
             * @example
             * ```typescript
             * // 用户登出时清除所有缓存
             * function handleLogout() {
             *   // 执行登出逻辑
             *   auth.logout();
             *   
             *   // 清除所有缓存数据，确保下次登录看到最新数据
             *   cachePlugin.result.clearCache();
             *   
             *   // 跳转到登录页
             *   navigate('/login');
             * }
             * 
             * // 数据权限变更时清除缓存
             * function handlePermissionChange() {
             *   // 更新权限
             *   updateUserPermissions();
             *   
             *   // 清除缓存，刷新数据
             *   cachePlugin.result.clearCache();
             * }
             * ```
             */
            clearCache
        }
    }
}