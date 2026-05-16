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

type FlyerTemplate = 'classic-nfc' | 'luxury-card' | 'bold-promo'

type ColorPalette = {
  background: string
  accent: string
}

type Business = {
  id: string
  name: string
  tagline: string
  flyerTemplate: FlyerTemplate
  flyerHeadline: string
  flyerSubtext: string
  flyerCallout: string
  colorPalette: ColorPalette
  slug: string
  logoUrl: string
  isPublished: boolean
}

const defaultColorPalette: ColorPalette = {
  background: '#f5efe8',
  accent: '#b8926b',
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
        const q = query(collection(db, 'businesses'), where('slug', '==', slug))
        const snapshot = await getDocs(q)

        if (snapshot.empty) {
          setBusiness(null)
          return
        }

        const docSnap = snapshot.docs[0]
        const data = docSnap.data()

        const colorPalette: ColorPalette = {
          background:
            data.colorPalette?.background ||
            data.colorPalette?.primary ||
            defaultColorPalette.background,
          accent:
            data.colorPalette?.accent ||
            data.colorPalette?.secondary ||
            defaultColorPalette.accent,
        }

        setBusiness({
          id: docSnap.id,
          name: data.name || '',
          tagline: data.tagline || '',
          flyerTemplate: data.flyerTemplate || 'classic-nfc',
          flyerHeadline: data.flyerHeadline || '',
          flyerSubtext: data.flyerSubtext || '',
          flyerCallout: data.flyerCallout || '',
          colorPalette,
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
      backgroundColor: business.colorPalette.background,
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

    setTimeout(() => {
      setMessage('')
    }, 2500)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5efe8]">
        <p className="text-sm text-[#8f6d4e]">Loading flyer...</p>
      </main>
    )
  }

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5efe8]">
        <p className="text-sm text-[#8f6d4e]">Business not found.</p>
      </main>
    )
  }

  if (!business.isPublished) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5efe8]">
        <p className="text-sm text-[#8f6d4e]">
          This page is not published yet.
        </p>
      </main>
    )
  }

  const publicUrl = `https://nfc-link-hub-8yji.vercel.app/preview/${business.slug}`

  const flyerHeadline = business.flyerHeadline || business.name
  const flyerSubtext =
    business.flyerSubtext ||
    business.tagline ||
    'Tap the NFC tag to connect instantly.'
  const flyerCallout = business.flyerCallout || 'Tap the NFC tag'

  function renderLogo(currentBusiness: Business) {
    if (!currentBusiness.logoUrl) {
      return (
        <div
          className="flex h-full w-full items-center justify-center text-5xl font-bold"
          style={{ color: currentBusiness.colorPalette.accent }}
        >
          {currentBusiness.name.charAt(0).toUpperCase()}
        </div>
      )
    }

    return (
      <Image
        src={currentBusiness.logoUrl}
        alt={`${currentBusiness.name} logo`}
        fill
        className="object-contain"
        unoptimized
      />
    )
  }

  function renderQRSection(currentBusiness: Business) {
    return (
      <div className="rounded-[24px] bg-[#faf6f1] px-5 py-6 shadow-sm">
        <p
          className="mb-4 text-sm font-semibold"
          style={{ color: currentBusiness.colorPalette.accent }}
        >
          QR code backup
        </p>

        <div className="flex justify-center">
          <div className="rounded-2xl bg-white p-4 shadow-md">
            <QRCodeCanvas
              value={publicUrl}
              size={140}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
            />
          </div>
        </div>

        <p
          className="mx-auto mt-4 max-w-xs text-xs leading-5"
          style={{ color: currentBusiness.colorPalette.accent }}
        >
          If NFC is unavailable, scan this QR code instead.
        </p>
      </div>
    )
  }

  function renderClassicTemplate(currentBusiness: Business) {
    return (
      <div className="rounded-[30px] bg-white p-8 text-center shadow-xl sm:p-12">
        <div className="relative mx-auto mb-8 h-40 w-56">
          {renderLogo(currentBusiness)}
        </div>

        <p
          className="mb-3 text-xs font-semibold uppercase tracking-[0.35em]"
          style={{ color: currentBusiness.colorPalette.accent }}
        >
          NFC Enabled
        </p>

        <h2 className="text-4xl font-bold text-[#2b211b] sm:text-5xl">
          {flyerHeadline}
        </h2>

        <p
          className="mx-auto mt-4 max-w-md text-base leading-7"
          style={{ color: currentBusiness.colorPalette.accent }}
        >
          {flyerSubtext}
        </p>

        <div
          className="my-10 rounded-[32px] border-2 border-dashed px-6 py-10"
          style={{
            borderColor: currentBusiness.colorPalette.accent,
            backgroundColor: currentBusiness.colorPalette.background,
          }}
        >
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-[#2b211b] text-white shadow-lg">
            <span className="text-4xl">📡</span>
          </div>

          <h3 className="text-3xl font-bold text-[#2b211b]">
            {flyerCallout}
          </h3>

          <p
            className="mx-auto mt-3 max-w-sm text-sm leading-6"
            style={{ color: currentBusiness.colorPalette.accent }}
          >
            Place your phone close to the NFC tag to instantly open our digital
            page.
          </p>
        </div>

        {renderQRSection(currentBusiness)}
      </div>
    )
  }

  function renderLuxuryTemplate(currentBusiness: Business) {
    return (
      <div className="rounded-[40px] bg-[#111111] p-10 text-center text-white shadow-2xl">
        <div className="relative mx-auto mb-10 h-44 w-64">
          {renderLogo(currentBusiness)}
        </div>

        

        <h2 className="text-5xl font-bold">{flyerHeadline}</h2>

        <p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-white/70">
          {flyerSubtext}
        </p>

        <div className="my-12 rounded-[30px] border border-[#d4af37] bg-[#1b1b1b] px-8 py-10">
          <div className="mb-6 text-6xl">📱</div>

          <h3 className="text-3xl font-semibold">{flyerCallout}</h3>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/70">
            Instantly connect through our premium NFC experience.
          </p>
        </div>

        {renderQRSection(currentBusiness)}
      </div>
    )
  }

  function renderBoldPromoTemplate(currentBusiness: Business) {
    return (
      <div
        className="rounded-[36px] p-10 text-center shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${currentBusiness.colorPalette.accent} 0%, #111 100%)`,
        }}
      >
        <div className="relative mx-auto mb-8 h-44 w-64">
          {renderLogo(currentBusiness)}
        </div>

        <div className="rounded-[28px] bg-white p-8">
          <h2 className="text-5xl font-black uppercase text-[#111]">
            {flyerHeadline}
          </h2>

          <p className="mx-auto mt-5 max-w-lg text-base leading-8 text-[#555]">
            {flyerSubtext}
          </p>

          <div className="my-10 rounded-[24px] bg-[#111] px-6 py-8 text-white">
            <div className="mb-5 text-5xl">⚡</div>

            <h3 className="text-3xl font-bold">{flyerCallout}</h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/70">
              Tap your phone to connect instantly.
            </p>
          </div>

          {renderQRSection(currentBusiness)}
        </div>
      </div>
    )
  }

  function renderFlyerTemplate(currentBusiness: Business) {
    switch (currentBusiness.flyerTemplate) {
      case 'luxury-card':
        return renderLuxuryTemplate(currentBusiness)

      case 'bold-promo':
        return renderBoldPromoTemplate(currentBusiness)

      default:
        return renderClassicTemplate(currentBusiness)
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#b8926b_0%,#8f6d4e_100%)] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Flyer Generator</h1>

            <p className="mt-1 text-sm text-white/80">
              Download a printable NFC-first flyer.
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
          <div ref={flyerRef} className="w-full max-w-[760px]">
            {renderFlyerTemplate(business)}
          </div>
        </div>
      </div>
    </main>
  )
}