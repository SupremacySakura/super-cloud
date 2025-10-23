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
import { RequestCore, AxiosRequester } from '@yxzq-super-cloud/super-request-utils';

// 创建请求核心实例
const requestCore = new RequestCore(new AxiosRequester(), {
  timeout: 60000,
  baseUrl: 'https://api.example.com',
  withCredentials: true
});
```

### 发送基本请求

```typescript
// 发送GET请求
const response = await requestCore.request({
  url: '/users',
  method: 'GET',
  params: { page: 1, limit: 10 }
});

// 发送POST请求
const createResponse = await requestCore.request({
  url: '/users',
  method: 'POST',
  data: { name: 'John', email: 'john@example.com' }
});
```

### 使用插件

```typescript
import { useCachePlugin, useRetryPlugin, useIdempotencyPlugin } from '@yxzq-super-cloud/super-request-utils';

// 添加缓存插件
requestCore.use(useCachePlugin({
  cacheTTL: 300000,  // 缓存5分钟
  maxCacheSize: 100  // 最多缓存100条记录
}));

// 添加重试插件
requestCore.use(useRetryPlugin({
  maxRetries: 3,
  retryCondition: (error) => error.status >= 500 || error.status === 408
}, requestCore));

// 添加幂等性插件
requestCore.use(useIdempotencyPlugin({
  dedupe: true,
  expire: 10000
}));
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
  url: string;
  method?: RequestMethod;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  withCredentials?: boolean;
  baseUrl?: string;
  signal?: AbortSignal;
  // 各种插件可能添加的扩展选项
}
```

### Response 接口

```typescript
interface Response<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestConfig;
}
```

## 插件配置

### 缓存插件配置

```typescript
interface GlobalCacheOptions {
  cacheTTL?: number;  // 缓存有效期（毫秒）
  getCacheKey?: (config: RequestConfig) => string;  // 自定义缓存键生成函数
  useCache?: boolean;  // 是否启用缓存
  enableCacheCleanUp?: boolean;  // 是否启用定时清理
  cleanUpInterval?: number;  // 清理间隔（毫秒）
  maxCacheSize?: number;  // 最大缓存条目数
}
```

### 重试插件配置

```typescript
interface RetryOptions {
  maxRetries?: number;  // 最大重试次数
  retryCondition?: (error: RequestError) => boolean;  // 重试条件
  getDelay?: (retryCount: number, error: RequestError) => number;  // 延迟计算函数
}
```

### 幂等性插件配置

```typescript
interface IdempotencyOptions {
  headerName?: string;  // 幂等键请求头名称
  generateKey?: () => string;  // 幂等键生成函数
  dedupe?: boolean;  // 是否启用前端去重
  expire?: number;  // 幂等键有效期（毫秒）
}
```

## 开发自定义插件

可以通过实现RequestPlugin接口来开发自定义插件，以扩展请求功能。参考template-plugin目录中的实现方式。

## 浏览器兼容性

- 现代浏览器（Chrome, Firefox, Safari, Edge）
- 使用FetchRequester时需要浏览器支持fetch API
- 对于旧浏览器，建议使用AxiosRequester

## 许可证

ISC