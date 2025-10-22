import { RequestConfig } from "./RequestConfig"
import { Response } from "./Response"

export interface RequestError {
    error: unknown,
    config: RequestConfig
    response?: Response  // 如果有response则会直接中断错误处理直接resolve
}