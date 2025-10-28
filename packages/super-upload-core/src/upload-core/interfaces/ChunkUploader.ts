export interface ChunkUploadProps {
    fileId: string
    index: number
    chunk: Blob
    total: number
}

export interface ChunkUploader {
    /**
     * 上传单个分片
     * @param fileId 文件唯一id
     * @param index 分片索引
     * @param chunk  分片内容
     * @param total 总分片数
     */
    uploadChunk(props: ChunkUploadProps): Promise<any>

    /**
     * 检查还有多少片段未上传
     * @param fileId 文件id
     * @param total 片段总数
     */
    checkFile(fileId: string, total: number): Promise<Array<number>>
}