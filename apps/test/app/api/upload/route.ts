import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function POST(request: Request) {
    const formData = await request.formData()
    const fileId = formData.get('fileId') as string
    const index = formData.get('index') as string
    const chunk = formData.get('chunk') as File

    const uploadDir = path.join(process.cwd(), 'uploads', fileId)
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

    const buffer = Buffer.from(await chunk.arrayBuffer())
    fs.writeFileSync(path.join(uploadDir, index), buffer)

    return NextResponse.json({ ok: true })
}
