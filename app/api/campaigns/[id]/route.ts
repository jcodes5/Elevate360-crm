import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ApiResponse } from '@/lib/models'
import { ProductionAuthService, canAccessResource } from '@/lib/auth-production'

function unauthorized(message = 'Authentication required', code = 'UNAUTHORIZED', status = 401) {
  return NextResponse.json({ success: false, message, errors: [{ code, message }] } satisfies ApiResponse, { status })
}

async function requireAuth(request: NextRequest, action: 'read' | 'create' | 'update' | 'delete') {
  const token = ProductionAuthService.getTokenFromRequest(request)
  if (!token) return { error: unauthorized('Authentication required') }
  try {
    const payload = await ProductionAuthService.verifyAccessToken(token)
    const allowed = canAccessResource('campaigns', action)
    if (!allowed.includes(payload.role)) {
      return { error: unauthorized('Forbidden', 'FORBIDDEN', 403) }
    }
    return { payload }
  } catch {
    return { error: unauthorized('Invalid or expired token', 'TOKEN_INVALID') }
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request, 'read')
  if ('error' in auth) return auth.error
  const { payload } = auth
  try {
    const campaign = await prisma.campaign.findFirst({ where: { id: params.id, organizationId: payload.organizationId } })
    if (!campaign) return NextResponse.json({ success: false, message: 'Not found' } satisfies ApiResponse, { status: 404 })
    return NextResponse.json({ success: true, data: campaign } satisfies ApiResponse)
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to fetch campaign' } satisfies ApiResponse, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request, 'update')
  if ('error' in auth) return auth.error
  const { payload } = auth
  try {
    const body = await request.json()
    const updated = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        name: body.name ?? undefined,
        type: body.type ? body.type.toUpperCase() : undefined,
        status: body.status ? body.status.toUpperCase() : undefined,
        subject: body.subject ?? undefined,
        content: body.content ?? undefined,
        channel: body.channel ?? undefined,
        category: body.category ?? undefined,
        objective: body.objective ?? undefined,
        tags: Array.isArray(body.tags) ? body.tags : undefined,
        isABTest: typeof body.isABTest === 'boolean' ? body.isABTest : undefined,
        abTestConfig: body.abTestConfig ?? undefined,
        personalization: body.personalization ?? undefined,
        utmParameters: body.utmParameters ?? undefined,
        compliance: body.compliance ?? undefined,
        timezone: body.timezone ?? undefined,
        targetAudience: body.targetAudience ?? undefined,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        sentAt: body.sentAt ? new Date(body.sentAt) : undefined,
        completedAt: body.completedAt ? new Date(body.completedAt) : undefined,
        metrics: body.metrics ?? undefined,
        workflowId: body.workflowId ?? undefined,
        parentCampaignId: body.parentCampaignId ?? undefined,
        updatedAt: new Date(),
      },
    })
    if (updated.organizationId !== payload.organizationId) {
      return NextResponse.json({ success: false, message: 'Forbidden' } satisfies ApiResponse, { status: 403 })
    }
    return NextResponse.json({ success: true, data: updated, message: 'Campaign updated successfully' } satisfies ApiResponse)
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to update campaign' } satisfies ApiResponse, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request, 'delete')
  if ('error' in auth) return auth.error
  const { payload } = auth
  try {
    const existing = await prisma.campaign.findFirst({ where: { id: params.id, organizationId: payload.organizationId } })
    if (!existing) return NextResponse.json({ success: false, message: 'Not found' } satisfies ApiResponse, { status: 404 })
    await prisma.campaign.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true, message: 'Campaign deleted successfully' } satisfies ApiResponse)
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to delete campaign' } satisfies ApiResponse, { status: 500 })
  }
}
