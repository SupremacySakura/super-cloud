import { ChunkUploader } from "../interfaces"

export interface UploadCoreOptions {
    chunkSize: number  // 分块大小
    concurrency?: number  // 并发数量配置
    onProgress?: (progress: number) => void  // 进度回调
}

export class UploadCore {
    private chunkUploader: ChunkUploader
    private uploadCoreOptions: UploadCoreOptions

    constructor(chunkUploader: ChunkUploader, options: UploadCoreOptions) {
        this.chunkUploader = chunkUploader
        this.uploadCoreOptions = options
    }

    /**
     * 获取文件id
     * @param file 文件
     * @returns 文件id
     */
    private getFileId = (file: File) => {
        return `${file.name}-${file.size}`
    }

    /**
     * 文件分块
     * @param file 文件
     * @returns 分块数组 
     */
    private createChunk = (file: File) => {
        const chunks = []
        let i = 0
        while (i * this.uploadCoreOptions.chunkSize < file.size) {
            chunks.push({
                index: i,
                blob: file.slice(i * this.uploadCoreOptions.chunkSize, (i + 1) * this.uploadCoreOptions.chunkSize)
            })
            i++
        }
        return chunks
    }

    /**
     * 并发执行任务
     * @param tasks 任务数组
     * @param limit 并发数量
     * @returns 
     */
    private runWithConcurrency = async (tasks: (() => Promise<any>)[], limit: number) => {
        let completed = 0
        const total = tasks.length
        const queue = [...tasks]
        const workers = new Array(limit).fill(null).map(async () => {
            while (queue.length) {
                const task = queue.shift()
                if (task) {
                    try {
                        await task()
                    } finally {
                        completed++
                        if (this.uploadCoreOptions.onProgress) {
                            this.uploadCoreOptions.onProgress(Number((completed / total * 100).toFixed(2)))
                        }
                    }
                }
            }
        })
        await Promise.all(workers)
    }

    /**
     * 开始上传
     * @param file 文件
     */
    start = async (file: File) => {
        // 文件分块
        const chunks = this.createChunk(file)
        // 生成任务
        const tasks = chunks.map((chunk) => {
            return () => this.chunkUploader.uploadChunk({
                fileId: this.getFileId(file),
                index: chunk.index,
                chunk: chunk.blob,
                total: chunks.length
            })
        })
        // 检查哪些分块需要上传
        const needUpload = await this.chunkUploader.checkFile(this.getFileId(file), chunks.length)
        // 转为Set提升效率
        const needUploadSet = new Set(needUpload)
        // 筛选出需要执行的任务
        const needDoTasks = tasks.filter((_, index) => needUploadSet.has(index))
        // 上传
        await this.runWithConcurrency(needDoTasks, this.uploadCoreOptions.concurrency || 3)
    }
}