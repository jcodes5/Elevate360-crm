import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/models'
import { ProductionAuthService, canAccessResource } from '@/lib/auth-production'

async function authWrite(request: NextRequest) {
  const token = ProductionAuthService.getTokenFromRequest(request)
  if (!token) return { error: NextResponse.json({ success: false, message: 'Authentication required' } satisfies ApiResponse, { status: 401 }) }
  try {
    const payload = await ProductionAuthService.verifyAccessToken(token)
    const allowed = canAccessResource('campaigns', 'read')
    if (!allowed.includes(payload.role)) return { error: NextResponse.json({ success: false, message: 'Forbidden' } satisfies ApiResponse, { status: 403 }) }
    return { payload }
  } catch { return { error: NextResponse.json({ success: false, message: 'Invalid token' } satisfies ApiResponse, { status: 401 }) } }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const a = await authWrite(request)
  if ('error' in a) return a.error
  try {
    const { format, metrics } = await request.json()
    const jobId = `export_${params.id}_${Date.now()}`
    return NextResponse.json({ success: true, data: { jobId }, message: 'Export started' } satisfies ApiResponse)
  } catch { return NextResponse.json({ success: false, message: 'Failed to start export' } satisfies ApiResponse, { status: 500 }) }
}
