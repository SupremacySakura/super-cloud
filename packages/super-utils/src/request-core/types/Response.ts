import { RequestConfig } from "./RequestConfig"

export interface Response<T = any> {
    data: T
    status: number
    statusText: string
    headers: Record<string, string>
    config: RequestConfig
}