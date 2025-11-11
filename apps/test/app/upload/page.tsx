'use client'
import { useEffect, useState } from 'react'
import { UploadCore } from '@yxzq-super-cloud/super-upload'
import { UploadBrowser } from '@yxzq-super-cloud/super-upload'

const core = new UploadCore({
  chunkSize: 255 * 1024,  // 分块大小
  concurrency: 3,  // 并发数量配置
})
const uploadBrowser = new UploadBrowser(core, {
  uploadUrl: '/api/upload',  // 上传接口地址
  checkFileUrl: '/api/upload/checkFile',  // 检查文件接口地址
  readFileUrl: '/api/download',  // 获取文件地址
  readFileNameUrl: '/api/upload/fileName',  // 获取文件名
})
export default function Home() {
  const [progress, setProgress] = useState(0)
  const [fileId, setFileId] = useState('')
  async function simpleUpload(file: File) {
    const { fileId } = await uploadBrowser.start(file, setProgress)
    setFileId(fileId)
  }

  async function downloadFile() {
    console.log('download,fileId', fileId)
    const file = await uploadBrowser.readFileByStream(fileId)
    const fileName = await uploadBrowser.readFileName(fileId)
    const url = URL.createObjectURL(file)
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
    downloadFile()
  }
  const handlePause = () => {
    uploadBrowser.pause()
  }
  const handleResume = () => {
    if (file) {
      uploadBrowser.resume(file, setProgress)
    }
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
