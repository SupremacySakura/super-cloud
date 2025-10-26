/**
 * 幂等性插件类型定义模块
 * 
 * 提供幂等性插件所需的所有类型定义，包括插件配置和请求级幂等配置接口
 */

/**
 * 幂等性插件全局配置接口
 * 
 * 用于配置幂等性插件的全局行为和默认值
 */
export interface IdempotencyOptions {
    /**
     * 挂载的请求头名
     * 
     * 指定携带幂等键的HTTP请求头名称，默认值为'Idempotency-Key'
     */
    headerName?: string
    
    /**
     * 幂等键生成函数
     * 
     * 用于生成唯一的幂等键值的函数，默认为使用crypto.randomUUID()
     * @returns 生成的唯一幂等键字符串
     */
    generateKey?: () => string
    
    /**
     * 是否启用前端级别请求去重
     * 
     * 当设置为true时，相同幂等键的请求将被合并，避免重复发送
     * 默认值为false
     */
    dedupe?: boolean
    
    /**
     * 幂等键有效时间（毫秒）
     * 
     * 指定幂等键的有效期，在有效期内的重复请求将被合并
     * 默认值为5000毫秒（5秒）
     */
    expire?: number
}

/**
 * 请求级幂等配置接口
 * 
 * 可以为单个请求提供特定的幂等配置
 */
export interface RequestIdempotencyOptions {
    /**
     * 是否开启幂等
     * 
     * 控制单个请求是否启用幂等性功能
     */
    idempotent?: boolean
    
    /**
     * 自定义幂等键值
     * 
     * 如果提供，将优先使用此值作为幂等键，而不是通过generateKey函数生成
     */
    idempotentKey?: string
}

// 临时解决方案：用于plugin代码提示和打包
// 由于rollup打包工具的一些问题，暂时这样使用
declare module '../' {
    /**
     * 扩展请求配置接口，添加幂等选项
     */
    interface RequestConfig {
        /**
         * 请求级幂等配置选项
         * 
         * 为单个请求提供特定的幂等配置 需要使用idempotency-plugin之后才会生效
         */
        idempotencyOptions?: RequestIdempotencyOptions
    }
}

// 临时解决方案：用于plugin代码提示
declare module '../../request-core/types' {
    /**
     * 扩展核心请求配置接口，添加幂等选项
     */
    interface RequestConfig {
        /**
         * 请求级幂等配置选项
         * 
         * 为单个请求提供特定的幂等配置 需要使用idempotency-plugin之后才会生效
         */
        idempotencyOptions?: RequestIdempotencyOptions
    }
}