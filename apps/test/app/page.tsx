'use client'
import { useEffect, useState } from 'react'
import { UploadCore } from '@yxzq-super-cloud/super-upload-core'
import { UploadBrowser } from '@yxzq-super-cloud/super-upload-browser'

export default function Home() {
  const uploadBrowser = new UploadBrowser('/api/upload')
  const uploadCore = new UploadCore(uploadBrowser, {
    chunkSize: 5 * 1024 * 1024,
  })
  async function simpleUpload(file: File) {
    await uploadCore.start(file)
    alert('上传完成')
  }
  // 提醒后端开始合并
  // await fetch('/api/upload/merge', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ fileId, fileName: file.name, chunkCount: chunks }),
  // })

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
    <div className='flex gap-2'>
      <h1>Hello Super-Utils</h1>
      <button onClick={handleRequest} className='w-20 h-10 rounded-lg bg-blue-600'>请求</button>
      <button onClick={handleClick} className='w-20 h-10 rounded-lg bg-blue-600'>下载</button>
      <button onClick={handleEject} className='w-20 h-10 rounded-lg bg-blue-600'>弹出插件</button>
      <input type="file" onChange={(e) => { setFile(e.target.files?.[0] as File) }} />
    </div>
  );
}
