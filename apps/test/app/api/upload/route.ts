import { NextResponse } from 'next/server'
import { UploadServer, InternalStorage } from '@yxzq-super-cloud/super-upload-server'

export const runtime = 'nodejs'

const internalStorage = new InternalStorage('/resources')
export const uploadServer = new UploadServer(internalStorage)
export async function POST(request: Request) {
    const formData = await request.formData()
    const res = await uploadServer.receiveChunk(uploadServer.propsAdaptor(formData))
    return NextResponse.json(res)
}
