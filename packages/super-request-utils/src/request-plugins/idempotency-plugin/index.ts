/**
 * 幂等性插件模块
 * 
 * 提供HTTP请求幂等性保障功能，通过添加唯一的幂等键到请求头，
 * 确保重复发送的请求不会导致重复的操作结果，同时支持前端请求去重
 */

import { RequestPlugin } from "../../request-core/interfaces"
import { RequestConfig, RequestError, Response } from "../../request-core/types"
import { IdempotencyOptions, RequestIdempotencyOptions } from "./idempotency.types"

type ERequestConfig = RequestConfig & { idempotencyOptions?: RequestIdempotencyOptions }

/**
 * 创建幂等性插件
 * 
 * 生成一个具有幂等性保障功能的请求插件，可以为请求添加唯一标识符，
 * 防止重复提交造成的数据一致性问题，特别适用于支付、订单等关键操作
 * 
 * @template T - 插件扩展方法的类型参数，此处为undefined
 * @param options - 幂等性插件配置选项
 * @returns 配置好的幂等性插件实例，无额外方法扩展
 */
export const useIdempotencyPlugin = (options: IdempotencyOptions = {}): RequestPlugin<ERequestConfig, undefined> => {
    // 解析配置参数，设置默认值
    const {
        headerName = 'Idempotency-Key',   // 默认请求头名称
        generateKey = () => crypto.randomUUID(), // 默认幂等键生成函数
        dedupe = false,                   // 默认不启用前端去重
        expire = 5 * 1000                 // 默认幂等键有效期5秒
    } = options

    /**
     * 存储正在处理中的幂等请求Map
     * 
     * 键为幂等键，值为包含Promise和时间戳的对象
     */
    const pendingMap = new Map<string, { promise: Promise<Response>, timestamp: number }>()

    /**
     * 获取幂等键函数
     * 
     * 优先使用请求配置中提供的幂等键，否则通过生成函数创建
     * @param config - 请求配置对象
     * @returns 幂等键字符串
     */
    const getIdempotentKey = (config: ERequestConfig) => {
        if (config.idempotencyOptions?.idempotentKey) {
            return config.idempotencyOptions.idempotentKey
        }
        return generateKey()
    }

    // 返回幂等性插件对象
    return {
        name: Symbol('idempotency-plugin'),

        /**
         * 请求前钩子函数
         * 
         * 在请求发送前检查是否需要添加幂等键，并处理前端去重逻辑
         * @template T - 响应数据的类型参数
         * @param config - 请求配置对象
         * @returns 处理后的请求配置或已存在的Promise（前端去重时）
         */
        beforeRequest<T>(config: ERequestConfig) {
            // 如果未开启幂等请求，则不处理
            if (!config.idempotencyOptions?.idempotent) {
                return config
            }

            // 如果请求方法不属于修改类方法（POST、PUT、PATCH、DELETE），则不处理
            if (!config.method || !['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method.toUpperCase())) {
                return config
            }

            // 生成给后端请求的幂等键，并设置到请求头
            const key = getIdempotentKey(config)
            config.headers = {
                ...(config.headers || {}),
                [headerName]: key
            }

            // 如果开启前端级别幂等（请求去重）
            if (dedupe) {
                const pending = pendingMap.get(key)
                // 检查是否存在有效时间内的相同幂等键请求
                if (pending && Date.now() - pending.timestamp < expire) {
                    // 返回已存在的Promise，避免重复请求
                    return pending.promise as Promise<Response<T>>
                }
            }

            return config
        },

        /**
         * 响应后钩子函数
         * 
         * 请求完成后，如果开启了前端去重，将响应结果缓存起来供后续重复请求使用
         * @param response - 服务器响应对象
         * @returns 原始响应对象（不做修改）
         */
        afterResponse(response: Response<any, ERequestConfig>) {
            const { config } = response
            // 仅在请求启用幂等且开启了前端去重时才进行缓存
            if (config.idempotencyOptions?.idempotent && dedupe) {
                const key = config.headers?.[headerName]
                if (key) {
                    // 缓存响应结果Promise和时间戳
                    pendingMap.set(key, {
                        promise: Promise.resolve(response),
                        timestamp: Date.now()
                    })
                }
            }
            return response
        },

        /**
         * 错误处理钩子函数
         * 
         * 请求出错时，如果开启了前端去重，从缓存中移除对应的请求记录
         * @param error - 请求错误对象
         * @returns 原始错误对象（不做修改）
         */
        onError(error: RequestError<any, ERequestConfig>) {
            const key = error.config?.headers?.[headerName]
            // 如果错误的请求有关联的幂等键且开启了前端去重，则删除缓存
            if (key && dedupe) {
                pendingMap.delete(key)
            }
            return error
        },

        /**
         * 插件扩展方法
         * 
         * 此插件不提供额外的扩展方法
         */
        result: void 0
    }
}