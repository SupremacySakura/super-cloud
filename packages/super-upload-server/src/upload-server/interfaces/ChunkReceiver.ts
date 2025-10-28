import type { ChunkUploadProps } from '@yxzq-super-cloud/super-upload-core/src/upload-core/interfaces/ChunkUploader'
export interface ChunkReceiver {
    propsAdaptor(formdata: FormData): ChunkUploadProps
    /**
     * 接收单个分片
     * @param fileId 文件唯一id
     * @param index 分片索引
     * @param chunk  分片内容
     * @param total 总分片数
     */
    receiveChunk(props: ChunkUploadProps): Promise<any>

    /**
     * 检查还有多少片段未上传
     * @param fileId 文件id
     * @param total 片段总数
     */
    checkFile(fileId: string, total: number): Promise<Array<number>>

    /**
     * 通过流的方式读取文件
     * @param fileId 文件id
     */
    readFileByStream(fileId: string): Promise<ReadableStream>

    /**
     * 读取文件名
     * @param fileId 文件id  
     */
    readFileName(fileId: string): Promise<string>
}