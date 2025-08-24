import { rootRequest } from "../request";
import type { ApiResponse } from '../../types/api'
import type { AxiosResponse } from 'axios'
import type { Server } from "../../types/server";
import type { DeploymentConfig, NginxConfig, Project } from "../../types/project";
// 获取服务器信息
const getServer = (): Promise<AxiosResponse<ApiResponse<Server[]>>> => {
    return rootRequest.get('/ci-cd/getServer')
}
// 新增服务器
const uploadServer = (serverInfo: Server): Promise<AxiosResponse<ApiResponse<string>>> => {
    return rootRequest.post('/ci-cd/uploadServer', {
        serverInfo
    })
}
// 连接服务器
const connectServer = (serverInfo: Server, model: 'password' | 'privateKey'): Promise<AxiosResponse<ApiResponse<string>>> => {
    return rootRequest.post('/ci-cd/connectServer', {
        serverInfo,
        model
    })
}
// 更新服务器信息
const updateServer = (serverInfo: Server): Promise<AxiosResponse<ApiResponse<string>>> => {
    return rootRequest.post('/ci-cd/updateServer', {
        serverInfo
    })
}

// 获取项目列表
const getProjects = (): Promise<AxiosResponse<ApiResponse<Project[]>>> => {
    return rootRequest.get('/ci-cd/getProjects')
}

// 上传/创建项目
const uploadProject = (projectInfo: Project, deploymentConfig: Partial<DeploymentConfig>, nginxConfig: Partial<NginxConfig>): Promise<AxiosResponse<ApiResponse<{ projectId: string }>>> => {
    return rootRequest.post('/ci-cd/uploadProject', {
        projectInfo,
        deploymentConfig,
        nginxConfig
    })
}

//
export { getServer, uploadServer, connectServer, updateServer, getProjects, uploadProject }
