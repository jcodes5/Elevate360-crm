import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Fetch all required statistics in parallel
    const [
      totalContacts,
      totalDeals,
      closedDeals,
      campaignsSent,
      previousPeriodContacts,
      previousPeriodRevenue,
      previousPeriodDeals,
      previousPeriodCampaigns
    ] = await Promise.all([
      // Total contacts
      prisma.contact.count(),
      
      // Total deals
      prisma.deal.count(),
      
      // Closed deals for revenue calculation
      prisma.deal.findMany({
        where: {
          actualCloseDate: {
            not: null
          }
        },
        select: {
          value: true,
          currency: true
        }
      }),
      
      // Campaigns sent
      prisma.campaign.count({
        where: {
          status: 'SENT'
        }
      }),
      
      // Previous period contacts (30 days ago)
      prisma.contact.count({
        where: {
          createdAt: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Previous period revenue
      prisma.deal.findMany({
        where: {
          actualCloseDate: {
            not: null,
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          value: true
        }
      }),
      
      // Previous period deals
      prisma.deal.count({
        where: {
          createdAt: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Previous period campaigns
      prisma.campaign.count({
        where: {
          sentAt: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          },
          status: 'SENT'
        }
      })
    ])
    
    // Calculate total revenue from closed deals (assuming all in NGN for simplicity)
    const totalRevenue = closedDeals.reduce((sum, deal) => sum + Number(deal.value), 0)
    
    // Calculate previous period revenue
    const previousRevenue = previousPeriodRevenue.reduce((sum, deal) => sum + Number(deal.value), 0)
    
    // Calculate growth rates
    const contactsGrowth = previousPeriodContacts > 0 
      ? ((totalContacts - previousPeriodContacts) / previousPeriodContacts) * 100 
      : 0
      
    const revenueGrowth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0
      
    const dealsGrowth = previousPeriodDeals > 0 
      ? ((totalDeals - previousPeriodDeals) / previousPeriodDeals) * 100 
      : 0
      
    const campaignsGrowth = previousPeriodCampaigns > 0 
      ? ((campaignsSent - previousPeriodCampaigns) / previousPeriodCampaigns) * 100 
      : 0

    const stats = {
      totalContacts,
      totalRevenue,
      activeDeals: totalDeals,
      campaignsSent,
      contactsGrowth: parseFloat(contactsGrowth.toFixed(1)),
      revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
      dealsGrowth: parseFloat(dealsGrowth.toFixed(1)),
      campaignsGrowth: parseFloat(campaignsGrowth.toFixed(1)),
    }

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}