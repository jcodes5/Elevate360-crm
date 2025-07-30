import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import type { Task } from "@/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const assignedTo = searchParams.get("assignedTo")
    const priority = searchParams.get("priority")

    const offset = (page - 1) * limit

    let tasks = await db.findMany<Task>("tasks", {}, { limit, offset })

    // Apply filters
    if (status) {
      tasks = tasks.filter((task) => task.status === status)
    }

    if (assignedTo) {
      tasks = tasks.filter((task) => task.assignedTo === assignedTo)
    }

    if (priority) {
      tasks = tasks.filter((task) => task.priority === priority)
    }

    const total = tasks.length

    return NextResponse.json({
      success: true,
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get tasks error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const taskData = {
      ...data,
      status: data.status || "pending",
      priority: data.priority || "medium",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const task = await db.create<Task>("tasks", taskData)

    return NextResponse.json(
      {
        success: true,
        data: task,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create task error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
