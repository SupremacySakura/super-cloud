import { RequestCacheOptions } from '../types/CacheOptions'
declare module "../types/RequestConfig.ts" {
    interface RequestConfig {
        cacheOptions?: RequestCacheOptions
    }
}