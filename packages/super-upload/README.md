# super-upload

**super-upload** 是一个功能强大的文件上传库，提供浏览器端和服务器端实现，支持分片上传、断点续传、并发控制和分片复用等高级特性。

## 核心特性

- **分片上传**：将大文件分割成多个小分片进行上传
- **断点续传**：支持上传暂停和恢复，适用于网络不稳定环境
- **并发控制**：可配置的并发上传数量，优化上传速度
- **分片复用**：基于哈希值的分片复用机制，减少重复上传
- **文件完整性校验**：使用哈希值确保文件传输完整性
- **流式文件读取**：支持流式下载，优化大文件处理
- **TypeScript支持**：完整的类型定义，提供良好的开发体验

## 安装

```bash
npm install @yxzq-super-cloud/super-upload
# 或
yarn add @yxzq-super-cloud/super-upload
```

## 浏览器端使用

### 基本用法

```typescript
import { UploadCore , UploadBrowser } from '@yxzq-super-cloud/super-upload'

// 创建上传核心实例
const core = new UploadCore({
  chunkSize: 255 * 1024,  // 分块大小（字节）
  concurrency: 3,        // 并发数量配置
})

// 创建浏览器上传实例
const uploadBrowser = new UploadBrowser(core, {
  uploadUrl: '/api/upload',               // 上传接口地址
  checkFileUrl: '/api/upload/checkFile',  // 检查文件接口地址
  readFileUrl: '/api/download',           // 获取文件地址
  readFileNameUrl: '/api/upload/fileName' // 获取文件名接口
})

// 开始上传文件
async function uploadFile(file: File) {
  const result = await uploadBrowser.start(file, (progress) => {
    console.log(`上传进度: ${progress}%`)
  })
  return result
}

// 暂停上传
function pauseUpload() {
  uploadBrowser.pause()
}

// 恢复上传
async function resumeUpload(file: File) {
  await uploadBrowser.resume(file, (progress) => {
    console.log(`上传进度: ${progress}%`)
  })
}

// 下载文件
async function downloadFile(fileId: string) {
  const file = await uploadBrowser.readFileByStream(fileId)
  const fileName = await uploadBrowser.readFileName(fileId)
  // 触发浏览器下载
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}
```

### 完整的React组件示例

```tsx
import React, { useState } from 'react'
import { UploadCore , UploadBrowser } from '@yxzq-super-cloud/super-upload'

// 注意,示例需要在函数组件外使用,否则暂停功能会失效,因为React刷新状态时会重新创建实例
// 初始化上传核心和浏览器实例
const core = new UploadCore({
    chunkSize: 255 * 1024,  // 255KB每块
    concurrency: 3,         // 3个并发请求
})

const uploadBrowser = new UploadBrowser(core, {
    uploadUrl: '/api/upload',
    checkFileUrl: '/api/upload/checkFile',
    readFileUrl: '/api/download',
    readFileNameUrl: '/api/upload/fileName',
})

const UploadComponent = () => {
  const [progress, setProgress] = useState(0)
  const [fileId, setFileId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  // 上传文件
  const handleUpload = async () => {
    if (!file) return
    
    try {
      const result = await uploadBrowser.start(file, setProgress)
      setFileId(result.fileId)
      console.log('上传成功:', result)
    } catch (error) {
      console.error('上传失败:', error)
    }
  }

  // 下载文件
  const handleDownload = async () => {
    if (!fileId) return
    
    try {
      const fileBlob = await uploadBrowser.readFileByStream(fileId)
      const fileName = await uploadBrowser.readFileName(fileId)
      const url = URL.createObjectURL(fileBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('下载失败:', error)
    }
  }

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files?.[0] || null)} 
      />
      <button onClick={handleUpload}>上传</button>
      <button onClick={() => uploadBrowser.pause()}>暂停</button>
      <button onClick={() => file && uploadBrowser.resume(file, setProgress)}>恢复</button>
      <button onClick={handleDownload}>下载</button>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }} 
        />
      </div>
      <div>{progress}%</div>
      
      {fileId && <div>文件ID: {fileId}</div>}
    </div>
  )
}

export default UploadComponent
```

## 服务器端使用

### 基本配置

```typescript
import { UploadServer, InternalStorage } from '@yxzq-super-cloud/super-upload/server'

// 创建存储实例
const storage = new InternalStorage('./uploads')

// 创建上传服务器实例
const uploadServer = new UploadServer(storage)
```

