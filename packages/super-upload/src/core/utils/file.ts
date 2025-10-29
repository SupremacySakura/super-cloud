/**
 * 文件操作工具模块
 * 
 * 提供文件分片等文件处理相关功能
 */

/**
 * 将Blob对象分割成指定大小的多个分片
 * 
 * 此函数用于将大文件分割成多个固定大小的小块，便于分块上传
 * 
 * @param file - 要分片的Blob对象（如File对象）
 * @param chunkSize - 每个分片的大小（字节）
 * @returns Array<{index: number, blob: Blob}> - 分片结果数组，每个元素包含索引和对应的Blob对象
 */
export function createChunks(file: Blob, chunkSize: number): Array<{index: number, blob: Blob}> {
    // 存储分片结果的数组
    const chunks = [];
    // 当前分片索引
    let index = 0;

    // 循环处理，直到处理完整个文件
    while (index * chunkSize < file.size) {
        // 创建当前分片，包含索引和对应的Blob片段
        chunks.push({
            index,
            blob: file.slice(index * chunkSize, (index + 1) * chunkSize),
        });
        // 索引递增，准备处理下一个分片
        index++;
    }
    
    return chunks;
}
