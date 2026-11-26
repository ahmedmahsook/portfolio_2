import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  AUTH_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  checkLoginRateLimit,
  recordFailedLogin,
  recordSuccessfulLogin,
  verifyPassword,
  createSessionToken,
  getClientIp,
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  try {
    // 1. Rate limiting check
    const rateLimit = await checkLoginRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed attempts. Access locked for ${rateLimit.waitSeconds} seconds.`,
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { password } = body

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required.' }, { status: 400 })
    }

    // 2. Validate password with timing-safe comparison
    const isValid = verifyPassword(password)

    if (!isValid) {
      const failure = await recordFailedLogin(ip)
      if (failure.locked) {
        return NextResponse.json(
          {
            error: `Too many failed attempts. Access locked for ${failure.waitSeconds} seconds.`,
          },
          { status: 429 }
        )
      }
      return NextResponse.json({ error: 'Invalid password.' }, { status: 401 })
    }

    // 3. Password valid: clear failure record and issue session
    await recordSuccessfulLogin(ip)
    const token = createSessionToken()

    const cookieStore = await cookies()
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DURATION_SECONDS,
    })

    return NextResponse.json({ success: true, message: 'Authentication successful.' })
  } catch (err: any) {
    if (err?.message === 'RATE_LIMIT_BACKEND_UNAVAILABLE') {
      return NextResponse.json(
        { error: 'Authentication service temporarily unavailable. Please try again shortly.' },
        { status: 503 }
      )
    }
    console.error('[AUTH_LOGIN_ERROR]', err)
    return NextResponse.json({ error: 'Internal server error processing login.' }, { status: 500 })
  }
}
