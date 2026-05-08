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
    <main className="min-h-screen bg-[#f7f1eb]">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Image section */}
        <section className="relative min-h-[38vh] overflow-hidden lg:min-h-screen">
          <Image
            src="/nfc-login.jpg"
            alt="Customer using NFC tag"
            fill
            priority
            className="object-cover"
          />

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(32,23,16,0.15)_0%,rgba(32,23,16,0.72)_100%)]" />

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-10 lg:p-14">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
              NFC Link Hub
            </p>

            <h1 className="max-w-xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Turn every tap into a digital connection.
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-6 text-white/85 sm:text-base">
              Create branded NFC landing pages that connect customers to WhatsApp,
              Instagram, Google Reviews, websites, and more.
            </p>
          </div>
        </section>

        {/* Login section */}
        <section className="flex items-center justify-center px-4 py-8 sm:px-8 lg:px-14">
          <div className="w-full max-w-md rounded-[32px] border border-[#d8c7b8] bg-[#fffaf5]/95 p-6 shadow-2xl backdrop-blur sm:p-8 lg:p-10">
            <div className="mb-8 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#8f6d4e]">
                Welcome 
              </p>

              <h2 className="text-4xl font-bold tracking-tight text-[#2b211b] sm:text-5xl">
                Sign in
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#8f6d4e] sm:text-base">
                Access your dashboard and manage your NFC landing pages.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#5c4636]">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@business.com"
                  className="w-full rounded-2xl border border-[#d8c7b8] bg-white px-4 py-3 text-sm text-[#2b211b] outline-none transition focus:border-[#8f6d4e] focus:ring-2 focus:ring-[#8f6d4e]/20 sm:text-base"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#5c4636]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-[#d8c7b8] bg-white px-4 py-3 text-sm text-[#2b211b] outline-none transition focus:border-[#8f6d4e] focus:ring-2 focus:ring-[#8f6d4e]/20 sm:text-base"
                  required
                />
              </div>

              {error ? (
                <p className="break-words rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#2b211b] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60 sm:text-base"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm text-[#8f6d4e]">
              <span>New user?</span>

              <Link href="/register" className="font-semibold text-[#5c4636]">
                Create account
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
