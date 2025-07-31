import { ContactModel, ContactSearchParams, ContactStats, PaginatedResult, SearchOptions } from '../models'

export class ContactService {
  private baseUrl = '/api/contacts'

  async createContact(data: Partial<ContactModel>): Promise<ContactModel> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create contact: ${response.statusText}`)
    }

    return response.json()
  }

  async getContact(id: string): Promise<ContactModel> {
    const response = await fetch(`${this.baseUrl}/${id}`)

    if (!response.ok) {
      throw new Error(`Failed to get contact: ${response.statusText}`)
    }

    return response.json()
  }

  async updateContact(id: string, data: Partial<ContactModel>): Promise<ContactModel> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to update contact: ${response.statusText}`)
    }

    return response.json()
  }

  async deleteContact(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete contact: ${response.statusText}`)
    }
  }

  async searchContacts(params: ContactSearchParams): Promise<PaginatedResult<ContactModel>> {
    const queryParams = new URLSearchParams()
    
    if (params.query) queryParams.append('query', params.query)
    if (params.status) queryParams.append('status', params.status)
    if (params.lifecycle) queryParams.append('lifecycle', params.lifecycle)
    if (params.assignedTo) queryParams.append('assignedTo', params.assignedTo)
    if (params.tags?.length) queryParams.append('tags', params.tags.join(','))
    if (params.source) queryParams.append('source', params.source)
    if (params.company) queryParams.append('company', params.company)
    if (params.industry) queryParams.append('industry', params.industry)
    if (params.leadScoreMin) queryParams.append('leadScoreMin', params.leadScoreMin.toString())
    if (params.leadScoreMax) queryParams.append('leadScoreMax', params.leadScoreMax.toString())
    if (params.createdAfter) queryParams.append('createdAfter', params.createdAfter.toISOString())
    if (params.createdBefore) queryParams.append('createdBefore', params.createdBefore.toISOString())
    if (params.lastContactAfter) queryParams.append('lastContactAfter', params.lastContactAfter.toISOString())
    if (params.lastContactBefore) queryParams.append('lastContactBefore', params.lastContactBefore.toISOString())
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const response = await fetch(`${this.baseUrl}?${queryParams}`)

    if (!response.ok) {
      throw new Error(`Failed to search contacts: ${response.statusText}`)
    }

    return response.json()
  }

  async getContactStats(filters?: Partial<ContactSearchParams>): Promise<ContactStats> {
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
      throw new Error(`Failed to get contact stats: ${response.statusText}`)
    }

    return response.json()
  }

  async bulkUpdateContacts(ids: string[], updates: Partial<ContactModel>): Promise<ContactModel[]> {
    const response = await fetch(`${this.baseUrl}/bulk`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids, updates }),
    })

    if (!response.ok) {
      throw new Error(`Failed to bulk update contacts: ${response.statusText}`)
    }

    return response.json()
  }

  async bulkDeleteContacts(ids: string[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/bulk`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    })

    if (!response.ok) {
      throw new Error(`Failed to bulk delete contacts: ${response.statusText}`)
    }
  }

  async importContacts(file: File, options: {
    skipHeader?: boolean
    delimiter?: string
    duplicateHandling?: 'skip' | 'update' | 'create_new'
    mapping?: Record<string, string>
  }): Promise<{ jobId: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('options', JSON.stringify(options))

    const response = await fetch(`${this.baseUrl}/import`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to import contacts: ${response.statusText}`)
    }

    return response.json()
  }

  async exportContacts(filters: Partial<ContactSearchParams>, format: 'csv' | 'excel' | 'json'): Promise<{ jobId: string }> {
    const response = await fetch(`${this.baseUrl}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filters, format }),
    })

    if (!response.ok) {
      throw new Error(`Failed to export contacts: ${response.statusText}`)
    }

    return response.json()
  }

  async mergeDuplicates(primaryId: string, duplicateIds: string[], strategy: 'keep_latest' | 'keep_complete' | 'manual'): Promise<ContactModel> {
    const response = await fetch(`${this.baseUrl}/merge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ primaryId, duplicateIds, strategy }),
    })

    if (!response.ok) {
      throw new Error(`Failed to merge contacts: ${response.statusText}`)
    }

    return response.json()
  }

  async findDuplicates(options: {
    fields?: string[]
    threshold?: number
    exact?: boolean
  }): Promise<{
    groups: Array<{
      similarityScore: number
      contacts: ContactModel[]
    }>
  }> {
    const queryParams = new URLSearchParams()
    
    if (options.fields?.length) queryParams.append('fields', options.fields.join(','))
    if (options.threshold) queryParams.append('threshold', options.threshold.toString())
    if (options.exact !== undefined) queryParams.append('exact', options.exact.toString())

    const response = await fetch(`${this.baseUrl}/duplicates?${queryParams}`)

    if (!response.ok) {
      throw new Error(`Failed to find duplicates: ${response.statusText}`)
    }

    return response.json()
  }

  async addTag(contactId: string, tagId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${contactId}/tags`, {
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

  async removeTag(contactId: string, tagId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${contactId}/tags/${tagId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to remove tag: ${response.statusText}`)
    }
  }

  async updateScore(contactId: string, score: number, reason?: string): Promise<ContactModel> {
    const response = await fetch(`${this.baseUrl}/${contactId}/score`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ score, reason }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update score: ${response.statusText}`)
    }

    return response.json()
  }

  async getContactActivities(contactId: string, options?: {
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

    const response = await fetch(`${this.baseUrl}/${contactId}/activities?${queryParams}`)

    if (!response.ok) {
      throw new Error(`Failed to get contact activities: ${response.statusText}`)
    }

    return response.json()
  }

  async assignToUser(contactId: string, userId: string): Promise<ContactModel> {
    const response = await fetch(`${this.baseUrl}/${contactId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })

    if (!response.ok) {
      throw new Error(`Failed to assign contact: ${response.statusText}`)
    }

    return response.json()
  }

  async unassign(contactId: string): Promise<ContactModel> {
    const response = await fetch(`${this.baseUrl}/${contactId}/assign`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to unassign contact: ${response.statusText}`)
    }

    return response.json()
  }
}

export const contactService = new ContactService()
