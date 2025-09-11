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

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request, 'update')
  if ('error' in auth) return auth.error
  const { payload } = auth
  try {
    const { ids, updates } = await request.json()
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: 'ids array is required' } satisfies ApiResponse, { status: 400 })
    }

    await prisma.campaign.updateMany({
      where: { id: { in: ids }, organizationId: payload.organizationId },
      data: {
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.type ? { type: updates.type.toUpperCase() } : {}),
        ...(updates.status ? { status: updates.status.toUpperCase() } : {}),
        ...(updates.subject !== undefined ? { subject: updates.subject } : {}),
        ...(updates.content !== undefined ? { content: updates.content } : {}),
        ...(updates.channel !== undefined ? { channel: updates.channel } : {}),
        ...(updates.category !== undefined ? { category: updates.category } : {}),
        ...(updates.objective !== undefined ? { objective: updates.objective } : {}),
        ...(updates.tags ? { tags: updates.tags } : {}),
        ...(typeof updates.isABTest === 'boolean' ? { isABTest: updates.isABTest } : {}),
        ...(updates.abTestConfig ? { abTestConfig: updates.abTestConfig } : {}),
        ...(updates.personalization ? { personalization: updates.personalization } : {}),
        ...(updates.utmParameters ? { utmParameters: updates.utmParameters } : {}),
        ...(updates.compliance ? { compliance: updates.compliance } : {}),
        ...(updates.timezone !== undefined ? { timezone: updates.timezone } : {}),
        ...(updates.targetAudience ? { targetAudience: updates.targetAudience } : {}),
        ...(updates.scheduledAt ? { scheduledAt: new Date(updates.scheduledAt) } : {}),
        ...(updates.sentAt ? { sentAt: new Date(updates.sentAt) } : {}),
        ...(updates.completedAt ? { completedAt: new Date(updates.completedAt) } : {}),
        ...(updates.metrics ? { metrics: updates.metrics } : {}),
        updatedAt: new Date(),
      },
    })

    const updated = await prisma.campaign.findMany({ where: { id: { in: ids }, organizationId: payload.organizationId } })
    return NextResponse.json({ success: true, data: updated, message: `${updated.length} campaigns updated successfully` } satisfies ApiResponse)
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to bulk update campaigns' } satisfies ApiResponse, { status: 500 })
  }
}
