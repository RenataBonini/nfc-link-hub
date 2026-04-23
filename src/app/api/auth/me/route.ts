import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/auth'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const user = await verifySessionToken(token)
    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 200 })
  }
}