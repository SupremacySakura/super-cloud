import axios, { AxiosInstance } from "axios"
import { RequestConfig, Response, Requester } from "../../request-core"


export class AxiosRequester implements Requester {
    private axiosInstance: AxiosInstance
    request<T = any>(config: RequestConfig): Promise<Response<T>> {
        return this.axiosInstance.request(config)
    }
    constructor() {
        this.axiosInstance = axios.create()
    }
}