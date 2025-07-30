import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import type { Deal } from "@/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const pipelineId = searchParams.get("pipelineId")
    const stageId = searchParams.get("stageId")
    const assignedTo = searchParams.get("assignedTo")

    const offset = (page - 1) * limit

    let deals = await db.findMany<Deal>("deals", {}, { limit, offset })

    // Apply filters
    if (pipelineId) {
      deals = deals.filter((deal) => deal.pipelineId === pipelineId)
    }

    if (stageId) {
      deals = deals.filter((deal) => deal.stageId === stageId)
    }

    if (assignedTo) {
      deals = deals.filter((deal) => deal.assignedTo === assignedTo)
    }

    const total = deals.length

    return NextResponse.json({
      success: true,
      data: deals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get deals error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const dealData = {
      ...data,
      probability: data.probability || 50,
      currency: data.currency || "NGN",
      activities: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const deal = await db.create<Deal>("deals", dealData)

    return NextResponse.json(
      {
        success: true,
        data: deal,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create deal error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
