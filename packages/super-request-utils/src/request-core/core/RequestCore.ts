/**
 * 请求核心模块，提供统一的HTTP请求接口和插件系统
 */
import { Requester, RequestPlugin } from "../interfaces"
import { RequestConfig, RequestError, Response } from "../types"
import { isResponse } from "../utils"

/**
 * RequestCore的配置选项接口
 * 
 * 定义请求核心类的全局配置参数，可通过构造函数或setOptions方法设置
 */
interface RequestCoreOptions {
    /**
     * 请求超时时间（毫秒）
     * 
     * 当值小于或等于0时不设置超时时间
     * 默认值：60000（60秒）
     */
    timeout?: number

    /**
     * API请求的基础URL地址
     * 
     * 当请求URL为相对路径时，会自动与baseUrl拼接形成完整URL
     * 默认值：空字符串
     */
    baseUrl?: string

    /**
     * 是否允许请求携带Cookie信息
     * 
     * 在跨域请求场景下尤为重要，决定是否发送认证信息
     * 默认值：true
     */
    withCredentials?: boolean
}

/**
 * 请求核心类，提供统一的HTTP请求接口和插件系统
 * 
 * 该类是整个请求库的核心，负责协调请求执行流程、管理插件系统、处理错误和超时等通用逻辑。
 * 通过依赖注入的方式支持不同的底层请求实现（如Axios、Fetch等），实现了请求流程的标准化和可扩展性。
 * 
 * @template C - 请求配置类型，扩展自RequestConfig
 */
export class RequestCore<C extends RequestConfig> {
    /**
     * 底层请求实现实例
     * 
     * 负责实际发送HTTP请求的对象，需实现Requester接口，提供了请求发送的具体能力
     * 支持通过依赖注入方式替换不同的请求实现
     */
    private requester: Requester

    /**
     * 已注册的请求插件列表
     * 
     * 存储所有通过use方法注册的插件，在请求流程的不同阶段被调用
     * 采用数组结构保证插件按注册顺序执行
     */
    private requestPlugins: RequestPlugin<C>[] = []

    /**
     * 请求核心配置选项
     * 
     * 存储全局默认的请求配置，将应用于所有请求（除非被请求级配置覆盖）
     */
    public requestCoreOptions: RequestCoreOptions = {
        timeout: 60 * 1000, // 60秒超时
        baseUrl: '',       // 空基础URL
        withCredentials: true // 默认携带凭证
    }

    /**
     * 注册请求插件
     * 
     * 向请求核心注册一个新的插件，插件将在请求的不同阶段被调用。
     * 该方法采用函数式设计，返回一个新的RequestCore实例而非修改原实例。
     * 
     * @template EC - 额外的请求配置类型，由插件添加
     * @template R - 插件支持的响应数据类型
     * @param plugin - 要注册的请求插件实例
     * @returns 新的RequestCore实例，合并了额外的配置类型，支持链式调用
     */
    public use = <EC extends RequestConfig, R>(plugin: RequestPlugin<EC, R>): RequestCore<C & EC> => {
        // 创建插件副本以保持不可变性
        const newPlugins = [...this.requestPlugins, plugin]
        // 返回新实例，合并配置类型
        return new RequestCore<C & EC>(this.requester, this.requestCoreOptions, newPlugins)
    }

    /**
     * 移除已注册的请求插件
     * 
     * 从插件列表中移除指定的插件，通过插件名称进行匹配。
     * 同样采用函数式设计，返回一个新的RequestCore实例。
     * 
     * @template P - 要移除的插件类型
     * @param plugin - 要移除的插件实例
     * @returns 移除插件后的新RequestCore实例，支持链式调用
     */
    public eject = <P extends RequestPlugin>(plugin: P): RequestCore<C> => {
        // 通过插件名称过滤，移除指定插件
        const newPlugins = this.requestPlugins.filter((item) => item.name !== plugin.name)
        // 返回移除插件后的新实例
        return new RequestCore(this.requester, this.requestCoreOptions, newPlugins)
    }

