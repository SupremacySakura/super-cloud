import { RequestConfig } from "./RequestConfig"

/**
 * HTTP响应接口
 * 
 * 该接口定义了请求库中统一的HTTP响应格式，封装了服务器返回的数据、状态码、响应头等信息，
 * 同时保留了原始请求配置以便调试和后续处理。支持泛型参数以提供类型安全的响应数据访问。
 * 
 * @template T - 响应数据的类型参数，默认为any，表示服务器返回的数据结构
 */
export interface Response<T = any> {
    /**
     * 响应数据
     * 
     * 服务器返回的主要数据内容，其类型由泛型参数T指定
     */
    data: T
    
    /**
     * HTTP状态码
     * 
     * 表示请求的处理结果状态码，如200表示成功，4xx表示客户端错误，5xx表示服务器错误
     */
    status: number
    
    /**
     * HTTP状态文本
     * 
     * 与状态码对应的描述文本，如"OK"、"Not Found"、"Internal Server Error"等
     */
    statusText: string
    
    /**
     * 响应头信息
     * 
     * 服务器返回的HTTP响应头，包含内容类型、缓存控制、认证信息等元数据
     */
    headers: Record<string, string>
    
    /**
     * 原始请求配置
     * 
     * 生成此响应的原始请求配置对象，包含URL、方法、请求头等完整信息，便于调试和请求重试
     */
    config: RequestConfig
}