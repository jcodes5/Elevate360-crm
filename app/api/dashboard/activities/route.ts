import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { ContactActivity, DealActivity, ClientHistory } from '@prisma/client'

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  try {
    return formatDistanceToNow(date, { addSuffix: true, locale: enUS })
  } catch (error) {
    return 'Unknown time'
  }
}

// Helper function to get icon for activity type
function getIconForActivityType(type: string): string {
  const iconMap: Record<string, string> = {
    'CONTACT_CREATED': 'Users',
    'CONTACT_UPDATED': 'Users',
    'DEAL_CREATED': 'DollarSign',
    'DEAL_UPDATED': 'DollarSign',
    'CAMPAIGN_SENT': 'Mail',
    'APPOINTMENT_SCHEDULED': 'Calendar',
    'TASK_COMPLETED': 'CheckCircle',
    'NOTE_ADDED': 'MessageSquare',
    'TAG_ADDED': 'Tag',
    'CALL_MADE': 'Phone',
    'MEETING_SCHEDULED': 'Calendar',
    'EMAIL_SENT': 'Mail',
    'DEAL_CLOSED_WON': 'DollarSign',
    'DEAL_CLOSED_LOST': 'DollarSign',
    'default': 'Activity'
  }
  
  return iconMap[type] || iconMap['default']
}

// Helper function to get color for activity type
function getColorForActivityType(type: string): string {
  const colorMap: Record<string, string> = {
    'CONTACT_CREATED': 'text-blue-500',
    'CONTACT_UPDATED': 'text-blue-500',
    'DEAL_CREATED': 'text-green-500',
    'DEAL_UPDATED': 'text-green-500',
    'CAMPAIGN_SENT': 'text-purple-500',
    'APPOINTMENT_SCHEDULED': 'text-orange-500',
    'TASK_COMPLETED': 'text-green-500',
    'NOTE_ADDED': 'text-gray-500',
    'TAG_ADDED': 'text-yellow-500',
    'CALL_MADE': 'text-blue-500',
    'MEETING_SCHEDULED': 'text-orange-500',
    'EMAIL_SENT': 'text-purple-500',
    'DEAL_CLOSED_WON': 'text-green-500',
    'DEAL_CLOSED_LOST': 'text-red-500',
    'default': 'text-gray-500'
  }
  
  return colorMap[type] || colorMap['default']
}

export async function GET(request: NextRequest) {
  try {
    // Fetch recent activities from multiple sources
    const [contactActivities, dealActivities, clientHistory] = await Promise.all([
      // Get recent contact activities
      prisma.contactActivity.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          contact: {
            select: {
              firstName: true,
              lastName: true,
              company: true
            }
          }
        }
      }),
      
      // Get recent deal activities
      prisma.dealActivity.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          deal: {
            select: {
              title: true,
              value: true,
              currency: true
            }
          }
        }
      }),
      
      // Get recent client history
      prisma.clientHistory.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          contact: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      })
    ])
    
    // Transform contact activities
    const contactItems = contactActivities.map(activity => ({
      id: activity.id,
      source: 'contact' as const,
      type: activity.type,
      title: `${activity.contact?.firstName || ''} ${activity.contact?.lastName || ''}`.trim() || 'Contact',
      description: activity.description,
      createdAt: activity.createdAt,
      contact: activity.contact
    }))
    
    // Transform deal activities
    const dealItems = dealActivities.map(activity => ({
      id: activity.id,
      source: 'deal' as const,
      type: activity.type,
      title: activity.deal?.title || 'Deal',
      description: `₦${(activity.deal?.value || 0).toLocaleString()} deal`,
      createdAt: activity.createdAt,
      deal: activity.deal
    }))
    
    // Transform client history
    const historyItems = clientHistory.map(activity => ({
      id: activity.id,
      source: 'history' as const,
      type: activity.type,
      title: `${activity.contact?.firstName || ''} ${activity.contact?.lastName || ''}`.trim() || 'Client',
      description: activity.description,
      createdAt: activity.createdAt,
      contact: activity.contact
    }))
    
    // Combine and sort all activities by creation date
    const allActivities = [...contactItems, ...dealItems, ...historyItems]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
    
    // Transform to the format expected by the frontend
    const activities = allActivities.map(activity => {
      let title = ''
      let description = ''
      let type = ''
      
      if (activity.source === 'contact') {
        title = activity.title
        description = activity.description
        type = activity.type
      } else if (activity.source === 'deal') {
        title = activity.title
        description = activity.description
        type = activity.type
      } else if (activity.source === 'history') {
        title = activity.title
        description = activity.description
        type = activity.type
      }
      
      return {
        id: activity.id,
        type: activity.source,
        title,
        description,
        time: getTimeAgo(activity.createdAt),
        icon: getIconForActivityType(type),
        color: getColorForActivityType(type),
      }
    })
    
    // If no activities found, return empty array
    if (activities.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No recent activities found"
      })
    }
    
    return NextResponse.json({
      success: true,
      data: activities
    })
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch recent activities' },
      { status: 500 }
    )
  }
}