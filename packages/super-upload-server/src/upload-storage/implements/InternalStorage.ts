import path from 'path'
import fs from 'fs'
import { UploadStorage, UploadStorageValue } from '../interfaces/UploadStorage'
export class InternalStorage implements UploadStorage {
    private uploadDir: string

    constructor(uploadDir: string) {
        this.uploadDir = uploadDir
    }

    // 全局块目录（所有分片都放这里）
    private getChunkDir = () => {
        return path.join(process.cwd(), this.uploadDir, 'chunks')
    }

    // 单个文件的目录
    private getFileDir = (fileId: string) => {
        return path.join(process.cwd(), this.uploadDir, fileId)
    }

    // meta.json
    private getMetaPath = (fileId: string) => {
        return path.join(this.getFileDir(fileId), 'meta.json')
    }

    /** 读取元信息 */
    private loadMeta = (fileId: string): UploadStorageValue | undefined => {
        const metaPath = this.getMetaPath(fileId)
        if (!fs.existsSync(metaPath)) return undefined
        return JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
    }

    /** 写入元信息 */
    private saveMeta = (fileId: string, data: UploadStorageValue) => {
        const dir = this.getFileDir(fileId)
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(this.getMetaPath(fileId), JSON.stringify(data))
    }

    hasFile = async (fileId: string): Promise<boolean> => {
        return fs.existsSync(this.getMetaPath(fileId))
    }

    setFile = async (fileId: string, value: UploadStorageValue): Promise<void> => {
        this.saveMeta(fileId, value)
    }

    getFile = async (fileId: string) => {
        return this.loadMeta(fileId)
    }

    /** ✅ 支持分片复用写入逻辑 */
    addFileChunk = async (fileName: string, fileId: string, chunk: { index: number; chunk: Blob; hash: string }) => {
        if (!chunk.hash) {
            throw new Error(`Missing hash for chunk index=${chunk.index}`)
        }

        // 1. 写入 chunk，只存 hash 命名，不重复写
        const chunksDir = this.getChunkDir()
        fs.mkdirSync(chunksDir, { recursive: true })
        const chunkFilePath = path.join(chunksDir, chunk.hash)

        if (!fs.existsSync(chunkFilePath)) {
            const buffer = Buffer.from(await chunk.chunk.arrayBuffer())
            fs.writeFileSync(chunkFilePath, buffer)
        }

        // 2. 更新 fileId/meta.json 记录 chunk 信息
        const meta = this.loadMeta(fileId) || { fileName, fileId, total: 0, chunks: [] }

        if (!meta.chunks.some(c => c.index === chunk.index)) {
            meta.chunks.push({ index: chunk.index, hash: chunk.hash })
            this.saveMeta(fileId, meta)
        }
    }

    readFileChunk = async (fileId: string) => {
        const meta = this.loadMeta(fileId)
        if (!meta) {
            return new ReadableStream() // 空流
        }

        const chunkDir = this.getChunkDir()
        const chunksSorted = meta.chunks.slice().sort((a, b) => a.index - b.index)

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for (const chunk of chunksSorted) {
                        const data = await fs.promises.readFile(path.join(chunkDir, chunk.hash))
                        controller.enqueue(data) // 推入流
                    }
                    controller.close()
                } catch (err) {
                    controller.error(err)
                }
            }
        })

        return stream
    }
    readFileName = async (fileId: string) => {
        const meta = this.loadMeta(fileId)
        if (!meta) {
            return 'not found'
        }
        return meta.fileName
    }

}
