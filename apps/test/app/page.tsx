'use client'
import { RequestCore, AxiosRequester, useCachePlugin } from '@super-cloud/super-utils'
import { useEffect, useState } from 'react'
export default function Home() {
  const axiosRequester = new AxiosRequester()
  const request: RequestCore = new RequestCore(axiosRequester)
  const [str, setStr] = useState('')
  const cachePlugin = useCachePlugin({})
  const { result } = cachePlugin
  request.use(cachePlugin)
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
  useEffect(() => {

  }, [])
  return (
    <div>
      <h1>Hello Super-Utils</h1>
      <button onClick={handleRequest}>请求</button>
      <button onClick={handleClear}>清除缓存</button>
    </div>
  );
}
