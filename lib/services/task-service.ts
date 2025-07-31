import { TaskModel, TaskSearchParams, TaskStats, TaskAnalytics, PaginatedResult } from '../models'

export class TaskService {
  private baseUrl = '/api/tasks'

  async createTask(data: Partial<TaskModel>): Promise<TaskModel> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`)
    }

    return response.json()
  }

  async getTask(id: string): Promise<TaskModel> {
    const response = await fetch(`${this.baseUrl}/${id}`)

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
    })

    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.statusText}`)
    }
  }

  async searchTasks(params: TaskSearchParams): Promise<PaginatedResult<TaskModel>> {
    const queryParams = new URLSearchParams()
    
    if (params.query) queryParams.append('query', params.query)
    if (params.status) queryParams.append('status', params.status)
    if (params.priority) queryParams.append('priority', params.priority)
    if (params.type) queryParams.append('type', params.type)
    if (params.assignedTo) queryParams.append('assignedTo', params.assignedTo)
    if (params.createdBy) queryParams.append('createdBy', params.createdBy)
    if (params.entityType) queryParams.append('entityType', params.entityType)
    if (params.entityId) queryParams.append('entityId', params.entityId)
    if (params.tags?.length) queryParams.append('tags', params.tags.join(','))
    if (params.dueDateFrom) queryParams.append('dueDateFrom', params.dueDateFrom.toISOString())
    if (params.dueDateTo) queryParams.append('dueDateTo', params.dueDateTo.toISOString())
    if (params.completedAfter) queryParams.append('completedAfter', params.completedAfter.toISOString())
    if (params.completedBefore) queryParams.append('completedBefore', params.completedBefore.toISOString())
    if (params.createdAfter) queryParams.append('createdAfter', params.createdAfter.toISOString())
    if (params.createdBefore) queryParams.append('createdBefore', params.createdBefore.toISOString())
    if (params.overdue !== undefined) queryParams.append('overdue', params.overdue.toString())
    if (params.hasReminder !== undefined) queryParams.append('hasReminder', params.hasReminder.toString())
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const response = await fetch(`${this.baseUrl}?${queryParams}`)

    if (!response.ok) {
      throw new Error(`Failed to search tasks: ${response.statusText}`)
    }

    return response.json()
  }

  async getTaskStats(filters?: Partial<TaskSearchParams>): Promise<TaskStats> {
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
      throw new Error(`Failed to get task stats: ${response.statusText}`)
    }

    return response.json()
  }

  async getTaskAnalytics(filters?: Partial<TaskSearchParams>): Promise<TaskAnalytics> {
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

    const response = await fetch(`${this.baseUrl}/analytics?${queryParams}`)

    if (!response.ok) {
      throw new Error(`Failed to get task analytics: ${response.statusText}`)
    }

    return response.json()
  }

  async completeTask(taskId: string, outcome?: string, actualDuration?: number): Promise<TaskModel> {
    const response = await fetch(`${this.baseUrl}/${taskId}/complete`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ outcome, actualDuration }),
    })

    if (!response.ok) {
      throw new Error(`Failed to complete task: ${response.statusText}`)
    }

    return response.json()
  }

  async startTask(taskId: string): Promise<TaskModel> {
    const response = await fetch(`${this.baseUrl}/${taskId}/start`, {
      method: 'PUT',
    })

    if (!response.ok) {
      throw new Error(`Failed to start task: ${response.statusText}`)
    }

    return response.json()
  }

  async pauseTask(taskId: string): Promise<TaskModel> {
    const response = await fetch(`${this.baseUrl}/${taskId}/pause`, {
      method: 'PUT',
    })

    if (!response.ok) {
      throw new Error(`Failed to pause task: ${response.statusText}`)
    }

    return response.json()
  }

  async assignTask(taskId: string, userId: string): Promise<TaskModel> {
    const response = await fetch(`${this.baseUrl}/${taskId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })

    if (!response.ok) {
      throw new Error(`Failed to assign task: ${response.statusText}`)
    }

    return response.json()
  }

  async unassignTask(taskId: string): Promise<TaskModel> {
    const response = await fetch(`${this.baseUrl}/${taskId}/assign`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to unassign task: ${response.statusText}`)
    }

    return response.json()
  }

  async addSubtask(parentId: string, subtaskData: Partial<TaskModel>): Promise<TaskModel> {
    const response = await fetch(`${this.baseUrl}/${parentId}/subtasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subtaskData),
    })

    if (!response.ok) {
      throw new Error(`Failed to add subtask: ${response.statusText}`)
    }

    return response.json()
  }

  async addDependency(taskId: string, dependsOnId: string, type: 'blocking' | 'finish_to_start' | 'start_to_start' | 'finish_to_finish'): Promise<TaskModel> {
    const response = await fetch(`${this.baseUrl}/${taskId}/dependencies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dependsOnId, type }),
    })

    if (!response.ok) {
      throw new Error(`Failed to add dependency: ${response.statusText}`)
    }

    return response.json()
  }

  async removeDependency(taskId: string, dependencyId: string): Promise<TaskModel> {
    const response = await fetch(`${this.baseUrl}/${taskId}/dependencies/${dependencyId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to remove dependency: ${response.statusText}`)
    }

    return response.json()
  }

  async addReminder(taskId: string, reminderData: {
    type: 'email' | 'sms' | 'push' | 'in_app'
    before: number // minutes before due date
    message?: string
  }): Promise<TaskModel> {
    const response = await fetch(`${this.baseUrl}/${taskId}/reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reminderData),
    })

    if (!response.ok) {
      throw new Error(`Failed to add reminder: ${response.statusText}`)
    }

    return response.json()
  }

  async removeReminder(taskId: string, reminderId: string): Promise<TaskModel> {
    const response = await fetch(`${this.baseUrl}/${taskId}/reminders/${reminderId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to remove reminder: ${response.statusText}`)
    }

    return response.json()
  }

  async logTimeEntry(taskId: string, timeData: {
    duration: number // in minutes
    description?: string
    billable?: boolean
    date?: Date
  }): Promise<TaskModel> {
    const response = await fetch(`${this.baseUrl}/${taskId}/time`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(timeData),
    })

    if (!response.ok) {
      throw new Error(`Failed to log time: ${response.statusText}`)
    }

    return response.json()
  }

  async getTimeEntries(taskId: string, options?: {
    page?: number
    limit?: number
    dateFrom?: Date
    dateTo?: Date
  }): Promise<PaginatedResult<any>> {
    const queryParams = new URLSearchParams()
    
    if (options?.page) queryParams.append('page', options.page.toString())
    if (options?.limit) queryParams.append('limit', options.limit.toString())
    if (options?.dateFrom) queryParams.append('dateFrom', options.dateFrom.toISOString())
    if (options?.dateTo) queryParams.append('dateTo', options.dateTo.toISOString())

    const response = await fetch(`${this.baseUrl}/${taskId}/time?${queryParams}`)

    if (!response.ok) {
      throw new Error(`Failed to get time entries: ${response.statusText}`)
    }

    return response.json()
  }

  async addComment(taskId: string, content: string, isPrivate?: boolean): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${taskId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, isPrivate }),
    })

    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.statusText}`)
    }

    return response.json()
  }

  async uploadAttachment(taskId: string, file: File, description?: string): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    if (description) formData.append('description', description)

    const response = await fetch(`${this.baseUrl}/${taskId}/attachments`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to upload attachment: ${response.statusText}`)
    }

    return response.json()
  }

  async deleteAttachment(taskId: string, attachmentId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${taskId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete attachment: ${response.statusText}`)
    }
  }

  async createRecurringTask(taskData: Partial<TaskModel>, recurrence: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number
    daysOfWeek?: number[]
    dayOfMonth?: number
    endDate?: Date
    maxOccurrences?: number
  }): Promise<TaskModel> {
    const response = await fetch(`${this.baseUrl}/recurring`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskData, recurrence }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create recurring task: ${response.statusText}`)
    }

    return response.json()
  }

  async bulkUpdateTasks(ids: string[], updates: Partial<TaskModel>): Promise<TaskModel[]> {
    const response = await fetch(`${this.baseUrl}/bulk`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids, updates }),
    })

    if (!response.ok) {
      throw new Error(`Failed to bulk update tasks: ${response.statusText}`)
    }

    return response.json()
  }

  async bulkDeleteTasks(ids: string[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/bulk`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    })

    if (!response.ok) {
      throw new Error(`Failed to bulk delete tasks: ${response.statusText}`)
    }
  }

  async cloneTask(taskId: string, options: {
    includeSubtasks?: boolean
    includeAttachments?: boolean
    includeComments?: boolean
    newTitle?: string
    newDueDate?: Date
    newAssignee?: string
  }): Promise<TaskModel> {
    const response = await fetch(`${this.baseUrl}/${taskId}/clone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      throw new Error(`Failed to clone task: ${response.statusText}`)
    }

    return response.json()
  }

  async createTemplate(taskId: string, templateData: {
    name: string
    description?: string
    category?: string
    isPublic?: boolean
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${taskId}/template`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    })

    if (!response.ok) {
      throw new Error(`Failed to create template: ${response.statusText}`)
    }

    return response.json()
  }

  async createFromTemplate(templateId: string, customData?: Partial<TaskModel>): Promise<TaskModel> {
    const response = await fetch(`${this.baseUrl}/templates/${templateId}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customData || {}),
    })

    if (!response.ok) {
      throw new Error(`Failed to create task from template: ${response.statusText}`)
    }

    return response.json()
  }

  async getMyTasks(options?: {
    status?: string[]
    priority?: string[]
    overdue?: boolean
    page?: number
    limit?: number
  }): Promise<PaginatedResult<TaskModel>> {
    const queryParams = new URLSearchParams()
    
    if (options?.status?.length) queryParams.append('status', options.status.join(','))
    if (options?.priority?.length) queryParams.append('priority', options.priority.join(','))
    if (options?.overdue !== undefined) queryParams.append('overdue', options.overdue.toString())
    if (options?.page) queryParams.append('page', options.page.toString())
    if (options?.limit) queryParams.append('limit', options.limit.toString())

    const response = await fetch(`${this.baseUrl}/my-tasks?${queryParams}`)

    if (!response.ok) {
      throw new Error(`Failed to get my tasks: ${response.statusText}`)
    }

    return response.json()
  }

  async getTeamTasks(teamId: string, options?: {
    status?: string[]
    priority?: string[]
    page?: number
    limit?: number
  }): Promise<PaginatedResult<TaskModel>> {
    const queryParams = new URLSearchParams()
    
    if (options?.status?.length) queryParams.append('status', options.status.join(','))
    if (options?.priority?.length) queryParams.append('priority', options.priority.join(','))
    if (options?.page) queryParams.append('page', options.page.toString())
    if (options?.limit) queryParams.append('limit', options.limit.toString())

    const response = await fetch(`${this.baseUrl}/team/${teamId}?${queryParams}`)

    if (!response.ok) {
      throw new Error(`Failed to get team tasks: ${response.statusText}`)
    }

    return response.json()
  }
}

export const taskService = new TaskService()
