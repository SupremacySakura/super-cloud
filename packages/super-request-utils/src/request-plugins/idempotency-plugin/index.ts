/**
 * @module idempotency-plugin
 * 
 * 提供HTTP请求幂等性保障功能，通过添加唯一的幂等键到请求头，
 * 确保重复发送的请求不会导致重复的操作结果，同时支持前端请求去重。
 * 适用于支付、订单创建、资源更新等关键业务场景，有效防止网络重试、用户重复点击
 * 等情况下的数据一致性问题。
 * 
 * @example
 * ```typescript
 * // 创建幂等性插件实例
 * const idempotencyPlugin = useIdempotencyPlugin({
 *   headerName: 'Idempotency-Key',   // 自定义请求头名称
 *   dedupe: true,                    // 启用前端去重
 *   expire: 10000                    // 幂等键有效期10秒
 * });
 * 
 * // 在关键请求中使用幂等性保障
 * const response = await request({
 *   url: '/api/payments',
 *   method: 'POST',
 *   data: paymentData,
 *   idempotencyOptions: {
 *     idempotent: true,
 *     idempotentKey: 'order-123456'  // 可选：自定义幂等键
 *   }
 * });
 * ```
 */

import { RequestPlugin } from "../../request-core/interfaces"
import { RequestConfig, RequestError, Response } from "../../request-core/types"
import { IdempotencyOptions, RequestIdempotencyOptions } from "./idempotency.types"

/**
 * 扩展的请求配置类型
 * 
 * 在基础请求配置上添加幂等性相关选项，用于控制单个请求的幂等性行为。
 * 通过此类型，每个请求可以独立控制是否启用幂等性以及使用自定义的幂等键。
 * 
 * @typedef {RequestConfig & { idempotencyOptions?: RequestIdempotencyOptions }} ERequestConfig
 * @property {RequestIdempotencyOptions} [idempotencyOptions] - 幂等性配置选项，可选
 */
type ERequestConfig = RequestConfig & { idempotencyOptions?: RequestIdempotencyOptions }

