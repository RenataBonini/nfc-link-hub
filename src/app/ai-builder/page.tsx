'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

type TemplateType = 'classic-dark' | 'minimal-light' | 'warm-card'
type FlyerTemplate = 'classic-nfc' | 'luxury-card' | 'bold-promo'

type ColorPalette = {
  primary?: string
  secondary?: string
  background: string
  accent: string
}

type Recommendation = {
  personaName: string
  personaDescription: string
  recommendedTemplate: TemplateType
  flyerTemplate: FlyerTemplate
  recommendedCTA: string
  recommendedTagline: string
  pageHeadline?: string
  pageDescription?: string
  recommendedLinks: string[]
  colorPalette?: ColorPalette
  flyerHeadline?: string
  flyerSubtext?: string
  flyerCallout?: string
  flyerRecommendation: string
  reason: string
}

type SavedRecommendation = {
  id: string
  businessType: string
  targetAudience: string
  customerAge: string
  brandStyle: string
  mainGoal: string
  primaryPlatform: string
  tone: string
  recommendation: Recommendation
}

const defaultColorPalette: ColorPalette = {
  primary: '#2b211b',
  secondary: '#8f6d4e',
  background: '#f5efe8',
  accent: '#b8926b',
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

function isFlyerTemplate(value: unknown): value is FlyerTemplate {
  return value === 'classic-nfc' || value === 'luxury-card' || value === 'bold-promo'
}

export default function AIBuilderPage() {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [form, setForm] = useState(initialForm)
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [savedRecommendations, setSavedRecommendations] = useState<SavedRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSaved, setLoadingSaved] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        await fetchSavedRecommendations(currentUser.uid)
      }
    })

    return () => unsubscribe()
  }, [])

  function updateField(key: keyof typeof initialForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function useRecommendationInDashboard() {
    if (!recommendation) return

    const palette = recommendation.colorPalette || defaultColorPalette

    localStorage.setItem(
      'aiRecommendation',
      JSON.stringify({
        template: recommendation.recommendedTemplate,
        flyerTemplate: recommendation.flyerTemplate || 'classic-nfc',
        tagline: recommendation.recommendedTagline,
        pageHeadline: recommendation.pageHeadline || '',
        pageDescription: recommendation.pageDescription || '',
        colorPalette: palette,
        flyerHeadline: recommendation.flyerHeadline || '',
        flyerSubtext: recommendation.flyerSubtext || '',
        flyerCallout: recommendation.flyerCallout || '',
        recommendedCTA: recommendation.recommendedCTA,
        recommendedLinks: recommendation.recommendedLinks || [],
      })
    )

    router.push('/dashboard')
  }

  async function fetchSavedRecommendations(ownerId: string) {
    setLoadingSaved(true)

    try {
      const q = query(
        collection(db, 'aiRecommendations'),
        where('ownerId', '==', ownerId)
      )

      const snapshot = await getDocs(q)

      const items = snapshot.docs.map((document) => {
        const data = document.data()
        const savedRecommendation = data.recommendation || {}

        return {
          id: document.id,
          businessType: data.businessType || '',
          targetAudience: data.targetAudience || '',
          customerAge: data.customerAge || '',
          brandStyle: data.brandStyle || '',
          mainGoal: data.mainGoal || '',
          primaryPlatform: data.primaryPlatform || '',
          tone: data.tone || '',
          recommendation: {
            ...savedRecommendation,
            flyerTemplate: isFlyerTemplate(savedRecommendation.flyerTemplate)
              ? savedRecommendation.flyerTemplate
              : 'classic-nfc',
            colorPalette: savedRecommendation.colorPalette || defaultColorPalette,
            pageHeadline: savedRecommendation.pageHeadline || '',
            pageDescription: savedRecommendation.pageDescription || '',
            flyerHeadline: savedRecommendation.flyerHeadline || '',
            flyerSubtext: savedRecommendation.flyerSubtext || '',
            flyerCallout: savedRecommendation.flyerCallout || '',
            recommendedLinks: savedRecommendation.recommendedLinks || [],
          },
        } as SavedRecommendation
      })

      setSavedRecommendations(items)
    } catch (err) {
      console.error(err)
      setError('Could not load saved AI recommendations.')
    } finally {
      setLoadingSaved(false)
    }
  }

  async function saveRecommendation(aiRecommendation: Recommendation) {
    if (!user) {
      setError('You must be logged in to save recommendations.')
      return
    }

    await addDoc(collection(db, 'aiRecommendations'), {
      ownerId: user.uid,
      businessType: form.businessType,
      targetAudience: form.targetAudience,
      customerAge: form.customerAge,
      brandStyle: form.brandStyle,
      mainGoal: form.mainGoal,
      primaryPlatform: form.primaryPlatform,
      tone: form.tone,
      recommendation: {
        ...aiRecommendation,
        flyerTemplate: aiRecommendation.flyerTemplate || 'classic-nfc',
        colorPalette: aiRecommendation.colorPalette || defaultColorPalette,
      },
      createdAt: serverTimestamp(),
    })

    await fetchSavedRecommendations(user.uid)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
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

      const nextRecommendation: Recommendation = {
        ...data,
        flyerTemplate: isFlyerTemplate(data.flyerTemplate)
          ? data.flyerTemplate
          : 'classic-nfc',
        colorPalette: data.colorPalette || defaultColorPalette,
        pageHeadline: data.pageHeadline || '',
        pageDescription: data.pageDescription || '',
        flyerHeadline: data.flyerHeadline || '',
        flyerSubtext: data.flyerSubtext || '',
        flyerCallout: data.flyerCallout || '',
        recommendedLinks: data.recommendedLinks || [],
      }

      setRecommendation(nextRecommendation)
      await saveRecommendation(nextRecommendation)
      setMessage('AI recommendation generated and saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function loadSavedRecommendation(saved: SavedRecommendation) {
    const nextRecommendation: Recommendation = {
      ...saved.recommendation,
      flyerTemplate: saved.recommendation.flyerTemplate || 'classic-nfc',
      colorPalette: saved.recommendation.colorPalette || defaultColorPalette,
      pageHeadline: saved.recommendation.pageHeadline || '',
      pageDescription: saved.recommendation.pageDescription || '',
      flyerHeadline: saved.recommendation.flyerHeadline || '',
      flyerSubtext: saved.recommendation.flyerSubtext || '',
      flyerCallout: saved.recommendation.flyerCallout || '',
      recommendedLinks: saved.recommendation.recommendedLinks || [],
    }

    setForm({
      businessType: saved.businessType,
      targetAudience: saved.targetAudience,
      customerAge: saved.customerAge,
      brandStyle: saved.brandStyle,
      mainGoal: saved.mainGoal,
      primaryPlatform: saved.primaryPlatform,
      tone: saved.tone,
    })

    setRecommendation(nextRecommendation)
    setMessage('Saved recommendation loaded.')
    setError('')
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
              Generate and save AI branding, colours, page content, and flyer recommendations.
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
              <select
                value={form.businessType}
                onChange={(e) => updateField('businessType', e.target.value)}
                className="w-full rounded-xl border border-[#d8c7b8] bg-white px-4 py-3 text-sm"
                required
              >
                <option value="">Business Type</option>
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

              <textarea
                value={form.targetAudience}
                onChange={(e) => updateField('targetAudience', e.target.value)}
                placeholder="Target audience"
                className="min-h-24 w-full rounded-xl border border-[#d8c7b8] bg-white px-4 py-3 text-sm"
                required
              />

              <select
                value={form.customerAge}
                onChange={(e) => updateField('customerAge', e.target.value)}
                className="w-full rounded-xl border border-[#d8c7b8] bg-white px-4 py-3 text-sm"
                required
              >
                <option value="">Customer Age</option>
                <option>Under 18</option>
                <option>18-24</option>
                <option>25-34</option>
                <option>35-44</option>
                <option>45-54</option>
                <option>55+</option>
                <option>Mixed age groups</option>
              </select>

              <select
                value={form.brandStyle}
                onChange={(e) => updateField('brandStyle', e.target.value)}
                className="w-full rounded-xl border border-[#d8c7b8] bg-white px-4 py-3 text-sm"
                required
              >
                <option value="">Brand Style</option>
                <option>Luxury</option>
                <option>Minimal</option>
                <option>Modern</option>
                <option>Fun</option>
                <option>Elegant</option>
                <option>Bold</option>
                <option>Friendly</option>
              </select>

              <select
                value={form.mainGoal}
                onChange={(e) => updateField('mainGoal', e.target.value)}
                className="w-full rounded-xl border border-[#d8c7b8] bg-white px-4 py-3 text-sm"
                required
              >
                <option value="">Main Goal</option>
                <option>More WhatsApp messages</option>
                <option>More Instagram followers</option>
                <option>More Google reviews</option>
                <option>More bookings</option>
                <option>More website visits</option>
                <option>Promote offers</option>
              </select>

              <select
                value={form.primaryPlatform}
                onChange={(e) => updateField('primaryPlatform', e.target.value)}
                className="w-full rounded-xl border border-[#d8c7b8] bg-white px-4 py-3 text-sm"
                required
              >
                <option value="">Primary Platform</option>
                <option>WhatsApp</option>
                <option>Instagram</option>
                <option>Google Reviews</option>
                <option>Website</option>
                <option>Facebook</option>
                <option>Bookings page</option>
              </select>

              <select
                value={form.tone}
                onChange={(e) => updateField('tone', e.target.value)}
                className="w-full rounded-xl border border-[#d8c7b8] bg-white px-4 py-3 text-sm"
                required
              >
                <option value="">Tone</option>
                <option>Professional</option>
                <option>Friendly</option>
                <option>Premium</option>
                <option>Casual</option>
                <option>Energetic</option>
                <option>Calm</option>
              </select>

              {message ? (
                <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  {message}
                </p>
              ) : null}

              {error ? (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading || !user}
                className="w-full rounded-xl bg-[#2b211b] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading ? 'Generating recommendation...' : 'Generate & Save Recommendation'}
              </button>
            </form>
          </section>

          <section className="space-y-6">
            <div className="rounded-[28px] bg-white/95 p-6 shadow-2xl sm:p-8">
              <h2 className="mb-5 text-2xl font-bold text-[#2b211b]">
                AI Recommendation
              </h2>

              {!recommendation ? (
                <div className="rounded-2xl border border-dashed border-[#d8c7b8] bg-[#f5efe8] p-6 text-sm leading-6 text-[#8f6d4e]">
                  Complete the questionnaire to receive a saved recommendation.
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
                      <p className="text-xs text-[#8f6d4e]">Page Template</p>
                      <p className="mt-1 font-semibold text-[#2b211b]">
                        {recommendation.recommendedTemplate}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#d8c7b8] p-4">
                      <p className="text-xs text-[#8f6d4e]">Flyer Template</p>
                      <p className="mt-1 font-semibold text-[#2b211b]">
                        {recommendation.flyerTemplate || 'classic-nfc'}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#d8c7b8] p-4">
                    <p className="text-xs text-[#8f6d4e]">Main CTA</p>
                    <p className="mt-1 font-semibold text-[#2b211b]">
                      {recommendation.recommendedCTA}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#d8c7b8] p-4">
                    <p className="text-xs text-[#8f6d4e]">Suggested Tagline</p>
                    <p className="mt-1 font-semibold text-[#2b211b]">
                      {recommendation.recommendedTagline}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#d8c7b8] p-4">
                    <p className="text-xs text-[#8f6d4e]">Page Headline</p>
                    <p className="mt-1 font-semibold text-[#2b211b]">
                      {recommendation.pageHeadline || 'No headline provided'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#d8c7b8] p-4">
                    <p className="text-xs text-[#8f6d4e]">Page Description</p>
                    <p className="mt-1 text-sm leading-6 text-[#2b211b]">
                      {recommendation.pageDescription || 'No description provided'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#d8c7b8] p-4">
                    <p className="text-xs text-[#8f6d4e]">Recommended Links</p>
                    <ul className="mt-2 list-inside list-disc text-sm text-[#2b211b]">
                      {(recommendation.recommendedLinks || []).map((link) => (
                        <li key={link}>{link}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-[#d8c7b8] p-4">
                    <p className="text-xs text-[#8f6d4e]">Suggested Colours</p>

                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {Object.entries(recommendation.colorPalette || defaultColorPalette).map(
                        ([name, value]) => (
                          <div key={name} className="text-center">
                            <div
                              className="mx-auto h-10 w-10 rounded-full border"
                              style={{ backgroundColor: value }}
                            />
                            <p className="mt-1 text-[10px] text-[#8f6d4e]">
                              {name}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#d8c7b8] p-4">
                    <p className="text-xs text-[#8f6d4e]">Flyer Wording</p>
                    <p className="mt-1 font-semibold text-[#2b211b]">
                      {recommendation.flyerHeadline || 'No flyer headline provided'}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#2b211b]">
                      {recommendation.flyerSubtext || 'No flyer subtext provided'}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#8f6d4e]">
                      {recommendation.flyerCallout || 'No flyer callout provided'}
                    </p>
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

                  <button
                    type="button"
                    onClick={useRecommendationInDashboard}
                    className="block w-full rounded-xl bg-[#8f6d4e] px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    Use This Recommendation
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-[28px] bg-white/95 p-6 shadow-2xl sm:p-8">
              <h2 className="mb-4 text-2xl font-bold text-[#2b211b]">
                Saved Recommendations
              </h2>

              {loadingSaved ? (
                <p className="text-sm text-[#8f6d4e]">
                  Loading saved recommendations...
                </p>
              ) : savedRecommendations.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[#d8c7b8] bg-[#f5efe8] p-5 text-sm text-[#8f6d4e]">
                  No saved recommendations yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {savedRecommendations.map((saved) => (
                    <button
                      key={saved.id}
                      type="button"
                      onClick={() => loadSavedRecommendation(saved)}
                      className="w-full rounded-2xl border border-[#d8c7b8] bg-white p-4 text-left transition hover:bg-[#f5efe8]"
                    >
                      <p className="text-sm font-semibold text-[#2b211b]">
                        {saved.recommendation.personaName}
                      </p>
                      <p className="mt-1 text-xs text-[#8f6d4e]">
                        {saved.businessType} • {saved.mainGoal}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}