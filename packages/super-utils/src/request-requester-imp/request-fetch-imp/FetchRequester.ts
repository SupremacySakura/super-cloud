import { RequestConfig, Response, Requester } from "../../request-core"

export class FetchRequester implements Requester {
    async request<T = any>(config: RequestConfig): Promise<Response<T>> {
        // 请求超时设置
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), config.timeout || 60 * 1000)

        try {
            const res = await fetch(config.url, {
                method: config.method,
                headers: config.headers,
                body: JSON.stringify(config.data),
                signal: controller.signal
            })

            clearTimeout(timeoutId)

            if (!res.ok) {
                throw {
                    message: `请求失败:${res.status}, ${res.statusText}`,
                    status: res.status,
                    config
                }
            }
            let data: any
            const contentType = res.headers.get("content-type")

            if (contentType?.includes("application/json")) {
                data = await res.json()
            } else if (contentType?.includes("text/")) {
                data = await res.text()
            } else if (contentType?.includes("application/octet-stream")) {
                data = await res.arrayBuffer()
            } else {
                // 默认尝试 text，不强行 JSON，避免异常
                data = await res.text()
            }

            // fetch 本身失败会抛出错误，不需要处理，直接交给上层 catch
            const headers: Record<string, string> = {}
            res.headers.forEach((value, key) => {
                headers[key] = value
            })

            return {
                data,
                status: res.status,
                statusText: res.statusText,
                headers,
                config
            }
        } catch (error) {
            throw error
        }

    }
    constructor() {

    }
}
