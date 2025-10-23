import { RequestConfig, Response } from "../types"

/**
 * 请求器接口，定义了HTTP请求的核心抽象
 * 
 * 该接口是请求库的核心抽象，任何底层请求实现（如基于Axios、Fetch等）都必须实现此接口。
 * RequestCore类通过依赖注入方式使用实现此接口的实例来发送实际的HTTP请求。
 */
export interface Requester {
    /**
     * 发送HTTP请求的核心方法
     * 
     * @async
     * @template T - 响应数据的类型参数，允许指定响应体中data字段的数据类型
     * @param {RequestConfig} config - 请求配置对象，包含URL、方法、请求头等信息
     * @returns {Promise<Response<T>>} 返回一个Promise，解析为标准化的响应对象
     * @throws {Error} 当请求失败时抛出错误
     */
    request<T = any>(config: RequestConfig): Promise<Response<T>>
}
