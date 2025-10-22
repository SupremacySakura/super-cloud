import { RequestConfig, RequestError, Response } from "../types"

/**
 * 插件类型
 */
export interface RequestPlugin<K = any> {
    name: string  // 名称
    beforeRequest?: <T>(config: RequestConfig) => Promise<RequestConfig> | RequestConfig | Promise<Response<T>> | Response<T>  // 请求钩子
    afterResponse?: <T>(response: Response) => Promise<Response<T>> | Response<T>  // 响应钩子
    onError?: (error: RequestError) => Promise<any> | any  // 错误处理钩子
    result?: K  // 自定义返回值
}