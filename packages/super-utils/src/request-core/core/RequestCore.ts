import { Requester, RequestPlugin } from "../interfaces"
import { RequestConfig, Response } from "../types"
import { isResponse } from '../utils'
export class RequestCore {
    private requester: Requester
    private requestPlugins: RequestPlugin[] = []
    /**
     * 插件注册
     * @param plugin 插件
     */
    use = (plugin: RequestPlugin) => {
        this.requestPlugins.push(plugin)
    }

    request = async <T = any>(config: RequestConfig): Promise<Response<T>> => {
        try {
            // 1.执行所有 beforeRequest
            for (const plugin of this.requestPlugins) {
                if (plugin.beforeRequest) {
                    let result = await plugin.beforeRequest<T>(config)
                    console.log(isResponse(result))
                    if (isResponse(result)) {
                        // 短路
                        for (const plugin of this.requestPlugins) {
                            if (plugin.afterResponse) {
                                result = await plugin.afterResponse(result as Response)
                            }
                        }
                        return Promise.resolve(result as Response)
                    }
                    config = result as RequestConfig
                }
            }
            // 2.发送请求
            let response = await this.requester.request<T>(config)

            // 3.执行所有 afterRequest
            for (const plugin of this.requestPlugins) {
                if (plugin.afterResponse) {
                    response = await plugin.afterResponse(response)
                }
            }
            return Promise.resolve(response)
        } catch (error) {
            let currentError = error
            // 4. 全局错误处理拦截
            for (const plugin of this.requestPlugins) {
                if (plugin.onError) {
                    currentError = await plugin.onError(error)
                }
            }
            // 5.如果没有吸收 error 则抛出
            return Promise.reject(currentError)
        }
    }


    constructor(requester: Requester) {
        this.requester = requester
    }
}


