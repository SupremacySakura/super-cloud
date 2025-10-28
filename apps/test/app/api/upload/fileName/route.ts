
import { NextResponse } from 'next/server'
import { uploadServer } from '../route'
export const runtime = 'nodejs'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId') as string
    const fileName = await uploadServer.readFileName(fileId)
    return new NextResponse(JSON.stringify(fileName))
}
