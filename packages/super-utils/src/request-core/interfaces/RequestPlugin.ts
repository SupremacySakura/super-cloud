import { RequestConfig, Response } from "../types"

export interface RequestPlugin {
    beforeRequest?: <T>(config: RequestConfig) => Promise<RequestConfig> | RequestConfig | Promise<Response<T>> | Response<T>
    afterResponse?: <T>(response: Response) => Promise<Response<T>> | Response<T>
    onError?: (error: any) => Promise<any> | any
}