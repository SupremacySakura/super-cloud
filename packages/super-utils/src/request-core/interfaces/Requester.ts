import { RequestConfig, Response } from "../types"

/**
 * 核心抽象接口(由 request-core 定义,下层实现必须遵守)
 */
export interface Requester {
    // 请求方法实现
    request<T = any>(config: RequestConfig): Promise<Response<T>>
    get<T = any>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<Response<T>>
    post<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<Response<T>>
    put<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<Response<T>>
    delete<T = any>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<Response<T>>
}
