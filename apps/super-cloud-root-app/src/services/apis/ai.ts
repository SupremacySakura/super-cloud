import { rootRequest } from "../request";
import type { ApiResponse } from '../../types/api'
import type { Message, Model } from '../../types/ai'
import type { AxiosResponse } from 'axios'
import { storeToRefs } from 'pinia'
import { useUserStore } from "../../stores/user";
const getModels = (): Promise<AxiosResponse<ApiResponse<Model[]>>> => {
    return rootRequest.get('/ai/models')
}
// 发送信息
const postMessage = async (messages: Message[], model: string, onData: (data: string) => void) => {
    const { sid } = storeToRefs(useUserStore())
    const response = await fetch(`${import.meta.env.MYAPP_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sid.value || ''}`
        },
        body: JSON.stringify({ messages, model })
    })
    const reader = response.body?.getReader()
    if (!reader) {
        return
    }
    const decoder = new TextDecoder('utf-8')
    while (true) {
        const { value, done } = await reader.read()
        if (done) {
            break
        }
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n\n') // SSE 每条事件以空行分隔
        for (const line of lines) {
            const data = line.replace(/^data: /, '').trim()
            if (data !== '[DONE]') {
                onData(data)
            }
        }
    }
}
const getHistory = (): Promise<AxiosResponse<ApiResponse<Message[]>>> => {
    return rootRequest.get('/ai/history')
}
export { getModels, postMessage, getHistory }