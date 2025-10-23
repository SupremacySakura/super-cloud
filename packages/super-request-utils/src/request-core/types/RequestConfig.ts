import { GlobalCacheOptions, RequestCacheOptions } from "../../request-plugins/cache-plugin/cache.types"

/**
 * HTTP请求方法类型
 * 
 * 定义了支持的HTTP请求方法，包括常见的RESTful API方法
 */
export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD'

/**
 * HTTP请求配置接口
 * 
 * 定义了发起HTTP请求所需的完整配置选项，包括URL、方法、请求头、参数等
 */
export interface RequestConfig {
    /**
     * 请求URL地址
     * 
     * 会与baseUrl拼接
     */
    url: string
    
    /**
     * HTTP请求方法
     * 
     * 默认为GET方法
     */
    method?: RequestMethod
    
    /**
     * 请求头信息
     * 
     * 用于设置HTTP请求的头部字段，如Content-Type、Authorization等
     */
    headers?: Record<string, string>
    
    /**
     * URL查询参数
     * 
     * 会被自动序列化并附加到URL后面
     */
    params?: Record<string, any>
    
    /**
     * 请求体数据
     * 
     * 适用于POST、PUT等需要提交数据的请求方法
     */
    data?: any
    
    /**
     * 请求超时时间（毫秒）
     * 
     * 当设置大于0的值时，请求会在指定时间后自动超时并终止
     */
    timeout?: number
    
    /**
     * 是否允许携带Cookie信息
     * 
     * 对于跨域请求尤为重要，控制是否发送Cookie和认证信息
     */
    withCredentials?: boolean
    
    /**
     * 基础URL地址
     * 
     * 用于覆盖全局配置中的baseUrl，适用于特殊请求场景
     */
    baseUrl?: string
    
    /**
     * 请求取消信号
     * 
     * 用于实现请求取消功能，通过AbortController生成
     */
    signal?: AbortSignal
}
