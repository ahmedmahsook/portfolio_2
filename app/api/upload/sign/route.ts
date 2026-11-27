import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { verifyAdminSession } from '@/lib/auth'
import { cleanEnv } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  // 1. Enforce server-side authentication
  const session = await verifyAdminSession(request)
  if (!session.authenticated) {
    return NextResponse.json({ error: 'Unauthorized: Owner session required.' }, { status: 401 })
  }

  // 2. Validate environment credentials
  const cloudName =
    cleanEnv(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) ||
    cleanEnv(process.env.CLOUDINARY_CLOUD_NAME) ||
    'driapshxj'
  const apiKey = cleanEnv(process.env.CLOUDINARY_API_KEY)
  const apiSecret = cleanEnv(process.env.CLOUDINARY_API_SECRET)

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      {
        error:
          'Cloudinary configuration incomplete. CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must be set in server environment variables.',
      },
      { status: 500 }
    )
  }

  try {
    // 3. Strict parameter enforcement: only allow 'portfolio' folder
    const timestamp = Math.floor(Date.now() / 1000)
    const folder = 'portfolio'

    const paramsToSign = {
      folder,
      timestamp,
    }

    // 4. Generate signature using Cloudinary SDK utility
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret)

    // 5. Return signed upload parameters (NEVER expose apiSecret!)
    return NextResponse.json({
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    })
  } catch (err: any) {
    console.error('[UPLOAD_SIGN_ERROR]', err)
    return NextResponse.json({ error: 'Failed to generate upload signature.' }, { status: 500 })
  }
}
