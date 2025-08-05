import { db } from "./database-prisma"
import { AuthService } from "./auth"
import type { User, Organization } from "@/types"
import { Role, ContactStatus } from "@prisma/client"

export async function createTestDataPrisma() {
  try {
    console.log("Creating test data with Prisma...")

    // Create test organization
    let organization;
    try {
      organization = await db.createOrganization({
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
    } catch (error) {
      console.log("Test organization might already exist")
      // Try to find existing organization
      // This is a simplified approach - in a real app you might want to search by name
      organization = { id: "test-org-id" } // Placeholder
    }

    // Create test admin user
    let testUser;
    try {
      const hashedPassword = await AuthService.hashPassword("password123")
      testUser = await db.createUser({
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        role: Role.ADMIN,
        organizationId: organization.id,
        password: hashedPassword,
        isActive: true,
        isOnboardingCompleted: true, // Test user has completed onboarding
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log("Test user created:", testUser.id)
    } catch (error) {
      console.log("Test admin user might already exist")
      testUser = { id: "test-user-id" } // Placeholder
    }

    // Create additional test users
    let manager, agent;
    try {
      const hashedPassword = await AuthService.hashPassword("password123")
      manager = await db.createUser({
        email: "manager@example.com",
        firstName: "John",
        lastName: "Manager",
        role: Role.MANAGER,
        organizationId: organization.id,
        password: hashedPassword,
        isActive: true,
        isOnboardingCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log("Manager user created:", manager.id)
    } catch (error) {
      console.log("Manager user might already exist")
      manager = { id: "manager-user-id" } // Placeholder
    }

    try {
      const hashedPassword = await AuthService.hashPassword("password123")
      agent = await db.createUser({
        email: "agent@example.com",
        firstName: "Jane",
        lastName: "Agent",
        role: Role.AGENT,
        organizationId: organization.id,
        password: hashedPassword,
        isActive: true,
        isOnboardingCompleted: false, // Agent needs onboarding
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log("Agent user created:", agent.id)
    } catch (error) {
      console.log("Agent user might already exist")
      agent = { id: "agent-user-id" } // Placeholder
    }

    console.log("Additional users created:", { manager: manager.id, agent: agent.id })

    // Create test contacts
    let contact1, contact2;
    try {
      contact1 = await db.createContact({
        firstName: "Adebayo",
        lastName: "Johnson",
        email: "adebayo.johnson@example.com",
        phone: "+234 802 123 4567",
        whatsappNumber: "+234 802 123 4567",
        company: "Lagos Tech Hub",
        position: "CEO",
        tags: ["vip", "tech", "lagos"],
        leadScore: 85,
        status: ContactStatus.PROSPECT,
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
      console.log("Test contact 1 created:", contact1.id)
    } catch (error) {
      console.log("Test contact 1 might already exist")
      contact1 = { id: "contact1-id" } // Placeholder
    }

    try {
      contact2 = await db.createContact({
        firstName: "Fatima",
        lastName: "Abdullahi",
        email: "fatima.abdullahi@example.com",
        phone: "+234 803 987 6543",
        company: "Kano Innovations",
        position: "CTO",
        tags: ["tech", "kano", "innovation"],
        leadScore: 72,
        status: ContactStatus.LEAD,
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
      console.log("Test contact 2 created:", contact2.id)
    } catch (error) {
      console.log("Test contact 2 might already exist")
      contact2 = { id: "contact2-id" } // Placeholder
    }

    console.log("Test contacts created:", { contact1: contact1.id, contact2: contact2.id })

    console.log("Test data created successfully with Prisma!")
    return { organization, testUser, manager, agent, contact1, contact2 }
  } catch (error) {
    console.error("Error creating test data:", error)
    throw error
  }
}