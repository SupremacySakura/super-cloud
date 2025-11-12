/**
 * @module 请求核心接口
 * 
 * 本模块定义了HTTP请求库的核心抽象接口，为整个请求系统提供了统一的契约。
 * 通过这个抽象层，请求库可以支持多种底层请求实现，如Axios、Fetch API等，
 * 同时保持上层API的一致性和可扩展性。
 */

import { RequestConfig, Response } from "../types"

/**
 * 请求器接口，定义了HTTP请求的核心抽象
 * 
 * 该接口是请求库的核心抽象，任何底层请求实现（如基于Axios、Fetch等）都必须实现此接口。
 * RequestCore类通过依赖注入方式使用实现此接口的实例来发送实际的HTTP请求，
 * 从而实现了请求逻辑与底层实现的解耦。
 */
export interface Requester {
    /**
     * 发送HTTP请求的核心方法
     * 
     * @async
     * @template T - 响应数据的类型参数，允许指定响应体中data字段的数据类型，默认为any
     * @template C - 请求配置的类型参数，必须扩展自RequestConfig接口，允许为特定请求提供更具体的配置类型
     * @param {C} config - 请求配置对象，包含URL、方法、请求头、请求体等完整的请求信息
     * @returns {Promise<Response<T, C>>} 返回一个Promise，解析为标准化的响应对象，包含数据、状态码、响应头等信息
     * @throws {Error} 当请求失败时抛出错误，可能包含网络错误、超时、服务器错误等多种情况
     */
    request<T = any, C extends RequestConfig = RequestConfig>(config: C): Promise<Response<T, C>>
}
