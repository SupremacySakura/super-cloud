/**
 * 哈希计算工具模块
 * 
 * 提供文件或数据块的哈希值计算功能
 */

import SparkMD5 from 'spark-md5'

/**
 * 计算Blob对象的MD5哈希值
 * 
 * 使用SparkMD5库计算指定Blob对象的MD5哈希值，用于文件分片的完整性验证
 * 
 * @param blob - 要计算哈希值的Blob对象
 * @returns Promise<string> - 返回Promise，解析为Blob对象的MD5哈希值字符串
 */
export async function calcChunkHash(blob: Blob): Promise<string> {
    // 将Blob转换为ArrayBuffer
    const buffer = await blob.arrayBuffer()
    // 使用SparkMD5计算ArrayBuffer的哈希值
    return SparkMD5.ArrayBuffer.hash(buffer)
}
