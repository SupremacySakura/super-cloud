import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function POST(request: Request) {
    const { fileId, fileName, chunkCount } = await request.json()

    const chunkDir = path.join(process.cwd(), 'uploads', fileId)
    const finalPath = path.join(process.cwd(), 'uploads', fileName)

    const writeStream = fs.createWriteStream(finalPath)

    for (let i = 0; i < chunkCount; i++) {
        const chunkPath = path.join(chunkDir, String(i))
        const data = fs.readFileSync(chunkPath)
        writeStream.write(data)
    }

    writeStream.end()
    return NextResponse.json({ ok: true, filePath: finalPath })
}
