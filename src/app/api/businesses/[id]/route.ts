import { NextResponse } from 'next/server'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, doc, updateDoc, deleteDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const body = await req.json()

    await updateDoc(doc(db, 'businesses', id), {
      ...body,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params

    await deleteDoc(doc(db, 'businesses', id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}