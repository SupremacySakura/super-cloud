import { RequestConfig } from "../types/RequestConfig"
import { Response } from "../types/Response"

export interface Requester {
    request<T = any>(config: RequestConfig): Promise<Response<T>>
    get<T = any>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<Response<T>>
    post<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<Response<T>>
    put<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<Response<T>>
    delete<T = any>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<Response<T>>
}