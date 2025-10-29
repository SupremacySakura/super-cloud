/**
 * 内部存储实现
 * 
 * 基于文件系统的上传存储实现，处理文件分片的存储和管理
 */

import path from 'path'
import fs from 'fs'
import { UploadStorage, UploadStorageValue } from '../interfaces/UploadStorage'

/**
 * 内部存储类
 * 
 * 使用文件系统实现UploadStorage接口，提供分片存储、复用和文件读取功能
 */
export class InternalStorage implements UploadStorage {
    /**
     * 上传目录路径
     * 
     * 相对于项目根目录的上传文件存储路径
     */
    private uploadDir: string

    /**
     * 构造函数
     * 
     * @param uploadDir - 上传文件存储目录
     */
    constructor(uploadDir: string) {
        this.uploadDir = uploadDir
    }

    /**
     * 获取分片存储目录
     * 
     * 返回所有分片文件的存储目录路径
     * 
     * @returns string - 分片目录的绝对路径
     */
    private getChunkDir = (): string => {
        return path.join(process.cwd(), this.uploadDir, 'chunks')
    }

    /**
     * 获取文件目录
     * 
     * 返回特定文件的元数据目录路径
     * 
     * @param fileId - 文件唯一标识符
     * @returns string - 文件目录的绝对路径
     */
    private getFileDir = (fileId: string): string => {
        return path.join(process.cwd(), this.uploadDir, fileId)
    }

    /**
     * 获取元数据文件路径
     * 
     * 返回特定文件的元数据JSON文件路径
     * 
     * @param fileId - 文件唯一标识符
     * @returns string - 元数据文件的绝对路径
     */
    private getMetaPath = (fileId: string): string => {
        return path.join(this.getFileDir(fileId), 'meta.json')
    }

    /**
     * 读取元信息
     * 
     * 从文件系统读取文件的元数据信息
     * 
     * @param fileId - 文件唯一标识符
     * @returns UploadStorageValue | undefined - 返回元数据对象或undefined（如果文件不存在）
     */
    private loadMeta = (fileId: string): UploadStorageValue | undefined => {
        const metaPath = this.getMetaPath(fileId)
        if (!fs.existsSync(metaPath)) return undefined
        return JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
    }

    /**
     * 保存元信息
     * 
     * 将文件的元数据信息写入文件系统
     * 
     * @param fileId - 文件唯一标识符
     * @param data - 要保存的元数据信息
     */
    private saveMeta = (fileId: string, data: UploadStorageValue): void => {
        const dir = this.getFileDir(fileId)
        // 确保目录存在
        fs.mkdirSync(dir, { recursive: true })
        // 写入元数据文件
        fs.writeFileSync(this.getMetaPath(fileId), JSON.stringify(data))
    }

    /**
     * 检查文件是否存在
     * 
     * 通过检查元数据文件是否存在来判断文件是否已上传
     * 
     * @param fileId - 文件唯一标识符
     * @returns Promise<boolean> - 返回文件是否存在
     */
    hasFile = async (fileId: string): Promise<boolean> => {
        return fs.existsSync(this.getMetaPath(fileId))
    }

    /**
     * 设置文件元数据
     * 
     * 保存或更新文件的元数据信息
     * 
     * @param fileId - 文件唯一标识符
     * @param value - 元数据信息
     * @returns Promise<void>
     */
    setFile = async (fileId: string, value: UploadStorageValue): Promise<void> => {
        this.saveMeta(fileId, value)
    }

    /**
     * 获取文件元数据
     * 
     * 读取并返回文件的元数据信息
     * 
     * @param fileId - 文件唯一标识符
     * @returns Promise<UploadStorageValue | undefined> - 返回元数据对象或undefined
     */
    getFile = async (fileId: string): Promise<UploadStorageValue | undefined> => {
        return this.loadMeta(fileId)
    }

    /**
     * 添加文件分片
     * 
     * 保存文件分片并更新元数据，支持分片复用
     * 
     * @param fileName - 文件名称
     * @param fileId - 文件唯一标识符
     * @param chunk - 分片数据，包含索引、内容和哈希值
     * @returns Promise<void>
     */
    addFileChunk = async (fileName: string, fileId: string, chunk: { index: number; chunk: Blob; hash: string }): Promise<void> => {
        // 验证分片哈希值是否存在
        if (!chunk.hash) {
            throw new Error(`Missing hash for chunk index=${chunk.index}`)
        }

        // 1. 写入分片文件，使用哈希值作为文件名以实现分片复用
        const chunksDir = this.getChunkDir()
        fs.mkdirSync(chunksDir, { recursive: true })
        const chunkFilePath = path.join(chunksDir, chunk.hash)

        // 如果分片文件不存在，才进行写入，避免重复写入
        if (!fs.existsSync(chunkFilePath)) {
            const buffer = Buffer.from(await chunk.chunk.arrayBuffer())
            fs.writeFileSync(chunkFilePath, buffer)
        }

        // 2. 更新文件元数据，记录分片信息
        const meta = this.loadMeta(fileId) || { fileName, fileId, total: 0, chunks: [] }

        // 如果是新分片，添加到元数据中
        if (!meta.chunks.some(c => c.index === chunk.index)) {
            meta.chunks.push({ index: chunk.index, hash: chunk.hash })
            this.saveMeta(fileId, meta)
        }
    }

    /**
     * 读取文件流
     * 
     * 根据文件ID创建并返回一个可读流，用于读取完整文件内容
     * 
     * @param fileId - 文件唯一标识符
     * @returns Promise<ReadableStream> - 返回文件的可读流
     */
    readFileChunk = async (fileId: string): Promise<ReadableStream> => {
        // 获取文件元数据
        const meta = this.loadMeta(fileId)
        if (!meta) {
            return new ReadableStream() // 返回空流
        }

        const chunkDir = this.getChunkDir()
        // 按索引排序分片
        const chunksSorted = meta.chunks.slice().sort((a, b) => a.index - b.index)

        // 创建可读流，按顺序读取并推送所有分片
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for (const chunk of chunksSorted) {
                        const data = await fs.promises.readFile(path.join(chunkDir, chunk.hash))
                        controller.enqueue(data) // 推入流
                    }
                    controller.close() // 完成所有分片的读取
                } catch (err) {
                    controller.error(err) // 处理错误
                }
            }
        })

        return stream
    }

    /**
     * 读取文件名
     * 
     * 根据文件ID获取文件的原始名称
     * 
     * @param fileId - 文件唯一标识符
     * @returns Promise<string> - 返回文件的原始名称
     */
    readFileName = async (fileId: string): Promise<string> => {
        const meta = this.loadMeta(fileId)
        if (!meta) {
            return 'not found'
        }
        return meta.fileName
    }
}
