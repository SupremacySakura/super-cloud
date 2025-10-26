export interface ChunkUploader {
    /**
     * 上传单个分片
     * @param fileId 文件唯一id
     * @param index 分片索引
     * @param chunk  分片内容
     * @param total 总分片数
     */
    uploadChunk(fileId: string, index: number, chunk: Blob, total: number): Promise<any>
}