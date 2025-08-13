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
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastWeek = new Date(thisWeek.getTime() - (7 * 24 * 60 * 60 * 1000))

    // Execute all dashboard queries in parallel
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
      recentActivity,
      topSources,
      leadScoreDistribution,
      newContactsLastWeek,
      newContactsLastMonth,
      contactsByAssignedUser
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
      }),
      
      // Top sources with counts
      prisma.contact.groupBy({
        by: ['source'],
        where,
        _count: { source: true },
        orderBy: { _count: { source: 'desc' } },
        take: 5
      }),
      
      // Lead score distribution
      prisma.contact.aggregate({
        where,
        _avg: { leadScore: true },
        _min: { leadScore: true },
        _max: { leadScore: true }
      }),
      
      // New contacts last week
      prisma.contact.count({
        where: {
          ...where,
          createdAt: { 
            gte: lastWeek,
            lt: thisWeek
          }
        }
      }),
      
      // New contacts last month
      prisma.contact.count({
        where: {
          ...where,
          createdAt: { 
            gte: lastMonth,
            lt: thisMonth
          }
        }
      }),
      
      // Contacts by assigned user
      prisma.contact.groupBy({
        by: ['assignedTo'],
        where: {
          ...where,
          assignedTo: { not: null }
        },
        _count: { assignedTo: true },
        orderBy: { _count: { assignedTo: 'desc' } },
        take: 5
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

    // Process top sources
    const topSourcesData = topSources.map(item => ({
      source: item.source,
      count: item._count.source
    }))

    // Process contacts by assigned user
    const assignedUserData = contactsByAssignedUser.map(item => ({
      userId: item.assignedTo,
      count: item._count.assignedTo
    }))

    // Calculate conversion rates (simplified)
    const leadCount = statusCounts.LEAD || 0
    const prospectCount = statusCounts.PROSPECT || 0
    const customerCount = statusCounts.CUSTOMER || 0
    
    const leadToProspectRate = leadCount > 0 ? Math.round((prospectCount / (leadCount + prospectCount)) * 100) : 0
    const prospectToCustomerRate = prospectCount > 0 ? Math.round((customerCount / prospectCount) * 100) : 0
    const overallConversionRate = totalContacts > 0 ? Math.round((customerCount / totalContacts) * 100) : 0

    // Calculate growth rates
    const weeklyGrowth = newContactsThisWeek - newContactsLastWeek
    const monthlyGrowth = newContactsThisMonth - newContactsLastMonth
    const weeklyGrowthRate = newContactsLastWeek > 0 ? Math.round((weeklyGrowth / newContactsLastWeek) * 100) : 0
    const monthlyGrowthRate = newContactsLastMonth > 0 ? Math.round((monthlyGrowth / newContactsLastMonth) * 100) : 0

    const dashboardData = {
      // Overview metrics
      total: totalContacts,
      newToday: newContactsToday,
      newThisWeek: newContactsThisWeek,
      newThisMonth: newContactsThisMonth,
      newThisYear: newContactsThisYear,
      
      // Status breakdown
      byStatus: {
        lead: statusCounts.LEAD || 0,
        prospect: statusCounts.PROSPECT || 0,
        customer: statusCounts.CUSTOMER || 0,
        inactive: statusCounts.INACTIVE || 0,
        lost: statusCounts.LOST || 0,
        ...statusCounts
      },
      
      // Source breakdown
      bySource: sourceCounts,
      topSources: topSourcesData,
      
      // Lead scoring
      averageLeadScore: Math.round(averageLeadScore._avg.leadScore || 0),
      leadScoreDistribution: {
        min: leadScoreDistribution._min.leadScore || 0,
        max: leadScoreDistribution._max.leadScore || 0,
        average: Math.round(leadScoreDistribution._avg.leadScore || 0)
      },
      
      // Engagement metrics (simplified)
      engagement: {
        withActiveDeals: contactsWithDeals,
        withPendingTasks: contactsWithTasks,
        recentActivity: recentActivity
      },
      
      // Conversion metrics
      conversion: {
        leadToProspect: leadToProspectRate,
        prospectToCustomer: prospectToCustomerRate,
        overall: overallConversionRate
      },
      
      // Growth metrics
      growth: {
        weekly: {
          current: newContactsThisWeek,
          previous: newContactsLastWeek,
          growth: weeklyGrowth,
          growthRate: weeklyGrowthRate
        },
        monthly: {
          current: newContactsThisMonth,
          previous: newContactsLastMonth,
          growth: monthlyGrowth,
          growthRate: monthlyGrowthRate
        }
      },
      
      // Assignment metrics
      byAssignedUser: assignedUserData,
      
      // Calculated percentages
      percentages: {
        customers: totalContacts > 0 ? Math.round((customerCount / totalContacts) * 100) : 0,
        prospects: totalContacts > 0 ? Math.round((prospectCount / totalContacts) * 100) : 0,
        leads: totalContacts > 0 ? Math.round((leadCount / totalContacts) * 100) : 0
      }
    }

    const response: ApiResponse<any> = {
      success: true,
      data: dashboardData,
      meta: {
        timestamp: new Date(),
        requestId: crypto.randomUUID(),
        version: '1.0.0'
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching contact dashboard data:', error)
    
    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to fetch contact dashboard data',
      errors: [{
        code: 'DASHBOARD_ERROR',
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