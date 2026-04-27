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

type Params = {
  params: { id: string }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const body = await req.json()

    const ref = doc(db, 'businesses', params.id)

    await updateDoc(ref, {
      ...body,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const ref = doc(db, 'businesses', params.id)

    await deleteDoc(ref)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}