/**
 * 创建幂等性插件
 * 
 * 生成一个具有幂等性保障功能的请求插件，可以为请求添加唯一标识符，
 * 防止重复提交造成的数据一致性问题，特别适用于支付、订单等关键操作。
 * 该插件通过请求前后的钩子函数，实现了自动生成和管理幂等键的机制，
 * 并支持前端请求去重，避免在短时间内发送重复的请求。
 * 
 * @template T - 插件扩展方法的类型参数，此处为undefined
 * @param options - 幂等性插件配置选项，控制幂等键生成、请求头设置和去重行为
 * @returns 配置好的幂等性插件实例，无额外方法扩展
 * @example
 * ```typescript
 * // 基本用法
 * const basicPlugin = useIdempotencyPlugin();
 * 
 * // 自定义幂等键生成函数
 * const customKeyPlugin = useIdempotencyPlugin({
 *   generateKey: () => {
 *     // 使用时间戳和随机数生成唯一键
 *     return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
 *   }
 * });
 * 
 * // 开启前端去重，适用于按钮防重复点击场景
 * const dedupePlugin = useIdempotencyPlugin({
 *   dedupe: true,
 *   expire: 5000,  // 5秒内重复的相同幂等键请求会被合并
 *   headerName: 'X-Idempotency-Key'  // 自定义请求头名称
 * });
 * ```
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
     * 用于前端去重机制的核心数据结构，键为幂等键，值为包含Promise和时间戳的对象。
     * 这个Map确保在指定的过期时间内，相同幂等键的请求只会发送一次，后续的重复请求
     * 将复用第一个请求的Promise结果。
     * 
     * @type {Map<string, { promise: Promise<Response>, timestamp: number }>}
     * @private 仅在插件内部使用
     */
    const pendingMap = new Map<string, { promise: Promise<Response>, timestamp: number }>()

    /**
     * 获取幂等键函数
     * 
     * 优先使用请求配置中提供的幂等键，否则通过生成函数创建。
     * 这种设计允许用户为特定请求提供自定义的幂等键，适用于需要精确控制幂等行为的场景，
     * 同时默认情况下也能自动生成唯一的幂等键。
     * 
     * @param config - 请求配置对象，可能包含用户自定义的幂等键
     * @returns 用于标识请求唯一性的幂等键字符串
     * @example
     * ```typescript
     * // 自动生成幂等键
     * const autoKey = getIdempotentKey({}); // 生成类似 UUID 的唯一字符串
     * 
     * // 使用自定义幂等键
     * const customKey = getIdempotentKey({
     *   idempotencyOptions: {
     *     idempotentKey: 'transaction-abc123'
     *   }
     * }); // 返回 'transaction-abc123'
     * ```
     */
    const getIdempotentKey = (config: ERequestConfig) => {
        if (config.idempotencyOptions?.idempotentKey) {
            return config.idempotencyOptions.idempotentKey
        }
        return generateKey()
    }

    // 返回幂等性插件对象
    return {
        /**
         * 插件唯一标识符
         * 
         * 使用Symbol作为插件名称，确保在插件系统中不会与其他插件冲突。
         * @type {symbol}
         * @readonly
         */
        name: Symbol('idempotency-plugin'),

        /**
         * 请求前钩子函数
         * 
         * 在请求发送前检查是否需要添加幂等键，并处理前端去重逻辑。
         * 该钩子函数执行以下操作：
         * 1. 检查请求是否需要幂等性保障
         * 2. 验证请求方法是否为修改类方法
         * 3. 生成或使用自定义幂等键并设置到请求头
         * 4. 如启用前端去重，则检查并返回已存在的相同请求
         * 
         * @template T - 响应数据的类型参数
         * @param config - 请求配置对象，可能包含幂等性选项
         * @returns 处理后的请求配置或已存在的Promise（前端去重时）
         * @example
         * ```typescript
         * // 支付场景使用示例
         * function processPayment(paymentData) {
         *   return request({
         *     url: '/api/payments',
         *     method: 'POST',
         *     data: paymentData,
         *     idempotencyOptions: {
         *       idempotent: true,
         *       // 使用订单号作为幂等键，确保同一订单只会支付一次
         *       idempotentKey: paymentData.orderId
         *     }
         *   });
         * }
         * 
         * // 按钮点击防重复提交
         * async function handleSubmit() {
         *   if (isSubmitting) return;
         *   
         *   try {
         *     isSubmitting = true;
         *     // 请求会自动添加幂等键并进行去重
         *     await processPayment(paymentData);
         *   } finally {
         *     isSubmitting = false;
         *   }
         * }
         * ```
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
         * 请求完成后，如果开启了前端去重，将响应结果缓存起来供后续重复请求使用。
         * 这个钩子函数在请求成功完成后执行，用于维护前端去重机制所需的响应缓存。
         * 当同一个幂等键的请求再次发起时，可以直接返回缓存的响应结果，避免重复请求服务器。
         * 
         * @template T - 响应数据的类型参数
         * @param response - 服务器响应对象，包含原始请求配置和响应数据
         * @returns 原始响应对象（不做修改）
         * @description 此函数仅在请求配置中开启幂等且全局配置开启去重时才会执行缓存操作
         */
        afterResponse<T>(response: Response<T, ERequestConfig>) {
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
         * 请求出错时，如果开启了前端去重，从缓存中移除对应的请求记录。
         * 这个钩子函数确保失败的请求不会被缓存，防止后续请求继续使用错误的结果。
         * 同时也起到了内存管理的作用，避免失败请求的缓存无限积累。
         * 
         * @template T - 响应数据的类型参数
         * @param error - 请求错误对象，包含原始请求配置和错误信息
         * @returns 原始错误对象（不做修改）
         * @description 错误处理机制确保：
         * 1. 失败的请求不会被缓存
         * 2. 释放不再需要的内存资源
         * 3. 允许相同幂等键的请求在失败后重试
         */
        onError<T>(error: RequestError<T, ERequestConfig>) {
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
         * 幂等性插件不提供额外的扩展方法，所有功能通过请求配置选项控制。
         * @type {undefined}
         * @readonly
         */
        result: void 0
    }
}