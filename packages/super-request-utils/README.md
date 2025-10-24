# @yxzq-super-cloud/super-request-utils

## 项目简介

`@yxzq-super-cloud/super-request-utils` 是一个功能强大的HTTP请求工具库，提供了统一的请求接口、灵活的插件系统和多种请求实现方式。该库旨在简化HTTP请求的处理，提高开发效率，并通过插件机制支持各种高级功能，如缓存、重试、请求取消和幂等性保障。

## 核心特性

- **统一的请求接口**：提供标准化的请求API，屏蔽底层实现差异
- **灵活的插件系统**：支持通过插件扩展请求功能
- **多种请求实现**：内置Axios和Fetch两种请求实现
- **丰富的插件生态**：包含缓存、重试、取消和幂等性等常用插件
- **TypeScript支持**：完整的类型定义，提供良好的开发体验

## 安装

使用npm安装：

```bash
npm install @yxzq-super-cloud/super-request-utils
```

使用yarn安装：

```bash
yarn add @yxzq-super-cloud/super-request-utils
```

使用pnpm安装：

```bash
pnpm add @yxzq-super-cloud/super-request-utils
```

## 核心组件

### RequestCore

请求核心类，是整个库的中心组件，负责协调请求执行流程和管理插件系统。

### AxiosRequester

基于Axios库的请求实现，提供稳定可靠的HTTP请求功能。

### FetchRequester

基于浏览器原生fetch API的请求实现，适合现代浏览器环境。

## 插件系统

### 缓存插件 (useCachePlugin)

提供请求结果缓存功能，可减少重复请求，提高性能。支持自定义缓存策略、过期时间和最大缓存条数。

### 重试插件 (useRetryPlugin)

在请求失败时自动进行重试，可配置重试条件、延迟策略和最大重试次数，提高请求成功率。

### 取消插件 (useCancelPlugin)

支持请求取消功能，可以手动取消进行中的请求，避免不必要的网络请求。

### 幂等性插件 (useIdempotencyPlugin)

通过添加唯一标识符确保请求幂等性，防止重复提交造成的数据一致性问题，特别适用于支付、订单等关键操作。

### 模板插件 (useTemplatePlugin)

提供插件开发的基础模板，可作为开发自定义插件的起点。

## 基本使用

### 创建请求实例

```typescript
import { RequestCore, AxiosRequester } from '@yxzq-super-cloud/super-request-utils'

// 创建请求核心实例
const requestCore = new RequestCore(new AxiosRequester(), {
  timeout: 60000,
  baseUrl: 'https://api.example.com',
  withCredentials: true
})
```

### 发送基本请求

```typescript
// 发送GET请求
const response = await requestCore.request({
  url: '/users',
  method: 'GET',
  params: { page: 1, limit: 10 }
})

// 发送POST请求
const createResponse = await requestCore.request({
  url: '/users',
  method: 'POST',
  data: { name: 'John', email: 'john@example.com' }
})
```

### 使用插件

```typescript
import { useCachePlugin, useRetryPlugin, useIdempotencyPlugin } from '@yxzq-super-cloud/super-request-utils'

// 添加缓存插件
requestCore.use(useCachePlugin({
  cacheTTL: 300000,  // 缓存5分钟
  maxCacheSize: 100  // 最多缓存100条记录
}))

// 添加重试插件
requestCore.use(useRetryPlugin({
  maxRetries: 3,
  retryCondition: (error) => error.status >= 500 || error.status === 408
}, requestCore))

// 添加幂等性插件
requestCore.use(useIdempotencyPlugin({
  dedupe: true,
  expire: 10000
}))
```

## API参考

### RequestCore 类

#### 构造函数

```typescript
constructor(requester: Requester, options?: RequestCoreOptions)
```

- `requester`: 请求实现实例，需实现Requester接口
- `options`: 可选的配置选项，包括timeout、baseUrl和withCredentials

#### request 方法

```typescript
request<T = any>(config: RequestConfig): Promise<Response<T>>
```

- `config`: 请求配置对象
- 返回值: Promise<Response<T>>

#### use 方法

```typescript
use<K>(plugin: RequestPlugin<K>): K
```

- `plugin`: 请求插件实例
- 返回值: 插件提供的扩展方法

### RequestConfig 接口

```typescript
interface RequestConfig {
  url: string
  method?: RequestMethod
  headers?: Record<string, string>
  params?: Record<string, any>
  data?: any
  timeout?: number
  withCredentials?: boolean
  baseUrl?: string
  signal?: AbortSignal
  // 各种插件可能添加的扩展选项
}
```

