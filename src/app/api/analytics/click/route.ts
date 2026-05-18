import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: Request) {
  try {
    const { businessId } = await req.json()

    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 })
    }

    await adminDb.collection('businesses').doc(businessId).update({
      clicks: FieldValue.increment(1),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Click tracking failed' }, { status: 500 })
  }
}