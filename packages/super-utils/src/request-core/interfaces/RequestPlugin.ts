import { RequestConfig, RequestError, Response } from "../types"

/**
 * 请求插件接口，用于扩展请求库的功能
 * 
 * 插件系统是请求库的核心扩展机制，通过实现此接口可以在请求生命周期的不同阶段（请求前、响应后、错误处理）注入自定义逻辑。
 * 支持功能包括但不限于：请求拦截、响应转换、错误处理、缓存控制、重试机制等。
 * 
 * @template K - 插件自定义结果的类型参数，默认为any
 */
export interface RequestPlugin<K = any> {
    /**
     * 插件名称
     * 
     * 用于标识插件，建议使用唯一名称以便调试和日志记录
     */
    name: string
    
    /**
     * 请求发送前的钩子函数
     * 
     * 在请求发送前被调用，可以修改请求配置或实现短路逻辑（直接返回响应）
     * 
     * @template T - 响应数据的类型参数
     * @param {RequestConfig} config - 原始请求配置对象
     * @returns {Promise<RequestConfig|Response<T>>|RequestConfig|Response<T>} 返回修改后的配置或响应对象（实现短路逻辑）
     */
    beforeRequest?: <T>(config: RequestConfig) => Promise<RequestConfig> | RequestConfig | Promise<Response<T>> | Response<T>
    
    /**
     * 响应返回后的钩子函数
     * 
     * 在请求成功后被调用，可以修改响应数据或进行后处理
     * 
     * @template T - 响应数据的类型参数
     * @param {Response} response - 原始响应对象
     * @returns {Promise<Response<T>>|Response<T>} 返回修改后的响应对象
     */
    afterResponse?: <T>(response: Response) => Promise<Response<T>> | Response<T>
    
    /**
     * 错误处理钩子函数
     * 
     * 在请求失败时被调用，可以实现错误处理、转换或恢复逻辑
     * 
     * @param {RequestError} error - 请求错误对象
     * @returns {Promise<any>|any} 返回处理后的错误对象或包含response字段的对象（表示错误已被处理）
     */
    onError?: (error: RequestError) => Promise<any> | any
    
    /**
     * 插件自定义返回值
     * 
     * 插件可以通过此属性存储和传递自定义数据，类型由泛型K指定
     */
    result: K
}