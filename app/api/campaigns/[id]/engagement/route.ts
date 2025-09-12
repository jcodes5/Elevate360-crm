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
    const start = new Date(); start.setDate(start.getDate() - 7)
    const series = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i)
      return d.toISOString().slice(0,10)
    })
    return NextResponse.json({ success: true, data: { opens: series.map(d => ({ date: d, count: Math.floor((m.opened || 0)/7) })), clicks: series.map(d => ({ date: d, count: Math.floor((m.clicked || 0)/7) })), conversions: series.map(d => ({ date: d, count: Math.floor((m.conversions || 0)/7), value: Math.floor(((m.totalRevenue || m.revenue || 0)/7) || 0) })), unsubscribes: series.map(d => ({ date: d, count: Math.floor((m.unsubscribed || 0)/7) })), bounces: series.map(d => ({ date: d, count: Math.floor((m.bounced || 0)/7), type: 'hard' })) } } satisfies ApiResponse)
  } catch { return NextResponse.json({ success: false, message: 'Failed to get engagement metrics' } satisfies ApiResponse, { status: 500 }) }
}
