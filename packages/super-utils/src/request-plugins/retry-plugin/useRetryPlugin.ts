import { RequestCore } from "../../request-core"
import { RequestPlugin } from "../../request-core/interfaces"
import { RequestConfig, RequestError, Response } from "../../request-core/types"
import { RetryOptions, RetryOptionsWithCount } from "./RetryOptions"

/**
 * 创建重试插件
 * @param options 重试配置
 * @param requestCore 请求实例
 * @returns 重试插件 
 */
export const useRetryPlugin = (options: RetryOptions, requestCore: RequestCore): RequestPlugin<undefined> => {
    const defaultRetryCondition = (error: any): boolean => {
        return !!(
            error.code === 'ECONNABORTED' ||
            !error.response ||
            (error.response.status >= 400 && error.response.status < 600)
        )
    }

    const defaultGetDelay = (retryCount: number): number => {
        const baseDelay = 1000
        return Math.pow(2, retryCount) * baseDelay + Math.random() * 100
    }
    const {
        maxRetries: globalMaxRetries = 3,
        retryCondition: globalRetryCondition = defaultRetryCondition,
        getDelay: globalGetDelay = defaultGetDelay
    } = options
    return {
        name: 'retry-plugin',
        beforeRequest<T>(config: RequestConfig) {

            return config
        },
        afterResponse(response: Response) {

            return response
        },
        async onError(error: RequestError) {
            const config = error.config

            if (!config) return Promise.reject(error)

            // 合并配置
            const requestRetryOptions = config.retryOptions || { maxRetries: globalMaxRetries, retryCondition: globalRetryCondition, getDelay: globalGetDelay, __retryCount: 0 }
            const maxRetries = requestRetryOptions?.maxRetries ?? globalMaxRetries
            const retryCondition = requestRetryOptions?.retryCondition ?? globalRetryCondition
            const getDelay = requestRetryOptions?.getDelay ?? globalGetDelay
            const currentRetryCount = requestRetryOptions?.__retryCount || 0
            const remainingRetries = maxRetries - currentRetryCount

            const shouldRetry = await retryCondition(error)


            if (shouldRetry && remainingRetries > 0) {
                const newConfig: RequestConfig = {
                    ...config,
                    retryOptions: {
                        ...requestRetryOptions,
                        __retryCount: currentRetryCount + 1
                    }
                }
                const delay = getDelay((newConfig.retryOptions as RetryOptionsWithCount)?.__retryCount || 0)

                const response = new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(requestCore.request(newConfig))
                    }, delay)
                })
                return {
                    ...error,
                    response
                }
            }

            return Promise.reject(error)
        },
        result: void 0
    }
}