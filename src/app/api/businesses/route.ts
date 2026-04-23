import { NextResponse } from 'next/server'
import crypto from 'crypto'
import db from '@/lib/db'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/auth'

type IncomingLink = {
  type: string
  label: string
  url: string
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await verifySessionToken(token)

    const businesses = db
      .prepare(`
        SELECT *
        FROM businesses
        WHERE owner_id = ?
        ORDER BY created_at DESC
      `)
      .all(session.userId)

    return NextResponse.json(businesses, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await verifySessionToken(token)

    const body = await req.json()
    const { name, tagline, slug, template, logoUrl, links, isPublished } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const existing = db
      .prepare('SELECT id FROM businesses WHERE slug = ?')
      .get(slug)

    if (existing) {
      return NextResponse.json(
        { error: 'A page with this business name already exists.' },
        { status: 409 }
      )
    }

    const businessId = crypto.randomUUID()

    db.prepare(`
      INSERT INTO businesses (id, owner_id, name, tagline, slug, template, logo_url, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      businessId,
      session.userId,
      name,
      tagline ?? null,
      slug,
      template ?? 'classic-dark',
      logoUrl ?? null,
      isPublished ? 1 : 0
    )

    if (Array.isArray(links)) {
      const insertLink = db.prepare(`
        INSERT INTO business_links (id, business_id, type, label, url, sort_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `)

      links.forEach((link: IncomingLink, index: number) => {
        if (!link.url) return

        insertLink.run(
          crypto.randomUUID(),
          businessId,
          link.type,
          link.label,
          link.url,
          index
        )
      })
    }

    const business = db
      .prepare('SELECT * FROM businesses WHERE id = ?')
      .get(businessId)

    return NextResponse.json(business, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}