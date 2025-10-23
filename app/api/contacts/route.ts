import { NextRequest, NextResponse } from 'next/server'
import { ContactModel, ContactSearchParams, ContactStats, PaginatedResult, ApiResponse } from '@/lib/models'
import { prisma } from '@/lib/db'
import { ContactStatus as PrismaContactStatus } from '@prisma/client'

// GET /api/contacts - Search and list contacts
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, 'read')
  if ('error' in auth) return auth.error
  const { payload } = auth

  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)

    const params: ContactSearchParams = {
      query: searchParams.get('query') || undefined,
      status: searchParams.get('status') ? [searchParams.get('status') as any] : undefined,
      lifecycle: searchParams.get('lifecycle') as any || undefined,
      assignedTo: searchParams.get('assignedTo') ? [searchParams.get('assignedTo')!] : undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      source: searchParams.get('source') ? [searchParams.get('source')!] : undefined,
      company: searchParams.get('company') || undefined,
      leadScoreMin: searchParams.get('leadScoreMin') ? parseInt(searchParams.get('leadScoreMin')!) : undefined,
      leadScoreMax: searchParams.get('leadScoreMax') ? parseInt(searchParams.get('leadScoreMax')!) : undefined,
      createdAfter: searchParams.get('createdAfter') ? new Date(searchParams.get('createdAfter')!) : undefined,
      createdBefore: searchParams.get('createdBefore') ? new Date(searchParams.get('createdBefore')!) : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc',
    }

    // Build where clause for filtering
    const where: any = {
      organizationId: payload.organizationId,
    }

    if (params.query) {
      where.OR = [
        { firstName: { contains: params.query, mode: 'insensitive' } },
        { lastName: { contains: params.query, mode: 'insensitive' } },
        { email: { contains: params.query, mode: 'insensitive' } },
        { phone: { contains: params.query, mode: 'insensitive' } },
        { company: { contains: params.query, mode: 'insensitive' } },
      ]
    }

    if (params.status) where.status = params.status[0]
    if (params.assignedTo) where.assignedTo = params.assignedTo[0]
    if (params.source) where.source = { contains: params.source[0], mode: 'insensitive' }
    if (params.company) where.company = { contains: params.company, mode: 'insensitive' }

    if (params.leadScoreMin !== undefined || params.leadScoreMax !== undefined) {
      where.leadScore = {}
      if (params.leadScoreMin !== undefined) where.leadScore.gte = params.leadScoreMin
      if (params.leadScoreMax !== undefined) where.leadScore.lte = params.leadScoreMax
    }

    if (params.createdAfter || params.createdBefore) {
      where.createdAt = {}
      if (params.createdAfter) where.createdAt.gte = params.createdAfter
      if (params.createdBefore) where.createdAt.lte = params.createdBefore
    }

    if (params.tags && params.tags.length > 0) {
      where.tags = {
        array_contains: params.tags
      }
    }

    // Calculate pagination
    const page = Math.max(1, params.page || 1)
    const limit = Math.min(100, Math.max(1, params.limit || 50))
    const skip = (page - 1) * limit

    // Execute queries in parallel
    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: {
          assignedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          organization: {
            select: {
              id: true,
              name: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          [params.sortBy || 'createdAt']: params.sortOrder || 'desc'
        }
      }),
      prisma.contact.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)
    const executionTime = Date.now() - startTime

    const response: ApiResponse<PaginatedResult<any>> = {
      success: true,
      data: {
        data: contacts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        meta: {
          query: params.query,
          filters: params,
          executionTime,
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
    console.error('Error fetching contacts:', error)

    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to fetch contacts',
      errors: [{
        code: 'FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }],
      meta: {
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
        version: '1.0.0',
      },
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// POST /api/contacts - Create new contact
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, 'create')
  if ('error' in auth) return auth.error
  const { payload } = auth

  const startTime = Date.now()
  let transactionClient: any = null

  try {
    const body = await request.json()

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email) {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Missing required fields',
        errors: [
          { code: 'VALIDATION_ERROR', message: 'firstName, lastName, and email are required' }
        ],
        meta: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
          version: '1.0.0',
        },
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Invalid email format',
        errors: [
          { code: 'VALIDATION_ERROR', message: 'Please provide a valid email address' }
        ],
        meta: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
          version: '1.0.0',
        },
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Use organization from authenticated user
    const organizationId = payload.organizationId

    // Check for duplicate email within organization
    const existingContact = await prisma.contact.findFirst({
      where: {
        email: body.email,
        organizationId: payload.organizationId
      }
    })

    if (existingContact) {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Contact with this email already exists',
        errors: [
          { code: 'DUPLICATE_ERROR', message: 'A contact with this email address already exists' }
        ],
        meta: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
          version: '1.0.0',
        },
      }
      return NextResponse.json(errorResponse, { status: 409 })
    }

    // Create contact data
    const contactData = {
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.toLowerCase().trim(),
      phone: body.phone?.trim() || '',
      whatsappNumber: body.whatsappNumber?.trim(),
      company: body.company?.trim(),
      position: body.position?.trim(),
      tags: body.tags || [],
      leadScore: body.leadScore || 0,
      status: body.status || PrismaContactStatus.LEAD,
      source: body.source || 'manual',
      customFields: body.customFields || {},
      organizationId,
      assignedTo: body.assignedTo || null,
    }

    // Use transaction to ensure data consistency and reduce connection usage
    const [newContact] = await prisma.$transaction(async (tx) => {
      // Create the contact
      const createdContact = await tx.contact.create({
        data: contactData,
        include: {
          assignedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          organization: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      // Create activity record
      await tx.contactActivity.create({
        data: {
          contactId: createdContact.id,
          userId: payload.userId,
          createdBy: payload.userId,
          type: 'TAG_ADDED',
          description: `Contact created with status: ${createdContact.status}`,
          metadata: {
            source: createdContact.source,
            initialTags: createdContact.tags
          }
        }
      })
      
      return [createdContact]
    })

    const response: ApiResponse<any> = {
      success: true,
      data: newContact,
      message: 'Contact created successfully',
      meta: {
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
        version: '1.0.0',
        executionTime: Date.now() - startTime
      },
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating contact:', error)

    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to create contact',
      errors: [{
        code: 'CREATE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }],
      meta: {
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
        version: '1.0.0',
        executionTime: Date.now() - startTime
      },
    }

    return NextResponse.json(errorResponse, { status: 500 })
  } finally {
    // Ensure the Prisma client connection is properly managed
    if (transactionClient) {
      await transactionClient.$disconnect()
    }
  }
}

// PUT /api/contacts/bulk - Bulk update contacts
export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request, 'update')
  if ('error' in auth) return auth.error
  const { payload } = auth

  try {
    const { ids, updates } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Invalid or missing contact IDs',
        errors: [{ code: 'VALIDATION_ERROR', message: 'ids array is required' }],
        meta: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
          version: '1.0.0',
        },
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    if (!updates || typeof updates !== 'object') {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Invalid or missing updates object',
        errors: [{ code: 'VALIDATION_ERROR', message: 'updates object is required' }],
        meta: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
          version: '1.0.0',
        },
      }
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Verify contacts exist and count them
    const existingContacts = await prisma.contact.findMany({
      where: {
        id: { in: ids }
      },
      select: { id: true }
    })

    if (existingContacts.length !== ids.length) {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Some contacts not found',
        errors: [{ code: 'NOT_FOUND_ERROR', message: `${ids.length - existingContacts.length} contacts not found` }],
        meta: {
          timestamp: new Date(),
          requestId: crypto.randomUUID(),
          version: '1.0.0',
        },
      }
      return NextResponse.json(errorResponse, { status: 404 })
    }

    // Prepare update data
    const updateData: any = { ...updates }
    delete updateData.id
    delete updateData.createdAt
    updateData.updatedAt = new Date()

    // Perform bulk update
    await prisma.contact.updateMany({
      where: {
        id: { in: ids }
      },
      data: updateData
    })

    // Fetch updated contacts with relations
    const updatedContacts = await prisma.contact.findMany({
      where: {
        id: { in: ids }
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Create activity records for bulk update
    const activityData = ids.map(contactId => ({
      contactId,
      userId: payload.userId,
      type: 'TAG_ADDED' as const,
      description: 'Bulk update performed',
      metadata: { updates: updateData },
      createdBy: payload.userId
    }))

    await prisma.contactActivity.createMany({
      data: activityData
    })

    const response: ApiResponse<any[]> = {
      success: true,
      data: updatedContacts,
      message: `${ids.length} contacts updated successfully`,
      meta: {
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
        version: '1.0.0',
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error bulk updating contacts:', error)

    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to bulk update contacts',
      errors: [{
        code: 'BULK_UPDATE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      }],
      meta: {
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
        version: '1.0.0',
      },
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// DELETE /api/contacts/bulk - Bulk delete contacts
async function requireAuth(request: NextRequest, permission: string): Promise<{ payload: any } | { error: NextResponse }> {
  // Try to get token from Authorization header or "token" cookie
  const authHeader = request.headers.get('authorization') ?? ''
  const headerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined
  // NextRequest.cookies.get exists in Edge runtime; fallback to undefined if not present
  const cookieToken = (request.cookies && typeof (request.cookies as any).get === 'function') ? (request.cookies as any).get('token')?.value : undefined
  const token = headerToken || cookieToken

  if (!token) {
    const resp: ApiResponse = {
      success: false,
      message: 'Authentication required',
      errors: [{ code: 'AUTH_REQUIRED', message: 'Missing authentication token' }],
      meta: { timestamp: new Date(), requestId: crypto.randomUUID(), version: '1.0.0' },
    }
    return { error: NextResponse.json(resp, { status: 401 }) }
  }

  try {
    // Decode JWT payload without verifying signature (reasonable for examples / dev);
    // for production replace with a proper verification using a secret or public key.
    let payload: any | null = null
    const parts = token.split('.')
    if (parts.length === 3) {
      // base64url -> base64
      let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      while (b64.length % 4) b64 += '='
      const json = Buffer.from(b64, 'base64').toString('utf8')
      payload = JSON.parse(json)
    } else {
      // token may be a base64-encoded JSON string
      try {
        const json = Buffer.from(token, 'base64').toString('utf8')
        payload = JSON.parse(json)
      } catch {
        payload = null
      }
    }

    if (!payload || !payload.userId || !payload.organizationId) {
      const resp: ApiResponse = {
        success: false,
        message: 'Invalid authentication token',
        errors: [{ code: 'AUTH_INVALID', message: 'Token missing required claims' }],
        meta: { timestamp: new Date(), requestId: crypto.randomUUID(), version: '1.0.0' },
      }
      return { error: NextResponse.json(resp, { status: 401 }) }
    }

    // Optional permission check: payload.permissions can be an array of strings
    if (permission) {
      const perms = Array.isArray(payload.permissions) ? payload.permissions : []
      if (perms.length > 0 && !perms.includes(permission)) {
        const resp: ApiResponse = {
          success: false,
          message: 'Insufficient permissions',
          errors: [{ code: 'AUTH_FORBIDDEN', message: `Missing permission: ${permission}` }],
          meta: { timestamp: new Date(), requestId: crypto.randomUUID(), version: '1.0.0' },
        }
        return { error: NextResponse.json(resp, { status: 403 }) }
      }
    }

    return { payload }
  } catch (err) {
    const resp: ApiResponse = {
      success: false,
      message: 'Failed to validate authentication token',
      errors: [{ code: 'AUTH_ERROR', message: err instanceof Error ? err.message : 'Unknown error' }],
      meta: { timestamp: new Date(), requestId: crypto.randomUUID(), version: '1.0.0' },
    }
    return { error: NextResponse.json(resp, { status: 401 }) }
  }
}