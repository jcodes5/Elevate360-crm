import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/models'
import { ProductionAuthService, canAccessResource } from '@/lib/auth-production'

async function authWrite(request: NextRequest) {
  const token = ProductionAuthService.getTokenFromRequest(request)
  if (!token) return { error: NextResponse.json({ success: false, message: 'Authentication required' } satisfies ApiResponse, { status: 401 }) }
  try {
    const payload = await ProductionAuthService.verifyAccessToken(token)
    const allowed = canAccessResource('campaigns', 'update')
    if (!allowed.includes(payload.role)) return { error: NextResponse.json({ success: false, message: 'Forbidden' } satisfies ApiResponse, { status: 403 }) }
    return { payload }
  } catch { return { error: NextResponse.json({ success: false, message: 'Invalid token' } satisfies ApiResponse, { status: 401 }) } }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const a = await authWrite(request)
  if ('error' in a) return a.error
  try {
    const { recipients } = await request.json()
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ success: false, message: 'recipients array is required' } satisfies ApiResponse, { status: 400 })
    }
    return NextResponse.json({ success: true, message: 'Test send queued', data: { count: recipients.length } } satisfies ApiResponse)
  } catch { return NextResponse.json({ success: false, message: 'Failed to send test' } satisfies ApiResponse, { status: 500 }) }
}
