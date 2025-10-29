/**
 * 上传存储接口模块
 * 
 * 定义文件上传存储的核心接口和数据结构
 */

/**
 * 上传存储数据结构
 * 
 * 表示存储中的文件元数据信息，记录文件的基本信息和已上传的分片
 */
export interface UploadStorageValue {
    /**
     * 文件唯一标识符
     */
    fileId: string
    
    /**
     * 文件原始名称
     */
    fileName: string
    
    /**
     * 文件总分片数
     */
    total: number
    
    /**
     * 已上传的分片信息数组
     */
    chunks: {
        /**
         * 分片的哈希值，用于验证和去重
         */
        hash: string
        
        /**
         * 分片的索引位置
         */
        index: number
    }[]
}

/**
 * 上传存储接口
 * 
 * 定义了文件存储的抽象接口，支持不同的存储实现（如文件系统、云存储等）
 */
export interface UploadStorage {
    /**
     * 获取文件元数据
     * 
     * @param fileId - 文件唯一标识符
     * @returns Promise<UploadStorageValue | undefined> - 返回文件元数据或undefined（如果文件不存在）
     */
    getFile: (fileId: string) => Promise<UploadStorageValue | undefined>
    
    /**
     * 设置文件元数据
     * 
     * @param fileId - 文件唯一标识符
     * @param value - 文件元数据信息
     * @returns Promise<void>
     */
    setFile: (fileId: string, value: UploadStorageValue) => Promise<void>
    
    /**
     * 检查文件是否存在
     * 
     * @param fileId - 文件唯一标识符
     * @returns Promise<boolean> - 返回文件是否存在
     */
    hasFile: (fileId: string) => Promise<boolean>
    
    /**
     * 添加文件分片
     * 
     * @param fileName - 文件名称
     * @param fileId - 文件唯一标识符
     * @param chunk - 分片数据，包含索引、内容和哈希值
     * @returns Promise<void>
     */
    addFileChunk: (fileName: string, fileId: string, chunk: { index: number, chunk: Blob, hash: string }) => Promise<void>
    
    /**
     * 读取文件流
     * 
     * @param fileId - 文件唯一标识符
     * @returns Promise<ReadableStream> - 返回文件的可读流
     */
    readFileChunk: (fileId: string) => Promise<ReadableStream>
    
    /**
     * 读取文件名
     * 
     * @param fileId - 文件唯一标识符
     * @returns Promise<string> - 返回文件的原始名称
     */
    readFileName: (fileId: string) => Promise<string>
}
