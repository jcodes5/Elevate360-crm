import { db } from "./database"
import { AuthService } from "./auth"
import type { User, Organization } from "@/types"

export async function createTestData() {
  try {
    // Create test organization
    const organization = await db.create<Organization>("organizations", {
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

    // Create test admin user
    const hashedPassword = await AuthService.hashPassword("password123")
    const testUser = await db.create<User>("users", {
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      role: "admin",
      organizationId: organization.id,
      password: hashedPassword,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    console.log("Test data created successfully:", { organization, testUser })
    return { organization, testUser }
  } catch (error) {
    console.error("Error creating test data:", error)
    throw error
  }
}
