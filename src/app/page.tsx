'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useState } from 'react'

export default function HomePage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      router.push('/dashboard')
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-48px)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[32px] border border-[var(--border)] bg-[var(--cream)] p-6 shadow-2xl sm:p-8 lg:p-10">
          <div className="mb-8 text-center lg:text-left">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--brand-dark)]">
              NFC Link Hub
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-[var(--text)] sm:text-5xl">
              Welcome 
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--mocha)]/75 sm:text-base">
              Sign in to create and manage NFC landing pages for your business.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--mocha)]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@business.com"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-dark)] sm:text-base"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--mocha)]">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-dark)] sm:text-base"
                required
              />
            </div>

            {error ? (
              <p className="break-words rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[var(--text)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 sm:text-base"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm text-[var(--mocha)]/70">
            <span>New user?</span>
            <Link href="/register" className="font-semibold text-[var(--brand-dark)]">
              Create account
            </Link>
          </div>
        </section>

        <section className="relative hidden min-h-[650px] overflow-hidden rounded-[36px] border border-[var(--border)] bg-[#efe3d6] shadow-2xl lg:block">
          <Image
            src="/nfc-login.jpg"
            alt="A customer using an NFC tag to access a business landing page"
            fill
            priority
            className="object-cover"
          />

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(32,23,16,0.1)_0%,rgba(32,23,16,0.68)_100%)]" />

          <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
              Smart customer access
            </p>

            <h2 className="max-w-md text-4xl font-bold leading-tight">
              Turn every table, counter, or product into a digital touchpoint.
            </h2>

            <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
              Customers can tap an NFC tag or scan a QR code to connect with WhatsApp,
              Instagram, Google Reviews, and more.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}