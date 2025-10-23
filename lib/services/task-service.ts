import { TaskModel, TaskSearchParams, TaskStats, TaskAnalytics, PaginatedResult } from '../models'

export class TaskService {
  private baseUrl = '/api/tasks'

  private getAuthToken(): string {
    // Get auth token from localStorage or wherever it's stored
    return typeof window !== 'undefined' ? localStorage.getItem('authToken') || '' : '';
  }

  async createTask(data: Partial<TaskModel>): Promise<TaskModel> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`)
    }

    return response.json()
  }

  async getTask(id: string): Promise<TaskModel> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get task: ${response.statusText}`)
    }

    return response.json()
  }

  async updateTask(id: string, data: Partial<TaskModel>): Promise<TaskModel> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to update task: ${response.statusText}`)
    }

    return response.json()
  }

  async deleteTask(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.statusText}`)
    }
  }

  async searchTasks(params: TaskSearchParams): Promise<PaginatedResult<TaskModel>> {
    const queryParams = new URLSearchParams()
    
    if (params.query) queryParams.append('query', params.query)
    if (params.status) queryParams.append('status', params.status.join(','))
    if (params.priority) queryParams.append('priority', params.priority.join(','))
    if (params.type) queryParams.append('type', params.type.join(','))
    if (params.assignedTo) queryParams.append('assignedTo', params.assignedTo.join(','))
    if (params.createdBy) queryParams.append('createdBy', params.createdBy.join(','))
    if (params.entityType) queryParams.append('entityType', params.entityType)
    if (params.entityId) queryParams.append('entityId', params.entityId)
    if (params.tags?.length) queryParams.append('tags', params.tags.join(','))
    if (params.dueAfter) queryParams.append('dueDateFrom', params.dueAfter.toISOString())
    if (params.dueBefore) queryParams.append('dueDateTo', params.dueBefore.toISOString())
    if (params.completedAfter) queryParams.append('completedAfter', params.completedAfter.toISOString())
    if (params.completedBefore) queryParams.append('completedBefore', params.completedBefore.toISOString())
    if (params.isOverdue !== undefined) queryParams.append('overdue', params.isOverdue.toString())
    // hasReminder is not in TaskSearchParams, so remove this line
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to search tasks: ${response.statusText}`)
    }

    return response.json()
  }
}
