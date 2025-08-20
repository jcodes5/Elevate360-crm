"use client"

import { Badge } from "@/components/ui/badge"
import { CampaignStatus } from "@/lib/models"

interface CampaignStatusBadgeProps {
  status: CampaignStatus
}

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800"
      case "sending":
        return "bg-blue-100 text-blue-800" 
      case "scheduled":
        return "bg-yellow-100 text-yellow-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "paused":
        return "bg-orange-100 text-orange-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-purple-100 text-purple-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: CampaignStatus) => {
    switch (status) {
      case "sent":
        return "Sent"
      case "sending":
        return "Sending"
      case "scheduled":
        return "Scheduled"
      case "draft":
        return "Draft"
      case "paused":
        return "Paused"
      case "cancelled":
        return "Cancelled"
      case "completed":
        return "Completed"
      case "failed":
        return "Failed"
      default:
        return status
    }
  }

  return (
    <Badge className={getStatusColor(status)}>
      {getStatusText(status)}
    </Badge>
  )
}