/**
 * 取消请求插件模块
 * 
 * 提供HTTP请求取消功能，支持手动取消特定请求和自动取消重复请求，
 * 基于AbortController API实现，可自定义请求标识和取消行为
 */

import { RequestPlugin } from "../../request-core/interfaces"
import { RequestConfig, Response } from "../../request-core/types"
import { CancelOptions } from "./cancel.types"

/**
 * 创建取消请求插件
 * 
 * 生成一个具有请求取消功能的插件，可以手动取消特定请求，
 * 或配置自动取消重复的请求，优化网络资源使用
 * 
 * @template T - 插件扩展方法的类型参数
 * @param options - 插件配置选项
 * @returns 配置好的取消请求插件实例，包含取消请求的额外方法
 */
export const useCancelPlugin = (options: CancelOptions = {}): RequestPlugin<{ cancel: (key: string) => void }> => {
    // 解析配置参数，设置默认值
    const { autoCancel = false } = options
    
    /**
     * 存储待处理请求的Map
     * 
     * 键为请求标识，值为对应的AbortController实例
     */
    const pendingMap = new Map<string, AbortController>()
    
    /**
     * 默认请求键生成函数
     * 
     * 根据请求的URL和方法生成唯一的请求标识
     * @param config - 请求配置对象
     * @returns 生成的请求键字符串
     */
    const defaultGetKey = (config: RequestConfig) => {
        return `${config.url}&${config.method || 'GET'}`
    }
    
    /**
     * 最终使用的请求键生成函数
     * 
     * 优先使用用户自定义的getKey，否则使用默认实现
     */
    const getKey = options?.getKey || defaultGetKey
    
    // 返回取消请求插件对象
    return {
        name: 'cancel-plugin',
        
        /**
         * 请求前钩子函数
         * 
         * 在请求发送前设置取消控制器和信号，并处理重复请求的取消逻辑
         * @template T - 响应数据的类型参数
         * @param config - 请求配置对象
         * @returns 处理后的请求配置
         */
        beforeRequest<T>(config: RequestConfig) {
            // 如果禁用了取消功能，则直接返回原始配置
            if (!config.cancelOptions?.enableCancel) return config

            // 确定请求的唯一标识键
            const key = config.cancelOptions?.cancelKey || getKey(config)

            // 如果配置了自动取消，且存在相同key的待处理请求，则取消之前的请求
            if (autoCancel && pendingMap.has(key)) {
                pendingMap.get(key)!.abort()
                pendingMap.delete(key)
            }
            
            // 创建新的取消控制器并设置到请求配置中
            const controller = new AbortController()
            config.cancelOptions._cancelController = controller
            config.signal = controller.signal
            pendingMap.set(key, controller)
            
            return config
        },
        
        /**
         * 响应后钩子函数
         * 
         * 请求完成后从待处理请求Map中移除对应的请求记录
         * @param response - 服务器响应对象
         * @returns 原始响应对象（不做修改）
         */
        afterResponse(response: Response) {
            const key = getKey(response.config)
            pendingMap.delete(key)
            return response
        },
        
        /**
         * 错误处理钩子函数
         * 
         * 请求出错时从待处理请求Map中移除对应的请求记录
         * @param error - 请求错误对象
         * @returns 原始错误对象（不做修改）
         */
        onError(error: any) {
            const key = getKey(error.config)
            pendingMap.delete(key)
            return error
        },
        
        /**
         * 插件扩展方法
         * 
         * 提供额外的功能方法供外部调用
         */
        result: {
            /**
             * 手动取消指定key的请求
             * 
             * 根据提供的key查找并取消对应的待处理请求
             * @param key - 要取消的请求的标识键
             */
            cancel: (key) => {
                if (pendingMap.has(key)) {
                    pendingMap.get(key)!.abort()
                    pendingMap.delete(key)
                }
            }
        }
    }
}