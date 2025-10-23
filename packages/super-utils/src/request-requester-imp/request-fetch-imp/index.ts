/**
 * Fetch请求实现模块
 * 
 * 提供基于浏览器原生fetch API的HTTP请求实现，遵循Requester接口规范，
 * 负责具体的网络请求发送和响应处理，支持多种数据类型的响应解析
 */

import { RequestConfig, Response, Requester } from "../../request-core"

/**
 * Fetch请求实现类
 * 
 * 使用浏览器原生fetch API实现Requester接口，提供统一的HTTP请求能力，
 * 支持JSON、文本、二进制数据等多种响应格式的自动解析
 */
export class FetchRequester implements Requester {
    /**
     * 发送HTTP请求
     * 
     * 使用浏览器原生fetch API执行HTTP请求，支持多种数据类型的响应解析，
     * 遵循统一的请求配置格式和响应格式
     * 
     * @template T - 响应数据的类型参数，默认为any
     * @param config - 请求配置对象，包含URL、方法、头部、数据、凭据等信息
     * @returns Promise<Response<T>> - 包含响应数据、状态码、头部等信息的Promise对象
     * @throws 当请求失败或HTTP状态码不在成功范围内时抛出错误
     */
    async request<T = any>(config: RequestConfig): Promise<Response<T>> {
        // 解构请求配置，提取URL和凭据配置
        const { url, withCredentials, ...restConfig } = config

        try {
            // 发送fetch请求，设置适当的凭据配置和请求参数
            const res = await fetch(url, {
                ...restConfig,
                body: JSON.stringify(config.data),
                credentials: withCredentials ? 'include' : 'omit',
            })

            // 检查响应状态，非2xx状态码视为错误
            if (!res.ok) {
                throw {
                    message: `请求失败:${res.status}, ${res.statusText}`,
                    status: res.status,
                    config
                }
            }
            
            // 根据Content-Type自动选择合适的响应解析方式
            let data: any
            const contentType = res.headers.get("content-type")

            if (contentType?.includes("application/json")) {
                // JSON格式数据解析
                data = await res.json()
            } else if (contentType?.includes("text/")) {
                // 文本格式数据解析
                data = await res.text()
            } else if (contentType?.includes("application/octet-stream")) {
                // 二进制数据解析
                data = await res.arrayBuffer()
            } else {
                // 默认尝试text解析，避免强制JSON导致的异常
                data = await res.text()
            }

            // 转换Headers对象为普通对象
            const headers: Record<string, string> = {}
            res.headers.forEach((value, key) => {
                headers[key] = value
            })

            // 构建统一格式的响应对象
            return {
                data,
                status: res.status,
                statusText: res.statusText,
                headers,
                config
            }
        } catch (error) {
            // 向上层传递错误
            throw error
        }
    }
    
    /**
     * 构造函数
     * 
     * 创建并初始化FetchRequester实例
     */
    constructor() {
        // 无需特殊初始化，依赖浏览器原生fetch API
    }
}
