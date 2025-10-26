import { NextResponse } from "next/server"

export async function GET(request: Request) {
    return NextResponse.json({ message: 'hello get' })
} 
export async function POST(request: Request) {
    const formData = await request.formData()
    return NextResponse.json({ message: 'hello get' })
} 