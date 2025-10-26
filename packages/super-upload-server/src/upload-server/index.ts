import { ChunkReceiver } from "@yxzq-super-cloud/super-upload-core"
import fs from "fs"
import path from "path"

export class UploadServer implements ChunkReceiver {
    FileMap: Map<string, {
        total: number,
        chunks: {
            index: number,
            chunk: Blob
        }[]
    }> = new Map()
    async receiveChunk(fileId: string, index: number, chunk: Blob, total: number): Promise<any> {
        const hasFile = this.FileMap.has(fileId)
        if (!hasFile) {
            this.FileMap.set(fileId, {
                total,
                chunks: []
            })
        }
        const file = this.FileMap.get(fileId)!
        file.chunks.push({
            index,
            chunk
        })
        const uploadDir = path.join(process.cwd(), 'uploads', fileId)
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

        const buffer = Buffer.from(await chunk.arrayBuffer())
        fs.writeFileSync(path.join(uploadDir, index.toString()), buffer)

        return Promise.resolve({
            isFinish: index === total - 1,
            fileId
        })
    }
}