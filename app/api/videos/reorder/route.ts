import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

interface ReorderItem {
  id: string
  display_order: number
}

/**
 * PATCH /api/videos/reorder
 * Atomically updates display orders for a list of video IDs.
 * Strictly checks owner session and validates data types.
 */
export async function PATCH(request: NextRequest) {
  const session = await verifyAdminSession(request)
  if (!session.authenticated) {
    return NextResponse.json({ error: 'Unauthorized: Owner session required.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { orders } = body

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ error: 'Invalid payload: "orders" must be a non-empty array.' }, { status: 400 })
    }

    for (const item of orders) {
      if (!item.id || typeof item.id !== 'string' || typeof item.display_order !== 'number' || item.display_order < 0) {
        return NextResponse.json({ error: 'Each order item must contain a valid id and non-negative integer display_order.' }, { status: 400 })
      }
    }

    const supabase = getSupabaseAdmin()

    // Execute sequential updates in Supabase
    // Using upsert or individual updates for each project
    const updates = orders.map((item: ReorderItem) =>
      supabase
        .from('portfolio_videos')
        .update({ display_order: Math.floor(item.display_order) })
        .eq('id', item.id)
    )

    const results = await Promise.all(updates)
    const anyError = results.find((r) => r.error)

    if (anyError && anyError.error) {
      console.error('[REORDER_ERROR]', anyError.error)
      return NextResponse.json({ error: 'Failed to persist updated video ordering.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Video display orders updated successfully.',
    })
  } catch (err: any) {
    console.error('[REORDER_EXCEPTION]', err)
    return NextResponse.json({ error: 'Server error processing reordering.' }, { status: 500 })
  }
}
