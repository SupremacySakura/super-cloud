'use client'
import { RequestCore, AxiosRequester, useCachePlugin, useRetryPlugin, FetchRequester } from '@super-cloud/super-utils'
import { useEffect } from 'react'
export default function Home() {
  const axiosRequester = new AxiosRequester()
  const fetchRequester = new FetchRequester()
  const request: RequestCore = new RequestCore(fetchRequester)
  const cachePlugin = useCachePlugin({})
  const { result } = cachePlugin
  const retryPlugin = useRetryPlugin({
    maxRetries: 10
  }, request)
  request.use(cachePlugin)
  request.use(retryPlugin)
  const handleRequest = async () => {
    request.request({
      url: 'http://localhost:3000/api',
    }).then((res: any) => {
      console.log(res)
    }).catch(error => {
      console.log('error:', error)
    })
  }
  const handleClear = async () => {
    result?.()
  }
  const handleEject = () => {
    request.eject(cachePlugin)
  }
  useEffect(() => {

  }, [])
  return (
    <div>
      <h1>Hello Super-Utils</h1>
      <button onClick={handleRequest}>请求</button>
      <button onClick={handleClear}>清除缓存</button>
      <button onClick={handleEject}>弹出插件</button>
    </div>
  );
}
