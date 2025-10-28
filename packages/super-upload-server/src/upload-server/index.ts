import { ChunkReceiver } from "@yxzq-super-cloud/super-upload-core"
import { UploadStorage, UploadStorageValue } from "../index"

export class UploadServer implements ChunkReceiver {
    private uploadStorage: UploadStorage
    constructor(uploadStorage: UploadStorage) {
        this.uploadStorage = uploadStorage
    }
    async receiveChunk(fileId: string, index: number, chunk: Blob, total: number): Promise<any> {
        const hasFile = await this.uploadStorage.hasFile(fileId)
        if (!hasFile) {
            this.uploadStorage.setFile(fileId, {
                total,
                chunks: []
            })
        }
        this.uploadStorage.addFileChunk(fileId, { index, chunk })

        return Promise.resolve({
            isFinish: index === total - 1,
            fileId
        })
    }
    async checkFile(fileId: string, total: number): Promise<Array<number>> {
        const hasFile = await this.uploadStorage.hasFile(fileId)
        if (hasFile) {
            const uploadedIndexes = (await this.uploadStorage.getFile(fileId)! as UploadStorageValue).chunks.map(chunk => chunk.index)
            const uploaded = new Set(uploadedIndexes)
            const missingIndexes = Array.from({ length: total }, (_, i) => i)
                .filter(i => !uploaded.has(i))
            return missingIndexes
        }
        const result = Array.from({ length: total }, (_, i) => i)
        return result
    }
}