### Response 接口

```typescript
interface Response<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: RequestConfig
}
```

## 插件配置

每个插件都支持两种级别的配置：创建插件时的全局配置和单个请求时的请求级配置。以下是详细说明：

### 缓存插件 (useCachePlugin)

#### 创建插件配置 (CacheOptions)

```typescript
interface CacheOptions {
  cacheTTL?: number  // 缓存有效期（毫秒），默认60000ms
  getCacheKey?: (config: RequestConfig) => string  // 自定义缓存键生成函数
  useCache?: boolean  // 是否启用缓存，默认true
  enableCacheCleanUp?: boolean  // 是否启用定时清理过期缓存，默认false
  cleanUpInterval?: number  // 清理间隔（毫秒），默认300000ms
  maxCacheSize?: number  // 最大缓存条目数
}
```

#### 请求级配置 (通过RequestConfig.cacheOptions)

```typescript
interface RequestCacheOptions {
  useCache?: boolean  // 是否使用缓存，优先级高于全局配置
  cacheTTL?: number  // 缓存有效期（毫秒），优先级高于全局配置
  getCacheKey?: (config: RequestConfig) => any  // 自定义缓存键生成函数，优先级高于全局配置
}
```

#### 使用示例

```typescript
// 创建缓存插件实例
const cachePlugin = useCachePlugin({
  cacheTTL: 300000,  // 全局默认缓存5分钟
  enableCacheCleanUp: true  // 启用定时清理
})

// 注册缓存插件到请求核心
requestCore.use(cachePlugin)

// 单个请求配置 - 覆盖全局设置
const response = await requestCore.request({
  url: '/users',
  method: 'GET',
  cacheOptions: {
    useCache: true,
    cacheTTL: 60000,  // 此请求只缓存1分钟
    getCacheKey: (config) => `${config.url}-${JSON.stringify(config.params)}` // 自定义缓存键
  }
})

// 禁用特定请求的缓存
const nonCachedResponse = await requestCore.request({
  url: '/latest-data',
  method: 'GET',
  cacheOptions: {
    useCache: false
  }
})

// 手动清理所有缓存
cachePlugin.result.clearCache()
```

### 重试插件 (useRetryPlugin)

#### 创建插件配置 (RetryOptions)

```typescript
interface RetryOptions {
  maxRetries?: number  // 最大重试次数，默认3次
  retryCondition?: (error: RequestError) => boolean  // 重试条件函数
  getDelay?: (retryCount: number, error: RequestError) => number  // 延迟计算函数
}
```

#### 请求级配置 (通过RequestConfig.retryOptions)

```typescript
interface RetryOptionsWithCount {
  maxRetries?: number  // 最大重试次数，覆盖全局配置
  retryCondition?: (error: RequestError) => boolean  // 重试条件函数，覆盖全局配置
  getDelay?: (retryCount: number, error: RequestError) => number  // 延迟计算函数，覆盖全局配置
  __retryCount?: number  // 内部使用，当前重试次数
}
```

#### 使用示例

```typescript
// 创建插件时配置
requestCore.use(useRetryPlugin({
  maxRetries: 5,  // 全局默认重试5次
  retryCondition: (error) => error.status >= 500 || error.name === 'NetworkError'
}, requestCore))

// 单个请求配置 - 覆盖全局设置
const response = await requestCore.request({
  url: '/unstable-endpoint',
  method: 'POST',
  retryOptions: {
    maxRetries: 10,  // 此请求最多重试10次
    getDelay: (count) => 1000 * Math.pow(2, count)  // 指数退避策略
  }
})
```

### 取消插件 (useCancelPlugin)

#### 创建插件配置 (CancelOptions)

```typescript
interface CancelOptions {
  autoCancel?: boolean  // 是否自动取消重复请求，默认false
  getKey?: (config: RequestConfig) => string  // 自定义请求标识键生成函数
}
```

#### 请求级配置 (通过RequestConfig.cancelOptions)

```typescript
interface RequestCancelOptions {
  cancelKey?: string  // 用于唯一标识请求的键，用于手动取消
  enableCancel?: boolean  // 是否启用取消功能，默认true
}
```

#### 使用示例

