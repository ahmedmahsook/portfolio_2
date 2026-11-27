import { createHmac, createHash, timingSafeEqual, randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const AUTH_COOKIE_NAME = '__owner_session'
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7 // 7 days

// ------------------------------------------------------------------------------
// Rate Limiter: Atomic Supabase RPC with in-memory fallback for offline/local
// Max 5 failed attempts per 15 minutes per IP hash
// ------------------------------------------------------------------------------
interface RateLimitRecord {
  attempts: number
  lockedUntil: number
}

const localRateLimitMap = new Map<string, RateLimitRecord>()

/**
 * Hash client IP using SHA-256 with a server salt to avoid storing raw IP addresses.
 */
export function hashClientIp(ip: string): string {
  const salt = process.env.SESSION_SECRET || 'portfolio_rate_limit_salt_2026'
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex')
}

export interface RateLimitResult {
  allowed: boolean
  waitSeconds: number
  attempts?: number
  locked?: boolean
}

/**
 * Checks and records a failed login attempt atomically using Supabase RPC.
 * - In production: rejects safely with an error if Supabase credentials are missing or DB fails.
 * - In local development: falls back to instance-local in-memory map.
 */
export async function recordFailedLogin(ip: string): Promise<RateLimitResult> {
  const ipHash = hashClientIp(ip)
  const isProduction = process.env.NODE_ENV === 'production'

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.rpc('check_and_record_login_attempt', {
      p_ip_hash: ipHash,
      p_max_attempts: 5,
      p_lockout_seconds: 15 * 60,
    })

    if (error) {
      console.error('[RATE_LIMIT_RPC_ERROR]', error.message)
      if (isProduction) {
        throw new Error('RATE_LIMIT_BACKEND_UNAVAILABLE')
      }
    } else if (Array.isArray(data) && data.length > 0) {
      const row = data[0]
      return {
        allowed: Boolean(row.allowed),
        waitSeconds: Number(row.wait_seconds || 0),
        attempts: Number(row.attempts || 1),
        locked: Boolean(row.locked),
      }
    }
  } catch (err: any) {
    if (isProduction) {
      console.error('[RATE_LIMIT_FATAL_PROD]', err?.message || err)
      throw new Error('RATE_LIMIT_BACKEND_UNAVAILABLE')
    }
    console.warn('[RATE_LIMIT_DEV_FALLBACK] Supabase unavailable in development; using in-memory rate limiter:', err?.message || err)
  }

  // Fallback: in-memory rate limiter exclusively for non-production environments
  const now = Date.now()
  const record = localRateLimitMap.get(ipHash) || { attempts: 0, lockedUntil: 0 }

  // If previous lockout expired, reset
  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    record.attempts = 0
    record.lockedUntil = 0
  }

  record.attempts += 1

  if (record.attempts >= 5) {
    record.lockedUntil = now + 15 * 60 * 1000 // 15-minute lockout
    localRateLimitMap.set(ipHash, record)
    return { allowed: false, waitSeconds: 15 * 60, attempts: record.attempts, locked: true }
  }

  localRateLimitMap.set(ipHash, record)
  return { allowed: true, waitSeconds: 0, attempts: record.attempts, locked: false }
}

/**
 * Checks whether an IP is currently locked out before attempting verification.
 * In production: fails closed if Supabase rate-limiting database is unreachable.
 */
export async function checkLoginRateLimit(ip: string): Promise<{ allowed: boolean; waitSeconds: number }> {
  const ipHash = hashClientIp(ip)
  const isProduction = process.env.NODE_ENV === 'production'

  try {
    const supabase = getSupabaseAdmin()
    const { data: record, error } = await supabase
      .from('auth_rate_limits')
      .select('locked_until, attempts')
      .eq('ip_hash', ipHash)
      .maybeSingle()

    if (error) {
      console.error('[RATE_LIMIT_CHECK_ERROR]', error.message)
      if (isProduction) {
        throw new Error('RATE_LIMIT_BACKEND_UNAVAILABLE')
      }
    } else if (record) {
      if (record.locked_until) {
        const lockedUntilMs = new Date(record.locked_until).getTime()
        const now = Date.now()
        if (lockedUntilMs > now) {
          const waitSeconds = Math.ceil((lockedUntilMs - now) / 1000)
          return { allowed: false, waitSeconds }
        }
      }
      return { allowed: true, waitSeconds: 0 }
    } else {
      return { allowed: true, waitSeconds: 0 }
    }
  } catch (err: any) {
    if (isProduction) {
      console.error('[RATE_LIMIT_CHECK_PROD_FAIL]', err?.message || err)
      const errorMsg = err?.message?.startsWith('Supabase credentials missing')
        ? err.message
        : 'RATE_LIMIT_BACKEND_UNAVAILABLE'
      throw new Error(errorMsg)
    }
    // In local development, fall back to local in-memory map
  }

  const now = Date.now()
  const localRecord = localRateLimitMap.get(ipHash)
  if (localRecord && localRecord.lockedUntil > now) {
    const waitSeconds = Math.ceil((localRecord.lockedUntil - now) / 1000)
    return { allowed: false, waitSeconds }
  }

  return { allowed: true, waitSeconds: 0 }
}

