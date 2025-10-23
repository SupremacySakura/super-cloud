import { NextResponse } from "next/server"

export async function GET(request: Request) {
    await new Promise(resolve => setTimeout(resolve, 3000)) // 等待 3 秒
    return NextResponse.json({ message: 'hello get' })
} 
export async function POST(request: Request) {
    await new Promise(resolve => setTimeout(resolve, 3000)) // 等待 3 秒
    return NextResponse.json({ message: 'hello get' })
} 