import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-this'
)

export type SessionPayload = {
  userId: string
  email: string
  name: string
}

export async function createSessionToken(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, secret)
  return payload as unknown as SessionPayload
}