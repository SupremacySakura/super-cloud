import { resourceStorageRequest } from "../request";
import type { ApiResponse } from '../../types/api'
import type { FileItem, ImageItem } from '../../types/files'
import type { AxiosResponse } from 'axios'
// 获取所有文件
const getAllFiles = (username: string): Promise<AxiosResponse<ApiResponse<FileItem[]>>> => {
    return resourceStorageRequest.get('/file', {
        params: {
            username
        }
    })
}
// 获取文件内容
const getFileContent = (filePath: string): Promise<AxiosResponse<ApiResponse<string>>> => {
    return resourceStorageRequest.get(`/file/read`, {
        params: {
            filePath
        }
    })
}
// 上传文件（formData 传入 File 对象和 filePath）
const uploadFile = (
    file: File,
    targetPath: string
): Promise<AxiosResponse<ApiResponse<string>>> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('targetPath', targetPath)

    return resourceStorageRequest.post('/file/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}
// 获取所有图片资源
const getAllImages = (): Promise<AxiosResponse<ApiResponse<ImageItem[]>>> => {
    return resourceStorageRequest.get(
        '/file/images'
    )
}

export { getAllFiles, getFileContent, uploadFile, getAllImages }