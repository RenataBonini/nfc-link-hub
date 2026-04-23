import { NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import db from '@/lib/db'
import { createSessionToken } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      )
    }

    const existingUser = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email.trim().toLowerCase())

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    const userId = crypto.randomUUID()
    const passwordHash = await bcrypt.hash(password, 10)

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash)
      VALUES (?, ?, ?, ?)
    `).run(
      userId,
      name.trim(),
      email.trim().toLowerCase(),
      passwordHash
    )

    const token = await createSessionToken({
      userId,
      email: email.trim().toLowerCase(),
      name: name.trim(),
    })

    const response = NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          id: userId,
          name: name.trim(),
          email: email.trim().toLowerCase(),
        },
      },
      { status: 201 }
    )

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}