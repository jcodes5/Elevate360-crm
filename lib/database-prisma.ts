import { prisma } from './db'
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
import { Prisma } from '@prisma/client'

export class PrismaDatabase {
  // Generic CRUD operations for Users
  async createUser(data: Omit<User, "id">): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password!,
        role: data.role.toUpperCase() as any,
        organizationId: data.organizationId,
        avatar: data.avatar,
        phone: data.phone,
        isActive: data.isActive,
        lastLogin: data.lastLogin,
        isOnboardingCompleted: data.isOnboardingCompleted || false,
        onboardingStep: data.onboardingStep || 0,
      },
      include: {
        organization: true
      }
    })
    
    return this.mapUserFromPrisma(user)
  }

  async findUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        organization: true
      }
    })
    
    return user ? this.mapUserFromPrisma(user) : null
  }

  async findUsersByFilter(filter: Partial<User> = {}): Promise<User[]> {
    const where: Prisma.UserWhereInput = {}
    
    if (filter.email) where.email = filter.email
    if (filter.organizationId) where.organizationId = filter.organizationId
    if (filter.role) where.role = filter.role.toUpperCase() as any
    if (filter.isActive !== undefined) where.isActive = filter.isActive

    const users = await prisma.user.findMany({
      where,
      include: {
        organization: true
      }
    })
    
    return users.map(user => this.mapUserFromPrisma(user))
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const updateData: Prisma.UserUpdateInput = {}
      
      if (updates.firstName) updateData.firstName = updates.firstName
      if (updates.lastName) updateData.lastName = updates.lastName
      if (updates.email) updateData.email = updates.email
      if (updates.password) updateData.password = updates.password
      if (updates.role) updateData.role = updates.role.toUpperCase() as any
      if (updates.avatar) updateData.avatar = updates.avatar
      if (updates.phone) updateData.phone = updates.phone
      if (updates.isActive !== undefined) updateData.isActive = updates.isActive
      if (updates.lastLogin) updateData.lastLogin = updates.lastLogin
      if (updates.isOnboardingCompleted !== undefined) updateData.isOnboardingCompleted = updates.isOnboardingCompleted
      if (updates.onboardingStep !== undefined) updateData.onboardingStep = updates.onboardingStep
      
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        include: {
          organization: true
        }
      })
      
      return this.mapUserFromPrisma(user)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return null // Record not found
        }
      }
      throw error
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id }
      })
      return true
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return false // Record not found
        }
      }
      throw error
    }
  }

  // Organization methods
  async createOrganization(data: Omit<Organization, "id">): Promise<Organization> {
    const org = await prisma.organization.create({
      data: {
        name: data.name,
        domain: data.domain,
        logo: data.logo,
        settings: data.settings as any,
        subscription: data.subscription as any,
      }
    })
    
    return this.mapOrganizationFromPrisma(org)
  }

  async findOrganizationById(id: string): Promise<Organization | null> {
    const org = await prisma.organization.findUnique({
      where: { id }
    })
    
    return org ? this.mapOrganizationFromPrisma(org) : null
  }

  // Contact methods
  async createContact(data: Omit<Contact, "id">): Promise<Contact> {
    const contact = await prisma.contact.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        whatsappNumber: data.whatsappNumber,
        company: data.company,
        position: data.position,
        tags: data.tags as any,
        leadScore: data.leadScore,
        status: data.status.toUpperCase() as any,
        source: data.source,
        customFields: data.customFields as any,
        organizationId: data.organizationId,
        assignedTo: data.assignedTo,
      },
      include: {
        organization: true,
        assignedUser: true,
        notes: true,
        activities: true
      }
    })
    
    return this.mapContactFromPrisma(contact)
  }

  async findContactsByOrganization(organizationId: string, limit?: number, offset?: number): Promise<Contact[]> {
    const contacts = await prisma.contact.findMany({
      where: { organizationId },
      take: limit,
      skip: offset,
      include: {
        organization: true,
        assignedUser: true,
        notes: true,
        activities: true
      }
    })
    
    return contacts.map(contact => this.mapContactFromPrisma(contact))
  }

  // Deal methods
  async createDeal(data: Omit<Deal, "id">): Promise<Deal> {
    const deal = await prisma.deal.create({
      data: {
        title: data.title,
        value: data.value,
        currency: data.currency,
        probability: data.probability,
        expectedCloseDate: data.expectedCloseDate,
        actualCloseDate: data.actualCloseDate,
        notes: data.notes,
        contactId: data.contactId,
        stageId: data.stageId,
        pipelineId: data.pipelineId,
        assignedTo: data.assignedTo,
        organizationId: data.organizationId,
      },
      include: {
        contact: true,
        stage: true,
        pipeline: true,
        assignedUser: true,
        activities: true
      }
    })
    
    return this.mapDealFromPrisma(deal)
  }

  // Generic methods that work with the legacy interface
  async create<T extends { id: string }>(collection: string, data: Omit<T, "id">): Promise<T> {
    switch (collection) {
      case "users":
        return this.createUser(data as any) as any
      case "organizations":
        return this.createOrganization(data as any) as any
      case "contacts":
        return this.createContact(data as any) as any
      case "deals":
        return this.createDeal(data as any) as any
      default:
        throw new Error(`Collection ${collection} not implemented yet`)
    }
  }

  async findById<T extends { id: string }>(collection: string, id: string): Promise<T | null> {
    switch (collection) {
      case "users":
        return this.findUserById(id) as any
      case "organizations":
        return this.findOrganizationById(id) as any
      default:
        throw new Error(`Collection ${collection} not implemented yet`)
    }
  }

  async findMany<T extends { id: string }>(
    collection: string,
    filter: Partial<T> = {},
    options: { limit?: number; offset?: number; sortBy?: string } = {},
  ): Promise<T[]> {
    switch (collection) {
      case "users":
        return this.findUsersByFilter(filter as any) as any
      case "contacts":
        if ((filter as any).organizationId) {
          return this.findContactsByOrganization((filter as any).organizationId, options.limit, options.offset) as any
        }
        return []
      default:
        throw new Error(`Collection ${collection} not implemented yet`)
    }
  }

  async updateById<T extends { id: string }>(collection: string, id: string, updates: Partial<T>): Promise<T | null> {
    switch (collection) {
      case "users":
        return this.updateUser(id, updates as any) as any
      default:
        throw new Error(`Collection ${collection} not implemented yet`)
    }
  }

  async deleteById<T extends { id: string }>(collection: string, id: string): Promise<boolean> {
    switch (collection) {
      case "users":
        return this.deleteUser(id)
      default:
        throw new Error(`Collection ${collection} not implemented yet`)
    }
  }

  // Mapping functions to convert Prisma models to our types
  private mapUserFromPrisma(user: any): User {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.toLowerCase(),
      organizationId: user.organizationId,
      password: user.password,
      avatar: user.avatar,
      phone: user.phone,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      isOnboardingCompleted: user.isOnboardingCompleted,
      onboardingStep: user.onboardingStep,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  private mapOrganizationFromPrisma(org: any): Organization {
    return {
      id: org.id,
      name: org.name,
      domain: org.domain,
      logo: org.logo,
      settings: org.settings,
      subscription: org.subscription,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    }
  }

  private mapContactFromPrisma(contact: any): Contact {
    return {
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      whatsappNumber: contact.whatsappNumber,
      company: contact.company,
      position: contact.position,
      tags: contact.tags,
      leadScore: contact.leadScore,
      status: contact.status.toLowerCase(),
      source: contact.source,
      assignedTo: contact.assignedTo,
      organizationId: contact.organizationId,
      customFields: contact.customFields,
      notes: contact.notes.map((note: any) => ({
        id: note.id,
        content: note.content,
        createdBy: note.createdBy,
        createdAt: note.createdAt,
      })),
      activities: contact.activities.map((activity: any) => ({
        id: activity.id,
        type: activity.type.toLowerCase(),
        description: activity.description,
        metadata: activity.metadata,
        createdBy: activity.createdBy,
        createdAt: activity.createdAt,
      })),
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    }
  }

  private mapDealFromPrisma(deal: any): Deal {
    return {
      id: deal.id,
      title: deal.title,
      value: Number(deal.value),
      currency: deal.currency,
      contactId: deal.contactId,
      stageId: deal.stageId,
      pipelineId: deal.pipelineId,
      assignedTo: deal.assignedTo,
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate,
      actualCloseDate: deal.actualCloseDate,
      notes: deal.notes,
      organizationId: deal.organizationId,
      activities: deal.activities.map((activity: any) => ({
        id: activity.id,
        type: activity.type.toLowerCase(),
        description: activity.description,
        previousStage: activity.previousStage,
        newStage: activity.newStage,
        createdBy: activity.createdBy,
        createdAt: activity.createdAt,
      })),
      createdAt: deal.createdAt,
      updatedAt: deal.updatedAt,
    }
  }
}

export const db = new PrismaDatabase()
