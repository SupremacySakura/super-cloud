// // app/api/download/route.ts
// import { NextResponse } from 'next/server'
// import fs from 'fs'
// import path from 'path'

// export const runtime = 'nodejs' // 必须是 Node，Edge 不支持 fs

// export async function GET(request: Request) {
//     const { searchParams } = new URL(request.url)
//     const fileName = searchParams.get('fileName')

//     if (!fileName) {
//         return NextResponse.json({ error: 'fileName is required' }, { status: 400 })
//     }

//     // 假设你最终合并后的文件放在 /uploads 目录
//     const filePath = path.join(process.cwd(), 'uploads', fileName)

//     if (!fs.existsSync(filePath)) {
//         return NextResponse.json({ error: 'File not found' }, { status: 404 })
//     }

//     const fileStream = fs.createReadStream(filePath)

//     return new Response(fileStream as any, {
//         headers: {
//             'Content-Type': 'application/octet-stream',
//             'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
//         },
//     })
// }
// app/api/download/route.ts
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    const fileName = searchParams.get('fileName')
    const chunkCount = Number(searchParams.get('chunkCount'))

    if (!fileId || !fileName || !chunkCount) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const chunkDir = path.join(process.cwd(), 'uploads', fileId)

    // ✅ 使用 ReadableStream 实现边读边传
    const stream = new ReadableStream({
        async pull(controller) {
            for (let i = 0; i < chunkCount; i++) {
                const chunkPath = path.join(chunkDir, String(i))
                const data = fs.readFileSync(chunkPath)
                controller.enqueue(data) // 送给前端
            }
            controller.close()
        }
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`
        }
    })
}
