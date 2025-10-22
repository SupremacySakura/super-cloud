import { RequestPlugin } from "../../request-core/interfaces"
import { RequestConfig, Response, } from "../../request-core/types"

/**
 * 创建模版插件
 * @param 
 * @returns 模板插件
 */
export const useTemplatePlugin = (): RequestPlugin<undefined> => {
    return {
        name: 'template-plugin',
        beforeRequest<T>(config: RequestConfig) {

            return config
        },
        afterResponse(response: Response) {

            return response
        },
        onError(error: any) {
            
            return error
        },
        result: void 0
    }
}