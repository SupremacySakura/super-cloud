import { NextResponse } from 'next/server'
import { UploadServer, InternalStorage } from '@yxzq-super-cloud/super-upload-server'

export const runtime = 'nodejs'

const internalStorage = new InternalStorage('/resources')
export const uploadServer = new UploadServer(internalStorage)
export async function POST(request: Request) {
    const formData = await request.formData()
    const fileId = formData.get('fileId') as string
    const index = formData.get('index') as string
    const chunk = formData.get('chunk') as File
    const total = formData.get('total') as string
    const res = await uploadServer.receiveChunk(fileId, Number(index), chunk, Number(total))
    return NextResponse.json(res)
}
