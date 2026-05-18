'use client'

import Image from 'next/image'
import { use, useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

type Props = {
  params: Promise<{
    slug: string
  }>
}

type LinkItem = {
  type: string
  label: string
  url: string
}

type ColorPalette = {
  background: string
  accent: string
}

type Business = {
  id: string
  name: string
  tagline: string
  pageHeadline: string
  pageDescription: string
  colorPalette: ColorPalette
  slug: string
  template: 'classic-dark' | 'minimal-light' | 'warm-card'
  logoUrl: string
  isPublished: boolean
  links: LinkItem[]
}

const defaultColorPalette: ColorPalette = {
  background: '#f5efe8',
  accent: '#b8926b',
}

export default function PublicLandingPage({ params }: Props) {
  const { slug } = use(params)

  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)

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
          pageHeadline: data.pageHeadline || '',
          pageDescription: data.pageDescription || '',
          colorPalette,
          slug: data.slug || '',
          template: data.template || 'classic-dark',
          logoUrl: data.logoUrl || '',
          isPublished: Boolean(data.isPublished),
          links: data.links || [],
        })
      } catch (error) {
        console.error('Preview page error:', error)
        setBusiness(null)
      } finally {
        setLoading(false)
      }
    }

    loadBusiness()
  }, [slug])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-lg text-black">Loading page...</p>
      </main>
    )
  }

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-2xl font-bold text-black">Business page not found.</p>
      </main>
    )
  }

  if (!business.isPublished) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-lg text-black">This page is not published yet.</p>
      </main>
    )
  }

  const safeBusiness = business
  const headline = safeBusiness.pageHeadline || safeBusiness.name
  const description =
    safeBusiness.pageDescription ||
    safeBusiness.tagline ||
    'Connect with us instantly'

  function renderLogo(shape: 'circle' | 'square' = 'circle') {
    if (!safeBusiness.logoUrl) {
      return (
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white text-4xl font-bold text-[#8f6d4e]">
          {safeBusiness.name.charAt(0).toUpperCase()}
        </div>
      )
    }

    if (shape === 'square') {
      return (
        <div className="mx-auto mb-4 flex h-32 w-52 items-center justify-center rounded-[28px] bg-white p-4 shadow-xl">
          <Image
            src={safeBusiness.logoUrl}
            alt={`${safeBusiness.name} logo`}
            width={180}
            height={120}
            className="h-full w-full object-contain"
            unoptimized
          />
        </div>
      )
    }

    return (
      <div className="mx-auto mb-4 flex h-28 w-44 items-center justify-center rounded-3xl bg-white p-3 shadow-md">
        <Image
          src={safeBusiness.logoUrl}
          alt={`${safeBusiness.name} logo`}
          width={160}
          height={100}
          className="h-full w-full object-contain"
          unoptimized
        />
      </div>
    )
  }

  function renderLinks(linkClassName: string) {
    if (safeBusiness.links.length === 0) {
      return <p className="text-sm opacity-70">No links have been added yet.</p>
    }

    return safeBusiness.links.map((link) => (
      <a
        key={`${link.type}-${link.url}`}
        href={link.url}
        target="_blank"
        rel="noreferrer"
        className={linkClassName}
      >
        {link.label}
      </a>
    ))
  }

  function renderCard() {
    if (safeBusiness.template === 'minimal-light') {
      return (
        <div
          className="rounded-[24px] px-6 py-8 text-center shadow-2xl"
          style={{ backgroundColor: safeBusiness.colorPalette.background }}
        >
          {renderLogo('circle')}

          <h1 className="text-2xl font-bold text-[#2b211b]">{headline}</h1>

          <p className="mt-2 text-sm text-[#8f6d4e]">{description}</p>

          <div className="mt-8 space-y-3">
            {renderLinks(
              'block rounded-full border border-[#d8c7b8] bg-white px-4 py-3 text-sm font-medium text-[#2b211b]'
            )}
          </div>
        </div>
      )
    }

    if (safeBusiness.template === 'warm-card') {
      return (
        <div
          className="rounded-[28px] px-6 py-8 text-center shadow-2xl"
          style={{
            background: `linear-gradient(180deg, ${safeBusiness.colorPalette.background} 0%, ${safeBusiness.colorPalette.accent} 100%)`,
          }}
        >
          {renderLogo('square')}

          <h1 className="text-2xl font-bold text-[#2b211b]">{headline}</h1>

          <p className="mt-2 text-sm text-[#5b4636]">{description}</p>

          <div className="mt-8 space-y-3">
            {renderLinks(
              'block rounded-2xl bg-white/80 px-4 py-3 text-sm font-medium text-[#2b211b] shadow-sm'
            )}
          </div>
        </div>
      )
    }

    return (
      <div
        className="rounded-[24px] px-6 py-8 text-center text-white shadow-2xl"
        style={{
          background: `linear-gradient(180deg, ${safeBusiness.colorPalette.accent} 0%, #1f1813 100%)`,
        }}
      >
        {renderLogo('circle')}

        <h1 className="text-2xl font-bold">{headline}</h1>

        <p className="mt-2 text-sm text-white/70">{description}</p>

        <div className="mt-8 space-y-3">
          {renderLinks(
            'block rounded-full bg-white/10 px-4 py-3 text-sm font-medium text-white'
          )}
        </div>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#b8926b_0%,#8f6d4e_100%)] px-6 py-10">
      <div className="w-full max-w-sm rounded-[28px] bg-white/10 p-5 backdrop-blur-xl">
        {renderCard()}
      </div>
    </main>
  )
}