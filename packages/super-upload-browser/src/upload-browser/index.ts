import { ChunkUploader, ChunkUploadProps } from "@yxzq-super-cloud/super-upload-core"

export interface UploadBrowserOptions {
    endpoint: string  // 上传接口地址
    checkFileUrl: string  // 检查文件接口地址
}

export class UploadBrowser implements ChunkUploader {
    private uplpadBrowserOptions: UploadBrowserOptions

    constructor(options: UploadBrowserOptions) {
        this.uplpadBrowserOptions = options
    }
    uploadChunk = async (props: ChunkUploadProps) => {
        const form = new FormData()
        form.append('fileId', props.fileId)
        form.append('index', props.index.toString())
        form.append('chunk', props.chunk)
        form.append('total', props.total.toString())
        const res = await fetch(this.uplpadBrowserOptions.endpoint, { method: 'POST', body: form })
        if (!res.ok) {
            throw new Error(`Chunk ${props.index} upload failed`)
        }
        return await res.json()
    }
    checkFile = async (fileId: string, total: number): Promise<Array<number>> => {
        const res = await fetch(`${this.uplpadBrowserOptions.checkFileUrl}?fileId=${fileId}&total=${total}`, {
            method: 'GET',
        })
        if (!res.ok) {
            throw new Error(`failed`)
        }
        return await res.json()
    }
}