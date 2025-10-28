import { NextResponse } from 'next/server'
import { uploadServer } from '../route'
export const runtime = 'nodejs'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId') as string
    const total = searchParams.get('total') as string
    const res = await uploadServer.checkFile(fileId, Number(total))
    return NextResponse.json(res)
}
