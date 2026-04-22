import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-6 sm:px-6">
      <div className="w-full max-w-sm rounded-[28px] border border-[var(--border)] bg-[var(--cream)] p-6 shadow-2xl sm:max-w-md sm:p-8 md:max-w-lg md:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-[var(--text)] sm:text-4xl">
            NFC Link Hub
          </h1>
          <p className="mt-2 text-sm text-[var(--mocha)]/70 sm:text-base">
            Create NFC landing pages for your business
          </p>
        </div>

        <form className="space-y-4 sm:space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--mocha)]">
              Email
            </label>
            <input
              type="email"
              placeholder="owner@business.com"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--mocha)]">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm sm:text-base"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--text)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 sm:text-base"
          >
            Sign in
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-[var(--mocha)]/70">
          <span>New user?</span>
          <Link href="/register" className="font-semibold text-[var(--brand-dark)]">
            Create account
          </Link>
        </div>

        <div className="mt-6 border-t border-[var(--border)] pt-5">
          <Link
            href="/dashboard"
            className="block w-full rounded-xl border border-[var(--border)] px-4 py-3 text-center text-sm font-medium text-[var(--text)] sm:text-base"
          >
            View demo dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}