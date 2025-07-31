import { CampaignModel, CampaignSearchParams, CampaignStats, CampaignAnalytics, PaginatedResult } from '../models'

export class CampaignService {
  private baseUrl = '/api/campaigns'

  async createCampaign(data: Partial<CampaignModel>): Promise<CampaignModel> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create campaign: ${response.statusText}`)
    }

    return response.json()
  }

  async getCampaign(id: string): Promise<CampaignModel> {
    const response = await fetch(`${this.baseUrl}/${id}`)

    if (!response.ok) {
      throw new Error(`Failed to get campaign: ${response.statusText}`)
    }

    return response.json()
  }

  async updateCampaign(id: string, data: Partial<CampaignModel>): Promise<CampaignModel> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to update campaign: ${response.statusText}`)
    }

    return response.json()
  }

  async deleteCampaign(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete campaign: ${response.statusText}`)
    }
  }

  async searchCampaigns(params: CampaignSearchParams): Promise<PaginatedResult<CampaignModel>> {
    const queryParams = new URLSearchParams()
    
    if (params.query) queryParams.append('query', params.query)
    if (params.type) queryParams.append('type', params.type)
    if (params.status) queryParams.append('status', params.status)
    if (params.channel) queryParams.append('channel', params.channel)
    if (params.createdBy) queryParams.append('createdBy', params.createdBy)
    if (params.tags?.length) queryParams.append('tags', params.tags.join(','))
    if (params.audience?.length) queryParams.append('audience', params.audience.join(','))
    if (params.budgetMin) queryParams.append('budgetMin', params.budgetMin.toString())
    if (params.budgetMax) queryParams.append('budgetMax', params.budgetMax.toString())
    if (params.startDateFrom) queryParams.append('startDateFrom', params.startDateFrom.toISOString())
    if (params.startDateTo) queryParams.append('startDateTo', params.startDateTo.toISOString())
    if (params.endDateFrom) queryParams.append('endDateFrom', params.endDateFrom.toISOString())
    if (params.endDateTo) queryParams.append('endDateTo', params.endDateTo.toISOString())
    if (params.createdAfter) queryParams.append('createdAfter', params.createdAfter.toISOString())
    if (params.createdBefore) queryParams.append('createdBefore', params.createdBefore.toISOString())
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const response = await fetch(`${this.baseUrl}?${queryParams}`)

    if (!response.ok) {
      throw new Error(`Failed to search campaigns: ${response.statusText}`)
    }

    return response.json()
  }

  async getCampaignStats(filters?: Partial<CampaignSearchParams>): Promise<CampaignStats> {
    const queryParams = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','))
          } else if (value instanceof Date) {
            queryParams.append(key, value.toISOString())
          } else {
            queryParams.append(key, value.toString())
          }
        }
      })
    }

    const response = await fetch(`${this.baseUrl}/stats?${queryParams}`)

    if (!response.ok) {
      throw new Error(`Failed to get campaign stats: ${response.statusText}`)
    }

    return response.json()
  }

  async getCampaignAnalytics(campaignId: string, metrics?: string[]): Promise<CampaignAnalytics> {
    const queryParams = new URLSearchParams()
    if (metrics?.length) queryParams.append('metrics', metrics.join(','))

    const response = await fetch(`${this.baseUrl}/${campaignId}/analytics?${queryParams}`)

    if (!response.ok) {
      throw new Error(`Failed to get campaign analytics: ${response.statusText}`)
    }

    return response.json()
  }

  async startCampaign(campaignId: string): Promise<CampaignModel> {
    const response = await fetch(`${this.baseUrl}/${campaignId}/start`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(`Failed to start campaign: ${response.statusText}`)
    }

    return response.json()
  }

  async pauseCampaign(campaignId: string): Promise<CampaignModel> {
    const response = await fetch(`${this.baseUrl}/${campaignId}/pause`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(`Failed to pause campaign: ${response.statusText}`)
    }

    return response.json()
  }

  async stopCampaign(campaignId: string): Promise<CampaignModel> {
    const response = await fetch(`${this.baseUrl}/${campaignId}/stop`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(`Failed to stop campaign: ${response.statusText}`)
    }

    return response.json()
  }

  async cloneCampaign(campaignId: string, options: {
    newName?: string
    includeAudience?: boolean
    includeContent?: boolean
    includeSchedule?: boolean
  }): Promise<CampaignModel> {
    const response = await fetch(`${this.baseUrl}/${campaignId}/clone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      throw new Error(`Failed to clone campaign: ${response.statusText}`)
    }

    return response.json()
  }

  async createABTest(campaignId: string, variants: Array<{
    name: string
    percentage: number
    content: any
    subject?: string
  }>): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${campaignId}/ab-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ variants }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create A/B test: ${response.statusText}`)
    }

    return response.json()
  }

  async addAudience(campaignId: string, audienceData: {
    type: 'segment' | 'list' | 'filter'
    segmentId?: string
    listId?: string
    filters?: any
    contacts?: string[]
  }): Promise<CampaignModel> {
    const response = await fetch(`${this.baseUrl}/${campaignId}/audience`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(audienceData),
    })

    if (!response.ok) {
      throw new Error(`Failed to add audience: ${response.statusText}`)
    }

    return response.json()
  }

  async updateContent(campaignId: string, content: {
    subject?: string
    preheader?: string
    htmlContent?: string
    textContent?: string
    attachments?: Array<{
      name: string
      url: string
      type: string
    }>
  }): Promise<CampaignModel> {
    const response = await fetch(`${this.baseUrl}/${campaignId}/content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(content),
    })

    if (!response.ok) {
      throw new Error(`Failed to update content: ${response.statusText}`)
    }

    return response.json()
  }

  async scheduleDelivery(campaignId: string, schedule: {
    type: 'immediate' | 'scheduled' | 'recurring'
    sendAt?: Date
    timezone?: string
    frequency?: 'daily' | 'weekly' | 'monthly'
    endDate?: Date
    maxSends?: number
  }): Promise<CampaignModel> {
    const response = await fetch(`${this.baseUrl}/${campaignId}/schedule`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(schedule),
    })

    if (!response.ok) {
      throw new Error(`Failed to schedule delivery: ${response.statusText}`)
    }

    return response.json()
  }

  async sendTestEmail(campaignId: string, recipients: string[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${campaignId}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipients }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send test email: ${response.statusText}`)
    }
  }

  async getDeliveryStatus(campaignId: string): Promise<{
    status: string
    sent: number
    delivered: number
    failed: number
    pending: number
    bounced: number
    opened: number
    clicked: number
    unsubscribed: number
    complaints: number
  }> {
    const response = await fetch(`${this.baseUrl}/${campaignId}/delivery`)

    if (!response.ok) {
      throw new Error(`Failed to get delivery status: ${response.statusText}`)
    }

    return response.json()
  }

  async getEngagementMetrics(campaignId: string, period?: {
    startDate: Date
    endDate: Date
  }): Promise<{
    opens: Array<{ date: string; count: number }>
    clicks: Array<{ date: string; count: number; url?: string }>
    conversions: Array<{ date: string; count: number; value?: number }>
    unsubscribes: Array<{ date: string; count: number }>
    bounces: Array<{ date: string; count: number; type: string }>
  }> {
    const queryParams = new URLSearchParams()
    if (period?.startDate) queryParams.append('startDate', period.startDate.toISOString())
    if (period?.endDate) queryParams.append('endDate', period.endDate.toISOString())

    const response = await fetch(`${this.baseUrl}/${campaignId}/engagement?${queryParams}`)

    if (!response.ok) {
      throw new Error(`Failed to get engagement metrics: ${response.statusText}`)
    }

    return response.json()
  }

  async addTag(campaignId: string, tagId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${campaignId}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tagId }),
    })

    if (!response.ok) {
      throw new Error(`Failed to add tag: ${response.statusText}`)
    }
  }

  async removeTag(campaignId: string, tagId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${campaignId}/tags/${tagId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to remove tag: ${response.statusText}`)
    }
  }

  async updateBudget(campaignId: string, budget: number, budgetType: 'total' | 'daily' | 'monthly'): Promise<CampaignModel> {
    const response = await fetch(`${this.baseUrl}/${campaignId}/budget`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ budget, budgetType }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update budget: ${response.statusText}`)
    }

    return response.json()
  }

  async getROIAnalysis(campaignId: string): Promise<{
    investment: number
    revenue: number
    roi: number
    conversionRate: number
    costPerLead: number
    costPerAcquisition: number
    customerLifetimeValue: number
    breakdown: {
      adSpend: number
      personalCosts: number
      toolsCosts: number
      otherCosts: number
    }
  }> {
    const response = await fetch(`${this.baseUrl}/${campaignId}/roi`)

    if (!response.ok) {
      throw new Error(`Failed to get ROI analysis: ${response.statusText}`)
    }

    return response.json()
  }

  async exportReport(campaignId: string, format: 'pdf' | 'excel' | 'csv', metrics?: string[]): Promise<{ jobId: string }> {
    const response = await fetch(`${this.baseUrl}/${campaignId}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ format, metrics }),
    })

    if (!response.ok) {
      throw new Error(`Failed to export report: ${response.statusText}`)
    }

    return response.json()
  }

  async createWorkflow(campaignId: string, workflowData: {
    name: string
    triggers: any[]
    actions: any[]
    conditions?: any[]
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${campaignId}/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workflowData),
    })

    if (!response.ok) {
      throw new Error(`Failed to create workflow: ${response.statusText}`)
    }

    return response.json()
  }

  async bulkUpdateCampaigns(ids: string[], updates: Partial<CampaignModel>): Promise<CampaignModel[]> {
    const response = await fetch(`${this.baseUrl}/bulk`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids, updates }),
    })

    if (!response.ok) {
      throw new Error(`Failed to bulk update campaigns: ${response.statusText}`)
    }

    return response.json()
  }
}

export const campaignService = new CampaignService()
