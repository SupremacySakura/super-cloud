# Super Cloud Monorepo

一个基于PNPM和Turborepo的现代化monorepo项目框架，用于管理多个应用和共享包。

## 项目结构
- `apps/`: 存放应用程序
- `packages/`: 存放共享包和工具

## 快速开始

### 安装依赖
```bash
pnpm install
```

### 可用脚本
- `pnpm build`: 构建所有项目
- `pnpm test`: 运行所有测试
- `pnpm lint`: 运行所有代码检查
- `pnpm dev`: 启动所有开发服务器
- `pnpm clean`: 清理构建产物

## 管理工作区

### 添加新应用
```bash
cd apps
pnpm create vite@latest my-new-app
```

### 添加新共享包
```bash
cd packages
mkdir my-new-package
cd my-new-package
pnpm init
```

## 依赖管理
使用工作区协议引用本地包：
```json
{
  "dependencies": {
    "@super-cloud/utils": "workspace:*"
  }
}
```