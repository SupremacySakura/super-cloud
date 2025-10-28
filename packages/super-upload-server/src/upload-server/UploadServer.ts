import { ChunkUploadProps } from '@yxzq-super-cloud/super-upload-core'
import { UploadStorage, UploadStorageValue } from '../index'
import { ChunkReceiver } from './interfaces/ChunkReceiver'

export class UploadServer implements ChunkReceiver {
    private uploadStorage: UploadStorage
    constructor(uploadStorage: UploadStorage) {
        this.uploadStorage = uploadStorage
    }
    propsAdaptor(formData: FormData): ChunkUploadProps {
        const fileId = formData.get('fileId') as string
        const index = Number(formData.get('index'))
        const chunk = formData.get('chunk') as File
        const total = Number(formData.get('total') as string)
        const hash = formData.get('hash') as string
        const fileName = formData.get('fileName') as string
        return {
            fileId,
            index,
            chunk,
            total,
            hash,
            fileName
        }
    }
    async receiveChunk(props: ChunkUploadProps): Promise<any> {
        const hasFile = await this.uploadStorage.hasFile(props.fileId)
        if (!hasFile) {
            this.uploadStorage.setFile(props.fileId, {
                fileName: props.fileName,
                fileId: props.fileId,
                total: props.total,
                chunks: []
            })
        }
        this.uploadStorage.addFileChunk(props.fileName, props.fileId, { index: props.index, chunk: props.chunk, hash: props.hash })

        return Promise.resolve({
            isFinish: props.index === props.total - 1,
            fileId: props.fileId
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

    async readFileByStream(fileId: string) {
        return await this.uploadStorage.readFileChunk(fileId)
    }
    async readFileName(fileId: string): Promise<string> {
        return await this.uploadStorage.readFileName(fileId)
    }
}