'use client'

import Link from 'next/link'
import { useState } from 'react'

type Recommendation = {
  personaName: string
  personaDescription: string
  recommendedTemplate: 'classic-dark' | 'minimal-light' | 'warm-card'
  recommendedCTA: string
  recommendedTagline: string
  recommendedLinks: string[]
  flyerRecommendation: string
  reason: string
}

const initialForm = {
  businessType: '',
  targetAudience: '',
  customerAge: '',
  brandStyle: '',
  mainGoal: '',
  primaryPlatform: '',
  tone: '',
}

export default function AIBuilderPage() {
  const [form, setForm] = useState(initialForm)
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function updateField(key: keyof typeof initialForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setRecommendation(null)

    try {
      const response = await fetch('/api/ai-persona', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'AI recommendation failed.')
      }

      setRecommendation(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#b8926b_0%,#8f6d4e_100%)] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              AI Persona Builder
            </h1>
            <p className="mt-2 text-sm text-white/80">
              Answer a few questions and get a recommended NFC landing page strategy.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#2b211b]"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-[28px] bg-white/95 p-6 shadow-2xl sm:p-8">
            <h2 className="mb-5 text-2xl font-bold text-[#2b211b]">
              Business Questionnaire
            </h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#5c4636]">
                  Business Type
                </label>
                <select
                  value={form.businessType}
                  onChange={(e) => updateField('businessType', e.target.value)}
                  className="w-full rounded-xl border border-[#d8c7b8] bg-white px-4 py-3 text-sm"
                  required
                >
                  <option value="">Choose one</option>
                  <option>Restaurant</option>
                  <option>Beauty Salon</option>
                  <option>Coffee Shop</option>
                  <option>Gym</option>
                  <option>Real Estate</option>
                  <option>Clothing Store</option>
                  <option>Freelancer</option>
                  <option>Event Business</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#5c4636]">
                  Target Audience
                </label>
                <textarea
                  value={form.targetAudience}
                  onChange={(e) => updateField('targetAudience', e.target.value)}
                  placeholder="Example: young professionals, local families, students, beauty clients..."
                  className="min-h-24 w-full rounded-xl border border-[#d8c7b8] bg-white px-4 py-3 text-sm"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#5c4636]">
                  Customer Age
                </label>
                <select
                  value={form.customerAge}
                  onChange={(e) => updateField('customerAge', e.target.value)}
                  className="w-full rounded-xl border border-[#d8c7b8] bg-white px-4 py-3 text-sm"
                  required
                >
                  <option value="">Choose one</option>
                  <option>Under 18</option>
                  <option>18-24</option>
                  <option>25-34</option>
                  <option>35-44</option>
                  <option>45-54</option>
                  <option>55+</option>
                  <option>Mixed age groups</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#5c4636]">
                  Brand Style
                </label>
                <select
                  value={form.brandStyle}
                  onChange={(e) => updateField('brandStyle', e.target.value)}
                  className="w-full rounded-xl border border-[#d8c7b8] bg-white px-4 py-3 text-sm"
                  required
                >
                  <option value="">Choose one</option>
                  <option>Luxury</option>
                  <option>Minimal</option>
                  <option>Modern</option>
                  <option>Fun</option>
                  <option>Elegant</option>
                  <option>Bold</option>
                  <option>Friendly</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#5c4636]">
                  Main Goal
                </label>
                <select
                  value={form.mainGoal}
                  onChange={(e) => updateField('mainGoal', e.target.value)}
                  className="w-full rounded-xl border border-[#d8c7b8] bg-white px-4 py-3 text-sm"
                  required
                >
                  <option value="">Choose one</option>
                  <option>More WhatsApp messages</option>
                  <option>More Instagram followers</option>
                  <option>More Google reviews</option>
                  <option>More bookings</option>
                  <option>More website visits</option>
                  <option>Promote offers</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#5c4636]">
                  Primary Platform
                </label>
                <select
                  value={form.primaryPlatform}
                  onChange={(e) => updateField('primaryPlatform', e.target.value)}
                  className="w-full rounded-xl border border-[#d8c7b8] bg-white px-4 py-3 text-sm"
                  required
                >
                  <option value="">Choose one</option>
                  <option>WhatsApp</option>
                  <option>Instagram</option>
                  <option>Google Reviews</option>
                  <option>Website</option>
                  <option>Facebook</option>
                  <option>Bookings page</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#5c4636]">
                  Tone
                </label>
                <select
                  value={form.tone}
                  onChange={(e) => updateField('tone', e.target.value)}
                  className="w-full rounded-xl border border-[#d8c7b8] bg-white px-4 py-3 text-sm"
                  required
                >
                  <option value="">Choose one</option>
                  <option>Professional</option>
                  <option>Friendly</option>
                  <option>Premium</option>
                  <option>Casual</option>
                  <option>Energetic</option>
                  <option>Calm</option>
                </select>
              </div>

              {error ? (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#2b211b] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading ? 'Generating recommendation...' : 'Generate AI Recommendation'}
              </button>
            </form>
          </section>

          <section className="rounded-[28px] bg-white/95 p-6 shadow-2xl sm:p-8">
            <h2 className="mb-5 text-2xl font-bold text-[#2b211b]">
              AI Recommendation
            </h2>

            {!recommendation ? (
              <div className="rounded-2xl border border-dashed border-[#d8c7b8] bg-[#f5efe8] p-6 text-sm leading-6 text-[#8f6d4e]">
                Complete the questionnaire to receive a recommended customer persona,
                template, CTA, tagline, and flyer strategy.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl bg-[#f5efe8] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8f6d4e]">
                    Persona
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-[#2b211b]">
                    {recommendation.personaName}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#8f6d4e]">
                    {recommendation.personaDescription}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#d8c7b8] p-4">
                    <p className="text-xs text-[#8f6d4e]">Template</p>
                    <p className="mt-1 font-semibold text-[#2b211b]">
                      {recommendation.recommendedTemplate}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#d8c7b8] p-4">
                    <p className="text-xs text-[#8f6d4e]">Main CTA</p>
                    <p className="mt-1 font-semibold text-[#2b211b]">
                      {recommendation.recommendedCTA}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#d8c7b8] p-4">
                  <p className="text-xs text-[#8f6d4e]">Suggested Tagline</p>
                  <p className="mt-1 font-semibold text-[#2b211b]">
                    {recommendation.recommendedTagline}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#d8c7b8] p-4">
                  <p className="text-xs text-[#8f6d4e]">Recommended Links</p>
                  <ul className="mt-2 list-inside list-disc text-sm text-[#2b211b]">
                    {recommendation.recommendedLinks.map((link) => (
                      <li key={link}>{link}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-[#d8c7b8] p-4">
                  <p className="text-xs text-[#8f6d4e]">Flyer Strategy</p>
                  <p className="mt-1 text-sm leading-6 text-[#2b211b]">
                    {recommendation.flyerRecommendation}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#2b211b] p-5 text-white">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                    Why this works
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/85">
                    {recommendation.reason}
                  </p>
                </div>

                <Link
                  href="/dashboard"
                  className="block rounded-xl bg-[#8f6d4e] px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Create Page Using These Recommendations
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}