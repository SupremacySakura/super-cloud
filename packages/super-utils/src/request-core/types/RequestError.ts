import { RequestConfig } from "./RequestConfig"
import { Response } from "./Response"

/**
 * 请求错误接口
 * 
 * 该接口定义了请求库中的统一错误格式，封装了原始错误对象、请求配置和可能的响应信息，
 * 便于插件系统和应用代码进行错误处理和恢复操作。
 */
export interface RequestError {
    /**
     * 原始错误对象
     * 
     * 捕获的具体错误，可以是任意类型，包括网络错误、服务器错误、自定义错误等
     */
    error: unknown,
    
    /**
     * 请求配置对象
     * 
     * 包含触发错误的请求的完整配置信息，用于错误分析和重试逻辑
     */
    config: RequestConfig
    
    /**
     * 服务器响应对象（可选）
     * 
     * 如果请求已发送并收到服务器响应（即使状态码表示错误），则包含此属性。
     * 在错误处理插件中，如果设置了该属性，将直接中断错误处理流程并视为成功响应返回
     */
    response?: Response
}