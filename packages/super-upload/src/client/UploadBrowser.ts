/**
 * 文件上传客户端 - 浏览器实现模块
 * 
 * 提供浏览器环境下的文件上传功能，支持分片上传、断点续传、文件检查等操作
 */

import { UploadCore, UploadTask } from "../core"

/**
 * 上传浏览器配置选项接口
 * 
 * 定义UploadBrowser类所需的各种API端点配置
 */
export interface UploadBrowserOptions {
    /**
     * 分片上传接口地址
     * 
     * 用于向服务器上传单个文件分片的HTTP接口
     */
    uploadUrl: string
    
    /**
     * 文件检查接口地址
     * 
     * 用于检查文件是否已上传过及获取已上传分片信息的接口
     */
    checkFileUrl: string
    
    /**
     * 文件读取接口地址
     * 
     * 用于通过fileId获取完整文件内容的接口
     */
    readFileUrl: string
    
    /**
     * 文件名读取接口地址
     * 
     * 用于通过fileId获取文件名的接口
     */
    readFileNameUrl: string
}

/**
 * 浏览器环境文件上传实现类
 * 
 * 提供基于浏览器环境的文件上传功能，包括分片上传、断点续传等能力
 */
export class UploadBrowser {
    /**
     * 上传配置选项
     * 
     * 存储UploadBrowserOptions配置对象，包含所有API端点地址
     */
    private uplpadBrowserOptions: UploadBrowserOptions
    
    /**
     * 上传核心实例
     * 
     * 用于处理文件分片、任务管理等核心功能的UploadCore实例
     */
    private core: UploadCore
    
    /**
     * 构造函数
     * 
     * @param core - UploadCore实例，处理文件分片和任务管理
     * @param options - 浏览器上传配置选项
     */
    constructor(core: UploadCore, options: UploadBrowserOptions) {
        this.core = core
        this.uplpadBrowserOptions = options
    }
    
    /**
     * 上传单个分片
     * 
     * 将单个文件分片上传到服务器，构建FormData并发送POST请求
     * 
     * @param tasks - 待上传的分片任务对象
     * @returns Promise<any> - 服务器返回的响应数据
     * @throws Error - 当分片上传失败时抛出错误
     */
    uploadChunk = async (tasks: UploadTask) => {
        const form = new FormData()
        form.append('fileId', tasks.fileId)
        form.append('index', tasks.index.toString())
        form.append('chunk', tasks.chunk)
        form.append('total', tasks.total.toString())
        form.append('hash', tasks.hash)
        form.append('fileName', tasks.fileName)
        
        const res = await fetch(this.uplpadBrowserOptions.uploadUrl, { 
            method: 'POST', 
            body: form 
        })
        
        if (!res.ok) {
            throw new Error(`Chunk ${tasks.index} upload failed`)
        }
        
        return await res.json()
    }

    /**
     * 开始上传文件
     * 
     * 对指定文件进行分片处理，检查已上传分片，然后上传未完成的分片
     * 
     * @param file - 待上传的File对象
     * @returns Promise<any> - 上传完成后的结果
     */
    start = async (file: File) => {
        // 创建上传任务
        const tasks = await this.core.creatTasks(file)
        
        // 检查文件已上传分片
        const needUpload = await this.checkFile(tasks[0].fileId, tasks[0].total)
        const needUploadSet = new Set(needUpload)
        
        // 过滤出需要上传的分片
        const needUploadTasks = tasks.filter((item) => needUploadSet.has(item.index))
        
        // 执行上传
        const res = await this.core.runWithUploader(file, needUploadTasks, this.uploadChunk)
        return res
    }

    /**
     * 暂停上传
     * 
     * 暂停当前正在进行的上传任务
     */
    pause = async () => {
        this.core.pause()
    }

    /**
     * 恢复上传
     * 
     * 恢复之前暂停的上传任务，继续上传剩余分片
     * 
     * @param file - 要继续上传的File对象
     */
    resume = async (file: File) => {
        this.core.resume(file, this.uploadChunk)
    }
    
    /**
     * 检查文件上传状态
     * 
     * 查询服务器以获取文件已上传的分片索引列表
     * 
     * @param fileId - 文件唯一标识符
     * @param total - 文件总分片数量
     * @returns Promise<Array<number>> - 已上传分片的索引数组
     * @throws Error - 当检查失败时抛出错误
     */
    checkFile = async (fileId: string, total: number): Promise<Array<number>> => {
        const res = await fetch(`${this.uplpadBrowserOptions.checkFileUrl}?fileId=${fileId}&total=${total}`, {
            method: 'GET',
        })
        
        if (!res.ok) {
            throw new Error('文件检查失败')
        }
        
        return await res.json()
    }

    /**
     * 通过流方式读取文件
     * 
     * 根据fileId从服务器获取完整文件内容
     * 
     * @param fileId - 文件唯一标识符
     * @returns Promise<Blob> - 文件的Blob对象
     */
    readFileByStream = async (fileId: string) => {
        // 获取文件
        const res = await fetch(`${this.uplpadBrowserOptions.readFileUrl}?fileId=${encodeURIComponent(fileId)}`)
        const blob = await res.blob()

        return blob
    }

    /**
     * 获取文件名
     * 
     * 根据fileId从服务器获取对应的文件名
     * 
     * @param fileId - 文件唯一标识符
     * @returns Promise<any> - 服务器返回的文件名数据
     */
    readFileName = async (fileId: string) => {
        // 获取文件名
        const resName = await fetch(`${this.uplpadBrowserOptions.readFileNameUrl}?fileId=${encodeURIComponent(fileId)}`)
        const name = await resName.json()
        return name
    }
}