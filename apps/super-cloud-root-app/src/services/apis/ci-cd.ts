import { rootRequest } from "../request";
import type { ApiResponse } from '../../types/api'
import type { AxiosResponse } from 'axios'
import type { Server } from "../../types/server";

const getServer = (): Promise<AxiosResponse<ApiResponse<Server[]>>> => {
    return rootRequest.get('/ci-cd/getServer')
}
// 发送信息
const uploadServer = (serverInfo: Server): Promise<AxiosResponse<ApiResponse<string>>> => {
    return rootRequest.post('/ci-cd/uploadServer', {
        serverInfo
    })
}
export { getServer, uploadServer }