'use client'
import { useEffect, useState } from 'react'
import { UploadCore } from '@yxzq-super-cloud/super-upload-core'
import { UploadBrowser } from '@yxzq-super-cloud/super-upload-browser'

export default function Home() {
  const [progress, setProgress] = useState(0)
  const uploadBrowser = new UploadBrowser({ endpoint: '/api/upload', checkFileUrl: '/api/upload/checkFile' })
  const uploadCore = new UploadCore(uploadBrowser, {
    chunkSize: 5 * 1024 * 1024,
    onProgress: (setProgress)
  })
  async function simpleUpload(file: File) {
    await uploadCore.start(file)
  }

  async function downloadFile(fileId: string, fileName: string, chunkCount: number) {
    // fetch(`/api/download?fileName=${encodeURIComponent(fileName)}`)
    //   .then(res => res.blob())
    //   .then(blob => {
    //     const url = URL.createObjectURL(blob)
    //     const a = document.createElement('a')
    //     a.href = url
    //     a.download = fileName
    //     a.click()
    //     URL.revokeObjectURL(url)
    //   })
    const res = await fetch(`/api/download?fileId=${encodeURIComponent(fileId)}&fileName=${encodeURIComponent(fileName)}&chunkCount=${chunkCount}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
  }
  const handleRequest = async () => {
    if (file) {
      simpleUpload(file)
    }
  }
  const handleClick = () => {
    // 下载文件（可以触发浏览器下载）
    downloadFile('1761482036637-Todo清单.exe', 'Todo清单.exe', 29)
  }
  const handleEject = () => {
    // request.eject(cachePlugin)
  }
  const [file, setFile] = useState<File>()
  useEffect(() => {

  }, [])
  return (
    <>
      <div className='flex gap-2'>
        <h1>Hello Super-Utils</h1>
        <button onClick={handleRequest} className='w-20 h-10 rounded-lg bg-blue-600'>请求</button>
        <button onClick={handleClick} className='w-20 h-10 rounded-lg bg-blue-600'>下载</button>
        <button onClick={handleEject} className='w-20 h-10 rounded-lg bg-blue-600'>弹出插件</button>
        <input type="file" onChange={(e) => { setFile(e.target.files?.[0] as File) }} />

      </div>
      <div className='p-1 w-100 bg-white h-10 mt-10 rounded-full'>
        <div className='bg-blue-300 h-full rounded-full' style={{ width: progress + '%' }}></div>
      </div>
      <div>
        {`${progress}%`}
      </div>
    </>
  );
}
