/**
 * @module 请求插件接口
 * 
 * 本模块定义了请求库的插件系统核心接口，为整个请求系统提供了可扩展的机制。
 * 通过实现此接口，开发者可以在HTTP请求的不同生命周期阶段注入自定义逻辑，
 * 从而实现请求拦截、响应转换、错误处理、缓存控制、重试机制等功能扩展。
 */

import { RequestCore } from "../core/RequestCore"
import { RequestConfig, RequestError, Response } from "../types"

/**
 * 请求插件接口，用于扩展请求库的功能
 * 
 * 插件系统是请求库的核心扩展机制，通过实现此接口可以在请求生命周期的不同阶段（请求前、响应后、错误处理）注入自定义逻辑。
 * 支持功能包括但不限于：请求拦截、响应转换、错误处理、缓存控制、重试机制等。
 * 多个插件会按照注册顺序执行，形成一个完整的请求处理管道。
 * 
 * @template EC - 扩展的请求配置类型，必须继承自RequestConfig，用于支持特定插件的自定义配置项
 * @template R - 插件自定义结果的类型参数，用于存储和传递插件执行过程中的自定义数据
 */
export interface RequestPlugin<EC extends RequestConfig = RequestConfig, R = any> {
    /**
     * 插件名称
     * 
     * 用于唯一标识插件实例，建议使用Symbol类型以确保全局唯一性，便于调试和日志记录
     */
    name: Symbol

    /**
     * 请求发送前的钩子函数
     * 
     * 在请求发送前被调用，多个插件的beforeRequest按注册顺序执行。
     * 可以修改请求配置（如添加认证头、转换请求数据等）或实现短路逻辑（直接返回响应对象）。
     * 
     * @template T - 响应数据的类型参数
     * @param {EC} config - 当前插件可用的请求配置对象，包含URL、方法、请求头等信息
     * @param {RequestCore<any>} requestInstance - RequestCore实例的引用，可用于访问请求核心功能
     * @returns {Promise<EC>|EC|Promise<Response<T, EC>>|Response<T, EC>} 返回修改后的配置或响应对象（实现短路逻辑）
     */
    beforeRequest?: <T>(config: EC, requestInstance: RequestCore<any>) => Promise<EC> | EC | Promise<Response<T, EC>> | Response<T, EC>

    /**
     * 响应返回后的钩子函数
     * 
     * 在请求成功后被调用，多个插件的afterResponse按注册的**倒序**执行。
     * 可以修改响应数据（如数据转换、格式标准化等）或进行后处理（如日志记录、缓存更新等）。
     * 
     * @template T - 响应数据的类型参数
     * @param {Response<T, EC>} response - 当前的响应对象，包含响应数据、状态码、响应头等信息
     * @param {RequestCore<any>} requestInstance - RequestCore实例的引用，可用于访问请求核心功能
     * @returns {Promise<Response<T, EC>>|Response<T, EC>} 返回修改后的响应对象
     */
    afterResponse?: <T>(response: Response<T, EC>, requestInstance: RequestCore<any>) => Promise<Response<T, EC>> | Response<T, EC>

    /**
     * 错误处理钩子函数
     * 
     * 在请求失败时被调用，多个插件的onError按注册的**倒序**执行。
     * 可以实现错误处理（如错误日志记录）、转换（如统一错误格式）或恢复逻辑（如添加默认值）。
     * 如果返回的错误对象包含response字段，则表示错误已被处理，请求将被视为成功。
     * 
     * @template T - 可能的响应数据类型，用于在错误处理中提供恢复的数据
     * @param {RequestError<T, EC>} error - 请求错误对象，包含错误信息、请求配置等
     * @param {RequestCore<EC>} requestInstance - RequestCore实例的引用，可用于访问请求核心功能
     * @returns {Promise<RequestError<T, EC>>|RequestError<T, EC>} 返回处理后的错误对象，或包含response字段的对象表示错误已被处理
     */
    onError?: <T>(error: RequestError<T, EC>, requestInstance: RequestCore<EC>) => Promise<RequestError<T, EC>> | RequestError<T, EC>

    /**
     * 插件自定义返回值
     * 
     * 插件可以通过此属性存储和传递自定义数据，类型由泛型R指定。
     * 该属性可用于在插件内部或其他插件之间共享状态或结果。
     */
    result: R
}