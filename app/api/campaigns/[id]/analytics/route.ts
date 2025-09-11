import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ApiResponse } from '@/lib/models'
import { ProductionAuthService, canAccessResource } from '@/lib/auth-production'

async function authRead(request: NextRequest) {
  const token = ProductionAuthService.getTokenFromRequest(request)
  if (!token) return { error: NextResponse.json({ success: false, message: 'Authentication required' } satisfies ApiResponse, { status: 401 }) }
  try {
    const payload = await ProductionAuthService.verifyAccessToken(token)
    const allowed = canAccessResource('campaigns', 'read')
    if (!allowed.includes(payload.role)) return { error: NextResponse.json({ success: false, message: 'Forbidden' } satisfies ApiResponse, { status: 403 }) }
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
    const analytics = {
      performance: {
        totalCampaigns: 1,
        activeCampaigns: ['SENDING', 'SCHEDULED'].includes(c.status) ? 1 : 0,
        completedCampaigns: c.status === 'COMPLETED' ? 1 : 0,
        averageOpenRate: m.openRate || 0,
        averageClickRate: m.clickRate || 0,
        averageConversionRate: m.conversionRate || 0,
        totalRevenue: m.totalRevenue || m.revenue || 0,
        averageROI: m.returnOnInvestment || 0,
        bestPerformingCampaign: { id: c.id, name: c.name, metric: 'openRate', value: m.openRate || 0 },
      },
      audience: {
        totalAudience: (c.targetAudience as any)?.totalSize || 0,
        activeSubscribers: 0,
        unsubscribed: m.unsubscribed || 0,
        bounced: m.bounced || 0,
        demographics: { age: {}, gender: {}, industry: {}, company_size: {} },
        geographic: { countries: {}, regions: {}, cities: {} },
        segmentPerformance: {},
      },
      engagement: {
        emailOpens: m.opened || 0,
        linkClicks: m.clicked || 0,
        socialShares: m.socialShares || 0,
        forwardRate: 0,
        timeToOpen: m.averageTimeToOpen || 0,
        timeToClick: m.averageTimeToClick || 0,
        engagementByTime: { opensByHour: {}, clicksByHour: {}, opensByDay: {}, clicksByDay: {}, bestTimeToSend: { hour: 12, day: 'Thursday' } },
        topPerformingContent: [],
      },
      conversion: {
        totalConversions: m.conversions || 0,
        conversionRate: m.conversionRate || 0,
        conversionValue: m.totalRevenue || m.revenue || 0,
        averageOrderValue: m.averageOrderValue || 0,
        topConvertingCampaigns: [],
        conversionFunnel: [],
      },
      trends: { openRateTrend: [], clickRateTrend: [], conversionTrend: [], revenueTrend: [], audienceGrowth: [] },
      benchmarks: { industryBenchmarks: {}, competitorComparison: {}, historicalComparison: {}, performanceGrades: {} },
    }
    return NextResponse.json({ success: true, data: analytics } satisfies ApiResponse)
  } catch { return NextResponse.json({ success: false, message: 'Failed to get analytics' } satisfies ApiResponse, { status: 500 }) }
}
