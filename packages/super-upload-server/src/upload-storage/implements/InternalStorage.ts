import path from "path"
import fs from "fs"
import { UploadStorage, UploadStorageValue } from "../interfaces"

export class InternalStorage implements UploadStorage {
    private uploadDir: string
    FileMap: Map<string, {
        total: number,
        chunks: {
            index: number,
            chunk: Blob
        }[]
    }> = new Map()
    constructor(uploadDir: string) {
        this.uploadDir = uploadDir
    }
    async getFile(fileId: string): Promise<UploadStorageValue | undefined> {
        const file = this.FileMap.get(fileId)
        if (!file) return undefined
        return file
    }
    async setFile(fileId: string, value: UploadStorageValue): Promise<void> {
        this.FileMap.set(fileId, value)
    }
    async hasFile(fileId: string): Promise<boolean> {
        return this.FileMap.has(fileId)
    }
    async addFileChunk(fileId: string, chunk: { index: number, chunk: Blob }): Promise<void> {
        const file = this.FileMap.get(fileId)
        if (!file) return
        file.chunks.push(chunk)
        const uploadDir = path.join(process.cwd(), this.uploadDir, fileId)
        if (!fs.existsSync(uploadDir)) { fs.mkdirSync(uploadDir, { recursive: true }) }

        const buffer = Buffer.from(await chunk.chunk.arrayBuffer())
        fs.writeFileSync(path.join(uploadDir, chunk.index.toString()), buffer)

    }
}