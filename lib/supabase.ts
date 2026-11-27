import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type VideoCategory = 'Editing' | 'Marketing' | 'Motion'
export type VideoSourceType = 'cloudinary' | 'local'

export interface PortfolioVideo {
  id: string
  cloudinary_public_id: string
  source_type: VideoSourceType
  title: string
  subtitle: string
  category: VideoCategory
  description: string
  tags: string[]
  video_url: string
  poster_url: string
  duration?: number | null
  width?: number | null
  height?: number | null
  display_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export type PortfolioVideoInsert = Omit<PortfolioVideo, 'id' | 'created_at' | 'updated_at'>
export type PortfolioVideoUpdate = Partial<PortfolioVideoInsert>

let supabaseAdminInstance: SupabaseClient | null = null
let supabasePublicInstance: SupabaseClient | null = null

export function cleanEnv(val: string | undefined): string | undefined {
  if (!val) return undefined
  let cleaned = val.trim()
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim()
  }
  return cleaned || undefined
}

/**
 * Server-only Supabase client utilizing the Service Role Key.
 * NEVER expose this client to the browser.
 * Bypasses RLS for secure, server-authenticated administrative operations.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminInstance) return supabaseAdminInstance

  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) || cleanEnv(process.env.SUPABASE_URL)
  const serviceRoleKey =
    cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
    cleanEnv(process.env.SUPABASE_SERVICE_KEY) ||
    cleanEnv(process.env.SUPABASE_SECRET_KEY)

  if (!url || !serviceRoleKey) {
    const missing = [
      !url && 'NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)',
      !serviceRoleKey && 'SUPABASE_SERVICE_ROLE_KEY',
    ]
      .filter(Boolean)
      .join(' and ')

    throw new Error(
      `Supabase credentials missing: ${missing} must be configured in environment variables.`
    )
  }

  supabaseAdminInstance = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return supabaseAdminInstance
}

/**
 * Public client for client-safe or public read operations using the Anonymous Key.
 * Subject to Row Level Security policies (e.g. is_published = true).
 */
export function getSupabasePublic(): SupabaseClient | null {
  if (supabasePublicInstance) return supabasePublicInstance

  const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) || cleanEnv(process.env.SUPABASE_URL)
  const publicApiKey =
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    cleanEnv(process.env.SUPABASE_ANON_KEY) ||
    cleanEnv(process.env.SUPABASE_PUBLISHABLE_KEY)

  if (!url || !publicApiKey) {
    return null
  }

  supabasePublicInstance = createClient(url, publicApiKey, {
    auth: {
      persistSession: false,
    },
  })

  return supabasePublicInstance
}