    /**
     * 发起HTTP请求
     * 
     * 该方法是请求的主入口，协调整个请求生命周期：
     * 1. 配置合并：将全局配置与请求配置合并
     * 2. 请求前置处理：执行所有插件的beforeRequest钩子
     * 3. 请求发送：通过底层requester发送请求，支持超时处理
     * 4. 响应后置处理：执行所有插件的afterResponse钩子
     * 5. 错误处理：执行插件的onError钩子，提供错误恢复机制
     * 
     * @async
     * @template T - 响应数据的类型参数
     * @param config - 请求配置对象
     * @returns Promise，解析为响应对象
     * @throws RequestError 当请求失败且没有被插件错误处理器处理时抛出
     */
    public request = async <T = any>(config: C): Promise<Response<T>> => {
        try {
            // 合并默认配置与请求配置
            const defaultTimeOut = this.requestCoreOptions?.timeout
            const defaultWithCredentials = this.requestCoreOptions?.withCredentials
            const baseUrl = config.baseUrl || this.requestCoreOptions?.baseUrl
            
            // 创建合并后的配置，处理URL拼接
            config = {
                timeout: defaultTimeOut,
                withCredentials: defaultWithCredentials,
                ...config,
                url: `${baseUrl}${config?.url}`
            }

            // 执行所有插件的beforeRequest钩子
            // 此阶段允许插件修改请求配置或短路请求流程
            for (const plugin of this.requestPlugins) {
                if (plugin.beforeRequest) {
                    let result = await plugin.beforeRequest<T>(config, this)
                    
                    // 短路逻辑：如果插件直接返回响应对象，则跳过实际请求
                    if (isResponse(result)) {
                        // 但仍需执行afterResponse钩子以保持流程一致性
                        for (const plugin of this.requestPlugins) {
                            if (plugin.afterResponse) {
                                result = await plugin.afterResponse(result, this)
                            }
                        }
                        return Promise.resolve(result)
                    }
                    
                    // 更新配置为插件处理后的配置
                    config = result
                }
            }

            // 发送请求（带超时处理）
            const timeout = config.timeout || this.requestCoreOptions.timeout || 0
            const requestPromise = this.requester.request<T, C>(config)
            let response: Response<T, C>

            // 实现超时逻辑
            if (timeout > 0) {
                // 使用Promise.race实现请求超时控制
                response = await Promise.race([
                    requestPromise,
                    new Promise<Response<T, C>>((_, reject) => {
                        setTimeout(() => reject({
                            error: new Error(`Request timed out after ${timeout}ms`),
                        }), timeout)
                    })
                ])
            } else {
                // 无超时限制，直接等待请求完成
                response = await requestPromise
            }

            // 执行所有插件的afterResponse钩子
            // 允许插件修改响应数据或进行其他后置处理
            for (const plugin of this.requestPlugins) {
                if (plugin.afterResponse) {
                    response = await plugin.afterResponse(response, this)
                }
            }

            return Promise.resolve(response)
        } catch (error) {
            // 封装错误对象，添加配置信息便于调试
            let newError: RequestError<T, C> = {
                error,
                config
            }
            let currentError = newError

            // 执行所有插件的onError钩子进行错误处理
            // 插件可以修改错误、添加重试逻辑或完全处理错误
            for (const plugin of this.requestPlugins) {
                if (plugin.onError) {
                    currentError = await plugin.onError(currentError, this)
                    
                    // 错误恢复机制：如果插件返回包含response的错误对象，则视为错误已处理
                    if (Object.prototype.hasOwnProperty.call(currentError, 'response')) {
                        return Promise.resolve(currentError.response as Response)
                    }
                }
            }

            // 如果错误没有被任何插件处理，则向上抛出
            return Promise.reject(currentError)
        }
    }

