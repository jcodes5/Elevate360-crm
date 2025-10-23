import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import type { Workflow } from "@/types"
import { ProductionAuthService, canAccessResource } from '@/lib/auth-production'

function unauthorized(message = 'Authentication required', code = 'UNAUTHORIZED', status = 401) {
  return NextResponse.json({ success: false, message, errors: [{ code, message }] }, { status })
}

async function requireAuth(request: NextRequest, action: 'read' | 'create' | 'update' | 'delete') {
  const token = ProductionAuthService.getTokenFromRequest(request)
  if (!token) return { error: unauthorized('Authentication required') }
  try {
    const payload = await ProductionAuthService.verifyAccessToken(token)
    const allowed = canAccessResource(payload.role, 'workflows', action)
    if (!allowed) {
      return { error: unauthorized('Forbidden', 'FORBIDDEN', 403) }
    }
    return { payload }
  } catch {
    return { error: unauthorized('Invalid or expired token', 'TOKEN_INVALID') }
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, 'read')
  if ('error' in auth) return auth.error
  const { payload } = auth

  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")

    const offset = (page - 1) * limit

    // TODO: Add organizationId and createdBy filtering to database query
    let workflows = await db.findMany<Workflow>("workflows", {}, { limit, offset })

    // Apply filters
    if (status) {
      workflows = workflows.filter((workflow) => workflow.status === status)
    }

    const total = workflows.length

    return NextResponse.json({
      success: true,
      data: workflows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get workflows error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, 'create')
  if ('error' in auth) return auth.error
  const { payload } = auth

  try {
    const data = await request.json()

    const workflowData = {
      ...data,
      organizationId: payload.organizationId,
      createdBy: payload.userId,
      status: data.status || "draft",
      nodes: data.nodes || [],
      connections: data.connections || [],
      metrics: {
        totalEntered: 0,
        completed: 0,
        active: 0,
        dropped: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const workflow = await db.create<Workflow>("workflows", workflowData)

    return NextResponse.json(
      {
        success: true,
        data: workflow,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create workflow error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
