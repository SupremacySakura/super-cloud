/**
 * 上传核心模块
 * 
 * 提供文件上传的核心功能，包括文件分片、任务创建、并发控制、暂停/恢复等功能
 */

import { createChunks } from './utils/file'
import { calcChunkHash } from './utils/hash'
import { runWithConcurrency } from './utils/concurrency'
import { UploadCoreOptions, UploadTask } from './types'

/**
 * 上传核心类
 * 
 * 负责文件分片、任务管理、并发控制和上传状态管理的核心实现
 */
export class UploadCore {
    /**
     * 核心配置选项
     * 
     * 存储UploadCoreOptions配置，包含chunkSize、concurrency、onProgress等配置项
     */
    private options: UploadCoreOptions
    
    /**
     * 暂停标记
     * 
     * 用于控制上传任务的暂停和恢复状态
     */
    private pauseFlag = { paused: false }
    
    /**
     * 待完成任务列表
     * 
     * 存储上一次执行时待完成的任务包装函数，用于恢复上传时使用
     */
    private pendingTaskWrappers: (() => Promise<void>)[] = []
    
    /**
     * 构造函数
     * 
     * @param options - 上传核心配置选项
     */
    constructor(options: UploadCoreOptions) {
        this.options = options
    }

    /**
     * 获取文件唯一标识符
     * 
     * 根据文件名和大小生成文件的唯一标识符
     * 
     * @param file - 待上传的File对象
     * @returns string - 文件唯一标识符，格式为"文件名-文件大小"
     */
    getFileId = (file: File) => {
        return `${file.name}-${file.size}`
    }
    
    /**
     * 创建上传任务
     * 
     * 将文件分割成多个分片，计算每个分片的哈希值，并生成上传任务列表
     * 
     * @param file - 待上传的File对象
     * @returns Promise<UploadTask[]> - 生成的上传任务数组
     */
    creatTasks = async (file: File): Promise<UploadTask[]> => {
        // 文件分块
        const chunks = createChunks(file, this.options.chunkSize)
        
        // 计算每个分片的哈希值
        const chunkHashes = await Promise.all(
            chunks.map(chunk => calcChunkHash(chunk.blob))
        )
        
        // 生成任务
        const tasks = chunks.map((chunk, index) => {
            return {
                fileName: file.name,
                fileId: this.getFileId(file),
                index: chunk.index,
                chunk: chunk.blob,
                total: chunks.length,
                hash: chunkHashes[index]
            }
        })
        
        return tasks
    }

    /**
     * 执行上传任务
     * 
     * 使用指定的上传函数，以并发方式执行上传任务，并支持进度回调和暂停功能
     * 
     * @param file - 待上传的File对象
     * @param tasks - 要执行的上传任务数组
     * @param uploaderFn - 上传函数，负责单个分片的上传逻辑
     * @returns Promise<{fileId: string, success: number, failed: number, total: number}> - 上传结果对象
     */
    runWithUploader = async (
        file: File, 
        tasks: UploadTask[], 
        uploaderFn: (task: UploadTask) => Promise<any>
    ): Promise<{fileId: string, success: number, failed: number, total: number}> => {
        // 重置暂停状态
        this.pauseFlag.paused = false
        let total = tasks.length

        // 如果提供了新任务，创建任务包装函数
        if (tasks.length) {
            this.pendingTaskWrappers = tasks.map(task => {
                return async () => {
                    await uploaderFn(task)
                }
            })
        }
        
        // 获取并发数，默认为3
        const concurrency = this.options.concurrency ?? 3
        
        // 执行并发任务
        const { success, failed } = await runWithConcurrency(
            this.pendingTaskWrappers, 
            concurrency, 
            (p) => {
                // 调用进度回调
                this.options.onProgress?.(p)
            }, 
            this.pauseFlag
        )

        // 返回上传结果
        return {
            fileId: this.getFileId(file),
            success,
            failed,
            total
        }
    }

    /**
     * 暂停上传
     * 
     * 将暂停标记设置为true，使正在执行的并发任务能够响应暂停操作
     */
    pause = () => {
        this.pauseFlag.paused = true
    }

    /**
     * 恢复上传
     * 
     * 重置暂停状态，并重新执行之前未完成的任务
     * 
     * @param file - 要继续上传的File对象
     * @param uploaderFn - 上传函数，负责单个分片的上传逻辑
     * @returns Promise<{fileId: string, success: number, failed: number, total: number}> - 上传结果对象
     */
    resume = async (
        file: File, 
        uploaderFn: (task: UploadTask) => Promise<any>
    ): Promise<{fileId: string, success: number, failed: number, total: number}> => {
        // 检查是否有待恢复的任务
        if (!this.pendingTaskWrappers.length) {
            console.warn('没有需要继续的任务')
            return { fileId: this.getFileId(file), success: 0, failed: 0, total: 0 }
        }
        
        // 重置暂停状态
        this.pauseFlag.paused = false
        
        // 重启workers来继续处理pendingTaskWrappers
        // 注意：传入的tasks参数为空，这里runWithUploader会基于现有pendingTaskWrappers重新执行
        return this.runWithUploader(file, [], uploaderFn)
    }
}