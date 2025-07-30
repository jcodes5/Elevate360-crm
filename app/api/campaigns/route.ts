import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import type { Campaign } from "@/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const type = searchParams.get("type")
    const status = searchParams.get("status")

    const offset = (page - 1) * limit

    let campaigns = await db.findMany<Campaign>("campaigns", {}, { limit, offset })

    // Apply filters
    if (type) {
      campaigns = campaigns.filter((campaign) => campaign.type === type)
    }

    if (status) {
      campaigns = campaigns.filter((campaign) => campaign.status === status)
    }

    const total = campaigns.length

    return NextResponse.json({
      success: true,
      data: campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get campaigns error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const campaignData = {
      ...data,
      status: data.status || "draft",
      targetAudience: data.targetAudience || [],
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        bounced: 0,
        unsubscribed: 0,
        conversions: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const campaign = await db.create<Campaign>("campaigns", campaignData)

    return NextResponse.json(
      {
        success: true,
        data: campaign,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create campaign error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
