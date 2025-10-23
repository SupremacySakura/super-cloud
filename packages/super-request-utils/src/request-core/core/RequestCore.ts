import { Requester, RequestPlugin } from "../interfaces"
import { RequestConfig, RequestError, Response } from "../types"
import { isResponse } from "../utils"

/**
 * RequestCore的配置选项接口
 * 
 * 用于定义请求核心类的全局配置参数
 */
interface RequestCoreOptions {
    /**
     * 请求超时时间（毫秒）
     * 
     * 当值小于0时不设置超时时间
     * 默认值：60000（60秒）
     */
    timeout?: number
    
    /**
     * API请求的基础URL地址
     * 
     * 当请求URL为相对路径时，会自动与baseUrl拼接
     * 默认值：空字符串
     */
    baseUrl?: string
    
    /**
     * 是否允许请求携带Cookie信息
     * 
     * 跨域请求时尤为重要
     * 默认值：true
     */
    withCredentials?: boolean
}

/**
 * 请求核心类，提供统一的HTTP请求接口和插件系统
 * 
 * 该类是整个请求库的核心，负责协调请求执行流程、管理插件系统、处理错误和超时等通用逻辑。
 * 通过依赖注入的方式支持不同的底层请求实现（如Axios、Fetch等）。
 */
export class RequestCore {
    /**
     * 底层请求实现实例
     * 
     * 负责实际发送HTTP请求的对象，需实现Requester接口
     */
    private requester: Requester
    
    /**
     * 已注册的请求插件列表
     * 
     * 用于存储所有通过use方法注册的插件
     */
    private requestPlugins: RequestPlugin[] = []
    
    /**
     * 请求核心配置选项
     * 
     * 存储全局默认的请求配置
     */
    public requestCoreOptions: RequestCoreOptions = {
        timeout: 60 * 1000,
        baseUrl: '',
        withCredentials: true
    }

    /**
     * 注册请求插件
     * 
     * @param {RequestPlugin} plugin - 要注册的请求插件实例
     * @returns {RequestCore} 当前RequestCore实例，支持链式调用
     */
    public use = (plugin: RequestPlugin): RequestCore => {
        this.requestPlugins.push(plugin)
        return this
    }
    
    /**
     * 移除已注册的请求插件
     * 
     * @param {RequestPlugin} plugin - 要移除的插件实例（通过引用比较）
     * @returns {RequestCore} 当前RequestCore实例，支持链式调用
     */
    public eject = (plugin: RequestPlugin): RequestCore => {
        this.requestPlugins = this.requestPlugins.filter((item) => item !== plugin)
        return this
    }
    
    /**
     * 发起HTTP请求
     * 
     * 该方法是请求的主入口，处理请求前的配置合并、插件执行、请求发送、响应处理和错误处理等完整流程。
     * 
     * @async
     * @template T - 响应数据的类型参数
     * @param {RequestConfig} config - 请求配置对象
     * @returns {Promise<Response<T>>} 返回一个Promise，解析为响应对象
     * @throws {RequestError} 当请求失败且没有被插件错误处理器吸收时抛出
     */
    public request = async <T = any>(config: RequestConfig): Promise<Response<T>> => {
        try {
            // 合并默认配置与请求配置
            const defaultTimeOut = this.requestCoreOptions?.timeout
            const defaultWithCredentials = this.requestCoreOptions?.withCredentials
            const baseUrl = config.baseUrl || this.requestCoreOptions?.baseUrl
            config = { 
                timeout: defaultTimeOut, 
                withCredentials: defaultWithCredentials, 
                ...config, 
                url: `${baseUrl + config?.url}` 
            }

            // 执行所有插件的beforeRequest钩子
            for (const plugin of this.requestPlugins) {
                if (plugin.beforeRequest) {
                    let result = await plugin.beforeRequest<T>(config)
                    // 如果插件返回了响应对象，则触发短路逻辑
                    if (isResponse(result)) {
                        // 执行所有afterResponse钩子后直接返回
                        for (const plugin of this.requestPlugins) {
                            if (plugin.afterResponse) {
                                result = await plugin.afterResponse(result as Response)
                            }
                        }
                        return Promise.resolve(result as Response)
                    }
                    // 更新配置
                    config = result as RequestConfig
                }
            }
            
            // 发送请求（带超时处理）
            const timeout = config.timeout || this.requestCoreOptions.timeout || 0
            const requestPromise = this.requester.request<T>(config)
            let response: Response<T>
            
            // 实现超时逻辑
            if (timeout > 0) {
                response = await Promise.race([
                    requestPromise,
                    new Promise<Response<T>>((_, reject) => {
                        setTimeout(() => reject({
                            error: new Error(`Request timed out after ${timeout}ms`),
                            config,
                        }), timeout)
                    })
                ])
            } else {
                response = await requestPromise
            }
            
            // 执行所有插件的afterResponse钩子
            for (const plugin of this.requestPlugins) {
                if (plugin.afterResponse) {
                    response = await plugin.afterResponse(response)
                }
            }
            
            return Promise.resolve(response)
        } catch (error) {
            // 封装错误对象
            let newError: RequestError = {
                error,
                config
            }
            let currentError = newError
            
            // 执行所有插件的onError钩子进行错误处理
            for (const plugin of this.requestPlugins) {
                if (plugin.onError) {
                    currentError = await plugin.onError(currentError)
                    // 如果插件返回了包含response的错误对象，则视为错误被处理，返回该response
                    if (Object.prototype.hasOwnProperty.call(currentError, 'response')) {
                        return Promise.resolve(currentError?.response as Response)
                    }
                }
            }
            
            // 如果错误没有被任何插件处理，则向上抛出
            return Promise.reject(currentError)
        }
    }

    /**
     * 设置全局请求配置选项
     * 
     * @param {RequestCoreOptions} options - 要设置的配置选项
     * @returns {RequestCore} 当前RequestCore实例，支持链式调用
     */
    public setOptions = (options: RequestCoreOptions): RequestCore => {
        this.requestCoreOptions = {
            ...this.requestCoreOptions,
            ...options
        }
        return this
    }
    
    /**
     * RequestCore构造函数
     * 
     * @param {Requester} requester - 底层请求实现实例
     * @param {RequestCoreOptions} [options] - 可选的初始化配置
     */
    constructor(requester: Requester, options?: RequestCoreOptions) {
        this.requester = requester
        if (options) {
            this.setOptions(options)
        }
    }
}


