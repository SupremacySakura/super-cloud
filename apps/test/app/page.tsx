'use client'
import { AxiosRequester,FetchRequester
  , RequestCore, useIdempotencyPlugin } from '@yxzq-super-cloud/super-request-utils'
import { useEffect } from 'react'
export default function Home() {
  // const axiosRequester = new AxiosRequester()
  const fetchRequester = new FetchRequester()
  const request: RequestCore = new RequestCore(fetchRequester, {
    baseUrl: 'http://localhost:3000',
    withCredentials: false,
  })
  const idempotencyPlugin = useIdempotencyPlugin()
  request.use(idempotencyPlugin)
  const handleRequest = async () => {
    request.request({
      url: '/api',
      method: 'POST',
      timeout: 1000,
      idempotencyOptions: {
        idempotent: true
      }
    }).then((res: any) => {
      console.log(res)
    }).catch(error => {
      console.log('error:', error)
    })
  }
  const handleClick = () => {

  }
  const handleEject = () => {
    // request.eject(cachePlugin)
  }
  useEffect(() => {

  }, [])
  return (
    <div className='flex gap-2'>
      <h1>Hello Super-Utils</h1>
      <button onClick={handleRequest} className='w-20 h-10 rounded-lg bg-blue-600'>请求</button>
      <button onClick={handleClick} className='w-20 h-10 rounded-lg bg-blue-600'>取消请求</button>
      <button onClick={handleEject} className='w-20 h-10 rounded-lg bg-blue-600'>弹出插件</button>
    </div>
  );
}
