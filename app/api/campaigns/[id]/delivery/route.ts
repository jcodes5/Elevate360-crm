import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ApiResponse } from '@/lib/models'
import { ProductionAuthService, canAccessResource } from '@/lib/auth-production'

async function authRead(request: NextRequest) {
  const token = ProductionAuthService.getTokenFromRequest(request)
  if (!token) return { error: NextResponse.json({ success: false, message: 'Authentication required' } satisfies ApiResponse, { status: 401 }) }
  try {
    const payload = await ProductionAuthService.verifyAccessToken(token)
    const allowed = canAccessResource(payload.role, 'campaigns', 'read')
    if (!allowed) return { error: NextResponse.json({ success: false, message: 'Forbidden' } satisfies ApiResponse, { status: 403 }) }
    return { payload }
  } catch { return { error: NextResponse.json({ success: false, message: 'Invalid token' } satisfies ApiResponse, { status: 401 }) } }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const a = await authRead(request)
  if ('error' in a) return a.error
  const { payload } = a
  try {
    const c = await prisma.campaign.findFirst({ where: { id: params.id, organizationId: payload.organizationId } })
    if (!c) return NextResponse.json({ success: false, message: 'Not found' } satisfies ApiResponse, { status: 404 })
    const m: any = c.metrics || {}
    const status = c.status
    return NextResponse.json({ success: true, data: { status, sent: m.sent || 0, delivered: m.delivered || 0, failed: (m.bounced || 0) + (m.spamReports || 0), pending: Math.max(0, (m.sent || 0) - ((m.delivered || 0) + (m.bounced || 0))), bounced: m.bounced || 0, opened: m.opened || 0, clicked: m.clicked || 0, unsubscribed: m.unsubscribed || 0, complaints: m.spamReports || 0 } } satisfies ApiResponse)
  } catch { return NextResponse.json({ success: false, message: 'Failed to get delivery status' } satisfies ApiResponse, { status: 500 }) }
}
