import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ApiResponse } from '@/lib/models'
import { ProductionAuthService, canAccessResource } from '@/lib/auth-production'
import { Prisma } from '@prisma/client'

async function authWrite(request: NextRequest) {
  const token = ProductionAuthService.getTokenFromRequest(request)
  if (!token) return { error: NextResponse.json({ success: false, message: 'Authentication required' } satisfies ApiResponse, { status: 401 }) }
  try {
    const payload = await ProductionAuthService.verifyAccessToken(token)
    const allowed = canAccessResource(payload.role, 'campaigns', 'create')
    if (!allowed) return { error: NextResponse.json({ success: false, message: 'Forbidden' } satisfies ApiResponse, { status: 403 }) }
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
    const clone = await prisma.campaign.create({
      data: {
        name: body.newName || `${source.name} (Copy)` ,
        type: source.type,
        status: 'DRAFT',
        subject: body.includeContent ? source.subject : null,
        content: body.includeContent ? source.content : '',
        channel: source.channel,
        category: source.category,
        objective: source.objective,
        tags: source.tags ?? Prisma.JsonNull,
        isABTest: source.isABTest,
        abTestConfig: source.abTestConfig ?? Prisma.JsonNull,
        personalization: source.personalization ?? Prisma.JsonNull,
        utmParameters: source.utmParameters ?? Prisma.JsonNull,
        compliance: source.compliance ?? Prisma.JsonNull,
        timezone: source.timezone,
        targetAudience: body.includeAudience ? (source.targetAudience ?? Prisma.JsonNull) : Prisma.JsonNull,
        scheduledAt: body.includeSchedule ? source.scheduledAt : null,
        sentAt: null,
        completedAt: null,
        metrics: source.metrics ?? Prisma.JsonNull,
        workflowId: null,
        parentCampaignId: source.id,
        organizationId: payload.organizationId,
        createdBy: payload.userId,
      }
    })
    return NextResponse.json({ success: true, data: clone, message: 'Campaign cloned' } satisfies ApiResponse)
  } catch { return NextResponse.json({ success: false, message: 'Failed to clone campaign' } satisfies ApiResponse, { status: 500 }) }
}