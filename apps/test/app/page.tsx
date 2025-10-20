'use client'
import { RequestCore, AxiosRequester } from '@super-cloud/super-utils'
import { useEffect } from 'react'
export default function Home() {
  const request: RequestCore = new RequestCore(AxiosRequester)
  const handleRequest = async () => {
    request.requester.get('http://localhost:3000/api').then((res: any) => {
      console.log(res)
    })
  }

  useEffect(() => {

  }, [])
  return (
    <div>
      <h1>Hello Super-Utils</h1>
      <button onClick={handleRequest}>请求</button>
    </div>
  );
}
