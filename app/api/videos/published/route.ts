import { NextResponse } from 'next/server'
import { getSupabasePublic, PortfolioVideo } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * GET /api/videos/published
 * Public, read-only endpoint returning only verified published portfolio videos.
 * - Reads only records where is_published = true (enforced at query level & Supabase RLS)
 * - Ordered by display_order ASC, created_at DESC
 * - Excludes all private/internal metadata
 * - Edge-cached with short 10s TTL + stale-while-revalidate for immediate freshness upon dashboard edits
 */
export async function GET() {
  try {
    const supabase = getSupabasePublic()

    if (!supabase) {
      // Supabase credentials not configured in local environment
      return NextResponse.json(
        { error: 'Supabase credentials not configured.' },
        { status: 503 }
      )
    }

    const { data: videos, error } = await supabase
      .from('portfolio_videos')
      .select('id, cloudinary_public_id, source_type, title, subtitle, category, description, tags, video_url, poster_url, display_order, created_at')
      .eq('is_published', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[PUBLIC_VIDEOS_SUPABASE_WARN]', error.message)
      return NextResponse.json(
        { error: 'Failed to retrieve published projects from database.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        videos: videos || [],
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        },
      }
    )
  } catch (err: any) {
    console.warn('[PUBLIC_VIDEOS_EXCEPTION]', err?.message || err)
    return NextResponse.json(
      { error: 'Database service unavailable.' },
      { status: 503 }
    )
  }
}