/**
 * Clears failed attempt record upon successful authentication.
 */
export async function recordSuccessfulLogin(ip: string): Promise<void> {
  const ipHash = hashClientIp(ip)
  localRateLimitMap.delete(ipHash)
  const isProduction = process.env.NODE_ENV === 'production'

  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.rpc('clear_login_rate_limit', { p_ip_hash: ipHash })
    if (error) {
      console.error('[RATE_LIMIT_CLEAR_ERROR]', error.message)
      if (isProduction) {
        throw new Error('RATE_LIMIT_BACKEND_UNAVAILABLE')
      }
    }
  } catch (err: any) {
    if (isProduction) {
      console.error('[RATE_LIMIT_CLEAR_PROD_FAIL]', err?.message || err)
      throw new Error('RATE_LIMIT_BACKEND_UNAVAILABLE')
    }
  }
}

// ------------------------------------------------------------------------------
// Secret Retrieval
// ------------------------------------------------------------------------------
function getSecretKey(): string {
  const secret = process.env.SESSION_SECRET || process.env.UPLOAD_PORTAL_PASSWORD
  if (!secret) {
    // If neither is configured, fallback to a persistent internal default for development
    return 'portfolio_default_session_secret_change_in_production'
  }
  return secret.trim()
}

// ------------------------------------------------------------------------------
// Timing-safe password verification
// ------------------------------------------------------------------------------
export function verifyPassword(inputPassword: string): boolean {
  const rawPassword = process.env.UPLOAD_PORTAL_PASSWORD || process.env.ADMIN_PASSWORD
  const configuredPassword = rawPassword?.trim()

  if (!configuredPassword) {
    console.warn('[AUTH] UPLOAD_PORTAL_PASSWORD is not set in environment variables.')
    return false
  }

  const inputBuffer = Buffer.from(inputPassword)
  const configuredBuffer = Buffer.from(configuredPassword)

  if (inputBuffer.length !== configuredBuffer.length) {
    // Perform dummy comparison to mitigate length-timing leaks
    timingSafeEqual(inputBuffer, inputBuffer)
    return false
  }

  return timingSafeEqual(inputBuffer, configuredBuffer)
}

// ------------------------------------------------------------------------------
// HMAC Signed Session Token
// ------------------------------------------------------------------------------
interface SessionPayload {
  role: 'owner'
  exp: number
}

export function createSessionToken(): string {
  const payload: SessionPayload = {
    role: 'owner',
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  }

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const secret = getSecretKey()
  const signature = createHmac('sha256', secret).update(payloadBase64).digest('base64url')

  return `${payloadBase64}.${signature}`
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false

  const parts = token.split('.')
  if (parts.length !== 2) return false

  const [payloadBase64, providedSignature] = parts
  const secret = getSecretKey()
  const expectedSignature = createHmac('sha256', secret).update(payloadBase64).digest('base64url')

  const providedSigBuffer = Buffer.from(providedSignature)
  const expectedSigBuffer = Buffer.from(expectedSignature)

  if (providedSigBuffer.length !== expectedSigBuffer.length) {
    return false
  }

  if (!timingSafeEqual(providedSigBuffer, expectedSigBuffer)) {
    return false
  }

  try {
    const payload: SessionPayload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'))
    const now = Math.floor(Date.now() / 1000)

    if (payload.exp < now || payload.role !== 'owner') {
      return false
    }

    return true
  } catch {
    return false
  }
}

// ------------------------------------------------------------------------------
// Server-Side Request Authentication Helper
// ------------------------------------------------------------------------------
export async function verifyAdminSession(request?: NextRequest): Promise<{ authenticated: boolean; error?: string }> {
  let token: string | undefined

  if (request) {
    token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  } else {
    const cookieStore = await cookies()
    token = cookieStore.get(AUTH_COOKIE_NAME)?.value
  }

  if (!token || !verifySessionToken(token)) {
    return { authenticated: false, error: 'Unauthorized: Owner authentication required.' }
  }

  return { authenticated: true }
}

/**
 * Extracts the real client IP behind reverse proxies and CDNs.
 * On Vercel:
 * 1. 'x-vercel-proxied-for' or 'x-forwarded-for' (Vercel appends the true connecting client IP as the last entry, or the first entry if from client).
 * Vercel specifically guarantees 'x-real-ip' represents the connecting client.
 */
export function getClientIp(request: NextRequest): string {
  // 1. Vercel trusted header
  const xRealIp = request.headers.get('x-real-ip')
  if (xRealIp && xRealIp.trim().length > 0) {
    return xRealIp.trim()
  }

  // 2. Fallback to standard x-forwarded-for
  const xForwardedFor = request.headers.get('x-forwarded-for')
  if (xForwardedFor) {
    // The first IP in the chain is the original client IP
    const firstIp = xForwardedFor.split(',')[0].trim()
    if (firstIp) return firstIp
  }

  return '127.0.0.1'
}
