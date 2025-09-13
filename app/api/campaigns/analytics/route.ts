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

    // Aggregate metrics
    let totals = {
      sent: 0, delivered: 0, bounced: 0, opened: 0, clicked: 0, unsubscribed: 0, spamReports: 0, conversions: 0,
      revenue: 0, totalRevenue: 0, averageOrderValue: 0, returnOnInvestment: 0
    }

    for (const c of campaigns) {
      const m: any = c.metrics || {}
      totals.sent += m.sent || 0
      totals.delivered += m.delivered || 0
      totals.bounced += m.bounced || 0
      totals.opened += m.opened || 0
      totals.clicked += m.clicked || 0
      totals.unsubscribed += m.unsubscribed || 0
      totals.spamReports += m.spamReports || 0
      totals.conversions += m.conversions || 0
      totals.revenue += m.revenue || 0
      totals.totalRevenue += m.totalRevenue || m.revenue || 0
    }

    const averageOpenRate = totals.sent ? +(100 * (totals.opened / totals.sent)).toFixed(2) : 0
    const averageClickRate = totals.sent ? +(100 * (totals.clicked / totals.sent)).toFixed(2) : 0
    const averageConversionRate = totals.sent ? +(100 * (totals.conversions / totals.sent)).toFixed(2) : 0

    const best = campaigns.reduce<{ id: string; name: string; metric: string; value: number } | null>((acc, c) => {
      const m: any = c.metrics || {}
      const val = m.openRate || (m.sent ? (100 * (m.opened || 0) / m.sent) : 0)
      if (!acc || val > acc.value) return { id: c.id, name: c.name, metric: 'openRate', value: val }
      return acc
    }, null) || { id: '', name: '', metric: 'openRate', value: 0 }

    const analytics = {
      performance: {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => ['SENDING','SCHEDULED'].includes(c.status as any)).length,
        completedCampaigns: campaigns.filter(c => c.status === 'COMPLETED').length,
        averageOpenRate,
        averageClickRate,
        averageConversionRate,
        totalRevenue: totals.totalRevenue,
        averageROI: 0,
        bestPerformingCampaign: best,
      },
      audience: {
        totalAudience: campaigns.reduce((sum, c) => sum + (((c.targetAudience as any)?.totalSize) || 0), 0),
        activeSubscribers: 0,
        unsubscribed: totals.unsubscribed,
        bounced: totals.bounced,
        demographics: { age: {}, gender: {}, industry: {}, company_size: {} },
        geographic: { countries: {}, regions: {}, cities: {} },
        segmentPerformance: {},
      },
      engagement: {
        emailOpens: totals.opened,
        linkClicks: totals.clicked,
        socialShares: 0,
        forwardRate: 0,
        timeToOpen: 0,
        timeToClick: 0,
        engagementByTime: { opensByHour: {}, clicksByHour: {}, opensByDay: {}, clicksByDay: {}, bestTimeToSend: { hour: 12, day: 'Thursday' } },
        topPerformingContent: [],
      },
      conversion: {
        totalConversions: totals.conversions,
        conversionRate: averageConversionRate,
        conversionValue: totals.totalRevenue,
        averageOrderValue: 0,
        topConvertingCampaigns: [],
        conversionFunnel: [],
      },
      trends: { openRateTrend: [], clickRateTrend: [], conversionTrend: [], revenueTrend: [], audienceGrowth: [] },
      benchmarks: { industryBenchmarks: {}, competitorComparison: {}, historicalComparison: {}, performanceGrades: {} },
    }

    return NextResponse.json({ success: true, data: analytics } satisfies ApiResponse)
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to fetch analytics' } satisfies ApiResponse, { status: 500 })
  }
}
