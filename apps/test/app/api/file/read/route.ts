
import { NextResponse } from 'next/server'
import { uploadServer } from '../upload/route'
export const runtime = 'nodejs'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId') as string
    const stream = await uploadServer.readFileByStream(fileId)
    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'application/octet-stream'
        }
    })
}
