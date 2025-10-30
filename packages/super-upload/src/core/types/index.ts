/**
 * 上传模块核心类型定义
 * 
 * 包含上传相关的核心接口和类型定义，用于整个上传系统中的类型约束和数据传输
 */

/**
 * 上传任务接口
 * 
 * 表示一个文件分片的上传任务，包含分片的所有必要信息
 */
export interface UploadTask {
    /**
     * 文件唯一标识符
     * 
     * 由文件名和大小生成，用于标识特定文件
     */
    fileId: string
    
    /**
     * 原始文件名
     */
    fileName: string
    
    /**
     * 分片索引
     * 
     * 表示当前分片在整个文件中的顺序位置
     */
    index: number
    
    /**
     * 分片数据
     * 
     * 表示当前分片的二进制数据
     */
    chunk: Blob
    
    /**
     * 分片哈希值
     * 
     * 当前分片的MD5哈希值，用于完整性校验
     */
    hash: string
    
    /**
     * 文件总分片数
     * 
     * 表示整个文件被分成了多少个分片
     */
    total: number
}

/**
 * 上传核心配置选项接口
 * 
 * 定义UploadCore类的配置参数
 */
export interface UploadCoreOptions {
    /**
     * 分块大小（字节）
     * 
     * 决定文件被分割成多大的块进行上传
     */
    chunkSize: number
    
    /**
     * 并发数量配置
     * 
     * 控制同时进行的上传任务数量，默认值为3
     */
    concurrency?: number
}

/**
 * 上传结果接口
 * 
 * 表示一次上传操作的结果统计信息
 */
export interface UploadResult {
    /**
     * 文件唯一标识符
     */
    fileId: string
    
    /**
     * 成功上传的分片数量
     */
    success: number
    
    /**
     * 上传失败的分片数量
     */
    failed: number
    
    /**
     * 总分片数量
     */
    total: number
}