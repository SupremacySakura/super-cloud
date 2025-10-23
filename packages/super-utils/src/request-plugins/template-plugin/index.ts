/**
 * 模板插件模块
 * 
 * 提供请求插件的基础模板实现，可作为开发新插件的起点。
 * 此插件不做特殊处理，仅演示了插件的基本结构和生命周期钩子。
 */

import { RequestPlugin } from "../../request-core/interfaces"
import { RequestConfig, Response } from "../../request-core/types"

/**
 * 创建模板插件
 * 
 * 生成一个基础的模板插件实例，该插件实现了所有必要的请求生命周期钩子，
 * 但不修改请求或响应，适合作为开发自定义插件的起点。
 * 
 * @template T - 插件扩展方法的类型参数，此处为undefined
 * @returns 基础模板插件实例，无额外方法扩展
 */
export const useTemplatePlugin = (): RequestPlugin<undefined> => {
    return {
        /**
         * 插件名称
         * 
         * 标识当前插件的唯一名称，用于调试和日志记录
         */
        name: 'template-plugin',
        
        /**
         * 请求前钩子函数
         * 
         * 在请求发送前调用，可以修改请求配置
         * 
         * @template T - 响应数据的类型参数
         * @param config - 请求配置对象，包含URL、方法、头部等信息
         * @returns 修改后的请求配置对象或原始配置
         */
        beforeRequest<T>(config: RequestConfig) {
            // 此处可以修改请求配置，例如添加请求头、修改URL等
            return config
        },
        
        /**
         * 响应后钩子函数
         * 
         * 在请求成功响应后调用，可以处理响应数据
         * 
         * @param response - 服务器响应对象，包含状态码、头部和响应数据
         * @returns 修改后的响应对象或原始响应
         */
        afterResponse(response: Response) {
            // 此处可以处理响应数据，例如转换格式、提取信息等
            return response
        },
        
        /**
         * 错误处理钩子函数
         * 
         * 在请求失败时调用，可以处理错误或进行重试
         * 
         * @param error - 请求错误对象，包含错误信息和请求配置
         * @returns 修改后的错误对象、新的响应对象或原始错误
         */
        onError(error: any) {
            // 此处可以处理请求错误，例如添加错误日志、转换错误格式等
            return error
        },
        
        /**
         * 插件扩展方法
         * 
         * 用于向请求实例提供额外的方法，此模板插件不提供扩展方法
         */
        result: void 0
    }
}