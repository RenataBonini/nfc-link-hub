import { NextResponse } from 'next/server'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const docRef = await addDoc(collection(db, 'businesses'), {
      name: body.name || '',
      tagline: body.tagline || '',
      slug: body.slug || '',
      template: body.template || 'classic-dark',
      logoUrl: body.logoUrl || '',
      isPublished: false,
      links: body.links || [],
      ownerId: body.ownerId || '',
      createdAt: serverTimestamp(),
    })

    return NextResponse.json({ id: docRef.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create business' }, { status: 500 })
  }
}