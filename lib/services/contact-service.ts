import { ContactModel, ContactSearchParams, ContactStats, PaginatedResult, SearchOptions, ContactDashboardData } from '../models'

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
    if (params.status) {
      queryParams.append('status', Array.isArray(params.status) ? params.status.join(',') : params.status)
    }
    if (params.lifecycle) {
      queryParams.append('lifecycle', Array.isArray(params.lifecycle) ? params.lifecycle.join(',') : params.lifecycle)
    }
    if (params.assignedTo) {
      queryParams.append('assignedTo', Array.isArray(params.assignedTo) ? params.assignedTo.join(',') : params.assignedTo)
    }
    if (params.tags?.length) queryParams.append('tags', params.tags.join(','))
    if (params.source) {
      queryParams.append('source', Array.isArray(params.source) ? params.source.join(',') : params.source)
    }
    if (params.company) queryParams.append('company', params.company)
    if (params.leadScoreMin) queryParams.append('leadScoreMin', params.leadScoreMin.toString())
    if (params.leadScoreMax) queryParams.append('leadScoreMax', params.leadScoreMax.toString())
    if (params.createdAfter) queryParams.append('createdAfter', params.createdAfter.toISOString())
    if (params.createdBefore) queryParams.append('createdBefore', params.createdBefore.toISOString())
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

    const response = await fetch(`/api/contacts/stats?${queryParams}`)

    if (!response.ok) {
      throw new Error(`Failed to get contact stats: ${response.statusText}`)
    }

    return response.json()
  }

  async getContactDashboard(filters?: Partial<ContactSearchParams>): Promise<ContactDashboardData> {
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

    const response = await fetch(`/api/contacts/dashboard?${queryParams}`)

    if (!response.ok) {
      throw new Error(`Failed to get contact dashboard data: ${response.statusText}`)
    }

    return response.json()
  }
}

export const contactService = new ContactService()