import { ChunkUploader } from "../interfaces"

export interface UploadCoreOptions {
    chunkSize: number
}

export class UploadCore {
    private chunkUploader: ChunkUploader
    private chunkSize: number
    constructor(chunkUploader: ChunkUploader, options: UploadCoreOptions) {
        this.chunkUploader = chunkUploader
        this.chunkSize = options.chunkSize
    }
    start = async (file: File) => {
        const fileId = file.name + Date.now()
        const totalChunks = Math.ceil(file.size / this.chunkSize)
        for (let i = 0; i < totalChunks; i++) {
            const chunk = file.slice(i * this.chunkSize, (i + 1) * this.chunkSize)
            await this.chunkUploader.uploadChunk(fileId, i, chunk, totalChunks)
        }
    }
}