```typescript
// 创建取消插件实例
const cancelPlugin = useCancelPlugin({
  autoCancel: true  // 自动取消重复请求
})

// 注册取消插件到请求核心
requestCore.use(cancelPlugin)

// 发送可取消的请求
const response = await requestCore.request({
  url: '/long-running-task',
  method: 'GET',
  cancelOptions: {
    cancelKey: 'task-123'  // 设置请求标识键
  }
})

// 手动取消特定请求
cancelPlugin.result.cancel('task-123')

// 禁用特定请求的取消功能
const nonCancelableResponse = await requestCore.request({
  url: '/critical-operation',
  method: 'POST',
  cancelOptions: {
    enableCancel: false
  }
})
```

### 幂等性插件 (useIdempotencyPlugin)

#### 创建插件配置 (IdempotencyOptions)

```typescript
interface IdempotencyOptions {
  headerName?: string  // 幂等键请求头名称，默认'Idempotency-Key'
  generateKey?: () => string  // 幂等键生成函数
  dedupe?: boolean  // 是否启用前端级别请求去重，默认false
  expire?: number  // 幂等键有效期（毫秒），默认5000ms
}
```

#### 请求级配置 (通过RequestConfig.idempotencyOptions)

```typescript
interface RequestIdempotencyOptions {
  idempotent?: boolean  // 是否开启幂等，默认false
  idempotencyKey?: string  // 自定义幂等键值
}
```

#### 使用示例

```typescript
// 创建插件时配置
requestCore.use(useIdempotencyPlugin({
  dedupe: true,  // 启用前端请求去重
  expire: 10000  // 幂等键有效期10秒
}))

// 发送幂等请求
const response = await requestCore.request({
  url: '/payment/process',
  method: 'POST',
  data: { amount: 100, orderId: 'ord-123' },
  idempotencyOptions: {
    idempotent: true,
    idempotencyKey: 'payment-ord-123-456'  // 使用自定义幂等键
  }
})

// 对GET请求不启用幂等（默认不启用）
const getResponse = await requestCore.request({
  url: '/products',
  method: 'GET'
})
```

## 开发自定义插件

可以通过实现RequestPlugin接口来开发自定义插件，以扩展请求功能。以下是详细步骤和接口说明：

### RequestPlugin接口定义

```typescript
interface RequestPlugin<K = any> {
  name: string  // 插件名称，用于标识
  beforeRequest?: <T>(config: RequestConfig) => Promise<RequestConfig> | RequestConfig | Promise<Response<T>> | Response<T>  // 若返回Response<T>，则中断后续流程
  afterResponse?: <T>(response: Response<T>) => Promise<Response<T>> | Response<T>
  onError?: (error: RequestError) => Promise<RequestError> | RequestError
  result: K  // 插件提供的扩展方法
}
```

### 自定义插件实现步骤

1. 导入必要的类型和接口
2. 定义插件配置类型（可选）
3. 创建插件工厂函数，返回实现了RequestPlugin接口的对象
4. 实现需要的钩子函数（beforeRequest、afterResponse、onError）
5. 在result属性中提供插件的扩展方法

### 自定义插件示例

```typescript
import { RequestPlugin } from '@yxzq-super-cloud/super-request-utils/src/request-core/interfaces'
import { RequestConfig, Response } from '@yxzq-super-cloud/super-request-utils/src/request-core/types'

// 定义插件配置接口
interface MyPluginOptions {
  enabled?: boolean
}

// 创建插件工厂函数
export const useMyPlugin = (options: MyPluginOptions = {}): RequestPlugin<{ myMethod: () => void }> => {
  const { enabled = true } = options

  return {
    name: 'my-custom-plugin',
    
    beforeRequest(config: RequestConfig) {
      if (!enabled) return config
      
      // 请求前处理逻辑
      console.log('请求发送前', config.url)
      
      // 修改请求配置
      config.headers = {
        ...config.headers,
        'X-Custom-Header': 'my-value'
      }
      
      return config
    },
    
    afterResponse(response: Response) {
      if (!enabled) return response
      
      // 响应后处理逻辑
      console.log('收到响应', response.status)
      return response
    },
    
    onError(error: any) {
      if (!enabled) return error
      
      // 错误处理逻辑
      console.error('请求错误', error)
      return error
    },
    
    result: {
      // 插件提供的扩展方法
      myMethod: () => {
        console.log('这是一个自定义插件方法')
      }
    }
  }
}

// 使用自定义插件
const myPlugin = useMyPlugin({ enabled: true })
requestCore.use(myPlugin)
myPlugin.result.myMethod()
```

