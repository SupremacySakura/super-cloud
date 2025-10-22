export interface RetryOptions {
    maxRetries?: number
    retryCondition?: (error: any) => boolean | Promise<boolean>
    getDelay?: (retryCount: number) => number
}

export type RetryOptionsWithCount = RetryOptions & { __retryCount?: number }

// 临时解决方案 用于 plugin 代码提示打包,由于rollup打包工具的一些问题,暂时这样使用
declare module '../' {
    interface RequestConfig {
        retryOptions?: RetryOptionsWithCount
    }
}

// 临时解决方案 用于 plugin 代码提示便邪恶
declare module '../../request-core/types' {
    interface RequestConfig {
        retryOptions?: RetryOptionsWithCount
    }
}