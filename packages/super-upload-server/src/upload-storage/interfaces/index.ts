export interface UploadStorageValue {
    total: number
    chunks: {
        index: number
        chunk: Blob
    }[]
}
export interface UploadStorage {
    getFile: (fileId: string) => Promise<UploadStorageValue | undefined>
    setFile: (fileId: string, value: UploadStorageValue) => Promise<void>
    hasFile: (fileId: string) => Promise<boolean>
    addFileChunk: (fileId: string, chunk: { index: number, chunk: Blob }) => Promise<void>
}
