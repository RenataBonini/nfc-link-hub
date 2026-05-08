'use client'

import Image from 'next/image'
import Link from 'next/link'
import { use, useEffect, useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

type Props = {
  params: Promise<{
    slug: string
  }>
}

type Business = {
  id: string
  name: string
  tagline: string
  slug: string
  logoUrl: string
  isPublished: boolean
}

export default function FlyerPage({ params }: Props) {
  const { slug } = use(params)

  const flyerRef = useRef<HTMLDivElement | null>(null)

  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadBusiness() {
      try {
        const q = query(
          collection(db, 'businesses'),
          where('slug', '==', slug)
        )

        const snapshot = await getDocs(q)

        if (snapshot.empty) {
          setBusiness(null)
          return
        }

        const docSnap = snapshot.docs[0]
        const data = docSnap.data()

        setBusiness({
          id: docSnap.id,
          name: data.name || '',
          tagline: data.tagline || '',
          slug: data.slug || '',
          logoUrl: data.logoUrl || '',
          isPublished: Boolean(data.isPublished),
        })
      } catch (error) {
        console.error(error)
        setBusiness(null)
      } finally {
        setLoading(false)
      }
    }

    loadBusiness()
  }, [slug])

  async function downloadFlyer() {
    const html2canvas = (await import('html2canvas')).default

    if (!flyerRef.current || !business) return

    const canvas = await html2canvas(flyerRef.current, {
      scale: 2,
      backgroundColor: '#f5efe8',
      useCORS: true,
    })

    const image = canvas.toDataURL('image/png')

    const link = document.createElement('a')
    link.href = image
    link.download = `${business.slug}-flyer.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setMessage('Flyer downloaded successfully.')
    setTimeout(() => setMessage(''), 2500)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading flyer...</p>
      </main>
    )
  }

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Business not found.</p>
      </main>
    )
  }

  const publicUrl = `https://nfc-link-hub-8yji.vercel.app/preview/${business.slug}`

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#b8926b_0%,#8f6d4e_100%)] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-3 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Flyer Generator</h1>
            <p className="mt-1 text-sm text-white/80">
              Download a printable flyer with your QR code.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/dashboard"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#2b211b]"
            >
              Back to Dashboard
            </Link>

            <button
              type="button"
              onClick={downloadFlyer}
              className="rounded-xl bg-[#2b211b] px-4 py-2 text-sm font-semibold text-white"
            >
              Download Flyer
            </button>
          </div>
        </div>

        {message ? (
          <p className="mb-4 rounded-xl bg-green-100 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </p>
        ) : null}

        <div className="flex justify-center">
          <div
            ref={flyerRef}
            className="w-full max-w-[720px] rounded-[36px] bg-[#f5efe8] p-8 shadow-2xl sm:p-12"
          >
            <div className="rounded-[30px] border border-[#d8c7b8] bg-white p-8 text-center shadow-xl sm:p-12">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#efe3d6]">
                {business.logoUrl ? (
                  <Image
                    src={business.logoUrl}
                    alt={`${business.name} logo`}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-3xl font-bold text-[#8f6d4e]">
                    {business.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#8f6d4e]">
                Scan or Tap
              </p>

              <h2 className="text-4xl font-bold text-[#2b211b] sm:text-5xl">
                {business.name}
              </h2>

              <p className="mx-auto mt-4 max-w-md text-base leading-7 text-[#8f6d4e]">
                {business.tagline || 'Connect with us instantly through our digital landing page.'}
              </p>

              <div className="my-8 flex justify-center">
                <div className="rounded-3xl bg-white p-5 shadow-lg">
                  <QRCodeCanvas
                    value={publicUrl}
                    size={220}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                  />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-[#2b211b]">
                Connect with us
              </h3>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#8f6d4e]">
                Scan the QR code or tap our NFC tag to access WhatsApp, Instagram,
                Google Reviews, website links, and more.
              </p>

              <p className="mt-8 break-all rounded-2xl bg-[#f5efe8] px-4 py-3 text-xs text-[#8f6d4e]">
                {publicUrl}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}