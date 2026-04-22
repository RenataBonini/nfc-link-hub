import db from '@/lib/db'

type Props = {
  params: Promise<{
    slug: string
  }>
}

type Business = {
  id: string
  name: string
  tagline: string | null
  slug: string
  theme: string
}

type BusinessLink = {
  id: string
  type: string
  label: string
  url: string
  sort_order: number
}

export default async function PublicLandingPage({ params }: Props) {
  const { slug } = await params

  const business = db
    .prepare('SELECT * FROM businesses WHERE slug = ?')
    .get(slug) as Business | undefined

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-lg text-[var(--text)]">Business page not found.</p>
      </main>
    )
  }

  const links = db
    .prepare('SELECT * FROM business_links WHERE business_id = ? ORDER BY sort_order ASC')
    .all(business.id) as BusinessLink[]

  const isDark = business.theme === 'dark-glass'

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#b8926b_0%,#8f6d4e_100%)] px-6 py-10">
      <div className="w-full max-w-sm rounded-[28px] bg-[rgba(255,255,255,0.12)] p-5 backdrop-blur-xl">
        <div
          className={`rounded-[24px] px-6 py-8 text-center shadow-2xl ${
            isDark
              ? 'bg-[linear-gradient(180deg,#3d2b1f_0%,#1f1813_100%)] text-white'
              : 'bg-[#f8f4ef] text-[var(--text)]'
          }`}
        >
          <div className={`mx-auto mb-4 h-20 w-20 rounded-full ${isDark ? 'bg-white/10' : 'bg-[var(--border)]'}`} />
          <h1 className="text-2xl font-bold">{business.name}</h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-white/70' : 'text-[var(--mocha)]/70'}`}>
            {business.tagline || 'Connect with us instantly'}
          </p>

          <div className="mt-8 space-y-3">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className={`block rounded-full px-4 py-3 text-sm font-medium ${
                  isDark
                    ? 'bg-white/10 text-white'
                    : 'border border-[var(--border)] bg-white text-[var(--text)]'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}