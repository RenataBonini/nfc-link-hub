'use client'

import Image from 'next/image'
import { use, useEffect, useState } from 'react'
import {
  collection,
  doc,
  getDocs,
  increment,
  query,
  updateDoc,
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

type Business = {
  id: string
  name: string
  tagline: string
  slug: string
  template: 'classic-dark' | 'minimal-light' | 'warm-card'
  logoUrl: string
  isPublished: boolean
  links: LinkItem[]
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

        const loadedBusiness: Business = {
          id: docSnap.id,
          name: data.name || '',
          tagline: data.tagline || '',
          slug: data.slug || '',
          template: data.template || 'classic-dark',
          logoUrl: data.logoUrl || '',
          isPublished: Boolean(data.isPublished),
          links: data.links || [],
        }

        setBusiness(loadedBusiness)

        if (loadedBusiness.isPublished) {
          await updateDoc(doc(db, 'businesses', docSnap.id), {
            views: increment(1),
          })
        }
      } catch (error) {
        console.error(error)
        setBusiness(null)
      } finally {
        setLoading(false)
      }
    }

    loadBusiness()
  }, [slug])

  async function trackClick(businessId: string) {
    try {
      await updateDoc(doc(db, 'businesses', businessId), {
        clicks: increment(1),
      })
    } catch (error) {
      console.error('Click tracking failed:', error)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-lg text-[var(--text)]">Loading page...</p>
      </main>
    )
  }

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-lg text-[var(--text)]">Business page not found.</p>
      </main>
    )
  }

  if (!business.isPublished) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-lg text-[var(--text)]">
          This page is not published yet.
        </p>
      </main>
    )
  }

  const safeBusiness = business
  const hasLogo = Boolean(safeBusiness.logoUrl)

  function renderLogo(className: string, width = 84, height = 84) {
    if (!safeBusiness.logoUrl) return null

    return (
      <Image
        src={safeBusiness.logoUrl}
        alt={`${safeBusiness.name} logo`}
        width={width}
        height={height}
        className={className}
        unoptimized
      />
    )
  }

  function renderLinks(linkClassName: string) {
    if (safeBusiness.links.length === 0) {
      return (
        <p className="text-sm opacity-70">
          No links have been added yet.
        </p>
      )
    }

    return safeBusiness.links.map((link) => (
      <a
        key={`${link.type}-${link.url}`}
        href={link.url}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackClick(safeBusiness.id)}
        className={linkClassName}
      >
        {link.label}
      </a>
    ))
  }

  function renderCard() {
    if (safeBusiness.template === 'minimal-light') {
      return (
        <div className="rounded-[24px] border border-[var(--border)] bg-[#faf6f1] px-6 py-8 text-center text-[var(--text)] shadow-2xl">
          {hasLogo ? (
            renderLogo(
              'mx-auto mb-4 h-[84px] w-[84px] rounded-full border border-[var(--border)] object-cover'
            )
          ) : (
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-[var(--border)]" />
          )}

          <h1 className="text-2xl font-bold">{safeBusiness.name}</h1>

          <p className="mt-2 text-sm text-[var(--mocha)]/70">
            {safeBusiness.tagline || 'Connect with us instantly'}
          </p>

          <div className="mt-8 space-y-3">
            {renderLinks(
              'block rounded-full border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-[var(--text)]'
            )}
          </div>
        </div>
      )
    }

    if (safeBusiness.template === 'warm-card') {
      return (
        <div className="rounded-[28px] bg-[linear-gradient(180deg,#f3e7d8_0%,#e5cfb5_100%)] px-6 py-8 text-center text-[var(--text)] shadow-2xl">
          {hasLogo ? (
            renderLogo(
              'mx-auto mb-4 h-[88px] w-[88px] rounded-2xl border border-white/60 object-cover shadow',
              88,
              88
            )
          ) : (
            <div className="mx-auto mb-4 h-20 w-20 rounded-2xl bg-white/50" />
          )}

          <h1 className="text-2xl font-bold">{safeBusiness.name}</h1>

          <p className="mt-2 text-sm text-[var(--mocha)]/80">
            {safeBusiness.tagline || 'Connect with us instantly'}
          </p>

          <div className="mt-8 space-y-3">
            {renderLinks(
              'block rounded-2xl bg-white/80 px-4 py-3 text-sm font-medium text-[var(--text)] shadow-sm'
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="rounded-[24px] bg-[linear-gradient(180deg,#3d2b1f_0%,#1f1813_100%)] px-6 py-8 text-center text-white shadow-2xl">
        {hasLogo ? (
          renderLogo(
            'mx-auto mb-4 h-[84px] w-[84px] rounded-full border border-white/20 object-cover'
          )
        ) : (
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-white/10" />
        )}

        <h1 className="text-2xl font-bold">{safeBusiness.name}</h1>

        <p className="mt-2 text-sm text-white/70">
          {safeBusiness.tagline || 'Connect with us instantly'}
        </p>

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
      <div className="w-full max-w-sm rounded-[28px] bg-[rgba(255,255,255,0.12)] p-5 backdrop-blur-xl">
        {renderCard()}
      </div>
    </main>
  )
}