import axios, { AxiosInstance } from 'axios'
import { RequestConfig, Response, Requester } from '../../request-core'


export class AxiosRequester implements Requester {
    private axiosInstance: AxiosInstance
    request<T = any>(config: RequestConfig): Promise<Response<T>> {
        return this.axiosInstance.request(config)
    }
    get<T = any>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<Response<T>> {
        return this.axiosInstance.get(url, config)
    }
    post<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<Response<T>> {
        return this.axiosInstance.post(url, data, config)
    }
    put<T = any>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<Response<T>> {
        return this.axiosInstance.put(url, data, config)
    }
    delete<T = any>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<Response<T>> {
        return this.axiosInstance.delete(url, config)
    }
    constructor() {
        this.axiosInstance = axios.create()
    }
}