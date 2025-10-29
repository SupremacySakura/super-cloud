/**
 * 上传服务器实现
 * 
 * 实现了ChunkReceiver接口，负责处理文件分片上传的核心逻辑
 */

import { UploadTask } from '../../core'
import { UploadStorage, UploadStorageValue } from '../index'
import { ChunkReceiver } from './interfaces/ChunkReceiver'

/**
 * 上传服务器类
 * 
 * 处理分片接收、文件校验和文件读取等服务器端上传功能
 */
export class UploadServer implements ChunkReceiver {
    /**
     * 文件存储实例
     * 
     * 用于存储和管理上传的文件分片
     */
    private uploadStorage: UploadStorage
    
    /**
     * 构造函数
     * 
     * @param uploadStorage - 上传存储实例，负责实际的文件存储操作
     */
    constructor(uploadStorage: UploadStorage) {
        this.uploadStorage = uploadStorage
    }
    
    /**
     * 表单数据适配器
     * 
     * 将HTTP请求中的FormData转换为标准的UploadTask对象
     * 
     * @param formData - 客户端提交的FormData对象
     * @returns UploadTask - 格式化后的上传任务对象
     */
    propsAdaptor(formData: FormData): UploadTask {
        // 从FormData中提取各个字段
        const fileId = formData.get('fileId') as string
        const index = Number(formData.get('index'))
        const chunk = formData.get('chunk') as File
        const total = Number(formData.get('total') as string)
        const hash = formData.get('hash') as string
        const fileName = formData.get('fileName') as string
        
        // 返回标准化的UploadTask对象
        return {
            fileId,
            index,
            chunk,
            total,
            hash,
            fileName
        }
    }
    
    /**
     * 接收单个分片
     * 
     * 处理并存储上传的文件分片，更新文件元数据信息
     * 
     * @param props - 上传任务信息
     * @returns Promise<{isFinish: boolean, fileId: string}> - 返回处理结果，包含是否完成上传和文件ID
     */
    async receiveChunk(props: UploadTask): Promise<{isFinish: boolean, fileId: string}> {
        // 检查文件是否已存在
        const hasFile = await this.uploadStorage.hasFile(props.fileId)
        
        // 如果文件不存在，创建新的文件元数据
        if (!hasFile) {
            this.uploadStorage.setFile(props.fileId, {
                fileName: props.fileName,
                fileId: props.fileId,
                total: props.total,
                chunks: []
            })
        }
        
        // 添加文件分片到存储
        this.uploadStorage.addFileChunk(props.fileName, props.fileId, { 
            index: props.index, 
            chunk: props.chunk, 
            hash: props.hash 
        })

        // 返回处理结果，判断是否是最后一个分片
        return Promise.resolve({
            isFinish: props.index === props.total - 1,
            fileId: props.fileId
        })
    }
    
    /**
     * 检查文件上传状态
     * 
     * 检查指定文件的分片上传情况，返回尚未上传的分片索引列表
     * 
     * @param fileId - 文件唯一标识符
     * @param total - 文件总分片数
     * @returns Promise<Array<number>> - 返回缺失的分片索引数组
     */
    async checkFile(fileId: string, total: number): Promise<Array<number>> {
        // 检查文件是否存在
        const hasFile = await this.uploadStorage.hasFile(fileId)
        console.log('hasFile:', hasFile)
        
        if (hasFile) {
            // 获取已上传的分片索引
            const uploadedIndexes = (await this.uploadStorage.getFile(fileId)! as UploadStorageValue)
                .chunks.map(chunk => chunk.index)
            const uploaded = new Set(uploadedIndexes)
            
            // 找出缺失的分片索引
            const missingIndexes = Array.from({ length: total }, (_, i) => i)
                .filter(i => !uploaded.has(i))
            return missingIndexes
        }
        
        // 如果文件不存在，所有分片都需要上传
        const result = Array.from({ length: total }, (_, i) => i)
        return result
    }

    /**
     * 通过流读取文件
     * 
     * 根据文件ID获取文件的可读流
     * 
     * @param fileId - 文件唯一标识符
     * @returns Promise<ReadableStream> - 返回文件的可读流
     */
    async readFileByStream(fileId: string): Promise<ReadableStream> {
        return await this.uploadStorage.readFileChunk(fileId)
    }
    
    /**
     * 读取文件名
     * 
     * 根据文件ID获取原始文件名
     * 
     * @param fileId - 文件唯一标识符
     * @returns Promise<string> - 返回文件的原始名称
     */
    async readFileName(fileId: string): Promise<string> {
        return await this.uploadStorage.readFileName(fileId)
    }
}