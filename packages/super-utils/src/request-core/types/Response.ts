import { RequestConfig } from "./RequestConfig"

/**
 * 基础响应配置
 */
export interface Response<T = any> {
    data: T
    status: number
    statusText: string
    headers: Record<string, string>
    config: RequestConfig
}