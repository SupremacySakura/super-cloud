// 记录文件的块数,以及对应的块
export interface UploadStorageValue {
    fileId: string
    fileName: string
    total: number
    chunks: {
        hash: string
        index: number
    }[]
}
export interface UploadStorage {
    getFile: (fileId: string) => Promise<UploadStorageValue | undefined>
    setFile: (fileId: string, value: UploadStorageValue) => Promise<void>
    hasFile: (fileId: string) => Promise<boolean>
    addFileChunk: (fileName: string, fileId: string, chunk: { index: number, chunk: Blob, hash: string }) => Promise<void>
    readFileChunk: (fileId: string) => Promise<ReadableStream>
    readFileName: (fileId: string) => Promise<string>
}
