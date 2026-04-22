import { NextResponse } from 'next/server'
import crypto from 'crypto'
import db from '@/lib/db'

type IncomingLink = {
  type: string
  label: string
  url: string
}

export async function GET() {
  try {
    const businesses = db
      .prepare(`
        SELECT *
        FROM businesses
        ORDER BY created_at DESC
      `)
      .all()

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
    const body = await req.json()
    const { ownerId, name, tagline, slug, theme, links } = body

    if (!ownerId || !name || !slug) {
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
      INSERT INTO businesses (id, owner_id, name, tagline, slug, theme)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      businessId,
      ownerId,
      name,
      tagline ?? null,
      slug,
      theme ?? 'dark-glass'
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