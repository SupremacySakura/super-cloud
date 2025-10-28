'use client'
import { useEffect, useRef, useState } from 'react'
import { UploadCore } from '@yxzq-super-cloud/super-upload-core'
import { UploadBrowser } from '@yxzq-super-cloud/super-upload-browser'


export default function Home() {
  const [progress, setProgress] = useState(0)
  const uploadCoreRef = useRef<UploadCore | null>(null)
  const [fileId, setFileId] = useState('')

  if (!uploadCoreRef.current) {
    const uploadBrowser = new UploadBrowser({
      endpoint: '/api/upload',
      checkFileUrl: '/api/upload/checkFile',
      readUrl: '/api/download',
      readFileNameUrl: '/api/upload/fileName'
    })
    uploadCoreRef.current = new UploadCore(uploadBrowser, {
      chunkSize: 255 * 1024,
      onProgress: setProgress
    })
  }

  const uploadCore = uploadCoreRef.current
  async function simpleUpload(file: File) {
    const { fileId } = await uploadCore.start(file)
    setFileId(fileId)
  }

  async function downloadFile() {
    console.log('download,fileId', fileId)
    const res = await uploadCore.readFile(fileId)
    const url = URL.createObjectURL(res.file)
    const a = document.createElement('a')
    a.href = url
    console.log('result',res)
    a.download = res.fileName
    a.click()
  }
  const handleRequest = async () => {
    if (file) {
      simpleUpload(file)
    }
  }
  const handleClick = () => {
    // 下载文件（可以触发浏览器下载）
    downloadFile()
  }
  const handlePause = () => {
    uploadCore.pause()
  }
  const handleResume = () => {
    uploadCore.resume()
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
        <button onClick={handlePause} className='w-20 h-10 rounded-lg bg-blue-600'>暂停</button>
        <button onClick={handleResume} className='w-20 h-10 rounded-lg bg-blue-600'>恢复</button>
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
