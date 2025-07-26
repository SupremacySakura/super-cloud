import { rootRequest } from "../request";
import type { ApiResponse } from '../../types/api'
import type { Message, Model } from '../../types/ai'
import type { AxiosResponse } from 'axios'

const getModels = (): Promise<AxiosResponse<ApiResponse<Model[]>>> => {
    return rootRequest.get('/ai/models')
}
// 发送信息
const postMessage = (messages: Message[],model:string): Promise<AxiosResponse<ApiResponse<string>>> => {
    return rootRequest.post('/ai/chat', {
        messages,
        model
    })
}
export { getModels, postMessage }