### Next.js API 路由示例

#### 1. 上传分片接口 (`/api/upload/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { UploadServer, InternalStorage } from '@yxzq-super-cloud/super-upload/server'

// 创建存储和服务器实例
const storage = new InternalStorage('./uploads')
const uploadServer = new UploadServer(storage)

export async function POST(request: NextRequest) {
  try {
    // 解析FormData
    const formData = await request.formData()
    
    // 使用propsAdaptor将FormData转换为UploadTask
    const task = uploadServer.propsAdaptor(formData)
    
    // 接收分片
    const result = await uploadServer.receiveChunk(task)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('上传失败:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : '未知错误' }, { status: 500 })
  }
}
```

#### 2. 文件检查接口 (`/api/upload/checkFile/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { UploadServer, InternalStorage } from '@yxzq-super-cloud/super-upload/server'

// 创建存储和服务器实例
const storage = new InternalStorage('./uploads')
const uploadServer = new UploadServer(storage)

export async function GET(request: NextRequest) {
  try {
    const fileId = request.nextUrl.searchParams.get('fileId')
    const total = parseInt(request.nextUrl.searchParams.get('total') || '0')
    
    if (!fileId) {
      return NextResponse.json({ error: '缺少fileId参数' }, { status: 400 })
    }
    
    // 检查文件并获取已上传分片
    const result = await uploadServer.checkFile(fileId, total)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('文件检查失败:', error)
    return NextResponse.json([], { status: 200 }) // 出错时返回空数组，允许重新上传所有分片
  }
}
```

#### 3. 文件下载接口 (`/api/download/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { UploadServer, InternalStorage } from '@yxzq-super-cloud/super-upload/server'

// 创建存储和服务器实例
const storage = new InternalStorage('./uploads')
const uploadServer = new UploadServer(storage)

export async function GET(request: NextRequest) {
  try {
    const fileId = request.nextUrl.searchParams.get('fileId')
    
    if (!fileId) {
      return NextResponse.json({ error: '缺少fileId参数' }, { status: 400 })
    }
    
    // 获取文件名
    const fileName = await uploadServer.readFileName(fileId)
    
    // 获取文件流
    const stream = await uploadServer.readFileByStream(fileId)
    
    // 创建响应头
    const headers = new Headers()
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`)
    
    // 返回文件流
    return new NextResponse(stream, { headers })
  } catch (error) {
    console.error('文件下载失败:', error)
    return NextResponse.json({ error: '文件不存在或下载失败' }, { status: 404 })
  }
}
```

#### 4. 获取文件名接口 (`/api/upload/fileName/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { UploadServer, InternalStorage } from '@yxzq-super-cloud/super-upload/server'

// 创建存储和服务器实例
const storage = new InternalStorage('./uploads')
const uploadServer = new UploadServer(storage)

export async function GET(request: NextRequest) {
  try {
    const fileId = request.nextUrl.searchParams.get('fileId')
    
    if (!fileId) {
      return NextResponse.json({ error: '缺少fileId参数' }, { status: 400 })
    }
    
    // 获取文件名
    const fileName = await uploadServer.readFileName(fileId)
    
    return NextResponse.json(fileName)
  } catch (error) {
    console.error('获取文件名失败:', error)
    return NextResponse.json('unknown.txt', { status: 200 }) // 出错时返回默认文件名
  }
}
```

## API 文档

### 浏览器端 API

#### UploadCore

```typescript
class UploadCore {
  constructor(options: UploadCoreOptions)
  
  // 创建上传任务
  creatTasks(file: File): Promise<UploadTask[]>
  
  // 执行上传
  runWithUploader(
    file: File,
    tasks: UploadTask[],
    uploaderFn: (task: UploadTask) => Promise<any>,
    onProgress?: (p: number) => void
  ): Promise<UploadResult>
  
  // 暂停上传
  pause(): void
  
  // 恢复上传
  resume(
    file: File,
    uploaderFn: (task: UploadTask) => Promise<any>,
    onProgress?: (p: number) => void
  ): Promise<UploadResult>
}
```

#### UploadBrowser

```typescript
class UploadBrowser {
  constructor(core: UploadCore, options: UploadBrowserOptions)
  
  // 开始上传
  start(file: File, onProgress?: (p: number) => void): Promise<any>
  
  // 暂停上传
  pause(): Promise<void>
  
  // 恢复上传
  resume(file: File, onProgress?: (p: number) => void): Promise<void>
  
  // 检查文件
  checkFile(fileId: string, total: number): Promise<Array<number>>
  
  // 读取文件
  readFileByStream(fileId: string): Promise<Blob>
  
  // 读取文件名
  readFileName(fileId: string): Promise<any>
}
```

### 服务器端 API

#### UploadServer

```typescript
class UploadServer implements ChunkReceiver {
  constructor(uploadStorage: UploadStorage)
  
  // 表单数据适配
  propsAdaptor(formdata: FormData): UploadTask
  
  // 接收分片
  receiveChunk(props: UploadTask): Promise<{ isFinish: boolean; fileId: string }>
  
  // 检查文件
  checkFile(fileId: string, total: number): Promise<Array<number>>
  
  // 读取文件流
  readFileByStream(fileId: string): Promise<ReadableStream>
  
  // 读取文件名
  readFileName(fileId: string): Promise<string>
}
```

#### InternalStorage

```typescript
class InternalStorage implements UploadStorage {
  constructor(uploadDir: string)
  
  // 获取文件
  getFile(fileId: string): Promise<UploadStorageValue | undefined>
  
  // 设置文件
  setFile(fileId: string, value: UploadStorageValue): Promise<void>
  
  // 检查文件
  hasFile(fileId: string): Promise<boolean>
  
  // 添加文件分片
  addFileChunk(fileName: string, fileId: string, chunk: { index: number; chunk: Blob; hash: string }): Promise<void>
  
  // 读取文件流
  readFileChunk(fileId: string): Promise<ReadableStream>
  
  // 读取文件名
  readFileName(fileId: string): Promise<string>
}
```

## 配置选项

### UploadCoreOptions

```typescript
interface UploadCoreOptions {
  // 分块大小（字节）
  chunkSize: number
  
  // 并发数量，默认3
  concurrency?: number
}
```

### UploadBrowserOptions

```typescript
interface UploadBrowserOptions {
  // 上传接口地址
  uploadUrl: string
  
  // 文件检查接口地址
  checkFileUrl: string
  
  // 文件读取接口地址
  readFileUrl: string
  
  // 文件名读取接口地址
  readFileNameUrl: string
}
```

## 高级特性

### 分片复用机制

super-upload 使用基于哈希值的分片复用机制，当上传具有相同内容的文件分片时，系统会检测到已经存在相同哈希值的分片，从而避免重复存储相同的分片数据。这对于上传相似文件或恢复上传非常有效，可以节省存储空间和网络带宽。

### 断点续传原理

1. **文件唯一标识**：使用文件名和文件大小生成唯一的 fileId
2. **分片上传记录**：服务器记录每个 fileId 已上传的分片索引
3. **上传前检查**：上传前先检查哪些分片已存在，只上传不存在的分片
4. **暂停/恢复**：客户端可以暂停上传，恢复时继续从上次中断的地方上传

## 常见问题

### 上传大文件时内存占用过高

**解决方案**：减小 `chunkSize` 参数值，使分片更小，降低单次处理的数据量。

### 网络不稳定导致上传失败

**解决方案**：利用断点续传功能，捕获上传错误后调用 `resume()` 方法继续上传。

### 服务器存储空间管理

**解决方案**：定期清理不再需要的上传文件，或者实现自定义存储接口，将文件存储到云存储服务。

## 自定义存储实现

如果需要将文件存储到其他存储系统（如云存储），可以实现 `UploadStorage` 接口：

```typescript
import { UploadStorage, UploadStorageValue } from '@yxzq-super-cloud/super-upload'

export class CustomStorage implements UploadStorage {
  // 实现所有接口方法
  async getFile(fileId: string): Promise<UploadStorageValue | undefined> {
    // 从自定义存储获取文件元数据
  }
  
  async setFile(fileId: string, value: UploadStorageValue): Promise<void> {
    // 保存文件元数据到自定义存储
  }
  
  async hasFile(fileId: string): Promise<boolean> {
    // 检查文件是否存在
  }
  
  async addFileChunk(fileName: string, fileId: string, chunk: { index: number; chunk: Blob; hash: string }): Promise<void> {
    // 保存文件分片到自定义存储
  }
  
  async readFileChunk(fileId: string): Promise<ReadableStream> {
    // 从自定义存储读取文件流
  }
  
  async readFileName(fileId: string): Promise<string> {
    // 获取文件名
  }
}
```

## 许可证

MIT