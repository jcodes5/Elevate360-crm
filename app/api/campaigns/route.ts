import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ApiResponse, PaginatedResult } from '@/lib/models'
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

// GET /api/campaigns - list with pagination/sorting/filters
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, 'read')
  if ('error' in auth) return auth.error
  const { payload } = auth

  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get('page') || '1')
    const limit = Math.min(Number.parseInt(searchParams.get('limit') || '20'), 100)
    const sortBy = (searchParams.get('sortBy') || 'createdAt') as keyof any
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    const query = searchParams.get('query') || undefined
    const type = searchParams.get('type') || undefined
    const status = searchParams.get('status') || undefined
    const channel = searchParams.get('channel') || undefined
    const createdBy = searchParams.get('createdBy') || undefined
    const tags = (searchParams.get('tags') || '').split(',').filter(Boolean)
    const startDateFrom = searchParams.get('startDateFrom')
    const startDateTo = searchParams.get('startDateTo')
    const endDateFrom = searchParams.get('endDateFrom')
    const endDateTo = searchParams.get('endDateTo')

    const where: any = {
      organizationId: payload.organizationId,
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { subject: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ]
    }
    if (type) where.type = type.toUpperCase()
    if (status) where.status = status.toUpperCase()
    if (channel) where.channel = channel
    if (createdBy) where.createdBy = createdBy
    // Tag filtering can be implemented with raw SQL JSON_CONTAINS if needed for MySQL

    if (startDateFrom || startDateTo) {
      where.scheduledAt = {}
      if (startDateFrom) where.scheduledAt.gte = new Date(startDateFrom)
      if (startDateTo) where.scheduledAt.lte = new Date(startDateTo)
    }
    if (endDateFrom || endDateTo) {
      where.completedAt = {}
      if (endDateFrom) where.completedAt.gte = new Date(endDateFrom)
      if (endDateTo) where.completedAt.lte = new Date(endDateTo)
    }

    const [items, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ])

    const response: ApiResponse<PaginatedResult<any>> = {
      success: true,
      data: {
        data: items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
      meta: {
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
        version: '1.0.0',
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch campaigns' } satisfies ApiResponse, { status: 500 })
  }
}

// POST /api/campaigns - create
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, 'create')
  if ('error' in auth) return auth.error
  const { payload } = auth

  try {
    const body = await request.json()
    if (!body.name || !body.type) {
      return NextResponse.json({ success: false, message: 'name and type are required' } satisfies ApiResponse, { status: 400 })
    }

    const now = new Date()
    const created = await prisma.campaign.create({
      data: {
        name: body.name,
        type: body.type.toUpperCase(),
        status: (body.status?.toUpperCase() || 'DRAFT'),
        subject: body.subject || null,
        content: body.content || '',
        channel: body.channel || null,
        category: body.category || null,
        objective: body.objective || null,
        tags: Array.isArray(body.tags) ? body.tags : [],
        isABTest: !!body.isABTest,
        abTestConfig: body.abTestConfig || null,
        personalization: body.personalization || null,
        utmParameters: body.utmParameters || null,
        compliance: body.compliance || null,
        timezone: body.timezone || null,
        targetAudience: body.targetAudience || {},
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        sentAt: null,
        completedAt: null,
        metrics: body.metrics || {
          sent: 0, delivered: 0, bounced: 0, opened: 0, clicked: 0, replied: 0, forwarded: 0, unsubscribed: 0, spamReports: 0, conversions: 0, revenue: 0,
          deliveryRate: 0, openRate: 0, clickRate: 0, clickToOpenRate: 0, conversionRate: 0, unsubscribeRate: 0, spamRate: 0, bounceRate: 0,
          totalEngagementTime: 0, averageEngagementTime: 0, returnVisits: 0, socialShares: 0, totalRevenue: 0, averageOrderValue: 0,
          returnOnInvestment: 0, costPerAcquisition: 0, lifetimeValue: 0
        },
        workflowId: body.workflowId || null,
        parentCampaignId: body.parentCampaignId || null,
        organizationId: payload.organizationId,
        createdBy: payload.userId,
        createdAt: now,
        updatedAt: now,
      },
    })

    const response: ApiResponse<any> = {
      success: true,
      data: created,
      message: 'Campaign created successfully',
      meta: { timestamp: new Date(), requestId: crypto.randomUUID(), version: '1.0.0' },
    }
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({ success: false, message: 'Failed to create campaign' } satisfies ApiResponse, { status: 500 })
  }
}
