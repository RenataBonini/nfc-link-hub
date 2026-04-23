import Image from 'next/image'
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
  template: 'classic-dark' | 'minimal-light' | 'warm-card'
  logo_url: string | null
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

  const hasLogo = Boolean(business.logo_url)

  function renderCard() {
     if (business.template === 'minimal-light') {
      return (
        <div className="rounded-[24px] border border-[var(--border)] bg-[#faf6f1] px-6 py-8 text-center text-[var(--text)] shadow-2xl">
          {hasLogo ? (
            <Image
              src={business.logo_url!}
              alt={`${business.name} logo`}
              width={84}
              height={84}
              className="mx-auto mb-4 h-[84px] w-[84px] rounded-full object-cover border border-[var(--border)]"
            />
          ) : (
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-[var(--border)]" />
          )}

          <h1 className="text-2xl font-bold">{business.name}</h1>
          <p className="mt-2 text-sm text-[var(--mocha)]/70">
            {business.tagline || 'Connect with us instantly'}
          </p>

          <div className="mt-8 space-y-3">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-full border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-[var(--text)]"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )
    }

    if (business.template === 'warm-card') {
      return (
        <div className="rounded-[28px] bg-[linear-gradient(180deg,#f3e7d8_0%,#e5cfb5_100%)] px-6 py-8 text-center text-[var(--text)] shadow-2xl">
          {hasLogo ? (
            <Image
              src={business.logo_url!}
              alt={`${business.name} logo`}
              width={88}
              height={88}
              className="mx-auto mb-4 h-[88px] w-[88px] rounded-2xl object-cover border border-white/60 shadow"
            />
          ) : (
            <div className="mx-auto mb-4 h-20 w-20 rounded-2xl bg-white/50" />
          )}

          <h1 className="text-2xl font-bold">{business.name}</h1>
          <p className="mt-2 text-sm text-[var(--mocha)]/80">
            {business.tagline || 'Connect with us instantly'}
          </p>

          <div className="mt-8 space-y-3">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl bg-white/80 px-4 py-3 text-sm font-medium text-[var(--text)] shadow-sm"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="rounded-[24px] bg-[linear-gradient(180deg,#3d2b1f_0%,#1f1813_100%)] px-6 py-8 text-center text-white shadow-2xl">
        {hasLogo ? (
          <Image
            src={business.logo_url!}
            alt={`${business.name} logo`}
            width={84}
            height={84}
            className="mx-auto mb-4 h-[84px] w-[84px] rounded-full object-cover border border-white/20"
          />
        ) : (
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-white/10" />
        )}

        <h1 className="text-2xl font-bold">{business.name}</h1>
        <p className="mt-2 text-sm text-white/70">
          {business.tagline || 'Connect with us instantly'}
        </p>

        <div className="mt-8 space-y-3">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-full bg-white/10 px-4 py-3 text-sm font-medium text-white"
            >
              {link.label}
            </a>
          ))}
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