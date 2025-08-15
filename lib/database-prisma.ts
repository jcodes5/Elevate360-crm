// Prisma database implementation
import { PrismaClient } from '@prisma/client'
import type {
  User,
  Organization,
  Contact,
  Deal,
  Campaign,
  Task,
  Analytics,
  ClientHistory,
} from "@/types"

// Initialize Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export class PrismaDatabase {
  private client: PrismaClient

  constructor() {
    this.client = prisma
  }

  // Generic CRUD operations
  async create<T>(table: string, data: Partial<T>): Promise<T> {
    const model = this.getModel(table)
    const result = await model.create({
      data: data as any,
    })
    return result as T
  }

  async findById<T>(table: string, id: string): Promise<T | null> {
    const model = this.getModel(table)
    return await model.findUnique({
      where: { id },
    }) as T | null
  }

  async findByEmail<T>(table: string, email: string): Promise<T | null> {
    const model = this.getModel(table)
    return await model.findUnique({
      where: { email },
    }) as T | null
  }

  async updateById<T>(table: string, id: string, updates: Partial<T>): Promise<T | null> {
    const model = this.getModel(table)
    try {
      return await model.update({
        where: { id },
        data: updates as any,
      }) as T
    } catch (error) {
      console.error(`Error updating ${table} with id ${id}:`, error)
      return null
    }
  }

  async deleteById(table: string, id: string): Promise<boolean> {
    const model = this.getModel(table)
    try {
      await model.delete({
        where: { id },
      })
      return true
    } catch (error) {
      console.error(`Error deleting ${table} with id ${id}:`, error)
      return false
    }
  }

  async findMany<T>(
    table: string,
    options?: {
      where?: any
      limit?: number
      offset?: number
      orderBy?: any
      include?: any
    }
  ): Promise<T[]> {
    const model = this.getModel(table)
    return await model.findMany({
      where: options?.where,
      take: options?.limit,
      skip: options?.offset,
      orderBy: options?.orderBy,
      include: options?.include,
    }) as T[]
  }

  async count(table: string, where?: any): Promise<number> {
    const model = this.getModel(table)
    return await model.count({
      where,
    })
  }

  // User-specific methods
  async createUser(userData: Partial<User>): Promise<User> {
    return await this.client.user.create({
      data: userData as any,
      include: {
        organization: true,
      },
    }) as User
  }

  async findUserById(id: string): Promise<User | null> {
    return await this.client.user.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    }) as User | null
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.client.user.findUnique({
      where: { email },
      include: {
        organization: true,
      },
    }) as User | null
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    try {
      return await this.client.user.update({
        where: { id },
        data: data as any,
        include: {
          organization: true,
        },
      }) as User
    } catch (error) {
      console.error('Error updating user:', error)
      return null
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await this.client.user.delete({
        where: { id },
      })
      return true
    } catch (error) {
      console.error('Error deleting user:', error)
      return false
    }
  }

  // Organization methods
  async createOrganization(orgData: Partial<Organization>): Promise<Organization> {
    return await this.client.organization.create({
      data: orgData as any,
    }) as Organization
  }

  // User-specific methods
  async createUser(userData: Partial<User>): Promise<User> {
    return await this.client.user.create({
      data: userData as any,
      include: {
        organization: true,
      },
    }) as User
  }

  async findUserById(id: string): Promise<User | null> {
    return await this.client.organization.findUnique({
      where: { id },
      include: {
        users: true,
        contacts: true,
        deals: true,
        pipelines: true,
        tasks: true,
        campaigns: true,
        appointments: true,
        workflows: true,
      },
    }) as Organization | null
  }

  async updateOrganization(id: string, data: Partial<Organization>): Promise<Organization | null> {
    try {
      return await this.client.organization.update({
        where: { id },
        data: data as any,
      }) as Organization
    } catch (error) {
      console.error('Error updating organization:', error)
      return null
    }
  }

  // Contact methods
  async createContact(contactData: Partial<Contact>): Promise<Contact> {
    return await this.client.contact.create({
      data: contactData as any,
      include: {
        organization: true,
        assignedUser: true,
      },
    }) as Contact
  }

  async findContactById(id: string): Promise<Contact | null> {
    return await this.client.contact.findUnique({
      where: { id },
      include: {
        organization: true,
        assignedUser: true,
        deals: true,
        tasks: true,
        appointments: true,
      },
    }) as Contact | null
  }

  // Deal methods
  async createDeal(dealData: Partial<Deal>): Promise<Deal> {
    return await this.client.deal.create({
      data: dealData as any,
      include: {
        contact: true,
        stage: true,
        pipeline: true,
        assignedUser: true,
        organization: true,
      },
    }) as Deal
  }

  async findDealById(id: string): Promise<Deal | null> {
    return await this.client.deal.findUnique({
      where: { id },
      include: {
        contact: true,
        stage: true,
        pipeline: true,
        assignedUser: true,
        organization: true,
        tasks: true,
      },
    }) as Deal | null
  }

  // Task methods
  async createTask(taskData: Partial<Task>): Promise<Task> {
    return await this.client.task.create({
      data: taskData as any,
      include: {
        assignedUser: true,
        contact: true,
        deal: true,
        organization: true,
      },
    }) as Task
  }

  async findTaskById(id: string): Promise<Task | null> {
    return await this.client.task.findUnique({
      where: { id },
      include: {
        assignedUser: true,
        contact: true,
        deal: true,
        organization: true,
      },
    }) as Task | null
  }

  // Campaign methods
  async createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
    return await this.client.campaign.create({
      data: campaignData as any,
      include: {
        organization: true,
        creator: true,
        workflow: true,
      },
    }) as Campaign
  }

  async findCampaignById(id: string): Promise<Campaign | null> {
    return await this.client.campaign.findUnique({
      where: { id },
      include: {
        organization: true,
        creator: true,
        workflow: true,
      },
    }) as Campaign | null
  }

  // Appointment methods
  async createAppointment(appointmentData: any): Promise<any> {
    return await this.client.appointment.create({
      data: appointmentData,
      include: {
        contact: true,
        assignedUser: true,
        organization: true,
      },
    })
  }

  async findAppointmentById(id: string): Promise<any> {
    return await this.client.appointment.findUnique({
      where: { id },
      include: {
        contact: true,
        assignedUser: true,
        organization: true,
      },
    })
  }

  // Pipeline methods
  async createPipeline(pipelineData: any): Promise<any> {
    return await this.client.pipeline.create({
      data: pipelineData,
      include: {
        organization: true,
        stages: true,
        deals: true,
      },
    })
  }

  async findPipelineById(id: string): Promise<any> {
    return await this.client.pipeline.findUnique({
      where: { id },
      include: {
        organization: true,
        stages: true,
        deals: true,
      },
    })
  }

  // Workflow methods
  async createWorkflow(workflowData: any): Promise<any> {
    return await this.client.workflow.create({
      data: workflowData,
      include: {
        organization: true,
        creator: true,
        campaigns: true,
      },
    })
  }

  async findWorkflowById(id: string): Promise<any> {
    return await this.client.workflow.findUnique({
      where: { id },
      include: {
        organization: true,
        creator: true,
        campaigns: true,
      },
    })
  }

  // Analytics methods
  async getAnalytics(organizationId: string): Promise<Analytics> {
    const totalContacts = await this.client.contact.count({
      where: { organizationId },
    })

    const totalDeals = await this.client.deal.count({
      where: { organizationId },
    })

    const totalRevenue = await this.client.deal.aggregate({
      where: { 
        organizationId,
        actualCloseDate: { not: null }
      },
      _sum: { value: true },
    })

    const pendingTasks = await this.client.task.count({
      where: { 
        organizationId,
        status: 'PENDING' 
      },
    })

    return {
      totalContacts,
      totalDeals,
      totalRevenue: totalRevenue._sum.value?.toNumber() || 0,
      pendingTasks,
    } as Analytics
  }

  // Database connection management
  async connect(): Promise<void> {
    await this.client.$connect()
  }

  async disconnect(): Promise<void> {
    await this.client.$disconnect()
  }

  // Helper method to get the appropriate Prisma model
  private getModel(table: string): any {
    switch (table) {
      case "users":
        return this.client.user
      case "organizations":
        return this.client.organization
      case "contacts":
        return this.client.contact
      case "deals":
        return this.client.deal
      case "pipelines":
        return this.client.pipeline
      case "tasks":
        return this.client.task
      case "campaigns":
        return this.client.campaign
      case "appointments":
        return this.client.appointment
      case "workflows":
        return this.client.workflow
      case "clientHistory":
        return this.client.clientHistory
      default:
        throw new Error(`Unknown table: ${table}`)
    }
  }
}

// Export instance
export const db = new PrismaDatabase()