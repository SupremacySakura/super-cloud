import { RequestConfig, Response } from "../types"

/**
 * 核心抽象接口(由 request-core 定义,下层实现必须遵守)
 */
export interface Requester {
    // 请求方法实现
    request<T = any>(config: RequestConfig): Promise<Response<T>>
}
