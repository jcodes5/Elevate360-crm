import { AnalyticsModel, DashboardModel, KPIModel, ReportModel, PaginatedResult } from '../models'

export class AnalyticsService {
  private baseUrl = '/api/analytics'

  async createDashboard(data: Partial<DashboardModel>): Promise<DashboardModel> {
    const response = await fetch(`${this.baseUrl}/dashboards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create dashboard: ${response.statusText}`)
    }

    return response.json()
  }

  async getDashboard(id: string): Promise<DashboardModel> {
    const response = await fetch(`${this.baseUrl}/dashboards/${id}`)

    if (!response.ok) {
      throw new Error(`Failed to get dashboard: ${response.statusText}`)
    }

    return response.json()
  }

  async updateDashboard(id: string, data: Partial<DashboardModel>): Promise<DashboardModel> {
    const response = await fetch(`${this.baseUrl}/dashboards/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to update dashboard: ${response.statusText}`)
    }

    return response.json()
  }

  async deleteDashboard(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/dashboards/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete dashboard: ${response.statusText}`)
    }
  }

  async getDashboards(options?: {
    page?: number
    limit?: number
    category?: string
    isPublic?: boolean
  }): Promise<PaginatedResult<DashboardModel>> {
    const queryParams = new URLSearchParams()
    
    if (options?.page) queryParams.append('page', options.page.toString())
    if (options?.limit) queryParams.append('limit', options.limit.toString())
    if (options?.category) queryParams.append('category', options.category)
    if (options?.isPublic !== undefined) queryParams.append('isPublic', options.isPublic.toString())

    const response = await fetch(`${this.baseUrl}/dashboards?${queryParams}`)

    if (!response.ok) {
      throw new Error(`Failed to get dashboards: ${response.statusText}`)
    }

    return response.json()
  }

  async createReport(data: Partial<ReportModel>): Promise<ReportModel> {
    const response = await fetch(`${this.baseUrl}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create report: ${response.statusText}`)
    }

    return response.json()
  }

  async getReport(id: string): Promise<ReportModel> {
    const response = await fetch(`${this.baseUrl}/reports/${id}`)

    if (!response.ok) {
      throw new Error(`Failed to get report: ${response.statusText}`)
    }

    return response.json()
  }

  async runReport(id: string, parameters?: Record<string, any>): Promise<{
    data: any[]
    totalRows: number
    executionTime: number
    generatedAt: Date
    metadata?: Record<string, any>
  }> {
    const response = await fetch(`${this.baseUrl}/reports/${id}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ parameters }),
    })

    if (!response.ok) {
      throw new Error(`Failed to run report: ${response.statusText}`)
    }

    return response.json()
  }

  async scheduleReport(reportId: string, schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    time?: string
    dayOfWeek?: number
    dayOfMonth?: number
    recipients: string[]
    format: 'pdf' | 'excel' | 'csv'
    isActive: boolean
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/reports/${reportId}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(schedule),
    })

    if (!response.ok) {
      throw new Error(`Failed to schedule report: ${response.statusText}`)
    }

    return response.json()
  }

  async getKPIs(filters?: {
    category?: string
    department?: string
    period?: 'today' | 'week' | 'month' | 'quarter' | 'year'
    startDate?: Date
    endDate?: Date
  }): Promise<KPIModel[]> {
    const queryParams = new URLSearchParams()
    
    if (filters?.category) queryParams.append('category', filters.category)
    if (filters?.department) queryParams.append('department', filters.department)
    if (filters?.period) queryParams.append('period', filters.period)
    if (filters?.startDate) queryParams.append('startDate', filters.startDate.toISOString())
    if (filters?.endDate) queryParams.append('endDate', filters.endDate.toISOString())

    const response = await fetch(`${this.baseUrl}/kpis?${queryParams}`)

    if (!response.ok) {
      throw new Error(`Failed to get KPIs: ${response.statusText}`)
    }

    return response.json()
  }

  async getRevenue(options: {
    period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
    startDate?: Date
    endDate?: Date
    groupBy?: 'day' | 'week' | 'month' | 'quarter'
    pipelineId?: string
    userId?: string
  }): Promise<{
    total: number
    growth: number
    forecast: number
    breakdown: Array<{
      period: string
      revenue: number
      deals: number
      averageDealSize: number
    }>
    comparison: {
      previousPeriod: number
      growthRate: number
    }
  }> {
    const response = await fetch(`${this.baseUrl}/revenue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      throw new Error(`Failed to get revenue: ${response.statusText}`)
    }

    return response.json()
  }

  async getSalesMetrics(options: {
    period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
    startDate?: Date
    endDate?: Date
    userId?: string
    teamId?: string
    pipelineId?: string
  }): Promise<{
    dealsWon: number
    dealsLost: number
    winRate: number
    averageSalesycle: number
    averageDealSize: number
    totalRevenue: number
    pipeline: {
      totalValue: number
      weightedValue: number
      dealCount: number
      averageProbability: number
    }
    activities: {
      calls: number
      emails: number
      meetings: number
      tasks: number
    }
    conversion: {
      leadToOpportunity: number
      opportunityToWin: number
      leadToWin: number
    }
  }> {
    const response = await fetch(`${this.baseUrl}/sales-metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      throw new Error(`Failed to get sales metrics: ${response.statusText}`)
    }

    return response.json()
  }

  async getMarketingMetrics(options: {
    period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
    startDate?: Date
    endDate?: Date
    campaignId?: string
    channel?: string
  }): Promise<{
    leads: {
      total: number
      qualified: number
      converted: number
      conversionRate: number
    }
    campaigns: {
      active: number
      sent: number
      opened: number
      clicked: number
      openRate: number
      clickRate: number
      unsubscribed: number
    }
    channels: Array<{
      name: string
      leads: number
      cost: number
      revenue: number
      roi: number
      cpa: number
    }>
    attribution: Array<{
      channel: string
      firstTouch: number
      lastTouch: number
      multiTouch: number
    }>
    funnel: Array<{
      stage: string
      count: number
      conversionRate: number
    }>
  }> {
    const response = await fetch(`${this.baseUrl}/marketing-metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      throw new Error(`Failed to get marketing metrics: ${response.statusText}`)
    }

    return response.json()
  }

  async getCustomerMetrics(options: {
    period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
    startDate?: Date
    endDate?: Date
    segmentId?: string
  }): Promise<{
    acquisition: {
      newCustomers: number
      acquisitionCost: number
      acquisitionRate: number
    }
    retention: {
      churnRate: number
      retentionRate: number
      customerLifetimeValue: number
    }
    engagement: {
      activeUsers: number
      sessionDuration: number
      pageViews: number
      emailEngagement: number
    }
    satisfaction: {
      nps: number
      csat: number
      feedbackCount: number
    }
    segments: Array<{
      name: string
      count: number
      revenue: number
      avgValue: number
    }>
  }> {
    const response = await fetch(`${this.baseUrl}/customer-metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      throw new Error(`Failed to get customer metrics: ${response.statusText}`)
    }

    return response.json()
  }

  async getForecast(options: {
    type: 'revenue' | 'deals' | 'leads'
    period: 'month' | 'quarter' | 'year'
    method: 'linear' | 'exponential' | 'polynomial' | 'moving_average' | 'ai'
    confidence?: number
    includeSeasonal?: boolean
    pipelineId?: string
    userId?: string
  }): Promise<{
    predictions: Array<{
      period: string
      predicted: number
      confidence: number
      upper: number
      lower: number
    }>
    accuracy: {
      mape: number // Mean Absolute Percentage Error
      rmse: number // Root Mean Square Error
      r2: number   // R-squared
    }
    factors: Array<{
      name: string
      impact: number
      confidence: number
    }>
    assumptions: string[]
  }> {
    const response = await fetch(`${this.baseUrl}/forecast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      throw new Error(`Failed to get forecast: ${response.statusText}`)
    }

    return response.json()
  }

  async getCohortAnalysis(options: {
    metric: 'revenue' | 'retention' | 'engagement'
    cohortBy: 'month' | 'quarter' | 'year'
    periodBy: 'week' | 'month' | 'quarter'
    startDate: Date
    endDate: Date
  }): Promise<{
    cohorts: Array<{
      cohort: string
      size: number
      periods: Array<{
        period: number
        value: number
        percentage?: number
      }>
    }>
    averages: Array<{
      period: number
      value: number
      percentage?: number
    }>
    insights: string[]
  }> {
    const response = await fetch(`${this.baseUrl}/cohort-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      throw new Error(`Failed to get cohort analysis: ${response.statusText}`)
    }

    return response.json()
  }

  async getFunnelAnalysis(funnelId: string, options?: {
    startDate?: Date
    endDate?: Date
    segmentBy?: string
  }): Promise<{
    stages: Array<{
      name: string
      count: number
      percentage: number
      dropoff: number
      averageTime: number
    }>
    overall: {
      conversionRate: number
      averageTime: number
      totalEntries: number
      totalConversions: number
    }
    segments: Array<{
      segment: string
      conversionRate: number
      count: number
    }>
    timeAnalysis: Array<{
      period: string
      conversionRate: number
      entries: number
    }>
  }> {
    const queryParams = new URLSearchParams()
    
    if (options?.startDate) queryParams.append('startDate', options.startDate.toISOString())
    if (options?.endDate) queryParams.append('endDate', options.endDate.toISOString())
    if (options?.segmentBy) queryParams.append('segmentBy', options.segmentBy)

    const response = await fetch(`${this.baseUrl}/funnel/${funnelId}/analysis?${queryParams}`)

    if (!response.ok) {
      throw new Error(`Failed to get funnel analysis: ${response.statusText}`)
    }

    return response.json()
  }

  async getAttributionAnalysis(options: {
    model: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based'
    lookbackWindow: number // days
    startDate: Date
    endDate: Date
  }): Promise<{
    channels: Array<{
      channel: string
      attribution: number
      touches: number
      revenue: number
      roi: number
    }>
    touchpoints: Array<{
      touchpoint: string
      attribution: number
      conversions: number
      revenue: number
    }>
    paths: Array<{
      path: string[]
      count: number
      revenue: number
      conversionRate: number
    }>
    insights: {
      topChannel: string
      topTouchpoint: string
      averagePathLength: number
      conversionTime: number
    }
  }> {
    const response = await fetch(`${this.baseUrl}/attribution-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      throw new Error(`Failed to get attribution analysis: ${response.statusText}`)
    }

    return response.json()
  }

  async createCustomMetric(data: {
    name: string
    description?: string
    formula: string
    category: string
    unit: string
    format: 'number' | 'currency' | 'percentage'
    isPublic: boolean
    refreshFrequency: number // minutes
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/custom-metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create custom metric: ${response.statusText}`)
    }

    return response.json()
  }

  async exportData(options: {
    type: 'dashboard' | 'report' | 'kpi'
    id: string
    format: 'pdf' | 'excel' | 'csv' | 'png'
    parameters?: Record<string, any>
  }): Promise<{ jobId: string }> {
    const response = await fetch(`${this.baseUrl}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      throw new Error(`Failed to export data: ${response.statusText}`)
    }

    return response.json()
  }

  async getInsights(options: {
    type: 'anomaly' | 'trend' | 'forecast' | 'recommendation'
    entity?: string
    timeframe?: 'week' | 'month' | 'quarter'
    confidence?: number
  }): Promise<Array<{
    id: string
    type: string
    title: string
    description: string
    confidence: number
    impact: 'low' | 'medium' | 'high'
    category: string
    actionable: boolean
    suggestions: string[]
    data: any
    createdAt: Date
  }>> {
    const queryParams = new URLSearchParams()
    
    if (options.entity) queryParams.append('entity', options.entity)
    if (options.timeframe) queryParams.append('timeframe', options.timeframe)
    if (options.confidence) queryParams.append('confidence', options.confidence.toString())

    const response = await fetch(`${this.baseUrl}/insights/${options.type}?${queryParams}`)

    if (!response.ok) {
      throw new Error(`Failed to get insights: ${response.statusText}`)
    }

    return response.json()
  }

  async getPerformanceMetrics(userId?: string): Promise<{
    individual: {
      dealsWon: number
      revenue: number
      activities: number
      score: number
      rank: number
      target: number
      achievement: number
    }
    team: {
      totalRevenue: number
      teamSize: number
      averageScore: number
      topPerformer: string
    }
    goals: Array<{
      name: string
      target: number
      current: number
      percentage: number
      status: 'on_track' | 'behind' | 'ahead'
    }>
  }> {
    const queryParams = new URLSearchParams()
    if (userId) queryParams.append('userId', userId)

    const response = await fetch(`${this.baseUrl}/performance?${queryParams}`)

    if (!response.ok) {
      throw new Error(`Failed to get performance metrics: ${response.statusText}`)
    }

    return response.json()
  }
}

export const analyticsService = new AnalyticsService()
