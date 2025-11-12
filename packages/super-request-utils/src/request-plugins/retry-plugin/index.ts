/**
 * @module retry-plugin
 * 
 * 重试插件模块
 * 
 * 提供HTTP请求自动重试功能，当请求失败时根据配置条件自动进行重试，
 * 支持自定义重试条件、延迟策略和最大重试次数，提高请求成功率和系统稳定性。
 * 特别适用于网络不稳定环境或需要提高关键请求可靠性的场景，如支付、数据同步等操作。
 * 
 * @example
 * ```typescript
 * // 创建带重试功能的请求实例
 * import { createRequestInstance } from '@super-request/utils';
 * import { useRetryPlugin } from '@super-request/utils/dist/request-plugins/retry-plugin';
 * 
 * const request = createRequestInstance({
 *   baseURL: 'https://api.example.com',
 *   plugins: [
 *     // 默认配置：最多重试3次，使用指数退避延迟
 *     useRetryPlugin()
 *   ]
 * });
 * 
 * // 自定义重试配置
 * const customRequest = createRequestInstance({
 *   baseURL: 'https://api.example.com',
 *   plugins: [
 *     useRetryPlugin({
 *       maxRetries: 5,
 *       retryCondition: (error) => {
 *         // 只在服务器错误时重试
 *         return error.response && error.response.status >= 500;
 *       },
 *       getDelay: (retryCount) => {
 *         // 固定延迟2秒
 *         return 2000;
 *       },
 *       beforeRetry: (retryCount, config) => {
 *         // 重试前修改配置，例如添加重试标识
 *         return {
 *           ...config,
 *           headers: {
 *             ...config.headers,
 *             'X-Retry-Count': retryCount
 *           }
 *         };
 *       }
 *     })
 *   ]
 * });
 * 
 * // 请求级别覆盖重试配置
 * request.post('/api/submit', {
 *   data: { name: 'test' },
 *   retryOptions: {
 *     maxRetries: 2,
 *     retryCondition: (error) => error.code === 'ETIMEDOUT'
 *   }
 * });
 * ```
 */

import { RequestCore } from "../../request-core"
import { RequestPlugin } from "../../request-core/interfaces"
import { RequestConfig, RequestError, Response } from "../../request-core/types"
import { RetryOptions, RequestRetryOptions } from "./retry.types"

/**
 * 扩展的请求配置类型
 * 
 * 在基础请求配置上添加了重试相关的选项，允许在每个请求级别自定义重试行为。
 * 这些选项可以覆盖插件实例级别的默认配置。
 * 
 * @typedef {RequestConfig} ERequestConfig
 * @property {RequestRetryOptions} [retryOptions] - 重试配置选项，用于控制当前请求的重试行为
 */
type ERequestConfig = RequestConfig & { retryOptions?: RequestRetryOptions }

/**
 * 创建重试插件
 * 
 * 生成一个具有请求重试功能的插件，可以在请求失败时根据设定的条件自动重试，
 * 特别适用于网络不稳定环境或需要提高请求成功率的场景。该插件通过钩子函数机制
 * 在请求失败时介入，根据配置的条件判断是否需要重试，并应用相应的延迟策略。
 * 
 * @template C - 请求配置类型参数，用于泛型支持
 * @param {RetryOptions} [options] - 重试配置选项，控制重试行为
 * @param {number} [options.maxRetries=3] - 最大重试次数
 * @param {Function} [options.retryCondition] - 判断是否应该重试的函数
 * @param {Function} [options.getDelay] - 计算重试延迟时间的函数
 * @param {Function} [options.beforeRetry] - 重试前修改请求配置的函数
 * @returns {RequestPlugin<ERequestConfig, undefined>} 配置好的重试插件实例，无额外方法扩展
 * 
 * @example
 * ```typescript
 * // 基本用法 - 使用默认配置
 * const retryPlugin = useRetryPlugin();
 * 
 * // 自定义重试配置
 * const customRetryPlugin = useRetryPlugin({
 *   // 最多重试5次
 *   maxRetries: 5,
 *   
 *   // 自定义重试条件：只在超时或服务器错误时重试
 *   retryCondition: (error) => {
 *     return error.code === 'ETIMEDOUT' || 
 *            (error.response && error.response.status >= 500);
 *   },
 *   
 *   // 自定义延迟策略：线性增长而非指数增长
 *   getDelay: (retryCount) => {
 *     return 1000 + retryCount * 500; // 1s, 1.5s, 2s, ...
 *   },
 *   
 *   // 重试前修改请求配置
 *   beforeRetry: (retryCount, config) => {
 *     // 添加重试标识到请求头
 *     return {
 *       ...config,
 *       headers: {
 *         ...config.headers,
 *         'X-Retry-Attempt': retryCount + 1,
 *         'X-Retry-Timestamp': Date.now()
 *       }
 *     };
 *   }
 * });
 * 
 * // 在请求配置中覆盖全局重试设置
 * request.get('/api/data', {
 *   retryOptions: {
 *     maxRetries: 2, // 此请求只重试2次
 *     retryCondition: (error) => error.code === 'ECONNABORTED' // 只在连接中断时重试
 *   }
 * });
 * ```
 */
