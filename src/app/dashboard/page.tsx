'use client'

import { useMemo, useState } from 'react'

type LinkItem = {
  type: string
  label: string
  url: string
}

type FormData = {
  businessName: string
  tagline: string
  theme: 'dark-glass' | 'light-minimal'
  whatsapp: string
  instagram: string
  googleReviews: string
  facebook: string
  website: string
}

const initialForm: FormData = {
  businessName: '',
  tagline: '',
  theme: 'dark-glass',
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
  const [form, setForm] = useState<FormData>(initialForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const slug = useMemo(
    () => slugify(form.businessName || 'business-name'),
    [form.businessName]
  )

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const links: LinkItem[] = useMemo(() => {
    const items: LinkItem[] = []

    if (form.whatsapp) {
      items.push({ type: 'whatsapp', label: 'WhatsApp', url: form.whatsapp })
    }
    if (form.instagram) {
      items.push({ type: 'instagram', label: 'Instagram', url: form.instagram })
    }
    if (form.googleReviews) {
      items.push({
        type: 'google-reviews',
        label: 'Google Reviews',
        url: form.googleReviews,
      })
    }
    if (form.facebook) {
      items.push({ type: 'facebook', label: 'Facebook', url: form.facebook })
    }
    if (form.website) {
      items.push({ type: 'website', label: 'Website', url: form.website })
    }

    return items
  }, [form])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerId: 'demo-user-1',
          name: form.businessName,
          tagline: form.tagline,
          slug,
          theme: form.theme,
          links,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create page')
      }

      setMessage(`Page created successfully: /preview/${data.slug}`)
      setForm(initialForm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const isDark = form.theme === 'dark-glass'

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#b8926b_0%,#8f6d4e_100%)] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center text-white">
          <h1 className="text-3xl font-bold sm:text-4xl">NFC Link Hub Builder</h1>
          <p className="mt-2 text-sm text-white/80 sm:text-base">
            Create simple landing pages for your NFC tags
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.7fr_0.9fr]">
          <section className="rounded-[28px] bg-[rgba(255,255,255,0.9)] p-5 shadow-2xl backdrop-blur-md sm:p-8">
            <div className="mb-6 flex items-center gap-6 border-b border-[var(--border)] pb-3 text-sm font-semibold">
              <button className="border-b-2 border-[var(--brand)] pb-2 text-[var(--text)]">
                Create New
              </button>
              <button className="pb-2 text-[var(--mocha)]/60">
                My Pages
              </button>
            </div>

            <div className="mb-8">
              <h2 className="mb-4 text-xl font-semibold text-[var(--text)] sm:text-2xl">
                Choose a Template
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => updateField('theme', 'dark-glass')}
                  className={`rounded-2xl bg-white p-3 text-left shadow-sm ${
                    form.theme === 'dark-glass'
                      ? 'border-2 border-[var(--brand)]'
                      : 'border border-[var(--border)]'
                  }`}
                >
                  <div className="h-28 rounded-xl bg-[linear-gradient(135deg,#3d2b1f,#111827)]" />
                  <p className="mt-3 text-center text-sm font-semibold text-[var(--text)]">
                    Dark Glass
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => updateField('theme', 'light-minimal')}
                  className={`rounded-2xl bg-[#f8f5f1] p-3 text-left ${
                    form.theme === 'light-minimal'
                      ? 'border-2 border-[var(--brand)]'
                      : 'border border-[var(--border)]'
                  }`}
                >
                  <div className="h-28 rounded-xl border border-[var(--border)] bg-[#f2ebe3]" />
                  <p className="mt-3 text-center text-sm font-semibold text-[var(--text)]">
                    Light Minimal
                  </p>
                </button>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--mocha)]">
                  Business Name
                </label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  placeholder="Your Awesome Business"
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--mocha)]">
                  Tagline
                </label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => updateField('tagline', e.target.value)}
                  placeholder="Your catchy tagline"
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--mocha)]">
                  Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  readOnly
                  className="w-full rounded-xl border border-[var(--border)] bg-[#f5efe8] px-4 py-3 text-sm text-[var(--mocha)]"
                />
              </div>

              <div className="pt-2">
                <h3 className="mb-3 text-lg font-semibold text-[var(--text)]">
                  Social Links
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-sm text-[var(--mocha)]">
                      WhatsApp
                    </label>
                    <input
                      value={form.whatsapp}
                      onChange={(e) => updateField('whatsapp', e.target.value)}
                      type="text"
                      placeholder="https://wa.me/your-number"
                      className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-[var(--mocha)]">
                      Instagram
                    </label>
                    <input
                      value={form.instagram}
                      onChange={(e) => updateField('instagram', e.target.value)}
                      type="text"
                      placeholder="https://instagram.com/yourbusiness"
                      className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-[var(--mocha)]">
                      Google Reviews
                    </label>
                    <input
                      value={form.googleReviews}
                      onChange={(e) => updateField('googleReviews', e.target.value)}
                      type="text"
                      placeholder="https://g.page/r/your-review-link"
                      className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-[var(--mocha)]">
                      Facebook
                    </label>
                    <input
                      value={form.facebook}
                      onChange={(e) => updateField('facebook', e.target.value)}
                      type="text"
                      placeholder="https://facebook.com/yourbusiness"
                      className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm text-[var(--mocha)]">
                      Website
                    </label>
                    <input
                      value={form.website}
                      onChange={(e) => updateField('website', e.target.value)}
                      type="text"
                      placeholder="https://yourbusiness.com"
                      className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
                    />
                  </div>
                </div>
              </div>

              {message ? (
                <p className="text-sm font-medium text-green-700">{message}</p>
              ) : null}

              {error ? (
                <p className="text-sm font-medium text-red-700">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-xl bg-[linear-gradient(135deg,#b8926b_0%,#8f6d4e_100%)] px-4 py-3 text-sm font-semibold text-white shadow-lg disabled:opacity-60"
              >
                {loading ? 'Creating...' : '+ Create Page'}
              </button>
            </form>
          </section>

          <aside className="h-fit rounded-[28px] bg-[rgba(255,255,255,0.9)] p-5 shadow-2xl backdrop-blur-md">
            <h2 className="mb-4 text-xl font-semibold text-[var(--text)]">
              Preview
            </h2>

            <div className="mx-auto w-full max-w-[280px] rounded-[24px] bg-white p-4 shadow-inner">
              <div
                className={`flex min-h-[430px] flex-col items-center rounded-[20px] px-5 py-6 text-center ${
                  isDark
                    ? 'bg-[linear-gradient(180deg,#3d2b1f_0%,#201710_100%)] text-white'
                    : 'border border-[var(--border)] bg-[#f8f4ef] text-[var(--text)]'
                }`}
              >
                <div
                  className={`mb-5 h-16 w-16 rounded-full ${
                    isDark ? 'bg-white/10' : 'bg-[var(--border)]'
                  }`}
                />
                <h3 className="text-lg font-semibold">
                  {form.businessName || 'Business Name'}
                </h3>
                <p className={`mt-1 text-sm ${isDark ? 'text-white/70' : 'text-[var(--mocha)]/70'}`}>
                  {form.tagline || 'Tap to connect'}
                </p>

                <div className="mt-8 w-full space-y-3">
                  {links.length > 0 ? (
                    links.map((link) => (
                      <div
                        key={link.type}
                        className={`rounded-full px-4 py-3 text-sm ${
                          isDark
                            ? 'bg-white/10'
                            : 'border border-[var(--border)] bg-white'
                        }`}
                      >
                        {link.label}
                      </div>
                    ))
                  ) : (
                    <>
                      <div className={`rounded-full px-4 py-3 text-sm ${isDark ? 'bg-white/10' : 'border border-[var(--border)] bg-white'}`}>
                        WhatsApp
                      </div>
                      <div className={`rounded-full px-4 py-3 text-sm ${isDark ? 'bg-white/10' : 'border border-[var(--border)] bg-white'}`}>
                        Instagram
                      </div>
                      <div className={`rounded-full px-4 py-3 text-sm ${isDark ? 'bg-white/10' : 'border border-[var(--border)] bg-white'}`}>
                        Google Reviews
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}