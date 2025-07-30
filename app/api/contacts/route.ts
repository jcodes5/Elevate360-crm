import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import type { Contact } from "@/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status")
    const assignedTo = searchParams.get("assignedTo")

    const offset = (page - 1) * limit

    let contacts = await db.findMany<Contact>("contacts", {}, { limit, offset })

    // Apply filters
    if (search) {
      contacts = contacts.filter(
        (contact) =>
          contact.firstName.toLowerCase().includes(search.toLowerCase()) ||
          contact.lastName.toLowerCase().includes(search.toLowerCase()) ||
          contact.email.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (status) {
      contacts = contacts.filter((contact) => contact.status === status)
    }

    if (assignedTo) {
      contacts = contacts.filter((contact) => contact.assignedTo === assignedTo)
    }

    const total = contacts.length

    return NextResponse.json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get contacts error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const contactData = {
      ...data,
      leadScore: data.leadScore || 0,
      tags: data.tags || [],
      notes: [],
      activities: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const contact = await db.create<Contact>("contacts", contactData)

    return NextResponse.json(
      {
        success: true,
        data: contact,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create contact error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
