/**
 * @module cancel-plugin
 * 
 * 取消请求插件模块
 * 
 * 提供HTTP请求取消功能，支持手动取消特定请求和自动取消重复请求，
 * 基于AbortController API实现，可自定义请求标识和取消行为
 * 
 * @description 该模块通过拦截请求生命周期中的关键点，
 * 实现对请求的精准控制，防止不必要的网络请求和响应处理，
 * 提升应用性能和用户体验
 * 
 * @example
 * ```typescript
 * // 创建支持取消请求的插件实例
 * const cancelPlugin = useCancelPlugin({
 *   autoCancel: true, // 自动取消重复请求
 *   getKey: (config) => `${config.url}-${config.method}` // 自定义请求标识生成
 * });
 * ```
 */

import { RequestPlugin } from "../../request-core/interfaces"
import { RequestConfig, RequestError, Response } from "../../request-core/types"
import { CancelOptions, RequestCancelOptions } from "./cancel.types"

/**
 * 扩展的请求配置类型
 * 
 * @type {RequestConfig & { cancelOptions: RequestCancelOptions }}
 * @description 在基础请求配置上添加了取消相关的选项
 * @property {RequestCancelOptions} cancelOptions - 控制请求取消行为的配置项
 */
type ERequestConfig = RequestConfig & { cancelOptions: RequestCancelOptions }

/**
 * 创建取消请求插件
 * 
 * 生成一个具有请求取消功能的插件，可以手动取消特定请求，
 * 或配置自动取消重复的请求，优化网络资源使用
 * 
 * @description 该函数创建的插件通过请求生命周期钩子实现请求的精确控制，
 * 支持灵活配置以满足不同场景下的请求管理需求
 * 
 * @template T - 插件扩展方法的类型参数，用于定义额外提供的功能方法
 * @param {CancelOptions} options - 插件配置选项，控制取消行为和请求标识策略
 * @returns {RequestPlugin<ERequestConfig, { cancel: (key: string) => void }>} 配置好的取消请求插件实例
 * @example
 * ```typescript
 * // 基本用法
 * const plugin = useCancelPlugin();
 * 
 * // 自定义配置
 * const customPlugin = useCancelPlugin({
 *   autoCancel: true,
 *   getKey: (config) => config.url + '&' + config.method + '&' + JSON.stringify(config.params)
 * });
 * ```
 */
export const useCancelPlugin = (options: CancelOptions = {}): RequestPlugin<ERequestConfig, { cancel: (key: string) => void }> => {
    // 解析配置参数，设置默认值
    const { autoCancel = false } = options

    /**
     * 存储待处理请求的Map集合
     * 
     * @type {Map<string, AbortController>}
     * @description 用于跟踪和管理所有活跃的请求及其对应的取消控制器，
     * 支持快速查找、取消和清理特定请求
     */
    const pendingMap = new Map<string, AbortController>()

    /**
     * 默认请求键生成函数
     * 
     * 根据请求的URL和方法生成唯一的请求标识，用于区分不同的请求
     * 
     * @param {RequestConfig} config - 请求配置对象，包含URL、方法等信息
     * @returns {string} 生成的请求键字符串，格式为"URL&method"
     * @description 当用户未提供自定义的getKey函数时使用此默认实现
     */
    const defaultGetKey = (config: RequestConfig) => {
        return `${config.url}&${config.method || 'GET'}`
    }

    /**
     * 最终使用的请求键生成函数
     * 
     * @type {(config: RequestConfig) => string}
     * @description 优先使用用户自定义的getKey函数，
     * 如未提供则回退到defaultGetKey的默认实现
     */
    const getKey = options?.getKey || defaultGetKey

    // 返回取消请求插件对象
    return {
        /**
         * 插件唯一标识符
         * 
         * @type {Symbol}
         * @description 使用Symbol确保插件名称的唯一性，避免命名冲突
         */
        name: Symbol('cancel-plugin'),

        /**
         * 请求前钩子函数
         * 
         * 在请求发送前设置取消控制器和信号，并处理重复请求的取消逻辑
         * 
         * @param {ERequestConfig} config - 请求配置对象，包含可能的取消选项
         * @returns {ERequestConfig} 处理后的请求配置，添加了取消控制相关的属性
         * @description 此钩子函数会：
         * 1. 检查是否启用了取消功能
         * 2. 生成或使用指定的请求标识
         * 3. 处理自动取消重复请求的逻辑
         * 4. 创建并配置AbortController
         */
        beforeRequest(config: ERequestConfig) {
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
         * 请求完成后从待处理请求Map中移除对应的请求记录，清理资源
         * 
         * @template T - 响应数据的类型参数
         * @param {Response<T, ERequestConfig>} response - 服务器响应对象
         * @returns {Response<T, ERequestConfig>} 原始响应对象（不做修改）
         * @description 确保请求完成后及时释放资源，防止内存泄漏
         */
        afterResponse<T>(response: Response<T, ERequestConfig>) {
            const key = getKey(response.config)
            pendingMap.delete(key)
            return response
        },

        /**
         * 错误处理钩子函数
         * 
         * 请求出错时从待处理请求Map中移除对应的请求记录，清理资源
         * 
         * @template T - 响应数据的类型参数
         * @param {RequestError<T, ERequestConfig>} error - 请求错误对象
         * @returns {RequestError<T, ERequestConfig>} 原始错误对象（不做修改）
         * @description 确保即使请求失败也能正确清理资源，维持pendingMap的准确性
         */
        onError<T>(error: RequestError<T, ERequestConfig>) {
            const key = getKey(error.config)
            pendingMap.delete(key)
            return error
        },

        /**
         * 插件扩展方法对象
         * 
         * @description 提供额外的功能方法供外部调用，实现对插件功能的程序化控制
         * @property {Object} result - 包含插件提供的扩展方法集合
         */
        result: {
            /**
             * 手动取消指定key的请求
             * 
             * 根据提供的key查找并取消对应的待处理请求，支持程序化控制请求取消
             * 
             * @param {string} key - 要取消的请求的标识键
             * @description 此方法允许在任何需要的时刻显式取消特定请求，
             * 适用于组件卸载、状态变更等场景下的请求管理
             * @example
             * ```typescript
             * // 取消特定请求
             * cancelPlugin.result.cancel('api/users&GET');
             * ```
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