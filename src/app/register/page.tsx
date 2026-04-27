'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useState } from 'react'

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      )

      await updateProfile(credential.user, {
        displayName: name.trim(),
      })

      await setDoc(doc(db, 'users', credential.user.uid), {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        createdAt: new Date().toISOString(),
      })

      router.push('/dashboard')
    } catch (err: unknown) {
      console.error(err)

      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Could not create account.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-6 sm:px-6">
      <div className="w-full max-w-sm rounded-[28px] border border-[var(--border)] bg-[var(--cream)] p-6 shadow-2xl sm:max-w-md sm:p-8 md:max-w-lg md:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-[var(--text)] sm:text-4xl">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-[var(--mocha)]/70 sm:text-base">
            Register to manage your NFC landing pages
          </p>
        </div>

        <form className="space-y-4 sm:space-y-5" onSubmit={handleRegister}>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--mocha)]">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm sm:text-base"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--mocha)]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@business.com"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm sm:text-base"
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
              placeholder="Create a password"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm sm:text-base"
              required
              minLength={6}
            />
          </div>

          {error ? (
            <p className="break-words text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--text)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 sm:text-base"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--mocha)]/70">
          <Link href="/" className="font-semibold text-[var(--brand-dark)]">
            Back to login
          </Link>
        </div>
      </div>
    </main>
  )
}