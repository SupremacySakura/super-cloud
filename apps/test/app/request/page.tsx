'use client'
import React from 'react'
import { AxiosRequester, RequestCore, useCancelPlugin, useRetryPlugin, useIdempotencyPlugin, useCachePlugin } from '@yxzq-super-cloud/super-request-utils'

const axiosRquester = new AxiosRequester()
const cancelPlugin = useCancelPlugin()
const idempotencyPlugin = useIdempotencyPlugin()
const retryPlugin = useRetryPlugin()
const cachePlugin = useCachePlugin({
    enableCacheCleanUp: true,
    cleanUpInterval: 1000,
})
const requestCore = new RequestCore(axiosRquester).use(cachePlugin)
export default function Page() {

    const handleClick = async () => {
        const res = await requestCore.get('http://localhost:3000/api', {
            cacheOptions: {
                cacheTTL: 10000,
                // useCache: false,
                getCacheKey: () => {
                    return '1'
                }
            }
        })
        console.log(res.data)
    }
    const handleClick2 = async () => {
       cachePlugin.result.clearCache()
    }
    
    return (
        <div>
            <div>Page</div>
            <button onClick={handleClick}>
                发送请求
            </button>
            <button onClick={handleClick2}>
                发送请求2
            </button>
        </div>
    )
}
