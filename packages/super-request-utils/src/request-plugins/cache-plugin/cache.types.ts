/**
 * 缓存插件类型定义模块
 * 
 * 提供缓存插件所需的所有类型定义，包括请求级缓存配置和全局缓存配置接口
 */

import { RequestConfig } from "../../request-core/types/RequestConfig"

/**
 * 请求级缓存配置接口
 * 
 * 可以为单个请求提供特定的缓存配置，覆盖全局缓存设置
 */
export interface RequestCacheOptions {
    /**
     * 是否开启缓存
     * 
     * 控制单个请求是否使用缓存功能，默认为true（继承全局设置）
     */
    useCache?: boolean
    
    /**
     * 缓存有效时间（毫秒）
     * 
     * 设置缓存的过期时间，默认值为60000毫秒（1分钟）
     */
    cacheTTL?: number
    
    /**
     * 自定义缓存键生成函数
     * 
     * 允许自定义生成缓存键的逻辑，传入请求配置，返回作为缓存键的值
     * @param config 请求配置对象
     * @returns 缓存键值
     */
    getCacheKey?: (config: RequestConfig) => any
}

/**
 * 全局缓存配置接口
 * 
 * 扩展请求级缓存配置，增加全局缓存管理相关设置
 */
export interface CacheOptions extends RequestCacheOptions {
    /**
     * 是否启用定时清理过期缓存
     * 
     * 控制是否定期自动清理过期的缓存条目，默认值为false
     */
    enableCacheCleanUp?: boolean
    
    /**
     * 定时清理间隔（毫秒）
     * 
     * 设置定期清理缓存的时间间隔，默认值为300000毫秒（5分钟）
     * 仅在enableCacheCleanUp为true时生效
     */
    cleanUpInterval?: number
    
    /**
     * 最大缓存条数
     * 
     * 限制缓存的最大条目数量，默认不限制
     * 当缓存条目超过此限制时，会删除最早添加的条目
     */
    maxCacheSize?: number
}

// 临时解决方案：用于plugin代码提示和打包
// 由于rollup打包工具的一些问题，暂时这样使用
declare module '../' {
    /**
     * 扩展请求配置接口，添加缓存选项
     */
    interface RequestConfig {
        /**
         * 请求级缓存选项
         * 
         * 为单个请求提供特定的缓存配置 需要使用cache-plugin之后才会生效
         */
        cacheOptions?: RequestCacheOptions
    }
}

// 临时解决方案：用于plugin代码提示
declare module '../../request-core/types' {
    /**
     * 扩展核心请求配置接口，添加缓存选项
     */
    interface RequestConfig {
        /**
         * 请求级缓存选项
         * 
         * 为单个请求提供特定的缓存配置 需要使用cache-plugin之后才会生效
         */
        cacheOptions: RequestCacheOptions
    }
}