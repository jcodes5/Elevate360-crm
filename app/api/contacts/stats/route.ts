import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ApiResponse } from '@/lib/models'
import { ContactStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Build where clause for filtering (same as main route)
    const where: any = {}
    
    const query = searchParams.get('query')
    const status = searchParams.get('status') as ContactStatus
    const assignedTo = searchParams.get('assignedTo')
    const source = searchParams.get('source')
    const company = searchParams.get('company')
    const createdAfter = searchParams.get('createdAfter') ? new Date(searchParams.get('createdAfter')!) : undefined
    const createdBefore = searchParams.get('createdBefore') ? new Date(searchParams.get('createdBefore')!) : undefined
    
    if (query) {
      where.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
        { company: { contains: query, mode: 'insensitive' } },
      ]
    }
    
    if (status) where.status = status
    if (assignedTo) where.assignedTo = assignedTo
    if (source) where.source = { contains: source, mode: 'insensitive' }
    if (company) where.company = { contains: company, mode: 'insensitive' }
    
    if (createdAfter || createdBefore) {
      where.createdAt = {}
      if (createdAfter) where.createdAt.gte = createdAfter
      if (createdBefore) where.createdAt.lte = createdBefore
    }

    // Get current date ranges for comparisons
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000))
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisYear = new Date(now.getFullYear(), 0, 1)

    // Execute all stats queries in parallel
    const [
      totalContacts,
      contactsByStatus,
      contactsBySource,
      newContactsToday,
      newContactsThisWeek,
      newContactsThisMonth,
      newContactsThisYear,
      averageLeadScore,
      contactsWithDeals,
      contactsWithTasks,
      recentActivity
    ] = await Promise.all([
      // Total contacts
      prisma.contact.count({ where }),
      
      // Contacts by status
      prisma.contact.groupBy({
        by: ['status'],
        where,
        _count: { status: true }
      }),
      
      // Contacts by source
      prisma.contact.groupBy({
        by: ['source'],
        where,
        _count: { source: true },
        orderBy: { _count: { source: 'desc' } },
        take: 10
      }),
      
      // New contacts today
      prisma.contact.count({
        where: {
          ...where,
          createdAt: { gte: today }
        }
      }),
      
      // New contacts this week
      prisma.contact.count({
        where: {
          ...where,
          createdAt: { gte: thisWeek }
        }
      }),
      
      // New contacts this month
      prisma.contact.count({
        where: {
          ...where,
          createdAt: { gte: thisMonth }
        }
      }),
      
      // New contacts this year
      prisma.contact.count({
        where: {
          ...where,
          createdAt: { gte: thisYear }
        }
      }),
      
      // Average lead score
      prisma.contact.aggregate({
        where,
        _avg: { leadScore: true }
      }),
      
      // Contacts with active deals
      prisma.contact.count({
        where: {
          ...where,
          deals: {
            some: {
              actualCloseDate: null
            }
          }
        }
      }),
      
      // Contacts with pending tasks
      prisma.contact.count({
        where: {
          ...where,
          tasks: {
            some: {
              status: { not: 'COMPLETED' }
            }
          }
        }
      }),
      
      // Recent activity count (last 30 days)
      prisma.contactActivity.count({
        where: {
          createdAt: {
            gte: new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
          },
          contact: where
        }
      })
    ])

    // Process contacts by status into a more usable format
    const statusCounts = contactsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<ContactStatus, number>)

    // Process contacts by source
    const sourceCounts = contactsBySource.reduce((acc, item) => {
      acc[item.source] = item._count.source
      return acc
    }, {} as Record<string, number>)

    // Calculate conversion rates (simplified)
    const leadCount = statusCounts.LEAD || 0
    const prospectCount = statusCounts.PROSPECT || 0
    const customerCount = statusCounts.CUSTOMER || 0
    
    const leadToProspectRate = leadCount > 0 ? Math.round((prospectCount / (leadCount + prospectCount)) * 100) : 0
    const prospectToCustomerRate = prospectCount > 0 ? Math.round((customerCount / prospectCount) * 100) : 0
    const overallConversionRate = totalContacts > 0 ? Math.round((customerCount / totalContacts) * 100) : 0

    const stats = {
      total: totalContacts,
      newToday: newContactsToday,
      newThisWeek: newContactsThisWeek,
      newThisMonth: newContactsThisMonth,
      newThisYear: newContactsThisYear,
      
      byStatus: {
        lead: statusCounts.LEAD || 0,
        prospect: statusCounts.PROSPECT || 0,
        customer: statusCounts.CUSTOMER || 0,
        inactive: statusCounts.INACTIVE || 0,
        lost: statusCounts.LOST || 0,
        ...statusCounts
      },
      
      bySource: sourceCounts,
      
      averageLeadScore: Math.round(averageLeadScore._avg.leadScore || 0),
      
      engagement: {
        withActiveDeals: contactsWithDeals,
        withPendingTasks: contactsWithTasks,
        recentActivity: recentActivity
      },
      
      conversion: {
        leadToProspect: leadToProspectRate,
        prospectToCustomer: prospectToCustomerRate,
        overall: overallConversionRate
      },
      
      growth: {
        dailyGrowthRate: newContactsToday,
        weeklyGrowthRate: newContactsThisWeek,
        monthlyGrowthRate: newContactsThisMonth
      }
    }

    const response: ApiResponse<any> = {
      success: true,
      data: stats,
      meta: {
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
        version: '1.0.0',
        filters: {
          query,
          status,
          assignedTo,
          source,
          company,
          dateRange: {
            from: createdAfter,
            to: createdBefore
          }
        }
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching contact stats:', error)
    
    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to fetch contact statistics',
      errors: [{
        code: 'STATS_ERROR',
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
