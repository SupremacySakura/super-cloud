export interface ChunkReceiver {
    /**
     * 接收单个分片
     * @param fileId 文件唯一id
     * @param index 分片索引
     * @param chunk  分片内容
     * @param total 总分片数
     */
    receiveChunk(fileId: string, index: number, chunk: Blob, total: number): Promise<any>
}