import { NextRequest, NextResponse } from "next/server"
import { prisma } from '@/lib/db'
import { ApiResponse } from '@/lib/models'
import { ProductionAuthService, canAccessResource } from '@/lib/auth-production'

async function requireAuth(request: NextRequest) {
  const token = ProductionAuthService.getTokenFromRequest(request)
  if (!token) return { error: NextResponse.json({ success: false, message: 'Authentication required' } satisfies ApiResponse, { status: 401 }) }
  try {
    const payload = await ProductionAuthService.verifyAccessToken(token)
    const allowed = canAccessResource(payload.role, 'campaigns', 'read')
    if (!allowed) return { error: NextResponse.json({ success: false, message: 'Forbidden' } satisfies ApiResponse, { status: 403 }) }
    return { payload }
  } catch {
    return { error: NextResponse.json({ success: false, message: 'Invalid or expired token' } satisfies ApiResponse, { status: 401 }) }
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if ('error' in auth) return auth.error
  const { payload } = auth

  try {
    const campaigns = await prisma.campaign.findMany({ where: { organizationId: payload.organizationId } })

    const byStatus: Record<string, number> = {}
    const byType: Record<string, number> = {}
    const byChannel: Record<string, number> = {}

    let totalSent = 0, totalDelivered = 0, totalOpened = 0, totalClicked = 0, totalRevenue = 0

    for (const c of campaigns) {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1
      byType[c.type] = (byType[c.type] || 0) + 1
      if (c.channel) byChannel[c.channel] = (byChannel[c.channel] || 0) + 1
      const m: any = c.metrics || {}
      totalSent += m.sent || 0
      totalDelivered += m.delivered || 0
      totalOpened += m.opened || 0
      totalClicked += m.clicked || 0
      totalRevenue += (m.totalRevenue || m.revenue || 0)
    }

    const stats = {
      total: campaigns.length,
      sent: byStatus['SENT'] || 0,
      scheduled: byStatus['SCHEDULED'] || 0,
      draft: byStatus['DRAFT'] || 0,
      byType,
      byStatus,
      byChannel,
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      averageOpenRate: totalSent ? +(100 * (totalOpened / totalSent)).toFixed(1) : 0,
      averageClickRate: totalSent ? +(100 * (totalClicked / totalSent)).toFixed(1) : 0,
      totalRevenue,
    }

    return NextResponse.json({ success: true, data: stats } satisfies ApiResponse)
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to fetch campaign stats' } satisfies ApiResponse, { status: 500 })
  }
}
