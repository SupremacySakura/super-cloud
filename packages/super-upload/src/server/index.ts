/**
 * 上传服务模块
 * 
 * 提供服务器端文件上传相关的核心类和接口
 */

import { UploadServer } from './upload-server/UploadServer'
import type { UploadStorage, UploadStorageValue } from './upload-storage/interfaces/UploadStorage'
import { InternalStorage } from './upload-storage/InternalStorage'

/**
 * 导出上传相关的核心类和接口
 * 
 * 主要包含上传服务器实现和存储相关组件
 */
export {
    /**
     * 文件上传服务器实现类
     * 
     * 处理分片接收、文件检查和文件读取等核心上传功能
     */
    UploadServer,

    /**
     * 内部存储实现类
     * 
     * 提供基于文件系统的分片存储和管理功能
     */
    InternalStorage
}

export type {
    /**
     * 上传存储接口
     * 
     * 定义文件存储的抽象接口，支持不同的存储实现
     */
    UploadStorage,

    /**
     * 上传存储数据结构
     * 
     * 表示存储中的文件元数据信息
     */
    UploadStorageValue
}