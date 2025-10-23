/**
 * Axios请求实现模块
 * 
 * 提供基于Axios库的HTTP请求实现，遵循Requester接口规范，
 * 负责具体的网络请求发送和响应处理
 */

import axios, { AxiosInstance } from "axios"
import { RequestConfig, Response, Requester } from "../../request-core"

/**
 * Axios请求实现类
 * 
 * 使用Axios库实现Requester接口，提供统一的HTTP请求能力
 */
export class AxiosRequester implements Requester {
    /**
     * Axios实例
     * 
     * 用于发送HTTP请求的Axios核心实例，配置了默认的请求行为
     */
    private axiosInstance: AxiosInstance
    
    /**
     * 发送HTTP请求
     * 
     * 执行HTTP请求并返回响应结果，遵循统一的请求配置格式
     * 
     * @template T - 响应数据的类型参数，默认为any
     * @param config - 请求配置对象，包含URL、方法、头部、数据等信息
     * @returns Promise<Response<T>> - 包含响应数据、状态码、头部等信息的Promise对象
     */
    request<T = any>(config: RequestConfig): Promise<Response<T>> {
        return this.axiosInstance.request(config)
    }
    
    /**
     * 构造函数
     * 
     * 创建并初始化AxiosRequester实例，配置默认的Axios实例
     */
    constructor() {
        // 创建默认配置的Axios实例
        this.axiosInstance = axios.create()
    }
}