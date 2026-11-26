import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth'
import { getSupabaseAdmin, PortfolioVideo } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  // 1. Verify owner session
  const session = await verifyAdminSession(request)
  if (!session.authenticated) {
    return NextResponse.json({ error: 'Unauthorized: Owner session required.' }, { status: 401 })
  }

  try {
    const supabase = getSupabaseAdmin()

    // 2. Fetch all portfolio videos ordered by display_order ASC, created_at DESC
    const { data: videos, error } = await supabase
      .from('portfolio_videos')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[GET_VIDEOS_DB_ERROR]', error)
      return NextResponse.json({ error: 'Failed to retrieve video records from database.' }, { status: 500 })
    }

    const videoList: PortfolioVideo[] = videos || []

    // 3. Compute accurate dashboard overview metrics
    const stats = {
      total: videoList.length,
      published: videoList.filter((v) => v.is_published).length,
      unpublished: videoList.filter((v) => !v.is_published).length,
      cloudinary: videoList.filter((v) => v.source_type === 'cloudinary').length,
      local: videoList.filter((v) => v.source_type === 'local').length,
    }

    return NextResponse.json({
      success: true,
      stats,
      videos: videoList,
    })
  } catch (err: any) {
    console.warn('[GET_VIDEOS_ERROR]', err?.message || err)
    // Fallback if Supabase credentials are missing in local dev
    return NextResponse.json(
      {
        error: 'Database unavailable or Supabase credentials unconfigured.',
        stats: { total: 0, published: 0, unpublished: 0, cloudinary: 0, local: 0 },
        videos: [],
      },
      { status: 500 }
    )
  }
}
