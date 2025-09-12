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
    const investment = m.cost || 0
    const revenue = m.totalRevenue || m.revenue || 0
    const roi = investment ? (revenue - investment) / investment : 0
    const conversionRate = m.conversionRate || 0
    const costPerLead = m.costPerLead || (investment && m.sent ? investment / m.sent : 0)
    const costPerAcquisition = m.costPerAcquisition || 0
    const customerLifetimeValue = m.lifetimeValue || 0
    const analysis = { investment, revenue, roi, conversionRate, costPerLead, costPerAcquisition, customerLifetimeValue, breakdown: { adSpend: m.adSpend || investment, personalCosts: m.personalCosts || 0, toolsCosts: m.toolsCosts || 0, otherCosts: m.otherCosts || 0 } }
    return NextResponse.json({ success: true, data: analysis } satisfies ApiResponse)
  } catch { return NextResponse.json({ success: false, message: 'Failed to get ROI analysis' } satisfies ApiResponse, { status: 500 }) }
}