export const useRetryPlugin = <C extends RequestConfig>(options: RetryOptions = {}): RequestPlugin<ERequestConfig, undefined> => {
    /**
     * 默认重试条件函数
     * 
     * 定义默认的请求重试条件，确定哪些类型的错误应该触发重试机制。
     * 默认情况下，以下情况会触发重试：
     * 1. 连接超时错误 (ECONNABORTED)
     * 2. 没有收到响应对象（网络中断等情况）
     * 3. 收到的响应状态码在400-599范围内（客户端错误或服务器错误）
     * 
     * @param {any} error - 请求错误对象，包含错误信息、响应状态等
     * @returns {boolean} 是否应该重试请求的布尔值
     * 
     * @example
     * ```typescript
     * // 使用默认重试条件判断
     * const shouldRetry = defaultRetryCondition(error);
     * if (shouldRetry) {
     *   console.log('此错误可以进行重试');
     * }
     * 
     * // 自定义重试条件示例
     * const customRetryCondition = (error) => {
     *   // 仅对服务器错误(5xx)进行重试
     *   return error.response && error.response.status >= 500;
     * };
     * ```
     */
    const defaultRetryCondition = (error: any): boolean => {
        return !!(error.code === 'ECONNABORTED' ||
            !error.response ||
            (error.response.status >= 400 && error.response.status < 600))
    }

    /**
     * 默认延迟计算函数
     * 
     * 使用指数退避算法计算重试延迟时间，包含随机抖动以避免重试风暴。
     * 这种策略可以有效减轻服务器压力，避免多个客户端同时重试造成的雪崩效应。
     * 计算公式：baseDelay * 2^retryCount + random(0, 100)
     * 其中baseDelay为1000毫秒（1秒）
     * 
     * @param {number} retryCount - 当前重试次数，从0开始计数
     * @returns {number} 计算出的延迟毫秒数
     * 
     * @example
     * ```typescript
     * // 计算不同重试次数的延迟时间
     * const delay1 = defaultGetDelay(0); // 约1000-1100ms
     * const delay2 = defaultGetDelay(1); // 约2000-2100ms
     * const delay3 = defaultGetDelay(2); // 约4000-4100ms
     * const delay4 = defaultGetDelay(3); // 约8000-8100ms
     * 
     * // 自定义延迟策略示例
     * const customGetDelay = (retryCount) => {
     *   // 线性增长策略
     *   return 1000 + retryCount * 1000; // 1s, 2s, 3s, ...
     * };
     * ```
     */
    const defaultGetDelay = (retryCount: number): number => {
        const baseDelay = 1000 // 基础延迟1秒
        return Math.pow(2, retryCount) * baseDelay + Math.random() * 100
    }
    /**
     * 默认重试前参数处理函数
     * 
     * 在每次重试前调用，用于修改请求配置。默认实现直接返回原始配置，
     * 不做任何修改。用户可以通过自定义此函数来修改重试请求的参数，
     * 例如添加重试标识、更新时间戳、修改请求体等。
     * 
     * @param {number} retryCount - 当前重试次数，从0开始计数
     * @param {RequestConfig} config - 上一次请求的配置对象
     * @returns {RequestConfig} 新的请求配置对象
     * 
     * @example
     * ```typescript
     * // 使用默认处理函数
     * const newConfig = defaultBeforeRetry(0, originalConfig);
     * 
     * // 自定义重试前处理函数示例
     * const customBeforeRetry = (retryCount, config) => {
     *   // 添加重试标识到请求头
     *   return {
     *     ...config,
     *     headers: {
     *       ...config.headers,
     *       'X-Retry-Count': retryCount,
     *       'X-Retry-Timestamp': Date.now()
     *     },
     *     // 更新请求中的时间戳参数
     *     params: {
     *       ...config.params,
     *       '_t': Date.now()
     *     }
     *   };
     * };
     * ```
     */
    const defaultBeforeRetry = (retryCount: number, config: RequestConfig) => {
        return config
    }

    // 解析配置参数，设置默认值
    const {
        maxRetries: globalMaxRetries = 3,                      // 默认最大重试次数
        retryCondition: globalRetryCondition = defaultRetryCondition,  // 默认重试条件
        getDelay: globalGetDelay = defaultGetDelay,             // 默认延迟计算
        beforeRetry: globalBeforeRetry = defaultBeforeRetry
    } = options

    return {
        /**
         * 插件名称标识符
         * 
         * 使用Symbol类型确保插件名称的唯一性，避免与其他插件冲突。
         * Symbol值在运行时是唯一的，即使多个插件使用相同的字符串描述。
         * 
         * @type {Symbol}
         * @readonly
         */
        name: Symbol('retry-plugin'),

        /**
         * 请求前钩子函数
         * 
         * 重试插件在请求前阶段不进行特殊处理，直接返回原始请求配置。重试逻辑主要在
         * onError钩子中实现，当请求失败时才会触发重试机制。
         * 
         * @template T - 响应数据的类型参数
         * @param {RequestConfig} config - 请求配置对象，包含url、method、headers等信息
         * @returns {RequestConfig} 原始请求配置对象，未做任何修改
         */
        beforeRequest(config: RequestConfig) {
            return config
        },

        /**
         * 响应后钩子函数
         * 
         * 重试插件在请求成功响应后不进行特殊处理，直接返回原始响应对象。重试机制
         * 只对失败的请求生效，成功的请求将直接返回给调用方。
         * 
         * @template T - 响应数据的类型参数
         * @param {Response<T, ERequestConfig>} response - 服务器响应对象，包含data、status、headers等信息
         * @returns {Response<T, ERequestConfig>} 原始响应对象，未做任何修改
         */
        afterResponse<T>(response: Response<T, ERequestConfig>) {
            return response
        },

        /**
         * 错误处理钩子函数
         * 
         * 重试插件的核心逻辑，处理请求错误时根据配置决定是否重试请求。该函数会：
         * 1. 合并全局配置和请求级配置
         * 2. 检查是否满足重试条件
         * 3. 如果应该重试且还有剩余重试次数，则计算延迟并执行重试
         * 4. 重试前可以通过beforeRetry回调修改请求配置
         * 5. 如果不满足重试条件或重试次数已用尽，则拒绝Promise
         * 
         * @template T - 响应数据的类型参数
         * @param {RequestError<T, ERequestConfig>} error - 请求错误对象，包含config、response等信息
         * @param {RequestCore<ERequestConfig>} requestInstance - 请求核心实例，用于执行重试请求
         * @returns {Promise<RequestError | Error>} 
         *          - 成功重试时返回包含响应的错误对象
         *          - 不再重试时返回被拒绝的Promise
         * 
         * @example
         * ```typescript
         * // 错误处理过程示例
         * try {
         *   await request.get('/api/data');
         * } catch (error) {
         *   if (error.response) {
         *     // 成功重试后，error.response 包含最终的响应
         *     console.log('请求最终成功，重试了', error.config.retryOptions.__retryCount, '次');
         *     console.log('响应数据:', error.response.data);
         *   } else {
         *     // 所有重试都失败
         *     console.log('所有重试都失败，最大重试次数:', error.config.retryOptions.maxRetries);
         *   }
         * }
         * ```
         */
        async onError<T>(error: RequestError<T, ERequestConfig>, requestInstance: RequestCore<ERequestConfig>) {
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
                const beforeRetry = config.retryOptions?.beforeRetry || globalBeforeRetry
                const beforeRetryConfig = await beforeRetry(currentRetryCount, config)
                // 创建带有更新重试计数的新配置
                const newConfig = {
                    ...config,
                    ...beforeRetryConfig,
                    retryOptions: {
                        ...requestRetryOptions,
                        __retryCount: currentRetryCount + 1
                    }
                } as ERequestConfig

                // 计算重试延迟
                const delay = getDelay((newConfig.retryOptions as RequestRetryOptions)?.__retryCount || 0)

                // 创建延迟执行的重试请求
                const response: Response = await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(requestInstance.request(newConfig))
                    }, delay)
                })

                // 返回带有响应Promise的错误对象
                return {
                    ...error,
                    response
                } as RequestError
            }

            // 不再重试，拒绝Promise
            return Promise.reject(error)
        },

        /**
         * 插件扩展方法
         * 
         * 重试插件不提供额外的扩展方法，此属性为undefined。
         * 插件的所有功能通过钩子函数机制实现，不需要额外的扩展方法。
         * 
         * @type {undefined}
         * @readonly
         */
        result: void 0
    }
}