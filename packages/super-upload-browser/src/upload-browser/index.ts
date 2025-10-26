import { ChunkUploader } from "@yxzq-super-cloud/super-upload-core"
export class UploadBrowser implements ChunkUploader {
    private endpoint: string
    constructor(endpoint: string) {
        this.endpoint = endpoint
    }
    uploadChunk = async (fileId: string, index: number, chunk: File, total: number) => {
        const form = new FormData()
        form.append('fileId', fileId)
        form.append('index', index.toString())
        form.append('chunk', chunk)
        form.append('total', total.toString())
        const res = await fetch(this.endpoint, { method: 'POST', body: form })
        if (!res.ok) {
            throw new Error(`Chunk ${index} upload failed`)
        }
        return await res.json()
    }
}