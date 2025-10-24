/**
 * 重试插件模块
 * 
 * 提供HTTP请求自动重试功能，当请求失败时根据配置条件自动进行重试，
 * 支持自定义重试条件、延迟策略和最大重试次数，提高请求成功率和系统稳定性
 */

import { RequestCore } from "../../request-core"
import { RequestPlugin } from "../../request-core/interfaces"
import { RequestConfig, RequestError, Response } from "../../request-core/types"
import { RetryOptions, RetryOptionsWithCount } from "./retry.types"

/**
 * 创建重试插件
 * 
 * 生成一个具有请求重试功能的插件，可以在请求失败时根据设定的条件自动重试，
 * 特别适用于网络不稳定环境或需要提高请求成功率的场景
 * 
 * @template T - 插件扩展方法的类型参数，此处为undefined
 * @param options - 重试配置选项
 * @param requestCore - 请求核心实例，用于执行重试请求
 * @returns 配置好的重试插件实例，无额外方法扩展
 */
export const useRetryPlugin = (options: RetryOptions = {}, requestCore: RequestCore): RequestPlugin<undefined> => {
    /**
     * 默认重试条件函数
     * 
     * 定义默认的请求重试条件：
     * 1. 连接超时 (ECONNABORTED)
     * 2. 没有响应对象
     * 3. 响应状态码在400-599范围内（客户端错误或服务器错误）
     * @param error - 请求错误对象
     * @returns 是否应该重试的布尔值
     */
    const defaultRetryCondition = (error: any): boolean => {
        return !!(error.code === 'ECONNABORTED' ||
            !error.response ||
            (error.response.status >= 400 && error.response.status < 600))
    }

    /**
     * 默认延迟计算函数
     * 
     * 使用指数退避算法计算重试延迟，带有随机抖动以避免雪崩效应
     * 计算公式：baseDelay * 2^retryCount + random(0, 100)
     * @param retryCount - 当前重试次数
     * @returns 计算出的延迟毫秒数
     */
    const defaultGetDelay = (retryCount: number): number => {
        const baseDelay = 1000 // 基础延迟1秒
        return Math.pow(2, retryCount) * baseDelay + Math.random() * 100
    }

    // 解析配置参数，设置默认值
    const {
        maxRetries: globalMaxRetries = 3,                      // 默认最大重试次数
        retryCondition: globalRetryCondition = defaultRetryCondition,  // 默认重试条件
        getDelay: globalGetDelay = defaultGetDelay             // 默认延迟计算
    } = options

    return {
        name: 'retry-plugin',

        /**
         * 请求前钩子函数
         * 
         * 此插件在请求前不做特殊处理，直接返回原始配置
         * @template T - 响应数据的类型参数
         * @param config - 请求配置对象
         * @returns 原始请求配置
         */
        beforeRequest<T>(config: RequestConfig) {
            return config
        },

        /**
         * 响应后钩子函数
         * 
         * 此插件在请求成功响应后不做特殊处理，直接返回原始响应
         * @param response - 服务器响应对象
         * @returns 原始响应对象
         */
        afterResponse(response: Response) {
            return response
        },

        /**
         * 错误处理钩子函数
         * 
         * 处理请求错误，根据重试配置决定是否重试请求
         * @param error - 请求错误对象
         * @returns Promise<Error | Response> - 包含响应的错误对象（成功重试时）或被拒绝的Promise（不再重试时）
         */
        async onError(error: RequestError) {
            const config = error.config

            // 如果没有配置对象，无法重试，直接返回错误
            if (!config) return Promise.reject(error)

            // 合并全局配置和请求级配置
            const requestRetryOptions = config.retryOptions || {
                maxRetries: globalMaxRetries,
                retryCondition: globalRetryCondition,
                getDelay: globalGetDelay,
                __retryCount: 0
            }

            // 获取最终使用的配置值
            const maxRetries = requestRetryOptions?.maxRetries ?? globalMaxRetries
            const retryCondition = requestRetryOptions?.retryCondition ?? globalRetryCondition
            const getDelay = requestRetryOptions?.getDelay ?? globalGetDelay
            const currentRetryCount = requestRetryOptions?.__retryCount || 0
            const remainingRetries = maxRetries - currentRetryCount

            // 判断是否应该重试
            const shouldRetry = await retryCondition(error)

            // 如果应该重试且还有剩余重试次数
            if (shouldRetry && remainingRetries > 0) {
                // 创建带有更新重试计数的新配置
                const newConfig: RequestConfig = {
                    ...config,
                    retryOptions: {
                        ...requestRetryOptions,
                        __retryCount: currentRetryCount + 1
                    }
                }

                // 计算重试延迟
                const delay = getDelay((newConfig.retryOptions as RetryOptionsWithCount)?.__retryCount || 0)

                // 创建延迟执行的重试请求
                const response: Response = await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(requestCore.request(newConfig))
                    }, delay)
                })

                // 返回带有响应Promise的错误对象
                return {
                    ...error,
                    response
                }
            }

            // 不再重试，拒绝Promise
            return Promise.reject(error)
        },

        /**
         * 插件扩展方法
         * 
         * 此插件不提供额外的扩展方法
         */
        result: void 0
    }
}