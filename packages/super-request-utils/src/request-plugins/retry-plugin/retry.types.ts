/**
 * 重试插件类型定义模块
 * 
 * 提供重试插件所需的所有类型定义，包括重试配置和请求级重试配置接口
 */

/**
 * 重试配置接口
 * 
 * 用于配置请求重试的行为，包括最大重试次数、重试条件和延迟计算
 */
export interface RetryOptions {
    /**
     * 最大重试次数
     * 
     * 指定请求失败后最多重试的次数，默认值为3
     */
    maxRetries?: number
    
    /**
     * 重试条件函数
     * 
     * 决定在什么情况下应该重试请求，可以是同步函数或异步函数
     * @param error - 请求错误对象
     * @returns 是否应该重试的布尔值或Promise<boolean>
     */
    retryCondition?: (error: any) => boolean | Promise<boolean>
    
    /**
     * 获取延迟时间的函数
     * 
     * 根据当前重试次数计算下一次重试前应等待的毫秒数
     * @param retryCount - 当前重试次数
     * @returns 延迟毫秒数
     */
    getDelay?: (retryCount: number) => number
}

/**
 * 包含重试计数的重试配置类型
 * 
 * 扩展RetryOptions接口，添加内部使用的重试计数属性
 */
export type RetryOptionsWithCount = RetryOptions & { 
    /**
     * 内部使用的重试计数
     * 
     * 记录当前已执行的重试次数，由插件内部维护
     */
    __retryCount?: number 
}

// 临时解决方案：用于plugin代码提示和打包
// 由于rollup打包工具的一些问题，暂时这样使用
declare module '../' {
    /**
     * 扩展请求配置接口，添加重试选项
     */
    interface RequestConfig {
        /**
         * 请求级重试配置选项
         * 
         * 为单个请求提供特定的重试配置
         */
        retryOptions?: RetryOptionsWithCount
    }
}

// 临时解决方案：用于plugin代码提示
declare module '../../request-core/types' {
    /**
     * 扩展核心请求配置接口，添加重试选项
     */
    interface RequestConfig {
        /**
         * 请求级重试配置选项
         * 
         * 为单个请求提供特定的重试配置
         */
        retryOptions?: RetryOptionsWithCount
    }
}