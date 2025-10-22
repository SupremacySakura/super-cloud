import { RequestCacheOptions } from '../../types'

declare module '../../types' {
    interface RequestConfig {
        cacheOptions: RequestCacheOptions
    }
}