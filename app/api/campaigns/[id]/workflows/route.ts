import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ApiResponse } from '@/lib/models'
import { ProductionAuthService, canAccessResource } from '@/lib/auth-production'

async function authWrite(request: NextRequest) {
  const token = ProductionAuthService.getTokenFromRequest(request)
  if (!token) return { error: NextResponse.json({ success: false, message: 'Authentication required' } satisfies ApiResponse, { status: 401 }) }
  try {
    const payload = await ProductionAuthService.verifyAccessToken(token)
    const allowed = canAccessResource('campaigns', 'update')
    if (!allowed.includes(payload.role)) return { error: NextResponse.json({ success: false, message: 'Forbidden' } satisfies ApiResponse, { status: 403 }) }
    return { payload }
  } catch { return { error: NextResponse.json({ success: false, message: 'Invalid token' } satisfies ApiResponse, { status: 401 }) } }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const a = await authWrite(request)
  if ('error' in a) return a.error
  const { payload } = a
  try {
    const body = await request.json()
    const source = await prisma.campaign.findFirst({ where: { id: params.id, organizationId: payload.organizationId } })
    if (!source) return NextResponse.json({ success: false, message: 'Not found' } satisfies ApiResponse, { status: 404 })

    const workflow = await prisma.workflow.create({
      data: {
        name: body.name || `${source.name} Workflow`,
        description: body.description || null,
        status: 'ACTIVE',
        trigger: { triggers: body.triggers || [] },
        nodes: body.actions || [],
        connections: body.conditions || [],
        metrics: { totalEntered: 0, completed: 0, active: 0, dropped: 0 },
        organizationId: payload.organizationId,
        createdBy: payload.userId,
      },
    })

    const updated = await prisma.campaign.update({ where: { id: source.id }, data: { workflowId: workflow.id } })

    return NextResponse.json({ success: true, data: { workflow, campaign: updated }, message: 'Workflow created and linked' } satisfies ApiResponse)
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to create workflow' } satisfies ApiResponse, { status: 500 })
  }
}
