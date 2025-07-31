import { db } from "./database-prisma"
import { AuthService } from "./auth"
import type { User, Organization } from "@/types"

export async function createTestDataPrisma() {
  try {
    console.log("Creating test data with Prisma...")

    // Create test organization
    const organization = await db.createOrganization({
      name: "Test Organization",
      domain: "test.com",
      settings: {
        timezone: "Africa/Lagos",
        currency: "NGN",
        language: "en",
        businessHours: {
          monday: { start: "09:00", end: "17:00", enabled: true },
          tuesday: { start: "09:00", end: "17:00", enabled: true },
          wednesday: { start: "09:00", end: "17:00", enabled: true },
          thursday: { start: "09:00", end: "17:00", enabled: true },
          friday: { start: "09:00", end: "17:00", enabled: true },
          saturday: { start: "09:00", end: "17:00", enabled: false },
          sunday: { start: "09:00", end: "17:00", enabled: false },
        },
        integrations: {
          whatsapp: { enabled: false },
          email: { provider: "sendgrid" },
          sms: { provider: "termii" },
          payment: {
            paystack: { enabled: false },
            flutterwave: { enabled: false }
          },
          calendar: {
            google: { enabled: false }
          }
        },
        permissions: {
          admin: [],
          manager: [],
          agent: []
        }
      },
      subscription: {
        id: "test-sub",
        plan: "starter",
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        billingHistory: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    })

    console.log("Organization created:", organization.id)

    // Create test admin user
    const hashedPassword = await AuthService.hashPassword("password123")
    const testUser = await db.createUser({
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      role: "admin",
      organizationId: organization.id,
      password: hashedPassword,
      isActive: true,
      isOnboardingCompleted: true, // Test user has completed onboarding
      createdAt: new Date(),
      updatedAt: new Date()
    })

    console.log("Test user created:", testUser.id)

    // Create additional test users
    const manager = await db.createUser({
      email: "manager@example.com",
      firstName: "John",
      lastName: "Manager",
      role: "manager",
      organizationId: organization.id,
      password: hashedPassword,
      isActive: true,
      isOnboardingCompleted: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const agent = await db.createUser({
      email: "agent@example.com",
      firstName: "Jane",
      lastName: "Agent",
      role: "agent",
      organizationId: organization.id,
      password: hashedPassword,
      isActive: true,
      isOnboardingCompleted: false, // Agent needs onboarding
      createdAt: new Date(),
      updatedAt: new Date()
    })

    console.log("Additional users created:", { manager: manager.id, agent: agent.id })

    // Create test contacts
    const contact1 = await db.createContact({
      firstName: "Adebayo",
      lastName: "Johnson",
      email: "adebayo.johnson@example.com",
      phone: "+234 802 123 4567",
      whatsappNumber: "+234 802 123 4567",
      company: "Lagos Tech Hub",
      position: "CEO",
      tags: ["vip", "tech", "lagos"],
      leadScore: 85,
      status: "prospect",
      source: "website",
      organizationId: organization.id,
      assignedTo: testUser.id,
      customFields: {
        industry: "Technology",
        companySize: "50-100",
        budget: "high"
      },
      notes: [],
      activities: [],
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const contact2 = await db.createContact({
      firstName: "Fatima",
      lastName: "Abdullahi",
      email: "fatima.abdullahi@example.com",
      phone: "+234 803 987 6543",
      company: "Kano Innovations",
      position: "CTO",
      tags: ["tech", "kano", "innovation"],
      leadScore: 72,
      status: "lead",
      source: "referral",
      organizationId: organization.id,
      assignedTo: manager.id,
      customFields: {
        industry: "Fintech",
        companySize: "20-50",
        budget: "medium"
      },
      notes: [],
      activities: [],
      createdAt: new Date(),
      updatedAt: new Date()
    })

    console.log("Test contacts created:", { contact1: contact1.id, contact2: contact2.id })

    console.log("Test data created successfully with Prisma!")
    return { organization, testUser, manager, agent, contact1, contact2 }
  } catch (error) {
    console.error("Error creating test data:", error)
    throw error
  }
}
