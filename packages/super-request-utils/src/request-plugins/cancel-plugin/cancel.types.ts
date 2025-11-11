/**
 * 取消请求插件类型定义模块
 * 
 * 提供取消请求插件所需的所有类型定义，包括插件配置和请求级取消配置接口
 */

import { RequestConfig } from "../../request-core/types/RequestConfig"

/**
 * 取消请求插件全局配置接口
 * 
 * 用于配置取消请求插件的全局行为
 */
export interface CancelOptions {
    /**
     * 是否自动取消重复请求
     * 
     * 当设置为true时，如果检测到相同key的请求正在进行，会自动取消之前的请求
     * 默认值为false
     */
    autoCancel?: boolean
    
    /**
     * 自定义键生成函数
     * 
     * 允许自定义生成用于标识请求的键的逻辑，传入请求配置，返回唯一的字符串键
     * @param config 请求配置对象
     * @returns 用于标识请求的字符串键
     */
    getKey?: (config: RequestConfig) => string
}

/**
 * 请求级取消配置接口
 * 
 * 可以为单个请求提供特定的取消配置
 */
export interface RequestCancelOptions {
    /**
     * 用于唯一标记这个请求的键
     * 
     * 如果提供，将优先使用此键来标识请求，而不是通过URL和方法生成
     */
    cancelKey?: string
    
    /**
     * 是否开启取消功能
     * 
     * 控制单个请求是否启用取消功能，默认值为true
     */
    enableCancel?: boolean
    
    /**
     * 内部使用的取消控制器
     * 
     * 插件内部使用的AbortController实例，用于实现请求取消功能
     */
    _cancelController?: AbortController
}