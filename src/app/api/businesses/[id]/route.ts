import { NextResponse } from 'next/server'
import crypto from 'crypto'
import db from '@/lib/db'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

type IncomingLink = {
  type: string
  label: string
  url: string
}

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params

    const business = db
      .prepare('SELECT * FROM businesses WHERE id = ?')
      .get(id)

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    const links = db
      .prepare('SELECT * FROM business_links WHERE business_id = ? ORDER BY sort_order ASC')
      .all(id)

    return NextResponse.json(
      { business, links },
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to fetch business' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const body = await req.json()

    const { name, tagline, slug, theme, links } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const existing = db
      .prepare('SELECT id FROM businesses WHERE slug = ? AND id != ?')
      .get(slug, id)

    if (existing) {
      return NextResponse.json(
        { error: 'Another page already uses this slug.' },
        { status: 409 }
      )
    }

    const businessExists = db
      .prepare('SELECT id FROM businesses WHERE id = ?')
      .get(id)

    if (!businessExists) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    db.prepare(`
      UPDATE businesses
      SET name = ?, tagline = ?, slug = ?, theme = ?
      WHERE id = ?
    `).run(
      name,
      tagline ?? null,
      slug,
      theme ?? 'dark-glass',
      id
    )

    db.prepare('DELETE FROM business_links WHERE business_id = ?').run(id)

    if (Array.isArray(links)) {
      const insertLink = db.prepare(`
        INSERT INTO business_links (id, business_id, type, label, url, sort_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `)

      for (let index = 0; index < links.length; index++) {
        const link = links[index] as IncomingLink

        if (!link.url) continue

        insertLink.run(
          crypto.randomUUID(),
          id,
          link.type,
          link.label,
          link.url,
          index
        )
      }
    }

    const updatedBusiness = db
      .prepare('SELECT * FROM businesses WHERE id = ?')
      .get(id)

    return NextResponse.json(updatedBusiness, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to update business' },
      { status: 500 }
    )
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params

    db.prepare('DELETE FROM business_links WHERE business_id = ?').run(id)
    db.prepare('DELETE FROM businesses WHERE id = ?').run(id)

    return NextResponse.json(
      { message: 'Business deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to delete business' },
      { status: 500 }
    )
  }
}