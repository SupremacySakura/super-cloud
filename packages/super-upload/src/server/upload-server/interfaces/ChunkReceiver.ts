/**
 * 分片接收器接口
 * 
 * 定义接收和处理文件分片的抽象接口，由UploadServer实现
 */

import type { UploadTask } from '../../../core'

/**
 * 分片接收器接口
 * 
 * 定义了处理文件分片上传的核心方法，包括分片接收、文件检查和文件读取功能
 */
export interface ChunkReceiver {
    /**
     * 表单数据适配器
     * 
     * 将FormData格式的数据转换为标准的UploadTask格式
     * 
     * @param formdata - 客户端提交的FormData对象
     * @returns UploadTask - 转换后的上传任务对象
     */
    propsAdaptor(formdata: FormData): UploadTask
    
    /**
     * 接收单个分片
     * 
     * 处理并存储上传的文件分片，更新文件元数据
     * 
     * @param props - 上传任务信息，包含文件ID、分片索引、分片内容等
     * @returns Promise<any> - 返回处理结果，包含是否完成和文件ID等信息
     */
    receiveChunk(props: UploadTask): Promise<any>

    /**
     * 检查还有多少片段未上传
     * 
     * 根据文件ID和总分片数，返回尚未上传的分片索引列表
     * 
     * @param fileId - 文件唯一标识符
     * @param total - 文件总分片数
     * @returns Promise<Array<number>> - 返回缺失的分片索引数组
     */
    checkFile(fileId: string, total: number): Promise<Array<number>>

    /**
     * 通过流的方式读取文件
     * 
     * 根据文件ID读取已上传完成的文件，以流的形式返回
     * 
     * @param fileId - 文件唯一标识符
     * @returns Promise<ReadableStream> - 返回文件的可读流
     */
    readFileByStream(fileId: string): Promise<ReadableStream>

    /**
     * 读取文件名
     * 
     * 根据文件ID获取原始文件名
     * 
     * @param fileId - 文件唯一标识符
     * @returns Promise<string> - 返回文件的原始名称
     */
    readFileName(fileId: string): Promise<string>
}