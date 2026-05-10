'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { QRCodeCanvas } from 'qrcode.react'
import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { auth, db, storage } from '@/lib/firebase'

type TemplateType = 'classic-dark' | 'minimal-light' | 'warm-card'

type LinkItem = {
  type: string
  label: string
  url: string
}

type FormData = {
  businessName: string
  tagline: string
  template: TemplateType
  logoUrl: string
  isPublished: boolean
  whatsapp: string
  instagram: string
  googleReviews: string
  facebook: string
  website: string
}

type Business = {
  id: string
  ownerId: string
  name: string
  tagline: string
  slug: string
  template: TemplateType
  logoUrl: string
  isPublished: boolean
  views: number
  clicks: number
}

const SITE_URL = 'https://nfc-link-hub-8yji.vercel.app'

const initialForm: FormData = {
  businessName: '',
  tagline: '',
  template: 'classic-dark',
  logoUrl: '',
  isPublished: false,
  whatsapp: '',
  instagram: '',
  googleReviews: '',
  facebook: '',
  website: '',
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function DashboardPage() {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<'create' | 'pages'>('create')
  const [form, setForm] = useState<FormData>(initialForm)
  const [savedBusinesses, setSavedBusinesses] = useState<Business[]>([])

  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [loadingPages, setLoadingPages] = useState(false)
  const [loadingEdit, setLoadingEdit] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [openQrId, setOpenQrId] = useState<string | null>(null)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const slug = useMemo(
    () => slugify(form.businessName || 'business-name'),
    [form.businessName]
  )

  const links: LinkItem[] = useMemo(() => {
    const items: LinkItem[] = []

    if (form.whatsapp.trim()) {
      items.push({ type: 'whatsapp', label: 'WhatsApp', url: form.whatsapp.trim() })
    }

    if (form.instagram.trim()) {
      items.push({ type: 'instagram', label: 'Instagram', url: form.instagram.trim() })
    }

    if (form.googleReviews.trim()) {
      items.push({
        type: 'google-reviews',
        label: 'Google Reviews',
        url: form.googleReviews.trim(),
      })
    }

    if (form.facebook.trim()) {
      items.push({ type: 'facebook', label: 'Facebook', url: form.facebook.trim() })
    }

    if (form.website.trim()) {
      items.push({ type: 'website', label: 'Website', url: form.website.trim() })
    }

    return items
  }, [form])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/')
        return
      }

      setUser(currentUser)
      setAuthLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function resetForm() {
    setForm(initialForm)
    setEditingId(null)
    setMessage('')
    setError('')
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]

    if (!file || !user) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.')
      return
    }

    try {
      setUploadingLogo(true)
      setMessage('Uploading logo...')
      setError('')

      const safeName = file.name.replace(/\s+/g, '-').toLowerCase()
      const storageRef = ref(storage, `logos/${user.uid}/${Date.now()}-${safeName}`)

      await uploadBytes(storageRef, file)

      const downloadUrl = await getDownloadURL(storageRef)

      updateField('logoUrl', downloadUrl)
      setMessage('Logo uploaded successfully.')
    } catch (err) {
      console.error(err)
      setError('Failed to upload logo.')
    } finally {
      setUploadingLogo(false)
    }
  }

  async function fetchBusinesses() {
    if (!user) return

    setLoadingPages(true)
    setError('')

    try {
      const businessesQuery = query(
        collection(db, 'businesses'),
        where('ownerId', '==', user.uid)
      )

      const snapshot = await getDocs(businessesQuery)

      const businesses = snapshot.docs.map((document) => {
        const data = document.data()

        return {
          id: document.id,
          ownerId: data.ownerId,
          name: data.name || '',
          tagline: data.tagline || '',
          slug: data.slug || '',
          template: data.template || 'classic-dark',
          logoUrl: data.logoUrl || '',
          isPublished: Boolean(data.isPublished),
          views: data.views || 0,
          clicks: data.clicks || 0,
        } as Business
      })

      setSavedBusinesses(businesses)
    } catch (err) {
      console.error(err)
      setError('Failed to load saved pages.')
    } finally {
      setLoadingPages(false)
    }
  }

  async function openMyPagesTab() {
    setActiveTab('pages')
    await fetchBusinesses()
  }

  function openCreateTab() {
    setActiveTab('create')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!user) {
      setError('You must be logged in.')
      return
    }

    setLoading(true)
    setMessage('')
    setError('')

    try {
      const slugQuery = query(collection(db, 'businesses'), where('slug', '==', slug))
      const slugSnapshot = await getDocs(slugQuery)

      const slugAlreadyExists = slugSnapshot.docs.some(
        (document) => document.id !== editingId
      )

      if (slugAlreadyExists) {
        throw new Error('A page with this business name already exists.')
      }

      const payload = {
        ownerId: user.uid,
        name: form.businessName.trim(),
        tagline: form.tagline.trim(),
        slug,
        template: form.template,
        logoUrl: form.logoUrl.trim(),
        isPublished: form.isPublished,
        links,
        updatedAt: serverTimestamp(),
      }

      if (editingId) {
        await updateDoc(doc(db, 'businesses', editingId), payload)
        setMessage(`Page updated successfully: /preview/${slug}`)
      } else {
        await addDoc(collection(db, 'businesses'), {
          ...payload,
          views: 0,
          clicks: 0,
          createdAt: serverTimestamp(),
        })

        setMessage(`Page created successfully: /preview/${slug}`)
      }

      setForm(initialForm)
      setEditingId(null)
      await fetchBusinesses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save page.')
    } finally {
      setLoading(false)
    }
  }

  async function handleEdit(id: string) {
    setLoadingEdit(true)
    setMessage('')
    setError('')

    try {
      const snapshot = await getDoc(doc(db, 'businesses', id))

      if (!snapshot.exists()) {
        throw new Error('Page not found.')
      }

      const data = snapshot.data()
      const businessLinks = (data.links || []) as LinkItem[]

      const nextForm: FormData = {
        businessName: data.name || '',
        tagline: data.tagline || '',
        template: data.template || 'classic-dark',
        logoUrl: data.logoUrl || '',
        isPublished: Boolean(data.isPublished),
        whatsapp: '',
        instagram: '',
        googleReviews: '',
        facebook: '',
        website: '',
      }

      for (const link of businessLinks) {
        if (link.type === 'whatsapp') nextForm.whatsapp = link.url
        if (link.type === 'instagram') nextForm.instagram = link.url
        if (link.type === 'google-reviews') nextForm.googleReviews = link.url
        if (link.type === 'facebook') nextForm.facebook = link.url
        if (link.type === 'website') nextForm.website = link.url
      }

      setForm(nextForm)
      setEditingId(id)
      setActiveTab('create')
      setMessage('Page loaded for editing.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load page.')
    } finally {
      setLoadingEdit(false)
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm('Are you sure you want to delete this page?')
    if (!confirmed) return

    setDeletingId(id)
    setMessage('')
    setError('')

    try {
      await deleteDoc(doc(db, 'businesses', id))

      setSavedBusinesses((prev) => prev.filter((business) => business.id !== id))

      if (editingId === id) resetForm()

      setMessage('Page deleted successfully.')
    } catch {
      setError('Failed to delete page.')
    } finally {
      setDeletingId('')
    }
  }

  async function copyPublicLink(slugValue: string) {
    const fullUrl = `${SITE_URL}/preview/${slugValue}`

    try {
      await navigator.clipboard.writeText(fullUrl)
      setMessage('Link copied successfully.')
      setError('')
      setTimeout(() => setMessage(''), 2500)
    } catch {
      setError('Failed to copy link.')
    }
  }

  function downloadQRCode(slugValue: string) {
    const canvas = document.getElementById(`qr-${slugValue}`) as HTMLCanvasElement | null

    if (!canvas) {
      setError('QR code not found.')
      return
    }

    const pngUrl = canvas.toDataURL('image/png')

    const link = document.createElement('a')
    link.href = pngUrl
    link.download = `${slugValue}-qr.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setMessage('QR code downloaded successfully.')
    setError('')
    setTimeout(() => setMessage(''), 2500)
  }

  async function togglePublish(business: Business) {
    try {
      await updateDoc(doc(db, 'businesses', business.id), {
        isPublished: !business.isPublished,
      })

      setSavedBusinesses((prev) =>
        prev.map((item) =>
          item.id === business.id
            ? { ...item, isPublished: !item.isPublished }
            : item
        )
      )

      setMessage(business.isPublished ? 'Page unpublished.' : 'Page published.')
    } catch {
      setError('Failed to update publish status.')
    }
  }

  function toggleQr(id: string) {
    setOpenQrId((prev) => (prev === id ? null : id))
  }

  async function handleLogout() {
    await signOut(auth)
    router.push('/')
  }

  function renderLogo(src: string, alt: string, shape: 'circle' | 'square' = 'circle') {
  if (!src) return null

  if (shape === 'square') {
    return (
      <div className="mb-4 h-24 w-24 overflow-hidden rounded-3xl bg-white p-2 shadow-md">
        <Image
          src={src}
          alt={alt}
          width={96}
          height={96}
          className="h-full w-full rounded-2xl object-cover"
          unoptimized
        />
      </div>
    )
  }

  return (
    <div className="mb-4 h-24 w-24 overflow-hidden rounded-full bg-white p-1 shadow-md">
      <Image
        src={src}
        alt={alt}
        width={96}
        height={96}
        className="h-full w-full rounded-full object-cover"
        unoptimized
      />
    </div>
  )
}

  function renderPreviewCard() {
    const hasLogo = Boolean(form.logoUrl)

    const previewLinks =
      links.length > 0
        ? links
        : [
            { type: 'whatsapp', label: 'WhatsApp', url: '#' },
            { type: 'instagram', label: 'Instagram', url: '#' },
            { type: 'google', label: 'Google Reviews', url: '#' },
          ]

    if (form.template === 'minimal-light') {
      return (
        <div className="flex min-h-[430px] flex-col items-center rounded-[20px] border border-[var(--border)] bg-[#faf6f1] px-5 py-6 text-center text-[var(--text)]">
          {hasLogo ? (
            renderLogo(form.logoUrl, 'Business logo', 'circle')
            
          ) : (
            <div className="mb-4 h-16 w-16 rounded-full bg-[var(--border)]" />
          )}

          <h3 className="text-lg font-semibold">
            {form.businessName || 'Business Name'}
          </h3>

          <p className="mt-1 text-sm text-[var(--mocha)]/70">
            {form.tagline || 'Tap to connect'}
          </p>

          <div className="mt-8 w-full space-y-3">
            {previewLinks.map((link) => (
              <div
                key={link.type}
                className="rounded-full border border-[var(--border)] bg-white px-4 py-3 text-sm"
              >
                {link.label}
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (form.template === 'warm-card') {
      return (
        <div className="flex min-h-[430px] flex-col items-center rounded-[28px] bg-[linear-gradient(180deg,#f3e7d8_0%,#e5cfb5_100%)] px-5 py-6 text-center text-[var(--text)] shadow-lg">
          {hasLogo ? (
            
            renderLogo(form.logoUrl, 'Business logo', 'square')
            
          ) : (
            <div className="mb-4 h-20 w-20 rounded-2xl bg-white/50" />
          )}

          <h3 className="text-xl font-bold">
            {form.businessName || 'Business Name'}
          </h3>

          <p className="mt-1 text-sm text-[var(--mocha)]/80">
            {form.tagline || 'Tap to connect'}
          </p>

          <div className="mt-8 w-full space-y-3">
            {previewLinks.map((link) => (
              <div
                key={link.type}
                className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-medium shadow-sm"
              >
                {link.label}
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="flex min-h-[430px] flex-col items-center rounded-[20px] bg-[linear-gradient(180deg,#3d2b1f_0%,#201710_100%)] px-5 py-6 text-center text-white">
        {hasLogo ? (
          renderLogo(form.logoUrl, 'Business logo', 'circle')
        ) : (
          <div className="mb-5 h-16 w-16 rounded-full bg-white/10" />
        )}

        <h3 className="text-lg font-semibold">
          {form.businessName || 'Business Name'}
        </h3>

        <p className="mt-1 text-sm text-white/70">
          {form.tagline || 'Tap to connect'}
        </p>

        <div className="mt-8 w-full space-y-3">
          {previewLinks.map((link) => (
            <div key={link.type} className="rounded-full bg-white/10 px-4 py-3 text-sm">
              {link.label}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <p className="text-sm text-[var(--mocha)]">Loading dashboard...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#b8926b_0%,#8f6d4e_100%)] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold sm:text-4xl">NFC Link Hub Builder</h1>
            <p className="mt-2 text-sm text-white/80 sm:text-base">
              Create simple landing pages for your NFC tags
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[var(--text)]"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.7fr_0.9fr]">
          <section className="rounded-[28px] bg-[rgba(255,255,255,0.9)] p-5 shadow-2xl backdrop-blur-md sm:p-8">
            <div className="mb-6 flex items-center gap-6 border-b border-[var(--border)] pb-3 text-sm font-semibold">
              <button
                type="button"
                onClick={openCreateTab}
                className={`pb-2 ${
                  activeTab === 'create'
                    ? 'border-b-2 border-[var(--brand)] text-[var(--text)]'
                    : 'text-[var(--mocha)]/60'
                }`}
              >
                Create New
              </button>

              <button
                type="button"
                onClick={openMyPagesTab}
                className={`pb-2 ${
                  activeTab === 'pages'
                    ? 'border-b-2 border-[var(--brand)] text-[var(--text)]'
                    : 'text-[var(--mocha)]/60'
                }`}
              >
                My Pages
              </button>
            </div>

            {activeTab === 'create' ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[var(--text)] sm:text-2xl">
                    {editingId ? 'Edit Page' : 'Choose a Template'}
                  </h2>

                  {editingId ? (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]"
                    >
                      Cancel Edit
                    </button>
                  ) : null}
                </div>

                <div className="mb-8 grid gap-4 md:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => updateField('template', 'classic-dark')}
                    className={`rounded-2xl bg-white p-3 text-left shadow-sm ${
                      form.template === 'classic-dark'
                        ? 'border-2 border-[var(--brand)]'
                        : 'border border-[var(--border)]'
                    }`}
                  >
                    <div className="h-28 rounded-xl bg-[linear-gradient(180deg,#3d2b1f_0%,#201710_100%)]" />
                    <p className="mt-3 text-center text-sm font-semibold text-[var(--text)]">
                      Classic Dark
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateField('template', 'minimal-light')}
                    className={`rounded-2xl bg-white p-3 text-left shadow-sm ${
                      form.template === 'minimal-light'
                        ? 'border-2 border-[var(--brand)]'
                        : 'border border-[var(--border)]'
                    }`}
                  >
                    <div className="h-28 rounded-xl border border-[var(--border)] bg-[#f8f4ef]" />
                    <p className="mt-3 text-center text-sm font-semibold text-[var(--text)]">
                      Minimal Light
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateField('template', 'warm-card')}
                    className={`rounded-2xl bg-white p-3 text-left shadow-sm ${
                      form.template === 'warm-card'
                        ? 'border-2 border-[var(--brand)]'
                        : 'border border-[var(--border)]'
                    }`}
                  >
                    <div className="h-28 rounded-xl bg-[linear-gradient(180deg,#f3e7d8_0%,#e5cfb5_100%)]" />
                    <p className="mt-3 text-center text-sm font-semibold text-[var(--text)]">
                      Warm Card
                    </p>
                  </button>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => updateField('businessName', e.target.value)}
                    placeholder="Business name"
                    className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                    required
                  />

                  <input
                    type="text"
                    value={form.tagline}
                    onChange={(e) => updateField('tagline', e.target.value)}
                    placeholder="Tagline"
                    className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                  />

                  <input
                    type="text"
                    value={slug}
                    readOnly
                    className="w-full rounded-xl border border-[var(--border)] bg-[#f5efe8] px-4 py-3 text-sm text-[var(--mocha)]"
                  />

                  <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3">
                    <input
                      id="publish-toggle"
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(e) => updateField('isPublished', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <label htmlFor="publish-toggle" className="text-sm font-medium text-[var(--text)]">
                      Publish this page
                    </label>
                  </div>

                  <div className="rounded-xl border border-[var(--border)] bg-white p-4">
                    <label className="mb-2 block text-sm font-medium text-[var(--text)]">
                      Upload Logo
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="w-full text-sm text-[var(--mocha)]"
                    />

                    {uploadingLogo ? (
                      <p className="mt-2 text-xs text-[var(--mocha)]">Uploading...</p>
                    ) : null}

                    {form.logoUrl ? (
                      <div className="mt-4 flex items-center gap-3">
                        <Image
                          src={form.logoUrl}
                          alt="Uploaded logo"
                          width={56}
                          height={56}
                          className="h-14 w-14 rounded-full border border-[var(--border)] object-cover"
                          unoptimized
                        />
                        <p className="text-xs text-green-700">Logo uploaded</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="pt-2">
                    <h3 className="mb-3 text-lg font-semibold text-[var(--text)]">
                      Social Links
                    </h3>

                    <div className="space-y-3">
                      <input
                        value={form.whatsapp}
                        onChange={(e) => updateField('whatsapp', e.target.value)}
                        placeholder="WhatsApp URL"
                        className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                      />

                      <input
                        value={form.instagram}
                        onChange={(e) => updateField('instagram', e.target.value)}
                        placeholder="Instagram URL"
                        className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                      />

                      <input
                        value={form.googleReviews}
                        onChange={(e) => updateField('googleReviews', e.target.value)}
                        placeholder="Google Reviews URL"
                        className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                      />

                      <input
                        value={form.facebook}
                        onChange={(e) => updateField('facebook', e.target.value)}
                        placeholder="Facebook URL"
                        className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                      />

                      <input
                        value={form.website}
                        onChange={(e) => updateField('website', e.target.value)}
                        placeholder="Website URL"
                        className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                      />
                    </div>
                  </div>

                  {message ? <p className="text-sm font-medium text-green-700">{message}</p> : null}
                  {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

                  <button
                    type="submit"
                    disabled={loading || uploadingLogo}
                    className="mt-4 w-full rounded-xl bg-[linear-gradient(135deg,#b8926b_0%,#8f6d4e_100%)] px-4 py-3 text-sm font-semibold text-white shadow-lg disabled:opacity-60"
                  >
                    {loading
                      ? editingId
                        ? 'Updating...'
                        : 'Creating...'
                      : editingId
                        ? 'Update Page'
                        : '+ Create Page'}
                  </button>
                </form>
              </>
            ) : (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[var(--text)]">
                    Saved Pages
                  </h2>

                  <button
                    type="button"
                    onClick={fetchBusinesses}
                    className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)]"
                  >
                    Refresh
                  </button>
                </div>

                {message ? <p className="mb-4 text-sm font-medium text-green-700">{message}</p> : null}
                {error ? <p className="mb-4 text-sm font-medium text-red-700">{error}</p> : null}

                {loadingPages ? (
                  <p className="text-sm text-[var(--mocha)]/70">Loading pages...</p>
                ) : savedBusinesses.length === 0 ? (
                  <div className="rounded-2xl border border-[var(--border)] bg-white p-5 text-sm text-[var(--mocha)]/70">
                    No pages created yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedBusinesses.map((business) => {
                      const publicUrl = `${SITE_URL}/preview/${business.slug}`

                      return (
                        <div
                          key={business.id}
                          className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-semibold text-[var(--text)]">
                                  {business.name}
                                </h3>

                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                                    business.isPublished
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {business.isPublished ? 'Published' : 'Draft'}
                                </span>
                              </div>

                              <p className="mt-1 text-sm text-[var(--mocha)]/70">
                                {business.tagline || 'No tagline'}
                              </p>

                              <p className="mt-2 text-xs text-[var(--mocha)]/60">
                                /preview/{business.slug}
                              </p>

                              <p className="mt-2 text-xs text-[var(--mocha)]/70">
                                👁 {business.views} views • 🔗 {business.clicks} clicks
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Link
                                href={`/preview/${business.slug}`}
                                target="_blank"
                                className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text)]"
                              >
                                Preview
                              </Link>

                              <Link
                                href={`/flyer/${business.slug}`}
                                target="_blank"
                                className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text)]"
                              >
                                Flyer
                              </Link>

                              <button
                                type="button"
                                onClick={() => copyPublicLink(business.slug)}
                                className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[#f8f4ef]"
                              >
                                Copy Link
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleQr(business.id)}
                                className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text)]"
                              >
                                {openQrId === business.id ? 'Hide QR' : 'Show QR'}
                              </button>

                              <button
                                type="button"
                                onClick={() => togglePublish(business)}
                                className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text)]"
                              >
                                {business.isPublished ? 'Unpublish' : 'Publish'}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleEdit(business.id)}
                                disabled={loadingEdit}
                                className="rounded-lg bg-[var(--text)] px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                              >
                                {loadingEdit ? 'Loading...' : 'Edit'}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(business.id)}
                                disabled={deletingId === business.id}
                                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                              >
                                {deletingId === business.id ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          </div>

                          {openQrId === business.id ? (
                            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[#faf6f1] p-4">
                              <div className="flex flex-col items-center gap-3 text-center">
                                <QRCodeCanvas
                                  id={`qr-${business.slug}`}
                                  value={publicUrl}
                                  size={180}
                                  bgColor="#ffffff"
                                  fgColor="#000000"
                                  level="H"
                                />

                                <p className="text-sm text-[var(--mocha)]/70">
                                  Scan this QR code to open the page
                                </p>

                                <p className="break-all text-xs text-[var(--mocha)]/60">
                                  {publicUrl}
                                </p>

                                <button
                                  type="button"
                                  onClick={() => downloadQRCode(business.slug)}
                                  className="mt-2 rounded-lg bg-[var(--text)] px-4 py-2 text-sm font-medium text-white"
                                >
                                  Download QR
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </section>

          <aside className="h-fit rounded-[28px] bg-[rgba(255,255,255,0.9)] p-5 shadow-2xl backdrop-blur-md">
            <h2 className="mb-4 text-xl font-semibold text-[var(--text)]">
              Preview
            </h2>

            <div className="mx-auto w-full max-w-[280px] rounded-[24px] bg-white p-4 shadow-inner">
              {renderPreviewCard()}
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}