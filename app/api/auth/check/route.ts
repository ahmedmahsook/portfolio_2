import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await verifyAdminSession(request)

  if (!session.authenticated) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true })
}
