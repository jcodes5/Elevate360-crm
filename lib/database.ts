// Mock database implementation - Replace with actual database (PostgreSQL, MongoDB, etc.)
import type {
  User,
  Contact,
  Deal,
  Pipeline,
  Task,
  Campaign,
  Appointment,
  Workflow,
  Organization,
  ClientHistory,
} from "@/types"

class MockDatabase {
  private users: User[] = []
  private contacts: Contact[] = []
  private deals: Deal[] = []
  private pipelines: Pipeline[] = []
  private tasks: Task[] = []
  private campaigns: Campaign[] = []
  private appointments: Appointment[] = []
  private workflows: Workflow[] = []
  private organizations: Organization[] = []
  private clientHistory: ClientHistory[] = []

  // Generic CRUD operations
  async create<T extends { id: string }>(collection: string, data: Omit<T, "id">): Promise<T> {
    const id = this.generateId()
    const item = { ...data, id } as T

    this.getCollection<T>(collection).push(item)
    return item
  }

  async findById<T extends { id: string }>(collection: string, id: string): Promise<T | null> {
    return this.getCollection<T>(collection).find((item) => item.id === id) || null
  }

  async findMany<T extends { id: string }>(
    collection: string,
    filter: Partial<T> = {},
    options: { limit?: number; offset?: number; sortBy?: string } = {},
  ): Promise<T[]> {
    let items = this.getCollection<T>(collection)

    // Apply filters
    Object.keys(filter).forEach((key) => {
      if (filter[key as keyof T] !== undefined) {
        items = items.filter((item) => item[key as keyof T] === filter[key as keyof T])
      }
    })

    // Apply sorting
    if (options.sortBy) {
      items.sort((a, b) => {
        const aVal = a[options.sortBy as keyof T]
        const bVal = b[options.sortBy as keyof T]
        return aVal > bVal ? 1 : -1
      })
    }

    // Apply pagination
    if (options.offset) {
      items = items.slice(options.offset)
    }
    if (options.limit) {
      items = items.slice(0, options.limit)
    }

    return items
  }

  async updateById<T extends { id: string }>(collection: string, id: string, updates: Partial<T>): Promise<T | null> {
    const items = this.getCollection<T>(collection)
    const index = items.findIndex((item) => item.id === id)

    if (index === -1) return null

    items[index] = { ...items[index], ...updates }
    return items[index]
  }

  async deleteById<T extends { id: string }>(collection: string, id: string): Promise<boolean> {
    const items = this.getCollection<T>(collection)
    const index = items.findIndex((item) => item.id === id)

    if (index === -1) return false

    items.splice(index, 1)
    return true
  }

  private getCollection<T>(collection: string): T[] {
    switch (collection) {
      case "users":
        return this.users as T[]
      case "contacts":
        return this.contacts as T[]
      case "deals":
        return this.deals as T[]
      case "pipelines":
        return this.pipelines as T[]
      case "tasks":
        return this.tasks as T[]
      case "campaigns":
        return this.campaigns as T[]
      case "appointments":
        return this.appointments as T[]
      case "workflows":
        return this.workflows as T[]
      case "organizations":
        return this.organizations as T[]
      case "clientHistory":
        return this.clientHistory as T[]
      default:
        throw new Error(`Unknown collection: ${collection}`)
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}

export const db = new MockDatabase()