    /**
     * 发送GET请求
     * 
     * 用于获取数据的HTTP方法，通常不会修改服务器状态。
     * 是最常用的数据获取方式，通常用于查询操作。
     * 
     * @async
     * @template T - 响应数据的类型参数
     * @param url - 请求的URL地址
     * @param config - 可选的请求配置对象（不包含method和url）
     * @returns Promise，解析为响应对象
     * @throws RequestError 当请求失败时抛出
     */
    public get = async <T = any>(url: string, config?: Omit<C, 'method' | 'url'>): Promise<Response<T>> => {
        // 创建GET请求配置
        const newConfig = { ...config, url, method: 'GET' } as C
        return this.request<T>(newConfig)
    }

    /**
     * 发送POST请求
     * 
     * 用于提交数据的HTTP方法，常用于创建资源或执行需要服务器处理的操作。
     * 通常会导致服务器状态的改变，适合用于表单提交、文件上传等场景。
     * 
     * @async
     * @template T - 响应数据的类型参数
     * @param url - 请求的URL地址
     * @param config - 可选的请求配置对象（不包含method和url）
     * @returns Promise，解析为响应对象
     * @throws RequestError 当请求失败时抛出
     */
    public post = async <T = any>(url: string, config?: Omit<C, 'method' | 'url'>): Promise<Response<T>> => {
        // 创建POST请求配置
        const newConfig = { ...config, url, method: 'POST' } as C
        return this.request<T>(newConfig)
    }

    /**
     * 发送PUT请求
     * 
     * 用于更新资源的HTTP方法，通常需要提供完整的资源表示。
     * 会替换目标资源的全部内容，常用于完整更新操作。
     * 
     * @async
     * @template T - 响应数据的类型参数
     * @param url - 请求的URL地址
     * @param config - 可选的请求配置对象（不包含method和url）
     * @returns Promise，解析为响应对象
     * @throws RequestError 当请求失败时抛出
     */
    public put = async <T = any>(url: string, config?: Omit<C, 'method' | 'url'>): Promise<Response<T>> => {
        // 创建PUT请求配置
        const newConfig = { ...config, url, method: 'PUT' } as C
        return this.request<T>(newConfig)
    }

    /**
     * 发送DELETE请求
     * 
     * 用于删除指定资源的HTTP方法。
     * 会移除目标资源，适用于数据删除操作。
     * 
     * @async
     * @template T - 响应数据的类型参数
     * @param url - 请求的URL地址
     * @param config - 可选的请求配置对象（不包含method和url）
     * @returns Promise，解析为响应对象
     * @throws RequestError 当请求失败时抛出
     */
    public delete = async <T = any>(url: string, config?: Omit<C, 'method' | 'url'>): Promise<Response<T>> => {
        // 创建DELETE请求配置
        const newConfig = { ...config, url, method: 'DELETE' } as C
        return this.request<T>(newConfig)
    }

    /**
     * 设置全局请求配置选项
     * 
     * 更新请求核心的全局配置，这些配置将应用于所有后续请求
     * 
     * @param options - 要设置的配置选项
     * @returns 当前RequestCore实例，支持链式调用
     */
    public setOptions = (options: RequestCoreOptions): RequestCore<C> => {
        // 使用展开运算符合并配置，保留未指定的现有配置项
        this.requestCoreOptions = {
            ...this.requestCoreOptions,
            ...options
        }
        return this
    }

    /**
     * RequestCore构造函数
     * 
     * 创建请求核心实例，配置底层请求实现和全局选项
     * 
     * @param requester - 底层请求实现实例，提供实际的请求发送能力
     * @param options - 可选的初始化配置
     * @param _plugins - 可选的初始插件列表，内部使用，外部不建议直接使用，否则类型检查会丢失
     */
    constructor(requester: Requester, options?: RequestCoreOptions, _plugins?: RequestPlugin<any>[]) {
        // 初始化底层请求器
        this.requester = requester
        
        // 应用初始配置（如果提供）
        if (options) {
            this.setOptions(options)
        }
        
        // 设置初始插件（如果提供）
        if (_plugins) {
            this.requestPlugins = _plugins
        }
    }
}


