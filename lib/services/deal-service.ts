import { DealModel, DealSearchParams, DealStats, DealForecast, PipelineModel, PaginatedResult } from '../models'

export class DealService {
  private baseUrl = '/api/deals'

  async createDeal(data: Partial<DealModel>): Promise<DealModel> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create deal: ${response.statusText}`)
    }

    return response.json()
  }

  async getDeal(id: string): Promise<DealModel> {
    const response = await fetch(`${this.baseUrl}/${id}`)

    if (!response.ok) {
      throw new Error(`Failed to get deal: ${response.statusText}`)
    }

    return response.json()
  }

  async updateDeal(id: string, data: Partial<DealModel>): Promise<DealModel> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to update deal: ${response.statusText}`)
    }

    return response.json()
  }

  async deleteDeal(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete deal: ${response.statusText}`)
    }
  }

  async searchDeals(params: DealSearchParams): Promise<PaginatedResult<DealModel>> {
    const queryParams = new URLSearchParams()
    
    if (params.query) queryParams.append('query', params.query)
    if (params.pipelineId) queryParams.append('pipelineId', params.pipelineId)
    if (params.stageId) queryParams.append('stageId', params.stageId)
    if (params.assignedTo) queryParams.append('assignedTo', params.assignedTo)
    if (params.contactId) queryParams.append('contactId', params.contactId)
    if (params.status) queryParams.append('status', params.status)
    if (params.type) queryParams.append('type', params.type)
    if (params.priority) queryParams.append('priority', params.priority)
    if (params.source) queryParams.append('source', params.source)
    if (params.tags?.length) queryParams.append('tags', params.tags.join(','))
    if (params.valueMin) queryParams.append('valueMin', params.valueMin.toString())
    if (params.valueMax) queryParams.append('valueMax', params.valueMax.toString())
    if (params.probabilityMin) queryParams.append('probabilityMin', params.probabilityMin.toString())
    if (params.probabilityMax) queryParams.append('probabilityMax', params.probabilityMax.toString())
    if (params.expectedCloseDateFrom) queryParams.append('expectedCloseDateFrom', params.expectedCloseDateFrom.toISOString())
    if (params.expectedCloseDateTo) queryParams.append('expectedCloseDateTo', params.expectedCloseDateTo.toISOString())
    if (params.createdAfter) queryParams.append('createdAfter', params.createdAfter.toISOString())
    if (params.createdBefore) queryParams.append('createdBefore', params.createdBefore.toISOString())
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const response = await fetch(`${this.baseUrl}?${queryParams}`)

    if (!response.ok) {
      throw new Error(`Failed to search deals: ${response.statusText}`)
    }

    return response.json()
  }

  async getDealStats(filters?: Partial<DealSearchParams>): Promise<DealStats> {
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
      throw new Error(`Failed to get deal stats: ${response.statusText}`)
    }

    return response.json()
  }

  async getForecast(options: {
    pipelineId?: string
    period: 'monthly' | 'quarterly' | 'yearly'
    startDate: Date
    endDate: Date
    method?: 'probability' | 'historical' | 'ai'
  }): Promise<DealForecast> {
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

  async moveDealToStage(dealId: string, stageId: string, notes?: string): Promise<DealModel> {
    const response = await fetch(`${this.baseUrl}/${dealId}/stage`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stageId, notes }),
    })

    if (!response.ok) {
      throw new Error(`Failed to move deal: ${response.statusText}`)
    }

    return response.json()
  }

  async winDeal(dealId: string, actualValue?: number, winReason?: string): Promise<DealModel> {
    const response = await fetch(`${this.baseUrl}/${dealId}/win`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ actualValue, winReason }),
    })

    if (!response.ok) {
      throw new Error(`Failed to win deal: ${response.statusText}`)
    }

    return response.json()
  }

  async loseDeal(dealId: string, lossReason: string, competitorId?: string): Promise<DealModel> {
    const response = await fetch(`${this.baseUrl}/${dealId}/lose`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lossReason, competitorId }),
    })

    if (!response.ok) {
      throw new Error(`Failed to lose deal: ${response.statusText}`)
    }

    return response.json()
  }

  async addProduct(dealId: string, productData: {
    productId: string
    quantity: number
    unitPrice: number
    discount?: number
    description?: string
  }): Promise<DealModel> {
    const response = await fetch(`${this.baseUrl}/${dealId}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    })

    if (!response.ok) {
      throw new Error(`Failed to add product: ${response.statusText}`)
    }

    return response.json()
  }

  async removeProduct(dealId: string, productId: string): Promise<DealModel> {
    const response = await fetch(`${this.baseUrl}/${dealId}/products/${productId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to remove product: ${response.statusText}`)
    }

    return response.json()
  }

  async bulkUpdateDeals(ids: string[], updates: Partial<DealModel>): Promise<DealModel[]> {
    const response = await fetch(`${this.baseUrl}/bulk`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids, updates }),
    })

    if (!response.ok) {
      throw new Error(`Failed to bulk update deals: ${response.statusText}`)
    }

    return response.json()
  }

  async cloneDeal(dealId: string, options: {
    includeTasks?: boolean
    includeNotes?: boolean
    includeDocuments?: boolean
    newTitle?: string
  }): Promise<DealModel> {
    const response = await fetch(`${this.baseUrl}/${dealId}/clone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      throw new Error(`Failed to clone deal: ${response.statusText}`)
    }

    return response.json()
  }

  async assignToUser(dealId: string, userId: string): Promise<DealModel> {
    const response = await fetch(`${this.baseUrl}/${dealId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })

    if (!response.ok) {
      throw new Error(`Failed to assign deal: ${response.statusText}`)
    }

    return response.json()
  }

  async getDealActivities(dealId: string, options?: {
    page?: number
    limit?: number
    type?: string[]
    dateFrom?: Date
    dateTo?: Date
  }): Promise<PaginatedResult<any>> {
    const queryParams = new URLSearchParams()
    
    if (options?.page) queryParams.append('page', options.page.toString())
    if (options?.limit) queryParams.append('limit', options.limit.toString())
    if (options?.type?.length) queryParams.append('type', options.type.join(','))
    if (options?.dateFrom) queryParams.append('dateFrom', options.dateFrom.toISOString())
    if (options?.dateTo) queryParams.append('dateTo', options.dateTo.toISOString())

    const response = await fetch(`${this.baseUrl}/${dealId}/activities?${queryParams}`)

    if (!response.ok) {
      throw new Error(`Failed to get deal activities: ${response.statusText}`)
    }

    return response.json()
  }

  async addNote(dealId: string, content: string, isPrivate?: boolean): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${dealId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, isPrivate }),
    })

    if (!response.ok) {
      throw new Error(`Failed to add note: ${response.statusText}`)
    }

    return response.json()
  }

  async uploadDocument(dealId: string, file: File, category?: string): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    if (category) formData.append('category', category)

    const response = await fetch(`${this.baseUrl}/${dealId}/documents`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to upload document: ${response.statusText}`)
    }

    return response.json()
  }

  async updateProbability(dealId: string, probability: number, reason?: string): Promise<DealModel> {
    const response = await fetch(`${this.baseUrl}/${dealId}/probability`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ probability, reason }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update probability: ${response.statusText}`)
    }

    return response.json()
  }

  async addCompetitor(dealId: string, competitorData: {
    name: string
    strengths?: string[]
    weaknesses?: string[]
    pricing?: number
    notes?: string
  }): Promise<DealModel> {
    const response = await fetch(`${this.baseUrl}/${dealId}/competitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(competitorData),
    })

    if (!response.ok) {
      throw new Error(`Failed to add competitor: ${response.statusText}`)
    }

    return response.json()
  }

  async createProposal(dealId: string, proposalData: {
    templateId?: string
    title: string
    content: string
    validUntil?: Date
    terms?: string
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${dealId}/proposals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proposalData),
    })

    if (!response.ok) {
      throw new Error(`Failed to create proposal: ${response.statusText}`)
    }

    return response.json()
  }

  async createQuote(dealId: string, quoteData: {
    products: Array<{
      productId: string
      quantity: number
      unitPrice: number
      discount?: number
    }>
    validUntil?: Date
    terms?: string
    notes?: string
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${dealId}/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quoteData),
    })

    if (!response.ok) {
      throw new Error(`Failed to create quote: ${response.statusText}`)
    }

    return response.json()
  }
}

export const dealService = new DealService()
