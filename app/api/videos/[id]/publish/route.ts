import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/videos/[id]/publish
 * Toggles is_published status in Supabase.
 * Does NOT delete or alter any underlying asset.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await verifyAdminSession(request)
  if (!session.authenticated) {
    return NextResponse.json({ error: 'Unauthorized: Owner session required.' }, { status: 401 })
  }

  const { id } = await context.params
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Valid video ID is required.' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { is_published } = body

    if (typeof is_published !== 'boolean') {
      return NextResponse.json({ error: 'Field "is_published" must be a boolean.' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data: updated, error } = await supabase
      .from('portfolio_videos')
      .update({ is_published })
      .eq('id', id)
      .select('id, title, is_published')
      .single()

    if (error) {
      console.error('[PUBLISH_TOGGLE_ERROR]', error)
      return NextResponse.json({ error: 'Failed to update publication status.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Video "${updated.title}" is now ${updated.is_published ? 'published' : 'unpublished'}.`,
      video: updated,
    })
  } catch (err: any) {
    console.error('[PUBLISH_ROUTE_EXCEPTION]', err)
    return NextResponse.json({ error: 'Server error updating publication status.' }, { status: 500 })
  }
}