参考文件：`super-cloud\packages\super-request-utils\src\request-core\interfaces\RequestPlugin.ts`

## 自定义Requester实现

除了插件系统，`super-request-utils` 还支持自定义Requester实现，允许您使用任何HTTP客户端库或自定义请求逻辑。

### Requester接口定义

```typescript
interface Requester {
  request<T = any>(config: RequestConfig): Promise<Response<T>>
}
```

### 自定义Requester实现步骤

1. 导入必要的类型和接口
2. 创建一个类或对象，实现Requester接口的request方法
3. 在request方法中实现实际的HTTP请求逻辑
4. 返回标准化的Response对象

### 自定义Requester示例

下面是一个基于XMLHttpRequest的自定义Requester实现示例：

```typescript
import { Requester } from '@yxzq-super-cloud/super-request-utils/src/request-core/interfaces'
import { RequestConfig, Response } from '@yxzq-super-cloud/super-request-utils/src/request-core/types'

export class XMLHttpRequestRequester implements Requester {
  async request<T = any>(config: RequestConfig): Promise<Response<T>> {
    const { 
      url,
      method = 'GET',
      headers = {},
      params,
      data,
      timeout,
      withCredentials,
      signal
    } = config

    return new Promise((resolve, reject) => {
      // 构建完整URL（包含查询参数）
      let fullUrl = url
      if (params && typeof params === 'object') {
        const queryString = new URLSearchParams(params).toString()
        if (queryString) {
          fullUrl += (url.includes('?') ? '&' : '?') + queryString
        }
      }

      // 创建XMLHttpRequest实例
      const xhr = new XMLHttpRequest()

      // 设置超时
      if (timeout) {
        xhr.timeout = timeout
      }

      // 设置凭证
      if (withCredentials) {
        xhr.withCredentials = true
      }

      // 监听中止信号
      if (signal) {
        const abortHandler = () => {
          xhr.abort()
          reject(new Error('Request aborted'))
        }
        
        if (signal.aborted) {
          abortHandler()
          return
        }
        
        signal.addEventListener('abort', abortHandler)
        
        // 清理事件监听器
        xhr.addEventListener('loadend', () => {
          signal.removeEventListener('abort', abortHandler)
        })
      }

      // 配置请求
      xhr.open(method, fullUrl)

      // 设置请求头
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, String(value))
      })

      // 处理响应
      xhr.onload = () => {
        // 解析响应头
        const responseHeaders: Record<string, string> = {}
        const headerString = xhr.getAllResponseHeaders()
        if (headerString) {
          headerString.split('\r\n').forEach(line => {
            if (line) {
              const [key, value] = line.split(': ')
              responseHeaders[key] = value
            }
          })
        }

        // 解析响应体
        let responseData: any
        try {
          responseData = xhr.responseText ? JSON.parse(xhr.responseText) : null
        } catch (error) {
          responseData = xhr.responseText
        }

        // 构造响应对象
        const response: Response<T> = {
          data: responseData,
          status: xhr.status,
          statusText: xhr.statusText,
          headers: responseHeaders,
          config
        }

        // 根据状态码决定成功或失败
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response)
        } else {
          reject({
            ...response,
            message: `Request failed with status ${xhr.status}`,
            name: 'RequestError'
          })
        }
      }

      // 处理错误
      xhr.onerror = () => {
        reject({
          message: 'Network error',
          name: 'NetworkError',
          config
        })
      }

      // 处理超时
      xhr.ontimeout = () => {
        reject({
          message: 'Request timeout',
          name: 'TimeoutError',
          config
        })
      }

      // 发送请求
      if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        xhr.send(typeof data === 'object' ? JSON.stringify(data) : data)
      } else {
        xhr.send()
      }
    })
  }
}

// 使用自定义Requester
import { RequestCore } from '@yxzq-super-cloud/super-request-utils'

const customRequester = new XMLHttpRequestRequester()
const requestCore = new RequestCore(customRequester, {
  baseUrl: 'https://api.example.com'
})

// 正常使用requestCore发送请求
const response = await requestCore.request({ url: '/data', method: 'GET' })
```

参考文件：`super-cloud\packages\super-request-utils\src\request-core\interfaces\Requester.ts`

## 浏览器兼容性

- 现代浏览器（Chrome, Firefox, Safari, Edge）
- 使用FetchRequester时需要浏览器支持fetch API
- 对于旧浏览器，建议使用AxiosRequester

## 许可证

ISC