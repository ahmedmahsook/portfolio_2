import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth'
import { getSupabaseAdmin, VideoCategory } from '@/lib/supabase'
import { v2 as cloudinary } from 'cloudinary'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/videos/[id]
 * Updates video metadata (title, subtitle, category, description, tags, display_order)
 * Validates bounds strictly. Never re-uploads or alters underlying media.
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
    const { title, subtitle, category, description, tags, display_order } = body

    const updatePayload: Record<string, any> = {}

    // 1. Title validation
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json({ error: 'Project title cannot be empty.' }, { status: 400 })
      }
      const trimmed = title.trim()
      if (trimmed.length > 120) {
        return NextResponse.json({ error: 'Project title must not exceed 120 characters.' }, { status: 400 })
      }
      updatePayload.title = trimmed
    }

    // 2. Subtitle validation
    if (subtitle !== undefined) {
      if (typeof subtitle !== 'string') {
        return NextResponse.json({ error: 'Subtitle must be a string.' }, { status: 400 })
      }
      const trimmed = subtitle.trim()
      if (trimmed.length > 160) {
        return NextResponse.json({ error: 'Subtitle must not exceed 160 characters.' }, { status: 400 })
      }
      updatePayload.subtitle = trimmed
    }

    // 3. Category validation
    if (category !== undefined) {
      const validCategories: VideoCategory[] = ['Editing', 'Marketing', 'Motion']
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
          { status: 400 }
        )
      }
      updatePayload.category = category
    }

    // 4. Description validation
    if (description !== undefined) {
      if (typeof description !== 'string') {
        return NextResponse.json({ error: 'Description must be a string.' }, { status: 400 })
      }
      const trimmed = description.trim()
      if (trimmed.length > 2000) {
        return NextResponse.json({ error: 'Description must not exceed 2000 characters.' }, { status: 400 })
      }
      updatePayload.description = trimmed
    }

    // 5. Tags validation
    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return NextResponse.json({ error: 'Tags must be an array of strings.' }, { status: 400 })
      }
      if (tags.length > 10) {
        return NextResponse.json({ error: 'Maximum 10 tags permitted.' }, { status: 400 })
      }
      const sanitizedTags: string[] = []
      for (const t of tags) {
        if (typeof t !== 'string') {
          return NextResponse.json({ error: 'Each tag must be a string.' }, { status: 400 })
        }
        const trimmedTag = t.trim()
        if (trimmedTag.length > 40) {
          return NextResponse.json({ error: `Tag "${trimmedTag.substring(0, 15)}..." exceeds 40 characters.` }, { status: 400 })
        }
        if (trimmedTag.length > 0) {
          sanitizedTags.push(trimmedTag)
        }
      }
      updatePayload.tags = sanitizedTags
    }

    // 6. Display order validation
    if (display_order !== undefined) {
      if (typeof display_order !== 'number' || !Number.isInteger(display_order) || display_order < 0) {
        return NextResponse.json({ error: 'Display order must be a non-negative integer.' }, { status: 400 })
      }
      updatePayload.display_order = display_order
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update.' }, { status: 400 })
    }

    // 7. Persist update in Supabase
    const supabase = getSupabaseAdmin()
    const { data: updated, error } = await supabase
      .from('portfolio_videos')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[UPDATE_VIDEO_ERROR]', error)
      return NextResponse.json({ error: 'Failed to update video record.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Video metadata updated successfully.',
      video: updated,
    })
  } catch (err: any) {
    console.error('[PATCH_VIDEO_EXCEPTION]', err)
    return NextResponse.json({ error: 'Server error processing update.' }, { status: 500 })
  }
}

/**
 * DELETE /api/videos/[id]
 * Safe deletion with strict safeguards:
 * 1. Queries DB to determine actual source_type. Never trusts client input.
 * 2. If source_type === 'local', strictly rejects deletion (must be unpublished instead).
 * 3. If source_type === 'cloudinary', validates public_id starts with 'portfolio/'.
 * 4. Calls Cloudinary Admin API to delete the remote asset.
 * 5. Only after Cloudinary confirms deletion does it remove the Supabase record.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await verifyAdminSession(request)
  if (!session.authenticated) {
    return NextResponse.json({ error: 'Unauthorized: Owner session required.' }, { status: 401 })
  }

  const { id } = await context.params
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Valid video ID is required.' }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()

    // 1. Fetch real video record from database
    const { data: video, error: fetchError } = await supabase
      .from('portfolio_videos')
      .select('id, cloudinary_public_id, source_type, title')
      .eq('id', id)
      .maybeSingle()

    if (fetchError || !video) {
      return NextResponse.json({ error: 'Video record not found in portfolio database.' }, { status: 404 })
    }

    // 2. Strict protection for Local assets
    if (video.source_type === 'local' || video.cloudinary_public_id.startsWith('local/')) {
      return NextResponse.json(
        {
          error:
            'Permanent deletion of local assets is disabled. Local video files reside in /public/video/ and cannot be deleted via API. Please use "Unpublish" to hide this project from the public gallery.',
        },
        { status: 403 }
      )
    }

    // 3. Strict verification for Cloudinary assets
    if (!video.cloudinary_public_id.startsWith('portfolio/')) {
      return NextResponse.json(
        { error: 'Refusing deletion: Asset public ID is not in the allowed "portfolio/" namespace.' },
        { status: 400 }
      )
    }

    // 4. Delete remote asset from Cloudinary via Admin API
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'driapshxj'

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Server configuration error: Cloudinary credentials missing.' },
        { status: 500 }
      )
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    })

    try {
      const destroyResult = await cloudinary.uploader.destroy(video.cloudinary_public_id, {
        resource_type: 'video',
        invalidate: true,
      })

      // Cloudinary returns { result: 'ok' } or { result: 'not found' }
      if (destroyResult.result !== 'ok' && destroyResult.result !== 'not found') {
        console.error('[CLOUDINARY_DESTROY_FAILED]', destroyResult)
        return NextResponse.json(
          { error: `Cloudinary asset deletion failed: ${destroyResult.result || 'Unknown error'}` },
          { status: 502 }
        )
      }
    } catch (cloudErr: any) {
      console.error('[CLOUDINARY_DESTROY_ERROR]', cloudErr)
      return NextResponse.json(
        { error: `Cloudinary error during asset removal: ${cloudErr?.message || cloudErr}` },
        { status: 502 }
      )
    }

    // 5. Remove Supabase metadata record only after Cloudinary confirms deletion
    const { error: deleteError } = await supabase
      .from('portfolio_videos')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('[DELETE_DB_ERROR]', deleteError)
      return NextResponse.json(
        { error: 'Cloudinary asset deleted, but removing database record failed.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Project "${video.title}" permanently deleted from Cloudinary and portfolio.`,
    })
  } catch (err: any) {
    console.error('[DELETE_VIDEO_EXCEPTION]', err)
    return NextResponse.json({ error: 'Server error processing deletion.' }, { status: 500 })
  }
}
