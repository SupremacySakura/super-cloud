/**
 * @module HTTP响应类型定义
 * 
 * 本模块定义了请求库中的统一HTTP响应格式，为整个请求系统提供了标准化的响应数据结构。
 * 通过封装服务器返回的数据、状态信息和元数据，确保了响应处理的一致性和类型安全，
 * 同时为调试和请求跟踪提供了完整的上下文信息。
 */

import { RequestConfig } from "./RequestConfig"

/**
 * HTTP响应接口
 * 
 * 该接口定义了请求库中统一的HTTP响应格式，封装了服务器返回的数据、状态码、响应头等信息，
 * 同时保留了原始请求配置以便调试和后续处理。支持泛型参数以提供类型安全的响应数据访问，
 * 使开发者能够在编译时捕获类型错误，并获得更好的IDE代码提示。
 * 
 * @template T - 响应数据的类型参数，默认为any，表示服务器返回的数据结构。
 * 开发者可以通过指定具体的类型来获得类型安全的数据访问。
 * @template C - 请求配置类型，必须继承自RequestConfig，支持特定插件的自定义配置项。
 * 保留原始配置便于请求重试、调试和请求-响应匹配。
 */
export interface Response<T = any, C extends RequestConfig = RequestConfig> {
    /**
     * 响应数据
     * 
     * 服务器返回的主要数据内容，其类型由泛型参数T指定。这是开发者最常访问的属性，
     * 包含了API调用的核心业务数据。通过泛型参数，可以在编译时确保类型安全。
     */
    data: T

    /**
     * HTTP状态码
     * 
     * 表示请求的处理结果状态码，遵循HTTP标准规范。常见状态码包括：
     * - 2xx系列：表示请求成功（如200 OK, 201 Created）
     * - 4xx系列：表示客户端错误（如400 Bad Request, 401 Unauthorized, 404 Not Found）
     * - 5xx系列：表示服务器错误（如500 Internal Server Error, 503 Service Unavailable）
     */
    status: number

    /**
     * HTTP状态文本
     * 
     * 与状态码对应的人类可读的描述文本，如"OK"、"Not Found"、"Internal Server Error"等。
     * 这些文本通常由服务器根据HTTP规范提供，提供了状态码的可读解释。
     */
    statusText: string

    /**
     * 响应头信息
     * 
     * 服务器返回的HTTP响应头，包含了关于响应的元数据，如内容类型、缓存控制、认证信息、
     * 跨域设置等。这些信息对于实现缓存策略、认证管理和响应处理非常重要。
     */
    headers: Record<string, string>

    /**
     * 原始请求配置
     * 
     * 生成此响应的原始请求配置对象，包含URL、方法、请求头、请求体、超时设置等完整信息。
     * 保留此配置对于实现请求重试、错误诊断、请求-响应关联分析等功能至关重要。
     */
    config: C
}