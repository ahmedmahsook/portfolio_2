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

/**
 * Server-only Supabase client utilizing the Service Role Key.
 * NEVER expose this client to the browser.
 * Bypasses RLS for secure, server-authenticated administrative operations.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdminInstance) return supabaseAdminInstance

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase credentials missing: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured in environment variables.'
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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publicApiKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY

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
